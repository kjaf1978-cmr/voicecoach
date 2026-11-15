/* ================= v3: plan, lessons, voice test, studio, drills, library ================= */
const DIMS6=["pace","pauses","melody","projection","clarity","fluency"];
const srLang=()=> (!srBroken && store.flags.conc!==false && SET.mode!=="rec") ? SET.tl : null;
function scrollToId(id){ const e=document.getElementById(id); if(e){ setTimeout(()=>e.scrollIntoView({behavior:"smooth",block:"start"}),60); e.style.outline="3px solid var(--accent2)"; setTimeout(()=>e.style.outline="",2500); } }

/* ---------- daily plan ---------- */
function nextScene(){ return SCENES.filter(s=>s.ctx===SET.ctx).map(sc=>({sc,s:getConv(sc.id,SET.tl)})).find(x=>!x.s.mastered); }
function planFor(date){
  if(store.plan[date]) return store.plan[date];
  const gi=typeof goalPlanItems==="function"?goalPlanItems():null;
  if(gi){ store.plan[date]={items:gi,done:{},goal:true}; save(); return store.plan[date]; }
  const dayN=Math.floor(Date.now()/DAY), prof=store.profile;
  const focus=prof&&prof.focus&&prof.focus.length?prof.focus[dayN%prof.focus.length]:DIMS6[dayN%6];
  const items=[{k:"warm",r:dayN%ROUTINES.length},{k:"drill",dim:focus,act:FOCUS_DRILL[focus]},{k:"diction",tw:dayN%6}];
  const co=typeof coachOpen==="function"?coachOpen():[]; if(co.length) items.splice(1,0,{k:"coach",id:co[0].id});
  const due=dueList(); if(due.length) items.push({k:"review",id:due[0].sc.id,l:due[0].l});
  const nx=nextScene(); if(nx) items.push({k:"talk",id:nx.sc.id,l:SET.tl});
  const ls=LESSONS.find(l=>!store.lessons[l.id]&&l.dim===focus)||LESSONS.find(l=>!store.lessons[l.id])||LESSONS[dayN%LESSONS.length];
  items.push({k:"lesson",id:ls.id});
  store.plan[date]={items,done:{}};
  const keys=Object.keys(store.plan).sort(); while(keys.length>60) delete store.plan[keys.shift()];
  save(); return store.plan[date];
}
function markPlan(k,x){ const p=planFor(today()); let ch=false;
  p.items.forEach((it,i)=>{ if(p.done[i]||it.k!==k) return; if(k==="drill"&&it.act!==x) return; if(k==="lesson"&&x&&it.id!==x) return; if(k==="coach"&&x&&it.id!==x) return; if(k==="art"&&x&&it.snd!==x) return; p.done[i]=true; ch=true; });
  if(ch){ save(); renderPlan(); const n=Object.keys(p.done).length; if(n===p.items.length){ beep(1320,.3,.12); toast("🎉 "+t("plan_done",{d:n,n:p.items.length})); } } }
const lessonOf=id=>LESSONS.find(l=>l.id===id);
const drillName=act=>act.startsWith("lesson:")?lessonOf(act.slice(7)).txt[SET.ui][0]:({pace:t("read_title"),into:t("into_title"),proj:t("proj_title"),art:t("art_title"),imp:t("imp_title"),studio:t("studio_title"),support:t("sup_title")}[act]||act);
function planLabel(it){
  const sc=id=>SCENES.find(s=>s.id===id);
  switch(it.k){
    case "warm": return t("pk_warm")+": "+ROUTINES[it.r].name[SET.ui];
    case "drill": return t("pk_drill")+" – "+t("d_"+it.dim)+": "+drillName(it.act);
    case "diction": { const x=TWISTERS[SET.tl][it.tw]; return esc(t("pk_diction"))+": <span "+tlAttr(SET.tl)+">"+esc(x.length>40?x.slice(0,38)+"…":x)+"</span>"; }
    case "review": return t("pk_review")+": "+sc(it.id).title[SET.ui]+" ("+SET.tl.toUpperCase()+")";
    case "talk": { const s=getConv(it.id,SET.tl); return t("pk_talk")+": "+sc(it.id).title[SET.ui]+" ("+SET.tl.toUpperCase()+") – "+t("lvl")+" "+(s.mastered?3:s.lvl); }
    case "lesson": return t("pk_lesson")+": "+lessonOf(it.id).txt[SET.ui][0];
    case "coach": return t("pk_coach")+": "+coachName(it.id);
    case "art": return t("ser_title")+": "+(ART[SET.tl][it.snd]?it.snd:Object.keys(ART[SET.tl])[0])+" ("+langIn(SET.tl)+")";
  } }
