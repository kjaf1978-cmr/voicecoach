"use strict";
/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const el = (tag, attrs={}, html="") => { const e=document.createElement(tag); for(const k in attrs) e.setAttribute(k,attrs[k]); if(html) e.innerHTML=html; return e; };
const fmt = s => { s=Math.max(0,Math.round(s)); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); };
const rnd = a => a[Math.floor(Math.random()*a.length)];
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DAY=864e5, LOCALE={en:"en-GB",de:"de-DE",fr:"fr-FR"}, CTXS=["pro","cas","aca"], LANGS=["en","de","fr"];
const PASS={1:70,2:75,3:80,review:80}, INTERVALS=[0,1,3,7,14,30,60];

/* ---------- storage ---------- */
const KEY="voicecoach.v2"; let canStore=true;
let store={set:{ui:"en",tl:"en",ctx:"pro",rate:0.95,mode:"auto"},sessions:[],mpt:[],sz:[],fill:[],conv:{},hist:[],art:{},profile:null,tests:[],plan:{},lessons:{},flags:{},artDay:{}};
try{ const raw=localStorage.getItem(KEY); if(raw){ const s=JSON.parse(raw); store=Object.assign(store,s); store.set=Object.assign({ui:"en",tl:"en",ctx:"pro",rate:0.95,mode:"auto"},s.set||{}); } else { const nl=(navigator.language||"en").slice(0,2); if(LANGS.includes(nl)){ store.set.ui=nl; store.set.tl=nl; } } }catch(e){ canStore=false; }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(store)); }catch(e){ canStore=false; } }
const SET=store.set;
const today=()=>new Date().toISOString().slice(0,10);
function t(k,v){ let s=(T[SET.ui]&&T[SET.ui][k])??T.en[k]??k; if(v) for(const x in v) s=s.split("{"+x+"}").join(v[x]); return s; }
function toast(msg){ const e=$("#toast"); e.textContent=msg; e.classList.add("on"); clearTimeout(toast.h); toast.h=setTimeout(()=>e.classList.remove("on"),2400); }
function logSession(name,min){ store.sessions.push({d:today(),t:Date.now(),name,min:Math.max(0.1,Math.round(min*10)/10)}); save(); refreshStats(); toast(t("toast_logged",{n:name})); }

