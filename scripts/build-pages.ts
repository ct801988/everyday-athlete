import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { deploymentBase } from "./isolated-pages-config";
const base = deploymentBase(),
  dir = ".data/pages-build";
if (
  !readFileSync(dir + "/index.html", "utf8").includes(
    'src="' + base + "assets/",
  )
)
  throw Error("Build/base mismatch");
mkdirSync(dir + "/icons", { recursive: true });
for (const n of [180, 192, 512])
  copyFileSync(
    `deployment/github-pages/icons/icon-${n}.png`,
    `${dir}/icons/icon-${n}.png`,
  );
const manifest = {
  id: base,
  name: "Everyday Athlete Preview",
  short_name: "Everyday Athlete",
  start_url: base,
  scope: base,
  display: "standalone",
  background_color: "#080f1c",
  theme_color: "#123056",
  icons: [192, 512].map((n) => ({
    src: `${base}icons/icon-${n}.png`,
    sizes: `${n}x${n}`,
    type: "image/png",
  })),
};
writeFileSync(
  dir + "/manifest.webmanifest",
  JSON.stringify(manifest, null, 2) + "\n",
);
const csp =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; media-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'";
writeFileSync(
  dir + "/index.html",
  readFileSync(dir + "/index.html", "utf8").replace(
    "</head>",
    `<meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,nofollow"><link rel="manifest" href="${base}manifest.webmanifest"><link rel="apple-touch-icon" href="${base}icons/icon-180.png"><meta name="theme-color" content="#123c46"></head>`,
  ),
);
writeFileSync(dir + "/.nojekyll", "");
const revision = process.env.EA_PAGES_RELEASE_SHA || "local-uncommitted";
if (revision !== "local-uncommitted" && !/^[a-f0-9]{40}$/.test(revision))
  throw Error("Release SHA must be a full commit identifier");
writeFileSync(
  dir + "/release.json",
  JSON.stringify({ revision, datasetSchema: 3, base }) + "\n",
);
const files = [
  "release.json",
  "index.html",
  ...readdirSync(dir + "/assets").map((x) => "assets/" + x),
  "manifest.webmanifest",
  ...[180, 192, 512].map((n) => `icons/icon-${n}.png`),
];
const sha = (s: string | Buffer) =>
  createHash("sha256").update(s).digest("hex");
const hash = sha(
    Buffer.concat(files.map((f) => readFileSync(dir + "/" + f))),
  ).slice(0, 16),
  prefix = "ea-pages-shell-" + sha(base).slice(0, 12) + "-";
const paths = files.map((f) => base + f);
const worker = `const PREFIX=${JSON.stringify(prefix)},CACHE=PREFIX+${JSON.stringify(hash)},BASE=${JSON.stringify(base)},FILES=${JSON.stringify(paths)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
${process.env.EA_ISOLATED_PAGES === "1" ? "// No forced activation: close all app windows to apply a waiting update safely." : "self.addEventListener('message',e=>{if(e.data==='ACTIVATE')self.skipWaiting()});"}
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.search)return;if(e.request.mode==='navigate'&&(u.pathname===BASE||u.pathname===BASE+'index.html')){e.respondWith(caches.open(CACHE).then(c=>c.match(BASE+'index.html')).then(r=>r||fetch(e.request)));return;}if(FILES.includes(u.pathname))e.respondWith(caches.open(CACHE).then(c=>c.match(u.pathname)).then(r=>r||fetch(e.request)));});`;
writeFileSync(dir + "/sw.js", worker);
const artifact = {
  base,
  hash,
  cachePrefix: prefix,
  files: [...files, "sw.js", ".nojekyll"].map((f) => ({
    path: f,
    bytes: readFileSync(dir + "/" + f).length,
    sha256: sha(readFileSync(dir + "/" + f)),
  })),
  authentication: "none; public static host only; approval required",
};
mkdirSync("reports/github-pages", { recursive: true });
writeFileSync(
  "reports/github-pages/pages-artifact.json",
  JSON.stringify(artifact, null, 2) + "\n",
);
console.log(
  `Prepared project-path Pages artifact: ${base}; ${artifact.files.length} files; NO deployment`,
);
