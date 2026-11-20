/* ================= v5.6: consonant articulation module =================
   For speakers whose consonants are swallowed or too weak. 6 stages, entry test, sessions of 10 varied items
   (words, minimal pairs, sentences), recognition + acoustic consonant check, tips/warm-ups per stage, progress monitoring. */
const CONS_ST=["plos","final","fric","clus","nasliq","link"];
const CONS={
 en:{plos:{w:"paper|baby|table|ticket|daddy|garden|cookie|pocket|bottle|doctor|people|tiger|button|kitchen|apple|bucket",p:"pat/bat|tie/die|cap/gap|pear/bear|coat/goat|tin/din",s:["Peter put the paper back in the black box.","Ted took two big tickets to the cricket game.","Keep the cups and plates on the top table.","A big black bug bit a big black bear."]},
  final:{w:"hand|bread|street|desk|milk|sport|world|friend|fast|last|asked|helped|walked|text|month|test",p:"wide/white|bag/back|card/cart|bed/bet|road/wrote|send/sent",s:["I asked the friend next to me to help.","She walked fast down the street at night.","We tested the text and sent it last month.","Hold the bread and milk in your left hand."]},
  fric:{w:"fish|five|very|seven|sun|zoo|shoe|measure|think|this|house|vision|office|cheese|wish|thought",p:"fan/van|sip/zip|sue/shoe|thin/sin|fine/vine|sea/she",s:["She sells seashells by the seashore.","Five very fine vans arrived on Friday.","Think of three things that make this worth it.","Zoe chose the cheese for the show."]},
  clus:{w:"street|spring|splash|strong|scream|texts|world|crisps|asked|instinct|construct|glimpse|prompts|lengths|sixths|strict",p:"trip/tip|play/pay|spring/sing|bread/bed|clap/cap|stray/stay",s:["The strong stream splashed against the stones.","She asked for six crisp texts.","Spring brings strong breezes.","Strict structures stress students."]},
  nasliq:{w:"morning|number|evening|singing|ring|little|really|lorry|yellow|rolling|thinking|nearly|common|planning|language|level",p:"sin/sing|light/right|fly/fry|mice/nice|win/wing|collect/correct",s:["Red lorry, yellow lorry.","Morning singing makes nine men smile.","Really, Laura rarely rolls lemons.","Long lines of little lights."]},
  link:{w:"next day|hot tea|big game|good dog|last time|first step|bad dream|black cat|want to|asked them",p:"",s:["It's the first time I've tested this.","Let's start the next task at two.","He asked Tom to send the report today.","Could you take the big black bag back?"]}},
 de:{plos:{w:"Papier|Puppe|Tisch|Teppich|Kaktus|Tante|Kuchen|Paket|Butter|Decke|Garten|Bitte|Tomate|Kette|Geduld|Gabel",p:"Paar/Bar|Tank/Dank|Kasse/Gasse|packen/backen|Tier/dir|Kern/gern",s:["Peter packt sieben Pakete in die Tasche.","Der Doktor trinkt Tee mit Tante Gerda.","Kleine Kinder können keine kleinen Kirschkerne knacken.","Bitte bring die Butter und das Brot."]},
  final:{w:"Hund|Bild|Markt|Herbst|Arzt|Nacht|Brot|Kind|gesagt|gemacht|nicht|jetzt|Abend|Freund|Rad|Projekt",p:"Kind/Kinn|Markt/Mark|Nacht/nach|Wort/wo|Feld/fehl",s:["Jetzt ist der Markt im Herbst bis acht Uhr offen.","Mein Freund hat gestern Abend nicht angerufen.","Das Kind malt ein Bild vom Hund.","Wir haben das Projekt pünktlich abgeschlossen."]},
  fric:{w:"Fisch|Vogel|Wasser|Sonne|Schule|Stuhl|ich|Buch|machen|Licht|Haus|Hose|Wäsche|Flasche|sechs|Sessel",p:"Kirche/Kirsche|Masse/Masche|Lauch/Laus|Fass/was",s:["Fischers Fritz fischt frische Fische.","Sechs sächsische Schwestern sitzen im Sessel.","Ich mache mich auf den Weg nach Hause.","Zwischen zwei Zwetschgenzweigen zwitschern zwei Schwalben."]},
  clus:{w:"Strumpf|Pflanze|Sprache|Herbst|Obst|Pfeffer|kämpfst|Strand|schreibst|Zwetschge|Angst|Dienstag|trinkst|Kunst|selbst|Schwester",p:"Kranz/Kran|Strand/Stand|Pflug/Flug|Blatt/Bad",s:["Im Herbst pflückst du Obst im Garten.","Der Pflasterer pflastert pflichtbewusst den Platz.","Am Dienstag schreibst du selbst einen Brief.","Hast du Angst vor dem Sprung ins Wasser?"]},
  nasliq:{w:"Mama|Name|Nummer|singen|lang|Junge|Lampe|Leben|Rolle|rot|Rhabarber|Ring|Morgen|Länge|klingeln|lernen",p:"Rand/Land|rot/Lot|Rippe/Lippe|sinnen/singen",s:["Lange Leute lernen leise lachen.","Rotkraut bleibt Rotkraut und Brautkleid bleibt Brautkleid.","Am Morgen singen wir ein langes Lied.","Meine Mama mag Melonen."]},
  link:{w:"und dann|ist es|hat das|nicht mehr|jetzt schon|mit dir|bis bald|sind sie|kannst du|geht das",p:"",s:["Hast du das Paket schon abgeschickt?","Ich weiß nicht, ob es heute noch klappt.","Kannst du mir bitte das Buch geben?","Wir sind bis acht Uhr im Büro."]}},
 fr:{plos:{w:"papa|bébé|table|tête|café|gâteau|poupée|bateau|tapis|doute|cadeau|quatre|képi|pomme|botte|tarte",p:"pain/bain|thé/dé|car/gare|poisson/boisson|temps/dent|cou/goût",s:["Paul part de Paris pour Bordeaux.","Le petit bateau porte quatre gâteaux.","Ton thé t'a-t-il ôté ta toux ?","Didon dîna, dit-on, du dos d'un dodu dindon."]},
  final:{w:"sac|chef|parc|net|bol|mer|fils|ours|sens|avec|neuf|bec|cinq|sept|mars|lac",p:"sept/c'est|sec/ses|net/nez|bol/beau|cinq/saint",s:["Le chef a mis le sac dans le bus.","Avec sept amis, nous allons au parc en mars.","Mon fils boit un bol de lait.","Neuf ours dorment près du lac."]},
  fric:{w:"fille|vin|sel|zéro|chat|jour|feu|vase|chose|girafe|sucre|jupe|chemise|fleur|maison|rose",p:"chou/joue|sel/zèle|fou/vous|cache/cage|basse/base|sous/chou",s:["Les chaussettes de l'archiduchesse sont-elles sèches ?","Un chasseur sachant chasser sait chasser sans son chien.","Six cent six saucissons.","Zoé joue avec le chat gris."]},
  clus:{w:"crabe|prix|trois|plume|fleur|glace|structure|instinct|spectacle|explorer|abstrait|strict|exprès|splendide|obstacle|construire",p:"prix/pis|trois/toi|plein/pain|blanc/banc",s:["Trois gros rats gris grignotent.","Un spectacle splendide et strict.","Il faut construire une structure abstraite.","Les fleurs et les plumes flottent."]},
  nasliq:{w:"maman|nom|lune|ligne|rouge|rire|lit|mille|soleil|merci|année|campagne|parler|lourd|ronron|montagne",p:"rat/la|roue/loup|lit/riz|mon/non",s:["Le rat rit, le rat rit, le rat rit.","Ma maman mange des melons.","La lune luit sur la ligne.","Ruelle et rouleau roulent."]},
  link:{w:"les amis|un enfant|avec elle|il est|chez eux|vous avez|neuf heures|sept ans|grand ami|petit ours",p:"",s:["Les enfants ont eu des amis.","Il est arrivé avec elle à neuf heures.","Vous avez un grand appartement.","Sept étudiants attendent dehors."]}}};
