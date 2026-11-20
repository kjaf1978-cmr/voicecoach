/* ================= v5.5: live conversation partner =================
   The app acts as a live counterpart: it reacts to what you said, keeps the conversation going, highlights the words to
   stress, and gives a short tip / a better wording after each of your turns.
   Engines (automatic order): Claude (when opened inside the Claude app) → browser built-in AI → your API key (OpenAI-compatible
   or Anthropic) → built-in offline partner (always works, no account, no internet). */
Object.assign(T.en,{lv_title:"💬 Live conversation", lv_desc:"Talk freely with a live counterpart. It reacts to what you say, keeps the conversation going, marks the words to stress and gives you a short tip after each answer.", lv_topic:"Situation", lv_free:"Free small talk", lv_custom:"Own situation (e.g. salary talk as senior engineer)", lv_start:"▶ Start live conversation", lv_engine:"Engine", lv_eng_set:"⚙ Engine settings",
 en_auto:"Automatic (best available)", en_claude:"Claude (inside the Claude app)", en_browser:"Browser AI (on the device)", en_api:"My API key", en_offline:"Built-in offline partner",
 lv_using:"Engine: {e}", lv_offline_note:"Works without internet and without an account; for freer, smarter answers you can add an API key.", lv_prov:"Provider", lv_base:"Server address (URL)", lv_model:"Model", lv_key:"API key (stored only on this device)", lv_test:"Test connection", lv_test_ok:"✓ Connected: “{t}”", lv_test_fail:"✗ Not reachable: {e}", lv_privacy:"With an online engine, your spoken text is sent to that provider. The key never leaves this device except to the provider you choose.",
 lv_speak:"🎤 Speak", lv_type:"Type instead…", lv_send:"Send", lv_end:"■ End conversation", lv_think:"…", lv_better:"Better:", lv_tip:"Tip:", lv_tapword:"Tap a word to hear it slowly.", lv_sum:"Conversation ended: {n} turns, on average {w} words per answer.", lv_sum_tips:"Tips from this conversation:", lv_fallback:"Online engine not reachable – switched to the offline partner.", lv_youmissed:"Unclear (low recognition):", lv_again:"↻ New conversation", lv_sr_off:"Speech recognition is not available here – type your answers."});
Object.assign(T.de,{lv_title:"💬 Live-Gespräch", lv_desc:"Sprich frei mit einem Live-Gegenüber. Es reagiert auf das, was du sagst, hält das Gespräch am Laufen, markiert die Wörter, die du betonen solltest, und gibt dir nach jeder Antwort einen kurzen Tipp.", lv_topic:"Situation", lv_free:"Freier Smalltalk", lv_custom:"Eigene Situation (z. B. Gehaltsgespräch als Senior-Ingenieur)", lv_start:"▶ Live-Gespräch starten", lv_engine:"Engine", lv_eng_set:"⚙ Engine-Einstellungen",
 en_auto:"Automatisch (beste verfügbare)", en_claude:"Claude (in der Claude-App)", en_browser:"Browser-KI (auf dem Gerät)", en_api:"Mein API-Schlüssel", en_offline:"Eingebautes Offline-Gegenüber",
 lv_using:"Engine: {e}", lv_offline_note:"Funktioniert ohne Internet und ohne Konto; für freiere, klügere Antworten kannst du einen API-Schlüssel hinzufügen.", lv_prov:"Anbieter", lv_base:"Serveradresse (URL)", lv_model:"Modell", lv_key:"API-Schlüssel (nur auf diesem Gerät gespeichert)", lv_test:"Verbindung testen", lv_test_ok:"✓ Verbunden: „{t}“", lv_test_fail:"✗ Nicht erreichbar: {e}", lv_privacy:"Mit einer Online-Engine wird dein gesprochener Text an diesen Anbieter gesendet. Der Schlüssel verlässt das Gerät nur in Richtung des gewählten Anbieters.",
 lv_speak:"🎤 Sprechen", lv_type:"Stattdessen tippen …", lv_send:"Senden", lv_end:"■ Gespräch beenden", lv_think:"…", lv_better:"Besser:", lv_tip:"Tipp:", lv_tapword:"Tippe auf ein Wort, um es langsam zu hören.", lv_sum:"Gespräch beendet: {n} Beiträge, im Schnitt {w} Wörter pro Antwort.", lv_sum_tips:"Tipps aus diesem Gespräch:", lv_fallback:"Online-Engine nicht erreichbar – auf das Offline-Gegenüber umgeschaltet.", lv_youmissed:"Undeutlich (schlecht erkannt):", lv_again:"↻ Neues Gespräch", lv_sr_off:"Spracherkennung ist hier nicht verfügbar – tippe deine Antworten."});
