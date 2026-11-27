/* ================= v6.1: Camera coach – automatic video evaluation (MediaPipe Face Mesh + Pose, on-device) ================= */
const VIS={state:"idle",fm:null,ps:null,run:null,hist:null};
function visStore(){ if(!store.vis) store.vis={hist:[]}; return store.vis; }
const visBase=()=>{ try{ return new URL("mp/",location.href).href; }catch(e){ return "mp/"; } };
function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=()=>rej(new Error("load "+src)); document.head.append(s); }); }
async function visLoad(onProg){
  if(VIS.state==="ready") return true; if(VIS.state==="loading") { while(VIS.state==="loading") await new Promise(r=>setTimeout(r,200)); return VIS.state==="ready"; }
  VIS.state="loading"; const base=visBase();
  try{ onProg&&onProg(t("vs_load1")); if(typeof FaceMesh==="undefined") await loadScript(base+"face_mesh.js"); if(typeof Pose==="undefined") await loadScript(base+"pose.js");
    const fm=new FaceMesh({locateFile:f=>base+f}); fm.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:.5,minTrackingConfidence:.5}); fm.onResults(r=>{ VIS._f=r; });
    onProg&&onProg(t("vs_load2")); await Promise.race([fm.initialize(),new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),120000))]);
    const ps=new Pose({locateFile:f=>base+f}); ps.setOptions({modelComplexity:0,smoothLandmarks:true,enableSegmentation:false,minDetectionConfidence:.5,minTrackingConfidence:.5}); ps.onResults(r=>{ VIS._p=r; });
    onProg&&onProg(t("vs_load3")); await Promise.race([ps.initialize(),new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),120000))]);
    VIS.fm=fm; VIS.ps=ps; VIS.state="ready"; return true;
  }catch(e){ console.warn("vision models",e); VIS.state="fail"; return false; } }

/* ---------- features per frame ---------- */
const P3=(L,i,W,H)=>[L[i].x*W,L[i].y*H,(L[i].z||0)*W];
const dist2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function faceFeat(L,W,H){
  const p=i=>P3(L,i,W,H), eL=p(33), eR=p(263), eD=dist2(eL,eR)||1, top=p(10), chin=p(152), fH=dist2(top,chin)||1;
  const yaw=Math.atan2(eR[2]-eL[2],eR[0]-eL[0])*57.3, pitch=Math.atan2(chin[2]-top[2],chin[1]-top[1])*57.3, roll=Math.atan2(eR[1]-eL[1],eR[0]-eL[0])*57.3;
  let gh=0,gv=0; if(L.length>=478){ const i1=p(468), i2=p(473), a=p(33), b=p(133), c=p(362), d=p(263), u1=p(159), l1=p(145), u2=p(386), l2=p(374);
    gh=(((i1[0]-a[0])/((b[0]-a[0])||1))+((i2[0]-c[0])/((d[0]-c[0])||1)))/2-0.5; gv=(((i1[1]-u1[1])/((l1[1]-u1[1])||1))+((i2[1]-u2[1])/((l2[1]-u2[1])||1)))/2-0.5; }
  const mo=dist2(p(13),p(14))/fH, mw=dist2(p(61),p(291))/eD, lift=(((p(61)[1]+p(291)[1])/2)-((p(13)[1]+p(14)[1])/2))/fH;
  const ear=(dist2(p(159),p(145))+dist2(p(386),p(374)))/2/eD, brow=(dist2(p(105),p(159))+dist2(p(334),p(386)))/2/fH;
  let x0=1,x1=0,y0=1,y1=0; for(const q of L){ if(q.x<x0)x0=q.x; if(q.x>x1)x1=q.x; if(q.y<y0)y0=q.y; if(q.y>y1)y1=q.y; }
  return {yaw,pitch,roll,gh,gv,mo,mw,lift,ear,brow,nose:[L[1].x,L[1].y],fw:x1-x0,box:[x0,y0,x1,y1],eyeY:(L[33].y+L[263].y)/2,cx:(x0+x1)/2};
}
function poseFeat(L){ const v=i=>L[i]&&(L[i].visibility==null||L[i].visibility>0.5)&&L[i].x>-0.05&&L[i].x<1.05&&L[i].y>-0.05&&L[i].y<1.05;
  if(!v(11)||!v(12)) return null; const a=L[11], b=L[12], shW=Math.hypot(a.x-b.x,a.y-b.y)||0.01, mid=[(a.x+b.x)/2,(a.y+b.y)/2];
  const o={shW,mid,roll:Math.atan2(a.y-b.y,a.x-b.x)*57.3,neck:v(0)?(mid[1]-L[0].y)/shW:null,ears:v(7)&&v(8)?(mid[1]-(L[7].y+L[8].y)/2)/shW:null,w:[]};
  if(Math.abs(o.roll)>90) o.roll=o.roll>0?o.roll-180:o.roll+180;
  [[15,11],[16,12]].forEach(([wi,si])=>{ if(!v(wi)){ o.w.push(null); return; } const w=L[wi]; const inBox=w.y>mid[1]-0.35*shW&&w.y<mid[1]+2.3*shW&&Math.abs(w.x-mid[0])<1.9*shW; const touch=v(0)&&Math.hypot(w.x-L[0].x,w.y-L[0].y)<0.55*shW; o.w.push({x:w.x,y:w.y,inBox,touch,cross:(w.x-mid[0])*(L[si].x-mid[0])<0&&w.y>mid[1]&&w.y<mid[1]+1.6*shW}); });
  o.crossed=!!(o.w[0]&&o.w[1]&&o.w[0].cross&&o.w[1].cross); return o; }
function frameLight(video,box){ try{ const c=VIS._cv||(VIS._cv=document.createElement("canvas")); c.width=48; c.height=36; const x=c.getContext("2d",{willReadFrequently:true}); x.drawImage(video,0,0,48,36); const d=x.getImageData(0,0,48,36).data;
    let fs=0,fn=0,bs=0,bn=0; for(let j=0;j<36;j++) for(let i=0;i<48;i++){ const k=(j*48+i)*4, l=0.299*d[k]+0.587*d[k+1]+0.114*d[k+2], fx=i/48, fy=j/36; if(box&&fx>box[0]&&fx<box[2]&&fy>box[1]&&fy<box[3]){ fs+=l; fn++; } else { bs+=l; bn++; } }
    return {face:fn?fs/fn:null,bg:bn?bs/bn:null}; }catch(e){ return null; } }

/* ---------- tracking loop ---------- */
function visTrack(video,{onSample,clock}){ let on=true, k=0; const samples=[];
  (async()=>{ while(on){ const t0=performance.now(); if(video.readyState>=2&&video.videoWidth){ const W=video.videoWidth,H=video.videoHeight, t=clock();
      let f=null,p=null; try{ VIS._f=null; await VIS.fm.send({image:video}); const r=VIS._f; if(r&&r.multiFaceLandmarks&&r.multiFaceLandmarks[0]) f=faceFeat(r.multiFaceLandmarks[0],W,H); }catch(e){}
      if(k%2===0){ try{ VIS._p=null; await VIS.ps.send({image:video}); const r=VIS._p; if(r&&r.poseLandmarks) p=poseFeat(r.poseLandmarks); }catch(e){} }
      const s={t,f,p:k%2===0?p:undefined,l:k%5===0?frameLight(video,f&&f.box):null}; samples.push(s); onSample&&onSample(s); k++; }
    const dt=performance.now()-t0; await new Promise(r=>setTimeout(r,Math.max(10,110-dt))); } })();
  return {stop:()=>{ on=false; return samples; },samples}; }
const eyeOK=f=>f&&Math.abs(f.yaw)<15&&Math.abs(f.pitch)<22&&Math.abs(f.gh)<0.14&&Math.abs(f.gv)<0.25;

/* ---------- profiles ---------- */
const VIS_PROF={
 pres:{eye:70,smile:15,hands:[50,100],act:[0.15,1.3],w:{eye:1.2,post:1,expr:.8,gest:1,art:1,voice:1.2,frame:.5}},
 small:{eye:60,smile:30,hands:[15,100],act:[0.08,1.0],w:{eye:1,post:.8,expr:1.3,gest:.6,art:.9,voice:1,frame:.4}},
 iv:{eye:65,smile:20,hands:[15,100],act:[0.06,0.9],w:{eye:1.2,post:1.1,expr:1,gest:.7,art:1,voice:1.1,frame:.6}},
 call:{eye:70,smile:20,hands:[0,100],act:[0,0.9],w:{eye:1.3,post:.9,expr:1,gest:.3,art:1,voice:1,frame:1.2}}};
