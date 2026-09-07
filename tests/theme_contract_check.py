from pathlib import Path
import hashlib
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
css = (ROOT / "src/styles/globals.css").read_text(encoding="utf-8")
app = (ROOT / "src/app/App.tsx").read_text(encoding="utf-8")
topbar = (ROOT / "src/components/layout/Topbar.tsx").read_text(encoding="utf-8")
sidebar = (ROOT / "src/components/layout/Sidebar.tsx").read_text(encoding="utf-8")
overview = (ROOT / "src/features/overview/OverviewPage.tsx").read_text(encoding="utf-8")
live = (ROOT / "src/components/pbx/LiveCallRow.tsx").read_text(encoding="utf-8")
index = (ROOT / "index.html").read_text(encoding="utf-8")
errors = []

# The full v0.2.0 dark root block is frozen byte-for-byte.
root_match = re.search(r':root \{.*?\n\}', css, flags=re.S)
if not root_match:
    errors.append("dark :root block missing")
else:
    dark_hash = hashlib.sha256(root_match.group(0).encode()).hexdigest()
    if dark_hash != "1e9f03f3d742c2876bf0b46b2bbc1e55374900c96f60d955a7518dfda6ebe80e":
        errors.append(f"v0.2.0 dark root block changed: {dark_hash}")

light_required = [
    'html[data-theme="light"]',
    "--bg: #f3f7fb", "--surface: #ffffff", "--surface-raised: #f8fafc",
    "--surface-hover: #edf3f8", "--sidebar-bg: #eaf2f8", "--border: #d7e1ea",
    "--border-strong: #c4d1dd", "--text: #102033", "--muted: #526579",
    "--primary: #2563eb", "--info: #0284c7", "--success: #15803d",
    "--warning: #d97706", "--danger: #dc2626", "--focus-ring: #38bdf8",
    ".badge.waiting", ".badge.abandoned", ".badge.transferred",
    ".live-row.status-connected", ".live-row.status-ringing", ".live-row.status-waiting",
    ".stat-card.tone-primary", ".stat-card.tone-info", ".stat-card.tone-warning",
    ".stat-card.tone-success", ".stat-card.tone-danger",
]
for item in light_required:
    if item not in css: errors.append(f"light PBX polish contract missing: {item}")

# Geometry/density guardrails remain unchanged.
geometry_required = [
    "--sidebar: 216px", "--topbar: 48px", ".page { width: min(1440px, 100%); margin: 0; padding: 14px;",
    ".btn { height: 32px; padding: 0 10px;", ".search-box { min-width: 220px; height: 32px;",
    ".nav-item { width: 100%; height: 30px;", ".data-table th { height: 32px;",
    ".data-table td { height: 40px;", "@media (max-width: 1180px)", "@media (max-width: 860px)", "@media (max-width: 620px)",
]
for item in geometry_required:
    if item not in css: errors.append(f"protected geometry/breakpoint contract changed: {item}")

checks = [
    ("theme persistence", 'cloud-pbx-phone-theme' in app),
    ("root data-theme", 'document.documentElement.dataset.theme' in app),
    ("light browser theme color", '"#F3F7FB"' in app),
    ("dark browser theme color protected", '"#0D1117"' in app),
    ("toggle callback", 'onThemeToggle' in topbar),
    ("sun icon", '<Sun />' in topbar),
    ("moon icon", '<Moon />' in topbar),
    ("sidebar logo", '/brand/logos/icon.png' in sidebar),
    ("favicon", '/brand/favicon/favicon.ico' in index),
    ("prepaint theme", 'document.documentElement.dataset.theme = theme' in index),
    ("KPI semantic tones", 'tone="warning"' in overview and 'tone="danger"' in overview and 'tone="success"' in overview),
    ("live status class", 'status-${call.status}' in live),
]
for item, ok in checks:
    if not ok: errors.append(f"missing: {item}")

if errors:
    print("THEME CONTRACT CHECK: FAIL")
    for error in errors: print(" -", error)
    sys.exit(1)
print("THEME CONTRACT CHECK: PASS")
print("v0.2.0 dark root block byte-preserved: PASS")
print("Light cloud/PBX semantic palette: PASS")
print("Light operational status semantics: PASS")
print("Compact geometry/breakpoints preserved: PASS")
print("Theme toggle/persistence and brand paths: PASS")
