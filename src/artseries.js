/* ================= articulation: series check with error analysis (v3.2) ================= */
/* Rough grapheme → sound-class tokens, so that "Sonne" vs "Tonne" becomes s→t, "Schule" vs "Sule" ʃ→s */
const SND_TOKENS={de:/sch|ch|ck|ng|qu|ph|ß|[a-zäöü]/g, en:/sh|ch|th|ck|ng|qu|ph|wh|[a-z]/g, fr:/ch|gn|qu|ph|ou|au|eau|an|en|on|in|[a-zàâçéèêëîïôûùü]/g};
function sndClass(tok,next,lang){
  const v="aeiouyäöüàâéèêëîïôûùœ";
  if(lang==="de"){ return ({sch:"ʃ",ch:"ç",ck:"k",ng:"ŋ",qu:"kv",ph:"f",ß:"s",z:"ts",v:"f",w:"v",c:"k",j:"j",x:"ks"}[tok])||(v.includes(tok)?"V":tok); }
  if(lang==="en"){ if(tok==="c") return "eiy".includes(next||"")?"s":"k"; return ({sh:"ʃ",ch:"tʃ",th:"θ",ck:"k",ng:"ŋ",qu:"kw",ph:"f",wh:"w",x:"ks",j:"dʒ"}[tok])||(v.includes(tok)?"V":tok); }
  if(tok==="c") return "eiy".includes(next||"")?"s":"k"; if(tok==="g") return "eiy".includes(next||"")?"ʒ":"g";
  return ({ch:"ʃ",gn:"ɲ",qu:"k",ph:"f",ç:"s",j:"ʒ",ou:"V",au:"V",eau:"V",an:"Ṽ",en:"Ṽ",on:"Ṽ",in:"Ṽ",h:"",x:"ks"}[tok])??(v.includes(tok)?"V":tok);
}
function toSounds(word,lang){ const w=String(word).toLowerCase().replace(/[^a-zäöüßàâçéèêëîïôûùœ]/g,""); const toks=w.match(SND_TOKENS[lang])||[];
  if(lang==="fr"&&toks.length>2){ if(toks[toks.length-1]==="e") toks.pop(); if("tsdxz".includes(toks[toks.length-1])&&toks.length>2) toks.pop(); if(toks[toks.length-1]==="e"&&toks.length>2) toks.pop(); }
  const isV=x=>!!x&&/^[aeiouyäöüàâéèêëîïôûùœ]|^(ou|au|eau|an|en|on|in)$/.test(x);
  const out=[]; toks.forEach((tk,i)=>{ let c=sndClass(tk,toks[i+1]&&toks[i+1][0],lang); if(!c) return;
    if(lang==="fr"&&tk==="s"&&isV(toks[i-1])&&isV(toks[i+1])) c="z";
    if(c!=="V"&&c.length===1&&out[out.length-1]===c) return; [...(c.length===2&&c!=="tʃ"&&c!=="dʒ"?c:[c])].forEach(x=>{ if(!(x==="V"&&out[out.length-1]==="V")) out.push(x); }); }); return out; }
