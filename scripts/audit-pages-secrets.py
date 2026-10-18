"""Offline pattern audit. Never print matched values; not a provider validity check."""
from pathlib import Path
import subprocess,re,json,hashlib
rules={
 'github_token':rb'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b',
 'aws_access_key':rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
 'private_key':rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----',
 'stripe_live':rb'\bsk_live_[A-Za-z0-9]{20,}',
 'slack_token':rb'\bxox[baprs]-[A-Za-z0-9-]{20,}',
}
# Credential-shaped literals are reviewed separately; no inferred entropy verdict.
literal=re.compile(rb'''(?i)\b(password|preview_password|api_key|access_token|secret_key)\s*[:=]\s*["']([^"'\r\n]{8,128})["']''')
findings=[];literals=[]
def scan(data,location):
 for rule,pattern in rules.items():
  for m in re.finditer(pattern,data):findings.append({'location':location,'line':data[:m.start()].count(b'\n')+1,'rule':rule})
 for m in literal.finditer(data):
  literals.append({'location':location,'line':data[:m.start()].count(b'\n')+1,'key':m.group(1).decode(),'valueHash':hashlib.sha256(m.group(2)).hexdigest()[:12]})
tracked=subprocess.check_output(['git','ls-files','-z']).decode().strip('\0').split('\0')
for name in tracked:scan(Path(name).read_bytes(),name)
objects=subprocess.check_output(['git','rev-list','--objects','--all'],text=True).splitlines();blobs=0
for row in objects:
 oid,*name=row.split(' ',1)
 if subprocess.check_output(['git','cat-file','-t',oid],text=True).strip()!='blob':continue
 blobs+=1;scan(subprocess.check_output(['git','cat-file','blob',oid]),'history:'+oid+(':'+name[0] if name else ''))
artifact=Path('.data/pages-build');built=[]
for p in artifact.rglob('*'):
 if p.is_file():scan(p.read_bytes(),'artifact:'+p.relative_to(artifact).as_posix());built.append(p)
report={'method':'Offline high-confidence token/private-key patterns plus credential-shaped literal inventory; current tracked files, reachable Git blobs and Pages build. No values printed or sent to a service.','trackedFiles':len(tracked),'reachableHistoryBlobs':blobs,'artifactFiles':len(built),'highConfidenceFindings':findings,'credentialLiteralsForReview':literals,'limitations':'Pattern matching cannot prove absence of all secrets, encoded credentials or real personal data. GitHub provider secret scanning and disclosure review remain required before public upload.'}
Path('reports/pages-access/secret-audit.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'trackedFiles':len(tracked),'historyBlobs':blobs,'artifactFiles':len(built),'highConfidenceFindings':len(findings),'credentialLiteralsForReview':len(literals)}))
