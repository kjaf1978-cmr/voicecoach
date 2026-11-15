"use strict";
/* ============================================================
   MEDIA: capture (mic / camera), acoustic analysis, tips,
   replay view, recording library (IndexedDB), share / import
   ============================================================ */

/* ---------- resampling ---------- */
function resample(src, sr, tr){
  if(sr===tr) return src;
  const ratio=sr/tr, n=Math.floor(src.length/ratio), out=new Float32Array(n);
  for(let i=0;i<n;i++){ const a=Math.floor(i*ratio), b=Math.min(src.length,Math.floor((i+1)*ratio)); let s=0; for(let j=a;j<b;j++) s+=src[j]; out[i]=b>a?s/(b-a):src[a]||0; }
  return out;
}
function concatChunks(chunks){ const len=chunks.reduce((a,c)=>a+c.length,0), o=new Float32Array(len); let p=0; for(const c of chunks){ o.set(c,p); p+=c.length; } return o; }

/* ---------- live take: recording + optional speech recognition ---------- */
const FATAL_SR=["not-allowed","service-not-allowed","audio-capture","unsupported","start-failed"];
async function startTake({video=false, lang=null, onLevel=null, onText=null, onPitch=null, capture=true}={}){
  if(typeof MIC!=="undefined" && MIC.stream) stopMic();
  const c=ac(); if(!c) throw new Error("noaudio");
  const ac0={echoCancellation:false,noiseSuppression:false,autoGainControl:false}; if(SET.micId) ac0.deviceId={exact:SET.micId};
  let stream; try{ stream=await navigator.mediaDevices.getUserMedia({audio:ac0,
    video: video?{facingMode:"user",width:{ideal:640},height:{ideal:480}}:false}); }
  catch(e){ if(SET.micId&&(e.name==="OverconstrainedError"||e.name==="NotFoundError")){ SET.micId=""; save(); delete ac0.deviceId; stream=await navigator.mediaDevices.getUserMedia({audio:ac0,video:video?{facingMode:"user"}:false}); } else throw e; }
  // capture=false (live singing exercises): no PCM capture and no MediaRecorder → much less CPU, no audio crackle on phones
  const src=c.createMediaStreamSource(stream), proc=capture?c.createScriptProcessor(4096,1,1):null, an=c.createAnalyser(), mute=c.createGain(); an.fftSize=2048; mute.gain.value=0;
  const chunks=[]; let capturing=true;
  if(proc){ proc.onaudioprocess=e=>{ if(capturing) chunks.push(new Float32Array(e.inputBuffer.getChannelData(0))); }; src.connect(proc); proc.connect(mute); mute.connect(c.destination); }
  src.connect(an);
  const cands=video?["video/webm;codecs=vp8,opus","video/webm","video/mp4"]:["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"];
  let mime=""; for(const m of cands){ try{ if(MediaRecorder.isTypeSupported(m)){ mime=m; break; } }catch(e){} }
  let mr=null; const parts=[];
  if(capture) try{ mr=new MediaRecorder(stream, mime?{mimeType:mime}:undefined); mr.ondataavailable=e=>{ if(e.data&&e.data.size) parts.push(e.data); }; mr.start(250); }catch(e){ mr=null; }
  const t0=performance.now(), lb=new Float32Array(an.fftSize); let raf, fr=0;
  const lvl=()=>{ raf=requestAnimationFrame(lvl); if(!capture&&(fr++&1)) return; an.getFloatTimeDomainData(lb); let s=0; for(let i=0;i<lb.length;i++) s+=lb[i]*lb[i]; const dbv=10*Math.log10(s/lb.length+1e-10), sec=(performance.now()-t0)/1000; onLevel&&onLevel(dbv,sec);
    if(onPitch){ const p=detectPitch(lb,c.sampleRate); onPitch(p.f,sec,dbv); } }; lvl();
  const sr={text:"",confs:[],first:null,last:null,err:null,segs:0};
  let srOn=!!(lang && SR && !srBroken), srDone=Promise.resolve();
  const loop=()=>{ if(!srOn) return;
    srDone=recognizeOnce(lang, txt=>onText&&onText((sr.text+" "+txt).trim())).then(r=>{
      if(r.text){ sr.text=(sr.text+" "+r.text).trim(); sr.confs.push(...(r.confs||[])); if(sr.first===null&&r.tFirst!=null) sr.first=(r.tFirst-t0)/1000; if(r.tLast!=null) sr.last=(r.tLast-t0)/1000; }
      sr.segs++; if(srOn&&sr.segs<60) loop();
    }).catch(e=>{ sr.err=String(e); sr.segs++; if(srOn&&!FATAL_SR.includes(sr.err)&&sr.segs<60) setTimeout(loop,150); }); };
  loop();
  return { video, stream, t0, async stop(){
    srOn=false; stopRecognition(); cancelAnimationFrame(raf);
    if(mr&&mr.state!=="inactive") await new Promise(res=>{ mr.onstop=res; try{ mr.stop(); }catch(e){ res(); } });
    capturing=false;
    try{ src.disconnect(); proc&&proc.disconnect(); an.disconnect(); mute.disconnect(); }catch(e){}
    stream.getTracks().forEach(t=>t.stop());
    await Promise.race([srDone.catch(()=>{}), new Promise(r=>setTimeout(r,2500))]);
    const blob=parts.length?new Blob(parts,{type:(mr&&mr.mimeType)||mime||(video?"video/webm":"audio/webm")}):null;
    const pcm=resample(concatChunks(chunks),c.sampleRate,16000);
    return {blob, video, pcm, dur:pcm.length/16000, sr};
  }};
}
async function decodeFile(file){
  const c=ac(), buf=await file.arrayBuffer(), ab=await c.decodeAudioData(buf);
  const ch=ab.getChannelData(0); return resample(ch, ab.sampleRate, 16000);
}