const pct=(a,f)=>a.length?100*a.filter(f).length/a.length:0;
const med=a=>{ if(!a.length) return null; const s=a.slice().sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; };
const sd=a=>{ if(a.length<2) return 0; const m=a.reduce((x,y)=>x+y,0)/a.length; return Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/a.length); };
const cl=x=>Math.max(0,Math.min(1,x));

/* ---------- evaluation ---------- */
function visEvaluate(S,{pcm=null,sr=null,dur=0,prof="pres",expected=null,listenUntil=null,only=null}={}){
  const P=VIS_PROF[prof]||VIS_PROF.pres, M={}, C={}, ev=[], tips=[];
  // speaking state from audio
  let db=null, thr=null; if(pcm){ db=frameDb(pcm); thr=pctl(db,0.1)+12; }
  const speak=t=>db?(db[Math.min(db.length-1,Math.max(0,Math.round(t*100)))]>thr):true;
  const F=S.filter(s=>s.f), Fs=F.filter(s=>speak(s.t)&&(listenUntil==null||s.t>listenUntil)), Fl=listenUntil!=null?F.filter(s=>s.t<=listenUntil):[], Pp=S.filter(s=>s.p);
  M.facePct=S.length?100*F.length/S.length:0;
  // eye contact
  const eyeSet=listenUntil!=null?F:F; M.eye=pct(eyeSet,s=>eyeOK(s.f)); C.eye=F.length>5?cl(M.eye/P.eye):null;
  { let st=null; S.forEach(s=>{ const ok=s.f&&eyeOK(s.f); if(!ok&&st==null) st=s.t; if(ok&&st!=null){ if(s.t-st>=3) ev.push({t:st,k:"look",d:s.t-st}); st=null; } }); }
  // expression: smile, expressiveness, blinks, nods
  if(F.length>5){ const mw=F.map(s=>s.f.mw), lift=F.map(s=>s.f.lift), b0=pctl(mw,0.2), l0=pctl(lift,0.8); const isSm=f=>f.mw>b0*1.08&&f.lift<l0-0.004; M.smile=pct(F,s=>isSm(s.f));
    const first=F.filter(s=>s.t<5), last=F.filter(s=>s.t>(dur||F[F.length-1].t)-5); M.smileStart=pct(first,s=>isSm(s.f)); M.smileEnd=pct(last,s=>isSm(s.f));
    M.expr=sd(F.map(s=>s.f.brow))*100+sd(F.map(s=>s.f.mw))*10; const ears=F.map(s=>s.f.ear), e0=med(ears); let bl=0,inB=false; F.forEach(s=>{ const c=s.f.ear<e0*0.55; if(c&&!inB) bl++; inB=c; }); const tt=(F[F.length-1].t-F[0].t)||1; M.blinks=Math.round(bl/tt*60);
    let nods=0, prev=null, dir=0, amp=0; (Fl.length?Fl:F).forEach(s=>{ const pi=s.f.pitch; if(prev!=null){ const d=pi-prev; if(Math.sign(d)!==dir&&Math.abs(d)>0.3){ if(amp>4) nods+=0.5; amp=0; dir=Math.sign(d); } amp+=Math.abs(d); } prev=pi; }); M.nods=Math.round(nods);
    const smS=cl(M.smile/P.smile), exS=cl(M.expr/3), blS=M.blinks<=30?1:cl(1-(M.blinks-30)/30);
    C.expr=Fl.length?cl(0.4*smS+0.3*cl(M.nods/Math.max(1,(Fl[Fl.length-1].t-Fl[0].t)/12))+0.3*eyeSetScore(Fl,P)):cl(0.5*smS+0.3*exS+0.2*blS); }
  function eyeSetScore(A,P){ return cl(pct(A,s=>eyeOK(s.f))/P.eye); }
  // posture
  if(Pp.length>6){ const n=Pp.length, a=Pp.slice(0,Math.max(3,Math.floor(n/4))), z=Pp.slice(-Math.max(3,Math.floor(n/3)));
    M.roll=med(Pp.map(s=>Math.abs(s.p.roll))); const nk=x=>med(x.map(s=>s.p.neck).filter(v=>v!=null)); const n0=nk(a), n1=nk(z); M.neckDrop=n0&&n1?Math.round(100*(n0-n1)/n0):0;
    const er=x=>med(x.map(s=>s.p.ears).filter(v=>v!=null)); const e0=er(a), e1=er(z); M.shRaise=e0&&e1?Math.round(100*(e0-e1)/e0):0;
    M.sway=sd(Pp.map(s=>s.p.mid[0]/s.p.shW))*100;
    C.post=cl(0.35*cl(1-(M.roll-3)/8)+0.35*cl(1-(M.neckDrop-8)/20)+0.15*cl(1-(M.shRaise-8)/20)+0.15*cl(1-(M.sway-8)/20));
    let st=null; Pp.forEach(s=>{ const bad=n0&&s.p.neck!=null&&s.p.neck<n0*0.85; if(bad&&st==null) st=s.t; if(!bad&&st!=null){ if(s.t-st>=3) ev.push({t:st,k:"slump",d:s.t-st}); st=null; } });
  // gestures
    const wv=Pp.map(s=>s.p.w.some(w=>w&&w.inBox)); M.hands=100*wv.filter(Boolean).length/n; M.touch=pct(Pp,s=>s.p.w.some(w=>w&&w.touch)); M.crossed=pct(Pp,s=>s.p.crossed);
    let sp=[], prevS=null; Pp.forEach(s=>{ if(prevS){ const dt=s.t-prevS.t; [0,1].forEach(i=>{ const A=prevS.p.w[i], B=s.p.w[i]; if(A&&B&&A.inBox&&B.inBox&&dt>0) sp.push(Math.hypot(B.x-A.x,B.y-A.y)/s.p.shW/dt); }); } prevS=s; }); M.act=sp.length?med(sp):0;
    const hs=M.hands>=P.hands[0]?1:cl(M.hands/Math.max(1,P.hands[0])), as=P.act[0]===0?1:(M.act>=P.act[0]&&M.act<=P.act[1]?1:M.act<P.act[0]?cl(M.act/P.act[0]):cl(1-(M.act-P.act[1])/1.5));
    C.gest=cl(0.45*hs+0.35*as+0.1*cl(1-M.touch/10)+0.1*cl(1-M.crossed/10));
    let tst=null; Pp.forEach(s=>{ const bad=s.p.w.some(w=>w&&w.touch)||s.p.crossed; if(bad&&tst==null) tst=s.t; if(!bad&&tst!=null){ if(s.t-tst>=1.5) ev.push({t:tst,k:"touch",d:s.t-tst}); tst=null; } }); }
  // articulation (mouth opening while speaking + consonant crispness + recognition)
  if(Fs.length>5&&pcm){ M.mouth=med(Fs.map(s=>s.f.mo))*100; M.mouthOK=pct(Fs,s=>s.f.mo>=0.035); }
  M.crisp=pcm&&typeof consMetrics==="function"?Math.round(((consMetrics(pcm)||{}).crisp||0)*100):null;
  M.acc=expected&&sr?Math.round(100*wordAcc(expected,sr)):null;
  if(M.mouth!=null||M.crisp!=null){ const parts=[]; if(M.mouth!=null) parts.push([0.5,cl(M.mouth/4.5)]); if(M.crisp!=null) parts.push([0.3,cl(M.crisp/60)]); if(M.acc!=null) parts.push([0.2,cl(M.acc/90)]); const W=parts.reduce((a,b)=>a+b[0],0); C.art=parts.reduce((a,b)=>a+b[0]*b[1],0)/W; }
  // voice
  let an=null; if(pcm){ an=analyze(pcm,{minSpeech:20}); if(an.ok){ M.rate=Math.round(an.artRate*10)/10; M.melody=Math.round(an.sdSt*10)/10; M.pauses=an.longPauses.length; M.trail=an.trail.length; M.db=Math.round(an.meanDb);
      const fi=sr?fillerInfo(sr,SET.tl):null; M.fillers=fi?fi.n:null; const min=Math.max(0.3,an.total/60);
      C.voice=cl(0.25*(an.artRate>=3.5&&an.artRate<=5.8?1:an.artRate<3.5?cl(an.artRate/3.5):cl(1-(an.artRate-5.8)/2))+0.25*cl(an.sdSt/2.2)+0.2*cl(1-an.trail.length/Math.max(1,an.phrasesChecked||1))+0.15*cl((an.meanDb+50)/18)+0.15*(M.fillers==null?0.7:cl(1-(M.fillers/min-2)/6)));
      an.longPauses.forEach(p=>ev.push({t:p.s,k:"pause",d:p.e-p.s})); an.trail.forEach(x=>ev.push({t:x,k:"trail",d:0})); } }
  // framing & light
  if(F.length>3){ M.fw=Math.round(med(F.map(s=>s.f.fw))*100); M.eyeY=Math.round(med(F.map(s=>s.f.eyeY))*100); M.cx=Math.round(med(F.map(s=>s.f.cx))*100); const Ls=S.map(s=>s.l).filter(x=>x&&x.face!=null); M.lum=Ls.length?Math.round(med(Ls.map(x=>x.face))):null; M.back=Ls.length?Math.round(med(Ls.map(x=>x.bg-x.face))):null;
    const fwT=prof==="pres"?[8,30]:[15,40]; const fs=M.fw>=fwT[0]&&M.fw<=fwT[1]?1:M.fw<fwT[0]?cl(M.fw/fwT[0]):cl(1-(M.fw-fwT[1])/25);
    C.frame=cl(0.3*fs+0.2*(M.eyeY>=22&&M.eyeY<=50?1:0.4)+0.15*(M.cx>=30&&M.cx<=70?1:0.4)+0.2*(M.lum==null?0.7:cl((M.lum-40)/50))+0.15*(M.back==null||M.back<35?1:cl(1-(M.back-35)/40))); }
  M.pitchMed=F.length?Math.round(med(F.map(s=>s.f.pitch))):null;
  if(S.length>8&&M.facePct<60){ C.frame=Math.min(C.frame==null?1:C.frame,cl(M.facePct/100*0.6)); M.noface=true; }
  if(only) Object.keys(C).forEach(k=>{ if(!only.includes(k)) delete C[k]; });
  // overall + recommendations
  const ks=Object.keys(C).filter(k=>C[k]!=null), W=ks.reduce((a,k)=>a+(P.w[k]||1),0)||1, overall=Math.round(100*ks.reduce((a,k)=>a+(P.w[k]||1)*C[k],0)/W);
  ks.slice().sort((a,b)=>C[a]-C[b]).forEach(k=>{ if(C[k]<0.75&&tips.length<3) tips.push(visTip(k,M,prof)); });
  ev.sort((a,b)=>a.t-b.t);
  return {overall,C,M,ev:ev.slice(0,14),tips,an,prof};
}
function visTip(k,M,prof){
  const L={post:["vs_t_post","guard"],eye:["vs_t_eye","eye"],expr:["vs_t_expr","warm"],gest:["vs_t_gest","gest"],art:["vs_t_art","mouth"],voice:["vs_t_voice","ladder"],frame:["vs_t_frame","setup"]}[k];
  let txt=t(L[0]);
  if(k==="post"&&M.neckDrop>12) txt=t("vs_t_slump",{p:M.neckDrop}); if(k==="post"&&M.roll>6) txt+=" "+t("vs_t_roll",{d:Math.round(M.roll)});
  if(k==="eye"&&M.pitchMed!=null&&M.pitchMed>12) txt+=" "+t("vs_t_eyedown");
  if(k==="gest"&&M.hands<20) txt=t("vs_t_nohands"); if(k==="gest"&&M.touch>10) txt+=" "+t("vs_t_touch"); if(k==="gest"&&M.crossed>10) txt+=" "+t("vs_t_cross");
  if(k==="art"&&M.mouth==null) txt=t("vs_t_art2");
  if(k==="expr"&&M.blinks>35) txt+=" "+t("vs_t_blink",{n:M.blinks});
  if(k==="voice"){ if(M.fillers>3) txt=t("vs_t_fill",{n:M.fillers}); else if(M.trail>1) txt=t("vs_t_trail"); else if(M.melody!=null&&M.melody<1.6) txt=t("vs_t_mono"); }
  if(k==="frame"&&M.noface) return {k,txt:t("vs_t_noface",{p:Math.round(M.facePct)}),go:L[1]};
  if(k==="frame"){ if(M.lum!=null&&M.lum<70) txt=t("vs_t_dark"); else if(M.back>35) txt=t("vs_t_back"); else if(M.eyeY>50) txt=t("vs_t_low"); }
  return {k,txt,go:L[1]};
}

