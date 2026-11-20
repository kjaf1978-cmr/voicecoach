/* ================= v5.4: continuous practice ("Dauerübung") with per-word arrows =================
   Hands-free loop on a word or a sentence: (listen) → speak → automatic end detection → ✓ / ▲ higher / ▼ lower per word
   (shown on the curve and as a word row) → next round … until the user presses Stop. */
Object.assign(T.en,{lp_btn_word:"🔁 Continuous practice “{w}” (until I stop)", lp_btn_sent:"🔁 Continuous practice of this sentence (until I stop)", lp_title:"🔁 Continuous practice", lp_how:"Hands-free: listen, then speak as soon as the dot turns red. The app notices when you have finished, shows ✓ / ▲ / ▼ above every word and starts the next round – until you press Stop.",
 lp_model_each:"Play the model before every round", lp_listen:"🔊 Listen …", lp_speak:"🎤 Speak now", lp_eval:"…", lp_round:"Round {n}", lp_right:"✓ {a} of {n} right", lp_streak:"Streak {s} · best {b}", lp_ok:"✓ Right!", lp_some:"Almost – follow the arrows:", lp_nov:"No voice heard – speak a little louder.", lp_paused:"Paused after 3 rounds without voice.",
 lp_stop:"■ Stop", lp_pause:"⏸ Pause", lp_resume:"▶ Continue", lp_sum:"Finished: {n} rounds, {a} right ({p} %), best streak {b}.", lp_up:"higher", lp_down:"lower", lp_rise:"let it rise", lp_fall:"let it fall", lp_tempo_f:"a little faster", lp_tempo_s:"a little slower", lp_legend:"▲ voice higher · ▼ voice lower · ↗ / ↘ follow the rising / falling curve · ✓ right"});
Object.assign(T.de,{lp_btn_word:"🔁 Dauerübung „{w}“ (bis ich stoppe)", lp_btn_sent:"🔁 Diesen Satz in Dauerschleife üben (bis ich stoppe)", lp_title:"🔁 Dauerübung", lp_how:"Freihändig: anhören, dann sprechen, sobald der Punkt rot wird. Die App erkennt, wann du fertig bist, zeigt über jedem Wort ✓ / ▲ / ▼ und startet die nächste Runde – bis du auf Stopp drückst.",
 lp_model_each:"Vorbild vor jeder Runde abspielen", lp_listen:"🔊 Zuhören …", lp_speak:"🎤 Jetzt sprechen", lp_eval:"…", lp_round:"Runde {n}", lp_right:"✓ {a} von {n} richtig", lp_streak:"Serie {s} · beste {b}", lp_ok:"✓ Richtig!", lp_some:"Fast – folge den Pfeilen:", lp_nov:"Keine Stimme gehört – sprich etwas lauter.", lp_paused:"Pausiert nach 3 Runden ohne Stimme.",
 lp_stop:"■ Stopp", lp_pause:"⏸ Pause", lp_resume:"▶ Weiter", lp_sum:"Beendet: {n} Runden, {a} richtig ({p} %), beste Serie {b}.", lp_up:"höher", lp_down:"tiefer", lp_rise:"ansteigen lassen", lp_fall:"abfallen lassen", lp_tempo_f:"etwas schneller", lp_tempo_s:"etwas langsamer", lp_legend:"▲ Stimme höher · ▼ Stimme tiefer · ↗ / ↘ der steigenden / fallenden Kurve folgen · ✓ richtig"});
