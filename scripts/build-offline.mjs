import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const dir = process.argv[2] || "dist";
const assets = readdirSync(dir + "/assets").map((x) => "/assets/" + x);
const version = createHash("sha256")
  .update(readFileSync(dir + "/index.html"))
  .update(assets.join())
  .digest("hex")
  .slice(0, 16);
const script = `const CACHE='ea-shell-${version}';const FILES=${JSON.stringify(["/", "/index.html", ...assets])};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('message',e=>{if(e.data==='ACTIVATE')self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ea-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api'))return;if(e.request.mode==='navigate'&&(u.pathname==='/'||u.pathname==='/index.html')){e.respondWith(caches.open(CACHE).then(c=>c.match('/index.html')).then(r=>r||fetch(e.request)));return;}if(FILES.includes(u.pathname))e.respondWith(caches.open(CACHE).then(c=>c.match(u.pathname,{ignoreVary:true})).then(r=>r||fetch(e.request)));});`;
writeFileSync(dir + "/sw.js", script);
console.log("Offline cache built:", version, assets.length, "bundled assets");
