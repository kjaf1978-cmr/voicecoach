/* ================= Learning goal & pacing (v3.5) =================
   Workload is counted in "units" of about 5 minutes of focused practice:
   conversation level ≈ 1.5 units (incl. typical repeats), open coach assignment ≈ 1.5 units (≈ 4–5 recorded attempts),
   articulation sound to mastery ≈ 2 units (≈ 2 series of 8 words), lesson ≈ 0.5 unit. A daily warm-up (1 unit) comes on top.
   Voice-health limits: ≤ 20 min per session (then ≥ 1 h break), ≤ 60 min per day. */
Object.assign(T.en,{
 goal_title:"Learning goal & pace", goal_desc:"Choose what you want to reach and in how many days. The app estimates the total practice time, derives how many minutes per day and how many sessions you need, and fills your daily plan accordingly.",
 goal_what:"What do you want to reach?", ga_conv:"Master all conversations ({c}, {l})", ga_coach:"Complete all training assignments", ga_art:"Master all sounds ({l})", ga_les:"Read and try all lessons", ga_tone:"Reach my voice-tone target",
 goal_when:"Within", goal_days:"{n} days", goal_custom:"other", goal_make:"Create my plan", goal_stop:"Stop goal",
 goal_est:"Estimated total: {u} units ≈ {h} h of practice.", goal_daily:"{m} min per day in {s} session(s) of ≈ {p} min + warm-up, until {d}.",
 goal_unreal:"Too much for {n} days: this would need {m} min per day, but more than 60 min of voice practice per day overloads the voice. Realistic: at least {r} days.",
 goal_light:"Light pace – you could also reach this faster.",
 goal_prog:"Progress {p} % · expected today {e} % → {s}", goal_on:"on track ✓", goal_behind:"behind – add a session today", goal_ahead:"ahead of plan ✓", goal_left:"{d} days left",
 goal_done:"🏆 Goal reached!", goal_session:"Session {i}", goal_rest:"Break of at least 1 hour between sessions – the voice needs rest.",
 goal_none:"No goal set – the daily plan uses a standard mix (about 20–25 min).", unit_min:"≈ {m} min"
});
Object.assign(T.de,{
 goal_title:"Lernziel & Tempo", goal_desc:"Wähle, was du erreichen willst und in wie vielen Tagen. Die App schätzt die gesamte Übungszeit, leitet daraus Minuten pro Tag und Anzahl der Einheiten ab und füllt deinen Tagesplan entsprechend.",
 goal_what:"Was willst du erreichen?", ga_conv:"Alle Gespräche meistern ({c}, {l})", ga_coach:"Alle Trainingsaufträge abschließen", ga_art:"Alle Laute meistern ({l})", ga_les:"Alle Lektionen lesen und ausprobieren", ga_tone:"Mein Stimmklang-Ziel erreichen",
 goal_when:"Innerhalb von", goal_days:"{n} Tagen", goal_custom:"andere", goal_make:"Plan erstellen", goal_stop:"Ziel beenden",
 goal_est:"Geschätzter Aufwand: {u} Einheiten ≈ {h} Std. Übung.", goal_daily:"{m} Min. pro Tag in {s} Einheit(en) à ≈ {p} Min. + Aufwärmen, bis {d}.",
 goal_unreal:"Zu viel für {n} Tage: Das wären {m} Min. pro Tag, aber mehr als 60 Min. Stimmtraining pro Tag überlastet die Stimme. Realistisch: mindestens {r} Tage.",
 goal_light:"Lockeres Tempo – du könntest das auch schneller erreichen.",
 goal_prog:"Fortschritt {p} % · heute erwartet {e} % → {s}", goal_on:"im Plan ✓", goal_behind:"im Rückstand – heute eine Einheit mehr", goal_ahead:"dem Plan voraus ✓", goal_left:"noch {d} Tage",
 goal_done:"🏆 Ziel erreicht!", goal_session:"Einheit {i}", goal_rest:"Zwischen den Einheiten mindestens 1 Stunde Pause – die Stimme braucht Erholung.",
 goal_none:"Kein Ziel gesetzt – der Tagesplan nutzt eine Standardmischung (etwa 20–25 Min.).", unit_min:"≈ {m} Min."
});
Object.assign(T.fr,{
 goal_title:"Objectif & rythme", goal_desc:"Choisissez ce que vous voulez atteindre et en combien de jours. L'appli estime le temps total de pratique, en déduit les minutes par jour et le nombre de séances, et remplit votre plan quotidien en conséquence.",
 goal_what:"Que voulez-vous atteindre ?", ga_conv:"Maîtriser tous les dialogues ({c}, {l})", ga_coach:"Terminer toutes les missions d'entraînement", ga_art:"Maîtriser tous les sons ({l})", ga_les:"Lire et essayer toutes les leçons", ga_tone:"Atteindre mon objectif de timbre",
 goal_when:"En", goal_days:"{n} jours", goal_custom:"autre", goal_make:"Créer mon plan", goal_stop:"Arrêter l'objectif",
 goal_est:"Estimation : {u} unités ≈ {h} h de pratique.", goal_daily:"{m} min par jour en {s} séance(s) d'environ {p} min + échauffement, jusqu'au {d}.",
 goal_unreal:"Trop pour {n} jours : il faudrait {m} min par jour, or plus de 60 min de travail vocal par jour surcharge la voix. Réaliste : au moins {r} jours.",
 goal_light:"Rythme léger – vous pourriez y arriver plus vite.",
 goal_prog:"Progression {p} % · attendu aujourd'hui {e} % → {s}", goal_on:"dans les temps ✓", goal_behind:"en retard – ajoutez une séance aujourd'hui", goal_ahead:"en avance ✓", goal_left:"encore {d} jours",
 goal_done:"🏆 Objectif atteint !", goal_session:"Séance {i}", goal_rest:"Au moins 1 heure de pause entre les séances – la voix a besoin de repos.",
 goal_none:"Aucun objectif – le plan quotidien utilise un mélange standard (environ 20–25 min).", unit_min:"≈ {m} min"
});
const UNIT_MIN=5, MAX_DAY=60, MAX_SESSION=20;
function goalWork(areas){
  const w={conv:0,coach:0,art:0,les:0,tone:0};
  if(areas.conv) SCENES.filter(sceneShown).forEach(sc=>{ const s=getConv(sc.id,SET.tl); w.conv+=(3-stepsPassed(s))*1.5; });
  if(areas.coach) coachOpen().filter(a=>a.id!=="tone").forEach(a=>{ w.coach+=a.done?0.5:Math.max(0.5,1.5*(1-(a.streak||0)/STREAK)); });
  if(areas.art) Object.keys(ART[SET.tl]).forEach(k=>{ const st=artStats(SET.tl,k); if(!st.mastered) w.art+=2*(1-st.p/100*0.7); });
  if(areas.les) LESSONS.forEach(l=>{ if(!store.lessons[l.id]) w.les+=0.5; });
  if(areas.tone&&voiceTarget()){ const a=coachStore().tone; w.tone+= a&&a.done?0:4; }
  w.total=Object.values(w).reduce((x,y)=>x+y,0); return w;
}
function goalCalc(areas,days){
  const w=goalWork(areas), perDay=w.total/Math.max(1,days), min=Math.ceil(perDay*UNIT_MIN/5)*5;
  const realistic=Math.ceil(w.total*UNIT_MIN/(MAX_DAY-UNIT_MIN));
  const sessions=Math.max(1,Math.ceil(min/MAX_SESSION)); return {w,min,sessions,per:Math.ceil(min/sessions),realistic,unreal:min+UNIT_MIN>MAX_DAY};
}
let GDRAFT=null;
function renderGoal(){
  const box=$("#goalBody"); if(!box) return; const G=store.goal;
  if(G&&!GDRAFT){ const w=goalWork(G.areas), done=Math.max(0,Math.min(1,1-w.total/Math.max(0.01,G.total))), el_=(Date.now()-G.start)/DAY, exp=Math.min(1,el_/G.days), left=Math.max(0,Math.ceil((G.end-Date.now())/DAY));
    const st=done>=1?t("goal_done"):done+0.05<exp?t("goal_behind"):done>exp+0.1?t("goal_ahead"):t("goal_on");
    box.innerHTML=`<p><b>${goalAreasTxt(G.areas)}</b></p><div class="bar"><i style="width:${Math.round(done*100)}%"></i></div>
      <p>${t("goal_prog",{p:Math.round(done*100),e:Math.round(exp*100),s:st})} · ${t("goal_left",{d:left})}</p>
      <p class="muted">${t("goal_daily",{m:G.min,s:G.sessions,p:G.per,d:new Date(G.end).toLocaleDateString(SET.ui)})}</p>
      <div class="row"><button class="b sm alt" id="goalEdit">✎ ${t("goal_make")}</button><button class="b sm alt" id="goalStop">${t("goal_stop")}</button></div>`;
    $("#goalEdit").onclick=()=>{ GDRAFT={areas:Object.assign({},G.areas),days:G.days}; renderGoal(); };
    $("#goalStop").onclick=()=>{ store.goal=null; delete store.plan[today()]; save(); renderGoal(); renderPlan(); }; return; }
  if(!G&&!GDRAFT){ box.innerHTML=`<p class="muted">${t("goal_none")}</p><button class="b" style="width:100%" data-open>🎯 ${t("goal_make")}</button>`; box.querySelector("[data-open]").onclick=()=>{ GDRAFT={areas:{conv:true,coach:true,art:false,les:false,tone:!!voiceTarget()},days:30}; renderGoal(); }; return; }
  const D=GDRAFT||(GDRAFT={areas:{conv:true,coach:true,art:false,les:false,tone:!!voiceTarget()},days:30});
  const c=goalCalc(D.areas,D.days);
  box.innerHTML=`<p><b>${t("goal_what")}</b></p><div data-areas></div>
    <p><b>${t("goal_when")}</b></p><div class="row"><div class="chips" data-days></div><input type="number" min="3" max="365" value="${D.days}" data-cd style="width:80px;font:inherit;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink)"></div>
    <div class="${c.unreal?"warnbox":"okbox"}" style="margin-top:8px">${t("goal_est",{u:f1(c.w.total),h:f1(c.w.total*UNIT_MIN/60)})}<br>
      ${c.unreal?t("goal_unreal",{n:D.days,m:c.min,r:c.realistic}):t("goal_daily",{m:c.min,s:c.sessions,p:c.per,d:new Date(Date.now()+D.days*DAY).toLocaleDateString(SET.ui)})+(c.min<10&&c.w.total>0?" "+t("goal_light"):"")}</div>
    <div class="row" style="margin-top:8px"><button class="b grow" data-make ${c.w.total<=0?"disabled":""}>${t("goal_make")}</button><button class="b alt" data-cancel>${t("cancel")}</button></div>`;
  const ar=box.querySelector("[data-areas]");
  [["conv",t("ga_conv",{c:t("ctx_"+SET.ctx),l:langIn(SET.tl)})],["coach",t("ga_coach")],["art",t("ga_art",{l:langIn(SET.tl)})],["les",t("ga_les")]].concat(voiceTarget()?[["tone",t("ga_tone")]]:[]).forEach(([k,l])=>{
    const lb=el("label",{class:"check"},`<input type="checkbox" ${D.areas[k]?"checked":""}> <span>${esc(l)}</span>`); lb.querySelector("input").onchange=e=>{ D.areas[k]=e.target.checked; renderGoal(); }; ar.append(lb); });
  chipSet(box.querySelector("[data-days]"),[[7,t("goal_days",{n:7})],[14,t("goal_days",{n:14})],[30,t("goal_days",{n:30})]],D.days,v=>{ D.days=+v; renderGoal(); });
  box.querySelector("[data-cd]").onchange=e=>{ D.days=Math.max(3,Math.min(365,+e.target.value||30)); renderGoal(); };
  if(box.querySelector("[data-cancel]")) box.querySelector("[data-cancel]").onclick=()=>{ GDRAFT=null; renderGoal(); };
  box.querySelector("[data-make]").onclick=()=>{ const days=c.unreal?Math.max(D.days,c.realistic):D.days, cc=goalCalc(D.areas,days);
    store.goal={areas:D.areas,days,start:Date.now(),end:Date.now()+days*DAY,total:cc.w.total,min:cc.min,sessions:cc.sessions,per:cc.per}; GDRAFT=null;
    delete store.plan[today()]; save(); renderGoal(); renderPlan(); toast("✓ "+t("goal_daily",{m:cc.min,s:cc.sessions,p:cc.per,d:new Date(store.goal.end).toLocaleDateString(SET.ui)})); };
}
function goalAreasTxt(a){ return [a.conv&&t("ga_conv",{c:t("ctx_"+SET.ctx),l:langIn(SET.tl)}),a.coach&&t("ga_coach"),a.art&&t("ga_art",{l:langIn(SET.tl)}),a.les&&t("ga_les"),a.tone&&t("ga_tone")].filter(Boolean).join(" · "); }
/* daily plan derived from the goal: fill each session with ≈ per-minutes of work, warm-up first */
function goalPlanItems(){
  const G=store.goal; if(!G) return null;
  const w=goalWork(G.areas), daysLeft=Math.max(1,Math.ceil((G.end-Date.now())/DAY));
  let unitsToday=Math.max(1,Math.ceil(w.total/daysLeft)); unitsToday=Math.min(unitsToday,Math.floor((MAX_DAY-UNIT_MIN)/UNIT_MIN));
  const pool=[], dayN=Math.floor(Date.now()/DAY);
  if(G.areas.tone&&voiceTarget()&&!(coachStore().tone&&coachStore().tone.done)) pool.push({k:"coach",id:"tone",u:1.5});
  if(G.areas.coach) coachOpen().filter(a=>a.id!=="tone").forEach(a=>pool.push({k:"coach",id:a.id,u:1.5}));
  if(G.areas.conv){ dueList().forEach(d=>pool.push({k:"review",id:d.sc.id,l:d.l,u:1.5})); SCENES.filter(sceneShown).forEach(sc=>{ const s=getConv(sc.id,SET.tl); if(!s.mastered) pool.push({k:"talk",id:sc.id,l:SET.tl,u:1.5}); }); }
  if(G.areas.art) Object.keys(ART[SET.tl]).filter(k=>!artStats(SET.tl,k).mastered).forEach(k=>pool.push({k:"art",snd:k,u:1}));
  if(G.areas.les) LESSONS.filter(l=>!store.lessons[l.id]).forEach(l=>pool.push({k:"lesson",id:l.id,u:0.5}));
  // interleave categories so every day mixes voice, speech and conversation
  const byK={}; pool.forEach(p=>(byK[p.k]=byK[p.k]||[]).push(p)); const order=Object.keys(byK); const mixed=[]; let added=true;
  while(added){ added=false; for(const k of order){ const x=byK[k].shift(); if(x){ mixed.push(x); added=true; } } }
  const rs=ROUTINES.map((r,i)=>[r,i]).filter(([r])=>!r.g||r.g===SET.gender); const items=[{k:"warm",r:rs[dayN%rs.length][1],s:0}]; let u=0, sess=0, su=1;
  const perSessU=Math.max(2,Math.round(MAX_SESSION/UNIT_MIN));
  for(const it of mixed){ if(u>=unitsToday) break; if(su+it.u>perSessU&&su>0){ sess++; su=0; } it.s=sess; items.push(it); u+=it.u; su+=it.u; }
  if(items.length===1) items.push({k:"diction",tw:dayN%6,s:0});
  return items;
}