/* ---------- drills ---------- */
const VIS_DRILL=["free","eye","mouth","gest","warm","open","setup","file"];
function renderVis(){ const box=$("#visCard"); if(!box||VIS.run) return; const h=visStore().hist, last=h.slice(-6);
  box.innerHTML=`<h2 style="margin:0">🎥 ${t("vs_title")}</h2><p class="muted" style="margin:4px 0">${t("vs_desc")}</p>
   <div class="card flat" data-st style="font-size:.85rem">${VIS.state==="ready"?"✅ "+t("vs_ready"):VIS.state==="fail"?"⚠️ "+t("vs_fail"):"⬇️ "+t("vs_need")+` <button class="b sm" data-load>${t("vs_load")}</button>`}</div>
   ${VIS_DRILL.map(d=>`<button class="b ${d==="free"?"":"alt"}" style="width:100%;margin:3px 0;text-align:left" data-d="${d}">${t("vs_d_"+d)}<br><span class="muted" style="font-size:.78rem;font-weight:400">${t("vs_dd_"+d)}</span></button>`).join("")}
   ${last.length?`<details><summary>${t("vs_hist")}</summary><table style="font-size:.82rem;width:100%">${last.reverse().map(x=>`<tr><td>${x.d}</td><td>${t("vs_d_"+x.drill)}</td><td>${t("vs_p_"+x.prof)}</td><td><b>${x.o}</b></td></tr>`).join("")}</table></details>`:""}
   <div data-run></div>`;
  const lb=box.querySelector("[data-load]"); if(lb) lb.onclick=async()=>{ const st=box.querySelector("[data-st]"); const ok=await visLoad(m=>st.textContent="⏳ "+m); renderVis(); if(!ok) toast(t("vs_fail")); };
  box.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>visStart(b.dataset.d)); }