/* ---------- audio ---------- */
let actx=null;
function ac(){ if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } } if(actx.state==="suspended"&&!(typeof SESS!=="undefined"&&SESS.paused)) actx.resume(); return actx; }
function beep(f=880,d=.12,v=.15){ try{ const c=ac(); if(!c) return; const o=c.createOscillator(),g=c.createGain(); o.frequency.value=f; g.gain.setValueAtTime(v,c.currentTime); g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+d+.02);}catch(e){} }
function tone(f,d=2){ try{ const c=ac(); if(!c) return; const o=c.createOscillator(),g=c.createGain(); o.type="triangle"; o.frequency.value=f; g.gain.setValueAtTime(0,c.currentTime); g.gain.linearRampToValueAtTime(.25,c.currentTime+.05); g.gain.setValueAtTime(.25,c.currentTime+d-.2); g.gain.linearRampToValueAtTime(0,c.currentTime+d); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+d+.05);}catch(e){} }
let wakeLock=null;
async function keepAwake(on){ try{ if(on&&"wakeLock" in navigator&&!wakeLock){ wakeLock=await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release",()=>wakeLock=null);} if(!on&&wakeLock){ wakeLock.release(); wakeLock=null; } }catch(e){} }

/* ---------- text-to-speech (partner voice) ---------- */
function speak(text, lang, onend, rate, role, pitchMul){
  let done=false; const fin=()=>{ if(!done){ done=true; onend&&onend(); } };
  try{
    if(!("speechSynthesis" in window)) return fin();
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.lang=LOCALE[lang]; u.rate=rate||+SET.rate||1;
    if(role==="model"&&typeof modelVoice==="function"){ const m=modelVoice(lang); if(m.voice) try{ u.voice=m.voice; }catch(e){} u.pitch=Math.max(0.1,Math.min(2,m.pitch*(pitchMul||1))); u.rate=u.rate*m.rate; }
    else { const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.replace("_","-").toLowerCase().startsWith(lang));
      let pref=vs.find(v=>v.lang.replace("_","-")===LOCALE[lang])||vs[0];
      if(typeof PARTNER_VOICE!=="undefined"&&PARTNER_VOICE){ const loc=vs.filter(v=>v.lang.replace("_","-")===LOCALE[lang]), pool=loc.length>1?loc:vs; if(pool.length) pref=pool[PARTNER_VOICE.idx%pool.length]; u.pitch=PARTNER_VOICE.pitch; }
      if(pref) try{ u.voice=pref; }catch(e){} }
    u.onend=fin; u.onerror=fin; speechSynthesis.speak(u);
    setTimeout(fin, 1500+text.length*90/(rate||+SET.rate||1));
  }catch(e){ fin(); }
}
try{ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged=()=>{}; }catch(e){}

/* ---------- speech recognition ---------- */
const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
let srBroken = !SR;
function recognizeOnce(lang, onInterim){
  return new Promise((resolve,reject)=>{
    let r; try{ r=new SR(); }catch(e){ srBroken=true; return reject("unsupported"); }
    r.lang=LOCALE[lang]; r.interimResults=true; r.continuous=false; r.maxAlternatives=1;
    let finalTxt="", interim="", tFirst=null, tLast=null, err=null, confs=[];
    r.onresult=e=>{ const now=performance.now(); if(tFirst===null) tFirst=now; tLast=now; interim=""; finalTxt="";
      confs=[]; for(let i=0;i<e.results.length;i++){ const tr=e.results[i][0].transcript; if(e.results[i].isFinal){ finalTxt+=tr+" "; confs.push(e.results[i][0].confidence||0); } else interim+=tr+" "; }
      onInterim&&onInterim((finalTxt+interim).trim()); };
    r.onerror=e=>{ err=e.error; if(["not-allowed","service-not-allowed","audio-capture"].includes(e.error)) srBroken=true; };
    r.onend=()=>{ const text=(finalTxt||interim).trim(); if(err&&err!=="no-speech"&&!text) reject(err); else resolve({text,tFirst,tLast,confs}); };
    try{ r.start(); }catch(e){ srBroken=true; reject("start-failed"); }
    recognizeOnce.current=r;
  });
}
function stopRecognition(){ try{ recognizeOnce.current&&recognizeOnce.current.stop(); }catch(e){} }

/* ---------- text matching & scoring ---------- */
const norm = s => String(s).toLowerCase().replace(/ß/g,"ss").replace(/œ/g,"oe").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
function parseKW(str){ return str.split(";").map(g=>g.split("|").map(a=>a.replace(/^\s+/,"")).filter(a=>a.trim())).filter(g=>g.length); }
function kwHit(textN, alt){ const whole=/\s$/.test(alt), k=norm(alt); if(!k) return false; const hay=" "+textN+" ";
  if(whole) return hay.includes(" "+k+" "); if(k.length>=5) return hay.includes(k); return hay.includes(" "+k); }
function scoreTurn({text,dur,latency,level,model,kw,lang}){
  const tn=norm(text), words=tn?tn.split(" "):[], groups=parseKW(kw);
  const hits=groups.map(g=>g.some(a=>kwHit(tn,a)));
  let content=groups.length?hits.filter(Boolean).length/groups.length:1;
  const mw=norm(model).split(" ");
  if(level===1){ const ms=new Set(mw), ws=new Set(words); let o=0; ms.forEach(w=>{ if(ws.has(w)) o++; }); content=0.5*content+0.5*(o/ms.size); }
  const complete=Math.min(1, words.length/(0.6*mw.length));
  const wpm = dur>1.5 ? words.length/(dur/60) : null;
  const pace = wpm===null?0.7 : wpm<110?Math.max(0,(wpm-60)/50) : wpm>170?Math.max(0,(230-wpm)/60) : 1;
  const fset=new Set(FILLERS[lang].map(norm)), fillers=words.filter(w=>fset.has(w)).length;
  const fluency=Math.max(0, 1-0.25*fillers-(latency!=null&&latency>4?0.3:0));
  const score=Math.round(100*(0.5*content+0.2*complete+0.15*pace+0.15*fluency));
  return {score,content,complete,pace,fluency,wpm,fillers,hits,groups,auto:true};
}

/* ================= navigation ================= */
const ICONS={choir:'<path d="M9 18V5l11-2v13" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="17.5" cy="16" r="2.5" stroke="currentColor" stroke-width="2" fill="none"/>',today:'<path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
 talk:'<path d="M3 5h12v8H8l-4 3v-3H3zM17 9h4v8h-1v3l-3-3h-5v-2" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>',
 speech:'<path d="M5 12c2-6 12-6 14 0-2 6-12 6-14 0z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 voice:'<path d="M3 12h2l2-6 3 12 3-9 2 6 2-3h4" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>',
 breath:'<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
 progress:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'};
const VIEWS=["today","talk","speech","voice","breath","choir","progress"];
function buildNav(){ $("#nav").innerHTML=""; VIEWS.forEach(id=>{ const b=el("button",{"data-v":id},`<svg viewBox="0 0 24 24">${ICONS[id]}</svg>${t("nav_"+id)}`); b.onclick=()=>show(id); $("#nav").append(b); }); markNav(); }
let curView="today";
function markNav(){ document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===curView)); }
function show(id){ curView=id; document.querySelectorAll("section.view").forEach(s=>s.classList.toggle("on",s.id==="v-"+id)); markNav(); try{ if(location.hash!=="#"+id) history.replaceState(null,"","#"+id); }catch(e){} window.scrollTo(0,0); if(id==="progress") renderProgress(); if(id==="today") renderToday(); if(id==="talk") renderScenes(); if(id==="choir"&&typeof renderChoir==="function") renderChoir(); }
window.addEventListener("hashchange",()=>{ const h=location.hash.slice(1); if(VIEWS.includes(h)) show(h); });

/* ================= settings & i18n ================= */
function chipSet(box, items, cur, onPick){ box.innerHTML=""; items.forEach(([v,l])=>{ const c=el("button",{class:"chip"+(String(v)===String(cur)?" on":"")},l); c.onclick=()=>onPick(v); box.append(c); }); }
function applyI18n(){
  document.documentElement.lang=SET.ui;
  document.querySelectorAll("[data-t]").forEach(e=>{ e.innerHTML=t(e.dataset.t); });
  buildNav(); renderSettings(); renderGlossary(); renderRoutines(); renderBreathPresets(); renderTalkChips(); renderSpeech(); renderPassages(); renderTwisters();
  $("#fillTap").textContent=`${t("filler_btn")} (${FL.n})`; $("#ballLbl").textContent=t("br_ready"); showSZ(); showMptTries();
  if(!$("#topicBox").dataset.set) $("#topicBox").textContent=t("imp_tap");
  $("#micBtn").textContent=MIC.stream?t("mic_off"):t("mic_on");
  refreshStats(); renderToday(); renderScenes(); renderV3(); renderProgress();
}
function renderSettings(){
  $("#setSummary").textContent=SET.tl.toUpperCase()+" · "+t("ctx_"+SET.ctx);
  chipSet($("#setUi"),LANGS.map(l=>[l,LANG_NAMES[l]]),SET.ui,v=>{ SET.ui=v; save(); applyI18n(); });
  chipSet($("#setTl"),LANGS.map(l=>[l,LANG_NAMES[l]]),SET.tl,v=>setTl(v));
  chipSet($("#setCtx"),CTXS.map(c=>[c,t("ctx_"+c)]),SET.ctx,v=>setCtx(v));
  chipSet($("#setMode"),[["auto",t("mode_auto")],["rec",t("mode_rec")],["text",t("mode_text")]],SET.mode,v=>{ SET.mode=v; if(v==="auto") store.flags.conc=undefined; save(); renderSettings(); });
  if(typeof renderProfileForm==="function") renderProfileForm($("#setProf"),()=>{ renderTone(); renderRoutines(); renderSettings(); });
  if(typeof renderVoicePick==="function") renderVoicePick();
  renderMicPick();
  $("#setRate").value=SET.rate; $("#rateVal").textContent="×"+(+SET.rate).toFixed(2);
}
function setTl(v){ SET.tl=v; save(); SP.snd=Object.keys(ART[v])[0]; SP.idx=0; renderSettings(); renderTalkChips(); renderSpeech(); renderPassages(); renderTwisters(); nextPair(); renderScenes(); renderToday(); $("#topicBox").textContent=t("imp_tap"); delete $("#topicBox").dataset.set; renderV3(); }
function setCtx(v){ SET.ctx=v; save(); renderSettings(); renderTalkChips(); renderScenes(); renderToday(); renderPassages(); $("#topicBox").textContent=t("imp_tap"); delete $("#topicBox").dataset.set; renderV3(); }
$("#setBtn").onclick=()=>$("#settings").classList.remove("hidden");
$("#setClose").onclick=()=>$("#settings").classList.add("hidden");
$("#settings").onclick=e=>{ if(e.target.id==="settings") $("#settings").classList.add("hidden"); };
$("#setRate").oninput=e=>{ SET.rate=+e.target.value; $("#rateVal").textContent="×"+SET.rate.toFixed(2); save(); };
function renderTalkChips(){
  chipSet($("#talkCtx"),CTXS.map(c=>[c,t("ctx_"+c)]),SET.ctx,v=>setCtx(v));
  chipSet($("#talkTl"),LANGS.map(l=>[l,l.toUpperCase()]),SET.tl,v=>setTl(v));
  chipSet($("#speechTl"),LANGS.map(l=>[l,l.toUpperCase()]),SET.tl,v=>setTl(v));
}
function renderGlossary(){ const g=$("#glossary"); g.innerHTML=""; GLOSS[SET.ui].forEach(([a,b])=>g.append(el("dt",{},esc(a)),el("dd",{},esc(b)))); }

/* ================= conversation state ================= */
function cKey(id,lang){ return id+"."+lang; }
function getConv(id,lang){ return store.conv[cKey(id,lang)]||{lvl:1,mastered:false,box:0,due:0,best:{},n:0}; }
function setConv(id,lang,s){ store.conv[cKey(id,lang)]=s; save(); }
function dueList(all){ const now=Date.now(), out=[]; SCENES.forEach(sc=>(all?LANGS:[SET.tl]).forEach(l=>{ const s=getConv(sc.id,l); if(s.mastered&&s.due<=now) out.push({sc,l,s}); })); return out; }
function stepsPassed(s){ return s.mastered?3:Math.max(0,s.lvl-1); }

function renderScenes(){
  const box=$("#sceneList"); if(!box) return; box.innerHTML="";
  const roles=ROLES.filter(r=>SCENES.some(s=>s.ctx===SET.ctx&&s.role===r));
  if(roles.length){ const rc=el("div",{class:"card"},`<b>${t("role_title")}</b><p class="muted" style="font-size:.82rem;margin:2px 0 6px">${t("role_desc")}</p><div class="chips" data-r></div>`);
    chipSet(rc.querySelector("[data-r]"),[["",t("role_all")]].concat(roles.map(r=>[r,t("role_"+r)])),SET.role||"",v=>{ SET.role=v; save(); renderScenes(); if(typeof renderToday==="function") renderToday(); }); box.append(rc); }
  if(typeof renderLive==="function"&&!(LIVE.S&&LIVE.S.on)) renderLive();
  SCENES.filter(sceneShown).forEach(sc=>{
    const s=getConv(sc.id,SET.tl), due=s.mastered&&s.due<=Date.now();
    const status = s.mastered ? (due?`<span class="tag due">${t("due_now")}</span>`:`<span class="tag ok">${t("mastered")} ✓</span>`) : `<span class="tag">${t("lvl")} ${s.lvl}</span>`;
    const bestTxt=[1,2,3].map(l=>s.best[l]!=null?`${t("lvl")} ${l}: ${s.best[l]}`:null).filter(Boolean).join(" · ");
    const c=el("div",{class:"card"},`<div class="row"><b class="grow">${esc(sc.title[SET.ui])}</b>${status}</div>${sc.role?`<div style="margin:2px 0 4px"><span class="tag">${t("kind_"+sc.kind)}</span> <span class="tag">${t("role_"+sc.role)}</span></div>`:""}
      <div class="bar"><i style="width:${stepsPassed(s)/3*100}%"></i></div>
      <p class="muted">${bestTxt?t("best")+" – "+bestTxt:"&nbsp;"}${s.mastered&&!due?` · ${t("next_rev")}: ${new Date(s.due).toLocaleDateString()}`:""}</p>
      <div class="row lv"></div>`);
    const lv=c.querySelector(".lv");
    [1,2,3].forEach(l=>{ const unlocked = s.mastered || l<=s.lvl; const b=el("button",{class:"b sm grow"+(l===s.lvl&&!s.mastered?"":" alt")},`${l} · ${t("lvl"+l)}${unlocked?"":" 🔒"}`); b.disabled=!unlocked; b.onclick=()=>startAttempt(sc,SET.tl,l,"level"); lv.append(b); });
    if(s.mastered){ const b=el("button",{class:"b sm "+(due?"warm":"alt")},"↻ "+t("review")); b.onclick=()=>startAttempt(sc,SET.tl,3,"review"); lv.append(b); }
    box.append(c);
  });
}

/*CONV*/
/* ================= today ================= */
function renderToday(){
  const dl=dueList(), box=$("#dueList"); box.innerHTML="";
  if(!dl.length) box.innerHTML=`<p class="muted">${t("due_none")}</p>`;
  dl.forEach(({sc,l})=>{ const b=el("button",{class:"b warm full"},`↻ ${esc(sc.title[SET.ui])} <span style="opacity:.8">(${l.toUpperCase()} · ${t("ctx_"+sc.ctx)})</span>`); b.onclick=()=>startAttempt(sc,l,3,"review"); box.append(b); });
  const nb=$("#nextBox"); nb.innerHTML="";
  const nx=SCENES.filter(sceneShown).map(sc=>({sc,s:getConv(sc.id,SET.tl)})).find(x=>!x.s.mastered);
  if(nx){ const b=el("button",{class:"b full"},`▶ ${esc(nx.sc.title[SET.ui])} – ${t("lvl")} ${nx.s.lvl} · ${t("lvl"+nx.s.lvl)} <span style="opacity:.8">(${SET.tl.toUpperCase()} · ${t("ctx_"+SET.ctx)})</span>`); b.onclick=()=>startAttempt(nx.sc,SET.tl,nx.s.lvl,"level"); nb.append(b); }
  else nb.innerHTML=`<p class="muted">${t("next_none")}</p>`;
  $("#stDue").textContent=dl.length;
}

/* ================= routines ================= */
function renderRoutines(){ const L=$("#routineList"); L.innerHTML=""; ROUTINES.forEach((r,i)=>{ if(r.g&&r.g!==SET.gender) return; const tot=r.steps.reduce((a,s)=>a+s[0],0); const b=el("button",{class:"b alt full"},`${esc(r.name[SET.ui])} <span class="muted">(${fmt(tot)} min · ${r.steps.length})</span>`); b.onclick=()=>openRoutine(i); L.append(b); }); }
let RP={r:null,i:0,left:0,running:false,h:null,startT:0};
function openRoutine(i){ stopRoutine(); RP.r=ROUTINES[i]; RP.i=0; RP.startT=Date.now(); $("#routinePlayer").classList.remove("hidden"); $("#rpTitle").textContent=RP.r.name[SET.ui]; loadStep(); $("#routinePlayer").scrollIntoView({behavior:"smooth"}); }
function loadStep(){ const s=RP.r.steps[RP.i], tx=s[1][SET.ui]; RP.left=s[0]; $("#rpStepTitle").textContent=(RP.i+1)+". "+tx[0]; $("#rpStepText").textContent=tx[1]; $("#rpStepWhy").textContent=t("why")+" "+tx[2]; $("#rpTime").textContent=fmt(RP.left); $("#rpSteps").innerHTML=RP.r.steps.map((_,k)=>`<i class="${k<=RP.i?'d':''}"></i>`).join(""); }
function tickRoutine(){ RP.left--; $("#rpTime").textContent=fmt(RP.left); if(RP.left<=3&&RP.left>0) beep(660,.08,.1); if(RP.left<=0){ beep(990,.25); if(RP.i<RP.r.steps.length-1){ RP.i++; loadStep(); } else finishRoutine(); } }
function startRoutine(){ ac(); RP.running=true; $("#rpPlay").textContent=t("pause"); RP.h=setInterval(tickRoutine,1000); keepAwake(true); }
function stopRoutine(){ RP.running=false; clearInterval(RP.h); $("#rpPlay").textContent=t("startb"); keepAwake(false); }
function finishRoutine(){ stopRoutine(); $("#rpStepTitle").textContent=t("done_title"); $("#rpStepText").textContent=t("done_text"); $("#rpStepWhy").textContent=""; logSession(RP.r.name[SET.ui],(Date.now()-RP.startT)/60000); markPlan("warm"); }
$("#rpPlay").onclick=()=>RP.running?stopRoutine():startRoutine();
$("#rpNext").onclick=()=>{ if(RP.i<RP.r.steps.length-1){RP.i++;loadStep();} else finishRoutine(); };
$("#rpPrev").onclick=()=>{ if(RP.i>0){RP.i--;loadStep();} };
$("#rpClose").onclick=()=>{ stopRoutine(); $("#routinePlayer").classList.add("hidden"); };

/* ================= breathing & tests ================= */
let BR={p:0,run:false,raf:null};
function renderBreathPresets(){ chipSet($("#breathPresets"),BREATH.map((b,i)=>[i,b.name[SET.ui]]),BR.p,v=>{ if(BR.run) stopBreath(); BR.p=+v; renderBreathPresets(); }); $("#breathDesc").textContent=BREATH[BR.p].desc[SET.ui]; }
function stopBreath(){ BR.run=false; cancelAnimationFrame(BR.raf); $("#brStart").textContent=t("startb"); $("#ballLbl").textContent=t("br_ready"); $("#ball").style.transform="scale(.35)"; keepAwake(false); }
$("#brStart").onclick=()=>{
  if(BR.run){ stopBreath(); return; }
  ac(); keepAwake(true);
  const P=BREATH[BR.p].ph, cyc=P.reduce((a,p)=>a+p[1],0), rounds=+$("#brRounds").value, t0=performance.now(), PH=BREATH_PH[SET.ui];
  BR.run=true; $("#brStart").textContent=t("stopb"); let lastPh=-1,lastSec=-1;
  const step=now=>{ if(!BR.run) return;
    const tt0=(now-t0)/1000, r=Math.floor(tt0/cyc);
    if(r>=rounds){ stopBreath(); beep(990,.3); logSession(BREATH[BR.p].name[SET.ui],rounds*cyc/60); return; }
    $("#brRound").textContent=r+1; let tt=tt0-r*cyc,k=0; while(tt>P[k][1]){ tt-=P[k][1]; k++; }
    const prev=P[(k-1+P.length)%P.length][2], f=tt/P[k][1], s=prev+(P[k][2]-prev)*(0.5-0.5*Math.cos(Math.PI*f));
    $("#ball").style.transform=`scale(${s.toFixed(3)})`;
    const sec=Math.ceil(P[k][1]-tt); if(k!==lastPh){ lastPh=k; beep(k===0?660:520,.1,.1); }
    if(sec!==lastSec){ lastSec=sec; $("#ballLbl").innerHTML=PH[P[k][0]]+"<br>"+sec; }
    BR.raf=requestAnimationFrame(step); };
  BR.raf=requestAnimationFrame(step);
};
function stopwatch(disp,onStop){ let t0=0,h=null; return {running:()=>!!h, start(){ t0=performance.now(); h=setInterval(()=>disp.textContent=((performance.now()-t0)/1000).toFixed(1)+" s",50); }, stop(){ clearInterval(h); h=null; const v=(performance.now()-t0)/1000; disp.textContent=v.toFixed(1)+" s"; onStop(v); }}; }
let mptTries=[];
function showMptTries(){ $("#mptTries").textContent=t("tries")+": "+(mptTries.length?mptTries.map(x=>x+" s").join(", ")+" · "+t("best_lbl")+" "+Math.max(...mptTries)+" s":"–"); }
const mptSW=stopwatch($("#mptTime"),v=>{ mptTries.push(Math.round(v*10)/10); showMptTries(); });
$("#mptBtn").onclick=()=>{ if(mptSW.running()){ mptSW.stop(); $("#mptBtn").textContent=t("startb"); } else { mptSW.start(); $("#mptBtn").textContent=t("stopb"); } };
$("#mptSave").onclick=()=>{ if(!mptTries.length) return toast(t("toast_try")); saveMPT(Math.max(...mptTries),"stopwatch"); mptTries=[]; showMptTries(); };
function saveMPT(v,how){ store.mpt.push({d:today(),t:Date.now(),v:Math.round(v*10)/10,how}); save(); logSession("MPT",1); }
let sz={s:[],z:[]}, szCur=null;
const szSW=stopwatch($("#szTime"),v=>{ sz[szCur].push(Math.round(v*10)/10); showSZ(); });
function showSZ(){ const s=sz.s.length?Math.max(...sz.s):null, z=sz.z.length?Math.max(...sz.z):null; $("#szResult").innerHTML=`/s/: ${s??"–"} s (${sz.s.length}) &nbsp; /z/: ${z??"–"} s (${sz.z.length}) &nbsp; <b>${t("ratio")}: ${s&&z?(s/z).toFixed(2):"–"}</b>`;
  if(!szSW.running()){ $("#sBtn").textContent=t("startb")+" /s/"; $("#zBtn").textContent=t("startb")+" /z/"; } }
function szToggle(w){ const btn=w==="s"?$("#sBtn"):$("#zBtn"); if(szSW.running()){ if(szCur!==w) return; szSW.stop(); btn.textContent=t("startb")+" /"+w+"/"; } else { szCur=w; szSW.start(); btn.textContent=t("stopb")+" /"+w+"/"; } }
$("#sBtn").onclick=()=>szToggle("s"); $("#zBtn").onclick=()=>szToggle("z");
$("#szReset").onclick=()=>{ sz={s:[],z:[]}; showSZ(); };
$("#szSave").onclick=()=>{ if(!sz.s.length||!sz.z.length) return toast(t("toast_sz")); const s=Math.max(...sz.s), z=Math.max(...sz.z); store.sz.push({d:today(),t:Date.now(),s,z,r:Math.round(s/z*100)/100}); save(); logSession("s/z",1); sz={s:[],z:[]}; showSZ(); };

/* ================= microphone tools ================= */
const NOTES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const midiToHz=m=>440*Math.pow(2,(m-69)/12), hzToMidi=f=>69+12*Math.log2(f/440), noteName=m=>NOTES[((m%12)+12)%12]+(Math.floor(m/12)-1);
for(let m=40;m<=79;m++){ const o=el("option",{value:m},`${noteName(m)} – ${midiToHz(m).toFixed(0)} Hz`); if(m===57) o.selected=true; $("#targetNote").append(o); }
$("#playTarget").onclick=()=>tone(midiToHz(+$("#targetNote").value),2);
let MIC={stream:null,an:null,buf:null,raf:null,pH:[],lH:[],sT0:null,sBest:0,hT0:null,hBest:0,lastLoud:0};
function micError(e){ const b=$("#micErr"); b.classList.remove("hidden"); b.innerHTML=(e&&e.name==="NotAllowedError"&&window.self===window.top)?t("mic_denied"):t("mic_blocked"); }
$("#micBtn").onclick=async()=>{
  if(MIC.stream){ stopMic(); return; }
  try{ if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) throw new Error("nomedia");
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const c=ac(), src=c.createMediaStreamSource(stream), an=c.createAnalyser(); an.fftSize=2048; src.connect(an);
    MIC.stream=stream; MIC.an=an; MIC.buf=new Float32Array(an.fftSize); $("#micBtn").textContent=t("mic_off"); $("#micErr").classList.add("hidden"); keepAwake(true); loopMic();
  }catch(e){ micError(e); }
};
function stopMic(){ cancelAnimationFrame(MIC.raf); MIC.stream.getTracks().forEach(x=>x.stop()); MIC.stream=null; $("#micBtn").textContent=t("mic_on"); keepAwake(false); }
function detectPitch(buf,sr){
  const n0=buf.length; let rms=0; for(let i=0;i<n0;i++) rms+=buf[i]*buf[i]; rms=Math.sqrt(rms/n0); if(rms<0.008) return {f:0,rms};
  // decimate to ~24 kHz (2-tap average) – 4× less work, same accuracy for voice up to 1100 Hz
  const d=sr>=32000?2:1, n=Math.floor(n0/d), x=d>1?new Float32Array(n):buf; if(d>1) for(let i=0;i<n;i++) x[i]=(buf[2*i]+buf[2*i+1])/2; const r=sr/d;
  const minLag=Math.floor(r/1100), maxLag=Math.floor(r/65), size=n-maxLag, corr=new Float32Array(maxLag+2); let best=-1,bestLag=0;
  for(let lag=minLag;lag<=maxLag+1;lag++){ let s=0,e1=0,e2=0; for(let i=0;i<size;i++){ const a=x[i],b=x[i+lag]; s+=a*b; e1+=a*a; e2+=b*b; } corr[lag]=s/Math.sqrt(e1*e2+1e-12); }
  for(let lag=minLag+1;lag<=maxLag;lag++){ if(corr[lag]>corr[lag-1]&&corr[lag]>=corr[lag+1]&&corr[lag]>best){ best=corr[lag]; bestLag=lag; if(best>0.93) break; } }
  if(best<0.75) return {f:0,rms};
  const y1=corr[bestLag-1],y2=corr[bestLag],y3=corr[bestLag+1], den=2*(2*y2-y1-y3), dd=den?(y3-y1)/den:0;
  return {f:r/(bestLag+(isFinite(dd)?dd:0)),rms};
}
function cssv(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function drawPitch(){ const pc=$("#pitchCanvas"), dpr=window.devicePixelRatio||1, W=pc.clientWidth*dpr, H=170*dpr; if(pc.width!==W){pc.width=W;pc.height=H;}
  const g=pc.getContext("2d"); g.clearRect(0,0,W,H); const lo=hzToMidi(70),hi=hzToMidi(700),yOf=m=>H-(m-lo)/(hi-lo)*H;
  g.font=(10*dpr)+"px system-ui"; g.fillStyle=cssv("--muted"); g.strokeStyle=cssv("--line"); g.lineWidth=1;
  [100,150,200,300,400,600].forEach(f=>{ const y=yOf(hzToMidi(f)); g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); g.fillText(f+" Hz",4,y-3); });
  const vt=typeof voiceTarget==="function"&&voiceTarget(); if(vt){ g.fillStyle="rgba(47,138,77,.12)"; const y1=yOf(hzToMidi(vt.hi)), y2=yOf(hzToMidi(vt.lo)); g.fillRect(0,y1,W,y2-y1); }
  const tg=+$("#targetNote").value; g.strokeStyle=cssv("--ok"); g.setLineDash([6*dpr,4*dpr]); g.beginPath(); g.moveTo(0,yOf(tg)); g.lineTo(W,yOf(tg)); g.stroke(); g.setLineDash([]);
  const now=performance.now(); g.fillStyle=cssv("--accent2"); MIC.pH.forEach(p=>{ g.beginPath(); g.arc(W-(now-p.t)/8000*W,yOf(hzToMidi(p.f)),2.2*dpr,0,7); g.fill(); }); }