const CONS_TIPS={
 en:{plos:["Close your lips or tongue completely, build up a little air pressure and release it with a small “pop”.","Hold a strip of paper in front of your mouth: on p, t and k it should move.","b, d, g: same closure, but switch on your voice – feel the buzz in your throat."],
  final:["Finish every word – the last consonant belongs to the word.","Speak a little slower and imagine a small click at the end of each word.","If an ending disappears, exaggerate it for a few rounds, then make it natural."],
  fric:["Keep a narrow gap and a steady airflow – the sound should hiss or buzz for half a second.","s: tongue tip behind the upper teeth; sh: lips rounded, tongue further back; th: tongue tip lightly between the teeth.","Practise long sounds first – “ssss – ffff – shhh” – then put them into the word."],
  clus:["Say every consonant of the cluster – slowly first, then faster.","Build it up step by step: s – st – str – street.","Don't add a vowel between the consonants (not “se-treet”)."],
  nasliq:["m, n, ng: feel the vibration in your nose; ng is made with the back of the tongue.","l: tongue tip on the ridge behind your upper teeth; r: clear, don't swallow it.","Practise the pairs (light / right) until both sound clearly different."],
  link:["Connect the words without dropping the consonant at the end of the first word.","Speak in short chunks and keep the consonants crisp at the word boundaries.","Clarity before speed: exaggerate first, then speed up."]},
 de:{plos:["Lippen oder Zunge ganz schließen, etwas Luftdruck aufbauen und mit einem kleinen „Plopp“ lösen.","Halte einen Papierstreifen vor den Mund: Bei p, t und k soll er sich bewegen.","b, d, g: derselbe Verschluss, aber mit Stimme – spür das Summen im Hals."],
  final:["Sprich jedes Wort zu Ende – der letzte Konsonant gehört zum Wort.","Sprich etwas langsamer und stell dir am Wortende ein kleines Klicken vor.","Verschwindet ein Wortende, übertreib es ein paar Runden lang und mach es dann natürlich."],
  fric:["Enger Spalt, gleichmäßiger Luftstrom – der Laut soll eine halbe Sekunde zischen oder summen.","s: Zungenspitze hinter den oberen Zähnen; sch: Lippen gerundet, Zunge weiter hinten; ch: Zunge vorne am Gaumen.","Erst lange Laute üben – „ssss – ffff – schhh“ – dann ins Wort einbauen."],
  clus:["Sprich jeden Konsonanten der Gruppe – erst langsam, dann schneller.","Bau sie Schritt für Schritt auf: Sch – Schp – Schpr – Sprache.","Schieb keinen Vokal dazwischen (nicht „Pe-flanze“)."],
  nasliq:["m, n, ng: Spür das Vibrieren in der Nase; ng entsteht am hinteren Zungenrücken.","l: Zungenspitze hinter den oberen Zähnen; r: deutlich, nicht verschlucken.","Übe die Paare (Rand / Land), bis beide klar verschieden klingen."],
  link:["Verbinde die Wörter, ohne den Endkonsonanten des ersten Wortes fallen zu lassen.","Sprich in kurzen Abschnitten und halte die Konsonanten an den Wortgrenzen klar.","Deutlichkeit vor Tempo: erst übertreiben, dann schneller werden."]},
 fr:{plos:["Fermez complètement les lèvres ou la langue, créez une petite pression d'air et relâchez-la avec un petit « pop ».","Tenez une bande de papier devant la bouche : sur p, t et k, elle doit bouger.","b, d, g : même fermeture, mais avec la voix – sentez la vibration dans la gorge."],
  final:["En français, beaucoup de finales sont muettes – mais les consonnes finales prononcées (souvent c, f, l, r) doivent s'entendre clairement.","Parlez un peu plus lentement et imaginez un petit clic à la fin du mot.","Si une finale disparaît, exagérez-la pendant quelques tours, puis rendez-la naturelle."],
  fric:["Gardez un passage étroit et un souffle régulier – le son doit siffler ou vibrer une demi-seconde.","s : pointe de la langue derrière les dents du haut ; ch : lèvres arrondies, langue plus en arrière.","Travaillez d'abord les sons longs – « ssss – ffff – chhh » – puis dans le mot."],
  clus:["Prononcez chaque consonne du groupe – d'abord lentement, puis plus vite.","Construisez-le pas à pas : s – st – str – structure.","N'ajoutez pas de voyelle entre les consonnes (pas « pe-lume »)."],
  nasliq:["m, n, gn : sentez la vibration dans le nez.","l : pointe de la langue derrière les dents du haut ; r : net, ne l'avalez pas.","Travaillez les paires (roue / loup) jusqu'à ce qu'elles soient bien différentes."],
  link:["Faites les liaisons et enchaînements sans perdre la consonne de liaison.","Parlez par petits groupes de mots et gardez les consonnes nettes aux frontières des mots.","La clarté avant la vitesse : exagérez d'abord, puis accélérez."]}};
