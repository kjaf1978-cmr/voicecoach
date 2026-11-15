/* v3.4 – articulation explanations in the APP language for every training language.
   ART_TIPS[trainingLang][sound][appLang]; the training language's own tip stays in ART[...].tip */
const ART_TIPS={
 en:{
  S:{de:"Englisches S: Zungenspitze hinter den Schneidezähnen, Zähne fast geschlossen, die Luft strömt durch eine schmale Rinne in der Zungenmitte. Keine Luft an den Seiten.",
     fr:"S anglais : pointe de la langue derrière les incisives, dents presque serrées, l'air passe par une rigole étroite au milieu de la langue. Pas d'air sur les côtés."},
  SH:{de:"Englisches SH (wie deutsches „sch“): Lippen gerundet und vorgeschoben, Zunge etwas zurück, breiter Luftstrom – wie „pssst“.",
      fr:"SH anglais (comme le « ch » français) : lèvres arrondies et avancées, langue un peu en arrière, large souffle – comme « chut »."},
  R:{de:"Englisches R: Zungenspitze leicht nach hinten gebogen oder zusammengezogen, sie berührt den Gaumen NICHT; Lippen leicht gerundet. Nicht rollen und nicht gurgeln. Vom langen „örrr“ aus beginnen.",
     fr:"R anglais : pointe de la langue légèrement recourbée vers l'arrière, elle ne touche PAS le palais ; lèvres un peu arrondies. Ni roulé ni raclé. Partez d'un long « eurrr »."},
  L:{de:"Zungenspitze drückt an den Zahndamm hinter den oberen Schneidezähnen; die Luft fließt seitlich an der Zunge vorbei. Am Wortende („ball“) klingt das englische L dunkler: Zungenrücken leicht anheben.",
     fr:"Pointe de la langue contre la crête derrière les incisives du haut ; l'air passe sur les côtés. En fin de mot (« ball »), le L anglais est plus sombre : levez légèrement le dos de la langue."},
  "K/G":{de:"Hinterzunge berührt den weichen Gaumen (hinterer Teil des Gaumens) und löst sich; Zungenspitze bleibt unten. K stimmlos mit Hauch, G stimmhaft.",
         fr:"L'arrière de la langue touche le palais mou (fond du palais) puis se relâche ; pointe de la langue en bas. K sourd avec un petit souffle, G sonore."},
  TH:{de:"Zungenspitze leicht zwischen die Zähne legen und Luft darüber blasen. „th“ in „think“ ist stimmlos, in „this“ stimmhaft (summend). Nicht durch s, f oder d ersetzen.",
      fr:"Pointe de la langue légèrement entre les dents, soufflez dessus. Le « th » de « think » est sourd, celui de « this » sonore (vibrant). Ne pas le remplacer par s, f ou d."},
  "F/V":{de:"Obere Schneidezähne leicht auf die Unterlippe legen und Luft durchblasen. F stimmlos, V stimmhaft (summend) – das englische V klingt wie das deutsche W.",
         fr:"Dents du haut légèrement posées sur la lèvre inférieure, soufflez. F sourd, V sonore (vibrant)."}
 },
 de:{
  S:{en:"German S: tongue tip behind the lower front teeth, teeth almost closed, air flows over the middle of the tongue. No air at the sides (that would be a lisp). Before a vowel at the start of a word (Sonne) the German S is voiced, like English z.",
     fr:"S allemand : pointe de la langue derrière les incisives du bas, dents presque serrées, l'air passe au milieu de la langue. Pas d'air sur les côtés (sinon zézaiement). Devant une voyelle en début de mot (Sonne), le S allemand est sonore, comme un z."},
  SCH:{en:"German SCH (like English “sh”): lips rounded and pushed forward, tongue slightly back, wide airflow – like “shh, quiet!”.",
       fr:"SCH allemand (comme le « ch » français) : lèvres arrondies et avancées, langue un peu en arrière, large souffle – comme « chut ! »."},
  R:{en:"The German R is usually made at the back: the back of the tongue rises towards the soft palate, like light gargling (similar to the French R). A rolled tongue-tip R is also accepted. At the end of a word it often sounds like a short “a” (Tür ≈ “Tüa”).",
     fr:"Le R allemand se forme généralement à l'arrière, comme en français : l'arrière de la langue monte vers le voile du palais. Un R roulé est aussi accepté. En fin de mot, il sonne souvent comme un « a » bref (Tür ≈ « Tüa »)."},
  L:{en:"Tongue tip on the ridge behind the upper front teeth, air flows around the sides of the tongue. The German L is always light – never dark like the English L in “ball”.",
     fr:"Pointe de la langue sur la crête derrière les incisives du haut, l'air passe sur les côtés. Le L allemand est toujours clair."},
  "K/G":{en:"The back of the tongue presses against the back of the palate and releases with a small pop. The tongue tip stays down. K voiceless with a puff of air, G voiced.",
         fr:"L'arrière de la langue appuie contre le fond du palais et se relâche avec un petit éclat. Pointe de la langue en bas. K sourd avec un souffle, G sonore."},
  "T/D":{en:"The tongue tip taps the ridge behind the upper front teeth. T voiceless with a puff of air, D voiced. At the end of a word D is pronounced like T (Hund ≈ “Hunt”).",
         fr:"La pointe de la langue tape la crête derrière les incisives du haut. T sourd avec un souffle, D sonore. En fin de mot, D se prononce comme T (Hund ≈ « Hount »)."},
  CH:{en:"Two German sounds. The “ich” sound (after e, i, ä, ö, ü, ei, eu, l, n, r): middle of the tongue raised towards the hard palate, the air rubs there – like a soft cat's hiss, no lip rounding (not “sh”). The “ach” sound (after a, o, u, au): further back in the throat, like Scottish “loch”.",
      fr:"Deux sons allemands. Le son « ich » (après e, i, ä, ö, ü, ei, eu, l, n, r) : le milieu de la langue monte vers le palais dur, l'air y frotte – comme un chat qui souffle doucement, sans arrondir les lèvres (pas le « ch » français). Le son « ach » (après a, o, u, au) : plus en arrière dans la gorge, comme la jota espagnole."}
 },
 fr:{
  S:{en:"French S: tongue tip behind the lower front teeth, teeth almost closed, air through the middle of the tongue. No air at the sides. A single s between two vowels sounds like z (poison); a double ss stays s (poisson).",
     de:"Französisches S: Zungenspitze hinter den unteren Schneidezähnen, Zähne fast geschlossen, Luft strömt mittig über die Zunge. Keine Luft seitlich. Ein einzelnes s zwischen zwei Vokalen klingt wie ein summendes z (poison), ss bleibt scharf (poisson)."},
  CH:{en:"French CH = English “sh”: lips rounded and pushed forward, tongue slightly back, wide airflow – like “shh!”.",
      de:"Französisches CH = deutsches „sch“: Lippen rund nach vorne, Zunge etwas zurück, breiter Luftstrom – wie „pssst!“."},
  J:{en:"French J (as in “jardin”) is the voiced partner of “sh” – like the “s” in English “measure”: same mouth position as sh, but the vocal folds vibrate (feel the buzz at your throat).",
     de:"Französisches J (wie in „jardin“) ist das stimmhafte „sch“ – wie in „Garage“ oder „Journal“: gleiche Mundstellung wie „sch“, aber die Stimme summt (am Hals fühlbar)."},
  R:{en:"French R is made at the back: the back of the tongue rises towards the uvula, like a light gargle. The tongue tip stays down behind the lower teeth. Not rolled and not like the English R.",
     de:"Französisches R entsteht hinten: der Zungenrücken hebt sich zum Zäpfchen, wie leises Gurgeln. Die Zungenspitze bleibt unten hinter den unteren Zähnen. Ähnlich dem deutschen Zäpfchen-R, aber weicher."},
  L:{en:"Tongue tip against the ridge behind the upper front teeth; air flows around the sides. The French L is always light and clear, even at the end of a word (bol).",
     de:"Zungenspitze am Zahndamm hinter den oberen Schneidezähnen; die Luft fließt seitlich vorbei. Das französische L ist immer hell und klar, auch am Wortende (bol)."},
  "K/G":{en:"The back of the tongue touches the soft palate, then releases. Tongue tip down. In French, K is NOT aspirated (no puff of air, unlike English); G is voiced.",
         de:"Hinterzunge berührt den weichen Gaumen und löst sich. Zungenspitze unten. Im Französischen wird K OHNE Hauch gesprochen (anders als im Deutschen); G ist stimmhaft."}
 }
};
function artTip(tl,snd){ const x=ART_TIPS[tl]&&ART_TIPS[tl][snd]; return (x&&x[SET.ui])||ART[tl][snd].tip; }
/* material shown in the training language: mark with class "tl" + lang so screen readers / hyphenation use the right language */
const tlAttr=l=>`class="tl" lang="${l}"`;
Object.assign(T.en,{in_lang:"in {l}", your_topic:"Topic", say_in:"Speak in {l}:"});
Object.assign(T.de,{in_lang:"auf {l}", your_topic:"Thema", say_in:"Sprich auf {l}:"});
Object.assign(T.fr,{in_lang:"en {l}", your_topic:"Sujet", say_in:"Parlez en {l} :"});
const LANG_IN={en:{en:"English",de:"German",fr:"French"},de:{en:"Englisch",de:"Deutsch",fr:"Französisch"},fr:{en:"anglais",de:"allemand",fr:"français"}};
const langIn=l=>LANG_IN[SET.ui][l];

