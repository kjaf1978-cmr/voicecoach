/* ================= breath support ("speak from the belly") – measured drills (v3.3) ================= */
const SUP_SENT={de:"Heute spreche ich ruhig, klar und kraftvoll – meine Stimme kommt aus dem Bauch.",
 en:"Today I speak calmly, clearly and with energy – my voice comes from my belly.",
 fr:"Aujourd'hui, je parle calmement, clairement et avec énergie – ma voix vient du ventre."};
/* frame energies (10 ms) for any sound incl. voiceless fricatives */
function frameDb(pcm){ const hop=160,N=Math.floor(pcm.length/hop),db=new Float32Array(N); for(let i=0;i<N;i++){ let s=0; for(let j=i*hop;j<i*hop+hop;j++) s+=pcm[j]*pcm[j]; db[i]=10*Math.log10(s/hop+1e-10); } return db; }
/* spectral balance: low band (<1 kHz) vs high band (1–4 kHz) energy on voiced frames, dB. Higher = darker / less pressed. Heuristic only. */
function spectralBalance(pcm,an){
  if(!an||!an.ok) return null; const S=an.series; let lo=0,hi=0,yl=0,yh=0,px=0; const al=1-Math.exp(-2*Math.PI*1000/16000), ah=Math.exp(-2*Math.PI*1000/16000), a4=1-Math.exp(-2*Math.PI*4000/16000); let h4=0;
  for(let i=0;i<pcm.length;i++){ yl+=al*(pcm[i]-yl); yh=ah*(yh+pcm[i]-px); px=pcm[i]; h4+=a4*(yh-h4); const k=Math.floor(i/320); if(S.f0[k]>0){ lo+=yl*yl; hi+=h4*h4; } }
  return hi>0?10*Math.log10(lo/hi):null; }