const CONS_WARM={en:{plos:"pa – ta – ka, ten times, crisp and fast",final:"at – et – it – ot – ut (clear t at the end)",fric:"ssss – ffff – shhh – vvvv, five seconds each",clus:"s – st – str – street · s – sp – spr – spring",nasliq:"mmm – nnn – ng – lll – rrr, then la-la-la / ra-ra-ra",link:"Read the sentence slowly with a tiny gap after every final consonant, then at normal speed"},
 de:{plos:"pa – ta – ka, zehnmal, knackig und schnell",final:"at – et – it – ot – ut (deutliches t am Ende)",fric:"ssss – ffff – schhh – wwww, je fünf Sekunden",clus:"sch – scht – schtr – Strand · pf – pfl – Pflanze",nasliq:"mmm – nnn – ng – lll – rrr, dann la-la-la / ra-ra-ra",link:"Lies den Satz langsam mit einer winzigen Pause nach jedem Endkonsonanten, dann in normalem Tempo"},
 fr:{plos:"pa – ta – ka, dix fois, net et rapide",final:"ac – ec – ic – oc (c bien audible à la fin)",fric:"ssss – ffff – chhh – vvvv, cinq secondes chacun",clus:"s – st – str – structure · p – pl – plume",nasliq:"mmm – nnn – gn – lll – rrr, puis la-la-la / ra-ra-ra",link:"Lisez la phrase lentement en marquant chaque liaison, puis à vitesse normale"}};
