/* ================= v6.2: Apple HIG shell – 5-tab bar with segmented sub-navigation, large titles,
   condensing navigation bar, accessibility labels, Dynamic Type-friendly layout ================= */
const TAB_GROUPS=[{id:"today",views:["today"]},{id:"talk",views:["talk","speech"]},{id:"voice",views:["voice","breath","choir"]},{id:"video",views:["video"]},{id:"progress",views:["progress"]}];
// SF Symbols-style icons: outline (o) and filled (f) for the selected state
const TAB_ICONS={
 today:{o:'<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',f:'<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/>'},
 talk:{o:'<path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M19 9h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-4-3h-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',f:'<path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="currentColor"/><path d="M19 9h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v3l-4-3h-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>'},
 voice:{o:'<path d="M3 12h1.5M6.5 8v8M10 4v16M13.5 7v10M17 9.5v5M20.5 11.2v1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',f:'<path d="M3 12h1.5M6.5 8v8M10 4v16M13.5 7v10M17 9.5v5M20.5 11.2v1.6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/>'},
 video:{o:'<rect x="2.5" y="6.5" width="13" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 10.5 5.5-3v9l-5.5-3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',f:'<rect x="2.5" y="6.5" width="13" height="11" rx="2.5" fill="currentColor"/><path d="m15.5 10.5 5.5-3v9l-5.5-3z" fill="currentColor"/>'},
 progress:{o:'<path d="M5 20V12M10 20V6M15 20v-9M20 20V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>',f:'<path d="M5 20V12M10 20V6M15 20v-9M20 20V9" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>'}};
const groupOf=v=>TAB_GROUPS.find(g=>g.views.includes(v))||TAB_GROUPS[0];
function hapt(ms){ try{ navigator.vibrate&&navigator.vibrate(ms||8); }catch(e){} }
function lastSub(gid){ const u=store.ui||(store.ui={}); return u["last_"+gid]; }
buildNav=function(){ const nav=$("#nav"); nav.innerHTML=""; nav.setAttribute("role","tablist"); nav.setAttribute("aria-label",t("hig_tabs")); nav.style.setProperty("--tabs",TAB_GROUPS.length);
  TAB_GROUPS.forEach(g=>{ const ic=TAB_ICONS[g.id], lab=t("tab_"+g.id); const b=el("button",{"data-g":g.id,role:"tab","aria-label":lab},`<svg viewBox="0 0 24 24" aria-hidden="true"><g class="o">${ic.o}</g><g class="f">${ic.f}</g></svg><span>${esc(lab)}</span>`);
    b.onclick=()=>{ const tgt=(groupOf(curView).id===g.id)?g.views[0]:(lastSub(g.id)&&g.views.includes(lastSub(g.id))?lastSub(g.id):g.views[0]); if(tgt!==curView) hapt(); show(tgt); };
    nav.append(b); }); markNav(); };
markNav=function(){ const g=groupOf(curView);
  document.querySelectorAll("#nav button").forEach(b=>{ const on=b.dataset.g===g.id; b.setAttribute("aria-selected",on?"true":"false"); b.classList.toggle("on",on); });
  // large title + segmented control for the sub-areas of a tab
  let vh=$("#viewHead"); if(!vh){ vh=el("div",{id:"viewHead"}); const m=document.querySelector("main"); m.insertBefore(vh,m.firstChild); }
  vh.innerHTML=`<h2 class="lt" id="largeTitle">${esc(t("tab_"+g.id))}</h2>${g.views.length>1?`<div class="seg" role="tablist" aria-label="${esc(t("tab_"+g.id))}">${g.views.map(v=>`<button role="tab" data-sv="${v}" aria-selected="${v===curView}">${esc(t("seg_"+v))}</button>`).join("")}</div>`:""}`;
  vh.querySelectorAll("[data-sv]").forEach(b=>b.onclick=()=>{ if(b.dataset.sv!==curView){ hapt(5); show(b.dataset.sv); } });
  const h1=document.querySelector("header h1"); if(h1){ h1.firstChild&&h1.firstChild.nodeType===3?h1.firstChild.nodeValue=t("tab_"+g.id)+" ":h1.prepend(t("tab_"+g.id)+" "); }
  try{ document.title=t("tab_"+g.id)+" · VoiceCoach"; }catch(e){}
  (store.ui||(store.ui={}))["last_"+g.id]=curView; };
// condensing navigation bar: compact title appears once the large title scrolls away
(function(){ const hd=document.querySelector("header"); const on=()=>{ const lt=$("#largeTitle"); const y=lt?lt.getBoundingClientRect().bottom:0; hd&&hd.classList.toggle("scrolled",y<(hd.offsetHeight||50)); };
  window.addEventListener("scroll",on,{passive:true}); setTimeout(on,50); })();