function planGo(it){
  switch(it.k){
    case "warm": show("today"); openRoutine(it.r); break;
    case "drill": { const a=it.act;
      if(a==="pace"){ show("speech"); scrollToId("paceCard"); }
      else if(a==="into"){ show("voice"); scrollToId("intoCard"); }
      else if(a==="proj"){ show("voice"); scrollToId("projCard"); }
      else if(a==="support"){ show("breath"); scrollToId("supCard"); }
      else if(a==="imp"){ show("talk"); scrollToId("impCard"); }
      else if(a==="art"){ show("speech"); const ks=Object.keys(ART[SET.tl]); SP.snd=ks.slice().sort((x,y)=>artStats(SET.tl,x).p-artStats(SET.tl,y).p)[0]; SP.idx=0; renderSpeech(); scrollToId("artCard"); }
      else if(a.startsWith("lesson:")){ openLesson(a.slice(7)); }
      break; }
    case "diction": show("speech"); $("#twSelect").value=it.tw; tw.load(); scrollToId("twCard"); break;
    case "review": { const sc=SCENES.find(s=>s.id===it.id), s=getConv(it.id,SET.tl); startAttempt(sc,SET.tl,s.mastered?3:s.lvl,s.mastered?"review":"level"); break; }
    case "talk": { const sc=SCENES.find(s=>s.id===it.id), s=getConv(it.id,SET.tl); startAttempt(sc,SET.tl,s.mastered?3:s.lvl,s.mastered?"review":"level"); break; }
    case "lesson": openLesson(it.id); break;
    case "coach": coachGo(it.id); break;
    case "art": show("speech"); SP.snd=ART[SET.tl][it.snd]?it.snd:Object.keys(ART[SET.tl])[0]; SP.pos="i"; SP.idx=0; renderSpeech(); scrollToId("serBox"); break;
  } }
function renderPlan(){
  const box=$("#planList"); if(!box) return; const p=planFor(today()); box.innerHTML="";
  if(!p.goal&&typeof coachOpen==="function"&&!p.items.some(x=>x.k==="coach")){ const co=coachOpen(); if(co.length){ p.items.splice(1,0,{k:"coach",id:co[0].id}); const nd={}; Object.keys(p.done).forEach(i=>nd[+i>=1?+i+1:i]=true); p.done=nd; save(); } }
  let lastS=-1; const G=store.goal;
  p.items.forEach((it,i)=>{ if(p.goal&&it.s!==undefined&&it.s!==lastS){ lastS=it.s; box.append(el("h3",{style:"margin:10px 0 2px"},`${t("goal_session",{i:it.s+1})} <span class="muted" style="font-weight:400">${G?t("unit_min",{m:G.per}):""}</span>`)); }
    const d=!!p.done[i]; const r=el("div",{class:"planitem"+(d?" done":"")},`<span class="ck">${d?"✅":"⬜"}</span><span class="grow">${it.k==="diction"?planLabel(it):esc(planLabel(it))}</span>`);
    const b=el("button",{class:"b sm"+(d?" alt":"")},t("go")); b.onclick=()=>planGo(it); r.append(b); box.append(r); });
  $("#planCount").textContent=t("plan_done",{d:Object.keys(p.done).length,n:p.items.length});
  if(p.goal&&lastS>0) box.append(el("p",{class:"muted"},"⏸ "+t("goal_rest")));
  $("#planNoTest").classList.toggle("hidden",!!store.profile);
  const cal=$("#planCal"); cal.innerHTML="";
  for(let k=13;k>=0;k--){ const d=new Date(Date.now()-k*DAY).toISOString().slice(0,10), pl=store.plan[d], f=pl?Object.keys(pl.done).length/pl.items.length:0;
    cal.append(el("i",{class:k===0?"today":"",title:d},`<b style="height:${Math.round(f*100)}%"></b>`)); }
}