/* ---------- acoustic analysis (16 kHz mono) ---------- */
function pctl(arr,p){ if(!arr.length) return 0; const a=Float64Array.from(arr).sort(); return a[Math.min(a.length-1,Math.max(0,Math.floor(p*(a.length-1))))]; }
function pitchFrame(buf, sr){
  const n=buf.length, minLag=Math.floor(sr/600), maxLag=Math.floor(sr/65), size=n-maxLag; if(size<64) return 0;
  let mean=0; for(let i=0;i<n;i++) mean+=buf[i]; mean/=n;
  const corr=new Float32Array(maxLag+2);
  for(let lag=minLag;lag<=maxLag+1;lag++){ let s=0,e1=0,e2=0; for(let i=0;i<size;i++){ const a=buf[i]-mean,b=buf[i+lag]-mean; s+=a*b; e1+=a*a; e2+=b*b; } corr[lag]=s/Math.sqrt(e1*e2+1e-12); }
  let best=-1,bl=0; for(let lag=minLag+1;lag<=maxLag;lag++){ if(corr[lag]>corr[lag-1]&&corr[lag]>=corr[lag+1]&&corr[lag]>best){ best=corr[lag]; bl=lag; if(best>0.92) break; } }
  if(best<0.72) return 0;
  const y1=corr[bl-1],y2=corr[bl],y3=corr[bl+1], den=2*(2*y2-y1-y3), d=den?(y3-y1)/den:0;
  return sr/(bl+(isFinite(d)?d:0));
}
function analyze(pcm, opts={}){
  const SRATE=16000, hop=160, N=Math.floor(pcm.length/hop);
  const out={dur:pcm.length/SRATE, ok:false};
  if(N<50){ out.tooShort=true; return out; }
  const db=new Float32Array(N);
  for(let i=0;i<N;i++){ const a=Math.max(0,i*hop-80), b=Math.min(pcm.length,i*hop+240); let s=0; for(let j=a;j<b;j++) s+=pcm[j]*pcm[j]; db[i]=10*Math.log10(s/(b-a)+1e-10); }
  const floor=pctl(db,0.10), peak=pctl(db,0.98);
  const thr=Math.max(floor+0.32*(peak-floor), floor+9);
  let sp=Array.from(db,v=>v>thr);
  for(let i=0;i<N;){ if(!sp[i]){ let j=i; while(j<N&&!sp[j]) j++; if(i>0&&j<N&&j-i<8) for(let k=i;k<j;k++) sp[k]=true; i=j; } else i++; }   // fill gaps < 80 ms
  for(let i=0;i<N;){ if(sp[i]){ let j=i; while(j<N&&sp[j]) j++; if(j-i<5) for(let k=i;k<j;k++) sp[k]=false; i=j; } else i++; }      // drop blips < 50 ms
  const speechFrames=sp.filter(Boolean).length;
  out.floor=floor; out.peak=peak; out.thr=thr;
  const minSp=opts.minSpeech||150;
  if(speechFrames<minSp || peak-floor<10){ out.tooShort=speechFrames<minSp; out.noVoice=peak-floor<10; out.series=mkSeries(db,new Float32Array(Math.ceil(N/2)),sp); return out; }
  // pitch every 20 ms on speech frames
  const F=Math.ceil(N/2), f0=new Float32Array(F), W=640;
  for(let k=0;k<F;k++){ const i=k*2; if(!sp[i]) continue; const a=Math.max(0,i*hop-W/2+80); if(a+W>pcm.length) break; f0[k]=pitchFrame(pcm.subarray(a,a+W),SRATE); }
  // octave-jump cleanup: median filter of 5
  const f0c=new Float32Array(F); for(let k=0;k<F;k++){ const w=[]; for(let d=-2;d<=2;d++){ const v=f0[k+d]; if(v>0) w.push(v); } f0c[k]=f0[k]>0&&w.length>=3?w.sort((x,y)=>x-y)[w.length>>1]:0; }
  const first=sp.indexOf(true), last=N-1-sp.slice().reverse().indexOf(true);
  // pauses and phrases
  const pauses=[], phrases=[]; let segStart=first;
  for(let i=first;i<=last;){ if(!sp[i]){ let j=i; while(j<=last&&!sp[j]) j++; if(j-i>=25){ pauses.push({s:i/100,e:j/100}); phrases.push({s:segStart,e:i}); segStart=j; } i=j; } else i++; }
  phrases.push({s:segStart,e:last+1});
  const total=(last-first+1)/100, pauseTime=pauses.reduce((a,p)=>a+p.e-p.s,0), speak=speechFrames/100;
  // syllable nuclei: envelope peaks, voiced, ≥ 2 dB dip between
  const env=new Float32Array(N); for(let i=0;i<N;i++){ let s=0,c=0; for(let d=-1;d<=1;d++){ const v=db[i+d]; if(v!==undefined){ s+=v; c++; } } env[i]=s/c; }
  let syl=0, lastPk=-100, minSince=Infinity;
  for(let i=1;i<N-1;i++){ minSince=Math.min(minSince,env[i]);
    if(sp[i]&&env[i]>=env[i-1]&&env[i]>env[i+1]&&env[i]>thr+1&&i-lastPk>=7&&env[i]-minSince>=1.5){
      const k=i>>1; if(f0c[k]>0||f0c[k-1]>0||f0c[k+1]>0){ syl++; lastPk=i; minSince=Infinity; } } }
  const voiced=Array.from(f0c).filter(v=>v>0);
  const med=voiced.length?pctl(voiced,0.5):0;
  const st=voiced.map(v=>12*Math.log2(v/med)), mSt=st.reduce((a,b)=>a+b,0)/(st.length||1);
  const sdSt=Math.sqrt(st.reduce((a,b)=>a+(b-mSt)*(b-mSt),0)/(st.length||1));
  const spDb=[]; for(let i=0;i<N;i++) if(sp[i]) spDb.push(db[i]);
  const meanDb=spDb.reduce((a,b)=>a+b,0)/spDb.length;
  let clip=0; for(let i=0;i<pcm.length;i+=4) if(Math.abs(pcm[i])>0.985) clip++;
  // phrase-final checks
  const uptalk=[], trail=[]; let checked=0;
  phrases.forEach(p=>{ if(p.e-p.s<80) return; checked++;
    const k0=p.s>>1, k1=p.e>>1, all=[], end=[];
    for(let k=k0;k<k1;k++) if(f0c[k]>0) all.push(f0c[k]);
    for(let k=Math.max(k0,k1-15);k<k1;k++) if(f0c[k]>0) end.push(f0c[k]);
    if(all.length>10&&end.length>=4){ const rise=12*Math.log2(pctl(end,0.5)/pctl(all,0.5)); const tail=12*Math.log2(end[end.length-1]/end[0]); if(rise>2.5&&tail>1.5) uptalk.push((p.e/100)-0.3); }
    const L=p.e-p.s, firstHalf=[], lastQ=[]; for(let i=p.s;i<p.s+L/2;i++) if(sp[i]) firstHalf.push(db[i]); for(let i=p.e-Math.floor(L/4);i<p.e;i++) if(sp[i]) lastQ.push(db[i]);
    if(firstHalf.length>10&&lastQ.length>5){ const d=firstHalf.reduce((a,b)=>a+b,0)/firstHalf.length-lastQ.reduce((a,b)=>a+b,0)/lastQ.length; if(d>6) trail.push((p.e/100)-0.4); } });
  Object.assign(out,{ok:true, first:first/100, last:last/100, total, speak, pauses, pauseShare:pauseTime/total,
    longPauses:pauses.filter(p=>p.e-p.s>2), syl, rate:syl/total, artRate:syl/speak,
    f0med:med, sdSt, rangeSt:voiced.length?12*Math.log2(pctl(voiced,0.95)/pctl(voiced,0.05)):0,
    meanDb, clipping:clip/(pcm.length/4)>0.001, uptalk, trail, phrasesChecked:checked,
    segDb:phrases.map(p=>{ let s=0,c=0; for(let i=p.s;i<p.e;i++) if(sp[i]){ s+=db[i]; c++; } return {t:p.s/100,db:c?s/c:-90}; }),
    series:mkSeries(db,f0c,sp)});
  return out;
}
function mkSeries(db,f0,sp){ const d=[],m=[]; for(let i=0;i<db.length;i+=2){ d.push(Math.round(db[i])); m.push(sp[i]?1:0); } return {db:d,f0:Array.from(f0,v=>Math.round(v)),sp:m,hop:0.02}; }