Object.assign(T.fr,{lp_btn_word:"🔁 Pratique continue « {w} » (jusqu'à l'arrêt)", lp_btn_sent:"🔁 Pratiquer cette phrase en boucle (jusqu'à l'arrêt)", lp_title:"🔁 Pratique continue", lp_how:"Mains libres : écoutez, puis parlez dès que le point devient rouge. L'appli détecte la fin, affiche ✓ / ▲ / ▼ au-dessus de chaque mot et lance le tour suivant – jusqu'à ce que vous appuyiez sur Arrêter.",
 lp_model_each:"Jouer le modèle avant chaque tour", lp_listen:"🔊 Écoutez …", lp_speak:"🎤 Parlez maintenant", lp_eval:"…", lp_round:"Tour {n}", lp_right:"✓ {a} sur {n} justes", lp_streak:"Série {s} · meilleure {b}", lp_ok:"✓ Juste !", lp_some:"Presque – suivez les flèches :", lp_nov:"Aucune voix entendue – parlez un peu plus fort.", lp_paused:"En pause après 3 tours sans voix.",
 lp_stop:"■ Arrêter", lp_pause:"⏸ Pause", lp_resume:"▶ Reprendre", lp_sum:"Terminé : {n} tours, {a} justes ({p} %), meilleure série {b}.", lp_up:"plus haut", lp_down:"plus bas", lp_rise:"faire monter", lp_fall:"faire descendre", lp_tempo_f:"un peu plus vite", lp_tempo_s:"un peu plus lentement", lp_legend:"▲ voix plus haute · ▼ voix plus basse · ↗ / ↘ suivre la courbe montante / descendante · ✓ juste"});