function loopMic(){
  MIC.an.getFloatTimeDomainData(MIC.buf); const {f,rms}=detectPitch(MIC.buf,actx.sampleRate), now=performance.now(), db=20*Math.log10(Math.max(rms,1e-5));
  $("#levelBar").style.width=Math.min(100,Math.max(0,(db+80)/80*100))+"%"; $("#levelDb").textContent=db.toFixed(0)+" dBFS";
  MIC.lH.push({t:now,db}); MIC.lH=MIC.lH.filter(x=>now-x.t<1000); const thr=+$("#thr").value;
  if(db>thr){ const xs=MIC.lH.map(x=>x.db), m=xs.reduce((a,b)=>a+b,0)/xs.length, sd=Math.sqrt(xs.reduce((a,b)=>a+(b-m)*(b-m),0)/xs.length); $("#steady").textContent=sd.toFixed(1)+" dB – "+(sd<2?t("steady_v"):sd<4?t("steady_f"):t("steady_w")); if(MIC.sT0===null) MIC.sT0=now; MIC.lastLoud=now; } else $("#steady").textContent="–";
  if(MIC.sT0!==null){ const dur=(MIC.lastLoud-MIC.sT0)/1000; $("#sustainTime").textContent=dur.toFixed(1)+" s"; if(now-MIC.lastLoud>250){ if(dur>MIC.sBest){ MIC.sBest=dur; $("#sustainBest").textContent=dur.toFixed(1)+" s"; } MIC.sT0=null; } }
  if(f>0&&db>thr){ MIC.pH.push({t:now,f}); const m=hzToMidi(f); $("#pitchHz").textContent=f.toFixed(0)+" Hz"; $("#pitchNote").textContent=noteName(Math.round(m));
    const cents=(m-(+$("#targetNote").value))*100, sh=Math.max(-150,Math.min(150,cents)); $("#centsMark").style.left=(50+sh/150*50)+"%"; $("#centsTxt").textContent=(cents>0?"+":"")+cents.toFixed(0)+" cents";
    if(Math.abs(cents)<=30){ if(MIC.hT0===null) MIC.hT0=now; const h=(now-MIC.hT0)/1000; $("#holdTime").textContent=h.toFixed(1)+" s"; if(h>MIC.hBest){ MIC.hBest=h; $("#holdBest").textContent=h.toFixed(1)+" s"; } } else MIC.hT0=null;
  } else MIC.hT0=null;
  MIC.pH=MIC.pH.filter(p=>now-p.t<8000);
  if(MIC.pH.length>10){ const fs=MIC.pH.map(p=>p.f).sort((a,b)=>a-b); $("#pitchStats").textContent=t("pitch_stats",{m:fs[fs.length>>1].toFixed(0),a:fs[Math.floor(fs.length*.05)].toFixed(0),b:fs[Math.floor(fs.length*.95)].toFixed(0)}); }
  drawPitch(); MIC.raf=requestAnimationFrame(loopMic);
}
$("#thr").oninput=e=>{ $("#thrVal").textContent=e.target.value; $("#levelThr").style.left=((+e.target.value+80)/80*100)+"%"; };
$("#thr").oninput({target:$("#thr")});
$("#sustainSave").onclick=()=>{ if(MIC.sBest<1) return toast(t("toast_hold")); saveMPT(MIC.sBest,"mic"); };
const topLevel=window.self===window.top;

