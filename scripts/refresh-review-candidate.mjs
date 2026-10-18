// Local artifact preparation only. Never contacts Cloudflare or changes secrets.
import {
  readFileSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  cpSync,
} from "node:fs";
const target = "review-candidate";
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(".data/dashboard-preview/worker.js", target + "/worker.js");
const code = readFileSync(target + "/worker.js", "utf8");
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
writeFileSync(
  target + "/COPY_WORKER.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Undeployed candidate — review only</title><style>body{font:16px system-ui;max-width:800px;margin:30px auto;padding:20px}textarea{width:100%;height:260px}button{padding:16px}</style><h1>Review candidate — not deployment approval</h1><p>Do not replace the current Cloudflare preview until the owner approves this exact candidate. The Worker contains synthetic application assets, no credentials. Preserve runtime password and exact host settings if deployment is later approved.</p><button id="copy">Copy candidate Worker</button><p id="status" role="status"></p><textarea id="code" readonly aria-label="Candidate Worker source">${escape(code)}</textarea><script>document.getElementById('copy').onclick=async()=>{const t=document.getElementById('code');try{await navigator.clipboard.writeText(t.value);document.getElementById('status').textContent='Copied candidate; deployment still requires approval.'}catch{t.focus();t.select();document.getElementById('status').textContent=document.execCommand('copy')?'Copied candidate; deployment still requires approval.':'Select all source and copy manually.'}}</script></html>`,
);
cpSync("reports/dashboard-preview/package.json", target + "/package.json");
console.log("Review candidate copied locally; no deployment");