let SUP={ex:"pulse",tempo:80};
function renderSupport(){
  const card=$("#supCard"); if(!card) return;
  chipSet($("#supEx"),[["pulse",t("sup_pulse")],["flow",t("sup_flow")],["ab",t("sup_ab")]],SUP.ex,v=>{ SUP.ex=v; $("#supOut").innerHTML=""; renderSupport(); });
  const b=$("#supBody"); b.innerHTML="";
  const last=(store.support||[]).filter(x=>x.ex===SUP.ex).slice(-1)[0];
  if(SUP.ex==="pulse"){
    b.innerHTML=`<p class="muted">${t("sup_pulse_how")}</p><div class="row"><span class="muted">${t("sup_tempo")}:</span><div class="chips" id="supTempo"></div></div>
      <div class="beatdot" id="supBeat">${t("sup_ready")}</div><div id="supRec"></div>`;
    chipSet($("#supTempo"),[[60,"60"],[80,"80"],[100,"100"]],SUP.tempo,v=>{ SUP.tempo=+v; renderSupport(); });
    pulseControls($("#supRec"));
  } else if(SUP.ex==="flow"){
    b.innerHTML=`<p class="muted">${t("sup_flow_how")}</p><div class="huge" style="font-size:2rem">ssssssss…</div><div id="supRec"></div>`;
    recControls($("#supRec"),{maxSec:45,onDone:r=>flowDone(r)});
  } else {
    b.innerHTML=`<p class="muted">${t("sup_ab_how")}</p><div class="card flat" style="font-size:1.1rem">${esc(SUP_SENT[SET.tl])}</div><div id="supAB"></div>`;
    abStep(1);
  }
  if(last) b.append(el("p",{class:"muted"},t("sup_last",{d:last.d,s:last.score})));
}
/* ---- 1) diaphragm impulses ---- */
function pulseControls(box){
  const N=8; box.innerHTML=`<button class="b warm" style="width:100%" id="supGo">${t("sup_start")}</button>`;
  $("#supGo").onclick=async()=>{
    const per=60/SUP.tempo, dot=$("#supBeat"); $("#supGo").disabled=true; ac(); keepAwake(true);
    for(let k=4;k>=1;k--){ dot.textContent=k; dot.classList.add("on"); beep(k===1?1100:800,.08,.15); await new Promise(r=>setTimeout(r,per*500)); dot.classList.remove("on"); await new Promise(r=>setTimeout(r,per*500)); }
    let take; try{ take=await startTake({}); }catch(e){ micError(e); $("#supGo").disabled=false; return; }
    const t0=performance.now(), lead=0.4; dot.textContent="";
    for(let k=0;k<N;k++){ const due=t0+(lead+k*per)*1000; setTimeout(()=>{ dot.textContent=k+1; dot.classList.add("on"); try{ navigator.vibrate&&navigator.vibrate(40); }catch(e){} setTimeout(()=>dot.classList.remove("on"),150); },Math.max(0,due-performance.now())); }
    setTimeout(async()=>{ dot.textContent="…"; const r=await take.stop(); keepAwake(false); dot.textContent=t("sup_ready"); $("#supGo").disabled=false; pulseDone(r,lead,per,N); },(lead+N*per+0.8)*1000);
  };
}
function pulseDone(r,lead,per,N){
  const db=frameDb(r.pcm), floor=pctl(db,0.1), peak=pctl(db,0.99), thr=floor+Math.max(10,0.4*(peak-floor));
  const pulses=[]; for(let i=0;i<db.length;){ if(db[i]>thr){ let j=i,mx=-200; while(j<db.length&&db[j]>thr-3){ mx=Math.max(mx,db[j]); j++; } if(j-i>=3) pulses.push({s:i/100,e:j/100,d:(j-i)/100,pk:mx}); i=j+8; } else i++; }
  const beats=[...Array(N)].map((_,k)=>lead+k*per), errs=pulses.map(p=>Math.min(...beats.map(b=>Math.abs(p.s-b))));
  const nScore=Math.max(0,1-Math.abs(pulses.length-N)/N), meanErr=errs.length?errs.reduce((a,b)=>a+b,0)/errs.length:per;
  const timing=Math.max(0,1-meanErr/(per*0.5)), longP=pulses.filter(p=>p.d>0.35).length, crisp=pulses.length?1-longP/pulses.length:0;
  let gaps=0; for(let k=1;k<pulses.length;k++){ let mn=200; for(let i=Math.round(pulses[k-1].e*100);i<Math.round(pulses[k].s*100);i++) mn=Math.min(mn,db[i]); if(pulses[k-1].pk-mn>=15) gaps++; }
  const sep=pulses.length>1?gaps/(pulses.length-1):0, pk=pulses.map(p=>p.pk), m=pk.reduce((a,b)=>a+b,0)/(pk.length||1), sd=Math.sqrt(pk.reduce((a,b)=>a+(b-m)*(b-m),0)/(pk.length||1)), even=pulses.length?Math.max(0,Math.min(1,1-(sd-2)/6)):0;
  const scores={sup_count:nScore,sup_timing:timing,sup_crisp:crisp,sup_sep:sep,sup_even:even}, score=Math.round(100*Object.values(scores).reduce((a,b)=>a+b,0)/5);
  const fix=[],good=[];
  if(pulses.length<N) fix.push({txt:t("sup_t_few",{n:pulses.length,N})}); else if(pulses.length>N) fix.push({txt:t("sup_t_many",{n:pulses.length,N})}); else good.push(t("sup_g_count",{n:pulses.length}));
  if(timing<0.7) fix.push({txt:t("sup_t_timing",{ms:Math.round(meanErr*1000)})}); else good.push(t("sup_g_timing"));
  pulses.filter(p=>p.d>0.35).slice(0,2).forEach(p=>fix.push({t:p.s,txt:t("sup_t_long",{ms:Math.round(p.d*1000)})}));
  if(sep<0.7) fix.push({txt:t("sup_t_sep")}); else good.push(t("sup_g_sep"));
  if(even<0.7) fix.push({txt:t("sup_t_even",{v:(Math.round(sd*10)/10).toLocaleString(SET.ui)})}); else good.push(t("sup_g_even"));
  supResult({r,an:analyze(r.pcm,{minSpeech:20}),fix,good,scores,score,ex:"pulse",title:t("sup_pulse")+" "+SUP.tempo+" bpm"});
}
/* ---- 2) steady airflow on "ssss" ---- */
function flowDone(r){
  const db=frameDb(r.pcm), floor=pctl(db,0.1), peak=pctl(db,0.98), thr=floor+Math.max(8,0.35*(peak-floor));
  let best={s:0,e:0}; for(let i=0;i<db.length;){ if(db[i]>thr){ let j=i,gap=0; while(j<db.length&&(db[j]>thr||gap<15)){ gap=db[j]>thr?0:gap+1; j++; } j-=gap; if(j-i>best.e-best.s) best={s:i,e:j}; i=j+1; } else i++; }
  const dur=(best.e-best.s)/100, seg=Array.from(db.slice(best.s,best.e)).filter(v=>v>thr-6);
  const core=seg.slice(Math.floor(seg.length*0.1),Math.floor(seg.length*0.9)), m=core.reduce((a,b)=>a+b,0)/(core.length||1), sd=Math.sqrt(core.reduce((a,b)=>a+(b-m)*(b-m),0)/(core.length||1));
  const raw=Array.from(db.slice(best.s,best.e)), half=raw.slice(0,Math.floor(raw.length/2)), tail=raw.slice(-Math.max(20,Math.floor(raw.length*0.15))), avg=a=>a.reduce((x,y)=>x+y,0)/(a.length||1), drop=avg(half)-avg(tail);
  const dS=Math.min(1,dur/15), stS=Math.max(0,Math.min(1,1-(sd-1.5)/4)), endS=Math.max(0,Math.min(1,1-(drop-3)/9));
  const scores={sup_dur:dS,sup_steady:stS,sup_end:endS}, score=Math.round(100*(0.5*dS+0.3*stS+0.2*endS)), f1=x=>(Math.round(x*10)/10).toLocaleString(SET.ui);
  const fix=[],good=[];
  if(dur<10) fix.push({txt:t("sup_t_short",{s:f1(dur)})}); else good.push(t("sup_g_dur",{s:f1(dur)}));
  if(sd>3) fix.push({txt:t("sup_t_wobble",{v:f1(sd)})}); else good.push(t("sup_g_steady",{v:f1(sd)}));
  if(drop>6) fix.push({t:best.e/100-2,txt:t("sup_t_fade",{v:f1(drop)})});
  supResult({r,an:analyze(r.pcm,{minSpeech:20}),fix,good,scores,score,ex:"flow",title:t("sup_flow"),extra:`<p><b>${t("sup_dur")}:</b> ${f1(dur)} s · <b>${t("sup_steady")}:</b> ${f1(sd)} dB</p>`});
}
/* ---- 3) A/B comparison: normal vs. with belly support ---- */
let AB={};
function abStep(n){
  const box=$("#supAB"); box.innerHTML=`<p><b>${n===1?t("sup_ab1"):t("sup_ab2")}</b></p>${n===2?`<div class="okbox">${t("sup_ab2_cue")}</div>`:""}<div id="abRec"></div>`;
  recControls($("#abRec"),{lang:srLang(),maxSec:30,onDone:r=>{ const an=analyze(r.pcm); AB[n]={r,an,bal:spectralBalance(r.pcm,an),tips:makeTips(an,{sr:r.sr.text?r.sr:null,expected:SUP_SENT[SET.tl]})}; if(n===1) abStep(2); else abDone(); }});
}
function abDone(){
  const A=AB[1],B=AB[2], f1=x=>x==null?"–":(Math.round(x*10)/10).toLocaleString(SET.ui);
  if(!A.an.ok||!B.an.ok){ supResult({r:B.r,an:B.an,fix:[{txt:t("tip_short")}],good:[],scores:{},score:0,ex:"ab",title:t("sup_ab")}); return; }
  const cA=A.tips.scores.clarity, cB=B.tips.scores.clarity, trA=A.an.trail.length, trB=B.an.trail.length;
  const rows=[[t("m_loud"),f1(A.an.meanDb)+" dBFS",f1(B.an.meanDb)+" dBFS",B.an.meanDb-A.an.meanDb>=1.5],
    [t("m_pitch"),Math.round(A.an.f0med)+" Hz",Math.round(B.an.f0med)+" Hz",B.an.f0med<=A.an.f0med*1.03],
    [t("sup_bal"),f1(A.bal)+" dB",f1(B.bal)+" dB",B.bal!=null&&A.bal!=null&&B.bal>=A.bal+0.5],
    [t("sup_fade"),trA,trB,trB<=trA],
    [t("d_melody"),f1(A.an.sdSt),f1(B.an.sdSt),B.an.sdSt>=A.an.sdSt-0.2]];
  if(cA!=null&&cB!=null) rows.push([t("d_clarity"),Math.round(cA*100)+" %",Math.round(cB*100)+" %",cB>=cA]);
  const better=rows.filter(r=>r[3]).length, score=Math.round(100*better/rows.length);
  const fix=[],good=[];
  if(B.an.meanDb-A.an.meanDb>=1.5) good.push(t("sup_g_louder",{v:f1(B.an.meanDb-A.an.meanDb)})); else fix.push({txt:t("sup_t_notlouder")});
  if(B.an.f0med>A.an.f0med*1.08) fix.push({txt:t("sup_t_pitchup",{v:Math.round(B.an.f0med-A.an.f0med)})}); else good.push(t("sup_g_pitch"));
  if(trB>trA) fix.push({txt:t("tip_trail")}); else if(trA>0&&trB<trA) good.push(t("sup_g_fade"));
  if(B.bal!=null&&A.bal!=null&&B.bal<A.bal-1) fix.push({txt:t("sup_t_pressed")});
  const extra=`<table style="margin:8px 0"><tr><th></th><th>${t("sup_A")}</th><th>${t("sup_B")}</th><th></th></tr>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td><td>${r[3]?"✓":"–"}</td></tr>`).join("")}</table>
    <p class="muted" style="font-size:.78rem">${t("sup_bal_note")}</p>`;
  const o=supResult({r:B.r,an:B.an,fix,good,scores:{},score,ex:"ab",title:t("sup_ab"),extra});
  const det=el("details",{},`<summary>${t("sup_A")}</summary>`); det.append(replayView({blob:A.r.blob,an:A.an,tips:A.tips})); o.append(det);
}
function supResult({r,an,fix,good,scores,score,ex,title,extra=""}){
  const sc={}; for(const k in scores) sc[k]=scores[k];
  const take={blob:r.blob,an,tips:{fix,good},scores:null,score,kind:"support-"+ex,title,lang:SET.tl};
  const bars=Object.keys(sc).map(k=>{ const v=sc[k]; return `<div class="sc"><span>${t(k)}</span><div class="bar"><i style="width:${Math.round(v*100)}%;background:${v>=.8?'var(--ok)':v>=.5?'var(--accent2)':'var(--warn)'}"></i></div><b>${Math.round(v*100)}</b></div>`; }).join("");
  store.support=(store.support||[]); store.support.push({d:today(),t:Date.now(),ex,score}); store.support=store.support.slice(-200); save();
  markPlan("drill","support"); logSession(title,1);
  const o=$("#supOut"); o.innerHTML=""; const v=replayView(take,{onSave:()=>saveTake(take),extra:bars+extra}); o.append(v); return o;
}