/* ================= articulation ================= */
let SP={snd:Object.keys(ART[SET.tl])[0],pos:"i",idx:0,n:0};
function artKey(){ return SET.tl+"|"+SP.snd; }
function artStats(lang,snd){ const a=store.art[lang+"|"+snd]||[]; const l=a.slice(-10); return {n:a.length,p:l.length?Math.round(l.filter(Boolean).length/l.length*100):0,mastered:l.length>=10&&l.filter(Boolean).length>=9}; }
function renderSpeech(){
  if(!ART[SET.tl][SP.snd]) SP.snd=Object.keys(ART[SET.tl])[0];
  chipSet($("#soundChips"),Object.keys(ART[SET.tl]).map(k=>[k,k+(artStats(SET.tl,k).mastered?" ✓":"")]),SP.snd,v=>{ SP.snd=v; SP.idx=0; renderSpeech(); });
  chipSet($("#posChips"),[["i",t("pos_i")],["m",t("pos_m")],["f",t("pos_f")],["s",t("pos_s")]],SP.pos,v=>{ SP.pos=v; SP.idx=0; renderSpeech(); });
  $("#soundTip").innerHTML="<b>"+t("how_sound")+"</b> "+esc(artTip(SET.tl,SP.snd));
  showWord(); showArtMastery(); if(typeof renderSerSetup==="function") renderSerSetup();
}
function curList(){ return ART[SET.tl][SP.snd][SP.pos]; }
function showWord(){ const L=curList(); SP.idx=(SP.idx+L.length)%L.length; const w=L[SP.idx]; $("#drillWord").textContent=w; $("#drillWord").style.fontSize=w.length>18?"1.35rem":"2.1rem"; $("#drillHeard").textContent="";
  $("#drillCount").textContent=t("art_count",{n:artStats(SET.tl,SP.snd).n,i:SP.idx+1,t:L.length}); }
