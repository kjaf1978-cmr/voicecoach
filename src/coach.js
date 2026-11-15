/* ================= Training coach (v3.5): issue → targeted drill, repeated until the goal is reached ================= */
/* Practice texts in the training language. Markup: *word* = stress / emphasis, " / " = planned pause */
const CT={
 pauses:{
  en:["Today I want to talk about three things. / First, the problem. / Second, our solution. / And finally, the next steps.","Thank you for coming. / My name is Alex, / and I work as a project engineer. / Let me start with a question.","We tested the filter for six months. / The results were clear. / The water was cleaner, / and the costs were low."],
  de:["Heute möchte ich über drei Dinge sprechen. / Erstens, das Problem. / Zweitens, unsere Lösung. / Und schließlich, die nächsten Schritte.","Danke, dass Sie gekommen sind. / Mein Name ist Alex, / und ich arbeite als Projektingenieur. / Ich beginne mit einer Frage.","Wir haben den Filter sechs Monate getestet. / Die Ergebnisse waren eindeutig. / Das Wasser war sauberer, / und die Kosten waren niedrig."],
  fr:["Aujourd'hui, je voudrais parler de trois choses. / D'abord, le problème. / Ensuite, notre solution. / Et enfin, les prochaines étapes.","Merci d'être venus. / Je m'appelle Alex, / et je travaille comme ingénieur de projet. / Je commence par une question.","Nous avons testé le filtre pendant six mois. / Les résultats étaient clairs. / L'eau était plus propre, / et les coûts étaient faibles."]},
 melody:{
  en:["This is the *best* idea I have heard *all year*!","I *didn't* say *you* were wrong – I said we need *more time*.","Imagine: *clean* water for *every* school – *that* is our goal.","Would you like *tea* or *coffee*?","We were *so* close – just *two* days late!"],
  de:["Das ist die *beste* Idee, die ich *dieses Jahr* gehört habe!","Ich habe *nicht* gesagt, dass *du* falsch liegst – wir brauchen *mehr Zeit*.","Stell dir vor: *sauberes* Wasser für *jede* Schule – *das* ist unser Ziel.","Möchtest du *Tee* oder *Kaffee*?","Wir waren *so* nah dran – nur *zwei* Tage zu spät!"],
  fr:["C'est la *meilleure* idée que j'ai entendue *cette année* !","Je n'ai *pas* dit que *tu* avais tort – il nous faut *plus de temps*.","Imaginez : de l'eau *propre* pour *chaque* école – *voilà* notre objectif.","Tu veux du *thé* ou du *café* ?","On était *si* près du but – seulement *deux* jours de retard !"]},
 statements:{
  en:["My name is Alex Meyer.","I have eight years of experience.","The project will be finished on Friday.","I recommend the second option.","This is my final offer."],
  de:["Mein Name ist Alex Meyer.","Ich habe acht Jahre Berufserfahrung.","Das Projekt ist am Freitag fertig.","Ich empfehle die zweite Option.","Das ist mein letztes Angebot."],
  fr:["Je m'appelle Alex Meyer.","J'ai huit ans d'expérience.","Le projet sera terminé vendredi.","Je recommande la deuxième option.","C'est ma dernière offre."]},
 endings:{
  en:["Please send the report to everyone by *Friday afternoon*.","Our results show that the filter works in *every school*.","Thank you all for your attention and your *questions*.","We will meet again next week to discuss the *budget*."],
  de:["Bitte schickt den Bericht bis *Freitagnachmittag* an alle.","Unsere Ergebnisse zeigen, dass der Filter in *jeder Schule* funktioniert.","Vielen Dank für Ihre Aufmerksamkeit und Ihre *Fragen*.","Wir treffen uns nächste Woche wieder, um das *Budget* zu besprechen."],
  fr:["Merci d'envoyer le rapport à tout le monde avant *vendredi après-midi*.","Nos résultats montrent que le filtre fonctionne dans *chaque école*.","Merci à tous pour votre attention et vos *questions*.","Nous nous reverrons la semaine prochaine pour discuter du *budget*."]},
 questions:{
  en:["What did you have for breakfast today?","What is your favourite season, and why?","What do you do for a living?","Where would you like to travel next?","What do you do to relax?"],
  de:["Was hast du heute gefrühstückt?","Was ist deine Lieblingsjahreszeit und warum?","Was machst du beruflich?","Wohin möchtest du als Nächstes reisen?","Was tust du, um dich zu entspannen?"],
  fr:["Qu'avez-vous mangé au petit-déjeuner aujourd'hui ?","Quelle est votre saison préférée, et pourquoi ?","Quel est votre métier ?","Où aimeriez-vous voyager la prochaine fois ?","Que faites-vous pour vous détendre ?"]}
};
const ctPassages=l=>CTXS.map(c=>PASSAGES[l][c][1]).concat(REC_SENT[l]);
/* drill definitions. kind: read (read a text), prompt (answer a question / speak on a topic), words (word list) */
const DRILL_PRATE={fast:4.4,slow:4.6,pauses:4.3,melody:4.2,uptalk:4.0,trail:4.2};
const DRILLS={
 fast:   {dim:"pace",       kind:"read",   texts:l=>ctPassages(l), guide:130, metric:(an)=>({v:an.rate,pass:an.rate>=3.5&&an.rate<=5.2,txt:t("cm_rate",{v:f1(an.rate)})})},
 slow:   {dim:"pace",       kind:"read",   texts:l=>ctPassages(l), guide:150, metric:(an)=>({v:an.rate,pass:an.rate>=3.5&&an.rate<=5.2,txt:t("cm_rate",{v:f1(an.rate)})})},
 pauses: {dim:"pauses",     kind:"read",   texts:l=>CT.pauses[l],  metric:(an,x)=>{ const need=Math.max(1,(x.text.match(/ \/ /g)||[]).length-1); return {v:an.pauses.length,pass:an.pauses.length>=need&&an.pauseShare>=0.08,txt:t("cm_pauses",{n:an.pauses.length,k:need,p:Math.round(an.pauseShare*100)})}; }},
 fluent: {dim:"pauses",     kind:"read",   texts:l=>ctPassages(l), metric:(an)=>{ const mx=an.pauses.reduce((m,p)=>Math.max(m,p.e-p.s),0); return {v:mx,pass:mx<1.2&&an.pauseShare<=0.30,txt:t("cm_fluent",{s:f1(mx),p:Math.round(an.pauseShare*100)})}; }},
 melody: {dim:"melody",     kind:"read",   texts:l=>CT.melody[l],  model:true, metric:(an)=>({v:an.sdSt,pass:an.sdSt>=2.5,txt:t("cm_melody",{v:f1(an.sdSt)})})},
 uptalk: {dim:"melody",     kind:"read",   texts:l=>CT.statements[l], model:true, metric:(an)=>({v:an.uptalk.length,pass:an.uptalk.length===0,txt:t("cm_uptalk",{n:an.uptalk.length})})},
 trail:  {dim:"projection", kind:"read",   texts:l=>CT.endings[l], metric:(an)=>({v:an.trail.length,pass:an.trail.length===0&&an.meanDb>-42,txt:t("cm_trail",{n:an.trail.length})})},
 quiet:  {dim:"projection", kind:"read",   texts:l=>CT.endings[l].concat(CT.pauses[l]), metric:(an)=>({v:an.meanDb,pass:an.meanDb>=-36&&!an.clipping,txt:t("cm_quiet",{v:Math.round(an.meanDb)})})},
 clip:   {dim:"projection", kind:"read",   texts:l=>CT.endings[l], metric:(an)=>({v:an.clipping?1:0,pass:!an.clipping,txt:an.clipping?t("cm_clip_yes"):t("cm_clip_no")})},
 late:   {dim:"fluency",    kind:"prompt", texts:l=>CT.questions[l], auto:true, maxSec:25, metric:(an)=>({v:an.first,pass:an.first<=2,txt:t("cm_late",{s:f1(an.first)})})},
 fillers:{dim:"fluency",    kind:"prompt", texts:l=>TOPICS[l][SET.ctx], maxSec:60, needSR:true, metric:(an,x)=>{ const fi=fillerInfo(x.sr.text,x.lang); return {v:fi.n,pass:fi.n===0&&an.speak>=12,txt:t("cm_fillers",{n:fi.n,s:Math.round(an.speak)})}; }},
 clarity:{dim:"clarity",    kind:"words",  texts:(l,a)=>(a&&a.words&&a.words.length&&a.wordsLang===l?[a.words.slice(0,6).join(" · ")]:[]).concat(TWISTERS[l]), needSR:true, metric:(an,x)=>{ const cl=srClarity(x.sr,x.text.replace(/·/g," ")); const v=cl?cl.score:0; return {v,pass:v>=0.9,txt:t("cm_clarity",{p:Math.round(v*100)}),miss:cl?cl.miss:[]}; }}
};
Object.keys(DRILL_PRATE).forEach(k=>DRILLS[k].prate=DRILL_PRATE[k]);
const COACH_OF={fast:"fast",slow:"slow",nopause:"pauses",manypause:"fluent",longpause:"fluent",mono:"melody",uptalk:"uptalk",trail:"trail",quiet:"quiet",clip:"clip",late:"late",fillers:"fillers",clarity:"clarity"};
const STREAK=3, RECHECK=[3,14];
const f1=x=>(Math.round((x||0)*10)/10).toLocaleString(SET.ui);

