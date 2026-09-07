from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
folders = ["assets","config","data","docs","examples","project","scripts","src","tests"]
missing = [f for f in folders if not (ROOT/f).is_dir()]
if missing:
    raise SystemExit("Missing folders: " + ", ".join(missing))
print("STRUCTURE CHECK: PASS")
print("project/ = internal/private workspace")
print("docs/ = public/user documentation")