/* ---------- syllables from a transcript (more accurate than acoustic peaks when available) ---------- */
function sylCount(text,lang){ let n=0; norm(text).split(" ").forEach(w=>{ if(!w) return; if(/^[0-9]+$/.test(w)){ n+=w.length; return; }
  let x=w; if(lang==="en") x=x.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/,"").replace(/^y/,"");
  if(lang==="fr") x=x.replace(/(ent|es|e)$/,"");
  const m=x.match(/[aeiouy]+/g); n+=Math.max(1,m?m.length:0); }); return n; }
function applySrRate(an,sr,lang){ if(!an||!an.ok||!sr||!sr.text) return; const s=sylCount(sr.text,lang); if(s>=4){ an.sylAcoustic=an.syl; an.syl=s; an.rate=s/an.total; an.artRate=s/an.speak; an.rateSrc="sr"; } }

/* ---------- scoring ---------- */
const clamp01=x=>Math.max(0,Math.min(1,x));
function deliveryScores(an,{statements=true}={}){
  if(!an.ok) return null;
  const r=an.rate;
  const pace = r>=3.5&&r<=5.2 ? 1 : r<3.5 ? clamp01((r-2)/1.5) : clamp01((6.7-r)/1.5);
  const ps=an.pauseShare;
  let pauses = ps>=0.08&&ps<=0.30 ? 1 : ps<0.08 ? 0.5+0.5*ps/0.08 : clamp01(1-(ps-0.30)/0.25);
  pauses=clamp01(pauses-0.15*an.longPauses.length);
  let melody=clamp01((an.sdSt-1)/1.5); if(statements&&an.phrasesChecked) melody=clamp01(melody-0.3*an.uptalk.length/an.phrasesChecked);
  let projection=clamp01((an.meanDb+50)/18); if(an.phrasesChecked) projection=clamp01(projection-0.3*an.trail.length/an.phrasesChecked); if(an.clipping) projection=Math.min(projection,0.7);
  return {pace,pauses,melody,projection};
}
function srClarity(sr, expected){
  if(!sr||!sr.text) return null;
  if(expected){ const ew=norm(expected).split(" "), hw=norm(sr.text).split(" "), bag={}; hw.forEach(w=>bag[w]=(bag[w]||0)+1); let hit=0; const miss=[];
    ew.forEach(w=>{ if(bag[w]>0){ hit++; bag[w]--; } else miss.push(w); }); return {score:hit/ew.length, miss:[...new Set(miss)].slice(0,6)}; }
  const c=sr.confs.filter(x=>x>0); return c.length?{score:clamp01((c.reduce((a,b)=>a+b,0)/c.length-0.5)/0.4),miss:[]}:null;
}
function fillerInfo(text, lang){ const set=new Set(FILLERS[lang].map(norm)); const w=norm(text).split(" ").filter(x=>set.has(x)); return {n:w.length, words:[...new Set(w)]}; }

