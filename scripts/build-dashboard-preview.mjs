import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
const manifest = JSON.parse(readFileSync('reports/preview-preparation/deployment-assets.json','utf8'));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png'};
const payload = Object.fromEntries(manifest.files.map(f=>{
 const b=readFileSync('.data/preview-assets'+f.path);
 const ext=f.path.slice(f.path.lastIndexOf('.'));
 return [f.path,{body:b.toString('base64'),type:types[ext]}];
}));
mkdirSync('.data/dashboard-preview',{recursive:true});
const entry=`import { fetchPreview } from '../../preview/worker.ts';
const files=${JSON.stringify(payload)};
const decoded=new Map();
const assets={async fetch(request){
 const path=new URL(request.url).pathname;
 const item=Object.prototype.hasOwnProperty.call(files,path)?files[path]:null;
 if(!item)return new Response('Not found',{status:404});
 let bytes=decoded.get(path);
 if(!bytes){bytes=Uint8Array.from(atob(item.body),c=>c.charCodeAt(0));decoded.set(path,bytes);}
 return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':item.type,'Content-Length':String(bytes.length)}});
}};
export default {fetch(request,env){return fetchPreview(request,{PREVIEW_HOST:env.PREVIEW_HOST,PREVIEW_PASSWORD:env.PREVIEW_PASSWORD,ASSETS:assets});}};
`;
writeFileSync('.data/dashboard-preview/entry.ts',entry);
await build({entryPoints:['.data/dashboard-preview/entry.ts'],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'.data/dashboard-preview/worker.js',legalComments:'none',sourcemap:false});
const b=readFileSync('.data/dashboard-preview/worker.js');
// Deliberately conservative release ceiling; no remote limit increase or paid tier.
if(b.length>1024*1024)throw Error('Dashboard bundle exceeds conservative 1 MiB release ceiling');
mkdirSync('reports/dashboard-preview',{recursive:true});
writeFileSync('reports/dashboard-preview/package.json',JSON.stringify({bytes:b.length,gzipBytes:gzipSync(b).length,sha256:createHash('sha256').update(b).digest('hex'),staticFiles:manifest.files.length,sourceAssetManifest:manifest.hash,noExternalBindings:true,password:'runtime secret only; no value in package'},null,2)+'\n');
console.log('Built dashboard-only Worker:',b.length,'bytes;',manifest.files.length,'exact static files; no deployment');
