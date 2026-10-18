"""Local YAML/guard inspection, not a GitHub-hosted workflow execution."""
from pathlib import Path
import json,re
import yaml
p=Path('deployment/github-pages/pages.yml.disabled')
d=yaml.safe_load(p.read_text())
checks=[]
def check(name,condition):
    assert condition,name
    checks.append({'name':name,'status':'passed'})
check('template inert; no active GitHub workflows created',not Path('.github/workflows/pages.yml').exists())
check('read-only default token',d['permissions']=={'contents':'read'})
check('PR, main push and manual triggers',set(d['on'])=={'pull_request','push','workflow_dispatch'})
check('exact repository allowlist',d['jobs']['verify']['if']=='github.repository == vars.EA_AUTHORIZED_REPOSITORY')
steps=d['jobs']['verify']['steps']
check('all external actions pinned to resolved full SHAs',all(re.fullmatch(r'actions/[a-z-]+@[a-f0-9]{40}',s['uses']) for j in d['jobs'].values() for s in j.get('steps',[]) if 'uses' in s))
check('all build and test commands run without continue-on-error',all(not s.get('continue-on-error',False) for s in steps) and all(any(s.get('run')==f'npm run {cmd}' for s in steps) for cmd in ['typecheck','lint','test:unit','test:integration','test:browser','test:local','build:pages','test:pages']))
check('deploy depends on passing verification',d['jobs']['deploy']['needs']=='verify')
guard=d['jobs']['deploy']['if']
check('PR cannot deploy; main and both owner flags required',all(s in guard for s in ["github.event_name != 'pull_request'","github.ref == 'refs/heads/main'","vars.EA_PAGES_PUBLICATION_APPROVED == 'true'","vars.EA_PAGES_PUBLIC_ACCESS_APPROVED == 'true'",'github.repository == vars.EA_AUTHORIZED_REPOSITORY']))
check('publish uses environment approval boundary',d['jobs']['deploy']['environment']['name']=='github-pages')
check('deploy scoped token only',d['jobs']['deploy']['permissions']=={'pages':'write','id-token':'write'})
check('rollback source is immutable and main ancestor',any('SOURCE_SHA' in s.get('run','') and '^[a-f0-9]{40}$' in s.get('run','') for s in steps) and any('git merge-base --is-ancestor' in s.get('run','') for s in steps))
check('no long-lived secret/PAT in workflow',not re.search(r'secrets\.|PERSONAL_ACCESS_TOKEN|CLOUDFLARE_API_TOKEN',p.read_text()))
check('only static artifact uploaded to Pages',any(s.get('with',{}).get('path')=='.data/pages-build' for s in steps))
Path('reports/github-pages/workflow-static-checks.json').write_text(json.dumps({'passed':len(checks),'failed':0,'cases':checks,'limitation':'YAML parsing and static invariants only. Hosted Actions, environment review settings, OIDC and Pages APIs not executed.'},indent=2)+'\n')
print(f'{len(checks)} workflow static checks passed')