/* ---------- assignments ---------- */
function coachStore(){ return store.coach||(store.coach={}); }
function coachRegister(fix,src){
  if(!fix||!fix.length) return; const C=coachStore(), added=[];
  fix.forEach(f=>{ const id=COACH_OF[f.code]; if(!id) return; let a=C[id];
    if(!a){ a=C[id]={id,created:Date.now(),streak:0,attempts:0,done:false,hist:[],src:"",words:[]}; added.push(id); }
    else if(a.done&&!a.recheckDue){ a.done=false; a.streak=0; a.reopened=Date.now(); added.push(id); }
    if(src){ a.src=src; a.srcLang=SET.ui; } a.lastSeen=Date.now(); if(f.miss){ if(a.wordsLang!==SET.tl) a.words=[]; a.wordsLang=SET.tl; a.words=[...new Set(f.miss.concat(a.words||[]))].slice(0,8); } });
  save(); if(added.length){ renderCoachList(); toast("🏋 "+t("coach_new",{n:added.map(id=>t("cd_"+id)).join(", ")})); }
}
function coachRegisterExt(id,src,extra){ const C=coachStore(); let a=C[id]; if(!a){ a=C[id]=Object.assign({id,created:Date.now(),streak:0,attempts:0,done:false,hist:[],src:src||"",srcLang:SET.ui},extra||{}); save(); renderCoachList(); toast("🏋 "+t("coach_new",{n:coachName(id)})); } else if(a.done){ a.done=false; a.streak=0; save(); renderCoachList(); } }
function coachName(id){ if(id.startsWith("art:")){ const [l,s]=id.slice(4).split("|"); return t("cd_art",{s,l:langIn(l)}); } if(id.startsWith("sup:")) return t(id==="sup:pulse"?"sup_pulse":"sup_flow"); return t("cd_"+id); }
function coachOpen(){ const C=coachStore(), now=Date.now(); return Object.values(C).filter(a=>!a.done||(a.recheckAt&&a.recheckAt<=now)); }
function coachAttempt(id,pass,val){ const a=coachStore()[id]; if(!a) return null; const rc=a.done&&a.recheckAt&&a.recheckAt<=Date.now();
  a.attempts++; a.hist.push({t:Date.now(),v:val,p:pass}); a.hist=a.hist.slice(-40); a.streak=pass?a.streak+1:0;
  let achieved=false; const need=rc?1:STREAK;
  if(a.streak>=need){ achieved=true; a.streak=0; if(rc){ a.rechecks=(a.rechecks||0)+1; a.recheckAt=a.rechecks<RECHECK.length?Date.now()+RECHECK[a.rechecks]*DAY:null; } else { a.done=true; a.doneAt=Date.now(); a.rechecks=0; a.recheckAt=Date.now()+RECHECK[0]*DAY; } markPlan("coach",id); }
  else if(rc&&!pass){ a.done=false; a.recheckAt=null; }
  save(); renderCoachList(); return {achieved,rc,a,need};
}