/* ---------- tips (what worked / what to correct) ---------- */
function makeTips(an, {sr=null, lang=SET.tl, expected=null, statements=true, latency=null}={}){
  const fix=[], good=[], f1=x=>(Math.round(x*10)/10).toLocaleString(SET.ui);
  if(!an.ok){ fix.push({txt:an.noVoice?t("tip_noise"):t("tip_short")}); return {fix,good,scores:null}; }
  if(sr&&sr.text) applySrRate(an,sr,lang);
  const sc=deliveryScores(an,{statements});
  if(an.rate>5.2) fix.push({code:"fast",txt:t("tip_fast",{v:f1(an.rate)})}); else if(an.rate<3.5) fix.push({code:"slow",txt:t("tip_slow",{v:f1(an.rate)})}); else good.push(t("tip_pace_ok",{v:f1(an.rate)}));
  if(an.pauseShare<0.08) fix.push({code:"nopause",txt:t("tip_nopause",{v:Math.round(an.pauseShare*100)})});
  else if(an.pauseShare>0.30) fix.push({code:"manypause",txt:t("tip_manypause",{v:Math.round(an.pauseShare*100)})});
  else if(!an.longPauses.length) good.push(t("tip_pause_ok"));
  an.longPauses.slice(0,3).forEach(p=>fix.push({code:"longpause",t:p.s,txt:t("tip_longpause",{s:f1(p.e-p.s)})}));
  if(an.sdSt<2) fix.push({code:"mono",txt:t("tip_mono",{v:f1(an.sdSt)})}); else good.push(t("tip_melody_ok",{v:f1(an.sdSt)}));
  if(statements) an.uptalk.slice(0,3).forEach(x=>fix.push({code:"uptalk",t:x,txt:t("tip_uptalk")}));
  an.trail.slice(0,3).forEach(x=>fix.push({code:"trail",t:x,txt:t("tip_trail")}));
  if(an.clipping) fix.push({code:"clip",txt:t("tip_clip")});
  else if(an.meanDb<-40) fix.push({code:"quiet",txt:t("tip_quiet",{v:Math.round(an.meanDb)})}); else if(!an.trail.length) good.push(t("tip_loud_ok"));
  const lat = latency!=null ? latency : an.first;
  if(lat>4) fix.push({code:"late",t:0,txt:t("tip_late",{s:f1(lat)})});
  let fluency=null, clarity=null;
  if(sr&&sr.text){
    const fi=fillerInfo(sr.text,lang); fluency=clamp01(1-0.2*fi.n-0.1*an.longPauses.length);
    if(fi.n) fix.push({code:"fillers",txt:t("tip_fillers",{n:fi.n,w:fi.words.join(", ")})}); else good.push(t("tip_nofill"));
    const cl=srClarity(sr,expected); if(cl){ clarity=cl.score; if(cl.score<0.85&&cl.miss.length) fix.push({code:"clarity",miss:cl.miss,txt:t("tip_clarity",{w:cl.miss.join(", ")})}); else if(cl.score>=0.85) good.push(t("tip_clarity_ok")); }
  }
  const scores=Object.assign({},sc); if(fluency!=null) scores.fluency=fluency; if(clarity!=null) scores.clarity=clarity;
  fix.sort((a,b)=>(a.t??-1)-(b.t??-1));
  return {fix,good,scores};
}
function avgScore(sc){ const v=Object.values(sc||{}).filter(x=>x!=null); return v.length?Math.round(100*v.reduce((a,b)=>a+b,0)/v.length):null; }