Object.assign(T.fr,{lv_title:"💬 Conversation en direct", lv_desc:"Parlez librement avec un interlocuteur en direct. Il réagit à ce que vous dites, fait avancer la conversation, marque les mots à accentuer et vous donne un court conseil après chaque réponse.", lv_topic:"Situation", lv_free:"Small talk libre", lv_custom:"Situation personnelle (p. ex. négociation salariale d'ingénieur senior)", lv_start:"▶ Démarrer la conversation", lv_engine:"Moteur", lv_eng_set:"⚙ Réglages du moteur",
 en_auto:"Automatique (le meilleur disponible)", en_claude:"Claude (dans l'appli Claude)", en_browser:"IA du navigateur (sur l'appareil)", en_api:"Ma clé API", en_offline:"Interlocuteur hors ligne intégré",
 lv_using:"Moteur : {e}", lv_offline_note:"Fonctionne sans internet et sans compte ; pour des réponses plus libres et plus fines, ajoutez une clé API.", lv_prov:"Fournisseur", lv_base:"Adresse du serveur (URL)", lv_model:"Modèle", lv_key:"Clé API (enregistrée uniquement sur cet appareil)", lv_test:"Tester la connexion", lv_test_ok:"✓ Connecté : « {t} »", lv_test_fail:"✗ Injoignable : {e}", lv_privacy:"Avec un moteur en ligne, votre texte parlé est envoyé à ce fournisseur. La clé ne quitte l'appareil que vers le fournisseur choisi.",
 lv_speak:"🎤 Parler", lv_type:"Taper plutôt…", lv_send:"Envoyer", lv_end:"■ Terminer la conversation", lv_think:"…", lv_better:"Mieux :", lv_tip:"Conseil :", lv_tapword:"Touchez un mot pour l'entendre lentement.", lv_sum:"Conversation terminée : {n} échanges, en moyenne {w} mots par réponse.", lv_sum_tips:"Conseils de cette conversation :", lv_fallback:"Moteur en ligne injoignable – passage à l'interlocuteur hors ligne.", lv_youmissed:"Peu clair (mal reconnu) :", lv_again:"↻ Nouvelle conversation", lv_sr_off:"La reconnaissance vocale n'est pas disponible ici – tapez vos réponses."});

const LV_PROV={openai:{n:"OpenAI",base:"https://api.openai.com/v1",model:"gpt-4o-mini"},mistral:{n:"Mistral",base:"https://api.mistral.ai/v1",model:"mistral-small-latest"},groq:{n:"Groq",base:"https://api.groq.com/openai/v1",model:"llama-3.1-8b-instant"},
 openrouter:{n:"OpenRouter",base:"https://openrouter.ai/api/v1",model:"openrouter/auto"},pollinations:{n:"Pollinations",base:"https://gen.pollinations.ai/v1",model:"openai"},anthropic:{n:"Anthropic (Claude)",base:"https://api.anthropic.com/v1",model:"claude-haiku-5-5"},
 ollama:{n:"Ollama (own computer)",base:"http://localhost:11434/v1",model:"llama3.1"},custom:{n:"Other (OpenAI-compatible)",base:"",model:""}};
function lvCfg(){ SET.live=SET.live||{engine:"auto",prov:"openai",base:"",model:"",key:""}; return SET.live; }
const LANG_FULL={en:"English",de:"German",fr:"French"};

/* ---------- engines ---------- */
let LV_CLAUDE=null; try{ if(window.claude&&window.claude.use) window.claude.use("sample").then(s=>{ LV_CLAUDE=s; if(typeof renderLive==="function") renderLive(); }).catch(()=>{}); }catch(e){}
async function browserAI(){ try{ if(typeof LanguageModel!=="undefined"){ const a=await Promise.race([LanguageModel.availability(),new Promise(r=>setTimeout(()=>r("timeout"),1500))]); return a==="available"||a==="readily"; } }catch(e){} return false; }
async function pickEngine(){ const c=lvCfg(); if(c.engine!=="auto") return c.engine;
  if(LV_CLAUDE) return "claude"; if(c.key||c.prov==="ollama") return "api"; if(await browserAI()) return "browser"; return "offline"; }
function sysPrompt(S){ return `You are a conversation partner in a speaking-practice app. Speak ${LANG_FULL[S.lang]} only.
Situation: ${S.topic}. Your role/personality: ${S.persona}.
Rules: reply in 1–3 short, natural spoken sentences, react specifically to what the user just said (use their details), and end with one question that moves the conversation forward. Never break character, never mention that you are an AI unless asked. The user's text comes from speech recognition and may contain recognition errors – interpret it sensibly.
Return ONLY JSON: {"reply":"…","stress":["1–3 words from your reply that should be stressed when spoken"],"better":"a more natural or correct version of the user's last message in ${LANG_FULL[S.lang]} (empty if it was already good)","tip":"one short, concrete tip in ${LANG_FULL[S.ui]} about the user's last message – wording, grammar, clarity, or which word to stress (empty if nothing to improve)"}`; }
function parseJSONish(txt){ if(!txt) return null; const m=String(txt).match(/\{[\s\S]*\}/); if(m){ try{ return JSON.parse(m[0]); }catch(e){} } return {reply:String(txt).trim(),stress:[],better:"",tip:""}; }
async function engineCall(kind,S,msgs){
  const sys=sysPrompt(S), c=lvCfg();
  if(kind==="claude"){ const r=await Promise.race([LV_CLAUDE([{role:"user",content:sys+"\n\nConversation so far (JSON):\n"+JSON.stringify(msgs)+"\n\nReply as the partner now."}],{modelTier:"quick",cache:false}),new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),30000))]); return parseJSONish(r.text); }
  if(kind==="browser"){ const tmo=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),ms))]);
    if(!S.bsess) S.bsess=await tmo(LanguageModel.create({initialPrompts:[{role:"system",content:sys}]}),15000); const last=msgs[msgs.length-1]; const r=await tmo(S.bsess.prompt(last?last.content:"Start the conversation."),25000); return parseJSONish(r); }
  if(kind==="api"){ const P=LV_PROV[c.prov]||LV_PROV.custom, base=(c.base||P.base).replace(/\/+$/,""), model=c.model||P.model, ctl=new AbortController(), to=setTimeout(()=>ctl.abort(),25000);
    try{
      if(c.prov==="anthropic"){ const r=await fetch(base+"/messages",{method:"POST",signal:ctl.signal,headers:{"content-type":"application/json","x-api-key":c.key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model,max_tokens:400,system:sys,messages:msgs.length?msgs:[{role:"user",content:"(start)"}]})});
        if(!r.ok) throw new Error(r.status+" "+(await r.text()).slice(0,120)); const j=await r.json(); return parseJSONish((j.content||[]).map(x=>x.text||"").join("")); }
      const r=await fetch(base+"/chat/completions",{method:"POST",signal:ctl.signal,headers:Object.assign({"content-type":"application/json"},c.key?{authorization:"Bearer "+c.key}:{}),body:JSON.stringify({model,temperature:0.8,messages:[{role:"system",content:sys}].concat(msgs.length?msgs:[{role:"user",content:"(start)"}])})});
      if(!r.ok) throw new Error(r.status+" "+(await r.text()).slice(0,120)); const j=await r.json(); return parseJSONish(j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content);
    } finally{ clearTimeout(to); } }
  return offlineReply(S,msgs);
}

/* ---------- built-in offline partner ---------- */
const LV_STOP=new Set(("going being doing how's what's there's it's that's today about would could should the a an and or but so to of in on at for with from by is are was were be been am i you he she it we they me my your our their this that these those there here very really just also then than as do did does have has had not no yes can could would should will "
 +"der die das ein eine einer einem einen und oder aber also zu von in im an am auf für mit aus bei ist sind war waren bin bist ich du er sie es wir ihr mich mein meine dein sehr wirklich nur auch dann als nicht kein keine ja nein kann könnte würde habe hat hatte haben noch schon "
 +"le la les un une des et ou mais donc à de du dans en sur pour avec par est sont était étais suis je tu il elle nous vous ils elles me mon ma mes ton ta très vraiment juste aussi puis que qui ne pas oui non peux pourrait ai as avait avons").split(/\s+/));
const LV_TXT={
 en:{open:{st:["Hi! Nice to meet you. How's your day going so far?","Hello! I don't think we've met – what brings you here today?"],iv:["Good morning, thanks for coming in. Could you start by telling me a bit about yourself?","Welcome! Let's begin – what made you apply for this position?"]},
  more:["Could you tell me a bit more about that?","Interesting – can you give me an example?","Go on – what happened next?"],
  follow:["You mentioned “{x}” – how did that go?","“{x}” – what did you learn from that?","Why is “{x}” important to you?","Can you tell me more about “{x}”?"],
  ask:["Good question! For me it's quite similar, actually – I'm still learning a lot.","Ha, good question. Honestly, it depends on the day – but mostly yes."],
  bridge:["By the way, ","Let me ask you something else: ","Changing the subject a little – "],
  tipF:"Try to avoid fillers like “{f}” – a short pause sounds more confident.", tipS:"Give a slightly longer answer: one detail or example makes it more interesting.", tipQ:"Small talk works both ways – ask a question back now and then.", tipL:"Very long answer – try to make your point in two or three sentences."},
 de:{open:{st:["Hallo! Schön, dich kennenzulernen. Wie läuft dein Tag bisher?","Hallo! Ich glaube, wir kennen uns noch nicht – was führt dich heute her?"],iv:["Guten Morgen, danke, dass Sie gekommen sind. Erzählen Sie doch zuerst etwas über sich.","Willkommen! Fangen wir an – was hat Sie dazu bewogen, sich auf diese Stelle zu bewerben?"]},
  more:["Kannst du mir etwas mehr darüber erzählen?","Interessant – hast du ein Beispiel dafür?","Erzähl weiter – was ist dann passiert?"],
  moreF:["Können Sie mir etwas mehr darüber erzählen?","Interessant – haben Sie ein Beispiel dafür?","Erzählen Sie weiter – was ist dann passiert?"],
  follow:["Du hast „{x}“ erwähnt – wie lief das?","„{x}“ klingt spannend – was hast du dabei gelernt?","Warum ist dir „{x}“ wichtig?","Erzähl mir mehr über „{x}“."],
  followF:["Sie haben „{x}“ erwähnt – wie lief das?","„{x}“ – was haben Sie dabei gelernt?","Warum ist Ihnen „{x}“ wichtig?","Können Sie „{x}“ etwas genauer beschreiben?"],
  ask:["Gute Frage! Bei mir ist das eigentlich ganz ähnlich – ich lerne auch noch viel dazu.","Ha, gute Frage. Ehrlich gesagt kommt es auf den Tag an – aber meistens ja."],
  askF:["Gute Frage! Bei mir ist das ganz ähnlich – ich lerne auch noch viel dazu.","Gute Frage. Ehrlich gesagt kommt es darauf an – aber meistens ja."],
  bridge:["Übrigens: ","Mal etwas anderes: ","Um das Thema ein bisschen zu wechseln – "],
  tipF:"Vermeide Füllwörter wie „{f}“ – eine kurze Pause wirkt souveräner.", tipS:"Antworte etwas ausführlicher: ein Detail oder Beispiel macht es interessanter.", tipQ:"Smalltalk geht in beide Richtungen – stell ab und zu eine Gegenfrage.", tipL:"Sehr lange Antwort – versuch, deinen Punkt in zwei, drei Sätzen zu machen."},
 fr:{open:{st:["Bonjour ! Ravi de vous rencontrer. Comment se passe votre journée ?","Bonjour ! Je crois que nous ne nous connaissons pas – qu'est-ce qui vous amène ici ?"],iv:["Bonjour, merci d'être venu. Pouvez-vous commencer par vous présenter ?","Bienvenue ! Commençons – qu'est-ce qui vous a donné envie de postuler à ce poste ?"]},
  more:["Pouvez-vous m'en dire un peu plus ?","Intéressant – avez-vous un exemple ?","Continuez – que s'est-il passé ensuite ?"],
  follow:["Vous avez mentionné « {x} » – comment cela s'est-il passé ?","« {x} » – qu'en avez-vous appris ?","Pourquoi « {x} » est-il important pour vous ?","Pouvez-vous m'en dire plus sur « {x} » ?"],
  ask:["Bonne question ! Pour moi, c'est assez similaire en fait – j'apprends encore beaucoup.","Ha, bonne question. Honnêtement, ça dépend des jours – mais en général oui."],
  bridge:["Au fait, ","Autre chose : ","Pour changer un peu de sujet – "],
  tipF:"Évitez les mots de remplissage comme « {f} » – une courte pause paraît plus sûre.", tipS:"Répondez un peu plus longuement : un détail ou un exemple rend la réponse plus intéressante.", tipQ:"Le small talk va dans les deux sens – posez aussi une question de temps en temps.", tipL:"Réponse très longue – essayez de faire passer votre idée en deux ou trois phrases."}};
function lvBank(S){ // questions from the chosen scene (+ surprise pool) or a mixed small-talk bank
  const pick=l=>{ const out=[]; const add=tu=>{ if(tu&&tu[0]) out.push(String(tu[0]).split("||").map(x=>x.trim())); };
    if(S.scene){ (S.scene.turns[l]||[]).forEach(add); const k=S.scene.kind; if(k&&CURVE[k]) CURVE[k].forEach(c=>add((S.scene.formal&&c[l+"_f"])||c[l])); }
    else { CURVE.st.forEach(c=>add(c[l])); SCENES.filter(s=>s.kind==="st").forEach(s=>add((s.turns[l]||[])[1])); }
    return out; };
  return pick(S.lang); }
function offlineReply(S,msgs){
  const L=LV_TXT[S.lang], users=msgs.filter(m=>m.role==="user"), last=users[users.length-1], kind=S.scene&&S.scene.kind==="iv"?"iv":"st";
  if(!S.bank){ const all=lvBank(S); S.bank=S.scene?[all[0]].concat(all.slice(1).sort(()=>Math.random()-0.5)):all.sort(()=>Math.random()-0.5); S.bi=0; S.followed=0; }
  const F=S.scene&&(S.scene.kind==="iv"||S.scene.formal), pickL=k=>(F&&L[k+"F"])||L[k];
  const nextQ=()=>{ while(S.bi<S.bank.length){ const v=S.bank[S.bi++]; const q=rnd(v); if(!S.used||!S.used.has(q)){ (S.used=S.used||new Set()).add(q); return q; } } S.bi=0; return rnd(pickL("more")); };
  if(!last){ const q=S.scene?nextQ():rnd(L.open[kind]); return {reply:q,stress:lvStress(q,S.lang),better:"",tip:""}; }
  const txt=last.content, tn=norm(txt), words=tn?tn.split(" "):[], isQ=/\?\s*$/.test(txt)||/^(what|how|why|where|when|do you|are you|have you|was|wie|warum|wo|wann|was|hast du|bist du|haben sie|sind sie|que|qu|comment|pourquoi|où|quand|est-ce|avez-vous|êtes-vous|tu)\b/i.test(txt.trim());
  const reactTier=words.length<5?"weak":words.length<12?"ok":"good", persona=S.pname, react=REACT[S.lang]&&REACT[S.lang][persona]?rnd(REACT[S.lang][persona][reactTier]):"";
  let reply;
  if(isQ){ reply=rnd(pickL("ask"))+" "+rnd(L.bridge)+lcFirst(nextQ(),S.lang); }
  else if(words.length<5){ reply=(react?react+" ":"")+rnd(pickL("more")); }
  else { const x=lvTopic(txt,S.lang); if(x&&S.followed<1&&Math.random()<0.65){ S.followed++; reply=(react?react+" ":"")+rnd(pickL("follow")).replace("{x}",x); } else { S.followed=0; reply=(react?react+" ":"")+nextQ(); } }
  // tips from the user's message
  const fset=new Set(FILLERS[S.lang].map(norm)), fil=words.filter(w=>fset.has(w)); let tip="";
  if(fil.length) tip=L.tipF.replace("{f}",fil[0]); else if(words.length<5) tip=L.tipS; else if(words.length>60) tip=L.tipL; else if(kind==="st"&&users.length>=3&&!users.slice(-3).some(m=>/\?/.test(m.content))) tip=L.tipQ;
  return {reply,stress:lvStress(reply,S.lang),better:"",tip};
}
function lcFirst(s,lang){ return s&&lang!=="de"&&!/^I\b/.test(s)?s[0].toLowerCase()+s.slice(1):s; } // German keeps capitals (nouns, „Sie“)
function lvTopic(txt,lang){ const ws=txt.replace(/[.,;:!?„“"«»()]/g," ").split(/\s+/).filter(w=>w.length>3&&!LV_STOP.has(w.toLowerCase())&&!/^\d+$/.test(w));
  if(!ws.length) return null; const nouns=lang==="de"?ws.filter(w=>/^[A-ZÄÖÜ]/.test(w)):ws; const pool=(nouns.length?nouns:ws).slice(1).concat((nouns.length?nouns:ws).slice(0,1));
  return pool.sort((a,b)=>b.length-a.length)[0]; }
function lvStress(reply,lang){ const ws=reply.replace(/[.,;:!?„“"«»()–-]/g," ").split(/\s+/).filter(w=>w.length>4&&!/['’]/.test(w)&&!LV_STOP.has(w.toLowerCase())); return ws.sort((a,b)=>b.length-a.length).slice(0,2); }

/* ---------- UI ---------- */
const LIVE={S:null};
function renderLive(){
  const box=$("#liveCard"); if(!box) return; const c=lvCfg(), scenes=SCENES.filter(s=>s.kind&&sceneShown(s));
  box.innerHTML=`<h2>${t("lv_title")}</h2><p class="muted">${t("lv_desc")}</p>
    <b>${t("lv_topic")}</b><div class="chips" data-tp style="margin:4px 0"></div><input type="text" data-own placeholder="${esc(t("lv_custom"))}" style="width:100%;margin:4px 0">
    <div class="row"><span class="muted grow" data-eng>…</span><button class="b sm alt" data-set>${t("lv_eng_set")}</button></div><div data-cfg class="hidden"></div>
    <button class="b warm" style="width:100%;margin-top:6px" data-go>${t("lv_start")}</button><div data-chat></div>`;
  const topics=[["",t("lv_free")]].concat(scenes.map(s=>[s.id,s.title[SET.ui]])); LIVE.topic=LIVE.topic!=null&&topics.some(x=>x[0]===LIVE.topic)?LIVE.topic:"";
  chipSet(box.querySelector("[data-tp]"),topics,LIVE.topic,v=>{ LIVE.topic=v; renderLive(); });
  pickEngine().then(e=>{ const n=box.querySelector("[data-eng]"); if(n) n.textContent=t("lv_using",{e:t("en_"+e)})+(e==="offline"?" – "+t("lv_offline_note"):""); });
  box.querySelector("[data-set]").onclick=()=>{ const cf=box.querySelector("[data-cfg]"); cf.classList.toggle("hidden"); renderLiveCfg(cf); };
  box.querySelector("[data-go]").onclick=()=>startLive(box.querySelector("[data-chat]"),box.querySelector("[data-own]").value.trim());
}
function renderLiveCfg(cf){ const c=lvCfg(), P=LV_PROV[c.prov]||LV_PROV.custom;
  cf.innerHTML=`<div class="card flat" style="margin:6px 0"><b>${t("lv_engine")}</b><div class="chips" data-e></div>
    <div data-api class="${c.engine==="api"||c.engine==="auto"?"":"hidden"}"><p style="margin:6px 0 2px"><b>${t("lv_prov")}</b></p><div class="chips" data-p></div>
    <label class="muted" style="font-size:.8rem">${t("lv_base")}</label><input type="url" data-b value="${esc(c.base||P.base)}" style="width:100%">
    <label class="muted" style="font-size:.8rem">${t("lv_model")}</label><input type="text" data-m value="${esc(c.model||P.model)}" style="width:100%">
    <label class="muted" style="font-size:.8rem">${t("lv_key")}</label><input type="password" data-k value="${esc(c.key||"")}" style="width:100%" autocomplete="off">
    <p class="muted" style="font-size:.75rem">${t("lv_privacy")}</p></div>
    <button class="b sm alt" data-t>${t("lv_test")}</button> <span data-tr class="muted" style="font-size:.85rem"></span></div>`;
  chipSet(cf.querySelector("[data-e]"),["auto","claude","browser","api","offline"].map(k=>[k,t("en_"+k)]),c.engine,v=>{ c.engine=v; save(); renderLive(); const nc=$("#liveCard [data-cfg]"); nc.classList.remove("hidden"); renderLiveCfg(nc); });
  chipSet(cf.querySelector("[data-p]"),Object.keys(LV_PROV).map(k=>[k,LV_PROV[k].n]),c.prov,v=>{ c.prov=v; c.base=""; c.model=""; save(); renderLiveCfg(cf); });
  const sv=()=>{ c.base=cf.querySelector("[data-b]").value.trim(); c.model=cf.querySelector("[data-m]").value.trim(); c.key=cf.querySelector("[data-k]").value.trim(); save(); };
  cf.querySelectorAll("[data-b],[data-m],[data-k]").forEach(i=>i.onchange=()=>{ sv(); renderLive(); const nc=$("#liveCard [data-cfg]"); nc.classList.remove("hidden"); renderLiveCfg(nc); });
  cf.querySelector("[data-t]").onclick=async()=>{ sv(); const tr=cf.querySelector("[data-tr]"); tr.textContent="…"; const e=await pickEngine();
    try{ const r=await engineCall(e,{lang:SET.tl,ui:SET.ui,topic:"a quick connection test",persona:"friendly"},[{role:"user",content:"Say hello in one short sentence."}]); tr.textContent=t("lv_test_ok",{t:(r&&r.reply||"").slice(0,60)})+" ("+t("en_"+e)+")"; }
    catch(err){ tr.textContent=t("lv_test_fail",{e:String(err.message||err).slice(0,90)}); } };
}
async function startLive(chat,own){
  const sc=LIVE.topic?SCENES.find(s=>s.id===LIVE.topic):null, kind=sc&&sc.kind==="iv"?"iv":"st", pn=rnd(Object.keys(PERSONAS[kind]));
  const topic=own||(sc?sc.title.en+(sc.role?" ("+sc.role+")":""):"relaxed small talk between two people who just met");
  const S=LIVE.S={lang:SET.tl,ui:SET.ui,scene:own?null:sc,topic,pname:pn,persona:pn+(kind==="iv"?" interviewer":" conversation partner"),msgs:[],tips:[],nWords:[],engine:await pickEngine(),on:true};
  chat.innerHTML=`<div class="card flat" style="margin-top:8px"><div class="row"><span class="tag">${t("vy_with")} ${t("ps_"+pn)}</span><span class="grow"></span><span class="muted" style="font-size:.75rem">${t("en_"+S.engine)}</span></div>
    <div data-log style="max-height:55vh;overflow:auto;margin:6px 0"></div><p class="muted" style="font-size:.72rem">${t("lv_tapword")}</p>
    <div data-in></div><button class="b alt sm" data-end style="margin-top:6px">${t("lv_end")}</button></div>`;
  chat.querySelector("[data-end]").onclick=()=>endLive(chat);
  await lvPartnerTurn(chat);
}
function lvBubble(chat,html,me){ const log=chat.querySelector("[data-log]"); const d=el("div",{class:"bubble "+(me?"me":"them"),style:"margin:6px 0"}); d.innerHTML=html; log.append(d); log.scrollTop=log.scrollHeight; return d; }
function lvMark(reply,stress,lang){ const st=new Set((stress||[]).map(w=>norm(w))); return reply.split(/(\s+)/).map(tok=>{ if(/^\s+$/.test(tok)) return tok; const n=norm(tok); const cls=st.has(n)?"stress":""; return `<span class="lvw ${cls}" data-w="${esc(tok.replace(/[.,;:!?„“"«»()]/g,""))}" style="cursor:pointer${cls?";font-weight:700;text-decoration:underline;text-decoration-color:var(--accent2)":""}">${esc(tok)}</span>`; }).join(""); }
async function lvPartnerTurn(chat){
  const S=LIVE.S; if(!S||!S.on) return; const think=lvBubble(chat,`<i>${t("lv_think")}</i>`,false); let r;
  try{ r=await engineCall(S.engine,S,S.msgs); if(!r||!r.reply) throw new Error("empty"); }
  catch(e){ if(S.engine!=="offline"){ S.engine="offline"; toast(t("lv_fallback")); } r=offlineReply(S,S.msgs); }
  if(!S.on) return;
  const last=S.msgs.length?S.msgs[S.msgs.length-1]:null; S.msgs.push({role:"assistant",content:r.reply});
  // feedback on the user's previous turn (better wording / tip) shown under their bubble
  if(last&&last.role==="user"&&(r.better||r.tip)){ const fb=[]; if(r.better&&norm(r.better)!==norm(last.content)) fb.push(`<div><b>${t("lv_better")}</b> <span ${tlAttr(S.lang)}>${lvDiff(last.content,r.better)}</span> <button class="b sm alt" data-sb>🔊</button></div>`); if(r.tip){ fb.push(`<div><b>${t("lv_tip")}</b> ${esc(r.tip)}</div>`); S.tips.push(r.tip); }
    if(fb.length){ const f=el("div",{class:"card flat",style:"margin:2px 0 6px 20%;font-size:.85rem;border-left:3px solid var(--accent)"}); f.innerHTML=fb.join(""); think.before(f); const sb=f.querySelector("[data-sb]"); if(sb) sb.onclick=()=>speak(r.better,S.lang,null,0.85,"model"); } }
  think.innerHTML=`<span ${tlAttr(S.lang)}>${lvMark(r.reply,r.stress,S.lang)}</span> <button class="b sm alt" style="min-height:28px;padding:2px 8px" data-rp>🔊</button>`;
  think.querySelectorAll(".lvw").forEach(w=>w.onclick=()=>speak(w.dataset.w,S.lang,null,0.7,"model"));
  think.querySelector("[data-rp]").onclick=()=>speak(r.reply,S.lang);
  speak(r.reply,S.lang,()=>{ if(LIVE.S===S&&S.on) lvUserInput(chat); }); lvUserInput(chat,true);
}
function lvDiff(a,b){ const A=new Set(norm(a).split(" ")); return b.split(/(\s+)/).map(tok=>/^\s+$/.test(tok)?tok:(A.has(norm(tok))?esc(tok):`<b style="color:var(--ok)">${esc(tok)}</b>`)).join(""); }
function lvUserInput(chat,quiet){
  const S=LIVE.S, inp=chat.querySelector("[data-in]"); if(!inp||!S.on) return; if(inp.dataset.ready==="1") return; inp.dataset.ready="1";
  const srOk=typeof SR!=="undefined"&&SR&&!srBroken;
  inp.innerHTML=`${srOk?`<button class="b warm" style="width:100%" data-sp>${t("lv_speak")}</button><div class="muted" data-int style="min-height:1.2em;font-size:.85rem"></div>`:`<p class="muted" style="font-size:.8rem">${t("lv_sr_off")}</p>`}
    <details ${srOk?"":"open"}><summary class="muted" style="font-size:.8rem">${t("lv_type")}</summary><div class="row"><input type="text" data-tx style="flex:1"><button class="b sm" data-snd>${t("lv_send")}</button></div></details>`;
  const send=(text,confs)=>{ text=(text||"").trim(); if(!text) return; inp.dataset.ready="0"; inp.innerHTML=""; S.msgs.push({role:"user",content:text}); S.nWords.push(norm(text).split(" ").length);
    const low=confs&&confs.length&&Math.min(...confs)<0.6; lvBubble(chat,esc(text)+(low?`<div style="font-size:.75rem;color:var(--accent2)">${t("lv_youmissed")} ${Math.round(Math.min(...confs)*100)} %</div>`:""),true); lvPartnerTurn(chat); };
  const sp=inp.querySelector("[data-sp]"); if(sp) sp.onclick=async()=>{ try{ speechSynthesis.cancel(); }catch(e){} sp.disabled=true; sp.textContent="🎤 …"; const it=inp.querySelector("[data-int]");
    try{ const r=await recognizeOnce(S.lang,x=>{ it.textContent=x; }); if(r.text) send(r.text,r.confs); else { sp.disabled=false; sp.textContent=t("lv_speak"); } }catch(e){ sp.disabled=false; sp.textContent=t("lv_speak"); it.textContent=t("lv_sr_off"); } };
  const tx=inp.querySelector("[data-tx]"); inp.querySelector("[data-snd]").onclick=()=>send(tx.value); tx.onkeydown=e=>{ if(e.key==="Enter") send(tx.value); };
}
function endLive(chat){ const S=LIVE.S; if(!S) return; S.on=false; try{ speechSynthesis.cancel(); }catch(e){} try{ stopRecognition(); }catch(e){}
  const n=S.nWords.length, avg=n?Math.round(S.nWords.reduce((a,b)=>a+b,0)/n):0; if(n) logSession(t("lv_title"),Math.max(1,n*0.5));
  const tips=[...new Set(S.tips)].slice(0,6);
  chat.querySelector("[data-in]").innerHTML=`<div class="okbox">${t("lv_sum",{n,w:avg})}${tips.length?`<p style="margin:6px 0 2px"><b>${t("lv_sum_tips")}</b></p><ul class="list">${tips.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}</div><button class="b alt" style="width:100%;margin-top:6px" data-ag>${t("lv_again")}</button>`;
  chat.querySelector("[data-end]").remove(); chat.querySelector("[data-ag]").onclick=()=>renderLive(); }