/* ---------- Today card ---------- */
function renderCoachList(){
  const box=$("#coachList"); if(!box) return; const C=coachStore(), now=Date.now(); box.innerHTML="";
  Object.values(C).forEach(a=>{ if(a.id.startsWith("art:")&&!a.done){ const [l,s]=a.id.slice(4).split("|"); if(ART[l]&&ART[l][s]&&artStats(l,s).mastered){ a.done=true; a.doneAt=now; a.rechecks=0; a.recheckAt=now+RECHECK[0]*DAY; markPlan("coach",a.id); save(); } } });
  const open=Object.values(C).filter(a=>!a.done), due=Object.values(C).filter(a=>a.done&&a.recheckAt&&a.recheckAt<=now), done=Object.values(C).filter(a=>a.done&&!(a.recheckAt&&a.recheckAt<=now));
  if(!open.length&&!due.length) box.append(el("p",{class:"muted"},t("coach_none")));
  [...due,...open].forEach(a=>{ const rc=a.done; const need=rc?1:STREAK;
    const r=el("div",{class:"planitem"},`<span class="ck">${rc?"🔁":"🏋"}</span><span class="grow"><b>${esc(coachName(a.id))}</b>${rc?` <span class="tag due">${t("coach_recheck")}</span>`:""}<br>
      <span class="muted">${esc(coachGoalShort(a.id))}</span><br><span class="dots">${[...Array(need)].map((_,k)=>`<i class="${k<a.streak?'on':''}"></i>`).join("")}</span> <span class="muted">${t("coach_tries",{n:a.attempts})}</span></span>`);
    const b=el("button",{class:"b sm warm"},t("coach_train")); b.onclick=()=>coachGo(a.id); r.append(b); box.append(r); });
  if(done.length){ const d=el("details",{},`<summary>✓ ${t("coach_done_list",{n:done.length})}</summary>`); done.forEach(a=>d.append(el("p",{class:"muted"},`✓ ${esc(coachName(a.id))}${a.recheckAt?" – "+t("coach_next_check",{d:new Date(a.recheckAt).toLocaleDateString(SET.ui)}):" – "+t("coach_retired")}`))); box.append(d); }
}
function coachGoalShort(id){ if(DRILLS[id]&&DRILLS[id].goal) return DRILLS[id].goal(); if(id.startsWith("art:")) return t("cg_art"); if(id.startsWith("sup:")) return t("cg_sup"); return t("cg_"+id); }
function coachGo(id){
  if(id.startsWith("art:")){ const [l,s]=id.slice(4).split("|"); if(SET.tl!==l) setTl(l); SP.snd=s; SP.pos="i"; SP.idx=0; show("speech"); renderSpeech(); scrollToId("serBox"); return; }
  if(id.startsWith("sup:")){ SUP.ex=id.slice(4); show("breath"); renderSupport(); scrollToId("supCard"); return; }
  openCoach(id);
}