/* per-word comparison of a take with the template: mean pitch and direction inside each word */
function wordMarks(tpl,an,base,tol){
  const S=an.series, pts=[]; S.f0.forEach((f,k)=>{ const tt=k*S.hop-an.first; if(f>0&&tt>=0) pts.push({t:tt,st:12*Math.log2(f/base)}); });
  const scale=an.total/Math.max(0.3,tpl.dur), out=[];
  tpl.words.forEach((w,i)=>{ const sp=wordSpan(tpl,i), tp=tpl.pts.filter(p=>p.t>=sp.t0-0.01&&p.t<=sp.t1+0.01); if(!tp.length) return;
    const up=pts.filter(p=>p.t>=sp.t0*scale&&p.t<=sp.t1*scale), tm=tp.reduce((a,p)=>a+p.st,0)/tp.length, ts=tp[tp.length-1].st-tp[0].st;
    if(up.length<2){ out.push({w:w.w,t:(sp.t0+sp.t1)/2,miss:true,ok:false}); return; }
    const um=up.reduce((a,p)=>a+p.st,0)/up.length, n3=Math.max(1,Math.floor(up.length/3)), us=up.slice(-n3).reduce((a,p)=>a+p.st,0)/n3-up.slice(0,n3).reduce((a,p)=>a+p.st,0)/n3;
    const d=um-tm, slopeBad=Math.abs(ts)>=2&&Math.sign(us)!==Math.sign(ts);
    out.push({w:w.w,t:(sp.t0+sp.t1)/2,d,dir:d<-tol?"up":d>tol?"down":null,slope:slopeBad?(ts>0?"rise":"fall"):null,ok:Math.abs(d)<=tol&&!slopeBad}); });
  return out;
}
function marksHtml(marks,lang){
  return `<div ${tlAttr(lang)} style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0">${marks.map(m=>{
    const sym=m.miss?"–":m.ok?"✓":m.dir==="up"?"▲":m.dir==="down"?"▼":m.slope==="rise"?"↗":"↘", col=m.ok?"var(--ok)":m.miss?"var(--muted)":"var(--accent2)";
    const hint=m.ok||m.miss?"":(m.dir?t(m.dir==="up"?"lp_up":"lp_down"):t(m.slope==="rise"?"lp_rise":"lp_fall"));
    return `<div style="text-align:center;min-width:44px"><div style="font-size:1.5rem;line-height:1;color:${col};font-weight:700">${sym}</div><div style="font-size:1.05rem;font-weight:600;padding:2px 6px;border-radius:8px;border:2px solid ${col}">${esc(m.w)}</div><div style="font-size:.7rem;color:${col}">${hint}</div></div>`; }).join("")}</div>`;
}
/* the loop itself */
function loopDrill(host,{tpl,center,relative,ownMed,lang,label,word=false,goal=0,onGoal=null,onExit=null,focus=false}){
  const L={on:true,paused:false,n:0,ok:0,streak:0,best:0,nov:0,hist:[],take:null,timers:[],wstat:tpl.words.map(w=>({w:w.w,n:0,ok:0})),last:null,fails:[]}, tol=word?WD_TOL:2.0;
  const base=()=>relative?(ownMed||center):center, text=tpl.words.map(w=>w.w).join(" ");
  const tMean=tpl.pts.reduce((a,p)=>a+p.st,0)/Math.max(1,tpl.pts.length);
  const box=el("div",{class:"card",style:"border:2px solid var(--accent);margin-top:8px"}); host.innerHTML=""; host.append(box);
  box.innerHTML=`<div class="row"><h3 class="grow" style="margin:0">${focus?"🎯 "+t("fc_title"):t("lp_title")}${label?": "+esc(label):""}</h3></div>
    <p class="muted" style="font-size:.82rem">${focus?t("fc_how",{n:goal}):t("lp_how")}</p>
    <label class="row" style="font-size:.85rem"><input type="checkbox" data-mod checked> ${t("lp_model_each")}</label>
    <div class="row"><b data-rnd class="grow"></b><span class="muted" data-st></span></div>
    <div data-band style="position:sticky;top:0;z-index:3;background:var(--card);padding:6px 0 4px;border-bottom:1px solid var(--line)"></div>
    <div class="beatdot" data-dot style="width:auto;height:auto;padding:10px;border-radius:14px;font-size:1.1rem;margin:6px 0">–</div>
    <div data-p></div><div data-mk></div><div data-msg style="text-align:center"></div>
    <p class="muted" style="font-size:.72rem;text-align:center">${t("lp_legend")}</p>
    <div class="row" style="margin-top:6px"><button class="b alt grow" data-pause>${t("lp_pause")}</button><button class="b warm grow" data-stop>${t("lp_stop")}</button></div>`;
  const pan=patternPanel(box.querySelector("[data-p]"),tpl,{center:base(),band:null,relative:false});
  const dot=box.querySelector("[data-dot]"), mk=box.querySelector("[data-mk]"), msg=box.querySelector("[data-msg]"), modelCb=box.querySelector("[data-mod]");
  const stats=()=>{ box.querySelector("[data-rnd]").textContent=t("lp_round",{n:L.n+1})+" · "+t("lp_right",{a:L.ok,n:L.n}); box.querySelector("[data-st]").textContent=t("lp_streak",{s:L.streak,b:L.best});
    box.querySelector("[data-band]").innerHTML=bandHtml(L,lang); };
  const later=(fn,ms)=>{ const h=setTimeout(()=>{ if(L.on&&!L.paused) fn(); },ms); L.timers.push(h); };
  const round=async()=>{
    if(!L.on||L.paused) return; stats(); pan.reset(); if(L.last) pan.mark(L.last);
    if(modelCb.checked){ dot.classList.remove("on"); dot.textContent=t("lp_listen"); await new Promise(r=>speak(text,lang,r,word?0.75:null,"model",word?Math.pow(2,tMean/24):null)); if(!L.on||L.paused) return; await new Promise(r=>setTimeout(r,250)); }
    let take, floor=null, t0=performance.now(), spoke=false, quietSince=null, done=false;
    const maxMs=Math.max(4000,(tpl.dur*2.2+2)*1000);
    const finish=async(voice)=>{ if(done) return; done=true; L.take=null; let r; try{ r=await take.stop(); }catch(e){ return; } dot.classList.remove("on"); dot.textContent=t("lp_eval"); if(!L.on) return; evaluate(r,voice); };
    try{ take=await startTake({onPitch:(f,s,db)=>pan.onPitch(f,s,db),onLevel:(d)=>{ if(done||L.paused) return; const el_=performance.now()-t0;
      if(el_<300){ floor=floor==null?d:Math.min(floor,d); return; } const th=Math.max(-52,(floor==null?-60:floor)+12);
      if(d>th){ spoke=true; quietSince=null; } else if(spoke){ if(quietSince==null) quietSince=performance.now(); else if(performance.now()-quietSince>800) finish(true); }
      if(!spoke&&el_>6000) finish(false); if(el_>maxMs) finish(spoke); }}); }
    catch(e){ micError(e); toast(t("mic_fail")); stop(); return; }
    L.take=take; dot.classList.add("on"); dot.textContent=t("lp_speak");
  };
  const evaluate=(r,voice)=>{
    const an=analyze(r.pcm,{minSpeech:15});
    if(!voice||!an.ok||!an.f0med){ L.nov++; msg.innerHTML=`<div class="warnbox">${t("lp_nov")}</div>`; mk.innerHTML="";
      if(L.nov>=3){ L.nov=0; pause(true); msg.innerHTML=`<div class="warnbox">${t("lp_paused")}</div>`; return; } later(round,1200); return; }
    L.nov=0; L.lastMed=an.f0med; const res=pan.evaluate(an), marks=wordMarks(tpl,an,relative?an.f0med:base(),tol);
    pan.mark&&pan.mark(marks);
    const allOk=marks.length&&marks.every(m=>m.ok), tempo=res&&res.ratio<0.75?"lp_tempo_f":res&&res.ratio>1.35?"lp_tempo_s":null, ok=allOk&&!tempo;
    L.n++; if(ok){ L.ok++; L.streak++; L.best=Math.max(L.best,L.streak); } else L.streak=0; L.hist.push(ok); beep(ok?990:520,.12,.1);
    L.last=marks; marks.forEach((m,i)=>{ const ws=L.wstat[i]; if(ws&&!m.miss){ ws.n++; if(m.ok) ws.ok++; } });
    L.fails.push(ok?null:new Set(marks.map((m,i)=>m.ok||m.miss?-1:i).filter(i=>i>=0)));
    mk.innerHTML=marksHtml(marks,lang);
    msg.innerHTML=ok?`<div class="okbox"><b>${t("lp_ok")}</b></div>`:`<div class="warnbox">${t("lp_some")}${tempo?" "+t(tempo)+".":""}</div>`;
    stats();
    if(goal&&L.streak>=goal){ msg.innerHTML=`<div class="okbox" style="font-size:1.05rem"><b>${t("fc_done",{w:label||""})}</b></div>`; L.timers.push(setTimeout(()=>{ L.on=false; onGoal&&onGoal(); },1600)); return; }
    // the same words wrong in the last two rounds → propose a focused drill on exactly that part
    const f2=L.fails.slice(-2); if(!focus&&!word&&tpl.words.length>1&&f2.length===2&&f2[0]&&f2[1]){ const inter=[...f2[1]].filter(i=>f2[0].has(i));
      if(inter.length&&!(inter.length===tpl.words.length)){ proposeFocus(Math.min(...inter),Math.max(...inter)); return; } }
    later(round,ok?1300:2200);
  };
  const proposeFocus=(i0,i1)=>{ pause(true); dot.textContent="🎯"; const words=tpl.words.slice(i0,i1+1).map(w=>w.w).join(" ");
    msg.innerHTML=`<div class="warnbox" style="text-align:left"><b>${t("fc_prop",{w:words})}</b><br>${t("fc_prop_h")}<div class="row" style="margin-top:6px"><button class="b warm grow" data-fgo>🎯 ${t("fc_go",{w:words})}</button><button class="b alt grow" data-fno>${t("fc_no")}</button></div></div>`;
    msg.querySelector("[data-fno]").onclick=()=>{ L.fails=[]; pause(false); };
    msg.querySelector("[data-fgo]").onclick=()=>{ L.fails=[]; const sub=spanTpl(tpl,i0,i1), fh=el("div"); box.style.display="none"; box.after(fh);
      const back=(okDone)=>{ fh.remove(); box.style.display=""; msg.innerHTML=`<div class="${okDone?"okbox":"warnbox"}">${t(okDone?"fc_back":"fc_back2",{w:words})}</div>`; box.scrollIntoView({behavior:"smooth",block:"start"}); setTimeout(()=>{ if(L.on) pause(false); },900); };
      loopDrill(fh,{tpl:sub,center,relative,ownMed:L.lastMed||ownMed,lang,label:words,word:i0===i1,goal:2,focus:true,onGoal:()=>back(true),onExit:()=>back(false)}); };
  };
  const pause=(on)=>{ L.paused=on; L.timers.forEach(clearTimeout); L.timers=[]; if(on){ if(L.take){ const tk=L.take; L.take=null; tk.stop().catch(()=>{}); } try{ speechSynthesis.cancel(); }catch(e){} dot.classList.remove("on"); dot.textContent="⏸"; }
    box.querySelector("[data-pause]").textContent=on?t("lp_resume"):t("lp_pause"); if(!on){ msg.innerHTML=""; round(); } };
  const stop=()=>{ L.on=false; L.timers.forEach(clearTimeout); if(onExit){ if(L.take){ L.take.stop().catch(()=>{}); L.take=null; } try{ speechSynthesis.cancel(); }catch(e){} onExit(); return; } if(L.take){ L.take.stop().catch(()=>{}); L.take=null; } try{ speechSynthesis.cancel(); }catch(e){}
    if(L.n) logSession(t("lp_title")+(label?": "+label:""),Math.max(0.5,L.n*0.15));
    box.innerHTML=`<div class="okbox"><b>${t("lp_title")}</b><br>${t("lp_sum",{n:L.n,a:L.ok,p:L.n?Math.round(100*L.ok/L.n):0,b:L.best})}</div>${L.n?`<div style="margin-top:6px">${bandHtml(L,lang)}</div>`:""}`;
    const again=el("button",{class:"b alt",style:"width:100%;margin-top:6px"},label?t(word?"lp_btn_word":"lp_btn_sent",{w:label}):t("lp_btn_sent")); again.onclick=()=>loopDrill(host,{tpl,center,relative,ownMed,lang,label,word}); box.append(again); };
  box.querySelector("[data-pause]").onclick=()=>pause(!L.paused);
  box.querySelector("[data-stop]").onclick=stop;
  stats(); box.scrollIntoView({behavior:"smooth",block:"start"}); setTimeout(round,400);
  return {stop};
}
/* sub-template for a single word (same as in the word drill) */
function wordTpl(tpl,dw){ return {dur:Math.max(0.3,dw.t1-dw.t0),pts:tpl.pts.filter(p=>p.t>=dw.t0-0.01&&p.t<=dw.t1+0.01).map(p=>({t:p.t-dw.t0,st:p.st})),words:[{t:0,w:dw.w}],pauses:[],src:"word"}; }