Object.assign(T.en,{cs_title:"🗣️ Consonant training", cs_desc:"For clear, easy-to-follow speech: consonants that are swallowed or too weak make listening hard. Train them stage by stage – the app checks whether every word was understood and whether your consonants carry enough energy.",
 st_plos:"Plosives p · b · t · d · k · g", st_final:"Word endings", st_fric:"Friction sounds f · v · s · z · sh", st_clus:"Consonant clusters", st_nasliq:"m · n · ng · l · r", st_link:"Consonants between words",
 cs_test:"🔍 Entry test (2 min)", cs_test_h:"12 short items from all stages – shows where your consonants get lost and which stage to start with.", cs_start:"▶ Train this stage (10 items)", cs_rec:"Recommended: {s}", cs_mastered:"mastered", cs_prog:"Progress per stage (last 10 items)",
 cs_item:"Item {i} of {n}", cs_listen:"🔊 Listen (slowly)", cs_say:"Say it clearly", cs_ok:"✓ Clear – every word understood.", cs_miss:"Not clear yet: {w}", cs_heard:"Understood: “{t}”", cs_weak:"Your consonants were quite weak – give them more energy.", cs_tail:"The end of the word was hardly audible – finish the last consonant.", cs_energy:"Consonant energy", cs_again:"↻ Again", cs_next:"Next ▶", cs_help:"Two tries without success – here's help:", cs_warm:"Warm-up", cs_tips:"Tips for this stage", cs_slow:"🐢 Slow model", cs_sum:"Session finished: {a} of {n} clear ({p} %).", cs_sum_st:"Result per stage:", cs_back:"↩ Overview", cs_hist:"Last sessions", cs_plan:"Add consonant training to my daily plan", cs_pair:"Say both words – make the difference audible.", cs_noSR:"No speech recognition here – rate yourself after listening to your recording:", cs_self_ok:"✓ Clear", cs_self_no:"✗ Not yet", pk_cons:"Consonant training"});
Object.assign(T.de,{cs_title:"🗣️ Konsonanten-Training", cs_desc:"Für klares, gut verständliches Sprechen: Verschluckte oder zu schwache Konsonanten machen das Zuhören schwer. Trainiere sie Stufe für Stufe – die App prüft, ob jedes Wort verstanden wurde und ob deine Konsonanten genug Energie haben.",
 st_plos:"Verschlusslaute p · b · t · d · k · g", st_final:"Wortenden", st_fric:"Reibelaute f · w · s · sch · ch", st_clus:"Konsonantenhäufungen", st_nasliq:"m · n · ng · l · r", st_link:"Konsonanten zwischen Wörtern",
 cs_test:"🔍 Einstufungstest (2 Min.)", cs_test_h:"12 kurze Aufgaben aus allen Stufen – zeigt, wo deine Konsonanten verloren gehen und mit welcher Stufe du beginnst.", cs_start:"▶ Diese Stufe trainieren (10 Aufgaben)", cs_rec:"Empfohlen: {s}", cs_mastered:"gemeistert", cs_prog:"Fortschritt pro Stufe (letzte 10 Aufgaben)",
 cs_item:"Aufgabe {i} von {n}", cs_listen:"🔊 Anhören (langsam)", cs_say:"Sprich deutlich", cs_ok:"✓ Deutlich – jedes Wort verstanden.", cs_miss:"Noch nicht deutlich: {w}", cs_heard:"Verstanden: „{t}“", cs_weak:"Deine Konsonanten waren recht schwach – gib ihnen mehr Energie.", cs_tail:"Das Wortende war kaum hörbar – sprich den letzten Konsonanten zu Ende.", cs_energy:"Konsonanten-Energie", cs_again:"↻ Nochmal", cs_next:"Weiter ▶", cs_help:"Zwei Versuche ohne Erfolg – hier ist Hilfe:", cs_warm:"Aufwärmen", cs_tips:"Tipps für diese Stufe", cs_slow:"🐢 Langsames Vorbild", cs_sum:"Übung beendet: {a} von {n} deutlich ({p} %).", cs_sum_st:"Ergebnis pro Stufe:", cs_back:"↩ Übersicht", cs_hist:"Letzte Übungen", cs_plan:"Konsonanten-Training in meinen Tagesplan aufnehmen", cs_pair:"Sprich beide Wörter – mach den Unterschied hörbar.", cs_noSR:"Keine Spracherkennung verfügbar – bewerte dich selbst, nachdem du deine Aufnahme angehört hast:", cs_self_ok:"✓ Deutlich", cs_self_no:"✗ Noch nicht", pk_cons:"Konsonanten-Training"});