function showArtMastery(){ const s=artStats(SET.tl,SP.snd); $("#artBar").style.width=s.p+"%"; $("#artBar").style.background=s.mastered?"var(--ok)":"var(--accent)"; $("#artMastery").innerHTML=t("art_mastery",{p:s.p})+(s.mastered?` <span class="tag ok">${t("art_badge")}</span>`:""); }
function artMark(ok){ const k=artKey(), a=store.art[k]||[], wasM=artStats(SET.tl,SP.snd).mastered; a.push(ok?1:0); store.art[k]=a.slice(-50); save(); SP.n++;
  beep(ok?990:440,.1,.1); showArtMastery(); const nowM=artStats(SET.tl,SP.snd).mastered; if(nowM&&!wasM){ toast(SP.snd+" – "+t("art_badge")); renderSpeech(); }
  if(SP.n%15===0) logSession(t("art_title")+" "+SP.snd,4);
  store.artDay[today()]=(store.artDay[today()]||0)+1; if(store.artDay[today()]===10) markPlan("drill","art");
  setTimeout(()=>{ SP.idx++; showWord(); }, ok?600:1200); }
$("#drillOk").onclick=()=>artMark(true); $("#drillBad").onclick=()=>artMark(false);
$("#drillNext").onclick=()=>{ SP.idx++; showWord(); }; $("#drillPrev").onclick=()=>{ SP.idx--; showWord(); };
$("#drillCheck").onclick=async()=>{
  if(srBroken){ toast(t("sr_off")); return; }
  const target=curList()[SP.idx], btn=$("#drillCheck"); if(btn.dataset.on){ stopRecognition(); return; }
  btn.dataset.on="1"; btn.textContent=t("stop"); $("#drillHeard").textContent=t("listening");
  try{ const r=await recognizeOnce(SET.tl,txt=>$("#drillHeard").textContent=t("art_heard",{w:txt}));
    const hn=norm(r.text), tn=norm(target); let ok;
    if(SP.pos==="s"){ const tw=tn.split(" "), hs=new Set(hn.split(" ")); ok=tw.filter(w=>hs.has(w)).length/tw.length>=0.8; } else ok=(" "+hn+" ").includes(" "+tn+" ");
    $("#drillHeard").textContent=t("art_heard",{w:r.text||"…"})+" "+(ok?"✓":"✗"); if(r.text) artMark(ok);
  }catch(e){ $("#drillHeard").textContent=t("sr_err",{e}); }
  delete btn.dataset.on; btn.textContent=t("art_check");
};
let curPair=null;
function nextPair(){ curPair=rnd(PAIRS[SET.tl]); $("#pairBox").textContent=curPair[0]+"  /  "+curPair[1]; $("#pairPicked").textContent=""; }
$("#pairNext").onclick=nextPair; $("#pairPick").onclick=()=>{ if(!curPair) nextPair(); $("#pairPicked").innerHTML=t("pairs_say")+" <b>"+esc(rnd(curPair))+"</b>"; };