/* entry points: "continuous practice" buttons in the result box (whole sentence) and in the word drill */
const _patternResultBox0=patternResultBox;
patternResultBox=function(res,onWord){ const box=_patternResultBox0(res,onWord);
  if(res&&res.ctx&&res.ctx.tpl&&res.ctx.tpl.words&&res.ctx.tpl.words.length){ const host=el("div"); const b=el("button",{class:"b alt",style:"width:100%;margin-top:6px"},t("lp_btn_sent"));
    b.onclick=()=>{ b.remove(); loopDrill(host,Object.assign({lang:res.ctx.lang||SET.tl},res.ctx)); }; box.append(b,host); }
  return box; };
const _wordDrill0=wordDrill;
wordDrill=function(box,o){ _wordDrill0(box,o); addWordLoop(box,o); };
function addWordLoop(box,o){ const card=box.querySelector(".card"); if(!card||card.querySelector("[data-lpw]")) return; const host=el("div");
  const b=el("button",{class:"b warm","data-lpw":"1",style:"width:100%;margin-top:8px"},t("lp_btn_word",{w:o.dw.w}));
  b.onclick=()=>{ const tpl=wordTpl(o.tpl,o.dw); card.querySelectorAll("[data-r],[data-p],[data-m]").forEach(x=>x.innerHTML=""); b.remove(); loopDrill(host,{tpl,center:o.center,relative:o.relative,ownMed:o.ownMed,lang:o.lang,label:o.dw.w,word:true}); };
  card.append(b,host);
  // the word drill re-renders its card after every take – keep the button available
  const mo=new MutationObserver(()=>{ if(!card.isConnected){ mo.disconnect(); const nc=box.querySelector(".card"); if(nc&&!nc.querySelector("[data-lpw]")&&!box.querySelector("[data-lpw-run]")) addWordLoop(box,o); } }); mo.observe(box,{childList:true});
  b.addEventListener("click",()=>{ host.setAttribute("data-lpw-run","1"); mo.disconnect(); });
}

