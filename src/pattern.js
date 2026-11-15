/* ================= Pattern trainer (v3.7): live pitch & pace against a target contour =================
   Template = target melody over time in semitones (st) around a centre pitch.
   From text: syllables at a target rate, declination per phrase, stress peaks (*word*), falling statement ends,
   rising question ends, continuation rise at commas/⏸, pauses. From a reference clip: its real pitch curve. */
Object.assign(T.en,{pat_title:"Melody & pace pattern", pat_desc:"Green band = target melody, grey = pauses, words below. Start speaking: the line moves at the target pace from your first sound – keep up with it and follow the curve with your voice (orange dots = your pitch, live).",
 pat_score:"Pattern match", pat_tempo:"Pace: you took {u} s, the pattern {p} s – {s}.", pat_faster:"too fast, slow down", pat_slower:"too slow, keep up with the line", pat_ok:"matches",
 pat_shape:"Melody shape: {p} % similar to the pattern.", pat_dev:"Biggest difference around “{w}”: your voice was {d} than the pattern – follow the curve there.", pat_higher:"higher", pat_lower:"lower",
 pat_level:"Pitch level: median {f} Hz, target {lo}–{hi} Hz.", pat_text:"Text", pat_ref:"Pattern from your reference clip", pat_center:"0 = {f} Hz"});
Object.assign(T.de,{pat_title:"Melodie- & Tempomuster", pat_desc:"Grünes Band = Ziel-Melodie, grau = Pausen, Wörter darunter. Fang an zu sprechen: Die Linie läuft ab deinem ersten Laut im Zieltempo – halte Schritt und folge der Kurve mit deiner Stimme (orange Punkte = deine Tonhöhe, live).",
 pat_score:"Musterübereinstimmung", pat_tempo:"Tempo: du hast {u} s gebraucht, das Muster {p} s – {s}.", pat_faster:"zu schnell, langsamer sprechen", pat_slower:"zu langsam, mit der Linie Schritt halten", pat_ok:"passt",
 pat_shape:"Melodieform: {p} % ähnlich zum Muster.", pat_dev:"Größte Abweichung bei „{w}“: deine Stimme war {d} als das Muster – folge dort der Kurve.", pat_higher:"höher", pat_lower:"tiefer",
 pat_level:"Tonlage: Median {f} Hz, Ziel {lo}–{hi} Hz.", pat_text:"Text", pat_ref:"Muster aus deiner Referenzaufnahme", pat_center:"0 = {f} Hz"});
Object.assign(T.fr,{pat_title:"Modèle de mélodie & de débit", pat_desc:"Bande verte = mélodie cible, gris = pauses, mots en dessous. Commencez à parler : la ligne avance au débit cible dès votre premier son – suivez-la et suivez la courbe avec votre voix (points orange = votre hauteur, en direct).",
 pat_score:"Correspondance au modèle", pat_tempo:"Débit : vous avez mis {u} s, le modèle {p} s – {s}.", pat_faster:"trop rapide, ralentissez", pat_slower:"trop lent, suivez la ligne", pat_ok:"correspond",
 pat_shape:"Forme mélodique : {p} % de ressemblance avec le modèle.", pat_dev:"Plus grand écart vers « {w} » : votre voix était plus {d} que le modèle – suivez la courbe à cet endroit.", pat_higher:"aiguë", pat_lower:"grave",
 pat_level:"Hauteur : médiane {f} Hz, cible {lo}–{hi} Hz.", pat_text:"Texte", pat_ref:"Modèle tiré de votre extrait de référence", pat_center:"0 = {f} Hz"});