/* ---------- lessons ---------- */
function renderLessons(){ const L=$("#lessonList"); L.innerHTML="";
  LESSONS.forEach(ls=>{ const [title,pts,task]=ls.txt[SET.ui], read=!!store.lessons[ls.id];
    const d=el("details",{class:"lesson",id:"lesson-"+ls.id},`<summary>${read?"✓ ":""}${esc(title)} <span class="tag">${t("d_"+ls.dim)}</span></summary>
      <ul class="list">${pts.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p class="muted"><b>🎤</b> ${esc(ls.txt[SET.ui][2])} <i>(${t("in_lang",{l:langIn(SET.tl)})})</i></p><div class="row"></div>`);
    const row=d.querySelector(".row"), tb=el("button",{class:"b sm"},t("lesson_try")), rb=el("button",{class:"b sm alt"},read?"✓ "+t("lesson_read"):t("lesson_done"));
    tb.onclick=()=>{ studioSetTask(ls.txt[SET.ui][2]+" ("+t("in_lang",{l:langIn(SET.tl)})+")",!!ls.video,"lesson:"+ls.id); show("voice"); scrollToId("studioCard"); };
    rb.onclick=()=>{ store.lessons[ls.id]=Date.now(); save(); markPlan("lesson",ls.id); markPlan("drill","lesson:"+ls.id); renderLessons(); };
    row.append(tb,rb); L.append(d); }); }
function openLesson(id){ show("today"); const d=document.getElementById("lesson-"+id); if(d){ d.open=true; scrollToId("lesson-"+id); } }

/* ---------- practice studio ---------- */
let STUDIO={task:null,act:"studio",video:false};
function studioSetTask(text,video,act){ STUDIO.task=text; STUDIO.taskTxt=text; STUDIO.act=act||"studio"; $("#studioVideo").checked=!!video; renderStudio(); }
function renderStudioPrompts(){ const s=$("#studioPrompt"); s.innerHTML=""; s.append(el("option",{value:""},t("studio_free")));
  TOPICS[SET.ui][SET.ctx].forEach((x,i)=>s.append(el("option",{value:i},esc(x)))); s.value=""; }
$("#studioPrompt").onchange=e=>{ const v=e.target.value; STUDIO.task=v===""?null:topicHtml(+v); STUDIO.taskTxt=v===""?null:TOPICS[SET.ui][SET.ctx][+v]; STUDIO.act="studio"; renderStudio(); };
$("#studioVideo").onchange=()=>renderStudio();
function renderStudio(){
  const tk=$("#studioTask"); tk.classList.toggle("hidden",!STUDIO.task); tk.innerHTML=STUDIO.task?(STUDIO.task.startsWith("<")?STUDIO.task:esc(STUDIO.task)):"";
  recControls($("#studioRec"),{video:$("#studioVideo").checked,lang:srLang(),maxSec:300,onDone:r=>studioDone(r,$("#studioVideo").checked)});
}
function studioDone(r,video){
  const an=analyze(r.pcm), tips=makeTips(an,{sr:r.sr.text?r.sr:null}), sc=tips.scores, score=avgScore(sc);
  const take={blob:r.blob,video,an,tips,scores:sc,score,kind:video?"video":"studio",title:STUDIO.taskTxt||(STUDIO.task&&!STUDIO.task.startsWith("<")?STUDIO.task:null)||t("studio_free"),lang:SET.tl,text:r.sr.text||""};
  const extra=video?`<h3>${t("bl_title")}</h3>`+t("bl_items").split("|").map(x=>`<label class="check"><input type="checkbox"> <span>${esc(x)}</span></label>`).join(""):"";
  const out=$("#studioOut"); out.innerHTML=""; out.append(replayView(take,{onSave:()=>saveTake(take),extra}));
  logSession(t("studio_title"),Math.max(0.5,an.dur/60)); markPlan("drill",STUDIO.act); if(STUDIO.act!=="studio") markPlan("drill","studio");
}
$("#studioFile").onchange=async e=>{ const f=e.target.files[0]; if(!f) return; e.target.value="";
  try{ toast(t("analysing")); const pcm=await decodeFile(f), an=analyze(pcm), tips=makeTips(an,{}), sc=tips.scores;
    const take={blob:f,video:f.type.startsWith("video"),an,tips,scores:sc,score:avgScore(sc),kind:"import",title:f.name,lang:SET.tl};
    const out=$("#studioOut"); out.innerHTML=""; out.append(replayView(take,{onSave:()=>saveTake(take)})); }
  catch(err){ toast("✗ "+String(err&&err.message||err)); } };