/* ---------- paced reader ---------- */
function makeReader(box,getText,wpmIn,wpmLbl,btn,onDone,clickBox){
  let words=[],i=0,h=null;
  function load(){ stop(); words=getText().split(/\s+/).filter(Boolean); box.innerHTML=words.map(w=>`<span>${esc(w)}</span>`).join(" "); i=0; }
  function step(){ const sp=box.children; if(i>0){ sp[i-1].classList.remove("now"); sp[i-1].classList.add("done"); }
    if(i>=words.length){ stop(); onDone&&onDone(); return; }
    sp[i].classList.add("now"); if(clickBox&&clickBox.checked) beep(1200,.03,.12);
    const w=words[i], base=60000/(+wpmIn.value), extra=/[.!?]$/.test(w)?base*.8:/[,;:]$/.test(w)?base*.4:0; i++; h=setTimeout(step,base+extra); }
  function stop(){ clearTimeout(h); h=null; btn.textContent=t("startb"); keepAwake(false); }
  btn.onclick=()=>{ if(h){ stop(); return; } ac(); if(i===0||i>=words.length) load(); btn.textContent=t("stopb"); keepAwake(true); step(); };
  wpmIn.oninput=()=>wpmLbl.textContent=wpmIn.value; return {load};
}
const tw=makeReader($("#twReader"),()=>{ const x=TWISTERS[SET.tl][+$("#twSelect").value||0]; return (x+" ").repeat(3).trim(); },$("#twWpm"),$("#twWpmVal"),$("#twStart"),()=>logSession(t("tw_title"),1),$("#twClick"));
function renderTwisters(){ const s=$("#twSelect"), keep=s.value; s.innerHTML=""; TWISTERS[SET.tl].forEach((x,k)=>s.append(el("option",{value:k},x.length>48?esc(x.slice(0,46))+"…":esc(x)))); if(keep&&s.options[keep]) s.value=keep; tw.load(); }
$("#twSelect").onchange=()=>tw.load();
const pace=makeReader($("#paceReader"),()=>{ const c=CTXS[+$("#paceSelect").value||0]; return PASSAGES[SET.tl][c][1]; },$("#paceWpm"),$("#paceWpmVal"),$("#paceStart"),()=>{ logSession(t("read_title"),2); markPlan("drill","pace"); });
function renderPassages(){ const s=$("#paceSelect"); s.innerHTML=""; CTXS.forEach((c,k)=>s.append(el("option",{value:k},`${esc(PASSAGES[SET.tl][c][0])} (${t("ctx_"+c)})`))); s.value=CTXS.indexOf(SET.ctx); pace.load(); }
$("#paceSelect").onchange=()=>pace.load();

/* ---------- impromptu & fillers ---------- */
let TP={dur:60,h:null,left:60};
function drawDur(){ chipSet($("#topicDur"),[[30,"30 s"],[60,"1 min"],[120,"2 min"],[180,"3 min"]],TP.dur,v=>{ TP.dur=+v; TP.left=+v; $("#topicTime").textContent=fmt(+v); drawDur(); }); } drawDur();
function topicHtml(i){ const a=TOPICS[SET.tl][SET.ctx][i], b=TOPICS[SET.ui][SET.ctx][i]; return `<div ${tlAttr(SET.tl)}>${esc(a)}</div>`+(SET.tl!==SET.ui?`<div class="muted" style="font-size:.85rem;font-weight:400">${esc(b)}</div>`:""); }
$("#topicNew").onclick=()=>{ const i=Math.floor(Math.random()*TOPICS[SET.tl][SET.ctx].length); $("#topicBox").innerHTML=`<div>${topicHtml(i)}</div>`; $("#topicBox").dataset.set="1"; $("#topicBox").dataset.i=i; };
$("#topicStart").onclick=()=>{
  if(TP.h){ clearInterval(TP.h); TP.h=null; $("#topicStart").textContent=t("startb"); keepAwake(false); return; }
  if(!$("#topicBox").dataset.set) $("#topicNew").onclick();
  ac(); TP.left=TP.dur; $("#topicTime").textContent=fmt(TP.left); $("#topicStart").textContent=t("stopb"); keepAwake(true); beep(880);
  TP.h=setInterval(()=>{ TP.left--; $("#topicTime").textContent=fmt(TP.left); if(TP.left===10) beep(660,.1); if(TP.left<=0){ clearInterval(TP.h); TP.h=null; beep(990,.4); $("#topicStart").textContent=t("startb"); keepAwake(false); logSession(t("imp_title"),TP.dur/60); } },1000);
};
let FL={n:0,t0:null,h:null};
function flUpdate(){ const s=FL.t0?(performance.now()-FL.t0)/1000:0; $("#fillTime").textContent=fmt(s); $("#fillRate").textContent=s>10?(FL.n/(s/60)).toFixed(1):"–"; $("#fillTap").textContent=`${t("filler_btn")} (${FL.n})`; }
$("#fillTap").onclick=()=>{ if(!FL.t0) $("#fillStart").onclick(); FL.n++; try{ navigator.vibrate&&navigator.vibrate(30); }catch(e){} flUpdate(); };
$("#fillStart").onclick=()=>{ if(FL.h){ clearInterval(FL.h); FL.h=null; $("#fillStart").textContent=t("start_timer"); return; } if(!FL.t0){ FL.t0=performance.now(); FL.n=0; } FL.h=setInterval(flUpdate,500); $("#fillStart").textContent=t("pause"); };
$("#fillSave").onclick=()=>{ if(!FL.t0) return toast(t("toast_timer")); const min=(performance.now()-FL.t0)/60000; store.fill.push({d:today(),t:Date.now(),n:FL.n,min:Math.round(min*10)/10,rate:Math.round(FL.n/min*10)/10}); save(); logSession(t("filler_title"),min); clearInterval(FL.h); FL={n:0,t0:null,h:null}; $("#fillStart").textContent=t("start_timer"); flUpdate(); };

