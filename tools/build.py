"""Build VoiceCoach: src/* -> index.html (installable PWA at repo root) + dist/artifact.html (single file, no manifest)."""
import pathlib, json
root = pathlib.Path(__file__).resolve().parent.parent
src = root/"src"; dist = root/"dist"; dist.mkdir(exist_ok=True)
VERSION = "5.1"
html = (src/"index.html").read_text(encoding="utf-8").replace("__VERSION__", VERSION)
js = "\n".join((src/f).read_text(encoding="utf-8") for f in ["i18n.js","i18n2.js","i18n3.js","content.js","content2.js","i18n4.js","i18n5.js","i18n6.js","media.js","app.js","conv.js","artseries.js","support.js","coach.js","tone.js","goal.js","refstyle.js","voices.js","pattern.js","choir.js","choir2.js","choir3.js","app2.js"])
scripts = "<script>\n/* VoiceCoach v%s */\n" % VERSION + js.replace("</script","<\\/script") + "\n</script>"
(dist/"artifact.html").write_text(html.replace("<!--MANIFEST-->","").replace("<!--SCRIPTS-->",scripts), encoding="utf-8")
(root/"index.html").write_text(html.replace("<!--MANIFEST-->",'<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png">').replace("<!--SCRIPTS-->",scripts), encoding="utf-8")
manifest = {"name":"VoiceCoach – Speech, Voice & Communication","short_name":"VoiceCoach","id":"./","start_url":"./index.html","scope":"./","display":"standalone","orientation":"portrait",
  "background_color":"#f4f1ea","theme_color":"#14322f","description":"Offline speech, voice and communication trainer (EN/DE/FR)",
  "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}
(root/"manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
(root/"sw.js").write_text("""const C='voicecoach-v%s';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
// network-first for the page (updates arrive when online), cache fallback offline
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));});
""" % VERSION, encoding="utf-8")
print("built", (root/"index.html").stat().st_size, "bytes")