/* ---------- drill runner (overlay) ---------- */
let CR=null;
function markupText(s){ return esc(s).replace(/\*([^*]+)\*/g,"<b class='stress'>$1</b>").replace(/ \/ /g," <span class='pmark'>⏸</span> "); }
const plainText=s=>s.replace(/\*/g,"").replace(/ \/ /g," ");
function openCoach(id){
  const def=DRILLS[id]; if(!def) return; const a=coachStore()[id]||null;
  CR={id,def,lang:SET.tl,i:a&&a.ti?a.ti%def.texts(SET.tl,a).length:0};
  $("#coachSheet").classList.remove("hidden"); document.body.style.overflow="hidden"; renderCoach();
}
function closeCoach(){ stopRecognition(); try{speechSynthesis.cancel();}catch(e){} if(CR&&CR.guide) clearInterval(CR.guide); CR=null; $("#coachSheet").classList.add("hidden"); document.body.style.overflow=""; renderCoachList(); renderPlan(); }
function renderCoach(res){
  const R=CR, def=R.def, a=coachStore()[R.id], texts=def.texts(R.lang,a), text=texts[R.i%texts.length];
  const rc=a&&a.done&&a.recheckAt&&a.recheckAt<=Date.now(), need=rc?1:STREAK, streak=a?a.streak:0;
  const box=$("#coachBody");
  box.innerHTML=`<div class="row"><h2 class="grow" style="margin:0">🏋 ${esc(t("cd_"+R.id))}</h2><button class="b sm alt" id="coachClose">${t("close")}</button></div>
    ${a&&a.src&&(!a.srcLang||a.srcLang===SET.ui)?`<p class="muted">${t("coach_why",{s:esc(a.src)})}</p>`:""}
    <div class="okbox"><b>${t("coach_goal")}:</b> ${esc(coachGoalShort(R.id))} ${rc?t("coach_goal_rc"):t("coach_goal_n",{n:need})}</div>
    <div class="row" style="margin:8px 0"><span class="dots big">${[...Array(need)].map((_,k)=>`<i class="${k<streak?'on':''}"></i>`).join("")}</span><span class="muted">${t("coach_streak",{a:streak,n:need})} · ${t("coach_tries",{n:a?a.attempts:0})}</span></div>
    <details ${a&&a.attempts?"":"open"}><summary>${t("coach_how")}</summary><ul class="list">${(def.how?def.how():t("ch_"+R.id)).split("|").map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details>
    ${!def.needSR||srLang()?"":`<div class="warnbox">${t("coach_nosr")}</div>`}
    <div class="muted" style="margin-top:8px">${t(def.kind==="prompt"?"coach_answer":"coach_read",{l:langIn(R.lang)})} (${(R.i%texts.length)+1}/${texts.length})</div>
    <div class="card flat reader" ${tlAttr(R.lang)} id="coachText" style="font-size:1.25rem;line-height:1.6">${def.kind==="prompt"?`<b>${esc(text)}</b>`:markupText(text)}</div>
    <div class="row">${def.model||def.kind==="prompt"?`<button class="b sm alt" id="coachModel">🔊 ${t(def.kind==="prompt"?"coach_hear_q":"coach_model")}</button>`:""}${def.guide?`<button class="b sm alt" id="coachGuide">▶ ${t("coach_guide",{w:def.guide})}</button>`:""}<button class="b sm alt" id="coachOther">↻ ${t("coach_other")}</button></div>
    <div id="coachPat" style="margin-top:6px"></div><div id="coachRec" style="margin-top:8px"></div><div id="coachRes"></div>`;
  $("#coachClose").onclick=closeCoach;
  $("#coachOther").onclick=()=>{ R.i++; renderCoach(); };
  if($("#coachModel")) $("#coachModel").onclick=()=>speak(plainText(text),R.lang,null,def.kind==="prompt"?null:0.9,def.kind==="prompt"?null:"model");
  if($("#coachGuide")) $("#coachGuide").onclick=()=>guideText(def.guide);
  const recBox=$("#coachRec");
  R.pan=null; if(def.prate&&typeof textTemplate==="function"){ const tpl=textTemplate(text,R.lang,def.prate); R.pan=patternPanel($("#coachPat"),tpl,{band:R.id==="tone"?voiceTarget():null}); }
  const ctl=recControls(recBox,{lang:srLang()?R.lang:null,maxSec:def.maxSec||60,onStart:()=>R.pan&&R.pan.reset(),onPitch:R.pan?(f,s,db)=>R.pan.onPitch(f,s,db):null,onDone:r=>coachDone(r,text)});
  if(def.auto&&!res){ /* quick-start drill: question is spoken, recording starts by itself */
    const go=el("button",{class:"b warm",style:"width:100%;margin-top:6px"},"▶ "+t("coach_q_start")); recBox.prepend(go); recBox.querySelector("[data-rec]").classList.add("hidden");
    go.onclick=()=>{ go.disabled=true; speak(text,R.lang,()=>{ if(CR===R){ recBox.querySelector("[data-rec]").classList.remove("hidden"); go.remove(); recBox.querySelector("[data-rec]").click(); } }); };
  }
  if(res) $("#coachRes").append(res);
}
function guideText(wpm){ const R=CR, box=$("#coachText"); if(!box) return; if(R.guide){ clearInterval(R.guide); R.guide=null; }
  const raw=plainText(R.def.texts(R.lang,coachStore()[R.id])[R.i%R.def.texts(R.lang,coachStore()[R.id]).length]).split(/\s+/);
  box.innerHTML=raw.map(w=>`<span>${esc(w)}</span>`).join(" "); let k=0; const sp=box.children;
  const step=()=>{ if(k>0){ sp[k-1].classList.remove("now"); sp[k-1].classList.add("done"); } if(k>=sp.length){ clearInterval(R.guide); R.guide=null; return; } sp[k].classList.add("now"); k++; };
  step(); R.guide=setInterval(step,60000/wpm); }