// header: settings button as an icon button with a label; version moves into the settings sheet
(function(){ const sb=$("#setBtn"); if(sb){ sb.setAttribute("aria-label",t("hig_settings")); }
  const sh=$("#settings .card"); if(sh&&!sh.querySelector("[data-verfoot]")){ const v=(document.querySelector("header .ver")||{}).textContent||""; sh.insertAdjacentHTML("beforeend",`<p class="muted" data-verfoot style="text-align:center;font-size:var(--fs-foot);margin-top:14px">VoiceCoach ${esc(v)}</p>`); }
  // tap outside a sheet closes it (like iOS sheets)
  document.querySelectorAll(".sheet").forEach(s=>{ if(s.dataset.bk) return; s.dataset.bk="1"; s.addEventListener("click",e=>{ if(e.target===s){ const c=s.querySelector("#setClose,[data-close],[data-later]"); if(c) c.click(); else s.classList.add("hidden"); } }); });
  const ts=$("#toast"); if(ts){ ts.setAttribute("role","status"); ts.setAttribute("aria-live","polite"); }
  const m=document.querySelector("main"); if(m) m.id=m.id||"main";
})();
// accessibility: labels for icon-only buttons, document language
const A11Y_SYM={"🔊":"hig_play","⌨":"fl_type","✕":"close","×":"close","■":"fl_stop","▶":"hig_play","⏸":"hig_pause","🔁":"hig_repeat","🐢":"hig_slow"};
function a11yPass(root){ (root||document).querySelectorAll("button:not([aria-label])").forEach(b=>{ const tx=(b.textContent||"").trim(); if(!tx) { if(b.title) b.setAttribute("aria-label",b.title); return; }
  if(tx.length<=3&&!/[a-z0-9äöüéèà]/i.test(tx)){ const k=A11Y_SYM[tx]||Object.keys(A11Y_SYM).find(s=>tx.includes(s)); b.setAttribute("aria-label",b.title||(k?t(A11Y_SYM[k]||A11Y_SYM[tx]):tx)); } }); }
try{ new MutationObserver(ms=>{ for(const m of ms) m.addedNodes.forEach(n=>{ if(n.nodeType===1) a11yPass(n.parentNode||n); }); }).observe(document.body,{childList:true,subtree:true}); }catch(e){}
const _applyI18nH=applyI18n;
applyI18n=function(){ _applyI18nH.apply(this,arguments); try{ document.documentElement.lang=SET.ui||"en"; buildNav(); a11yPass(); const sb=$("#setBtn"); if(sb) sb.setAttribute("aria-label",t("hig_settings")); }catch(e){} };
Object.assign(T.en,{tab_today:"Today",tab_talk:"Speak",tab_voice:"Voice",tab_video:"Camera",tab_progress:"Progress",seg_today:"Today",seg_talk:"Conversation",seg_speech:"Pronunciation",seg_voice:"Voice",seg_breath:"Breath & posture",seg_choir:"Choir",seg_video:"Camera",seg_progress:"Progress",hig_tabs:"Main sections",hig_settings:"Settings",hig_play:"Play",hig_pause:"Pause",hig_repeat:"Repeat",hig_slow:"Slower"});
Object.assign(T.de,{tab_today:"Heute",tab_talk:"Sprechen",tab_voice:"Stimme",tab_video:"Kamera",tab_progress:"Fortschritt",seg_today:"Heute",seg_talk:"Gespräch",seg_speech:"Aussprache",seg_voice:"Stimme",seg_breath:"Atem & Haltung",seg_choir:"Chor",seg_video:"Kamera",seg_progress:"Fortschritt",hig_tabs:"Hauptbereiche",hig_settings:"Einstellungen",hig_play:"Abspielen",hig_pause:"Pause",hig_repeat:"Wiederholen",hig_slow:"Langsamer"});
Object.assign(T.fr,{tab_today:"Aujourd'hui",tab_talk:"Parler",tab_voice:"Voix",tab_video:"Caméra",tab_progress:"Progrès",seg_today:"Aujourd'hui",seg_talk:"Conversation",seg_speech:"Prononciation",seg_voice:"Voix",seg_breath:"Souffle et posture",seg_choir:"Chorale",seg_video:"Caméra",seg_progress:"Progrès",hig_tabs:"Sections principales",hig_settings:"Réglages",hig_play:"Lire",hig_pause:"Pause",hig_repeat:"Répéter",hig_slow:"Plus lent"});
try{ document.documentElement.lang=SET.ui||"en"; buildNav(); a11yPass(); }catch(e){}