/* success band – stays visible for the whole session (sticky): one segment per round + success per word */
function bandHtml(L,lang){
  const seg=L.hist.slice(-40), pct=L.n?Math.round(100*L.ok/L.n):0;
  const bar=`<div style="display:flex;gap:2px;height:14px;border-radius:7px;overflow:hidden;background:var(--line)">${seg.length?seg.map(o=>`<i style="flex:1;background:${o?"var(--ok)":"var(--accent2)"}"></i>`).join(""):`<i style="flex:1"></i>`}</div>`;
  const col=r=>r==null?"var(--muted)":r>=0.8?"var(--ok)":r>=0.5?"#d9a400":"var(--accent2)";
  const words=L.wstat.length>1?`<div ${tlAttr(lang)} style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px">${L.wstat.map(w=>{ const r=w.n?w.ok/w.n:null; return `<span style="font-size:.78rem;padding:1px 6px;border-radius:8px;border:2px solid ${col(r)};color:${col(r)}">${esc(w.w)} ${r==null?"–":Math.round(r*100)+" %"}</span>`; }).join("")}</div>`:"";
  return `<div class="row" style="font-size:.8rem;margin-bottom:3px"><b class="grow">${t("lp_band",{p:pct})}</b><span class="muted">${t("lp_streak",{s:L.streak,b:L.best})}</span></div>${bar}${words}`;
}
Object.assign(T.en,{lp_band:"Success this session: {p} %"}); Object.assign(T.de,{lp_band:"Erfolg in dieser Übung: {p} %"}); Object.assign(T.fr,{lp_band:"Réussite de cette séance : {p} %"});