function coachDone(r,text){
  const R=CR; if(!R) return; if(R.guide){ clearInterval(R.guide); R.guide=null; }
  const def=R.def, an=analyze(r.pcm,{minSpeech:def.kind==="words"?40:80}), sr=r.sr.text?r.sr:null;
  const tips=makeTips(an,{sr,lang:R.lang,expected:def.kind==="prompt"?null:plainText(text),statements:R.id!=="melody"});
  const take={blob:r.blob,an,tips,kind:"coach-"+R.id,title:t("cd_"+R.id),lang:R.lang,text:sr?sr.text:""};
  const wrap=el("div");
  const finish=m=>{ const out=coachAttempt(R.id,m.pass,m.v); const a=out?out.a:null;
    const head=el("div",{class:m.pass?"okbox":"warnbox",style:"margin-top:8px"},`<div style="font-size:1.3rem;font-weight:800">${m.pass?"✓ "+t("coach_pass"):"✗ "+t("coach_fail")}</div><div>${esc(m.txt)}</div>
      <div style="margin-top:4px"><b>${m.pass?t("coach_next_pass"):t("coach_next_fail")}</b> ${esc(m.pass?t(def.next||("cn_"+R.id)):t(m.fb||("cf_"+R.id)))}</div>`);
    wrap.prepend(head);
    if(out&&out.achieved){ beep(1320,.35,.12); wrap.prepend(el("div",{class:"okbox",style:"font-size:1.1rem"},`🏆 <b>${out.rc?t("coach_rc_ok",{d:out.a.recheckAt?Math.round((out.a.recheckAt-Date.now())/DAY):0}):t("coach_achieved",{d:RECHECK[0]})}</b>`)); }
    const nb=el("div",{class:"row",style:"margin-top:8px"});
    const nxt=el("button",{class:"b grow"},t("coach_next_text")); nxt.onclick=()=>{ R.i++; if(a) a.ti=R.i; save(); renderCoach(); };
    const same=el("button",{class:"b alt grow"},t("coach_same")); same.onclick=()=>renderCoach();
    nb.append(same,nxt); wrap.append(nb); renderCoach(wrap); $("#coachRes").scrollIntoView({behavior:"smooth"}); };
  const pres=R.pan&&an.ok?R.pan.evaluate(an):null;
  if(pres) wrap.append(patternResultBox(pres,dw=>{ const res=$("#coachRes"); res.innerHTML=""; const hold=el("div"); res.append(hold); wordDrill(hold,Object.assign({dw,lang:R.lang,onBack:()=>renderCoach()},pres.ctx)); }));
  wrap.append(replayView(take,{onSave:()=>saveTake(take),noRegister:true}));
  if(!an.ok){ finish({pass:false,v:null,txt:an.noVoice?t("tip_noise"):t("tip_short")}); return; }
  if(def.needSR&&!sr){ /* self-assessment fallback */
    const q=el("div",{class:"card",style:"margin-top:8px"},`<p><b>${t(R.id==="fillers"?"coach_self_fill":"coach_self_clear")}</b></p><div class="chips"></div>`);
    const opts=R.id==="fillers"?[[0,"0"],[1,"1"],[2,"2"],[3,"3+"]]:[[1,"✓ "+t("ser_ok")],[0,"✗"]];
    chipSet(q.querySelector(".chips"),opts,null,v=>{ q.remove(); const n=+v; finish(R.id==="fillers"?{pass:n===0&&an.speak>=12,v:n,txt:t("cm_fillers",{n,s:Math.round(an.speak)})}:{pass:n===1,v:n,txt:n?t("ser_ok"):t("coach_fail")}); });
    wrap.prepend(q); renderCoach(wrap); return; }
  finish(def.metric(an,{text,sr,lang:R.lang}));
}