/* ---------- intonation drill ---------- */
let INTO_I=0;
function intoSentence(){ const [w]=INTO[SET.tl]; return w.join(" "); }
function renderInto(newStress){ const [w,idx]=INTO[SET.tl]; if(newStress||INTO_I>=w.length||!idx.includes(INTO_I)) INTO_I=rnd(idx.filter(i=>i!==INTO_I));
  $("#intoSent").innerHTML=w.map((x,i)=>i===INTO_I?`<u><b>${esc(x)}</b></u>`:esc(x)).join(" ");
  recControls($("#intoRec"),{lang:srLang(),maxSec:20,onDone:r=>{ const an=analyze(r.pcm), tips=makeTips(an,{sr:r.sr.text?r.sr:null,expected:intoSentence()}), sc=tips.scores;
    const take={blob:r.blob,an,tips,scores:sc,score:avgScore(sc),kind:"intonation",title:w.map((x,i)=>i===INTO_I?x.toUpperCase():x).join(" "),lang:SET.tl};
    const o=$("#intoOut"); o.innerHTML=""; o.append(replayView(take,{onSave:()=>saveTake(take)})); markPlan("drill","into"); logSession(t("into_title"),0.5); }}); }
$("#intoNew").onclick=()=>{ renderInto(true); $("#intoOut").innerHTML=""; };

/* ---------- projection drill ---------- */
function renderProj(){ $("#projText").textContent=T[SET.tl].counting;
  recControls($("#projRec"),{maxSec:30,onDone:r=>{ const an=analyze(r.pcm), o=$("#projOut"); o.innerHTML="";
    if(!an.ok){ o.append(replayView({blob:r.blob,an,tips:makeTips(an)})); return; }
    const S=an.series, a=Math.floor(an.first/S.hop), b=Math.ceil(an.last/S.hop), n=10, sl=[];
    for(let k=0;k<n;k++){ const s0=a+Math.floor((b-a)*k/n), s1=a+Math.floor((b-a)*(k+1)/n); const v=[]; for(let i=s0;i<s1;i++) if(S.sp[i]) v.push(S.db[i]); if(v.length) sl.push(v.reduce((x,y)=>x+y,0)/v.length); }
    const rise=(sl.slice(-2).reduce((x,y)=>x+y,0)/2)-(sl.slice(0,2).reduce((x,y)=>x+y,0)/2); let drops=0; for(let k=1;k<sl.length;k++) if(sl[k]<sl[k-1]-3) drops++;
    let sc=rise>=10&&rise<=20?1:rise<10?Math.max(0,rise/10):Math.max(0,1-(rise-20)/15); sc=Math.max(0,sc-0.1*drops-(an.clipping?0.3:0));
    const fix=[], good=[]; if(rise<10) fix.push({txt:t("proj_low")}); else if(rise>20) fix.push({txt:t("proj_high")}); else good.push(t("proj_ok")); if(drops>1) fix.push({txt:t("proj_jumpy")}); if(an.clipping) fix.push({txt:t("tip_clip")});
    const take={blob:r.blob,an,tips:{fix,good},scores:{projection:sc},score:Math.round(sc*100),kind:"projection",title:t("proj_title"),lang:SET.tl};
    o.append(replayView(take,{onSave:()=>saveTake(take),extra:`<p><b>${t("proj_res",{v:(Math.round(rise*10)/10).toLocaleString(SET.ui),n:sl.length})}</b></p>`}));
    markPlan("drill","proj"); logSession(t("proj_title"),0.5); }}); }