/* Levenshtein alignment over sound classes → list of operations */
function alignSounds(a,b){ const n=a.length,m=b.length,D=[...Array(n+1)].map(()=>new Array(m+1).fill(0));
  for(let i=0;i<=n;i++) D[i][0]=i; for(let j=0;j<=m;j++) D[0][j]=j;
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++) D[i][j]=Math.min(D[i-1][j]+1,D[i][j-1]+1,D[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  const ops=[]; let i=n,j=m;
  while(i>0||j>0){ if(i>0&&j>0&&D[i][j]===D[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){ if(a[i-1]!==b[j-1]) ops.unshift({op:"sub",a:a[i-1],b:b[j-1],i:i-1}); i--; j--; }
    else if(i>0&&D[i][j]===D[i-1][j]+1){ ops.unshift({op:"del",a:a[i-1],i:i-1}); i--; } else { ops.unshift({op:"ins",b:b[j-1],i}); j--; } }
  return {dist:D[n][m],ops}; }
const SND_LABEL={"ʃ":{de:"sch",en:"sh",fr:"ch"},"ç":{de:"ch",en:"ch",fr:"ch"},"θ":{en:"th"},"ʒ":{fr:"j",en:"zh",de:"j"},"ŋ":{de:"ng",en:"ng",fr:"ng"},"ts":{de:"z"},"tʃ":{en:"ch"},"dʒ":{en:"j"},"V":{de:"Vokal",en:"vowel",fr:"voyelle"},"Ṽ":{fr:"voyelle nasale",de:"Nasalvokal",en:"nasal vowel"},"ɲ":{fr:"gn"}};
const sndLabel=(c,l)=>(SND_LABEL[c]&&(SND_LABEL[c][l]||SND_LABEL[c].de||SND_LABEL[c].en))||c;
/* specific correction hints for typical substitutions: key "target>heard" */
const CONF_KEYS={"s>t":"stop","s>d":"stop","z>d":"stop","s>θ":"lisp","z>θ":"lisp","s>f":"lisp","s>ʃ":"s_sh","z>ʒ":"s_sh","ʃ>s":"sh_s","ʒ>z":"sh_s","ʃ>ç":"sh_s","ç>ʃ":"ch_sh","ç>s":"ch_sh","k>t":"front","g>d":"front","k>p":"front","t>k":"back","d>g":"back","r>l":"r_l","r>w":"r_w","r>v":"r_w","l>r":"l_r","r>V":"r_vowel","f>p":"f_p","v>b":"f_p","θ>f":"th","θ>s":"th","θ>t":"th","ð>d":"th","ʒ>ʃ":"voice","z>s":"voice","v>f":"voice","b>p":"voice","d>t":"voice","g>k":"voice","s>z":"devoice","p>b":"devoice","t>d":"devoice","k>g":"devoice","ts>s":"ts_s","ts>t":"ts_s"};
function wordDiagnosis(target,heardText,lang){
  const words=norm(heardText||"").split(" ").filter(Boolean), tn=norm(target);
  if(!words.length) return {ok:false,heard:"",hints:[{k:"h_unrec"}]};
  if(tn.includes(" ")){ // sentence: word-level check
    const hs=new Set(words), tw=tn.split(" "), miss=tw.filter(w=>!hs.has(w));
    const ok=miss.length/tw.length<=0.2; return {ok,heard:heardText,hints:ok?[]:[{k:"h_words",w:miss.join(", ")}],miss}; }
  if(words.includes(tn)) return {ok:true,heard:heardText,hints:[]};
  const T=toSounds(target,lang); let best=null;
  words.forEach(w=>{ const H=toSounds(w,lang), al=alignSounds(T,H); if(!best||al.dist<best.al.dist) best={w,H,al}; });
  const hints=[]; const al=best.al, rel=al.dist/Math.max(1,T.length);
  if(rel>0.6){ hints.push({k:"h_unrec"}); return {ok:false,heard:heardText,best:best.w,hints}; }
  const posOf=i=>i<=0?"pos_start":i>=T.length-1?"pos_end":"pos_mid";
  al.ops.slice(0,2).forEach(o=>{
    if(o.op==="sub"&&!(o.a==="V"&&o.b==="V")){ const key=CONF_KEYS[o.a+">"+o.b]; hints.push({k:"h_sub",a:sndLabel(o.a,lang),b:sndLabel(o.b,lang),pos:posOf(o.i),conf:key}); }
    else if(o.op==="del"){ if(o.i>=T.length-1) hints.push({k:"h_end",a:sndLabel(o.a,lang)}); else if(o.i===0) hints.push({k:"h_start",a:sndLabel(o.a,lang)}); else hints.push({k:"h_del",a:sndLabel(o.a,lang),pos:posOf(o.i)}); }
    else if(o.op==="ins") hints.push({k:"h_ins",b:sndLabel(o.b,lang)});
  });
  if(!hints.length) hints.push({k:"h_close"});
  return {ok:false,heard:heardText,best:best.w,hints};
}
function hintText(h){ const s=t(h.k,{a:h.a,b:h.b,w:h.w||"",pos:h.pos?t(h.pos):""}); return h.conf?s+" "+t("conf_"+h.conf):s; }

/* ---------- series runner ---------- */
let SER=null;
function artRecord(lang,snd,ok){ const k=lang+"|"+snd, a=store.art[k]||[]; a.push(ok?1:0); store.art[k]=a.slice(-50); store.artDay[today()]=(store.artDay[today()]||0)+1; if(store.artDay[today()]===10) markPlan("drill","art"); save(); }
function serWords(n){ const L=ART[SET.tl][SP.snd][SP.pos].slice(); for(let i=L.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [L[i],L[j]]=[L[j],L[i]]; } return L.slice(0,Math.min(n,L.length)); }
function renderSerSetup(){
  const box=$("#serBox"); if(!box) return; if(SER&&SER.running) return;
  if(SER&&(SER.snd!==SP.snd||SER.lang!==SET.tl||SER.pos!==SP.pos)){ SER.results.forEach(r=>r.url&&URL.revokeObjectURL(r.url)); SER=null; }
  const cnt=store.set.serN||8, model=store.set.serModel!==false;
  box.innerHTML=`<h3 style="margin-top:4px">${t("ser_title")}</h3><p class="muted">${t("ser_desc")}</p>
    <div class="row"><span class="muted">${t("ser_count")}:</span><div class="chips" id="serN"></div></div>
    <label class="check"><input type="checkbox" id="serModel" ${model?"checked":""}> <span>${t("ser_model")}</span></label>
    <button class="b warm" style="width:100%" id="serStart">${t("ser_start")}</button><div id="serOut"></div>`;
  chipSet($("#serN"),[[5,"5"],[8,"8"],[10,"10"]],cnt,v=>{ store.set.serN=+v; save(); renderSerSetup(); });
  $("#serModel").onchange=e=>{ store.set.serModel=e.target.checked; save(); };
  $("#serStart").onclick=()=>startSeries(serWords(cnt));
  if(SER&&SER.results) renderSerSummary();
}
function startSeries(words){
  if(SER&&SER.results) SER.results.forEach(r=>r.url&&URL.revokeObjectURL(r.url));
  ac(); keepAwake(true);
  SER={words,i:0,results:[],running:true,lang:SET.tl,snd:SP.snd,pos:SP.pos,model:store.set.serModel!==false,auto:!!srLang(),t0:Date.now()};
  serWord();
}
function serWord(){
  const S=SER, box=$("#serBox"); if(!S||!S.running) return;
  if(S.i>=S.words.length){ S.running=false; keepAwake(false); finishSeries(); return; }
  const w=S.words[S.i];
  box.innerHTML=`<div class="row"><b class="grow">${t("ser_word",{i:S.i+1,n:S.words.length})}</b><button class="b sm alt" id="serStop">${t("cancel")}</button></div>
    <div class="step">${S.words.map((_,k)=>`<i class="${k<S.i?'d':''}" style="${k<S.i?(S.results[k].ok?'':'background:var(--warn)'):''}"></i>`).join("")}</div>
    <div class="huge" ${tlAttr(SET.tl)} style="font-size:${w.length>18?'1.4rem':'2.4rem'}">${esc(w)}</div>
    <div class="meter"><i id="serLv"></i></div><p class="muted" id="serState" style="text-align:center;min-height:1.3em"></p>
    <div class="bubble me hidden" id="serHeard"></div>
    <div class="row"><button class="b grow" id="serGo">${t("ser_next")}</button></div>`;
  $("#serStop").onclick=()=>{ if(S.take) S.take.stop().catch(()=>{}); S.running=false; keepAwake(false); SER=null; renderSerSetup(); };
  const go=()=>{ $("#serState").textContent=t("ser_listen"); beep(880,.07,.08); recordWord(w); };
  if(S.model){ $("#serState").textContent="🔊"; speak(w,S.lang,()=>{ if(SER===S&&S.running) setTimeout(go,250); }, 0.85, "model"); } else go();
  $("#serGo").onclick=()=>{ if(S.take) S.stopNow&&S.stopNow(); };
}
async function recordWord(w){
  const S=SER, isSent=w.includes(" "), maxMs=isSent?9000:4500; let floor=null, fl=[], started=false, quietSince=null, stopped=false;
  const stopNow=async()=>{ if(stopped||!S.take) return; stopped=true; const tk=S.take; S.take=null; $("#serState").textContent=t("analysing"); const r=await tk.stop(); evalWord(w,r); };
  S.stopNow=stopNow;
  try{
    S.take=await startTake({lang:S.auto?S.lang:null,onText:txt=>{ const h=$("#serHeard"); if(h){ h.classList.remove("hidden"); h.textContent=txt; } },
      onLevel:(db,sec)=>{ const lv=$("#serLv"); if(lv) lv.style.width=Math.max(0,Math.min(100,(db+70)/60*100))+"%";
        if(sec<0.3){ fl.push(db); return; } if(floor===null) floor=Math.min(-50,fl.reduce((a,b)=>a+b,0)/Math.max(1,fl.length));
        if(!started&&db>floor+14) started=true;
        if(started){ if(db<floor+7){ if(quietSince===null) quietSince=sec; else if(sec-quietSince>0.8) stopNow(); } else quietSince=null; }
        if(sec*1000>maxMs) stopNow(); }});
  }catch(e){ micError(e); toast(t("mic_fail")); S.running=false; keepAwake(false); SER=null; renderSerSetup(); }
}
function evalWord(w,r){
  const S=SER; if(!S) return;
  const an=analyze(r.pcm,{minSpeech:20}), url=r.blob?URL.createObjectURL(r.blob):null;
  let res={word:w,blob:r.blob,url,an,heard:r.sr.text||"",ok:null,hints:[]};
  if(S.auto&&(r.sr.text||!an.ok)){ Object.assign(res,wordDiagnosis(w,r.sr.text,S.lang)); }
  if(an.ok&&an.meanDb<-42) res.hints.push({k:"h_quiet"});
  if(!r.sr.text){ res.ok=null; if(!an.ok) res.hints=[{k:"h_unrec"}]; if(S.auto&&an.ok){ S.srMiss=(S.srMiss||0)+1; if(S.srMiss>=2){ S.auto=false; toast(t("conc_note")); } } }
  S.results[S.i]=res;
  if(res.ok!==null) artRecord(S.lang,S.snd,res.ok);
  const st=$("#serState"); if(st) st.innerHTML=res.ok===true?`<b style="color:var(--ok)">✓ ${t("ser_ok")}</b>`:res.ok===false?`<b style="color:var(--warn)">✗ ${esc(res.heard||t("ser_none"))}</b>`:"";
  beep(res.ok===false?440:res.ok?990:700,.1,.08);
  S.i++; setTimeout(serWord,res.ok===null?500:1100);
}
function finishSeries(){ markPlan("art",SER.snd); if(SER.results.some(r=>r.ok===false)) coachRegisterExt("art:"+SER.lang+"|"+SER.snd,t("ser_title")); logSession(t("ser_title")+" "+SER.snd,Math.max(0.5,(Date.now()-SER.t0)/60000)); markPlan("drill","art"); renderSerSummary(); showArtMastery(); renderSpeech(); }
function renderSerSummary(){
  const S=SER, box=$("#serBox"); if(!S) return;
  const judged=S.results.filter(r=>r.ok!==null), ok=judged.filter(r=>r.ok).length, open=S.results.filter(r=>r.ok===null).length;
  box.innerHTML=`<h3 style="margin-top:4px">${t("ser_title")} – ${esc(S.snd)} (${t("pos_"+S.pos)})</h3>
    <div class="scorebig" style="color:${ok===S.results.length?'var(--ok)':'var(--accent2)'}">${ok}/${S.results.length}</div>
    <p style="text-align:center" class="muted">${t("ser_result",{c:ok,n:S.results.length})}${open?" · "+t("ser_open",{n:open}):""}</p>
    ${ok===S.results.length?`<div class="okbox">${t("ser_all_ok")}</div>`:""}
    <div id="serList"></div><div class="row" style="margin-top:10px" id="serBtns"></div>`;
  const L=$("#serList");
  S.results.forEach((r,idx)=>{
    const c=el("div",{class:"card",style:"padding:10px;margin:8px 0;border-left:5px solid "+(r.ok===true?"var(--ok)":r.ok===false?"var(--warn)":"var(--line)")});
    c.innerHTML=`<div class="row"><b class="grow" style="font-size:1.2rem">${r.ok===true?"✓":r.ok===false?"✗":"?"} <span ${tlAttr(S.lang)}>${esc(r.word)}</span></b></div>
      ${r.heard||r.ok===false?`<p class="muted">${t("ser_heard",{w:esc(r.heard||t("ser_none"))})}</p>`:""}
      ${r.hints.length?`<ul class="list">${r.hints.map(h=>`<li>${esc(hintText(h))}</li>`).join("")}</ul>`:""}
      ${r.ok===false?`<p class="muted"><b>${t("how_sound")}</b> ${esc(artTip(S.lang,S.snd))}</p>`:""}
      <div class="row"></div>`;
    const row=c.querySelector(".row:last-child");
    if(r.url){ const a=new Audio(r.url); const pb=el("button",{class:"b sm alt"},t("ser_your")); pb.onclick=()=>{ a.currentTime=0; a.play().catch(()=>{}); }; row.append(pb); }
    const m1=el("button",{class:"b sm alt"},t("ser_model_btn")); m1.onclick=()=>speak(r.word,S.lang,null,0.9,"model");
    const m2=el("button",{class:"b sm alt"},t("ser_slow")); m2.onclick=()=>speak(r.word,S.lang,null,0.55,"model"); row.append(m1,m2);
    if(r.ok===null){ const y=el("button",{class:"b sm",style:"background:var(--ok)"},"✓"), n=el("button",{class:"b sm",style:"background:var(--warn)"},"✗");
      y.onclick=()=>{ r.ok=true; artRecord(S.lang,S.snd,true); renderSerSummary(); showArtMastery(); }; n.onclick=()=>{ r.ok=false; artRecord(S.lang,S.snd,false); renderSerSummary(); showArtMastery(); };
      row.append(el("span",{class:"muted"},t("ser_self")),y,n); }
    if(r.ok===false){ const pr=el("button",{class:"b sm warm"},t("ser_practice")); pr.onclick=()=>practiceOne(idx,c); row.append(pr); }
    L.append(c);
  });
  const B=$("#serBtns"), wrong=S.results.filter(r=>r.ok===false).map(r=>r.word);
  if(wrong.length){ const b=el("button",{class:"b warm grow"},t("ser_retry",{n:wrong.length})); b.onclick=()=>startSeries(wrong); B.append(b); }
  const nb=el("button",{class:"b grow"},t("ser_new")); nb.onclick=()=>startSeries(serWords(store.set.serN||8)); B.append(nb);
  const cb=el("button",{class:"b alt"},t("close")); cb.onclick=()=>{ SER=null; renderSerSetup(); }; B.append(cb);
}
/* single-word practice: model first, then record, then update the entry in the summary */
function practiceOne(idx,card){
  const S=SER, r0=S.results[idx], w=r0.word, st=el("p",{class:"muted"},"🔊"); card.append(st);
  speak(w,S.lang,async()=>{ st.textContent=t("ser_listen"); beep(880,.07,.08);
    let floor=null,fl=[],started=false,qs=null,done=false,tk=null;
    const fin=async()=>{ if(done||!tk) return; done=true; st.textContent=t("analysing"); const r=await tk.stop();
      const res={word:w,url:r.blob?URL.createObjectURL(r.blob):null,an:analyze(r.pcm,{minSpeech:20}),heard:r.sr.text||"",ok:null,hints:[]};
      if(r.sr.text) Object.assign(res,wordDiagnosis(w,r.sr.text,S.lang)); if(res.ok!==null) artRecord(S.lang,S.snd,res.ok);
      if(r0.url) URL.revokeObjectURL(r0.url); S.results[idx]=res; renderSerSummary(); showArtMastery(); };
    try{ tk=await startTake({lang:S.auto?S.lang:null,onLevel:(db,sec)=>{ if(sec<0.3){ fl.push(db); return; } if(floor===null) floor=Math.min(-50,fl.reduce((a,b)=>a+b,0)/Math.max(1,fl.length));
        if(!started&&db>floor+14) started=true; if(started){ if(db<floor+7){ if(qs===null) qs=sec; else if(sec-qs>0.8) fin(); } else qs=null; } if(sec>5) fin(); }}); }
    catch(e){ micError(e); st.textContent="✗"; }
  },0.8,"model");
}
