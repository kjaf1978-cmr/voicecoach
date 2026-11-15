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
      if(dev&&Math.abs(dev.d)>2.5){ const w=tpl.words.slice().reverse().find(x=>x.t<=dev.t); if(w) lines.push(t("pat_dev",{w:w.w,d:t(dev.d>0?"pat_higher":"pat_lower")})); }
      if(level!=null) lines.push(t("pat_level",{f:Math.round(an.f0med),lo:band.lo,hi:band.hi}));
      return {score,tempo,shape,level,lines,ratio};
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
    const o=box.querySelector("[data-o]"); o.innerHTML=""; o.append(replayView(take,{onSave:()=>saveTake(take),extra:patternResultHtml(res)})); logSession(t("pat_title"),0.5); }});
}
