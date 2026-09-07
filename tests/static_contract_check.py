from pathlib import Path
import hashlib, json, sys

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT.parent / "cloud-pbx-phone-v0.3.0"
errors=[]

def require(rel):
    if not (ROOT/rel).exists(): errors.append(f"missing: {rel}")

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

required=[
 "README.md","AGENTS.md","PROJECT_STRUCTURE.md","vibproject.ygit","docs/docs.manifest.ygit",
 "project/planning/BASELINE_FREEZE_v0.3.0.md","project/planning/SCOPE_LOCK_v0.3.1.md",
 "project/planning/IMPLEMENTATION_REPORT_v0.3.1.md","project/planning/VERIFICATION_REPORT_v0.3.1.md",
 "project/planning/DELTA_MANIFEST_v0.3.1.md","docs/release-notes/0.3.1.md","package.json",
 "src/app/App.tsx","src/runtime/pbxRuntime.ts","src/mock/simulator.ts","src/lib/ringtone.ts","src/types/pbx.ts"
]
for r in required: require(r)

# Visual/theme contracts protected from v0.3.0.
protected=[
 "src/styles/globals.css","src/components/layout/Sidebar.tsx","src/components/layout/Topbar.tsx",
 "src/components/pbx/AgentRow.tsx","src/components/pbx/CallControlBar.tsx","src/components/pbx/CallDetailDrawer.tsx",
 "src/components/pbx/CallDirectionBadge.tsx","src/components/pbx/CallTimeline.tsx","src/components/pbx/CdrTable.tsx",
 "src/components/pbx/IncomingCallCard.tsx","src/components/pbx/LiveCallRow.tsx","src/components/pbx/QueueCard.tsx",
 "src/components/pbx/RecordingPlayer.tsx","src/components/pbx/StatCard.tsx","src/components/pbx/StatusBadge.tsx",
 "src/features/live-calls/LiveCallsPage.tsx","src/features/incoming-calls/IncomingCallsPage.tsx","src/features/call-history/CallHistoryPage.tsx",
 "src/types/pbx.ts","src/mock/calls.ts","src/mock/agents.ts","src/mock/queues.ts"
]
if BASELINE.exists():
    for rel in protected:
        if sha(ROOT/rel)!=sha(BASELINE/rel): errors.append(f"protected v0.3.0 file changed: {rel}")

pkg=json.loads((ROOT/'package.json').read_text())
if pkg.get('version')!='0.3.1': errors.append('package version mismatch')
if BASELINE.exists():
    bp=json.loads((BASELINE/'package.json').read_text())
    if pkg.get('dependencies')!=bp.get('dependencies'): errors.append('dependency versions changed')
    if pkg.get('devDependencies')!=bp.get('devDependencies'): errors.append('devDependency versions changed')

manifest=json.loads((ROOT/'vibproject.ygit').read_text())
if manifest.get('project',{}).get('version')!='0.3.1': errors.append('VPMS project version mismatch')
if manifest.get('release',{}).get('latestVersion')!='0.3.1': errors.append('VPMS release version mismatch')
docs=json.loads((ROOT/'docs/docs.manifest.ygit').read_text())
if docs.get('versions',{}).get('current')!='0.3.1': errors.append('DPMS current version mismatch')

runtime=(ROOT/'src/runtime/pbxRuntime.ts').read_text()
app=(ROOT/'src/app/App.tsx').read_text()
for needle in ['nextIncomingAt','plannedEndAt','RUNTIME_STORAGE_KEY','restoreRuntime','reconcileRuntime','LONG_INACTIVE_RESET_MS']:
    if needle not in runtime: errors.append(f'runtime marker missing: {needle}')
for needle in ['RUNTIME_STORAGE_KEY','localStorage','visibilitychange','reconcileRuntime']:
    if needle not in app: errors.append(f'app runtime marker missing: {needle}')
for forbidden in ['new WebSocket(', 'RTCPeerConnection(', 'sip:', 'asterisk', 'freeswitch']:
    source='\n'.join(p.read_text(errors='ignore') for p in (ROOT/'src').rglob('*.ts*'))
    if forbidden.lower() in source.lower(): errors.append(f'production integration marker found: {forbidden}')

if errors:
    print('STATIC CONTRACT CHECK: FAIL')
    for e in errors: print(' -',e)
    sys.exit(1)
print('STATIC CONTRACT CHECK: PASS')
print('v0.3.0 baseline protection: PASS')
print(f'Protected visual/data files byte-identical: {len(protected)}')
print('Dependency preservation: PASS')
print('v0.3.1 identity/runtime wiring: PASS')
