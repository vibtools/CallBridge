from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
runtime = (ROOT / "src/runtime/pbxRuntime.ts").read_text(encoding="utf-8")
app = (ROOT / "src/app/App.tsx").read_text(encoding="utf-8")
ringtone = (ROOT / "src/lib/ringtone.ts").read_text(encoding="utf-8")
errors = []

required_runtime = [
    'RUNTIME_STORAGE_KEY = "cloud-pbx-phone-runtime-v1"',
    "MIN_INCOMING_DELAY_MS = 3 * 60 * 1000",
    "MAX_INCOMING_DELAY_MS = 5 * 60 * 1000",
    "MAX_INCOMING_RING_MS = 60 * 1000",
    "LONG_INACTIVE_RESET_MS = 15 * 60 * 1000",
    "nextIncomingAt",
    "lastProcessedAt",
    "plannedEndAt",
    "decisionAt",
    "usedCallerNumbers",
    "reconcileRuntime",
    "restoreRuntime",
    "serializeRuntime",
    "deriveRuntimeAgents",
    "deriveRuntimeQueues",
    "35% 2-8m",
    "5% 60-120m",
]
for item in required_runtime:
    if item not in runtime:
        errors.append(f"runtime contract missing: {item}")

for forbidden in ["talkSeconds + 1", "ringSeconds + 1", "totalSeconds + 1", "window.setTimeout"]:
    if forbidden in runtime:
        errors.append(f"counter/timer source-of-truth regression found: {forbidden}")

required_app = [
    "restoreRuntime(window.localStorage.getItem(RUNTIME_STORAGE_KEY)",
    "window.localStorage.setItem(RUNTIME_STORAGE_KEY, serializeRuntime(runtime))",
    "window.setInterval(syncNow, HEARTBEAT_MS)",
    'window.addEventListener("focus", syncNow)',
    'document.addEventListener("visibilitychange", onVisibilityChange)',
    "setRingtoneActive(hasRingingInbound)",
]
for item in required_app:
    if item not in app:
        errors.append(f"App runtime wiring missing: {item}")

for item in ["AudioContext", "first.frequency.value = 440", "second.frequency.value = 480", "setRingtoneActive"]:
    if item not in ringtone:
        errors.append(f"ringtone contract missing: {item}")

if errors:
    print("CALL RUNTIME CONTRACT CHECK: FAIL")
    for error in errors:
        print(" -", error)
    sys.exit(1)

print("CALL RUNTIME CONTRACT CHECK: PASS")
print("Scheduler: persisted absolute nextIncomingAt, 3-5 minutes")
print("Clock: Date.now()/absolute timestamps, not increment counters")
print("Incoming: decision timestamp + <=60-second deadline")
print("Connected: plannedEndAt, 2 minutes-2 hours weighted")
print("Persistence/background reconciliation: PRESENT")
print("Dynamic agent/queue derivation: PRESENT")
print("Ringtone lifecycle wiring: PRESENT")