Object.assign(T.fr,{cs_title:"🗣️ Entraînement des consonnes", cs_desc:"Pour une parole claire et facile à suivre : des consonnes avalées ou trop faibles rendent l'écoute difficile. Entraînez-les niveau par niveau – l'appli vérifie que chaque mot est compris et que vos consonnes ont assez d'énergie.",
 st_plos:"Occlusives p · b · t · d · k · g", st_final:"Finales de mots", st_fric:"Fricatives f · v · s · z · ch · j", st_clus:"Groupes de consonnes", st_nasliq:"m · n · gn · l · r", st_link:"Liaisons et enchaînements",
 cs_test:"🔍 Test de positionnement (2 min)", cs_test_h:"12 courts exercices de tous les niveaux – montre où vos consonnes se perdent et par quel niveau commencer.", cs_start:"▶ Travailler ce niveau (10 exercices)", cs_rec:"Recommandé : {s}", cs_mastered:"maîtrisé", cs_prog:"Progrès par niveau (10 derniers exercices)",
 cs_item:"Exercice {i} sur {n}", cs_listen:"🔊 Écouter (lentement)", cs_say:"Dites-le clairement", cs_ok:"✓ Clair – chaque mot a été compris.", cs_miss:"Pas encore clair : {w}", cs_heard:"Compris : « {t} »", cs_weak:"Vos consonnes étaient assez faibles – donnez-leur plus d'énergie.", cs_tail:"La fin du mot était à peine audible – prononcez la dernière consonne jusqu'au bout.", cs_energy:"Énergie des consonnes", cs_again:"↻ Encore", cs_next:"Suivant ▶", cs_help:"Deux essais sans succès – voici de l'aide :", cs_warm:"Échauffement", cs_tips:"Conseils pour ce niveau", cs_slow:"🐢 Modèle lent", cs_sum:"Séance terminée : {a} sur {n} clairs ({p} %).", cs_sum_st:"Résultat par niveau :", cs_back:"↩ Vue d'ensemble", cs_hist:"Dernières séances", cs_plan:"Ajouter l'entraînement des consonnes à mon plan du jour", cs_pair:"Dites les deux mots – rendez la différence audible.", cs_noSR:"Pas de reconnaissance vocale ici – évaluez-vous après avoir écouté votre enregistrement :", cs_self_ok:"✓ Clair", cs_self_no:"✗ Pas encore", pk_cons:"Entraînement des consonnes"});

/* ---------- acoustic consonant measure: energy of noise-like (high-frequency) frames relative to vowels ---------- */
function consMetrics(pcm){
  const N=320, H=160, F=Math.floor((pcm.length-N)/H); if(F<5) return null; const e=new Float32Array(F), r=new Float32Array(F); let mx=0;
  for(let k=0;k<F;k++){ const o=k*H; let a=0,d=0; for(let i=1;i<N;i++){ const x=pcm[o+i], y=x-pcm[o+i-1]; a+=x*x; d+=y*y; } e[k]=a; r[k]=d/(a+1e-12); if(a>mx) mx=a; }
  const act=[]; for(let k=0;k<F;k++) if(e[k]>mx*0.0003) act.push(k); if(act.length<5) return null;
  const a0=act[0], a1=act[act.length-1], vow=[], con=[];
  for(let k=a0;k<=a1;k++){ if(e[k]<mx*0.0003) continue; if(r[k]<0.25&&e[k]>mx*0.05) vow.push(e[k]); else if(r[k]>0.7) con.push(e[k]); }
  if(!vow.length) return null; const vm=pctl(vow,0.5), cm=con.length?con.reduce((a,b)=>a+b,0)/con.length:vm*1e-4;
  const rel=10*Math.log10(cm/vm); let bursts=0, inC=false; for(let k=a0;k<=a1;k++){ const c=r[k]>0.7&&e[k]>mx*0.0003; if(c&&!inC) bursts++; inC=c; }
  // tail: noise-like energy in the last 200 ms of the active region (final consonant)
  let tail=false; for(let k=Math.max(a0,a1-12);k<=Math.min(F-1,a1+3);k++) if(r[k]>0.7&&e[k]>vm*0.0015) tail=true;
  return {rel:Math.round(rel),bursts,tail,crisp:Math.max(0,Math.min(1,(rel+38)/22))};
}
/* ---------- state & progress ---------- */
function csStore(){ store.cons=store.cons||{}; const l=SET.tl; store.cons[l]=store.cons[l]||{st:{},hist:[],test:null}; return store.cons[l]; }
function csStage(id){ const c=csStore(); return c.st[id]=c.st[id]||{n:0,ok:0,last:[]}; }
function csRate(id){ const s=csStage(id); return s.last.length?s.last.filter(Boolean).length/s.last.length:null; }
function csRecommended(){ // weakest stage with results first, otherwise the first stage not yet mastered
  const weak=CONS_ST.map(id=>({id,r:csRate(id)})).filter(x=>x.r!=null&&x.r<0.8).sort((a,b)=>a.r-b.r);
  if(weak.length) return weak[0].id; for(const id of CONS_ST){ if(csRate(id)==null||csStage(id).last.length<10) return id; } return CONS_ST[CONS_ST.length-1]; }
