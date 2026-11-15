/* ================= conversation player (v3) ================= */
let ATT=null;
const canRecord=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
function startAttempt(sc,lang,level,mode,onlyTurns){
  ac(); keepAwake(true);
  ATT={sc,lang,level,mode,order:onlyTurns||sc.turns[lang].map((_,i)=>i),pos:0,res:{},t0:Date.now(),hints:0,srMiss:0};
  $("#convList").classList.add("hidden"); $("#convPlayer").classList.remove("hidden");
  $("#cpTitle").textContent=sc.title[lang]+" ("+lang.toUpperCase()+")";
  const pm=mode==="review"?PASS.review:PASS[level];
  $("#cpLevel").innerHTML=(mode==="review"?`↻ ${t("review")} – `:"")+`${t("lvl")} ${level} · ${t("lvl"+level)} – ${t("lvl_d"+level)} <b>(${t("res_need",{s:"–",n:pm}).split("·")[1].trim()})</b>`
    +(mode==="weak"?`<br><i>${t("weak_note")}</i>`:"")+(SET.mode==="text"?`<br><i>${t("txt_mode_note")}</i>`:"");
  if(curView!=="talk") show("talk"); window.scrollTo(0,0);
  renderTurn();
}
function closeAttempt(){ stopRecognition(); try{speechSynthesis.cancel();}catch(e){} keepAwake(false); ATT=null; $("#convPlayer").classList.add("hidden"); $("#convList").classList.remove("hidden"); renderScenes(); renderToday(); renderPlan(); }
$("#cpClose").onclick=closeAttempt;
function turnData(){ const A=ATT, ti=A.order[A.pos], [partner,task,model,kw]=A.sc.turns[A.lang][ti]; return {ti,partner,task,model,kw,groups:parseKW(kw)}; }
function stepsBar(){ const A=ATT; $("#cpSteps").innerHTML=A.order.map((_,k)=>`<i class="${k<A.pos||(k===A.pos&&A.res[A.order[k]])?'d':''}"></i>`).join(""); }

