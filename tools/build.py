import pathlib, json
root = pathlib.Path(__file__).resolve().parent.parent
src = root/"src"; dist = root/"dist"; app = dist/"VoiceCoach"
app.mkdir(parents=True, exist_ok=True)
html = (src/"index.html").read_text(encoding="utf-8")
js = "\n".join((src/f).read_text(encoding="utf-8") for f in ["i18n.js","content.js","app.js"])
scripts = "<script>\n" + js.replace("</script","<\\/script") + "\n</script>"
# 1) artifact (no manifest)
(dist/"artifact.html").write_text(html.replace("<!--MANIFEST-->","").replace("<!--SCRIPTS-->",scripts), encoding="utf-8")
# 2) installable PWA
(app/"index.html").write_text(html.replace("<!--MANIFEST-->",'<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png">').replace("<!--SCRIPTS-->",scripts), encoding="utf-8")
manifest = {"name":"VoiceCoach – Speech, Voice & Communication","short_name":"VoiceCoach","start_url":"./index.html","scope":"./","display":"standalone",
  "background_color":"#f4f1ea","theme_color":"#14322f","lang":"en",
  "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png","purpose":"any maskable"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]}
(app/"manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
(app/"sw.js").write_text("""const C='voicecoach-v2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res;}).catch(()=>caches.match('./index.html'))));});
""", encoding="utf-8")
try:
    from PIL import Image, ImageDraw
    for s in (192,512):
        im = Image.new("RGB",(s,s),"#1f6f63"); d = ImageDraw.Draw(im)
        cx=cy=s//2; w=s*0.06
        bars=[0.18,0.34,0.5,0.34,0.18]
        for i,h in enumerate(bars):
            x=cx+(i-2)*s*0.12; d.rounded_rectangle([x-w/2,cy-h*s/2,x+w/2,cy+h*s/2],radius=w/2,fill="#fffdf8")
        im.save(app/f"icon-{s}.png")
except ImportError:
    print("PIL missing – icons not generated")
print("built", (dist/"artifact.html").stat().st_size, "bytes")