function csItems(st,n){ const D=CONS[SET.tl][st], words=D.w.split("|").sort(()=>Math.random()-0.5), pairs=D.p?D.p.split("|").sort(()=>Math.random()-0.5):[], sents=D.s.slice().sort(()=>Math.random()-0.5);
  const items=[]; const nw=n-Math.min(2,pairs.length)-2; words.slice(0,nw).forEach(w=>items.push({st,k:"w",x:w})); pairs.slice(0,2).forEach(p=>items.push({st,k:"p",x:p.replace("/"," – ")})); sents.slice(0,2).forEach(s=>items.push({st,k:"s",x:s}));
  return items.slice(0,n).sort((a,b)=>"wps".indexOf(a.k)-"wps".indexOf(b.k)); }
function csTestItems(){ const out=[]; CONS_ST.forEach(st=>{ const D=CONS[SET.tl][st], w=D.w.split("|"); out.push({st,k:"w",x:rnd(w)}); out.push({st,k:"s",x:rnd(D.s)}); }); return out; }
const CS_CONS_RE=/[bcdfghjklmnpqrstvwxzßç]/i;
function csMarkup(x){ return esc(x).replace(/([bcdfghjklmnpqrstvwxzßç]+)/gi,'<span style="color:var(--accent2);font-weight:700">$1</span>'); }
/* ---------- UI ---------- */
let CS={view:"home"};
function renderCons(){
  const box=$("#consCard"); if(!box||CS.view!=="home") return; const rec=csRecommended(), c=csStore();
  CS.stage=CS.stage&&CONS_ST.includes(CS.stage)?CS.stage:rec;
  box.innerHTML=`<h2 style="margin:0 0 4px">${t("cs_title")}</h2><p class="muted">${t("cs_desc")}</p>
    <div class="row"><button class="b alt grow" data-test>${t("cs_test")}</button></div><p class="muted" style="font-size:.78rem">${t("cs_test_h")}</p>
    <p style="margin:8px 0 4px"><b>${t("cs_prog")}</b> <span class="muted" style="font-size:.8rem">· ${t("cs_rec",{s:t("st_"+rec)})}</span></p><div data-stg></div>
    <div class="card flat" data-tipbox style="margin-top:8px"></div>
    <button class="b warm" style="width:100%;margin-top:6px" data-go>${t("cs_start")}</button>
    <label class="row" style="font-size:.85rem;margin-top:8px"><input type="checkbox" data-plan ${SET.consFocus?"checked":""}> ${t("cs_plan")}</label>
    ${c.hist.length?`<p style="margin:8px 0 2px"><b>${t("cs_hist")}</b></p><div style="display:flex;gap:3px;align-items:flex-end;height:40px">${c.hist.slice(-20).map(h=>`<i title="${h.d}: ${h.p} %" style="flex:1;max-width:14px;height:${Math.max(4,h.p*0.4)}px;background:${h.p>=80?"var(--ok)":h.p>=50?"#d9a400":"var(--accent2)"};border-radius:3px 3px 0 0"></i>`).join("")}</div>`:""}`;
  const stg=box.querySelector("[data-stg]");
  CONS_ST.forEach(id=>{ const r=csRate(id), s=csStage(id), m=r!=null&&r>=0.8&&s.last.length>=10;
    const row=el("div",{class:"row",style:"cursor:pointer;padding:4px 6px;border-radius:10px;margin:2px 0;"+(CS.stage===id?"background:var(--line)":"")});
    row.innerHTML=`<span class="grow" style="font-size:.88rem">${CS.stage===id?"▶ ":""}${t("st_"+id)}${m?` <span class="tag">✓ ${t("cs_mastered")}</span>`:""}</span><span style="width:90px;height:8px;background:var(--line);border-radius:4px;overflow:hidden;display:inline-block"><i style="display:block;height:100%;width:${r==null?0:Math.round(r*100)}%;background:${r==null?"var(--muted)":r>=0.8?"var(--ok)":r>=0.5?"#d9a400":"var(--accent2)"}"></i></span><span class="muted" style="font-size:.75rem;width:36px;text-align:right">${r==null?"–":Math.round(r*100)+" %"}</span>`;
    row.onclick=()=>{ CS.stage=id; renderCons(); }; stg.append(row); });
  box.querySelector("[data-tipbox]").innerHTML=csTipHtml(CS.stage);
  box.querySelector("[data-go]").onclick=()=>csRun(csItems(CS.stage,10),false);
  box.querySelector("[data-test]").onclick=()=>csRun(csTestItems(),true);
  box.querySelector("[data-plan]").onchange=e=>{ SET.consFocus=e.target.checked; save(); try{ delete store.plan[today()]; save(); if(typeof renderToday==="function") renderToday(); }catch(err){} };
}
function csTipHtml(st){ const l=SET.ui; return `<b>${t("cs_tips")}: ${t("st_"+st)}</b><ul class="list" style="margin:4px 0">${CONS_TIPS[l][st].map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div style="font-size:.85rem"><b>${t("cs_warm")}:</b> <span ${tlAttr(SET.tl)}>${esc(CONS_WARM[SET.tl][st])}</span> <button class="b sm alt" data-wu style="min-height:28px;padding:2px 8px">🔊</button></div>`; }
function csWireWarm(box,st){ const b=box.querySelector("[data-wu]"); if(b) b.onclick=()=>speak(CONS_WARM[SET.tl][st].split(/[(,·]/)[0],SET.tl,null,0.6,"model"); }
function csRun(items,isTest){
  const box=$("#consCard"); CS.view="run"; let i=0, tries=0; const res=[], lang=SET.tl;
  const draw=(fb)=>{ const it=items[i];
    box.innerHTML=`<div class="row"><h3 class="grow" style="margin:0">${isTest?t("cs_test"):t("st_"+it.st)}</h3><button class="b sm alt" data-x>${t("cs_back")}</button></div>
      <div class="row" style="margin:4px 0"><span class="muted grow">${t("cs_item",{i:i+1,n:items.length})}</span><span class="dots">${items.map((_,k)=>`<i class="${k<i?(res[k]?"on":"bad"):""}" style="${k<i&&!res[k]?"background:var(--accent2)":""}"></i>`).join("")}</span></div>
      ${it.k==="p"?`<p class="muted" style="font-size:.82rem;margin:2px 0">${t("cs_pair")}</p>`:""}
      <div ${tlAttr(lang)} style="font-size:${it.k==="s"?"1.35rem":"2.1rem"};text-align:center;padding:12px 4px;line-height:1.35">${csMarkup(it.x)}</div>
      <div class="row"><button class="b alt grow" data-l>${t("cs_listen")}</button></div><div data-r style="margin-top:6px"></div><div data-fb>${fb||""}</div>`;
    box.querySelector("[data-x]").onclick=()=>{ CS.view="home"; renderCons(); };
    box.querySelector("[data-l]").onclick=()=>speak(it.x.replace(" – ",", "),lang,null,tries>=2?0.55:0.75,"model");
    recControls(box.querySelector("[data-r]"),{lang:srLang(),maxSec:15,label:"● "+t("cs_say"),onDone:r=>evaluate(r)});
    csWireWarm(box,it.st);
  };
  const evaluate=(r)=>{ const it=items[i], m=consMetrics(r.pcm), txt=(r.sr&&r.sr.text)||"";
    if(!txt&&(!r.sr||r.sr.err||srBroken)){ // no recognition → self rating after listening
      const take={blob:r.blob,kind:"cons",title:it.x,lang}; const fb=box.querySelector("[data-fb]"); fb.innerHTML=`<p class="muted">${t("cs_noSR")}</p>`; fb.append(replayView(take,{noRegister:true}));
      const row=el("div",{class:"row"}); const ok=el("button",{class:"b grow"},t("cs_self_ok")), no=el("button",{class:"b alt grow"},t("cs_self_no")); ok.onclick=()=>finish(true,m,""); no.onclick=()=>finish(false,m,""); row.append(ok,no); fb.append(row); return; }
    const tn=" "+norm(txt)+" ", orig=it.x.replace(/[–.,!?;:„“"«»]/g," ").split(/\s+/).filter(w=>norm(w)&&(norm(w).length>1||it.k!=="s")), targets=orig.map(norm), miss=orig.filter((o,k)=>{ const w=targets[k]; return !tn.includes(" "+w+" ")&&!(w.length>=6&&tn.includes(w)); });
    const need=it.k==="s"?Math.ceil(targets.length*0.85):targets.length, ok=targets.length-miss.length>=need;
    finish(ok,m,txt,miss);
  };
  const finish=(ok,m,txt,miss=[])=>{ const it=items[i]; if(!ok) tries++; beep(ok?990:520,.12,.1);
    let fb=`<div class="${ok?"okbox":"warnbox"}" style="margin-top:6px"><b>${ok?t("cs_ok"):esc(t("cs_miss",{w:miss.join(", ")||it.x}))}</b>${txt?`<br><span class="muted">${esc(t("cs_heard",{t:txt}))}</span>`:""}`;
    if(m){ fb+=`<div style="margin-top:4px;font-size:.8rem">${t("cs_energy")}: <span style="display:inline-block;width:110px;height:8px;background:var(--line);border-radius:4px;overflow:hidden;vertical-align:middle"><i style="display:block;height:100%;width:${Math.round(m.crisp*100)}%;background:${m.crisp>=0.6?"var(--ok)":m.crisp>=0.45?"#d9a400":"var(--accent2)"}"></i></span></div>`;
      if(m.crisp<0.5) fb+=`<div style="font-size:.85rem">• ${t("cs_weak")}</div>`; if(it.st==="final"&&it.k==="w"&&!m.tail&&lang!=="fr") fb+=`<div style="font-size:.85rem">• ${t("cs_tail")}</div>`; }
    fb+="</div>";
    if(!ok&&tries>=2) fb+=`<div class="card flat" style="margin-top:6px;border-left:4px solid var(--accent)"><b>${t("cs_help")}</b><div style="margin-top:4px">${csTipHtml(it.st)}</div><button class="b sm alt" data-slow style="margin-top:6px">${t("cs_slow")}</button></div>`;
    fb+=`<div class="row" style="margin-top:6px">${ok?"":`<button class="b alt grow" data-ag>${t("cs_again")}</button>`}<button class="b grow" data-nx>${t("cs_next")}</button></div>`;
    draw(fb); const fbx=box.querySelector("[data-fb]");
    const sl=fbx.querySelector("[data-slow]"); if(sl) sl.onclick=()=>speak(it.x.replace(" – ",", "),lang,null,0.5,"model"); csWireWarm(fbx,it.st);
    const ag=fbx.querySelector("[data-ag]"); if(ag) ag.onclick=()=>draw();
    fbx.querySelector("[data-nx]").onclick=()=>{ record(ok); };
  };
  const record=(ok)=>{ const it=items[i]; res[i]=ok; tries=0; const s=csStage(it.st); s.n++; if(ok) s.ok++; s.last.push(ok); if(s.last.length>10) s.last.shift(); save();
    i++; if(i<items.length) draw(); else summary(); };
  const summary=()=>{ const a=res.filter(Boolean).length, p=Math.round(100*a/res.length), c=csStore(); c.hist.push({d:today(),p,st:isTest?"test":items[0].st}); if(c.hist.length>60) c.hist.shift(); if(isTest) c.test={d:today(),p}; save();
    logSession(t("cs_title"),Math.max(1,items.length*0.4)); try{ markPlan("cons"); }catch(e){}
    const per=CONS_ST.map(st=>{ const idx=items.map((x,k)=>x.st===st?k:-1).filter(k=>k>=0); if(!idx.length) return ""; const ok=idx.filter(k=>res[k]).length; return `<li>${t("st_"+st)}: ${ok}/${idx.length}</li>`; }).join("");
    CS.view="home"; CS.stage=isTest?csRecommended():CS.stage; const rec=csRecommended();
    box.innerHTML=`<h3 style="margin:0">${t("cs_title")}</h3><div class="${p>=80?"okbox":"warnbox"}" style="margin-top:6px"><b>${t("cs_sum",{a,n:res.length,p})}</b>${isTest?`<p style="margin:6px 0 2px">${t("cs_sum_st")}</p><ul class="list">${per}</ul><p><b>${t("cs_rec",{s:t("st_"+rec)})}</b></p>`:""}</div><button class="b" style="width:100%;margin-top:6px" data-bk>${t("cs_back")}</button>`;
    box.querySelector("[data-bk]").onclick=()=>renderCons(); };
  draw();
}