/* ---------- impromptu speaking with recording ---------- */
function renderImpRec(){ recControls($("#impRec"),{lang:srLang(),maxSec:240,onDone:r=>{ const an=analyze(r.pcm), tips=makeTips(an,{sr:r.sr.text?r.sr:null}), sc=tips.scores;
  const topic=$("#topicBox").dataset.set?TOPICS[SET.ui][SET.ctx][+$("#topicBox").dataset.i]:t("studio_free");
  const take={blob:r.blob,an,tips,scores:sc,score:avgScore(sc),kind:"impromptu",title:topic,lang:SET.tl,text:r.sr.text||""};
  const o=$("#impOut"); o.innerHTML=""; o.append(replayView(take,{onSave:()=>saveTake(take)})); markPlan("drill","imp"); logSession(t("imp_title"),Math.max(0.5,an.dur/60)); }}); }

/* ---------- tongue twister: record & score (clarity + speed) ---------- */
function renderTwRec(){ recControls($("#twRec"),{lang:srLang(),maxSec:40,label:t("tw_rec"),onDone:r=>{
  const txt=TWISTERS[SET.tl][+$("#twSelect").value||0], an=analyze(r.pcm), sr=r.sr.text?r.sr:null, tips=makeTips(an,{sr,expected:txt});
  const target=+$("#twWpm").value, words=sr?norm(sr.text).split(" ").length:norm(txt).split(" ").length;
  const wpm=an.ok?words/an.total*60:0, ratio=wpm/target, speed=an.ok?(ratio>=0.85&&ratio<=1.15?1:Math.max(0,1-Math.abs(ratio-1)*2)):0;
  const cl=srClarity(sr,txt), scores={clarity:cl?cl.score:null,pace:speed}; if(scores.clarity==null) delete scores.clarity;
  const take={blob:r.blob,an,tips,scores,score:avgScore(scores),kind:"twister",title:txt,lang:SET.tl,text:sr?sr.text:""};
  const extra=`<p><b>${t("tw_clarity")}:</b> ${cl?Math.round(cl.score*100):"–"} · <b>${t("tw_speed")}:</b> ${Math.round(speed*100)} (${Math.round(wpm)} WPM, ${t("tw_target",{w:target})})</p>`;
  const o=$("#twOut"); o.innerHTML=""; o.append(replayView(take,{onSave:()=>saveTake(take),extra})); markPlan("diction"); logSession(t("tw_title"),0.5); }}); }

/* ---------- voice test ---------- */
let TEST=null;
function renderTest(){
  if(TEST) return;
  const box=$("#testBody"); box.innerHTML="";
  const pr=store.profile;
  if(pr){ box.append(el("div",{},`<p class="muted">${t("test_last",{d:pr.d,s:pr.score})}</p>${profileHtml(pr)}`)); }
  const b=el("button",{class:"b",style:"width:100%;margin-top:8px"},pr?t("test_retake"):t("test_start")); b.onclick=()=>testStep(1); box.append(b);
}
function profileHtml(pr){ return `<div class="scorebig">${pr.score}</div><p style="text-align:center" class="muted">${t("test_score")} · ${t("m_pitch")} ${Math.round(pr.f0||0)} Hz</p>${scoreBars(pr.dims)}
  <p><b>✓ ${t("test_strengths")}:</b> ${pr.strengths.map(k=>t("d_"+k)).join(", ")}</p><p><b>➜ ${t("test_focus")}:</b> ${pr.focus.map(k=>t("d_"+k)).join(", ")}</p>`; }