async function visStart(drill){ const box=$("#visCard");
  if(VIS.state!=="ready"){ box.querySelector("[data-st]").textContent="⏳ "+t("vs_load1"); const ok=await visLoad(m=>{ const e=box.querySelector("[data-st]"); if(e) e.textContent="⏳ "+m; }); if(!ok){ renderVis(); return toast(t("vs_fail")); } }
  if(drill==="file") return visFile();
  VIS.run={drill}; let prof=drill==="warm"?"small":drill==="setup"?"call":"pres";
  const lang=SET.tl, prompts={free:null,eye:rndPick(PPC_SENT[lang],3),mouth:rndPick(PPC_SENT[lang],3),gest:t("vs_gest_prompts").split("|"),open:[(T[lang]&&T[lang].vs_open_line)||t("vs_open_line")]};
  box.innerHTML=`<div class="row"><h3 class="grow" style="margin:0">${t("vs_d_"+drill)}</h3><button class="b sm alt" data-x>${t("fl_back")}</button></div>
   ${drill==="free"?`<div class="chips" data-prof></div><div class="card flat" data-topic style="font-size:1.05rem" ${tlAttr(lang)}></div><button class="b sm alt" data-new>${t("imp_new")}</button>`:""}
   <p class="muted" style="font-size:.85rem;margin:4px 0">${t("vs_how_"+drill)}</p>
   <div style="position:relative;margin-top:6px"><video data-v playsinline muted autoplay style="width:100%;border-radius:12px;transform:scaleX(-1);max-height:52vh;background:#000"></video>
    <div data-tp style="position:absolute;top:6px;left:6px;right:6px;background:rgba(0,0,0,.55);color:#fff;border-radius:8px;padding:6px 8px;font-size:1.05rem;display:none" ${tlAttr(lang)}></div>
    <div data-hud style="position:absolute;bottom:6px;left:6px;right:6px;display:flex;gap:6px;flex-wrap:wrap;font-size:.78rem"></div></div>
   <div class="row" style="margin-top:6px"><button class="b warm grow" data-go>● ${t("vs_rec")}</button><span class="big" data-tm style="font-size:1.2rem;margin:0">0:00</span></div><div data-out></div>`;
  const q=s=>box.querySelector(s), v=q("[data-v]"), hud=q("[data-hud]"), tp=q("[data-tp]");
  q("[data-x]").onclick=()=>visStop(true);
  let topic=null; const newTopic=()=>{ topic=prof==="small"?rnd(FL_STORY)[lang][0]:prof==="iv"?rnd(ROLEQ.grad)[lang][0]:rnd(FL_TOPICS[lang]); q("[data-topic]").textContent=topic; };
  if(drill==="free"){ chipSet(q("[data-prof]"),[["pres",t("vs_p_pres")],["small",t("vs_p_small")],["iv",t("vs_p_iv")],["call",t("vs_p_call")]],prof,x=>{ prof=x; newTopic(); }); newTopic(); q("[data-new]").onclick=newTopic; }
  // camera preview immediately (for framing); recording starts on tap
  try{ VIS.prev=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:640},height:{ideal:480}},audio:false}); v.srcObject=VIS.prev; }catch(e){ q("[data-out]").innerHTML=`<div class="warnbox">${t("pp_nocam")}</div>`; return; }
  // live HUD while previewing
  const hudDraw=s=>{ if(!s) return; const f=s.f, chips=[]; chips.push(`<span style="background:${f?(eyeOK(f)?"#2a9d55":"#b55"):"#555"};color:#fff;border-radius:6px;padding:2px 6px">👁 ${f?(eyeOK(f)?t("vs_h_eye1"):t("vs_h_eye0")):t("vs_h_noface")}</span>`);
    if(f&&(drill==="mouth"||drill==="free")) chips.push(`<span style="background:#0008;color:#fff;border-radius:6px;padding:2px 6px">👄 <span style="display:inline-block;width:50px;height:7px;background:#fff3;vertical-align:middle;border-radius:3px"><i style="display:block;height:100%;width:${Math.min(100,f.mo*1200)}%;background:${f.mo>=0.035?"#4d4":"#fb3"}"></i></span></span>`);
    if(s.p) chips.push(`<span style="background:#0008;color:#fff;border-radius:6px;padding:2px 6px">📐 ${Math.round(Math.abs(s.p.roll))}° · ✋ ${s.p.w.filter(w=>w&&w.inBox).length}</span>`);
    if(drill==="setup"&&f) chips.push(`<span style="background:#0008;color:#fff;border-radius:6px;padding:2px 6px">${Math.round(f.fw*100)} % · ${t("vs_h_eyeline")} ${Math.round(f.eyeY*100)} %</span>`);
    hud.innerHTML=chips.join(""); };
  let t0=performance.now(); VIS.tr=visTrack(v,{onSample:hudDraw,clock:()=>(performance.now()-t0)/1000});
  if(drill==="setup"){ q("[data-go]").textContent="▶ "+t("vs_check6"); }
  q("[data-go]").onclick=async()=>{ q("[data-go]").disabled=true; const old=VIS.tr.stop(); VIS.tr=null;
    if(drill==="setup"){ t0=performance.now(); VIS.tr=visTrack(v,{onSample:hudDraw,clock:()=>(performance.now()-t0)/1000}); await new Promise(r=>setTimeout(r,6000)); const S=VIS.tr.stop(); VIS.tr=null; return visShow(visEvaluate(S,{prof:"call",dur:6,only:["frame","eye","post"]}),null,drill,"call"); }
    let take; try{ take=await startTake({video:true,lang:srLang(),onLevel:(d,s)=>{ q("[data-tm]").textContent=fmtT(s); }}); }catch(e){ micError(e); return; }
    try{ VIS.prev.getTracks().forEach(x=>x.stop()); }catch(e){} v.srcObject=take.stream; keepAwake(true); t0=performance.now();
    VIS.tr=visTrack(v,{onSample:hudDraw,clock:()=>(performance.now()-t0)/1000}); VIS.take=take;
    let listenUntil=null, expected=null; const stopBtn=el("button",{class:"b alt",style:"width:100%;margin-top:6px"},"■ "+t("fl_stop")); q("[data-out]").append(stopBtn);
    const finish=async()=>{ stopBtn.disabled=true; keepAwake(false); const S=VIS.tr.stop(); VIS.tr=null; const r=await take.stop(); VIS.take=null; tp.style.display="none";
      const ev=visEvaluate(S,{pcm:r.pcm,sr:r.sr&&r.sr.text,dur:r.dur,prof,expected,listenUntil}); visShow(ev,r,drill,prof); };
    stopBtn.onclick=finish;
    const seq=async()=>{ // drill-specific guidance during the recording
      if(drill==="eye"||drill==="mouth"){ expected=prompts[drill].join(" "); for(let i=0;i<3&&VIS.run;i++){ tp.style.display="block"; tp.textContent=`${i+1}/3 · ${prompts[drill][i]}`; await new Promise(r=>setTimeout(r,7500)); } if(VIS.run&&VIS.tr) finish(); }
      else if(drill==="gest"){ for(let i=0;i<3&&VIS.run;i++){ tp.style.display="block"; tp.textContent=`${i+1}/3 · ${prompts.gest[i]}`; await new Promise(r=>setTimeout(r,15000)); } if(VIS.run&&VIS.tr) finish(); }
      else if(drill==="warm"){ const st=rnd(FL_STORY)[lang]; tp.style.display="block"; tp.textContent=t("vs_listen"); const ts=performance.now(); await new Promise(r=>speak(st[1],lang,r,1,"partner")); listenUntil=(performance.now()-t0)/1000;
        await new Promise(r=>speak((T[lang]&&T[lang].vs_warm_q)||t("vs_warm_q"),lang,r,1,"partner")); tp.textContent=t("vs_reply"); await new Promise(r=>setTimeout(r,20000)); if(VIS.run&&VIS.tr) finish(); }
      else if(drill==="open"){ tp.style.display="block"; for(const k of [3,2,1]){ tp.textContent=String(k); await new Promise(r=>setTimeout(r,800)); } tp.textContent=t("vs_open_hold"); await new Promise(r=>setTimeout(r,2500)); tp.textContent=prompts.open[0]; await new Promise(r=>setTimeout(r,14000)); if(VIS.run&&VIS.tr) finish(); }
      else { setTimeout(()=>{ if(VIS.run&&VIS.tr) finish(); },180000); } };
    seq(); };
}
function visStop(home){ try{ VIS.tr&&VIS.tr.stop(); }catch(e){} VIS.tr=null; try{ VIS.take&&VIS.take.stop(); }catch(e){} VIS.take=null; try{ VIS.prev&&VIS.prev.getTracks().forEach(x=>x.stop()); }catch(e){} VIS.prev=null; try{ speechSynthesis.cancel(); }catch(e){} keepAwake(false); VIS.run=null; if(home) renderVis(); }
function visShow(R,rec,drill,prof,host){ const box=host||$("#visCard"); if(!host){ try{ VIS.prev&&VIS.prev.getTracks().forEach(x=>x.stop()); }catch(e){} VIS.prev=null; VIS.run=null; }
  const C=R.C, M=R.M, bar=(k)=>{ const v=C[k]; if(v==null) return ""; const p=Math.round(v*100); return `<div class="sc"><span>${t("vs_c_"+k)}</span><div class="bar"><i style="width:${p}%;background:${p>=80?'var(--ok)':p>=55?'var(--accent2)':'var(--warn)'}"></i></div><b>${p}</b></div>`; };
  const f=x=>x==null||isNaN(x)?"–":x; const rows=[[t("vs_m_eye"),f(Math.round(M.eye))+" %"],[t("vs_m_face"),f(Math.round(M.facePct))+" %"],[t("vs_m_smile"),f(M.smile==null?null:Math.round(M.smile))+" %"],[t("vs_m_blinks"),f(M.blinks)+" /min"],[t("vs_m_nods"),f(M.nods)],[t("vs_m_neck"),f(M.neckDrop)+" %"],[t("vs_m_roll"),f(M.roll==null?null:Math.round(M.roll))+"°"],[t("vs_m_hands"),f(M.hands==null?null:Math.round(M.hands))+" %"],[t("vs_m_act"),f(M.act==null?null:Math.round(M.act*100)/100)],[t("vs_m_touch"),f(M.touch==null?null:Math.round(M.touch))+" %"],[t("vs_m_mouth"),f(M.mouth==null?null:Math.round(M.mouth*10)/10)+" %"],[t("vs_m_crisp"),f(M.crisp)],[t("vs_m_acc"),f(M.acc)+" %"],[t("vs_m_rate"),f(M.rate)],[t("vs_m_melody"),f(M.melody)],[t("vs_m_fill"),f(M.fillers)],[t("vs_m_pauses"),f(M.pauses)],[t("vs_m_fw"),f(M.fw)+" %"],[t("vs_m_eyeY"),f(M.eyeY)+" %"],[t("vs_m_lum"),f(M.lum)]].filter(r=>!/^–/.test(String(r[1])));
  const url=rec&&rec.blob?URL.createObjectURL(rec.blob):null;
  const html=`<div class="card flat" style="margin-top:6px"><div class="row"><b class="grow">${t("vs_res")} · ${t("vs_p_"+prof)}</b><b style="font-size:2rem;color:${R.overall>=80?"var(--ok)":R.overall>=60?"var(--accent2)":"var(--warn)"}">${R.overall}</b></div>
    ${["post","eye","expr","gest","art","voice","frame"].map(bar).join("")}
    ${R.tips.length?`<p style="margin:8px 0 2px"><b>${t("vs_recs")}</b></p>`+R.tips.map((x,i)=>`<div class="card flat" style="margin:4px 0;border-left:4px solid var(--accent)"><div>${i+1}. ${esc(x.txt)}</div><button class="b sm alt" style="margin-top:4px" data-go="${x.go}">${t("vs_train")}: ${t("vs_go_"+x.go)}</button></div>`).join(""):`<div class="okbox">${t("vs_great")}</div>`}
    ${url?`<video data-rv playsinline controls src="${url}" style="width:100%;border-radius:12px;margin-top:6px;background:#000;max-height:44vh"></video>`:""}
    ${R.ev.length&&url?`<p style="margin:6px 0 2px"><b>${t("vs_moments")}</b></p>`+R.ev.map(e=>`<button class="chip" data-t="${e.t}" style="margin:2px">${fmtT(e.t)} · ${t("vs_e_"+e.k)}</button>`).join(""):""}
    <details style="margin-top:6px"><summary>${t("vs_details")}</summary><table style="font-size:.82rem;width:100%">${rows.map(r=>`<tr><td>${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join("")}</table><p class="muted" style="font-size:.75rem">${t("vs_how_meas")}</p></details>
    ${host?"":`<div class="row" style="margin-top:6px"><button class="b alt grow" data-again>${t("fl_again")}</button><button class="b grow" data-home>${t("pp_done")}</button></div>`}</div>`;
  if(host) host.insertAdjacentHTML("beforeend",html); else box.innerHTML=`<h3 style="margin:0">${t("vs_d_"+drill)}</h3>`+html;
  const root=host||box, rv=root.querySelector("[data-rv]");
  root.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{ if(rv){ rv.currentTime=Math.max(0,+b.dataset.t-1); rv.play(); } });
  root.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>visGo(b.dataset.go));
  if(!host){ root.querySelector("[data-again]").onclick=()=>visStart(drill); root.querySelector("[data-home]").onclick=()=>renderVis(); }
  const s=visStore(); s.hist.push({d:today(),drill,prof,o:R.overall,C:Object.fromEntries(Object.entries(R.C).map(([k,v])=>[k,v==null?null:Math.round(v*100)]))}); if(s.hist.length>100) s.hist.shift(); save();
  logSession(t("vs_title"),Math.max(0.5,(rec&&rec.dur||10)/60)); try{ markPlan("vis"); }catch(e){} }
function visGo(go){ if(["eye","warm","gest","mouth","setup","open"].includes(go)){ show("video"); visStart(go); return; } if(go==="guard"||go==="ladder"){ show("breath"); setTimeout(()=>ppcOpen(go),50); return; } }
/* analyse an existing video file (e.g. a recorded talk) */
function visFile(){ const box=$("#visCard"); VIS.run={drill:"file"}; box.innerHTML=`<div class="row"><h3 class="grow" style="margin:0">${t("vs_d_file")}</h3><button class="b sm alt" data-x>${t("fl_back")}</button></div><p class="muted">${t("vs_how_file")}</p><div class="chips" data-prof></div><input type="file" accept="video/*" data-f style="margin:6px 0"><div data-o></div>`;
  let prof="pres"; chipSet(box.querySelector("[data-prof]"),[["pres",t("vs_p_pres")],["small",t("vs_p_small")],["iv",t("vs_p_iv")],["call",t("vs_p_call")]],prof,x=>{ prof=x; });
  box.querySelector("[data-x]").onclick=()=>visStop(true);
  box.querySelector("[data-f]").onchange=async e=>{ const fl=e.target.files[0]; if(!fl) return; const o=box.querySelector("[data-o]"); o.innerHTML=`<p>⏳ ${t("vs_analysing")}</p>`; const R=await visAnalyzeBlob(fl,prof,p=>{ o.innerHTML=`<p>⏳ ${t("vs_analysing")} ${p} %</p>`; }); if(!R){ o.innerHTML=`<div class="warnbox">${t("vs_file_fail")}</div>`; return; } VIS.run=null; visShow(R.R,{blob:fl,dur:R.dur},"file",prof); }; }
async function visAnalyzeBlob(blob,prof,onProg){ if(!(await visLoad())) return null;
  const v=document.createElement("video"); v.muted=true; v.playsInline=true; v.src=URL.createObjectURL(blob); await new Promise((r,j)=>{ v.onloadeddata=r; v.onerror=j; setTimeout(r,8000); });
  let pcm=null; try{ pcm=await decodeFile(blob); }catch(e){}
  let dur=isFinite(v.duration)&&v.duration>0?v.duration:(pcm?pcm.length/16000:0); v.playbackRate=1.5; try{ await v.play(); }catch(e){ return null; }
  const tr=visTrack(v,{clock:()=>v.currentTime,onSample:()=>{ if(dur&&onProg) onProg(Math.min(99,Math.round(100*v.currentTime/dur))); }});
  await new Promise(r=>{ v.onended=r; const iv=setInterval(()=>{ if(v.ended||(dur&&v.currentTime>=dur-0.05)){ clearInterval(iv); r(); } },300); });
  const S=tr.stop(); return {R:visEvaluate(S,{pcm,dur,prof}),dur}; }
// studio: automatic evaluation of a recorded video
const _studioDoneV=studioDone;
studioDone=function(r,video){ _studioDoneV(r,video); if(!video||!r||!r.blob) return; const out=$("#studioOut"); const b=el("button",{class:"b",style:"width:100%;margin-top:6px"},"🎥 "+t("vs_studio_btn")); out.append(b);
  b.onclick=async()=>{ b.disabled=true; b.textContent="⏳ "+t("vs_analysing"); const R=await visAnalyzeBlob(r.blob,"pres",p=>{ b.textContent=`⏳ ${t("vs_analysing")} ${p} %`; }); b.remove(); if(!R) return toast(t("vs_fail")); const host=el("div",{}); out.append(host); visShow(R.R,null,"free","pres",host); }; };

/* ---------- texts ---------- */
Object.assign(T.en,{nav_video:"Camera",vs_title:"Camera coach",vs_desc:"Record yourself with the front camera and get an automatic evaluation of posture, eye contact, facial expression, gestures, articulation (mouth opening + consonants), voice and framing – with your top 3 recommendations and the matching exercise. Everything is analysed on the phone; nothing is uploaded.",
 vs_ready:"Analysis models ready (work offline).",vs_need:"The analysis models (about 23 MB) are downloaded once and then work offline. Wi-Fi recommended.",vs_load:"Load now",vs_fail:"The analysis models could not be loaded (offline on first use?). Try again with an internet connection.",vs_load1:"Loading face model…",vs_load2:"Starting face analysis…",vs_load3:"Starting body analysis…",
 vs_d_free:"🎤 Free recording with evaluation",vs_dd_free:"Presentation, small talk, interview or video call – up to 3 min on a suggested topic.",vs_d_eye:"👁 Eye-contact trainer",vs_dd_eye:"Read a sentence, then say it into the lens.",vs_d_mouth:"👄 Articulation mirror",vs_dd_mouth:"Live mouth-opening bar while you read sentences.",vs_d_gest:"✋ Gesture trainer",vs_dd_gest:"Three prompts that need your hands.",vs_d_warm:"🙂 Warm face & active listening",vs_dd_warm:"Listen to a story (smile, nod, look), then reply.",vs_d_open:"⚡ Strong opening",vs_dd_open:"Stand still, look, smile – then the first sentence.",vs_d_setup:"🖥 Video-call check",vs_dd_setup:"6-second check of framing, eye line and light.",vs_d_file:"📁 Analyse a video file",vs_dd_file:"E.g. a recording of a real talk or call.",
 vs_hist:"Recent evaluations",vs_p_pres:"Presentation",vs_p_small:"Small talk",vs_p_iv:"Interview",vs_p_call:"Video call",vs_rec:"Start recording",vs_check6:"Check (6 s)",
 vs_how_free:"Prop the phone up at eye level, about an arm's length away (for a presentation: 1.5–2 m so your hands are visible). Talk about the topic for 1–3 minutes, then tap stop.",vs_how_eye:"A sentence appears at the top. Read it, then lift your eyes to the camera lens (not the screen!) and say it to your listener. Green 👁 = eye contact.",vs_how_mouth:"Read each sentence clearly and open your mouth well – the 👄 bar turns green when the lips are open enough while you speak.",vs_how_gest:"Answer each prompt with your hands in the frame (between shoulders and waist). Keep the phone far enough away to see your hands.",vs_how_warm:"First listen: look at the lens, smile, nod. Then answer the question for about 20 seconds.",vs_how_open:"After the countdown, stand still for 2 s, look into the lens and smile – then say the opening sentence with energy.",vs_how_setup:"Sit as you would in a video call and tap check.",vs_how_file:"Choose the setting and a video file (front-facing view works best). The video is analysed on the phone at 1.5× speed.",
 vs_gest_prompts:"Show me how big the fish was that you (almost) caught.|Explain the three steps of your morning routine – count them on your fingers.|Compare two options: on the one hand… on the other hand…",vs_open_line:"Good morning everyone – today I want to show you one simple idea that can change the way we work.",vs_open_hold:"Hold still · look · smile",vs_listen:"Listen: look, smile, nod…",vs_warm_q:"What about you – has anything like that happened to you?",vs_reply:"Your turn – reply for about 20 seconds.",
 vs_h_eye1:"eye contact",vs_h_eye0:"look at the lens",vs_h_noface:"no face",vs_h_eyeline:"eye line",
 vs_res:"Evaluation",vs_recs:"Your top recommendations",vs_train:"Practise",vs_great:"Excellent – no major weak spot. Try a harder setting next.",vs_moments:"Moments to review (tap to jump):",vs_details:"All measurements",
 vs_c_post:"Posture",vs_c_eye:"Eye contact",vs_c_expr:"Expression",vs_c_gest:"Gestures",vs_c_art:"Articulation",vs_c_voice:"Voice",vs_c_frame:"Image & light",
 vs_m_eye:"Eye contact (looking at the lens)",vs_m_face:"Face visible",vs_m_smile:"Smiling",vs_m_blinks:"Blinks",vs_m_nods:"Head nods",vs_m_neck:"Slump towards the end (neck height)",vs_m_roll:"Shoulder tilt",vs_m_hands:"Hands visible in the gesture zone",vs_m_act:"Gesture speed (shoulder widths/s)",vs_m_touch:"Touching face/head",vs_m_mouth:"Mouth opening while speaking (% of face height)",vs_m_crisp:"Consonant crispness",vs_m_acc:"Words recognised",vs_m_rate:"Syllables per second",vs_m_melody:"Melody (semitones SD)",vs_m_fill:"Fillers",vs_m_pauses:"Long pauses (> 2 s)",vs_m_fw:"Face width (% of image)",vs_m_eyeY:"Eye line (% from top)",vs_m_lum:"Face brightness (0–255)",
 vs_how_meas:"Measured on the phone with MediaPipe Face Mesh (478 face points incl. irises) and Pose (33 body points), about 8 analysed frames per second, plus the microphone. Eye contact = head turned less than 15° and irises centred; smiling = mouth wider and corners raised compared with your neutral face; slump = neck height (nose to shoulder line) drops more than 15 % compared with the start.",
 vs_e_look:"looked away",vs_e_slump:"slumped",vs_e_touch:"hands on face / arms crossed",vs_e_pause:"long pause",vs_e_trail:"sentence end faded",
 vs_t_post:"Sit or stand tall: breastbone up, shoulders relaxed and level, crown of the head towards the ceiling.",vs_t_slump:"Your posture sank by {p} % towards the end – take a breath between thoughts and lift the breastbone again.",vs_t_roll:"Your shoulders tilt about {d}° – distribute your weight evenly.",
 vs_t_eye:"Look into the lens more often, especially at the start and end of each sentence – that's where your listener's eyes are.",vs_t_eyedown:"You mostly look below the lens (at the screen): put your notes or the other person's video right under the camera.",
 vs_t_expr:"Let your face join in: a genuine smile at the start and end, eyebrows that move with your message.",vs_t_blink:"Fast blinking ({n}/min) can look nervous – slow down and breathe out.",
 vs_t_gest:"Use your hands to show size, steps and contrasts – in the zone between shoulders and waist.",vs_t_nohands:"Your hands were hardly visible – move the camera back or raise your hands into the frame; visible hands build trust.",vs_t_touch:"Avoid touching your face or hair.",vs_t_cross:"Uncross your arms – an open posture looks more confident.",
 vs_t_art:"Open your mouth more while speaking – lazy lips blur the consonants.",vs_t_art2:"Articulate the consonants more crisply – especially t, k, p at the ends of words.",vs_t_voice:"Give your voice more energy and support from the belly.",vs_t_fill:"{n} fillers – replace “um” with a short, silent pause.",vs_t_trail:"Several sentence endings faded – keep the energy until the last word.",vs_t_mono:"Your melody is quite flat – stress key words with pitch and volume.",
 vs_t_noface:"Your face was only recognised {p} % of the time – check the light (face a window or lamp), put the camera at eye level and keep your whole face in the picture.",vs_t_frame:"Improve the framing: eyes in the upper third, face centred, about an arm's length away.",vs_t_dark:"Your face is too dark – face a window or lamp.",vs_t_back:"Strong backlight – don't sit with a window behind you.",vs_t_low:"The camera is too low (you appear low in the frame) – raise it to eye level.",
 vs_go_guard:"posture guard",vs_go_eye:"eye-contact trainer",vs_go_warm:"warm face",vs_go_gest:"gesture trainer",vs_go_mouth:"articulation mirror",vs_go_ladder:"volume ladder",vs_go_setup:"video-call check",vs_go_open:"strong opening",
 vs_analysing:"Analysing video…",vs_file_fail:"This video could not be analysed.",vs_studio_btn:"Evaluate the video automatically (posture, eye contact, gestures…)"});
Object.assign(T.de,{nav_video:"Kamera",vs_title:"Kamera-Coach",vs_desc:"Nimm dich mit der Frontkamera auf und erhalte eine automatische Auswertung von Haltung, Blickkontakt, Mimik, Gestik, Artikulation (Mundöffnung + Konsonanten), Stimme und Bildausschnitt – mit deinen 3 wichtigsten Empfehlungen und der passenden Übung. Alles wird auf dem Handy ausgewertet; nichts wird hochgeladen.",
 vs_ready:"Analysemodelle bereit (funktionieren offline).",vs_need:"Die Analysemodelle (ca. 23 MB) werden einmalig geladen und funktionieren danach offline. WLAN empfohlen.",vs_load:"Jetzt laden",vs_fail:"Die Analysemodelle konnten nicht geladen werden (beim ersten Mal offline?). Versuch es mit Internetverbindung erneut.",vs_load1:"Lade Gesichtsmodell…",vs_load2:"Starte Gesichtsanalyse…",vs_load3:"Starte Körperanalyse…",
 vs_d_free:"🎤 Freie Aufnahme mit Auswertung",vs_dd_free:"Präsentation, Smalltalk, Vorstellungsgespräch oder Videocall – bis 3 Min. zu einem vorgeschlagenen Thema.",vs_d_eye:"👁 Blickkontakt-Trainer",vs_dd_eye:"Satz lesen, dann in die Linse sprechen.",vs_d_mouth:"👄 Artikulations-Spiegel",vs_dd_mouth:"Live-Balken für die Mundöffnung beim Lesen.",vs_d_gest:"✋ Gestik-Trainer",vs_dd_gest:"Drei Aufgaben, die deine Hände brauchen.",vs_d_warm:"🙂 Warmes Gesicht & aktives Zuhören",vs_dd_warm:"Einer Geschichte zuhören (lächeln, nicken, ansehen), dann antworten.",vs_d_open:"⚡ Starker Einstieg",vs_dd_open:"Stillstehen, ansehen, lächeln – dann der erste Satz.",vs_d_setup:"🖥 Videocall-Check",vs_dd_setup:"6-Sekunden-Check von Ausschnitt, Augenhöhe und Licht.",vs_d_file:"📁 Videodatei auswerten",vs_dd_file:"Z. B. die Aufnahme eines echten Vortrags oder Calls.",
 vs_hist:"Letzte Auswertungen",vs_p_pres:"Präsentation",vs_p_small:"Smalltalk",vs_p_iv:"Vorstellungsgespräch",vs_p_call:"Videocall",vs_rec:"Aufnahme starten",vs_check6:"Prüfen (6 s)",
 vs_how_free:"Stell das Handy auf Augenhöhe, etwa eine Armlänge entfernt (für eine Präsentation 1,5–2 m, damit die Hände sichtbar sind). Sprich 1–3 Minuten zum Thema und tippe dann auf Stopp.",vs_how_eye:"Oben erscheint ein Satz. Lies ihn, heb dann den Blick zur Kameralinse (nicht aufs Display!) und sag ihn deinem Zuhörer. Grünes 👁 = Blickkontakt.",vs_how_mouth:"Lies jeden Satz deutlich und öffne den Mund gut – der 👄-Balken wird grün, wenn die Lippen beim Sprechen weit genug geöffnet sind.",vs_how_gest:"Beantworte jede Aufgabe mit den Händen im Bild (zwischen Schultern und Taille). Stell das Handy so weit weg, dass die Hände zu sehen sind.",vs_how_warm:"Erst zuhören: in die Linse schauen, lächeln, nicken. Dann etwa 20 Sekunden auf die Frage antworten.",vs_how_open:"Nach dem Countdown 2 s stillstehen, in die Linse schauen und lächeln – dann den Einstiegssatz mit Energie sagen.",vs_how_setup:"Setz dich hin wie in einem Videocall und tippe auf Prüfen.",vs_how_file:"Wähle die Situation und eine Videodatei (Frontalansicht ist am besten). Das Video wird auf dem Handy mit 1,5-facher Geschwindigkeit ausgewertet.",
 vs_gest_prompts:"Zeig mir, wie groß der Fisch war, den du (fast) gefangen hast.|Erklär die drei Schritte deiner Morgenroutine – zähl sie an den Fingern ab.|Vergleiche zwei Möglichkeiten: einerseits… andererseits…",vs_open_line:"Guten Morgen zusammen – heute möchte ich Ihnen eine einfache Idee zeigen, die unsere Art zu arbeiten verändern kann.",vs_open_hold:"Stillstehen · ansehen · lächeln",vs_listen:"Zuhören: ansehen, lächeln, nicken…",vs_warm_q:"Und du – ist dir so etwas auch schon passiert?",vs_reply:"Du bist dran – antworte etwa 20 Sekunden.",
 vs_h_eye1:"Blickkontakt",vs_h_eye0:"in die Linse schauen",vs_h_noface:"kein Gesicht",vs_h_eyeline:"Augenlinie",
 vs_res:"Auswertung",vs_recs:"Deine wichtigsten Empfehlungen",vs_train:"Üben",vs_great:"Hervorragend – keine größere Schwachstelle. Probier als Nächstes eine schwierigere Situation.",vs_moments:"Stellen zum Ansehen (antippen zum Springen):",vs_details:"Alle Messwerte",
 vs_c_post:"Haltung",vs_c_eye:"Blickkontakt",vs_c_expr:"Mimik",vs_c_gest:"Gestik",vs_c_art:"Artikulation",vs_c_voice:"Stimme",vs_c_frame:"Bild & Licht",
 vs_m_eye:"Blickkontakt (Blick in die Linse)",vs_m_face:"Gesicht sichtbar",vs_m_smile:"Lächeln",vs_m_blinks:"Lidschläge",vs_m_nods:"Kopfnicken",vs_m_neck:"Absacken zum Ende (Halshöhe)",vs_m_roll:"Schulterneigung",vs_m_hands:"Hände sichtbar im Gestik-Bereich",vs_m_act:"Gestentempo (Schulterbreiten/s)",vs_m_touch:"Hände an Gesicht/Kopf",vs_m_mouth:"Mundöffnung beim Sprechen (% der Gesichtshöhe)",vs_m_crisp:"Konsonantenschärfe",vs_m_acc:"Erkannte Wörter",vs_m_rate:"Silben pro Sekunde",vs_m_melody:"Melodie (Halbtöne Streuung)",vs_m_fill:"Füllwörter",vs_m_pauses:"Lange Pausen (> 2 s)",vs_m_fw:"Gesichtsbreite (% des Bildes)",vs_m_eyeY:"Augenlinie (% von oben)",vs_m_lum:"Gesichtshelligkeit (0–255)",
 vs_how_meas:"Gemessen auf dem Handy mit MediaPipe Face Mesh (478 Gesichtspunkte inkl. Iris) und Pose (33 Körperpunkte), etwa 8 ausgewertete Bilder pro Sekunde, plus Mikrofon. Blickkontakt = Kopf weniger als 15° gedreht und Iris mittig; Lächeln = Mund breiter und Mundwinkel höher als bei deinem neutralen Gesicht; Absacken = Halshöhe (Nase bis Schulterlinie) sinkt gegenüber dem Anfang um mehr als 15 %.",
 vs_e_look:"weggeschaut",vs_e_slump:"abgesackt",vs_e_touch:"Hände im Gesicht / Arme verschränkt",vs_e_pause:"lange Pause",vs_e_trail:"Satzende verklungen",
 vs_t_post:"Sitz oder steh aufrecht: Brustbein hoch, Schultern locker und waagerecht, Scheitel Richtung Decke.",vs_t_slump:"Deine Haltung ist zum Ende hin um {p} % abgesackt – atme zwischen den Gedanken ein und heb das Brustbein wieder.",vs_t_roll:"Deine Schultern sind etwa {d}° geneigt – verteile dein Gewicht gleichmäßig.",
 vs_t_eye:"Schau öfter in die Linse, besonders am Anfang und Ende jedes Satzes – dort sind die Augen deines Zuhörers.",vs_t_eyedown:"Du schaust meist unter die Linse (aufs Display): Leg Notizen oder das Video des Gegenübers direkt unter die Kamera.",
 vs_t_expr:"Lass dein Gesicht mitspielen: ein echtes Lächeln am Anfang und Ende, Augenbrauen, die deine Botschaft begleiten.",vs_t_blink:"Schnelles Blinzeln ({n}/Min.) kann nervös wirken – werde langsamer und atme aus.",
 vs_t_gest:"Zeig mit den Händen Größen, Schritte und Gegensätze – im Bereich zwischen Schultern und Taille.",vs_t_nohands:"Deine Hände waren kaum zu sehen – stell die Kamera weiter weg oder heb die Hände ins Bild; sichtbare Hände schaffen Vertrauen.",vs_t_touch:"Vermeide es, Gesicht oder Haare zu berühren.",vs_t_cross:"Löse die verschränkten Arme – eine offene Haltung wirkt souveräner.",
 vs_t_art:"Öffne beim Sprechen den Mund weiter – faule Lippen verwischen die Konsonanten.",vs_t_art2:"Artikuliere die Konsonanten schärfer – besonders t, k, p am Wortende.",vs_t_voice:"Gib deiner Stimme mehr Energie und Stütze aus dem Bauch.",vs_t_fill:"{n} Füllwörter – ersetze „ähm“ durch eine kurze stille Pause.",vs_t_trail:"Mehrere Satzenden sind verklungen – halte die Energie bis zum letzten Wort.",vs_t_mono:"Deine Sprechmelodie ist recht flach – betone Schlüsselwörter mit Tonhöhe und Lautstärke.",
 vs_t_noface:"Dein Gesicht wurde nur {p} % der Zeit erkannt – prüf das Licht (Blick zu Fenster oder Lampe), stell die Kamera auf Augenhöhe und halte das ganze Gesicht im Bild.",vs_t_frame:"Verbessere den Bildausschnitt: Augen im oberen Drittel, Gesicht mittig, etwa eine Armlänge entfernt.",vs_t_dark:"Dein Gesicht ist zu dunkel – setz dich mit Blick zu einem Fenster oder einer Lampe.",vs_t_back:"Starkes Gegenlicht – setz dich nicht mit dem Fenster im Rücken.",vs_t_low:"Die Kamera ist zu tief (du erscheinst unten im Bild) – stell sie auf Augenhöhe.",
 vs_go_guard:"Haltungswächter",vs_go_eye:"Blickkontakt-Trainer",vs_go_warm:"Warmes Gesicht",vs_go_gest:"Gestik-Trainer",vs_go_mouth:"Artikulations-Spiegel",vs_go_ladder:"Lautstärke-Leiter",vs_go_setup:"Videocall-Check",vs_go_open:"Starker Einstieg",
 vs_analysing:"Analysiere Video…",vs_file_fail:"Dieses Video konnte nicht ausgewertet werden.",vs_studio_btn:"Video automatisch auswerten (Haltung, Blickkontakt, Gestik…)"});
Object.assign(T.fr,{nav_video:"Caméra",vs_title:"Coach caméra",vs_desc:"Filmez-vous avec la caméra frontale et obtenez une évaluation automatique de la posture, du contact visuel, de l'expression du visage, de la gestuelle, de l'articulation (ouverture de la bouche + consonnes), de la voix et du cadrage – avec vos 3 recommandations principales et l'exercice correspondant. Tout est analysé sur le téléphone ; rien n'est envoyé.",
 vs_ready:"Modèles d'analyse prêts (fonctionnent hors ligne).",vs_need:"Les modèles d'analyse (environ 23 Mo) sont téléchargés une seule fois puis fonctionnent hors ligne. Wi-Fi recommandé.",vs_load:"Charger maintenant",vs_fail:"Impossible de charger les modèles d'analyse (hors ligne à la première utilisation ?). Réessayez avec une connexion Internet.",vs_load1:"Chargement du modèle du visage…",vs_load2:"Démarrage de l'analyse du visage…",vs_load3:"Démarrage de l'analyse du corps…",
 vs_d_free:"🎤 Enregistrement libre avec évaluation",vs_dd_free:"Présentation, small talk, entretien ou visioconférence – jusqu'à 3 min sur un sujet proposé.",vs_d_eye:"👁 Entraîneur de contact visuel",vs_dd_eye:"Lisez une phrase, puis dites-la dans l'objectif.",vs_d_mouth:"👄 Miroir d'articulation",vs_dd_mouth:"Barre d'ouverture de la bouche en direct pendant la lecture.",vs_d_gest:"✋ Entraîneur de gestuelle",vs_dd_gest:"Trois consignes qui demandent vos mains.",vs_d_warm:"🙂 Visage chaleureux et écoute active",vs_dd_warm:"Écoutez une histoire (sourire, hocher la tête, regarder), puis répondez.",vs_d_open:"⚡ Ouverture forte",vs_dd_open:"Immobile, regard, sourire – puis la première phrase.",vs_d_setup:"🖥 Contrôle visioconférence",vs_dd_setup:"Contrôle de 6 secondes du cadrage, de la hauteur des yeux et de la lumière.",vs_d_file:"📁 Analyser une vidéo",vs_dd_file:"P. ex. l'enregistrement d'un vrai exposé ou appel.",
 vs_hist:"Évaluations récentes",vs_p_pres:"Présentation",vs_p_small:"Small talk",vs_p_iv:"Entretien",vs_p_call:"Visioconférence",vs_rec:"Démarrer l'enregistrement",vs_check6:"Contrôler (6 s)",
 vs_how_free:"Posez le téléphone à hauteur des yeux, à environ une longueur de bras (pour une présentation : 1,5 à 2 m pour que les mains soient visibles). Parlez 1 à 3 minutes sur le sujet, puis touchez Stop.",vs_how_eye:"Une phrase apparaît en haut. Lisez-la, puis levez les yeux vers l'objectif (pas l'écran !) et dites-la à votre auditeur. 👁 vert = contact visuel.",vs_how_mouth:"Lisez chaque phrase clairement en ouvrant bien la bouche – la barre 👄 devient verte quand les lèvres sont assez ouvertes pendant que vous parlez.",vs_how_gest:"Répondez à chaque consigne avec les mains dans le cadre (entre les épaules et la taille). Éloignez assez le téléphone pour voir vos mains.",vs_how_warm:"D'abord écoutez : regardez l'objectif, souriez, hochez la tête. Puis répondez à la question pendant environ 20 secondes.",vs_how_open:"Après le compte à rebours, restez immobile 2 s, regardez l'objectif et souriez – puis dites la phrase d'ouverture avec énergie.",vs_how_setup:"Installez-vous comme pour une visioconférence et touchez Contrôler.",vs_how_file:"Choisissez la situation et un fichier vidéo (une vue de face convient le mieux). La vidéo est analysée sur le téléphone à vitesse 1,5×.",
 vs_gest_prompts:"Montre-moi la taille du poisson que tu as (presque) attrapé.|Explique les trois étapes de ta routine du matin – compte-les sur tes doigts.|Compare deux options : d'un côté… de l'autre…",vs_open_line:"Bonjour à tous – aujourd'hui, je veux vous montrer une idée simple qui peut changer notre façon de travailler.",vs_open_hold:"Immobile · regard · sourire",vs_listen:"Écoutez : regardez, souriez, hochez la tête…",vs_warm_q:"Et toi – il t'est déjà arrivé quelque chose de ce genre ?",vs_reply:"À vous – répondez pendant environ 20 secondes.",
 vs_h_eye1:"contact visuel",vs_h_eye0:"regardez l'objectif",vs_h_noface:"pas de visage",vs_h_eyeline:"ligne des yeux",
 vs_res:"Évaluation",vs_recs:"Vos recommandations principales",vs_train:"S'entraîner",vs_great:"Excellent – aucun point faible majeur. Essayez une situation plus difficile.",vs_moments:"Moments à revoir (touchez pour y aller) :",vs_details:"Toutes les mesures",
 vs_c_post:"Posture",vs_c_eye:"Contact visuel",vs_c_expr:"Expression",vs_c_gest:"Gestuelle",vs_c_art:"Articulation",vs_c_voice:"Voix",vs_c_frame:"Image et lumière",
 vs_m_eye:"Contact visuel (regard dans l'objectif)",vs_m_face:"Visage visible",vs_m_smile:"Sourire",vs_m_blinks:"Clignements",vs_m_nods:"Hochements de tête",vs_m_neck:"Affaissement vers la fin (hauteur du cou)",vs_m_roll:"Inclinaison des épaules",vs_m_hands:"Mains visibles dans la zone des gestes",vs_m_act:"Vitesse des gestes (largeurs d'épaules/s)",vs_m_touch:"Mains au visage/à la tête",vs_m_mouth:"Ouverture de la bouche en parlant (% de la hauteur du visage)",vs_m_crisp:"Netteté des consonnes",vs_m_acc:"Mots reconnus",vs_m_rate:"Syllabes par seconde",vs_m_melody:"Mélodie (écart en demi-tons)",vs_m_fill:"Mots de remplissage",vs_m_pauses:"Longues pauses (> 2 s)",vs_m_fw:"Largeur du visage (% de l'image)",vs_m_eyeY:"Ligne des yeux (% depuis le haut)",vs_m_lum:"Luminosité du visage (0–255)",
 vs_how_meas:"Mesuré sur le téléphone avec MediaPipe Face Mesh (478 points du visage, iris compris) et Pose (33 points du corps), environ 8 images analysées par seconde, plus le micro. Contact visuel = tête tournée de moins de 15° et iris centrés ; sourire = bouche plus large et commissures plus hautes que sur votre visage neutre ; affaissement = la hauteur du cou (nez–ligne des épaules) baisse de plus de 15 % par rapport au début.",
 vs_e_look:"regard ailleurs",vs_e_slump:"affaissé",vs_e_touch:"mains au visage / bras croisés",vs_e_pause:"longue pause",vs_e_trail:"fin de phrase éteinte",
 vs_t_post:"Tenez-vous droit : sternum relevé, épaules détendues et à l'horizontale, sommet du crâne vers le plafond.",vs_t_slump:"Votre posture s'est affaissée de {p} % vers la fin – inspirez entre deux idées et relevez le sternum.",vs_t_roll:"Vos épaules penchent d'environ {d}° – répartissez votre poids de façon égale.",
 vs_t_eye:"Regardez plus souvent l'objectif, surtout au début et à la fin de chaque phrase – c'est là que se trouvent les yeux de votre auditeur.",vs_t_eyedown:"Vous regardez surtout sous l'objectif (l'écran) : placez vos notes ou la vidéo de l'interlocuteur juste sous la caméra.",
 vs_t_expr:"Laissez votre visage participer : un vrai sourire au début et à la fin, des sourcils qui accompagnent votre message.",vs_t_blink:"Des clignements rapides ({n}/min) peuvent paraître nerveux – ralentissez et expirez.",
 vs_t_gest:"Utilisez les mains pour montrer tailles, étapes et contrastes – dans la zone entre épaules et taille.",vs_t_nohands:"Vos mains étaient à peine visibles – reculez la caméra ou montez les mains dans le cadre ; des mains visibles inspirent confiance.",vs_t_touch:"Évitez de toucher votre visage ou vos cheveux.",vs_t_cross:"Décroisez les bras – une posture ouverte paraît plus assurée.",
 vs_t_art:"Ouvrez davantage la bouche en parlant – des lèvres paresseuses brouillent les consonnes.",vs_t_art2:"Articulez les consonnes plus nettement – surtout t, k, p en fin de mot.",vs_t_voice:"Donnez plus d'énergie à votre voix, avec le soutien du ventre.",vs_t_fill:"{n} mots de remplissage – remplacez « euh » par une courte pause silencieuse.",vs_t_trail:"Plusieurs fins de phrase se sont éteintes – gardez l'énergie jusqu'au dernier mot.",vs_t_mono:"Votre mélodie est assez plate – accentuez les mots clés par la hauteur et le volume.",
 vs_t_noface:"Votre visage n'a été reconnu que {p} % du temps – vérifiez la lumière (face à une fenêtre ou une lampe), placez la caméra à hauteur des yeux et gardez tout le visage dans l'image.",vs_t_frame:"Améliorez le cadrage : yeux dans le tiers supérieur, visage centré, à environ une longueur de bras.",vs_t_dark:"Votre visage est trop sombre – placez-vous face à une fenêtre ou une lampe.",vs_t_back:"Fort contre-jour – ne vous asseyez pas dos à une fenêtre.",vs_t_low:"La caméra est trop basse (vous apparaissez en bas de l'image) – placez-la à hauteur des yeux.",
 vs_go_guard:"gardien de posture",vs_go_eye:"contact visuel",vs_go_warm:"visage chaleureux",vs_go_gest:"gestuelle",vs_go_mouth:"miroir d'articulation",vs_go_ladder:"échelle de volume",vs_go_setup:"contrôle visio",vs_go_open:"ouverture forte",
 vs_analysing:"Analyse de la vidéo…",vs_file_fail:"Cette vidéo n'a pas pu être analysée.",vs_studio_btn:"Évaluer la vidéo automatiquement (posture, contact visuel, gestuelle…)"});

try{ buildNav(); }catch(e){}