function textTemplate(text,lang,rate,amp){
  amp=amp||(SET.gender==="f"?1.25:SET.gender==="m"?0.9:1);
  const toks=text.split(/\s+/).filter(Boolean), syl=[], words=[], pauses=[]; let t=0, phrase=[];
  const flush=type=>{ const n=phrase.length; phrase.forEach((s,i)=>{ let st=1.5-2.5*(i/Math.max(1,n-1)); if(s.stress) st+=4;
      if(i===n-1){ if(type==="?") st+=5; else if(type===",") st+=1; else st-=2.5; } s.st=st*amp; }); phrase=[]; };
  toks.forEach(tok=>{
    if(tok==="/"){ flush(","); pauses.push({s:t,e:t+0.8}); t+=0.8; return; }
    if(/^[–—-]$/.test(tok)){ flush(","); pauses.push({s:t,e:t+0.3}); t+=0.3; return; }
    const stress=tok.includes("*"), w=tok.replace(/\*/g,""), clean=w.replace(/[^\p{L}\p{N}'’-]/gu,""); if(!clean) return;
    const n=Math.max(1,sylCount(clean,lang)); words.push({t,w:clean});
    for(let k=0;k<n;k++){ const s={t0:t,t1:t+1/rate,stress:stress&&k===0}; syl.push(s); phrase.push(s); t+=1/rate; }
    const pm=w.match(/[.!?,;:]$/);
    if(pm){ const ty=pm[0]==="?"?"?":/[,;:]/.test(pm[0])?",":"."; flush(ty); const pd=ty===","?0.3:0.6; pauses.push({s:t,e:t+pd}); t+=pd; }
  });
  flush(".");
  let end=t; while(pauses.length&&Math.abs(pauses[pauses.length-1].e-end)<1e-6){ end=pauses.pop().s; }
  const pts=[]; syl.forEach(s=>{ const d=s.t1-s.t0; pts.push({t:s.t0+d*0.15,st:s.st},{t:s.t0+d*0.5,st:s.st},{t:s.t0+d*0.85,st:s.st}); });
  return {dur:end,pts,words,pauses,src:"text"};
}
function clipTemplate(an){
  if(!an||!an.ok) return null; const S=an.series, med=an.f0med, pts=[];
  S.f0.forEach((f,k)=>{ const tt=k*S.hop-an.first; if(f>0&&tt>=0&&tt<=an.total) pts.push({t:tt,st:12*Math.log2(f/med)}); });
  return {dur:an.total,pts,words:[],pauses:(an.pauses||[]).map(p=>({s:p.s-an.first,e:p.e-an.first})),src:"clip"};
}
function tplAt(tpl,tt){ const P=tpl.pts; let best=null,bd=1e9; for(const p of P){ const d=Math.abs(p.t-tt); if(d<bd){ bd=d; best=p; } } return bd<0.25?best.st:null; }
function patternCenter(){ const vt=voiceTarget(); if(vt) return Math.round(Math.sqrt(vt.lo*vt.hi)); return SET.natF0||(store.profile&&store.profile.f0)||(SET.gender==="f"?200:SET.gender==="m"?115:150); }

/* panel: canvas + live drawing + evaluation */
function patternPanel(box,tpl,{center=patternCenter(),band=voiceTarget(),relative=false}={}){
  box.innerHTML=`<div class="muted" style="font-size:.8rem">${t("pat_desc")}</div><canvas height="190" style="margin-top:4px"></canvas>`;
  const cv=box.querySelector("canvas"), P={tpl,center,band,live:[],onset:null,user:null,relative,ownMed:null};
  const draw=(cursor)=>{
    const dpr=window.devicePixelRatio||1, W=cv.clientWidth*dpr, H=190*dpr; if(!W) return; if(cv.width!==W){ cv.width=W; cv.height=H; }
    const g=cv.getContext("2d"); g.clearRect(0,0,W,H);
    const maxT=Math.max(tpl.dur+0.6, P.user?P.user.dur+0.3:0, P.live.length?P.live[P.live.length-1].t+0.3:0);
    const X=tt=>8*dpr+tt/maxT*(W-16*dpr), lab=24*dpr, Y=st=>(H-lab)/2-st/12*((H-lab)/2-6*dpr);
    g.font=(10*dpr)+"px system-ui";
    tpl.pauses.forEach(p=>{ g.fillStyle="rgba(120,120,120,.15)"; g.fillRect(X(p.s),0,X(p.e)-X(p.s),H-lab); });
    if(band&&!relative){ g.fillStyle="rgba(47,138,77,.07)"; const y1=Y(12*Math.log2(band.hi/center)), y2=Y(12*Math.log2(band.lo/center)); g.fillRect(0,y1,W,y2-y1); }
    g.strokeStyle=cssv("--line"); g.setLineDash([4*dpr,4*dpr]); g.beginPath(); g.moveTo(0,Y(0)); g.lineTo(W,Y(0)); g.stroke(); g.setLineDash([]);
    g.fillStyle=cssv("--muted"); { const lb=relative?"0":t("pat_center",{f:center}); g.fillText(lb,W-g.measureText(lb).width-4*dpr,12*dpr); }
    // target ribbon
    g.strokeStyle="rgba(47,138,77,.35)"; g.lineWidth=10*dpr; g.lineCap="round"; g.lineJoin="round";
    let prev=null; g.beginPath(); tpl.pts.forEach(p=>{ if(prev&&p.t-prev.t>0.3){ g.stroke(); g.beginPath(); g.moveTo(X(p.t),Y(p.st)); } else if(!prev) g.moveTo(X(p.t),Y(p.st)); else g.lineTo(X(p.t),Y(p.st)); prev=p; }); g.stroke();
    g.lineWidth=1; g.fillStyle=cssv("--ink"); let lastEnd=[-1e9,-1e9]; tpl.words.forEach(w=>{ const x=X(w.t), wd=g.measureText(w.w).width+4*dpr, row=x>lastEnd[0]?0:(x>lastEnd[1]?1:0); g.fillText(w.w,x,H-(row?2:10)*dpr); lastEnd[row]=x+wd; });
    // user (after recording) and live dots
    const rel=f=>12*Math.log2(f/(relative?(P.ownMed||center):center));
    g.fillStyle=cssv("--accent2");
    if(P.user) P.user.pts.forEach(p=>{ g.beginPath(); g.arc(X(p.t),Y(p.st),2*dpr,0,7); g.fill(); });
    else P.live.forEach(p=>{ if(p.f>0){ g.beginPath(); g.arc(X(p.t),Y(rel(p.f)),2.2*dpr,0,7); g.fill(); } });
    if(cursor!=null){ g.strokeStyle=cssv("--ink"); g.lineWidth=2*dpr; g.beginPath(); g.moveTo(X(cursor),0); g.lineTo(X(cursor),H-lab); g.stroke(); g.lineWidth=1; }
  };
  requestAnimationFrame(()=>draw(null));
  return {
    reset(){ P.live=[]; P.onset=null; P.user=null; P.ownMed=null; draw(null); },
    pushAt(f,tt){ P.live.push({t:tt,f}); draw(Math.min(tt,tpl.dur+0.5)); },
    onPitch(f,sec,db){ if(P.onset===null){ if(f>0&&db>-55) P.onset=sec; else return; } const tt=sec-P.onset; P.live.push({t:tt,f});
      if(relative&&!P.ownMed){ const v=P.live.filter(x=>x.f>0).map(x=>x.f); if(v.length>25) P.ownMed=pctl(v,0.5); } draw(Math.min(tt,tpl.dur+0.5)); },
    evaluate(an){
      if(!an||!an.ok) return null; const S=an.series, base=relative?an.f0med:center, pts=[];
      S.f0.forEach((f,k)=>{ const tt=k*S.hop-an.first; if(f>0&&tt>=0) pts.push({t:tt,st:12*Math.log2(f/base)}); });
      P.user={dur:an.total,pts}; draw(null);
      const ratio=an.total/Math.max(0.5,tpl.dur), tempo=Math.max(0,1-Math.abs(ratio-1)*2.5);
      // shape: compare mean-normalised curves on a normalised time axis
      const N=60, a=[], b=[], at=[];
      for(let i=0;i<N;i++){ const x=i/(N-1), tv=tplAt(tpl,x*tpl.dur); let uv=null,bd=1e9; for(const p of pts){ const d=Math.abs(p.t-x*an.total); if(d<bd){ bd=d; uv=p.st; } } if(tv!=null&&uv!=null&&bd<0.15){ a.push(tv); b.push(uv); at.push(x*tpl.dur); } }
      let shape=0, dev=null;
      if(a.length>=10){ const ma=a.reduce((x,y)=>x+y,0)/a.length, mb=b.reduce((x,y)=>x+y,0)/b.length; let sab=0,saa=0,sbb=0,mx=0;
        a.forEach((v,i)=>{ const da=v-ma, db_=b[i]-mb; sab+=da*db_; saa+=da*da; sbb+=db_*db_; const d=db_-da; if(Math.abs(d)>Math.abs(mx)){ mx=d; dev={t:at[i],d}; } });
        shape=Math.max(0,sab/Math.sqrt(saa*sbb+1e-9)); }
      let level=null; if(band&&!relative){ const f=an.f0med; level=f>=band.lo&&f<=band.hi?1:Math.max(0,1-Math.min(Math.abs(f-band.lo),Math.abs(f-band.hi))/((band.hi-band.lo)/2)); }
      const parts=[tempo,shape].concat(level!=null?[level]:[]), score=Math.round(100*parts.reduce((x,y)=>x+y,0)/parts.length);
      const lines=[t("pat_tempo",{u:f1(an.total),p:f1(tpl.dur),s:ratio<0.88?t("pat_faster"):ratio>1.12?t("pat_slower"):t("pat_ok")}),t("pat_shape",{p:Math.round(shape*100)})];
      let devWord=null;
      if(dev&&Math.abs(dev.d)>2.5){ let wi=-1; tpl.words.forEach((x,i)=>{ if(x.t<=dev.t) wi=i; }); if(wi>=0){ const sp=wordSpan(tpl,wi); devWord=Object.assign(sp,{d:dev.d}); lines.push(t("pat_dev",{w:sp.w,d:t(dev.d>0?"pat_higher":"pat_lower")})); } }
      if(level!=null) lines.push(t("pat_level",{f:Math.round(an.f0med),lo:band.lo,hi:band.hi}));
      return {score,tempo,shape,level,lines,ratio,devWord,ctx:{tpl,center,relative,ownMed:an.f0med}};
    }
  };
}
function patternResultHtml(res){ if(!res) return ""; return `<div class="card flat" style="margin-top:8px"><b>📈 ${t("pat_score")}: ${res.score} %</b><ul class="list">${res.lines.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`; }

/* standalone pattern trainer in the voice-tone card */
let PT={i:0};
function renderPatternTrainer(){
  const box=$("#patBody"); if(!box) return; const l=SET.tl, texts=CT.statements[l].concat(CT.melody[l],CT.endings[l]), text=texts[PT.i%texts.length];
  box.innerHTML=`<div class="card flat reader" ${tlAttr(l)} style="font-size:1.15rem">${markupText(text)}</div><div class="row"><button class="b sm alt" data-n>↻ ${t("coach_other")}</button></div><div data-p style="margin-top:6px"></div><div data-r></div><div data-o></div>`;
  box.querySelector("[data-n]").onclick=()=>{ PT.i++; renderPatternTrainer(); };
  const tpl=textTemplate(text,l,4.0), pan=patternPanel(box.querySelector("[data-p]"),tpl);
  recControls(box.querySelector("[data-r]"),{lang:srLang(),maxSec:30,onStart:()=>pan.reset(),onPitch:(f,s,db)=>pan.onPitch(f,s,db),onDone:r=>{
    const an=analyze(r.pcm), res=pan.evaluate(an), tips=makeTips(an,{sr:r.sr.text?r.sr:null,expected:plainText(text)});
    const take={blob:r.blob,an,tips,score:res?res.score:null,kind:"pattern",title:t("pat_title"),lang:l};
    const o=box.querySelector("[data-o]"); o.innerHTML="";
    if(res) o.append(patternResultBox(res,dw=>wordDrill(o,Object.assign({dw,lang:l,onBack:()=>renderPatternTrainer()},res.ctx))));
    o.append(replayView(take,{onSave:()=>saveTake(take)})); logSession(t("pat_title"),0.5); }});
}

/* ================= v3.8: focused word training from the biggest deviation ================= */
Object.assign(T.en,{wd_train:"🎯 Practise “{w}”", wd_title:"Practise “{w}”", wd_how_up:"You said “{w}” too low. Say only this word and let your voice rise to the green curve.", wd_how_down:"You said “{w}” too high. Say only this word and let your voice settle down onto the green curve.",
 wd_goal:"Goal: on the curve (± 1.5 semitones) {n}× in a row.", wd_res:"Your pitch on “{w}”: {d} semitone(s) {dir} the target.", wd_above:"above", wd_below:"below", wd_ok:"✓ On the curve", wd_up:"↑ A little higher", wd_down:"↓ A little lower", wd_slope:"Follow the direction of the curve within the word (rising / falling).",
 wd_model:"🔊 Listen", wd_back:"↩ Back to the full sentence", wd_done:"✓ “{w}” is right now – go back and say the whole sentence with the same tone.", wd_streak:"{a} of {n} in a row", wd_none:"No voice detected – say the word clearly."});
Object.assign(T.de,{wd_train:"🎯 „{w}“ üben", wd_title:"„{w}“ üben", wd_how_up:"Du hast „{w}“ zu tief gesprochen. Sprich nur dieses Wort und lass die Stimme hoch zur grünen Kurve gehen.", wd_how_down:"Du hast „{w}“ zu hoch gesprochen. Sprich nur dieses Wort und lass die Stimme auf die grüne Kurve sinken.",
 wd_goal:"Ziel: auf der Kurve (± 1,5 Halbtöne), {n}-mal hintereinander.", wd_res:"Deine Tonhöhe bei „{w}“: {d} Halbton/-töne {dir} dem Ziel.", wd_above:"über", wd_below:"unter", wd_ok:"✓ Auf der Kurve", wd_up:"↑ Etwas höher", wd_down:"↓ Etwas tiefer", wd_slope:"Folge der Richtung der Kurve innerhalb des Wortes (steigend / fallend).",
 wd_model:"🔊 Anhören", wd_back:"↩ Zurück zum ganzen Satz", wd_done:"✓ „{w}“ sitzt jetzt – geh zurück und sprich den ganzen Satz mit derselben Tonhöhe.", wd_streak:"{a} von {n} hintereinander", wd_none:"Keine Stimme erkannt – sprich das Wort deutlich."});
Object.assign(T.fr,{wd_train:"🎯 Travailler « {w} »", wd_title:"Travailler « {w} »", wd_how_up:"Vous avez dit « {w} » trop grave. Dites seulement ce mot et faites monter la voix jusqu'à la courbe verte.", wd_how_down:"Vous avez dit « {w} » trop aigu. Dites seulement ce mot et laissez la voix descendre sur la courbe verte.",
 wd_goal:"Objectif : sur la courbe (± 1,5 demi-ton), {n} fois de suite.", wd_res:"Votre hauteur sur « {w} » : {d} demi-ton(s) {dir} de la cible.", wd_above:"au-dessus", wd_below:"en dessous", wd_ok:"✓ Sur la courbe", wd_up:"↑ Un peu plus haut", wd_down:"↓ Un peu plus bas", wd_slope:"Suivez la direction de la courbe dans le mot (montante / descendante).",
 wd_model:"🔊 Écouter", wd_back:"↩ Retour à la phrase entière", wd_done:"✓ « {w} » est juste maintenant – revenez à la phrase entière avec la même hauteur.", wd_streak:"{a} sur {n} de suite", wd_none:"Aucune voix détectée – dites le mot clairement."});
const WD_STREAK=3, WD_TOL=1.5;
/* word span inside a text template */
function wordSpan(tpl,idx){ const w=tpl.words[idx], nx=tpl.words[idx+1]; let t1=nx?nx.t:tpl.dur; tpl.pauses.forEach(p=>{ if(p.s>w.t&&p.s<t1) t1=p.s; }); return {w:w.w,t0:w.t,t1}; }
/* box with the pattern result + "practise this word" button */
function patternResultBox(res,onWord){
  const box=el("div",{},patternResultHtml(res));
  if(res&&res.devWord&&onWord){ const b=el("button",{class:"b warm",style:"width:100%;margin-top:6px"},t("wd_train",{w:res.devWord.w})); b.onclick=()=>onWord(res.devWord); box.append(b); }
  return box;
}
function wordDrill(box,{dw,tpl,center,relative,ownMed,lang,onBack}){
  const sub={dur:Math.max(0.3,dw.t1-dw.t0),pts:tpl.pts.filter(p=>p.t>=dw.t0-0.01&&p.t<=dw.t1+0.01).map(p=>({t:p.t-dw.t0,st:p.st})),words:[{t:0,w:dw.w}],pauses:[],src:"word"};
  const tMean=sub.pts.reduce((a,p)=>a+p.st,0)/Math.max(1,sub.pts.length), tSlope=sub.pts.length>1?sub.pts[sub.pts.length-1].st-sub.pts[0].st:0;
  const base=relative?(ownMed||center):center; let streak=0;
  const render=(msg)=>{
    box.innerHTML=`<div class="card" style="border:2px solid var(--accent2);margin-top:8px"><div class="row"><h3 class="grow" style="margin:0">🎯 ${esc(t("wd_title",{w:dw.w}))}</h3><button class="b sm alt" data-back>${t("wd_back")}</button></div>
      <p>${esc(t(dw.d<0?"wd_how_up":"wd_how_down",{w:dw.w}))}</p><p class="muted">${t("wd_goal",{n:WD_STREAK})}</p>
      <div class="row"><span class="dots big">${[...Array(WD_STREAK)].map((_,k)=>`<i class="${k<streak?'on':''}"></i>`).join("")}</span><span class="muted">${t("wd_streak",{a:streak,n:WD_STREAK})}</span></div>
      <div class="huge" ${tlAttr(lang)} style="font-size:2.4rem;padding:8px">${esc(dw.w)}</div>
      <button class="b sm alt" data-model>${t("wd_model")}</button>
      <div data-p style="margin-top:6px"></div><div data-r></div><div data-m>${msg||""}</div></div>`;
    box.querySelector("[data-back]").onclick=()=>onBack&&onBack();
    box.querySelector("[data-model]").onclick=()=>speak(dw.w,lang,null,0.75,"model",Math.pow(2,tMean/24));
    const pan=patternPanel(box.querySelector("[data-p]"),sub,{center:base,band:null,relative:false});
    recControls(box.querySelector("[data-r]"),{maxSec:8,onStart:()=>pan.reset(),onPitch:(f,s,db)=>pan.onPitch(f,s,db),onDone:r=>{
      const an=analyze(r.pcm,{minSpeech:15}); if(!an.ok||!an.f0med){ render(`<div class="warnbox">${t("wd_none")}</div>`); return; }
      pan.evaluate(an);
      const S=an.series, v=[]; S.f0.forEach((f,k)=>{ if(f>0) v.push({t:k*S.hop,st:12*Math.log2(f/base)}); });
      const uMean=v.reduce((a,p)=>a+p.st,0)/v.length, diff=uMean-tMean;
      const uSlope=v.length>4?(v.slice(-3).reduce((a,p)=>a+p.st,0)/3)-(v.slice(0,3).reduce((a,p)=>a+p.st,0)/3):0;
      const slopeOk=Math.abs(tSlope)<2||Math.sign(uSlope)===Math.sign(tSlope);
      const ok=Math.abs(diff)<=WD_TOL&&slopeOk; streak=ok?streak+1:0; beep(ok?990:520,.12,.1);
      let m=`<div class="${ok?"okbox":"warnbox"}" style="margin-top:6px"><b>${ok?t("wd_ok"):diff<0?t("wd_up"):t("wd_down")}</b> – ${esc(t("wd_res",{w:dw.w,d:f1(Math.abs(diff)),dir:t(diff<0?"wd_below":"wd_above")}))}${slopeOk?"":"<br>"+t("wd_slope")}</div>`;
      if(streak>=WD_STREAK){ m+=`<div class="okbox" style="margin-top:6px;font-size:1.05rem">🏆 ${esc(t("wd_done",{w:dw.w}))}</div>`; logSession(t("wd_title",{w:dw.w}),1); }
      render(m);
      if(streak>=WD_STREAK){ const bb=el("button",{class:"b",style:"width:100%;margin-top:6px"},t("wd_back")); bb.onclick=()=>onBack&&onBack(); box.querySelector("[data-m]").append(bb); }
    }});
  };
  render(); box.scrollIntoView({behavior:"smooth",block:"start"});
}