function testStep(n){
  const box=$("#testBody"); box.innerHTML=""; if(n===1) TEST={parts:[]};
  const passage=PASSAGES[SET.tl].cas[1];
  box.append(el("p",{},"<b>"+(n===1?t("test_p1"):t("test_p2"))+"</b>"));
  box.append(el("div",{class:"card flat",style:"font-size:1.1rem;line-height:1.6"},(n===1?`<div ${tlAttr(SET.tl)}>${esc(passage)}</div>`:`<div ${tlAttr(SET.tl)}>${esc(T[SET.tl].test_prompt)}</div>`+(SET.tl!==SET.ui?`<div class="muted" style="font-size:.9rem">${esc(t("test_prompt"))}</div>`:""))));
  const rc=el("div"); box.append(rc);
  const cancel=el("button",{class:"b sm alt",style:"margin-top:8px"},t("cancel")); cancel.onclick=()=>{ TEST=null; renderTest(); }; box.append(cancel);
  recControls(rc,{lang:srLang(),maxSec:n===1?90:45,onDone:r=>{ TEST.parts.push({r,an:analyze(r.pcm)}); if(n===1) testStep(2); else testFinish(); }});
}
function testFinish(){
  const [p1,p2]=TEST.parts, passage=PASSAGES[SET.tl].cas[1], box=$("#testBody");
  const d1=deliveryScores(p1.an)||{}, d2=deliveryScores(p2.an,{statements:true})||{};
  const av=(a,b)=>a!=null&&b!=null?(a+b)/2:(a??b??null);
  const dims={pace:d1.pace??d2.pace??null, pauses:av(d1.pauses,d2.pauses), melody:av(d1.melody,d2.melody), projection:av(d1.projection,d2.projection)};
  const cl=srClarity(p1.r.sr.text?p1.r.sr:null,passage); if(cl) dims.clarity=cl.score;
  if(p2.r.sr.text){ const fi=fillerInfo(p2.r.sr.text,SET.tl); dims.fluency=clamp01(1-0.2*fi.n-0.1*(p2.an.longPauses||[]).length); }
  else if(p2.an.ok) dims.fluency=clamp01(1-0.15*p2.an.longPauses.length-(p2.an.first>4?0.2:0));
  Object.keys(dims).forEach(k=>{ if(dims[k]==null) delete dims[k]; });
  { const vt=typeof voiceTarget==="function"&&voiceTarget(), f0=p1.an.f0med||p2.an.f0med; if(vt&&f0&&(f0<vt.lo||f0>vt.hi)) coachRegisterExt("tone",t("test_title")); }
  if(!Object.keys(dims).length){ TEST=null; renderTest(); toast(t("tip_noise")); return; }
  const ranked=Object.entries(dims).sort((a,b)=>b[1]-a[1]), score=avgScore(dims);
  const pr={d:today(),t:Date.now(),score,dims,f0:p1.an.f0med||p2.an.f0med||0,strengths:ranked.slice(0,2).map(x=>x[0]),focus:ranked.slice(-2).reverse().map(x=>x[0])};
  store.profile=pr; store.tests.push(pr);
  const td=store.plan[today()]; if(td&&!Object.keys(td.done).length) delete store.plan[today()];
  save(); TEST=null; logSession(t("test_title"),1.5); renderPlan();
  box.innerHTML=`<h3>${t("test_result")}</h3>${profileHtml(pr)}`;
  [[p1,passage,"test-1"],[p2,null,"test-2"]].forEach(([p,exp,k],i)=>{ const tips=makeTips(p.an,{sr:p.r.sr.text?p.r.sr:null,expected:exp}), sc=tips.scores;
    const take={blob:p.r.blob,an:p.an,tips,scores:sc,score:avgScore(sc),kind:k,title:t("test_title")+" "+(i+1)+"/2",lang:SET.tl,text:p.r.sr.text||""};
    const det=el("details",{},`<summary>${t("replay_title")} – ${i+1}/2</summary>`); det.append(replayView(take,{saved:true})); box.append(det);
    saveTake(take).catch(()=>{}); coachRegister(tips.fix,t("test_title")); });
  const again=el("button",{class:"b alt",style:"width:100%;margin-top:8px"},t("test_retake")); again.onclick=()=>testStep(1); box.append(again);
}