/* sub-template covering words i0..i1 of a sentence template */
function spanTpl(tpl,i0,i1){ const a=wordSpan(tpl,i0), b=wordSpan(tpl,i1), t0=a.t0, t1=b.t1;
  return {dur:Math.max(0.3,t1-t0),pts:tpl.pts.filter(p=>p.t>=t0-0.01&&p.t<=t1+0.01).map(p=>({t:p.t-t0,st:p.st})),words:tpl.words.slice(i0,i1+1).map(w=>({t:Math.max(0,w.t-t0),w:w.w})),pauses:tpl.pauses.filter(p=>p.s>t0&&p.e<t1).map(p=>({s:p.s-t0,e:p.e-t0})),src:"focus"}; }
Object.assign(T.en,{fc_title:"Focus", fc_prop:"“{w}” was not right twice in a row.", fc_prop_h:"Practise just this part until it is right twice in a row – then you go back to the whole sentence.", fc_go:"Practise “{w}”", fc_no:"Keep going with the whole sentence", fc_how:"Say only this part. When it is right {n}× in a row, you automatically return to the whole sentence.", fc_done:"✓ “{w}” is right now – back to the whole sentence …", fc_back:"Back to the whole sentence – say “{w}” just like in the focus practice.", fc_back2:"Back to the whole sentence."});
Object.assign(T.de,{fc_title:"Fokus", fc_prop:"„{w}“ war zweimal hintereinander nicht richtig.", fc_prop_h:"Übe nur diesen Teil, bis er zweimal hintereinander sitzt – danach geht es zurück zum ganzen Satz.", fc_go:"„{w}“ üben", fc_no:"Mit dem ganzen Satz weitermachen", fc_how:"Sprich nur diesen Teil. Wenn er {n}-mal hintereinander richtig ist, geht es automatisch zurück zum ganzen Satz.", fc_done:"✓ „{w}“ sitzt jetzt – zurück zum ganzen Satz …", fc_back:"Zurück zum ganzen Satz – sprich „{w}“ genau wie in der Fokusübung.", fc_back2:"Zurück zum ganzen Satz."});
Object.assign(T.fr,{fc_title:"Focus", fc_prop:"« {w} » n'était pas juste deux fois de suite.", fc_prop_h:"Travaillez seulement cette partie jusqu'à ce qu'elle soit juste deux fois de suite – puis retour à la phrase entière.", fc_go:"Travailler « {w} »", fc_no:"Continuer avec la phrase entière", fc_how:"Dites seulement cette partie. Quand elle est juste {n} fois de suite, vous revenez automatiquement à la phrase entière.", fc_done:"✓ « {w} » est juste – retour à la phrase entière …", fc_back:"Retour à la phrase entière – dites « {w} » comme dans l'exercice ciblé.", fc_back2:"Retour à la phrase entière."});