/* ================= stats & progress ================= */
function refreshStats(){
  const wk=Date.now()-7*DAY, w=store.sessions.filter(s=>s.t>wk);
  $("#stSessions").textContent=w.length; $("#stMinutes").textContent=Math.round(w.reduce((a,s)=>a+s.min,0));
  const days=new Set(store.sessions.map(s=>s.d)); let streak=0; const d=new Date(); if(!days.has(today())) d.setDate(d.getDate()-1);
  while(days.has(d.toISOString().slice(0,10))){ streak++; d.setDate(d.getDate()-1); }
  $("#stStreak").textContent=streak; $("#streakBadge").textContent=streak?"🔥 "+streak:""; $("#stDue").textContent=dueList().length;
}
function prepCanvas(c,h){ const dpr=window.devicePixelRatio||1, W=c.clientWidth*dpr, H=h*dpr; c.width=W; c.height=H; const g=c.getContext("2d"); g.font=(10*dpr)+"px system-ui"; return {g,W,H,dpr}; }
function renderProgress(){
  $("#prMastTitle").textContent=t("pr_mastery",{l:langIn(SET.tl)});
  const pm=$("#prMastery"); pm.innerHTML="";
  CTXS.forEach(c=>{ const sc=SCENES.filter(s=>s.ctx===c), st=sc.map(s=>getConv(s.id,SET.tl)), p=st.reduce((a,s)=>a+stepsPassed(s),0)/(3*sc.length);
    pm.append(el("div",{style:"margin:8px 0"},`<div class="row"><b class="grow">${t("ctx_"+c)}</b><span>${Math.round(p*100)} %</span></div><div class="bar"><i style="width:${p*100}%"></i></div>
      <div class="muted">${sc.map((s,i)=>`${esc(s.title[SET.ui])}: ${st[i].mastered?"✓":t("lvl")+" "+st[i].lvl}`).join(" · ")}</div>`)); });
  let tb=`<table style="margin-top:8px"><tr><th></th>${CTXS.map(c=>`<th>${t("ctx_"+c)}</th>`).join("")}</tr>`;
  LANGS.forEach(l=>{ tb+=`<tr><td><b>${l.toUpperCase()}</b></td>${CTXS.map(c=>{ const sc=SCENES.filter(s=>s.ctx===c); const p=sc.reduce((a,s)=>a+stepsPassed(getConv(s.id,l)),0)/(3*sc.length); return `<td>${Math.round(p*100)} %</td>`; }).join("")}</tr>`; });
  $("#prLangTable").innerHTML=tb+"</table>";
  // score chart
  { const {g,W,H,dpr}=prepCanvas($("#scoreChart"),170), hs=store.hist.slice(-30), Y=v=>H-12*dpr-v/100*(H-22*dpr), X=i=>26*dpr+(hs.length<2?.5:i/(hs.length-1))*(W-36*dpr);
    g.strokeStyle=cssv("--line"); g.fillStyle=cssv("--muted"); [0,50,100].forEach(v=>{ g.beginPath(); g.moveTo(22*dpr,Y(v)); g.lineTo(W,Y(v)); g.stroke(); g.fillText(v,2,Y(v)+3*dpr); });
    g.setLineDash([4*dpr,4*dpr]); g.strokeStyle=cssv("--ok"); [70,75,80].forEach(v=>{ g.beginPath(); g.moveTo(22*dpr,Y(v)); g.lineTo(W,Y(v)); g.stroke(); }); g.setLineDash([]);
    if(!hs.length){ g.fillStyle=cssv("--muted"); g.fillText(t("nothing"),30*dpr,24*dpr); }
    g.strokeStyle=cssv("--accent"); g.lineWidth=1.5*dpr; g.beginPath(); hs.forEach((h,i)=>i?g.lineTo(X(i),Y(h.score)):g.moveTo(X(i),Y(h.score))); g.stroke();
    hs.forEach((h,i)=>{ g.fillStyle=h.pass?cssv("--ok"):cssv("--warn"); g.beginPath(); g.arc(X(i),Y(h.score),(h.mode==="review"?4.5:3.2)*dpr,0,7); g.fill(); }); }
  // articulation
  $("#prArtTitle").textContent=t("pr_art",{l:langIn(SET.tl)});
  $("#prArt").innerHTML=Object.keys(ART[SET.tl]).map(k=>{ const s=artStats(SET.tl,k); return `<div class="sc"><span>${k} ${s.mastered?"✓":""}</span><div class="bar"><i style="width:${s.p}%;background:${s.mastered?'var(--ok)':'var(--accent)'}"></i></div><b>${s.n?s.p+"%":"–"}</b></div>`; }).join("");
  // measurements
  { const {g,W,H,dpr}=prepCanvas($("#measChart"),150), ser=[[store.mpt.map(m=>[m.t,m.v]),cssv("--ok")],[store.sz.map(z=>[z.t,z.r*10]),cssv("--accent2")]], all=ser.flatMap(s=>s[0]);
    if(!all.length){ g.fillStyle=cssv("--muted"); g.fillText(t("nothing"),10*dpr,20*dpr); }
    else { const t0=Math.min(...all.map(p=>p[0])), t1=Math.max(...all.map(p=>p[0])), vmax=Math.max(30,...all.map(p=>p[1])), X=x=>22*dpr+(t1===t0?.5:(x-t0)/(t1-t0))*(W-32*dpr), Y=v=>H-12*dpr-v/vmax*(H-22*dpr);
      g.strokeStyle=cssv("--line"); g.fillStyle=cssv("--muted"); [0,10,20,30].filter(v=>v<=vmax).forEach(v=>{ g.beginPath(); g.moveTo(18*dpr,Y(v)); g.lineTo(W,Y(v)); g.stroke(); g.fillText(v,2,Y(v)+3*dpr); });
      ser.forEach(([pts,col])=>{ if(!pts.length) return; g.strokeStyle=col; g.fillStyle=col; g.lineWidth=2*dpr; g.beginPath(); pts.forEach((p,k)=>k?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1]))); g.stroke(); pts.forEach(p=>{ g.beginPath(); g.arc(X(p[0]),Y(p[1]),3*dpr,0,7); g.fill(); }); }); } }
  // history
  const title=id=>{ const s=SCENES.find(x=>x.id===id); return s?s.title[SET.ui]:id; };
  const rows=[...store.hist.map(h=>[h.t,h.d,`${title(h.id)} (${h.lang.toUpperCase()}, ${h.mode==="review"?t("review"):t("lvl")+" "+h.level})`,`${h.score} ${h.pass?"✓":"✗"}`]),
    ...store.sessions.filter(s=>!store.hist.some(h=>Math.abs(h.t-s.t)<1500)).map(s=>[s.t,s.d,esc(s.name),s.min+" min"]),
    ...store.mpt.map(m=>[m.t,m.d,"MPT",m.v+" s"]),...store.sz.map(z=>[z.t,z.d,"s/z",`${z.r} (s ${z.s} / z ${z.z})`]),...store.fill.map(f=>[f.t,f.d,t("filler_title"),`${f.rate}/min`])].sort((a,b)=>b[0]-a[0]).slice(0,80);
  $("#logTable").innerHTML=rows.length?`<table><tr><th>${t("t_date")}</th><th>${t("t_act")}</th><th>${t("t_res")}</th></tr>${rows.map(r=>`<tr><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</table>`:`<p class="muted">${t("nothing")}</p>`;
  $("#storeNote").textContent=canStore?t("store_ok"):t("store_no");
}
$("#logCopy").onclick=async()=>{ const title=id=>{ const s=SCENES.find(x=>x.id===id); return s?s.title.en:id; };
  const txt=["VoiceCoach",...store.hist.map(h=>`${h.d}\t${title(h.id)} ${h.lang} ${h.mode} L${h.level}\t${h.score}${h.pass?" pass":" fail"}`),...store.sessions.map(s=>`${s.d}\t${s.name}\t${s.min} min`),...store.mpt.map(m=>`${m.d}\tMPT\t${m.v} s`),...store.sz.map(z=>`${z.d}\ts/z\t${z.r}`),...store.fill.map(f=>`${f.d}\tfillers\t${f.rate}/min`)].join("\n");
  try{ await navigator.clipboard.writeText(txt); toast(t("toast_copied")); }catch(e){ toast(t("toast_copyfail")); } };
$("#logClear").onclick=()=>$("#confirmClear").classList.remove("hidden");
$("#ccNo").onclick=()=>$("#confirmClear").classList.add("hidden");
$("#ccYes").onclick=()=>{ Object.assign(store,{sessions:[],mpt:[],sz:[],fill:[],conv:{},hist:[],art:{}}); save(); $("#confirmClear").classList.add("hidden"); refreshStats(); renderProgress(); renderScenes(); renderSpeech(); toast(t("toast_cleared")); };


/* microphone choice: with Bluetooth headphones Android switches to "call quality" when their mic is used – choosing the phone's microphone can keep music quality */
async function renderMicPick(){ ["#setMic","#chAudio"].forEach(id=>{ const b=$(id); if(b) renderAudioBox(b); }); }
const HEADSET_RE=/bluetooth|buds|airpods|headset|head ?phone|earphone|ear ?buds|kopfhörer|ohrhörer|écouteur|casque|hands-?free|freisprech|wired|usb|jabra|sony|bose|jbl|beats|sennheiser|galaxy|pixel buds|oneplus|xiaomi|redmi|anker|soundcore|huawei|freebuds/i;
async function audioDevices(){ try{ const all=await navigator.mediaDevices.enumerateDevices(); return {ins:all.filter(d=>d.kind==="audioinput"),outs:all.filter(d=>d.kind==="audiooutput"),labels:all.some(d=>d.label)}; }catch(e){ return {ins:[],outs:[],labels:false}; } }
async function renderAudioBox(box){
  const {ins,outs,labels}=await audioDevices(), clean=l=>l.filter(d=>d.deviceId&&d.deviceId!=="default"&&d.deviceId!=="communications");
  const hs=clean(ins).concat(clean(outs)).find(d=>HEADSET_RE.test(d.label||""));
  const canOut=typeof AudioContext!=="undefined"&&"setSinkId" in AudioContext.prototype&&clean(outs).length>0;
  box.innerHTML=`<h3>🎧 ${t("au_title")}</h3>
    <p style="margin:4px 0">${hs?`<b>${t("au_found",{n:esc(hs.label)})}</b>`:labels?t("au_none"):t("au_unknown")}</p>
    ${labels?"":`<button class="b alt sm" data-perm>${t("mic_show")}</button>`}
    <div class="row" style="margin-top:6px"><button class="b alt grow" data-test>🔊 ${t("au_test")}</button><button class="b alt grow" data-test2>🎤🔊 ${t("au_test2")}</button></div><div data-ask></div>
    <p class="muted" style="font-size:.8rem;margin-top:8px"><b>${t("mic_title")}:</b> ${t("mic_hint")}</p><div class="chips" data-m></div>
    ${SET.micId?`<div class="warnbox" style="margin-top:6px;font-size:.82rem">${t("au_micwarn")}</div>`:""}
    ${canOut?`<p class="muted" style="font-size:.8rem;margin-top:8px"><b>${t("au_out")}:</b></p><div class="chips" data-o></div>`:""}`;
  chipSet(box.querySelector("[data-m]"),[["",t("mic_default")]].concat(clean(ins).map((d,i)=>[d.deviceId,d.label||(t("mic_n")+" "+(i+1))])),SET.micId||"",v=>{ SET.micId=v; save(); renderMicPick(); });
  if(canOut) chipSet(box.querySelector("[data-o]"),[["",t("au_out_def")]].concat(clean(outs).map((d,i)=>[d.deviceId,d.label||("Output "+(i+1))])),SET.outId||"",async v=>{ SET.outId=v; save(); await applySink(); renderMicPick(); });
  const pb=box.querySelector("[data-perm]"); if(pb) pb.onclick=async()=>{ try{ const st=await navigator.mediaDevices.getUserMedia({audio:true}); st.getTracks().forEach(x=>x.stop()); }catch(e){} renderMicPick(); };
  const tone=(sec)=>{ const c=ac(), o=c.createOscillator(), g=c.createGain(); o.frequency.value=523; g.gain.setValueAtTime(0,c.currentTime); g.gain.linearRampToValueAtTime(0.25,c.currentTime+0.05); g.gain.setValueAtTime(0.25,c.currentTime+sec-0.1); g.gain.linearRampToValueAtTime(0,c.currentTime+sec); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+sec+0.05); };
  const ask=box.querySelector("[data-ask]"), askWhere=withMic=>{ ask.innerHTML=`<p style="margin:6px 0 4px">${t("au_where")}</p><div class="row"><button class="b sm grow" data-y>✓ ${t("au_yes")}</button><button class="b warm sm grow" data-n>✗ ${t("au_no")}</button></div>`;
    ask.querySelector("[data-y]").onclick=()=>{ ask.innerHTML=`<div class="okbox" style="margin-top:6px">${t("au_ok")}</div>`; };
    ask.querySelector("[data-n]").onclick=()=>{ if(withMic&&SET.micId){ SET.micId=""; save(); renderMicPick(); toast(t("au_reset")); return; } ask.innerHTML=`<div class="warnbox" style="margin-top:6px">${t(withMic?"au_fix_mic":"au_fix")}</div>`; }; };
  box.querySelector("[data-test]").onclick=()=>{ tone(1); askWhere(false); };
  box.querySelector("[data-test2]").onclick=async()=>{ let tk; try{ tk=await startTake({capture:false}); }catch(e){ micError(e); toast(t("mic_fail")); return; } tone(1.6); setTimeout(()=>tk.stop(),1900); askWhere(true); };
}
/* send the app's sound to the chosen output (only where the browser supports choosing it) */
async function applySink(){ try{ const c=ac(); if(c&&c.setSinkId) await c.setSinkId(SET.outId||""); }catch(e){} }