/* ---------- library ---------- */
async function renderLibrary(){
  const L=$("#libList"); if(!L) return; L.innerHTML="";
  let all=[]; try{ all=await DB.all(); }catch(e){ L.innerHTML=`<p class="muted">${t("lib_fail")}</p>`; return; }
  all.sort((a,b)=>b.t-a.t);
  if(!all.length){ L.innerHTML=`<p class="muted">${t("lib_empty")}</p>`; return; }
  all.slice(0,100).forEach(o=>{ const r=el("div",{class:"planitem"},`<span class="ck">${o.video?"🎥":"🎙"}</span><span class="grow"><b>${esc(o.title||o.kind)}</b><br><span class="muted">${o.d} · ${o.lang.toUpperCase()} · ${o.kind}${o.score!=null?" · "+o.score:""}</span></span>`);
    const pb=el("button",{class:"b sm"},"▶"), db=el("button",{class:"b sm alt"},"🗑");
    pb.onclick=()=>{ const out=$("#libOut"); out.innerHTML=""; out.append(replayView(o,{saved:true})); out.scrollIntoView({behavior:"smooth"}); };
    db.onclick=async()=>{ if(db.dataset.sure){ await DB.del(o.id); renderLibrary(); $("#libOut").innerHTML=""; } else { db.dataset.sure="1"; db.textContent=t("del")+"?"; db.style.background="var(--warn)"; db.style.color="#fff"; } };
    r.append(pb,db); L.append(r); });
}
const _renderProgress=renderProgress;
renderProgress=function(){ _renderProgress();
  const {g,W,H,dpr}=prepCanvas($("#testChart"),150), ts=store.tests.slice(-20);
  const Y=v=>H-12*dpr-v/100*(H-22*dpr), X=i=>26*dpr+(ts.length<2?.5:i/(ts.length-1))*(W-36*dpr);
  g.strokeStyle=cssv("--line"); g.fillStyle=cssv("--muted"); [0,50,100].forEach(v=>{ g.beginPath(); g.moveTo(22*dpr,Y(v)); g.lineTo(W,Y(v)); g.stroke(); g.fillText(v,2,Y(v)+3*dpr); });
  if(!ts.length){ g.fillText(t("nothing"),30*dpr,24*dpr); }
  g.strokeStyle=cssv("--accent"); g.lineWidth=2*dpr; g.beginPath(); ts.forEach((x,i)=>i?g.lineTo(X(i),Y(x.score)):g.moveTo(X(i),Y(x.score))); g.stroke();
  g.fillStyle=cssv("--accent"); ts.forEach((x,i)=>{ g.beginPath(); g.arc(X(i),Y(x.score),3.5*dpr,0,7); g.fill(); });
  $("#testDims").innerHTML=store.profile?scoreBars(store.profile.dims):"";
  renderLibrary();
};

/* ---------- install prompt (Android Chrome) ---------- */
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredInstall=e; $("#installBtn").classList.remove("hidden"); });
$("#installBtn").onclick=async()=>{ if(!deferredInstall) return; deferredInstall.prompt(); try{ await deferredInstall.userChoice; }catch(e){} deferredInstall=null; $("#installBtn").classList.add("hidden"); };

/* ---------- re-render everything that depends on language / mode ---------- */
function renderV3(){ renderPlan(); renderLessons(); renderTest(); renderStudioPrompts(); renderStudio(); renderInto(); renderProj(); renderImpRec(); renderTwRec(); renderSupport(); renderCoachList(); renderTone(); renderGoal(); renderRef(); if(typeof renderChoir==="function") renderChoir(); }

/* ================= init ================= */
applyI18n(); nextPair(); maybeAskProfile();
{ const h=location.hash.slice(1); show(VIEWS.includes(h)?h:"today"); }
if("serviceWorker" in navigator && location.protocol==="https:" && topLevel && document.querySelector('link[rel=manifest]')){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }
