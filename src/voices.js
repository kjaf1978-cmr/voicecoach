/* ================= Model voice matched to the user's profile (v3.6) =================
   Browsers do not report a voice's gender. We detect it from voice names / identifiers of common engines
   (Google, Samsung, Microsoft, Apple) and fall back to adjusting pitch/rate of the available voice. */
Object.assign(T.en,{set_voice:"Model voice (“listen to a model”)", voice_auto:"Automatic – matches your profile", voice_test:"🔊 Test", voice_g_m:"male", voice_g_f:"female", voice_g_u:"unknown",
 voice_info:"Model voice: {v}", voice_adjust:"No {g} voice is installed for {l}, so the app lowers or raises the pitch of the available voice. More voices: Android Settings → General management → Text-to-speech → Preferred engine (Google) → ⚙ → Install voice data → language → choose a voice.", voice_sample:"This is how I will read the examples for you."});
Object.assign(T.de,{set_voice:"Vorsprechstimme („Modell anhören“)", voice_auto:"Automatisch – passend zu deinem Profil", voice_test:"🔊 Test", voice_g_m:"männlich", voice_g_f:"weiblich", voice_g_u:"unbekannt",
 voice_info:"Vorsprechstimme: {v}", voice_adjust:"Für {l} ist keine {g} Stimme installiert, deshalb passt die App Tonhöhe und Tempo der vorhandenen Stimme an. Weitere Stimmen: Android-Einstellungen → Allgemeine Verwaltung → Text-zu-Sprache → Bevorzugte Engine (Google) → ⚙ → Sprachdaten installieren → Sprache → Stimme wählen.", voice_sample:"So lese ich dir die Beispiele vor."});
Object.assign(T.fr,{set_voice:"Voix modèle (« écouter le modèle »)", voice_auto:"Automatique – adaptée à votre profil", voice_test:"🔊 Tester", voice_g_m:"masculine", voice_g_f:"féminine", voice_g_u:"inconnue",
 voice_info:"Voix modèle : {v}", voice_adjust:"Aucune voix {g} n'est installée pour {l} ; l'appli abaisse ou relève donc la hauteur de la voix disponible. Plus de voix : Paramètres Android → Gestion globale → Synthèse vocale → Moteur préféré (Google) → ⚙ → Installer les données vocales → langue → choisir une voix.", voice_sample:"Voici comment je vous lirai les exemples."});

/* known voice identifiers/names → gender (heuristic; extendable) */
const VOICE_M=["male","mann","homme","masculin","männlich","-x-iol","-x-iom","-x-tpd","-x-gbb","-x-gbd","-x-rjs","-x-deg","-x-dee","-x-frb","-x-frd","-x-vlf",
 "guy","ryan","christopher","eric","davis","tony","brian","andrew","thomas","daniel","alex","fred","aaron","arthur","oliver","conrad","stefan","killian","florian","markus","yannick","henri","claude","paul","jerome","rémy","remy","antoine","nicolas","jacques","matthew","george","james","william"];
const VOICE_F=["female","frau","femme","féminin","weiblich","-x-sfg","-x-tpc","-x-tpf","-x-gba","-x-gbc","-x-gbg","-x-dea","-x-deb","-x-nfh","-x-fra","-x-frc","-x-vlh",
 "aria","jenny","sonia","libby","emma","ava","samantha","karen","moira","tessa","fiona","victoria","susan","zira","hazel","katja","hedda","amala","anna","helena","petra","marlene","vicki","denise","julie","eloise","amélie","amelie","audrey","aurélie","marie","hortense","celine","céline","sara","serena","kate","catherine"];
function voiceGender(v){ const s=(v.name+" "+v.voiceURI).toLowerCase();
  if(/\bfemale\b|weiblich|\bfemme\b|féminin/.test(s)) return "f"; if(/\bmale\b|männlich|\bmann\b|\bhomme\b|masculin/.test(s)) return "m";
  if(VOICE_F.some(k=>k.startsWith("-x-")?s.includes(k):new RegExp("\\b"+k+"\\b").test(s))) return "f";
  if(VOICE_M.some(k=>k.startsWith("-x-")?s.includes(k):new RegExp("\\b"+k+"\\b").test(s))) return "m";
  return "u"; }
function voicesFor(lang){ try{ return speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.replace("_","-").toLowerCase().startsWith(lang)); }catch(e){ return []; } }
/* returns {voice, pitch, rate, matched} for the model role */
function modelVoice(lang){
  const vs=voicesFor(lang), g=SET.gender, age=+SET.age||0, want=(g==="m"||g==="f")?g:null;
  const chosen=(store.set.voice||{})[lang];
  let v=chosen?vs.find(x=>x.voiceURI===chosen):null, matched=!!v&&(!want||voiceGender(v)===want);
  if(!v){ const loc=LOCALE[lang].toLowerCase(), rank=x=>(want&&voiceGender(x)===want?4:0)+(x.lang.replace("_","-").toLowerCase()===loc?2:0)+(x.localService?1:0);
    v=vs.slice().sort((a,b)=>rank(b)-rank(a))[0]||null; matched=!!v&&(!want||voiceGender(v)===want); }
  let pitch=1, rate=1; const vg=v?voiceGender(v):"u";
  if(want&&!matched){ if(want==="m") pitch=vg==="f"?0.62:0.82; else pitch=vg==="m"?1.45:1.18; }
  if(want==="m"&&age>=40) pitch*=0.95; if(age>=60) rate=0.92; if(age&&age<12) pitch*=1.15;
  return {voice:v,pitch,rate,matched,vg};
}
function renderVoicePick(){
  const box=$("#setVoice"); if(!box) return; const lang=SET.tl, vs=voicesFor(lang), cur=(store.set.voice||{})[lang]||"";
  const gl=g=>t(g==="m"?"voice_g_m":g==="f"?"voice_g_f":"voice_g_u");
  box.innerHTML=`<h3>${t("set_voice")} (${langIn(lang)})</h3><div class="row"><select class="grow" data-v><option value="">${t("voice_auto")}</option>${vs.map(v=>`<option value="${esc(v.voiceURI)}" ${v.voiceURI===cur?"selected":""}>${esc(v.name)} · ${gl(voiceGender(v))}${v.localService?"":" ☁"}</option>`).join("")}</select><button class="b sm alt" data-t>${t("voice_test")}</button></div><p class="muted" data-i></p>`;
  const info=()=>{ const m=modelVoice(lang); box.querySelector("[data-i]").textContent=(m.voice?t("voice_info",{v:m.voice.name+" · "+gl(m.vg)}):"")+((SET.gender==="m"||SET.gender==="f")&&!m.matched?" – "+t("voice_adjust",{g:t(SET.gender==="m"?"voice_g_m":"voice_g_f"),l:langIn(lang)}):""); };
  box.querySelector("[data-v]").onchange=e=>{ store.set.voice=store.set.voice||{}; store.set.voice[lang]=e.target.value||undefined; save(); info(); };
  box.querySelector("[data-t]").onclick=()=>speak(T[lang].voice_sample,lang,null,null,"model");
  info();
}
try{ speechSynthesis.addEventListener("voiceschanged",()=>{ if(!$("#settings").classList.contains("hidden")) renderVoicePick(); }); }catch(e){}