function renderTurn(){
  const A=ATT, d=turnData(); stepsBar();
  const cue = A.level===1 ? `<div class="card flat"><div class="muted">${t("model")}</div><div style="font-size:1.05rem">${esc(d.model)}</div></div>`
            : A.level===2 ? `<div class="muted">${t("keypoints")}</div><div>${d.groups.map(g=>`<span class="kp">${esc(g[0].trim())}</span>`).join("")}</div>` : "";
  $("#cpBody").innerHTML=`<div class="muted" style="margin-top:8px">${t("turn")} ${A.pos+1}/${A.order.length} · ${t("partner")}</div>
    <div class="bubble them"><span>${esc(d.partner)}</span> <button class="b sm alt" id="pReplay" style="min-height:30px;padding:3px 9px">🔊</button></div>
    <div id="pbLine"></div>
    <p><b>${t("your_task")}:</b> ${esc(d.task)}</p>${cue}<div id="answerBox"></div>`;
  $("#pReplay").onclick=()=>speak(d.partner,A.lang);
  A.cur={readyT:null,tapT:null,pushed:false,first:null,hints:0};
  speak(d.partner,A.lang,()=>{ if(ATT===A&&A.cur.readyT===null) A.cur.readyT=performance.now(); });
  renderAnswer();
}
function renderAnswer(){
  const A=ATT, box=$("#answerBox"); box.innerHTML="";
  if(SET.mode==="text") return renderTextAnswer(box);
  if(!canRecord()){ box.innerHTML=`<div class="warnbox" style="margin:8px 0">${t("sr_off")}</div>`; return renderSelfRate(box); }
  const useSR = SET.mode==="auto" && !srBroken && store.flags.conc!==false;
  const wrap=el("div",{style:"margin-top:8px"}); box.append(wrap);
  recControls(wrap,{lang:useSR?A.lang:null,maxSec:150,label:t("speak"),onStart:tt=>{ A.cur.tapT=tt; if(A.cur.readyT===null) A.cur.readyT=tt; },onDone:r=>onSpoken(r,useSR)});
  const sb=el("button",{class:"b sm alt",style:"margin-top:6px"},t("rate_self")); sb.onclick=()=>{ box.innerHTML=""; renderSelfRate(box); }; box.append(sb);
}
function onSpoken(r,usedSR){
  const A=ATT; if(!A) return; const d=turnData();
  const an=analyze(r.pcm);
  if(usedSR){ const fatal=r.sr.err&&FATAL_SR.includes(r.sr.err), silent=!r.sr.text&&an.ok;
    if(fatal||silent){ A.srMiss++; if(fatal||A.srMiss>=2){ store.flags.conc=false; SET.mode="rec"; save(); toast(t("conc_note")); renderSettings(); } } }
  const latency=(A.cur.tapT!=null&&A.cur.readyT!=null)?Math.max(0,(A.cur.tapT-A.cur.readyT)/1000)+(an.ok?an.first:0):null;
  const sr=r.sr.text?r.sr:null;
  const tips=makeTips(an,{sr,lang:A.lang,expected:A.level===1?d.model:null,latency});
  const take={blob:r.blob,video:false,an,tips,kind:"conv",title:A.sc.title[A.lang]+" – "+d.task,lang:A.lang,text:r.sr.text||""};
  if(sr) turnResult(convScore({text:sr.text,an,tips,d,level:A.level,lang:A.lang}),take);
  else renderSelfCheck(take);
}
function convScore({text=null,an=null,tips=null,d,level,lang,ticks=null,hints=0}){
  let hits,content;
  if(ticks){ hits=ticks; content=hits.filter(Boolean).length/hits.length; }
  else { const tn=norm(text||""); hits=d.groups.map(g=>g.some(a=>kwHit(tn,a))); content=hits.filter(Boolean).length/hits.length;
    if(level===1&&text){ const ms=new Set(norm(d.model).split(" ")), ws=new Set(tn.split(" ")); let o=0; ms.forEach(w=>{ if(ws.has(w)) o++; }); content=0.5*content+0.5*o/ms.size; } }
  const mw=norm(d.model).split(" ").length;
  const complete = text ? Math.min(1,norm(text).split(" ").length/(0.6*mw)) : (an&&an.ok ? Math.min(1,an.speak/(0.6*mw/2.4)) : 0);
  const del = tips&&tips.scores ? Object.values(tips.scores).reduce((a,b)=>a+b,0)/Object.values(tips.scores).length : null;
  let score = del!=null ? 0.45*content+0.15*complete+0.40*del : 0.6*content+0.4*complete;
  score=Math.max(0,Math.round(score*100)-5*hints);
  const fi = text ? fillerInfo(text,lang) : {n:0,words:[]};
  return {score,content,complete,delivery:del,hits,fillers:fi.words,dims:tips&&tips.scores,auto:!ticks,text};
}
function renderSelfCheck(take){
  const A=ATT, d=turnData(), box=$("#answerBox"); box.innerHTML="";
  box.append(replayView(take,{onSave:()=>saveTake(take)}));
  const w=el("div",{class:"card",style:"margin-top:8px"},`<p><b>${t("self_kp")}</b></p>`);
  d.groups.forEach((g,i)=>w.append(el("label",{class:"check"},`<input type="checkbox" data-i="${i}"> <span>${esc(g.map(x=>x.trim()).join(" / "))}</span>`)));
  const go=el("button",{class:"b warm",style:"width:100%"},t("score_it"));
  go.onclick=()=>{ const ticks=d.groups.map((_,i)=>w.querySelector(`[data-i="${i}"]`).checked); turnResult(convScore({an:take.an,tips:take.tips,d,level:A.level,lang:A.lang,ticks}),take); };
  w.append(go); box.append(w);
}
function renderSelfRate(box){
  const vals=[null,null,null,null], wrap=el("div",{},`<p><b>${t("self_title")}</b></p>`);
  ["self_c1","self_c2","self_c3","self_c4"].forEach((k,i)=>{ const r=el("div",{class:"rate-row"},`<div class="muted">${t(k)}</div><div class="chips"></div>`), ch=r.querySelector(".chips");
    const draw=()=>chipSet(ch,[0,1,2,3,4].map(n=>[n,String(n)]),vals[i],v=>{ vals[i]=+v; draw(); go.disabled=vals.some(x=>x===null); }); draw(); wrap.append(r); });
  const go=el("button",{class:"b warm",style:"width:100%"},t("score_it")); go.disabled=true;
  go.onclick=()=>turnResult({score:Math.round(vals.reduce((a,b)=>a+b,0)/16*100),self:vals,auto:false,hits:null,fillers:[]},null);
  wrap.append(go); box.append(wrap);
}
function renderTextAnswer(box){
  const A=ATT, d=turnData();
  box.innerHTML=`<textarea id="txtAns" placeholder="${esc(t("text_ph"))}"></textarea><p class="muted" id="hintOut"></p>
    <div class="row"><button class="b sm alt" id="hintBtn">${t("hint")}</button><span class="grow"></span><button class="b" id="sendBtn">${t("send")}</button></div>`;
  $("#hintBtn").onclick=()=>{ const tn=norm($("#txtAns").value), miss=d.groups.find(g=>!g.some(a=>kwHit(tn,a))); if(!miss) return; A.cur.hints++; A.hints++; $("#hintOut").textContent=t("hint_txt",{k:miss[0].trim()}); };
  $("#sendBtn").onclick=()=>{ const txt=$("#txtAns").value.trim(); if(!txt) return; turnResult(convScore({text:txt,d,level:A.level,lang:A.lang,hints:A.cur.hints}),null); };
}
function turnResult(res,take){
  const A=ATT, d=turnData(), ti=d.ti, pm=A.mode==="review"?PASS.review:PASS[A.level];
  // pushback: partner insists once when content is weak (levels 2–3, review)
  if(A.level>=2&&!A.cur.pushed&&res.hits&&res.content<0.6){
    A.cur.pushed=true; A.cur.first=res; const line=rnd(PUSHBACK[A.lang]);
    $("#pbLine").innerHTML=`<div class="bubble them" style="border-left:4px solid var(--accent2)">${esc(line)}</div><p class="muted">${t("pushback")}</p>`;
    speak(line,A.lang,()=>{ if(ATT===A) A.cur.readyT=performance.now(); }); A.cur.readyT=null; A.cur.tapT=null;
    renderAnswer(); return;
  }
  if(A.cur.first&&A.cur.first.score>res.score) res=Object.assign({},A.cur.first,{pushedBack:true});
  A.res[ti]=Object.assign(res,{take});
  const good=res.score>=pm, last=A.pos===A.order.length-1;
  const bars = res.self ? ["self_c1","self_c2","self_c3","self_c4"].map((k,i)=>`<div class="sc"><span>${t(k).split(":")[0]}</span><div class="bar"><i style="width:${res.self[i]*25}%"></i></div><b>${res.self[i]}/4</b></div>`).join("")
    : [["c_content",res.content],["c_complete",res.complete]].concat(res.delivery!=null?[["c_delivery",res.delivery]]:[]).map(([k,v])=>`<div class="sc"><span>${t(k)}</span><div class="bar"><i style="width:${Math.round(v*100)}%;background:${v>=.8?'var(--ok)':v>=.5?'var(--accent2)':'var(--warn)'}"></i></div><b>${Math.round(v*100)}</b></div>`).join("");
  const kps = res.hits ? `<div>${d.groups.map((g,i)=>`<span class="kp ${res.hits[i]?"hit":"miss"}">${res.hits[i]?"✓":"✗"} ${esc(g[0].trim())}</span>`).join("")}</div>` : "";
  const box=$("#answerBox"); box.innerHTML=`${res.text&&SET.mode!=="text"?`<div class="muted">${t("heard")}</div><div class="bubble me">${esc(res.text)}</div>`:res.text?`<div class="bubble me">${esc(res.text)}</div>`:""}
    <div class="card flat"><div class="scorebig" style="color:${good?'var(--ok)':'var(--accent2)'}">${res.score}</div>${bars}${kps}
    ${res.fillers&&res.fillers.length?`<p class="muted">${t("fb_fillers",{w:esc(res.fillers.join(", "))})}</p>`:""}</div>
    <div id="turnReplay"></div>
    ${A.level>1?`<details ${good?"":"open"}><summary>${t("model")}</summary><p>${esc(d.model)}</p></details>`:""}
    <div class="row"><button class="b alt grow" id="againBtn">${t("retry_turn")}</button><button class="b grow" id="nextBtn">${last?t("finish"):t("next_turn")}</button></div>
    ${res.auto&&take?`<p><button class="b sm alt" id="wrongBtn">${t("sr_wrong")}</button></p>`:""}`;
  if(take) $("#turnReplay").append(replayView(take,{onSave:()=>saveTake(take)}));
  beep(good?990:520,.15,.1);
  $("#againBtn").onclick=()=>{ delete A.res[ti]; A.cur={readyT:performance.now(),tapT:null,pushed:false,first:null,hints:0}; $("#pbLine").innerHTML=""; renderAnswer(); };
  $("#nextBtn").onclick=()=>{ if(last) finishAttempt(); else { A.pos++; renderTurn(); } };
  if($("#wrongBtn")) $("#wrongBtn").onclick=()=>renderSelfCheck(take);
  stepsBar();
}
function finishAttempt(){
  const A=ATT, R=A.order.map(i=>A.res[i]||{score:0}), avg=Math.round(R.reduce((a,r)=>a+r.score,0)/R.length);
  const pm=A.mode==="review"?PASS.review:PASS[A.level], passed=avg>=pm, s=getConv(A.sc.id,A.lang); let msg="";
  if(A.mode!=="weak"){
    s.n=(s.n||0)+1; s.best[A.level]=Math.max(s.best[A.level]||0,avg);
    if(A.mode==="level"&&passed){ if(A.level<3){ if(s.lvl<=A.level) s.lvl=A.level+1; } else if(!s.mastered){ s.mastered=true; s.box=1; s.due=Date.now()+INTERVALS[1]*DAY; msg=t("res_mastered"); } }
    if(A.mode==="review"){ if(passed){ s.box=Math.min(INTERVALS.length-1,(s.box||1)+1); s.due=Date.now()+INTERVALS[s.box]*DAY; msg=t("res_rev_ok",{d:INTERVALS[s.box]}); } else { s.mastered=false; s.lvl=2; s.box=0; s.due=0; msg=t("res_rev_fail"); } }
    setConv(A.sc.id,A.lang,s);
  }
  store.hist.push({t:Date.now(),d:today(),id:A.sc.id,lang:A.lang,ctx:A.sc.ctx,level:A.level,mode:A.mode,score:avg,pass:passed}); save();
  logSession(A.sc.title[SET.ui]+" – "+(A.mode==="review"?t("review"):t("lvl")+" "+A.level),(Date.now()-A.t0)/60000);
  markPlan(A.mode==="review"?"review":"talk");
  // feedback summary
  const allHits=[], allMiss=[], fill=new Set(), dimSum={}, dimN={};
  A.order.forEach(i=>{ const r=A.res[i]; if(!r) return; const g=parseKW(A.sc.turns[A.lang][i][3]);
    if(r.hits) r.hits.forEach((h,k)=>(h?allHits:allMiss).push(g[k][0].trim())); (r.fillers||[]).forEach(f=>fill.add(f));
    if(r.dims) for(const k in r.dims){ dimSum[k]=(dimSum[k]||0)+r.dims[k]; dimN[k]=(dimN[k]||0)+1; } });
  const dims=Object.keys(dimSum).map(k=>[k,dimSum[k]/dimN[k]]).sort((a,b)=>b[1]-a[1]);
  const worked=[], improve=[];
  if(allHits.length) worked.push(t("c_content")+": "+allHits.slice(0,8).map(esc).join(", "));
  dims.filter(x=>x[1]>=0.8).forEach(x=>worked.push(t("d_"+x[0])+" ("+Math.round(x[1]*100)+")"));
  if(allMiss.length) improve.push(t("keypoints")+": "+allMiss.slice(0,8).map(esc).join(", "));
  dims.filter(x=>x[1]<0.65).forEach(x=>improve.push(t("d_"+x[0])+" ("+Math.round(x[1]*100)+")"));
  if(fill.size) improve.push(t("fb_fillers",{w:esc([...fill].join(", "))}));
  if(A.hints) improve.push(t("hints_used",{n:A.hints}));
  const weak=A.order.filter(i=>A.res[i]&&A.res[i].score<pm);
  $("#cpBody").innerHTML=`<div class="scorebig" style="color:${passed?'var(--ok)':'var(--accent2)'};margin-top:10px">${avg}</div>
    <h2 style="text-align:center">${passed?t("res_pass"):t("res_fail")}</h2>
    <p style="text-align:center" class="muted">${t("res_need",{s:avg,n:pm})}</p>
    ${msg?`<div class="${passed?"okbox":"warnbox"}">${msg}</div>`:""}
    <table style="margin-top:10px">${A.order.map((i,k)=>`<tr><td>${k+1}.</td><td>${esc(A.sc.turns[A.lang][i][1])}</td><td><b style="color:${(A.res[i]?.score??0)>=pm?'var(--ok)':'var(--warn)'}">${A.res[i]?.score??"–"}</b></td></tr>`).join("")}</table>
    <h3>${t("fb_title")}</h3>
    ${worked.length?`<p><b>✓ ${t("fb_worked")}</b></p><ul class="list">${worked.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}
    ${improve.length?`<p><b>✗ ${t("fb_improve")}</b></p><ul class="list">${improve.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}
    ${weak.length?`<details><summary>${t("fb_alt")}</summary>${weak.map(i=>`<p><i>${esc(A.sc.turns[A.lang][i][1])}</i><br>${esc(A.sc.turns[A.lang][i][2])}</p>`).join("")}</details>`:""}
    <div class="row" style="margin-top:12px" id="resBtns"></div>`;
  const rb=$("#resBtns"), sc=A.sc, lang=A.lang, lvl=A.level, mode=A.mode;
  const add=(label,cls,fn)=>{ const b=el("button",{class:"b grow "+cls},label); b.onclick=fn; rb.append(b); };
  if(!passed||mode==="weak") add(t("btn_repeat"),"",()=>startAttempt(sc,lang,mode==="review"?2:lvl,"level"));
  if(weak.length&&mode!=="weak") add(t("btn_weak"),"alt",()=>startAttempt(sc,lang,lvl,"weak",weak));
  if(passed&&mode==="level"&&lvl<3) add(t("btn_nextlvl"),"",()=>startAttempt(sc,lang,lvl+1,"level"));
  add(t("btn_back"),"alt",closeAttempt);
  beep(passed?1180:440,.35,.12); keepAwake(false); refreshStats();
}