/* ---------- replay view ---------- */
const DIM_KEYS=["pace","pauses","melody","projection","fluency","clarity"];
function scoreBars(sc){ return DIM_KEYS.filter(k=>sc&&sc[k]!=null).map(k=>{ const v=sc[k]; return `<div class="sc"><span>${t("d_"+k)}</span><div class="bar"><i style="width:${Math.round(v*100)}%;background:${v>=.8?'var(--ok)':v>=.5?'var(--accent2)':'var(--warn)'}"></i></div><b>${Math.round(v*100)}</b></div>`; }).join(""); }
function metricLine(an){ if(!an||!an.ok) return ""; const f1=x=>(Math.round(x*10)/10).toLocaleString(SET.ui);
  return `<p class="muted">${t("m_dur")}: ${f1(an.total)} s · ${t("m_rate")}: ${f1(an.rate)} ${t("m_syl")} · ${t("m_pause")}: ${Math.round(an.pauseShare*100)} % · ${t("m_pitch")}: ${Math.round(an.f0med)} Hz · ${t("m_var")}: ${f1(an.sdSt)} ${t("m_st")} · ${t("m_loud")}: ${Math.round(an.meanDb)} dBFS</p>`; }
function fixDuration(m){ m.addEventListener("loadedmetadata",()=>{ if(m.duration===Infinity||isNaN(m.duration)){ const h=()=>{ m.removeEventListener("timeupdate",h); m.currentTime=0; }; m.addEventListener("timeupdate",h); m.currentTime=1e7; } },{once:true}); }
function replayView(take, {onSave=null, saved=false, extra="", noRegister=false}={}){
  const an=take.an, tips=take.tips||{fix:[],good:[]}, box=el("div",{class:"card flat replay"});
  const url=take.url||(take.blob?URL.createObjectURL(take.blob):null);
  const isV=!!take.video;
  box.innerHTML=`<h3 style="margin-top:0">${t("replay_title")}</h3>
   ${url?(isV?`<video playsinline controls src="${url}" style="width:100%;border-radius:12px;background:#000;max-height:46vh"></video>`:`<audio controls src="${url}" style="width:100%"></audio>`):`<p class="muted">${t("no_media")}</p>`}
   <canvas height="120" style="margin-top:6px"></canvas>
   <p class="muted" style="font-size:.75rem">${t("replay_legend")}</p>
   ${take.score!=null?`<div class="scorebig" style="font-size:2rem;color:${take.score>=75?'var(--ok)':'var(--accent2)'}">${take.score}</div>`:""}
   ${scoreBars(take.scores||tips.scores)}${metricLine(an)}${extra}
   ${tips.fix.length?`<h3>✗ ${t("tips_fix")}</h3><div class="tips-fix"></div>`:""}
   ${tips.good.length?`<h3>✓ ${t("tips_good")}</h3><ul class="list">${tips.good.map(g=>`<li>${esc(g)}</li>`).join("")}</ul>`:""}
   <div class="row" style="margin-top:8px" data-act></div>`;
  const media=box.querySelector("audio,video"), cv=box.querySelector("canvas");
  if(media) fixDuration(media);
  const tf=box.querySelector(".tips-fix");
  if(tf) tips.fix.forEach(x=>{ const r=el("div",{class:"tiprow"},`${x.t!=null&&media?`<button class="b sm alt">▶ ${fmtT(x.t)}</button>`:"•"} <span>${esc(x.txt)}</span>`); const b=r.querySelector("button"); if(b) b.onclick=()=>{ media.currentTime=Math.max(0,x.t-1); media.play().catch(()=>{}); };
    const cid=typeof COACH_OF!=="undefined"&&COACH_OF[x.code]; if(cid&&!noRegister){ const tb=el("button",{class:"b sm warm tipbtn"},"🏋 "+t("train_this")); tb.onclick=()=>{ coachRegister([x],take.title); openCoach(cid); }; r.append(tb); } tf.append(r); });
  if(!saved&&!noRegister&&tips.fix&&tips.fix.length&&typeof coachRegister==="function") coachRegister(tips.fix,take.title);
  const draw=()=>drawTimeline(cv,an,media?media.currentTime:null,tips);
  requestAnimationFrame(draw);
  if(media){ let raf; const loop=()=>{ draw(); if(!media.paused) raf=requestAnimationFrame(loop); }; media.addEventListener("play",loop); media.addEventListener("seeked",draw);
    cv.addEventListener("click",e=>{ const r=cv.getBoundingClientRect(); const d=an&&an.dur||media.duration||1; media.currentTime=(e.clientX-r.left)/r.width*d; draw(); }); }
  const act=box.querySelector("[data-act]");
  if(take.blob){
    if(onSave){ const sb=el("button",{class:"b sm"+(saved?" alt":"")},saved?"✓ "+t("saved"):t("save_lib")); sb.disabled=saved; sb.onclick=async()=>{ sb.disabled=true; try{ await onSave(); sb.textContent="✓ "+t("saved"); sb.classList.add("alt"); }catch(e){ sb.disabled=false; toast(t("lib_fail")); } }; act.append(sb); }
    const sh=el("button",{class:"b sm alt"},"↗ "+t("share")); sh.onclick=()=>shareTake(take); act.append(sh);
    if(topLevel&&url){ act.append(el("a",{href:url,download:takeFileName(take),class:"b sm alt",style:"text-decoration:none;display:inline-flex;align-items:center"},"⬇ "+t("download"))); }
  }
  return box;
}
function fmtT(s){ s=Math.max(0,s); return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0"); }
function drawTimeline(cv, an, cur, tips){
  const dpr=window.devicePixelRatio||1, W=cv.clientWidth*dpr, H=120*dpr; if(!W) return; if(cv.width!==W){ cv.width=W; cv.height=H; }
  const g=cv.getContext("2d"); g.clearRect(0,0,W,H);
  if(!an||!an.series){ return; }
  const S=an.series, n=S.db.length, dur=an.dur||n*S.hop, X=tt=>tt/dur*W, top=H*0.48;
  const lo=(an.floor??-80)-3, hi=(an.peak??-10)+2;
  (an.pauses||[]).forEach(p=>{ g.fillStyle="rgba(200,100,59,.18)"; g.fillRect(X(p.s),0,X(p.e)-X(p.s),H); });
  g.fillStyle=cssv("--accent"); g.globalAlpha=.55;
  for(let i=0;i<n;i++){ const v=Math.max(0,Math.min(1,(S.db[i]-lo)/(hi-lo))); const x=X(i*S.hop), w=Math.max(1,X(S.hop)); g.fillRect(x,top-v*top*0.95,w,v*top*0.95); }
  g.globalAlpha=1;
  const med=an.f0med||0; if(med){ const Y=st=>top+ (H-top)/2 - st/12*((H-top)/2-4);
    g.strokeStyle=cssv("--line"); g.setLineDash([4*dpr,4*dpr]); g.beginPath(); g.moveTo(0,Y(0)); g.lineTo(W,Y(0)); g.stroke(); g.setLineDash([]);
    g.fillStyle=cssv("--accent2"); S.f0.forEach((f,k)=>{ if(f>0){ const st=12*Math.log2(f/med); if(Math.abs(st)<14){ g.beginPath(); g.arc(X(k*S.hop),Y(st),1.6*dpr,0,7); g.fill(); } } }); }
  (tips&&tips.fix||[]).forEach(x=>{ if(x.t==null) return; const xx=X(x.t); g.fillStyle=cssv("--warn"); g.beginPath(); g.moveTo(xx-5*dpr,0); g.lineTo(xx+5*dpr,0); g.lineTo(xx,8*dpr); g.fill(); });
  if(cur!=null){ g.strokeStyle=cssv("--ink"); g.lineWidth=2*dpr; g.beginPath(); g.moveTo(X(cur),0); g.lineTo(X(cur),H); g.stroke(); g.lineWidth=1; }
}

/* ---------- library (IndexedDB) ---------- */
const DB={ db:null,
  open(){ if(this.db) return Promise.resolve(this.db); return new Promise((res,rej)=>{ try{ const r=indexedDB.open("voicecoach",1); r.onupgradeneeded=()=>r.result.createObjectStore("takes",{keyPath:"id"}); r.onsuccess=()=>{ this.db=r.result; res(r.result); }; r.onerror=()=>rej(r.error); }catch(e){ rej(e); } }); },
  async tx(mode,fn){ const db=await this.open(); return new Promise((res,rej)=>{ const tx=db.transaction("takes",mode), st=tx.objectStore("takes"), r=fn(st); tx.oncomplete=()=>res(r&&r.result); tx.onerror=()=>rej(tx.error); }); },
  put(o){ return this.tx("readwrite",s=>s.put(o)); }, all(){ return this.tx("readonly",s=>s.getAll()); }, del(id){ return this.tx("readwrite",s=>s.delete(id)); } };
function slimAn(an){ if(!an) return null; const o={}; ["ok","dur","floor","peak","f0med","sdSt","rate","pauseShare","meanDb","total","first","pauses","series","longPauses","uptalk","trail","phrasesChecked","noVoice","tooShort"].forEach(k=>{ if(an[k]!==undefined) o[k]=an[k]; }); return o; }
async function saveTake(take){
  const o={id:take.id||("t"+Date.now()+Math.random().toString(36).slice(2,6)), t:Date.now(), d:today(), kind:take.kind||"studio", title:take.title||"", lang:take.lang||SET.tl,
    blob:take.blob, video:!!take.video, an:slimAn(take.an), tips:take.tips?{fix:take.tips.fix,good:take.tips.good}:null, scores:take.scores||(take.tips&&take.tips.scores)||null, score:take.score??null, text:take.text||""};
  await DB.put(o); take.id=o.id;
  try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(e){}
  return o;
}
function takeFileName(take){ return `voicecoach-${(take.kind||"take")}-${new Date(take.t||Date.now()).toISOString().slice(0,16).replace(/[:T]/g,"-")}.${(take.blob&&take.blob.type.includes("mp4"))?"mp4":"webm"}`; }
async function shareTake(take){
  try{ const f=new File([take.blob],takeFileName(take),{type:take.blob.type||"audio/webm"});
    if(navigator.canShare&&navigator.canShare({files:[f]})){ await navigator.share({files:[f],title:"VoiceCoach",text:(take.title||"")+(take.score!=null?` – ${take.score}/100`:"")}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  toast(t("share_fail"));
}

/* ---------- recorder button helper (shared UI) ---------- */
function recControls(box,{video=false, lang=null, maxSec=120, onDone, onStart=null, onPitch=null, label}){
  box.innerHTML=`<div class="row"><button class="b warm grow" data-rec>${label||t("rec_start")}</button><span class="big" data-tm style="font-size:1.3rem;margin:0">0:00</span></div>
    <div class="meter" style="margin-top:6px"><i data-lv></i></div><div data-pv></div><div class="bubble me hidden" data-tx></div><p class="muted hidden" data-an>${t("analysing")}</p>`;
  const btn=box.querySelector("[data-rec]"), tm=box.querySelector("[data-tm]"), lv=box.querySelector("[data-lv]"), tx=box.querySelector("[data-tx]"), pv=box.querySelector("[data-pv]");
  let take=null, timer=null;
  btn.onclick=async()=>{
    if(take){ const tk=take; take=null; clearTimeout(timer); btn.disabled=true; box.querySelector("[data-an]").classList.remove("hidden");
      const r=await tk.stop(); pv.innerHTML=""; keepAwake(false); btn.disabled=false; btn.textContent=label||t("rec_start"); box.querySelector("[data-an]").classList.add("hidden"); lv.style.width="0";
      setTimeout(()=>onDone(r),30); return; }
    try{ try{ speechSynthesis.cancel(); }catch(e){} ac(); onStart&&onStart(performance.now()); tx.textContent=""; tx.classList.add("hidden");
      take=await startTake({video,lang,onPitch,onLevel:(d,s)=>{ lv.style.width=Math.max(0,Math.min(100,(d+70)/60*100))+"%"; tm.textContent=fmtT(s); },
        onText:txt=>{ tx.classList.remove("hidden"); tx.textContent=txt; }});
      if(video){ const v=el("video",{playsinline:"",muted:"",autoplay:"",style:"width:100%;border-radius:12px;margin-top:6px;transform:scaleX(-1);max-height:40vh;background:#000"}); v.muted=true; v.srcObject=take.stream; pv.append(v); }
      btn.textContent=t("rec_stop"); keepAwake(true); timer=setTimeout(()=>{ if(take) btn.onclick(); },maxSec*1000);
    }catch(e){ micError(e); toast(t("mic_fail")); take=null; }
  };
  return {isRecording:()=>!!take};
}
