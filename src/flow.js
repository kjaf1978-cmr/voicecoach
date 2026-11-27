/* ================= v5.9: Spontaneous speaking – learning path, drills, scoring, live capstone ================= */
const FLM={ // language markers (normalised by norm() at runtime)
 en:{q:["what","how","why","where","when","who","which","tell me","do you","did you","are you","have you","is it","was it","would you","could you","can you","will you","and you","what about you","how about you","you ever","isn t it","don t you"],
  open:["what","how","why","where","when","who","which","tell me","what s","how s","what made","how come"],
  self:["i","i m","i ve","i d","i ll","my","me","we","our","us","mine"],
  seq:["first","then","after that","afterwards","in the end","finally","later","next","at first","eventually","suddenly","before","when"],
  feel:["love","loved","fun","funny","great","amazing","embarrassing","proud","nervous","scared","happy","surprised","surprisingly","honestly","wonderful","awful","terrible","exciting","excited","relaxed","beautiful","favourite","favorite","enjoyed","laughed","cried","felt","miss","hated"],
  num:["one","two","three","four","five","six","seven","eight","nine","ten","twelve","twenty","hundred","first","second","third","half","dozen","monday","tuesday","wednesday","thursday","friday","saturday","sunday","january","february","march","april","may","june","july","august","september","october","november","december"],
  prep:{p:["i think","i believe","in my view","in my opinion","for me","i d say","i would say","my answer","personally","i feel"],r:["because","the reason","since","that s why","due to","as"],e:["for example","for instance","i remember","once","when i","last year","last week","a friend","imagine","take"],c:["so","that s why","in short","to sum up","in the end","all in all","overall","which is why","therefore","that is why"]},
  yes:["yes","yes and","and","absolutely","great idea","sure","of course","exactly","definitely","oh yes"],no:["no","but","not","can t","won t","impossible","don t think"],
  spine:["once upon","every day","one day","because of that","until finally","finally","ever since"]},
 de:{q:["was","wie","warum","wieso","weshalb","wo","wann","wer","welche","welcher","welches","erzähl","erzählen sie","hast du","haben sie","bist du","sind sie","kannst du","können sie","magst du","mögen sie","warst du","waren sie","und du","und sie","und bei dir","und bei ihnen","oder","weißt du","stimmt s"],
  open:["was","wie","warum","wieso","weshalb","wo","wann","wer","welche","welcher","welches","erzähl","woher","wohin","worauf"],
  self:["ich","mein","meine","meinen","meinem","meiner","mir","mich","wir","uns","unser","unsere"],
  seq:["zuerst","dann","danach","anschließend","am ende","schließlich","später","als nächstes","erst","plötzlich","vorher","als"],
  feel:["toll","lustig","schön","peinlich","stolz","nervös","angst","glücklich","überrascht","überraschend","ehrlich","wunderbar","furchtbar","schrecklich","spannend","entspannt","liebe","geliebt","spaß","gelacht","geweint","gefühlt","vermisse","gehasst","lieblings","riesiger"],
  num:["eins","ein","zwei","drei","vier","fünf","sechs","sieben","acht","neun","zehn","zwölf","zwanzig","hundert","ersten","zweiten","dritten","halb","montag","dienstag","mittwoch","donnerstag","freitag","samstag","sonntag","januar","februar","märz","april","mai","juni","juli","august","september","oktober","november","dezember"],
  prep:{p:["ich denke","ich finde","ich glaube","meiner meinung","für mich","ich würde sagen","meine antwort","persönlich","aus meiner sicht"],r:["weil","denn","der grund","da","deshalb","deswegen"],e:["zum beispiel","beispielsweise","ich erinnere mich","einmal","als ich","letztes jahr","letzte woche","ein freund","eine freundin","stell dir vor"],c:["also","deshalb","kurz gesagt","zusammengefasst","am ende","alles in allem","insgesamt","darum","daher"]},
  yes:["ja","ja und","und","genau","super idee","klar","natürlich","absolut","auf jeden fall","oh ja"],no:["nein","aber","nicht","geht nicht","unmöglich","glaube nicht"],
  spine:["es war einmal","jeden tag","eines tages","deshalb","bis schließlich","schließlich","seitdem"]},
 fr:{q:["quoi","comment","pourquoi","où","quand","qui","quel","quelle","quels","quelles","raconte","racontez","est-ce que","est ce que","tu as","vous avez","as-tu","avez-vous","tu es","vous êtes","et toi","et vous","de ton côté","de votre côté","non","hein","qu est-ce","qu est ce","tu connais","tu veux","tu préfères"],
  open:["quoi","comment","pourquoi","où","quand","qui","quel","quelle","raconte","racontez","qu est-ce","qu est ce","d où"],
  self:["je","j","moi","mon","ma","mes","me","m","nous","notre","nos","on"],
  seq:["d abord","puis","ensuite","après","finalement","enfin","plus tard","au début","soudain","avant","quand","à la fin"],
  feel:["génial","drôle","super","honte","fier","fière","nerveux","peur","heureux","surpris","étonnamment","honnêtement","franchement","magnifique","horrible","passionnant","détendu","adore","adoré","amusé","ri","pleuré","senti","manque","déteste","préféré","sympa"],
  num:["un","une","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","douze","vingt","cent","premier","première","deuxième","troisième","demi","lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche","janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
  prep:{p:["je pense","je crois","à mon avis","selon moi","pour moi","je dirais","ma réponse","personnellement","je trouve"],r:["parce que","car","la raison","puisque","c est pour ça","comme"],e:["par exemple","je me souviens","une fois","quand j","l année dernière","la semaine dernière","un ami","une amie","imagine"],c:["donc","c est pourquoi","en bref","pour résumer","finalement","au final","bref","en somme","voilà pourquoi"]},
  yes:["oui","oui et","et","absolument","bonne idée","carrément","bien sûr","exactement","génial","trop bien"],no:["non","mais","pas","impossible","je crois pas","je ne pense pas"],
  spine:["il était une fois","chaque jour","un jour","à cause de cela","à cause de ça","jusqu à ce que","finalement","depuis"]}};

FLM.en.feel=FLM.en.feel.concat(["remember", "lovely", "magical", "best", "worst", "weird", "weirdly", "ridiculously", "shaking", "needed", "incredible", "unforgettable", "human", "exactly what"]);
FLM.en.seq=FLM.en.seq.concat(["after", "ago", "since", "ever since", "at the end", "last", "the next day"]);
FLM.en.num=FLM.en.num.concat(["morning", "night", "evening", "weekend", "summer", "winter", "autumn", "spring", "month", "week", "year", "hours"]);
FLM.de.feel=FLM.de.feel.concat(["erinnere", "herrlich", "seltsam", "lächerlich", "gezittert", "gebraucht", "besten", "beste", "wunderbar", "nervös", "magisch", "unvergesslich"]);
FLM.de.seq=FLM.de.seq.concat(["nach", "seitdem", "vor", "letzten", "am nächsten", "danach"]);
FLM.de.num=FLM.de.num.concat(["morgens", "abends", "nachts", "wochenende", "sommer", "winter", "herbst", "frühling", "monat", "woche", "jahr", "stunden"]);
FLM.fr.feel=FLM.fr.feel.concat(["souviens", "adorais", "bizarrement", "ridiculement", "tremblaient", "besoin", "meilleur", "meilleure", "inoubliable", "magique", "désagréable", "bien ri", "rêve"]);
FLM.fr.seq=FLM.fr.seq.concat(["après", "depuis", "il y a", "dernier", "dernière", "le lendemain"]);
FLM.fr.num=FLM.fr.num.concat(["matin", "soir", "nuit", "week-end", "été", "hiver", "automne", "printemps", "mois", "semaine", "an", "ans", "heures"]);
const FL_GENERIC=new Set(["going", "brings", "though", "people", "turn", "back", "went", "love", "make", "made", "much", "many", "very", "here", "said", "says", "want", "need", "happily", "answer", "moment", "something", "little", "subject", "changing", "really", "things", "today", "think", "would", "could", "about", "there", "maybe", "actually", "honestly", "question", "meet", "great", "lovely", "interesting", "sounds", "always", "never", "people", "everyone", "anything", "everything", "nothing", "right", "where", "which", "while", "other", "another", "first", "second", "better", "course", "again", "still", "bit", "kind", "sure", "thanks", "thank", "pleasure", "welcome", "let", "ask", "tell", "happy", "glad", "nice", "good", "well", "yeah", "okay", "hello", "again", "gerade", "wirklich", "etwas", "einfach", "immer", "schon", "heute", "vielleicht", "eigentlich", "ehrlich", "frage", "schön", "super", "interessant", "klingt", "erzähl", "erzählen", "danke", "gerne", "bitte", "natürlich", "irgendwie", "wieder", "noch", "einmal", "moment", "antworte", "antworten", "vraiment", "quelque", "chose", "toujours", "jamais", "aujourd", "peut-être", "franchement", "question", "super", "intéressant", "raconte", "raconter", "merci", "volontiers", "bien", "sûr", "encore", "moment", "répondre", "réponds"].map(x=>norm(x)));
const FL_STOPW=new Set("the a an and or but so to of in on at for with from by is are was were be been am it this that there here very really just also then as do did does have has had not can will would should could der die das ein eine einen und oder aber so zu von in im am an auf für mit ist sind war waren sein bin es dies das da hier sehr wirklich nur auch dann als le la les un une des et ou mais donc de du à au aux en dans sur pour avec est sont était être suis ce cet cette ça là ici très vraiment juste aussi puis que qui".split(" "));
const FLOW={view:"home",typed:false};
function fl(){ if(!store.flow) store.flow={cur:"reflex",passed:{},st:{},hist:[],xp:0,streak:{d:"",n:0},placed:false,auto:true}; return store.flow; }
function flSt(k){ const f=fl(); f.st[k]=f.st[k]||{n:0,sum:0,best:0,last:[]}; return f.st[k]; }
function flUnlocked(k){ const f=fl(), i=FLOW_ST.indexOf(k); return i===0||FLOW_ST.slice(0,i).every(s=>f.passed[s])||FLOW_ST.indexOf(f.cur)>=i; }
function flLearn(k){ return (FLOW_LEARN[SET.ui]||FLOW_LEARN.en)[k]; }
const flN=a=>a.map(x=>norm(x));
function flHas(tn,list){ const pad=" "+tn+" "; return list.some(p=>{ const k=norm(p); return k&&pad.includes(" "+k+" "); }); }
function flCount(tn,list){ const pad=" "+tn+" "; return new Set(list.map(norm).filter(k=>k&&pad.includes(" "+k+" "))).size; }
function flQuestion(raw,lang){ if(/\?/.test(raw)) return true; const tn=norm(raw); const M=FLM[lang]; if(flHas(tn,M.q)) return true;
  if(lang==="en"&&/^(do|did|are|is|was|were|have|has|can|could|would|will|shall)\b/.test(tn)) return true; if(lang==="de"&&/^(hast|habt|haben|bist|seid|sind|kannst|können|magst|warst|waren|willst|wollen)\b/.test(tn)) return true; return false; }
function flTail(raw,n){ const w=String(raw).split(/\s+/); return w.slice(-n).join(" "); }
function flContent(tn){ return tn.split(" ").filter(w=>w.length>2&&!FL_STOPW.has(w)); }

/* ---------- items for each stage ---------- */
const rndPick=(a,n)=>a.slice().sort(()=>Math.random()-0.5).slice(0,n);
function flItems(k,n,lang){
  const L=x=>x[lang]||x.en;
  if(k==="reflex") return rndPick(FL_REFLEX,n).map(q=>{ const [p,ack,ex]=L(q); return {st:k,kind:"reflex",say:p,ack,ex}; });
  if(k==="hooks") return rndPick(FL_HOOKS,n).map(q=>{ const [p,hooks,ex]=L(q); return {st:k,kind:"hooks",say:p,hooks,ex}; });
  if(k==="story") return rndPick(FL_STORY,n).map(q=>{ const [p,ex]=L(q); return {st:k,kind:"story",say:p,ex,max:90}; });
  if(k==="improv"){ const out=[]; const kinds=["yesand","three","yesand","spine","three","expert","yesand","three"];
    for(let i=0;i<n;i++){ const kd=kinds[i%kinds.length];
      if(kd==="yesand"){ const [p,ex]=L(rnd(FL_YESAND)); out.push({st:k,kind:"yesand",say:p,ex}); }
      if(kd==="three"){ const c=rnd(FL_THREE[lang]); out.push({st:k,kind:"three",show:t("fl_three",{c}),say:t("fl_three_say",{c}),max:12}); }
      if(kd==="spine"){ const sp=rnd(FL_SPINE), [s]=L(sp), ex=L(FL_SPINE[0])[1]; out.push({st:k,kind:"spine",show:t("fl_spine",{s}),say:t("fl_spine_say",{s}),ex,max:90,manual:true}); }
      if(kd==="expert"){ const tp=rnd(FL_EXPERT[lang]); out.push({st:k,kind:"expert",show:t("fl_expert",{s:tp}),say:t("fl_expert_say",{s:tp}),max:60,manual:true}); } }
    return out; }
  if(k==="steer") return rndPick(FL_STEER,n).map(q=>{ const [type,p,kw,ex]=L(q); return {st:k,kind:"steer",type,say:/^\(/.test(p)?null:p.replace(/\s*\([^)]*\)\s*$/,""),show:p,kw,ex}; });
  if(k==="topics") return rndPick(FL_TOPICS[lang],n).map(p=>({st:k,kind:"topics",say:p,think:10,max:100,manual:true}));
  if(k==="tricky") return rndPick(FL_TRICKY,n).map(q=>{ const [sit,p,kw,tech,ex]=L(q); return {st:k,kind:"tricky",sit,say:/^\(/.test(p)?null:p,show:p,kw,tech,ex}; });
  return [];
}

/* ---------- hands-free recorder: starts after the partner's line, stops after a pause ---------- */
function flRecord(box,{max=30,manual=false,silence=1.7,onDone}){
  box.innerHTML=`<div class="row"><button class="b warm grow" data-st>■ ${t("fl_stop")}</button><span class="big" data-tm style="font-size:1.3rem;margin:0">0:00</span></div>
   <div class="meter" style="margin-top:6px"><i data-lv></i></div><p class="muted" data-hint style="font-size:.82rem;margin:4px 0">${t(manual?"fl_rec_manual":"fl_rec_auto")}</p><div class="bubble me hidden" data-tx></div><div data-light></div>`;
  const lv=box.querySelector("[data-lv]"), tm=box.querySelector("[data-tm]"), tx=box.querySelector("[data-tx]"), light=box.querySelector("[data-light]");
  let take=null, onset=null, lastLoud=null, pauses=0, inPause=false, ended=false, t0=performance.now();
  const stop=async(noAns)=>{ if(ended||!take) return; ended=true; const tk=take; take=null; lv.style.width="0"; keepAwake(false);
    box.querySelector("[data-hint]").textContent=t("analysing"); const r=await tk.stop(); const end=lastLoud!=null?lastLoud:(r.dur||0);
    onDone(Object.assign(r,{onset,pauses,speech:onset!=null?Math.max(0,end-onset):0,noAns:!!noAns})); };
  box.querySelector("[data-st]").onclick=()=>stop(false);
  (async()=>{ try{ try{ speechSynthesis.cancel(); }catch(e){} ac();
    take=await startTake({lang:srLang(),onText:x=>{ tx.classList.remove("hidden"); tx.textContent=x; },onLevel:(d,s)=>{ if(ended) return;
      lv.style.width=Math.max(0,Math.min(100,(d+70)/60*100))+"%"; tm.textContent=fmtT(s);
      const loud=d>-44; if(loud){ if(onset==null) onset=s; if(inPause&&lastLoud!=null&&s-lastLoud>=1.5) pauses++; inPause=false; lastLoud=s; } else if(onset!=null) inPause=true;
      if(manual&&max>=60){ const g=max>=95?[60,75,90]:[30,45,55], c=s>=g[2]?"#d33":s>=g[1]?"#e8a200":s>=g[0]?"#2a9d55":"var(--line)"; light.innerHTML=`<div style="height:10px;border-radius:5px;margin-top:6px;background:${c}"></div>`; }
      if(onset==null&&s>8) stop(true);
      else if(!manual&&onset!=null&&lastLoud!=null&&s-lastLoud>=silence&&s-onset>0.6) stop(false);
      else if(s>=max) stop(false); }});
    keepAwake(true); t0=performance.now(); }catch(e){ micError(e); toast(t("mic_fail")); onDone(null); } })();
  return {stop:()=>stop(false)};
}

/* ---------- scoring ---------- */
function flEval(it,res,lang){
  const raw=(res&&res.text)||"", tn=norm(raw), words=tn?tn.split(" "):[], M=FLM[lang], typed=!!(res&&res.typed);
  const fset=new Set(FILLERS[lang].map(norm)), fillers=words.filter(w=>fset.has(w)).length;
  const speech=typed?null:Math.max(0.1,res.speech||0), lat=typed?null:res.onset, pauses=typed?null:res.pauses;
  const wpm=speech&&speech>2?Math.round(words.length/(speech/60)):null, fpm=speech&&speech>10?fillers/(speech/60):fillers;
  const C=[]; const add=(w,ok,key)=>C.push({w,ok:ok==null?null:!!ok,key});
  const latOK=x=>lat==null?null:lat<=x;
  const q=flQuestion(raw,lang), self=flHas(tn,M.self);
  switch(it.kind){
   case "reflex": add(.2,it.ack.split("|").some(a=>kwHit(tn,a))||words.length>=10,"ack"); add(.25,self&&words.length>=7,"reveal"); add(.25,q,"ask"); add(.15,latOK(2.5),"lat25"); add(.15,words.length>=8&&words.length<=35,"len835"); break;
   case "hooks": { const gs=parseKW(it.hooks), hit=gs.some(g=>g.some(a=>kwHit(tn,a))); add(.35,hit,"hook"); add(.3,flHas(tn,M.open)||(q&&words.length>=6),"open"); add(.15,latOK(3),"lat3"); add(.2,words.length>=5&&words.length<=30,"len530"); break; }
   case "story": { const tail=norm(flTail(raw,16)); add(.2,typed?words.length>=35&&words.length<=190:(speech>=15&&speech<=75),"dur2575"); add(.15,flHas(tn,M.seq),"seq"); add(.15,/\d/.test(raw)||flHas(tn,M.num)||(lang!=="de"&&/\s[A-ZÀ-Ý][a-zà-ÿ]{2,}/.test(String(raw).replace(/([.!?]\s+)[A-ZÀ-Ý]/g,"$1x"))),"detail"); add(.15,flHas(tn,M.feel),"feel"); add(.2,flQuestion(flTail(raw,16),lang)||flHas(tail,M.q),"askend"); add(.15,fpm<=4,"fill4"); break; }
   case "yesand": { const first=words.slice(0,4).join(" "), blocked=flHas(words.slice(0,3).join(" "),M.no)&&!flHas(first,M.yes); add(.3,!blocked&&(flHas(first,M.yes)||words.length>=6),"accept"); add(.3,words.length>=8,"extend"); add(.2,latOK(2),"lat2"); add(.2,pauses==null?null:pauses<=1,"nopause"); break; }
   case "three": { const items=new Set(flContent(tn).filter(w=>!fset.has(w))); add(.4,items.size>=3,"three"); add(.3,typed?null:(res.onset!=null&&(res.onset+res.speech)<=10),"in10"); add(.3,latOK(2),"lat2"); break; }
   case "spine": add(.5,flCount(tn,M.spine)>=4,"spine"); add(.2,typed?words.length>=60:(speech>=30&&speech<=90),"dur3090"); add(.15,fpm<=4,"fill4"); add(.15,pauses==null?null:pauses<=3,"pause3"); break;
   case "expert": add(.35,typed?words.length>=70:speech>=35,"dur35"); add(.25,fpm<=4,"fill4"); add(.2,pauses==null?null:pauses<=2,"pause2"); add(.2,wpm==null?null:wpm>=110&&wpm<=170,"wpm"); break;
   case "steer": { const gs=parseKW(it.kw), f=gs.filter(g=>g.some(a=>kwHit(tn,a))).length/Math.max(1,gs.length); add(it.type==="exit"?.6:.45,f>=0.99,"move_"+it.type); if(it.type!=="exit") add(.2,q,"ask"); add(.2,latOK(3),"lat3"); add(.15,words.length>=6&&words.length<=40,"len640"); break; }
   case "topics": { const P=M.prep, parts=["p","r","e","c"].filter(x=>flHas(tn,P[x])).length; add(.2,typed?words.length>=110&&words.length<=260:(speech>=55&&speech<=95),"dur5595"); add(.3,parts>=3,"prep"); add(.15,fpm<=3,"fill3"); add(.15,pauses==null?null:pauses<=3,"pause3"); add(.2,wpm==null?null:wpm>=110&&wpm<=170,"wpm"); var parts6=parts; break; }
   case "tricky": { const gs=parseKW(it.kw), f=gs.filter(g=>g.some(a=>kwHit(tn,a))).length/Math.max(1,gs.length); add(.5,f>=0.99,"tech"); add(.2,latOK(3),"lat3"); add(.15,words.length>=6&&words.length<=45,"len645"); add(.15,fillers<=1,"fill1"); break; }
  }
  const used=C.filter(c=>typeof c.ok==="boolean");
  const W=used.reduce((a,c)=>a+c.w,0)||1, score=Math.round(100*used.reduce((a,c)=>a+(c.ok?c.w:0),0)/W);
  const crisp=res&&res.pcm&&typeof consMetrics==="function"?(consMetrics(res.pcm)||{}).crisp:null;
  return {parts:typeof parts6==="number"?parts6:null,score,crit:used,words:words.length,wpm,fillers,fpm:Math.round(fpm*10)/10,lat,pauses,speech,crisp,text:raw};
}

/* ---------- running a set of items ---------- */
function flRun(items,mode){ // mode: drill | check | warm | place
  const box=$("#flowCard"), lang=SET.tl, results=[]; let i=0, again=0; FLOW.view="run";
  const auto=fl().auto&&!FLOW.typed;
  const head=()=>`<div class="row"><h3 class="grow" style="margin:0">${mode==="check"?"🏁 "+t("fl_check"):mode==="warm"?"⚡ "+t("fl_warm"):mode==="place"?"🧭 "+t("fl_place"):esc(flLearn(items[i].st).t)}</h3><button class="b sm alt" data-x>${t("fl_back")}</button></div>
    <div class="row" style="margin:4px 0"><span class="muted grow">${t("fl_item",{i:i+1,n:items.length})}</span><span class="dots">${items.map((_,k)=>`<i class="${k<i?(results[k]>=70?"on":"bad"):""}"></i>`).join("")}</span></div>`;
  const draw=()=>{ const it=items[i];
    const sit=it.sit?`<div class="card flat" style="margin:4px 0"><b>${t("fl_situation")}</b> ${esc(it.sit)}</div>`:"";
    const tech=it.tech&&mode!=="check"?`<details><summary>${t("fl_technique")}</summary><p style="margin:4px 0">${esc(it.tech)}</p></details>`:"";
    const shown=it.show||it.say||"", stg=it.kind==="steer"?`<span class="tag">${t("fl_move_"+it.type)}</span> `:"";
    box.innerHTML=head()+sit+`<div class="bubble them" style="margin:8px 0;font-size:1.08rem" ${tlAttr(lang)}>${stg}${esc(shown)}</div>${tech}
      <p class="muted" style="font-size:.82rem;margin:2px 0">${t("fl_task_"+it.kind)}</p><div data-r style="margin-top:6px"></div><div data-fb></div>`;
    box.querySelector("[data-x]").onclick=()=>{ try{ speechSynthesis.cancel(); }catch(e){} if(FLOW.rec) FLOW.rec.stop(); FLOW.view="home"; renderFlow(); };
    const r=box.querySelector("[data-r]");
    const go=()=>{ if(FLOW.typed) return typedInput(r); beep(880,.08,.08);
      FLOW.rec=flRecord(r,{max:it.max||(it.kind==="story"?90:30),manual:!!it.manual||it.kind==="story",onDone:res=>{ FLOW.rec=null; if(!res) return typedInput(r); evaluate(res); }}); };
    const startBtn=()=>{ r.innerHTML=`<div class="row"><button class="b warm grow" data-go>● ${t("fl_answer")}</button><button class="b alt" data-ty title="${t("fl_type")}">⌨</button></div>`; r.querySelector("[data-go]").onclick=go; r.querySelector("[data-ty]").onclick=()=>typedInput(r); };
    const afterPrompt=()=>{ if(it.think){ let k=it.think; r.innerHTML=`<p class="big" style="text-align:center;margin:4px 0">${t("fl_think")} <b data-k>${k}</b></p><button class="b alt sm" data-sk>${t("fl_skip_think")}</button>`;
        const iv=setInterval(()=>{ k--; const e=r.querySelector("[data-k]"); if(e) e.textContent=k; if(k<=0||!e){ clearInterval(iv); if(e) go(); } },1000); r.querySelector("[data-sk]").onclick=()=>{ clearInterval(iv); go(); }; return; }
      if(auto&&!FLOW.typed) go(); else startBtn(); };
    if(FLOW.typed) typedInput(r); else if(it.say){ r.innerHTML=`<p class="muted">🔊 ${t("fl_listen")}</p>`; speak(it.say,lang,()=>{ if(FLOW.view==="run"&&items[i]===it) afterPrompt(); },1,"partner"); } else afterPrompt();
  };
  const typedInput=(r)=>{ r.innerHTML=`<textarea data-ta rows="3" style="width:100%" ${tlAttr(lang)} placeholder="${t("fl_type_ph")}"></textarea><button class="b" style="width:100%;margin-top:4px" data-ok>${t("fl_send")}</button>`;
    r.querySelector("[data-ok]").onclick=()=>{ const v=r.querySelector("[data-ta]").value.trim(); if(!v) return; evaluate({text:v,typed:true}); }; };
  const evaluate=(res)=>{ const it=items[i], text=(res.sr&&res.sr.text)||res.text||"";
    if(!res.typed&&res.noAns){ return feedback({score:0,crit:[{key:"noans",ok:false,w:1}],text:"",lat:null},res); }
    if(!res.typed&&!text&&(srBroken||!res.sr||res.sr.err)) return selfCheck(res);
    feedback(flEval(it,Object.assign({},res,{text}),lang),res); };
  const selfCheck=(res)=>{ const it=items[i], ev=flEval(it,Object.assign({},res,{text:""}),lang), fb=box.querySelector("[data-fb]");
    fb.innerHTML=`<p class="muted">${t("fl_nosr")}</p>`; if(res.blob) fb.append(replayView({blob:res.blob,kind:"flow",title:it.say||it.show||"",lang},{noRegister:true}));
    const lst=el("div",{}); ev.crit.forEach((c,k)=>{ const lab=el("label",{style:"display:block;margin:3px 0"}); lab.innerHTML=`<input type="checkbox" data-k="${k}" ${/^(lat|pause|nopause|dur|wpm|in10)/.test(c.key)&&c.ok?"checked":""}> ${esc(t("flc_"+c.key))}`; lst.append(lab); }); fb.append(lst);
    const b=el("button",{class:"b",style:"width:100%;margin-top:6px"},t("fl_rate_done")); fb.append(b);
    b.onclick=()=>{ lst.querySelectorAll("input").forEach(x=>{ ev.crit[+x.dataset.k].ok=x.checked; }); const W=ev.crit.reduce((a,c)=>a+c.w,0)||1; ev.score=Math.round(100*ev.crit.reduce((a,c)=>a+(c.ok?c.w:0),0)/W); feedback(ev,res); }; };
  const feedback=(ev,res)=>{ const it=items[i], fb=box.querySelector("[data-fb]"), r=box.querySelector("[data-r]"); r.innerHTML=""; const ok=ev.score>=70; beep(ok?990:520,.12,.1);
    const col=ev.score>=80?"var(--ok)":ev.score>=60?"var(--accent2)":"var(--warn)";
    const mets=[ev.lat!=null?`${t("flm_lat")} <b>${ev.lat.toFixed(1)} s</b>`:"",ev.wpm?`${t("flm_wpm")} <b>${ev.wpm}</b>`:"",ev.fillers!=null&&ev.text?`${t("flm_fill")} <b>${ev.fillers}</b>`:"",ev.pauses!=null?`${t("flm_pause")} <b>${ev.pauses}</b>`:"",ev.crisp!=null?`${t("flm_clar")} <b>${Math.round(ev.crisp*100)}</b>`:""].filter(Boolean).join(" · ");
    let h=`<div class="card flat" style="margin-top:6px"><div class="row"><b style="font-size:2rem;color:${col}">${ev.score}</b><span class="grow"></span><span class="muted" style="font-size:.8rem">${mets}</span></div>`;
    if(ev.text) h+=`<p class="muted" style="margin:4px 0">${esc(t("fl_heard",{t:ev.text}))}</p>`;
    h+=`<ul class="list" style="margin:4px 0">${ev.crit.map(c=>`<li>${c.ok?"✅":"❌"} ${esc(t("flc_"+c.key))}${!c.ok&&T.en["flt_"+c.key]?`<br><span class="muted" style="font-size:.82rem">${esc(t("flt_"+c.key))}</span>`:""}</li>`).join("")}</ul>`;
    if(ev.crisp!=null&&ev.crisp<0.5) h+=`<p style="font-size:.85rem;margin:4px 0">🗣️ ${t("fl_crisp")} <button class="b sm alt" data-cons>${t("fl_to_cons")}</button></p>`;
    if(it.kind==="topics"&&ev.parts!=null) h+=`<p class="muted" style="font-size:.82rem">${t("fl_prep_n",{n:ev.parts})}</p>`;
    if(it.ex) h+=`<details ${ok?"":"open"}><summary>${t("fl_example")}</summary><p ${tlAttr(lang)} style="margin:4px 0">${esc(it.ex)} <button class="b sm alt" data-ex>🔊</button></p></details>`;
    if(it.tech&&mode==="check") h+=`<p class="muted" style="font-size:.82rem">${t("fl_technique")}: ${esc(it.tech)}</p>`;
    h+=`</div><div class="row" style="margin-top:6px">${mode!=="check"&&!ok&&again<2?`<button class="b alt grow" data-ag>${t("fl_again")}</button>`:""}<button class="b grow" data-nx>${i+1<items.length?t("fl_next"):t("fl_finish")}</button></div>`;
    fb.innerHTML=h;
    const ex=fb.querySelector("[data-ex]"); if(ex) ex.onclick=()=>speak(it.ex,lang,null,0.95,"model");
    const cn=fb.querySelector("[data-cons]"); if(cn) cn.onclick=()=>{ show("speech"); try{ renderCons(); scrollToId("consCard"); }catch(e){} };
    const ag=fb.querySelector("[data-ag]"); if(ag) ag.onclick=()=>{ again++; draw(); };
    fb.querySelector("[data-nx]").onclick=()=>{ results[i]=ev.score; again=0; const s=flSt(it.st); s.n++; s.sum+=ev.score; s.best=Math.max(s.best,ev.score); s.last.push(ev.score); if(s.last.length>12) s.last.shift();
      const f=fl(); f.xp+=Math.round(ev.score/10); f.met=f.met||[]; f.met.push({d:today(),lat:ev.lat,fpm:ev.fpm,q:it.kind}); if(f.met.length>200) f.met.shift(); save();
      i++; if(i<items.length) draw(); else summary(); };
  };
  const summary=()=>{ const f=fl(), avg=Math.round(results.reduce((a,b)=>a+b,0)/results.length), st=items[0].st; FLOW.view="home";
    const d=today(); if(f.streak.d!==d){ const y=new Date(Date.now()-864e5).toISOString().slice(0,10); f.streak.n=f.streak.d===y?f.streak.n+1:1; f.streak.d=d; }
    f.hist.push({d,mode,st:mode==="drill"||mode==="check"?st:mode,avg}); if(f.hist.length>120) f.hist.shift();
    let msg="";
    if(mode==="check"){ if(avg>=75){ f.passed[st]=true; f.xp+=50; const nx=FLOW_ST[FLOW_ST.indexOf(st)+1]; if(nx&&FLOW_ST.indexOf(f.cur)<FLOW_ST.indexOf(nx)) f.cur=nx; msg=`<div class="okbox">🏆 ${t("fl_passed",{s:flLearn(st).t})}${nx?" "+t("fl_unlocked",{s:flLearn(nx).t}):""}</div>`; }
      else msg=`<div class="warnbox">${t("fl_notyet",{p:avg})}</div>`; }
    if(mode==="place"){ const per={}; items.forEach((it,k)=>{ (per[it.st]=per[it.st]||[]).push(results[k]); }); let start=FLOW_ST[0];
      for(const s of FLOW_ST.slice(0,7)){ const a=per[s]; if(!a) { start=s; break; } const m=a.reduce((x,y)=>x+y,0)/a.length; if(m>=80) { f.passed[s]=true; start=FLOW_ST[FLOW_ST.indexOf(s)+1]; } else { start=s; break; } }
      f.cur=start; f.placed=true; msg=`<div class="okbox">🧭 ${t("fl_placed",{s:flLearn(start).t})}</div>`; }
    save(); logSession(t("fl_title"),Math.max(1,items.length*0.7)); try{ markPlan("flow"); }catch(e){}
    box.innerHTML=`<h3 style="margin:0">${t("fl_title")}</h3><div class="${avg>=75?"okbox":"warnbox"}" style="margin-top:6px"><b>${t("fl_sum",{p:avg,n:results.length})}</b> · ⭐ ${f.xp} XP · 🔥 ${f.streak.n}</div>${msg}<button class="b" style="width:100%;margin-top:8px" data-bk>${t("fl_back")}</button>`;
    box.querySelector("[data-bk]").onclick=()=>renderFlow(); };
  draw();
}

/* ---------- live capstone ---------- */
function flLiveStart(host){
  const lang=SET.tl, settings=t("fl_live_settings").split("|"), setting=rnd(settings);
  FLOW.live={setting}; LIVE.topic=null;
  host.innerHTML=`<div class="card flat"><b>💬 ${t("fl_live_title")}</b><p class="muted" style="font-size:.85rem;margin:2px 0">${t("fl_live_desc",{s:setting})}</p></div><div data-chat></div>`;
  startLive(host.querySelector("[data-chat]"),"casual, improvised small talk – "+setting);
}
const _sysPromptF=sysPrompt;
sysPrompt=function(S){ const p=_sysPromptF(S); if(!FLOW.live) return p;
  return p+`\nIMPROVISED SMALL-TALK TRAINING: You are a friendly stranger in this setting: ${FLOW.live.setting}. Behave like a real person, not an interviewer: share small personal details with "free information" the user can pick up (hobbies, a trip, a funny mishap), keep your turns short (1–3 sentences), only sometimes ask a question, occasionally give a short answer or change topic so the user must keep the conversation going, and react to what the user says. In "tip", coach ONE conversation skill (ARE: acknowledge–reveal–encourage, catching a hook, open questions, sharing a mini-story, bridging topics) in ${LANG_FULL[S.ui]}.`; };
const _lvBankF=lvBank;
lvBank=function(S){ if(FLOW.live){ const L=x=>x[S.lang]||x.en; return FL_HOOKS.map(q=>L(q)[0]).concat(FL_STORY.map(q=>L(q)[0])).sort(()=>Math.random()-0.5); } return _lvBankF(S); };
function flLiveReport(S){ const lang=S.lang, m=S.msgs; let turns=0, hooks=0, hookable=0, qs=0, words=0, pw=0; const good=[], miss=[];
  for(let k=0;k<m.length;k++){ if(m[k].role!=="user") continue; turns++; const u=m[k].content, un=norm(u), w=un?un.split(" ").length:0; words+=w; if(flQuestion(u,lang)) qs++;
    const prev=m[k-1]&&m[k-1].role==="assistant"?m[k-1].content:""; const cw=[...new Set(flContent(norm(prev)).filter(x=>x.length>=4&&!FL_GENERIC.has(x)&&!(typeof LV_STOP!=="undefined"&&LV_STOP.has(x))))];
    const known=FL_HOOKS.map(q=>q[lang]||q.en).find(a=>prev.includes(a[0])), groups=known?parseKW(known[1]):null;
    if(groups){ hookable++; const g=groups.find(g=>g.some(a=>kwHit(un,a))); if(g){ hooks++; if(good.length<3) good.push({p:prev,u,h:g[0]}); } else if(miss.length<3) miss.push({p:prev,u,h:groups.map(g=>g[0]).join(", ")}); continue; }
    if(cw.length){ hookable++; const hit=cw.find(x=>(" "+un+" ").includes(" "+x.slice(0,Math.max(5,x.length-2)))); if(hit){ hooks++; if(good.length<3) good.push({p:prev,u,h:hit}); } else if(miss.length<3) miss.push({p:prev,u,h:cw.slice(0,3).join(", ")}); } }
  m.forEach(x=>{ if(x.role==="assistant") pw+=norm(x.content).split(" ").length; });
  const hr=hookable?hooks/hookable:0, qr=turns?qs/turns:0, aw=turns?words/turns:0, share=words+pw?words/(words+pw):0;
  const pass=turns>=8&&hr>=0.5&&qr>=0.3&&qr<=0.7&&aw>=8&&aw<=40;
  return {turns,hr,qr,aw,share,pass,good,miss}; }
const _endLiveF=endLive;
endLive=function(chat){ const S=LIVE.S, wasFlow=!!FLOW.live; _endLiveF(chat); if(!wasFlow||!S) return; FLOW.live=null;
  const R=flLiveReport(S), f=fl(), pct=x=>Math.round(x*100)+" %";
  const row=(ok,lab,val)=>`<li>${ok?"✅":"❌"} ${lab}: <b>${val}</b></li>`;
  let h=`<div class="card flat" style="margin-top:6px"><b>📊 ${t("fl_rep_title")}</b><ul class="list">${row(R.turns>=8,t("fl_rep_turns"),R.turns)}${row(R.hr>=0.5,t("fl_rep_hooks"),pct(R.hr))}${row(R.qr>=0.3&&R.qr<=0.7,t("fl_rep_q"),pct(R.qr))}${row(R.aw>=8&&R.aw<=40,t("fl_rep_len"),Math.round(R.aw))}<li>${t("fl_rep_share")}: <b>${pct(R.share)}</b></li></ul>`;
  if(R.good.length) h+=`<p style="margin:6px 0 2px"><b>${t("fl_rep_good")}</b></p>`+R.good.map(g=>`<div class="muted" style="font-size:.82rem;margin:2px 0">„${esc(g.p.slice(0,90))}“ → <i>${esc(g.u.slice(0,90))}</i> (${esc(g.h)})</div>`).join("");
  if(R.miss.length) h+=`<p style="margin:6px 0 2px"><b>${t("fl_rep_miss")}</b></p>`+R.miss.map(g=>`<div class="muted" style="font-size:.82rem;margin:2px 0">„${esc(g.p.slice(0,90))}“ → ${t("fl_rep_could",{h:g.h})}</div>`).join("");
  const sc=Math.round(100*((R.turns>=8?1:R.turns/8)*0.25+Math.min(1,R.hr/0.5)*0.3+(R.qr>=0.3&&R.qr<=0.7?1:0.4)*0.25+(R.aw>=8&&R.aw<=40?1:0.4)*0.2));
  const s=flSt("free"); s.n++; s.sum+=sc; s.best=Math.max(s.best,sc); s.last.push(sc); if(s.last.length>12) s.last.shift(); f.xp+=Math.round(sc/5);
  if(R.pass){ f.passed.free=true; f.xp+=100; h+=`<div class="okbox" style="margin-top:6px">🏆 ${t("fl_free_pass")}</div>`; } else h+=`<p class="muted" style="font-size:.82rem">${t("fl_free_goal")}</p>`;
  f.hist.push({d:today(),mode:"live",st:"free",avg:sc}); save(); try{ markPlan("flow"); }catch(e){}
  h+=`</div>`; const inp=chat.querySelector("[data-in]"); if(inp){ inp.insertAdjacentHTML("beforeend",h); const ag=inp.querySelector("[data-ag]"); if(ag){ ag.onclick=()=>renderFlow(); ag.textContent=t("fl_back"); } } };

/* ---------- home: learning path ---------- */
function flTrend(key){ const m=(fl().met||[]).filter(x=>x[key]!=null); if(m.length<2) return null; const a=m.slice(0,Math.min(10,Math.floor(m.length/2))), b=m.slice(-10); const av=x=>x.reduce((s,y)=>s+y[key],0)/x.length; return {first:av(a),now:av(b)}; }
function renderFlow(){ const box=$("#flowCard"); if(!box) return; if(FLOW.view==="run"||FLOW.live) return; const f=fl(), cur=f.cur, L=flLearn(cur), s=flSt(cur);
  const node=(k,i)=>{ const st=f.passed[k]?"done":k===cur?"cur":flUnlocked(k)?"open":"lock", ic=st==="done"?"✅":st==="cur"?"▶️":st==="open"?"○":"🔒";
    return `<button class="chip ${k===FLOW.sel?"on":""}" data-node="${k}" ${st==="lock"?"disabled":""} style="justify-content:flex-start;width:100%;text-align:left;margin:2px 0">${ic} ${i+1}. ${esc(flLearn(k).t)}${f.st[k]&&f.st[k].n?` <span class="muted" style="font-size:.75rem">· ${t("fl_best")} ${f.st[k].best}</span>`:""}</button>`; };
  const sel=FLOW.sel&&flUnlocked(FLOW.sel)?FLOW.sel:cur, SL=flLearn(sel), ss=flSt(sel), last=ss.last.length?Math.round(ss.last.reduce((a,b)=>a+b,0)/ss.last.length):null;
  const lt=flTrend("lat"), ft=flTrend("fpm");
  box.innerHTML=`<div class="row"><h2 class="grow" style="margin:0">🗨️ ${t("fl_title")}</h2><span class="tag">⭐ ${f.xp} · 🔥 ${f.streak.n}</span></div>
   <p class="muted" style="margin:4px 0">${t("fl_desc")}</p>
   ${!f.placed?`<div class="card flat" style="border-left:4px solid var(--accent)"><b>${t("fl_place_q")}</b><p class="muted" style="font-size:.85rem;margin:2px 0">${t("fl_place_d")}</p><div class="row"><button class="b grow" data-place>🧭 ${t("fl_place")}</button><button class="b alt" data-skipplace>${t("fl_place_skip")}</button></div></div>`:""}
   <div class="row" style="margin:6px 0"><button class="b warm grow" data-warm>⚡ ${t("fl_warm")}</button></div>
   <details ${f.placed?"":"open"}><summary><b>${t("fl_path")}</b> – ${t("fl_path_n",{n:Object.keys(f.passed).filter(k=>f.passed[k]).length})}</summary><div style="margin-top:4px">${FLOW_ST.map(node).join("")}</div></details>
   <div class="card flat" style="margin-top:6px"><div class="row"><b class="grow">${FLOW_ST.indexOf(sel)+1}. ${esc(SL.t)}</b>${f.passed[sel]?`<span class="tag ok">✓</span>`:""}</div>
     <p style="margin:4px 0">${esc(SL.goal)}</p>
     <details><summary>📘 ${t("fl_learn")}</summary><div style="font-size:.9rem"><p>${SL.how}</p>${SL.ex&&SL.ex!=="—"?`<p><b>${t("fl_example")}:</b> <i ${tlAttr(SET.ui)}>${esc(SL.ex)}</i></p>`:""}<p><b>${t("fl_pitfalls")}:</b> ${esc(SL.pit)}</p><p><b>${t("fl_criteria")}:</b> ${esc(SL.crit)}</p></div></details>
     ${ss.n?`<p class="muted" style="font-size:.82rem;margin:4px 0">${t("fl_stats",{n:ss.n,a:last,b:ss.best})}</p>`:""}
     ${sel==="free"?`<div class="row"><button class="b grow" data-live>💬 ${t("fl_live_start")}</button></div>`:`<div class="row"><button class="b grow" data-drill>▶ ${t("fl_drill")}</button><button class="b alt grow" data-check>🏁 ${t("fl_check")}</button></div>`}
     <div data-livehost></div></div>
   ${lt||ft?`<p class="muted" style="font-size:.8rem;margin:6px 0">${lt?t("fl_tr_lat",{a:lt.first.toFixed(1),b:lt.now.toFixed(1)}):""}${lt&&ft?" · ":""}${ft?t("fl_tr_fill",{a:ft.first.toFixed(1),b:ft.now.toFixed(1)}):""}</p>`:""}
   <div class="row" style="margin-top:4px;font-size:.85rem"><label class="grow"><input type="checkbox" data-auto ${f.auto?"checked":""}> ${t("fl_auto")}</label><label><input type="checkbox" data-typed ${FLOW.typed?"checked":""}> ${t("fl_typed")}</label></div>`;
  box.querySelectorAll("[data-node]").forEach(b=>b.onclick=()=>{ FLOW.sel=b.dataset.node; renderFlow(); });
  const q=s=>box.querySelector(s);
  if(q("[data-place]")) q("[data-place]").onclick=()=>{ const items=[]; ["reflex","reflex","hooks","hooks","story","improv","steer","tricky"].forEach(k=>items.push(...flItems(k,1,SET.tl))); flRun(items,"place"); };
  if(q("[data-skipplace]")) q("[data-skipplace]").onclick=()=>{ f.placed=true; save(); renderFlow(); };
  q("[data-warm]").onclick=()=>{ const pool=["reflex","hooks"].concat(flUnlocked("improv")?["improv"]:[]).concat(flUnlocked("tricky")?["tricky"]:[]); const items=[]; for(let k=0;k<8;k++){ const st=pool[k%pool.length]; const it=flItems(st,1,SET.tl)[0]; if(st==="improv"&&!/yesand|three/.test(it.kind)){ k--; continue; } items.push(it); } flRun(items,"warm"); };
  if(q("[data-drill]")) q("[data-drill]").onclick=()=>flRun(flItems(sel,sel==="topics"?3:6,SET.tl),"drill");
  if(q("[data-check]")) q("[data-check]").onclick=()=>flRun(flItems(sel,sel==="topics"?3:6,SET.tl),"check");
  if(q("[data-live]")) q("[data-live]").onclick=()=>flLiveStart(q("[data-livehost]"));
  q("[data-auto]").onchange=e=>{ f.auto=e.target.checked; save(); };
  q("[data-typed]").onchange=e=>{ FLOW.typed=e.target.checked; };
}
// teaser in the Speech tab (articulation) → link to the module
function renderFlowTeaser(){ const b=$("#flowTeaser"); if(!b) return; const f=fl();
  b.innerHTML=`<div class="row"><span class="grow">🗨️ <b>${t("fl_title")}</b> – ${t("fl_teaser")}</span><button class="b sm" data-go>${t("fl_open")}</button></div>`;
  b.querySelector("[data-go]").onclick=()=>{ show("talk"); renderFlow(); scrollToId("flowCard"); }; }

/* ---------- texts ---------- */
Object.assign(T.en,{fl_title:"Spontaneous speaking",fl_desc:"An 8-stage path from reflex replies (“You're welcome”) to free, improvised conversation: ARE replies, catching hooks, mini-stories, improv games, steering, Table Topics and tricky moments. Hands-free: the partner speaks, you answer, it measures reaction time, fillers, pauses, structure and articulation.",
 fl_teaser:"train clear, improvised conversation (8-stage path)",fl_open:"Open",fl_place_q:"Where should you start?",fl_place_d:"8 short prompts across the stages (about 5 min). Stages you master (≥ 80) are ticked off automatically.",fl_place:"Placement test",fl_place_skip:"Start at stage 1",
 fl_warm:"2-minute warm-up (8 rapid prompts)",fl_path:"Learning path",fl_path_n:"{n} of 8 stages passed",fl_learn:"How it works",fl_example:"Example",fl_pitfalls:"Typical mistakes",fl_criteria:"Measured",fl_stats:"{n} answers · recent average {a} · best {b}",fl_best:"best",
 fl_drill:"Practise (6)",fl_check:"Checkpoint",fl_back:"Back",fl_item:"Prompt {i} of {n}",fl_situation:"Situation:",fl_technique:"Technique",fl_listen:"Listen…",fl_answer:"Answer",fl_type:"Type instead",fl_type_ph:"Type your answer…",fl_send:"Send",fl_think:"Think…",fl_skip_think:"Start now",
 fl_rec_auto:"Speak now – recording stops automatically after a short pause.",fl_rec_manual:"Speak now – tap ■ when you have finished. The bar turns green, amber and red like a speaking-club timer.",fl_stop:"Done",
 fl_heard:"Heard: “{t}”",fl_again:"Try again",fl_next:"Next",fl_finish:"Finish",fl_crisp:"Your consonants got blurry while improvising – clarity matters most when you speak freely.",fl_to_cons:"Consonant training",
 fl_nosr:"Speech recognition isn't available – listen back and tick what you managed:",fl_rate_done:"Rate",fl_prep_n:"PREP parts detected: {n} of 4",
 fl_sum:"Average {p} over {n} prompts",fl_passed:"Checkpoint passed: {s}!",fl_unlocked:"Unlocked: {s}.",fl_notyet:"Not yet ({p}; 75 needed) – practise a little more and try again.",fl_placed:"Your starting stage: {s}",
 fl_auto:"Hands-free (answer starts automatically)",fl_typed:"Type answers",fl_tr_lat:"Reaction time {a} s → {b} s",fl_tr_fill:"fillers/min {a} → {b}",
 fl_task_reflex:"Answer with ARE: acknowledge – reveal a detail – ask back.",fl_task_hooks:"Catch a hook and ask an open question.",fl_task_story:"Tell a 20–60 s mini-story: headline, detail, feeling, question back.",fl_task_yesand:"Say “Yes, and …” and add something new – quickly!",fl_task_three:"Name three – fast!",fl_task_spine:"Tell the story with the six story-spine steps.",fl_task_expert:"Speak 45 s as the expert – confidently, no long pauses.",fl_task_steer:"Make the right move with a link phrase.",fl_task_topics:"Speak 60–90 s with PREP: point, reason, example, point.",fl_task_tricky:"Handle the moment with the technique.",
 fl_three:"Three {c}",fl_three_say:"Quick – name three {c}!",fl_spine:"Story spine: {s}",fl_spine_say:"Tell me a story about {s}. Start with: once upon a time.",fl_expert:"You are the world expert on: {s}",fl_expert_say:"Welcome, our expert on {s}. Tell us everything!",
 fl_move_deepen:"Deepen",fl_move_bridge:"Bridge",fl_move_revive:"Revive",fl_move_exit:"Exit",
 fl_live_title:"Free conversation",fl_live_desc:"Setting: {s}. Keep the chat going for at least 8 turns – catch hooks, share, ask.",fl_live_start:"Start free conversation",fl_live_settings:"waiting for a delayed train|at a friend's birthday party|in the queue at a bakery|at a conference coffee break|at the playground with the kids|on a long flight",
 fl_rep_title:"Your conversation report",fl_rep_turns:"Your turns",fl_rep_hooks:"Hooks caught",fl_rep_q:"Turns with a question",fl_rep_len:"Average words per turn",fl_rep_share:"Your share of the talking",fl_rep_good:"Hooks you caught:",fl_rep_miss:"Missed hooks:",fl_rep_could:"you could have picked up: {h}",fl_free_pass:"Capstone passed – you held a real improvised conversation!",fl_free_goal:"Goal: ≥ 8 turns, ≥ 50 % hooks caught, questions in 30–70 % of turns, 8–40 words per turn.",
 flm_lat:"reaction",flm_wpm:"words/min",flm_fill:"fillers",flm_pause:"long pauses",flm_clar:"clarity",
 flc_ack:"Acknowledged what was said",flc_reveal:"Revealed a personal detail",flc_ask:"Asked a question back",flc_lat25:"Started within 2.5 s",flc_lat3:"Started within 3 s",flc_lat2:"Started within 2 s",flc_len835:"8–35 words",flc_hook:"Picked up a hook",flc_open:"Open question (what / how / why…)",flc_len530:"5–30 words",flc_dur2575:"15–75 seconds",flc_seq:"Sequence words (first, then…)",flc_detail:"Concrete detail (number, day, name)",flc_feel:"Feeling or evaluation",flc_askend:"Question at the end",flc_fill4:"≤ 4 fillers per minute",flc_fill3:"≤ 3 fillers per minute",flc_fill1:"At most 1 filler",flc_accept:"Accepted the offer (no “no, but”)",flc_extend:"Extended it (8+ words)",flc_nopause:"No long pause",flc_three:"Three items",flc_in10:"Done within 10 s",flc_spine:"≥ 4 story-spine steps",flc_dur3090:"30–90 seconds",flc_pause3:"≤ 3 long pauses",flc_pause2:"≤ 2 long pauses",flc_dur35:"At least 35 seconds",flc_wpm:"Pace 110–170 words/min",flc_move_deepen:"Deepened the topic",flc_move_bridge:"Used a bridge phrase",flc_move_revive:"Revived with a callback",flc_move_exit:"Graceful exit (appreciation + reason + future)",flc_len640:"6–40 words",flc_dur5595:"55–95 seconds",flc_prep:"≥ 3 of 4 PREP parts",flc_tech:"Used the technique",flc_len645:"6–45 words",flc_noans:"No answer detected",
 flt_ack:"Start by picking up their words: “You're welcome…”, “Thanks, you too…”.",flt_reveal:"Add one small personal detail with “I” or “my”.",flt_ask:"End with a question: “…and you?”, “How was yours?”.",flt_lat25:"Start with the acknowledgement – it buys you thinking time.",flt_lat3:"Begin with a short reaction (“Oh!”, “Really?”) while you think.",flt_lat2:"Don't search for the perfect idea – say the first one.",flt_len835:"Aim for one or two sentences.",flt_hook:"Repeat a detail they mentioned and ask about it.",flt_open:"Use what / how / why / tell me – not “Did you…?”.",flt_seq:"Use first… then… in the end.",flt_detail:"Add a number, a day or a place.",flt_feel:"Say how it was for you: funny, embarrassing, proud…",flt_askend:"Hand the ball back with a question at the end.",flt_fill4:"Replace “um” with a short silent pause.",flt_fill3:"Pause silently instead of saying “um”.",flt_accept:"Start with “Yes, and…”.",flt_extend:"Add a concrete, surprising detail.",flt_three:"Say three different things – quickly.",flt_spine:"Use the steps: once upon a time – every day – one day – because of that – until finally.",flt_prep:"Point (I think…) – Reason (because…) – Example (for example…) – Point (so…).",flt_tech:"Open “Technique” and use its key phrase.",flt_move_deepen:"Ask why / how / what they enjoy about it.",flt_move_bridge:"Use “Speaking of…” or “That reminds me…”.",flt_move_revive:"Use “Earlier you mentioned…”.",flt_move_exit:"Appreciation + reason + future: “Great talking – I'll grab a coffee – see you later!”"});
Object.assign(T.de,{fl_title:"Spontan sprechen",fl_desc:"Ein Lernpfad in 8 Stufen von Reflex-Antworten („Gern geschehen“) bis zum freien, improvisierten Gespräch: ARE-Antworten, Aufhänger aufgreifen, Mini-Geschichten, Impro-Spiele, Lenken, Stegreifrede und knifflige Momente. Freihändig: Das Gegenüber spricht, du antwortest, gemessen werden Reaktionszeit, Füllwörter, Pausen, Aufbau und Artikulation.",
 fl_teaser:"deutliches, spontanes Sprechen im Gespräch trainieren (8-Stufen-Pfad)",fl_open:"Öffnen",fl_place_q:"Wo solltest du einsteigen?",fl_place_d:"8 kurze Aufgaben aus allen Stufen (ca. 5 Min.). Stufen, die du schon beherrschst (≥ 80), werden automatisch abgehakt.",fl_place:"Einstufungstest",fl_place_skip:"Bei Stufe 1 beginnen",
 fl_warm:"2-Minuten-Aufwärmen (8 schnelle Impulse)",fl_path:"Lernpfad",fl_path_n:"{n} von 8 Stufen bestanden",fl_learn:"So funktioniert's",fl_example:"Beispiel",fl_pitfalls:"Typische Fehler",fl_criteria:"Gemessen",fl_stats:"{n} Antworten · Schnitt zuletzt {a} · Bestwert {b}",fl_best:"best",
 fl_drill:"Üben (6)",fl_check:"Prüfung",fl_back:"Zurück",fl_item:"Impuls {i} von {n}",fl_situation:"Situation:",fl_technique:"Technik",fl_listen:"Zuhören…",fl_answer:"Antworten",fl_type:"Stattdessen tippen",fl_type_ph:"Deine Antwort tippen…",fl_send:"Senden",fl_think:"Nachdenken…",fl_skip_think:"Jetzt starten",
 fl_rec_auto:"Sprich jetzt – die Aufnahme stoppt nach einer kurzen Pause automatisch.",fl_rec_manual:"Sprich jetzt – tippe ■, wenn du fertig bist. Der Balken wird grün, gelb und rot wie die Ampel im Redeclub.",fl_stop:"Fertig",
 fl_heard:"Verstanden: „{t}“",fl_again:"Nochmal",fl_next:"Weiter",fl_finish:"Abschließen",fl_crisp:"Beim freien Sprechen wurden deine Konsonanten undeutlich – gerade dann zählt Deutlichkeit.",fl_to_cons:"Konsonanten-Training",
 fl_nosr:"Spracherkennung nicht verfügbar – hör dir die Aufnahme an und hake ab, was dir gelungen ist:",fl_rate_done:"Bewerten",fl_prep_n:"Erkannte PREP-Teile: {n} von 4",
 fl_sum:"Schnitt {p} über {n} Impulse",fl_passed:"Prüfung bestanden: {s}!",fl_unlocked:"Freigeschaltet: {s}.",fl_notyet:"Noch nicht ({p}; 75 nötig) – übe noch etwas und versuch es erneut.",fl_placed:"Deine Einstiegsstufe: {s}",
 fl_auto:"Freihändig (Antwort startet automatisch)",fl_typed:"Antworten tippen",fl_tr_lat:"Reaktionszeit {a} s → {b} s",fl_tr_fill:"Füllwörter/Min. {a} → {b}",
 fl_task_reflex:"Antworte mit ARE: aufgreifen – Detail preisgeben – zurückfragen.",fl_task_hooks:"Greif einen Aufhänger auf und stell eine offene Frage.",fl_task_story:"Erzähl eine 20–60-Sekunden-Geschichte: Schlagzeile, Detail, Gefühl, Gegenfrage.",fl_task_yesand:"Sag „Ja, und …“ und ergänze etwas Neues – schnell!",fl_task_three:"Nenne drei – schnell!",fl_task_spine:"Erzähl die Geschichte mit den sechs Gerüst-Schritten.",fl_task_expert:"Sprich 45 s als Experte – selbstbewusst, ohne lange Pausen.",fl_task_steer:"Mach den richtigen Zug mit einer Brückenformulierung.",fl_task_topics:"Sprich 60–90 s mit PREP: Position, Begründung, Beispiel, Position.",fl_task_tricky:"Meistere den Moment mit der Technik.",
 fl_three:"Drei {c}",fl_three_say:"Schnell – nenne drei {c}!",fl_spine:"Geschichten-Gerüst: {s}",fl_spine_say:"Erzähl mir eine Geschichte über {s}. Fang an mit: Es war einmal.",fl_expert:"Du bist die Weltexpertin / der Weltexperte für: {s}",fl_expert_say:"Willkommen, unsere Expertin für {s}. Erzählen Sie uns alles!",
 fl_move_deepen:"Vertiefen",fl_move_bridge:"Überleiten",fl_move_revive:"Beleben",fl_move_exit:"Aussteigen",
 fl_live_title:"Freies Gespräch",fl_live_desc:"Situation: {s}. Halte das Gespräch mindestens 8 Wechsel lang am Laufen – Aufhänger aufgreifen, erzählen, fragen.",fl_live_start:"Freies Gespräch starten",fl_live_settings:"beim Warten auf einen verspäteten Zug|auf der Geburtstagsfeier einer Freundin|in der Schlange beim Bäcker|in der Kaffeepause einer Konferenz|auf dem Spielplatz mit den Kindern|auf einem langen Flug",
 fl_rep_title:"Dein Gesprächsbericht",fl_rep_turns:"Deine Beiträge",fl_rep_hooks:"Aufhänger aufgegriffen",fl_rep_q:"Beiträge mit Frage",fl_rep_len:"Wörter pro Beitrag (Schnitt)",fl_rep_share:"Dein Redeanteil",fl_rep_good:"Aufgegriffene Aufhänger:",fl_rep_miss:"Verpasste Aufhänger:",fl_rep_could:"du hättest aufgreifen können: {h}",fl_free_pass:"Abschluss bestanden – du hast ein echtes improvisiertes Gespräch geführt!",fl_free_goal:"Ziel: ≥ 8 Beiträge, ≥ 50 % Aufhänger aufgegriffen, Fragen in 30–70 % der Beiträge, 8–40 Wörter pro Beitrag.",
 flm_lat:"Reaktion",flm_wpm:"Wörter/Min.",flm_fill:"Füllwörter",flm_pause:"lange Pausen",flm_clar:"Deutlichkeit",
 flc_ack:"Gesagtes aufgegriffen",flc_reveal:"Persönliches Detail genannt",flc_ask:"Gegenfrage gestellt",flc_lat25:"Innerhalb 2,5 s begonnen",flc_lat3:"Innerhalb 3 s begonnen",flc_lat2:"Innerhalb 2 s begonnen",flc_len835:"8–35 Wörter",flc_hook:"Aufhänger aufgegriffen",flc_open:"Offene Frage (was / wie / warum…)",flc_len530:"5–30 Wörter",flc_dur2575:"15–75 Sekunden",flc_seq:"Ablaufwörter (zuerst, dann…)",flc_detail:"Konkretes Detail (Zahl, Tag, Name)",flc_feel:"Gefühl oder Bewertung",flc_askend:"Frage am Ende",flc_fill4:"≤ 4 Füllwörter pro Minute",flc_fill3:"≤ 3 Füllwörter pro Minute",flc_fill1:"Höchstens 1 Füllwort",flc_accept:"Angebot angenommen (kein „nein, aber“)",flc_extend:"Erweitert (8+ Wörter)",flc_nopause:"Keine lange Pause",flc_three:"Drei Dinge",flc_in10:"In 10 s fertig",flc_spine:"≥ 4 Gerüst-Schritte",flc_dur3090:"30–90 Sekunden",flc_pause3:"≤ 3 lange Pausen",flc_pause2:"≤ 2 lange Pausen",flc_dur35:"Mindestens 35 Sekunden",flc_wpm:"Tempo 110–170 Wörter/Min.",flc_move_deepen:"Thema vertieft",flc_move_bridge:"Brückenformulierung genutzt",flc_move_revive:"Mit Rückgriff belebt",flc_move_exit:"Eleganter Ausstieg (Wertschätzung + Grund + Ausblick)",flc_len640:"6–40 Wörter",flc_dur5595:"55–95 Sekunden",flc_prep:"≥ 3 von 4 PREP-Teilen",flc_tech:"Technik angewendet",flc_len645:"6–45 Wörter",flc_noans:"Keine Antwort erkannt",
 flt_ack:"Greif zuerst ihre Worte auf: „Gern geschehen…“, „Danke, dir auch…“.",flt_reveal:"Ergänze ein kleines persönliches Detail mit „ich“ oder „mein“.",flt_ask:"Schließ mit einer Frage: „…und du?“, „Wie war's bei dir?“.",flt_lat25:"Beginne mit dem Aufgreifen – das verschafft dir Denkzeit.",flt_lat3:"Starte mit einer kurzen Reaktion („Oh!“, „Echt?“), während du nachdenkst.",flt_lat2:"Such nicht nach der perfekten Idee – sag die erste.",flt_len835:"Ziel: ein bis zwei Sätze.",flt_hook:"Wiederhole ein Detail, das genannt wurde, und frag danach.",flt_open:"Nutze was / wie / warum / erzähl – nicht „Hast du…?“.",flt_seq:"Nutze zuerst… dann… am Ende.",flt_detail:"Ergänze eine Zahl, einen Tag oder einen Ort.",flt_feel:"Sag, wie es für dich war: lustig, peinlich, stolz…",flt_askend:"Gib den Ball am Ende mit einer Frage zurück.",flt_fill4:"Ersetze „ähm“ durch eine kurze stille Pause.",flt_fill3:"Mach stille Pausen statt „ähm“.",flt_accept:"Beginne mit „Ja, und…“.",flt_extend:"Ergänze ein konkretes, überraschendes Detail.",flt_three:"Nenne drei verschiedene Dinge – schnell.",flt_spine:"Nutze die Schritte: Es war einmal – jeden Tag – eines Tages – deshalb – bis schließlich.",flt_prep:"Position (Ich finde…) – Begründung (weil…) – Beispiel (zum Beispiel…) – Position (also…).",flt_tech:"Öffne „Technik“ und nutze die Kernformulierung.",flt_move_deepen:"Frag nach dem Warum / Wie / was daran gefällt.",flt_move_bridge:"Nutze „Apropos…“ oder „Da fällt mir ein…“.",flt_move_revive:"Nutze „Du hattest vorhin erwähnt…“.",flt_move_exit:"Wertschätzung + Grund + Ausblick: „Schön, mit dir zu reden – ich hol mir einen Kaffee – bis später!“"});
Object.assign(T.fr,{fl_title:"Parler spontanément",fl_desc:"Un parcours en 8 étapes, des réponses-réflexes (« De rien ») à la conversation libre et improvisée : réponses ARE, saisir les perches, mini-récits, jeux d'impro, pilotage, improvisation oratoire et moments délicats. Mains libres : le partenaire parle, vous répondez ; l'appli mesure le temps de réaction, les mots de remplissage, les pauses, la structure et l'articulation.",
 fl_teaser:"s'entraîner à parler clairement et spontanément (parcours en 8 étapes)",fl_open:"Ouvrir",fl_place_q:"Par où commencer ?",fl_place_d:"8 courtes consignes issues de toutes les étapes (env. 5 min). Les étapes déjà maîtrisées (≥ 80) sont validées automatiquement.",fl_place:"Test de positionnement",fl_place_skip:"Commencer à l'étape 1",
 fl_warm:"Échauffement de 2 minutes (8 relances rapides)",fl_path:"Parcours",fl_path_n:"{n} étapes sur 8 validées",fl_learn:"Comment ça marche",fl_example:"Exemple",fl_pitfalls:"Erreurs typiques",fl_criteria:"Mesuré",fl_stats:"{n} réponses · moyenne récente {a} · meilleur {b}",fl_best:"meilleur",
 fl_drill:"S'entraîner (6)",fl_check:"Validation",fl_back:"Retour",fl_item:"Consigne {i} sur {n}",fl_situation:"Situation :",fl_technique:"Technique",fl_listen:"Écoutez…",fl_answer:"Répondre",fl_type:"Taper plutôt",fl_type_ph:"Tapez votre réponse…",fl_send:"Envoyer",fl_think:"Réfléchissez…",fl_skip_think:"Commencer",
 fl_rec_auto:"Parlez maintenant – l'enregistrement s'arrête tout seul après une courte pause.",fl_rec_manual:"Parlez maintenant – touchez ■ quand vous avez fini. La barre passe au vert, à l'orange puis au rouge comme le feu d'un club d'éloquence.",fl_stop:"Terminé",
 fl_heard:"Compris : « {t} »",fl_again:"Réessayer",fl_next:"Suivant",fl_finish:"Terminer",fl_crisp:"En improvisant, vos consonnes sont devenues floues – c'est justement là que la netteté compte.",fl_to_cons:"Entraînement des consonnes",
 fl_nosr:"La reconnaissance vocale n'est pas disponible – réécoutez-vous et cochez ce que vous avez réussi :",fl_rate_done:"Évaluer",fl_prep_n:"Parties PREP détectées : {n} sur 4",
 fl_sum:"Moyenne {p} sur {n} consignes",fl_passed:"Validation réussie : {s} !",fl_unlocked:"Débloqué : {s}.",fl_notyet:"Pas encore ({p} ; 75 requis) – entraînez-vous encore un peu puis réessayez.",fl_placed:"Votre étape de départ : {s}",
 fl_auto:"Mains libres (la réponse démarre automatiquement)",fl_typed:"Taper les réponses",fl_tr_lat:"Temps de réaction {a} s → {b} s",fl_tr_fill:"mots de remplissage/min {a} → {b}",
 fl_task_reflex:"Répondez avec ARE : reprendre – révéler un détail – relancer.",fl_task_hooks:"Saisissez une perche et posez une question ouverte.",fl_task_story:"Racontez un mini-récit de 20 à 60 s : titre, détail, ressenti, question.",fl_task_yesand:"Dites « Oui, et… » et ajoutez quelque chose – vite !",fl_task_three:"Citez-en trois – vite !",fl_task_spine:"Racontez l'histoire avec les six étapes de la trame.",fl_task_expert:"Parlez 45 s en expert – avec assurance, sans longues pauses.",fl_task_steer:"Faites le bon geste avec une formule de liaison.",fl_task_topics:"Parlez 60 à 90 s avec PREP : position, raison, exemple, position.",fl_task_tricky:"Gérez le moment avec la technique.",
 fl_three:"Trois {c}",fl_three_say:"Vite – cite trois {c} !",fl_spine:"Trame d'histoire : {s}",fl_spine_say:"Raconte-moi une histoire sur {s}. Commence par : il était une fois.",fl_expert:"Vous êtes l'expert mondial de : {s}",fl_expert_say:"Bienvenue à notre experte de {s}. Dites-nous tout !",
 fl_move_deepen:"Approfondir",fl_move_bridge:"Transition",fl_move_revive:"Relancer",fl_move_exit:"Sortie",
 fl_live_title:"Conversation libre",fl_live_desc:"Situation : {s}. Faites vivre l'échange au moins 8 tours – saisissez les perches, racontez, questionnez.",fl_live_start:"Lancer la conversation libre",fl_live_settings:"en attendant un train en retard|à l'anniversaire d'une amie|dans la file de la boulangerie|à la pause café d'une conférence|au square avec les enfants|pendant un long vol",
 fl_rep_title:"Votre bilan de conversation",fl_rep_turns:"Vos tours de parole",fl_rep_hooks:"Perches saisies",fl_rep_q:"Tours avec une question",fl_rep_len:"Mots par tour (moyenne)",fl_rep_share:"Votre part de parole",fl_rep_good:"Perches saisies :",fl_rep_miss:"Perches manquées :",fl_rep_could:"vous auriez pu rebondir sur : {h}",fl_free_pass:"Épreuve finale réussie – vous avez mené une vraie conversation improvisée !",fl_free_goal:"Objectif : ≥ 8 tours, ≥ 50 % de perches saisies, questions dans 30 à 70 % des tours, 8 à 40 mots par tour.",
 flm_lat:"réaction",flm_wpm:"mots/min",flm_fill:"remplissage",flm_pause:"longues pauses",flm_clar:"netteté",
 flc_ack:"Reprise de ce qui a été dit",flc_reveal:"Détail personnel révélé",flc_ask:"Question en retour",flc_lat25:"Début en moins de 2,5 s",flc_lat3:"Début en moins de 3 s",flc_lat2:"Début en moins de 2 s",flc_len835:"8 à 35 mots",flc_hook:"Perche saisie",flc_open:"Question ouverte (quoi / comment / pourquoi…)",flc_len530:"5 à 30 mots",flc_dur2575:"15 à 75 secondes",flc_seq:"Mots d'enchaînement (d'abord, puis…)",flc_detail:"Détail concret (chiffre, jour, nom)",flc_feel:"Ressenti ou appréciation",flc_askend:"Question à la fin",flc_fill4:"≤ 4 mots de remplissage par minute",flc_fill3:"≤ 3 mots de remplissage par minute",flc_fill1:"Au plus 1 mot de remplissage",flc_accept:"Proposition acceptée (pas de « non, mais »)",flc_extend:"Prolongée (8 mots et plus)",flc_nopause:"Pas de longue pause",flc_three:"Trois éléments",flc_in10:"Fini en 10 s",flc_spine:"≥ 4 étapes de la trame",flc_dur3090:"30 à 90 secondes",flc_pause3:"≤ 3 longues pauses",flc_pause2:"≤ 2 longues pauses",flc_dur35:"Au moins 35 secondes",flc_wpm:"Débit de 110 à 170 mots/min",flc_move_deepen:"Sujet approfondi",flc_move_bridge:"Formule de transition utilisée",flc_move_revive:"Relance par un rappel",flc_move_exit:"Sortie élégante (appréciation + raison + suite)",flc_len640:"6 à 40 mots",flc_dur5595:"55 à 95 secondes",flc_prep:"≥ 3 des 4 parties PREP",flc_tech:"Technique appliquée",flc_len645:"6 à 45 mots",flc_noans:"Aucune réponse détectée",
 flt_ack:"Commencez par reprendre leurs mots : « Avec plaisir… », « Merci, toi aussi… ».",flt_reveal:"Ajoutez un petit détail personnel avec « je » ou « mon ».",flt_ask:"Terminez par une question : « …et toi ? », « Et le tien ? ».",flt_lat25:"Commencez par la reprise – elle vous donne du temps pour réfléchir.",flt_lat3:"Démarrez par une courte réaction (« Oh ! », « Ah bon ? ») pendant que vous réfléchissez.",flt_lat2:"Ne cherchez pas l'idée parfaite – dites la première.",flt_len835:"Visez une ou deux phrases.",flt_hook:"Reprenez un détail mentionné et posez une question dessus.",flt_open:"Utilisez quoi / comment / pourquoi / raconte – pas « Tu as… ? ».",flt_seq:"Utilisez d'abord… puis… finalement.",flt_detail:"Ajoutez un chiffre, un jour ou un lieu.",flt_feel:"Dites comment vous l'avez vécu : drôle, gênant, fier…",flt_askend:"Renvoyez la balle par une question à la fin.",flt_fill4:"Remplacez « euh » par une courte pause silencieuse.",flt_fill3:"Faites des pauses silencieuses au lieu de « euh ».",flt_accept:"Commencez par « Oui, et… ».",flt_extend:"Ajoutez un détail concret et surprenant.",flt_three:"Citez trois choses différentes – vite.",flt_spine:"Suivez les étapes : il était une fois – chaque jour – un jour – à cause de cela – jusqu'à ce que finalement.",flt_prep:"Position (je pense…) – Raison (parce que…) – Exemple (par exemple…) – Position (donc…).",flt_tech:"Ouvrez « Technique » et utilisez sa formule clé.",flt_move_deepen:"Demandez pourquoi / comment / ce qui plaît.",flt_move_bridge:"Utilisez « À propos de… » ou « Ça me fait penser à… ».",flt_move_revive:"Utilisez « Tout à l'heure, tu disais… ».",flt_move_exit:"Appréciation + raison + suite : « Ravi d'avoir discuté – je vais prendre un café – à plus tard ! »"});