/* v3.4 label review */
Object.assign(T.en,{"lvl2": "Key points", "level": "Input level", "pos_i": "Start of word", "pos_m": "Middle", "pos_f": "End of word", "metronome": "Metronome click on each word", "toast_logged": "Added to history: {n}", "sup_crisp": "Short & crisp", "dims_info": "ⓘ How the measures are calculated", "mic_fail": "Microphone not available – see the note in the Voice tab.", "finish": "See result ▶", "start_timer": "Start timer"});
Object.assign(T.de,{"level": "Eingangspegel", "pos_i": "Wortanfang", "pos_m": "Wortmitte", "pos_f": "Wortende", "metronome": "Metronom-Klick bei jedem Wort", "toast_logged": "Im Verlauf eingetragen: {n}", "c_delivery": "Sprechweise", "finish": "Zum Ergebnis ▶", "retry_turn": "Nochmal versuchen", "best": "Bestwert", "save_best": "Bestwert speichern", "pairs_pick": "Eins heimlich auswählen", "dims_info": "ⓘ So werden die Werte berechnet", "mic_fail": "Mikrofon nicht verfügbar – siehe Hinweis im Reiter „Stimme“.", "test_score": "Stimmwert"});
Object.assign(T.fr,{"level": "Niveau d'entrée", "pos_i": "Début du mot", "pos_m": "Milieu", "pos_f": "Fin du mot", "metronome": "Clic de métronome à chaque mot", "toast_logged": "Ajouté à l'historique : {n}", "go": "Lancer", "best": "Meilleur score", "start_timer": "Démarrer le chrono", "studio_prompt": "Consigne", "sup_A": "A habituel", "match_title": "Justesse de la note", "dims_info": "ⓘ Comment les mesures sont calculées", "mic_fail": "Micro indisponible – voir la remarque dans l'onglet Voix.", "finish": "Voir le résultat ▶", "c_complete": "Longueur"});
