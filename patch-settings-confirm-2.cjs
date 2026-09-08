const fs = require('fs');
let file = 'src/features/settings/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<button className="btn btn-danger" onClick=\{\(\) => \{ if\(confirm\('Are you sure you want to clear all call data\?'\)\) onClearData\(\) \}\} style=\{\{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" \}\}>\s*<Trash2 size=\{16\} \/> Clear All Call Data\s*<\/button>/,
  `<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!confirmClear ? (
                <button className="btn btn-danger" onClick={() => setConfirmClear(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
                  <Trash2 size={16} /> Clear All Call Data
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--danger-text)", fontSize: 14, fontWeight: 500 }}>Are you sure?</span>
                  <button className="btn btn-danger" onClick={() => { 
                    onClearData(); 
                    setConfirmClear(false); 
                    setClearedMessage(true); 
                    setTimeout(() => setClearedMessage(false), 3000);
                  }} style={{ padding: "8px 16px" }}>
                    Yes, Clear It
                  </button>
                  <button className="btn" onClick={() => setConfirmClear(false)} style={{ padding: "8px 16px", background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    Cancel
                  </button>
                </div>
              )}
              {clearedMessage && <span style={{ color: "var(--success-text)", fontSize: 14, fontWeight: 500 }}>All data cleared successfully!</span>}
            </div>`
);

fs.writeFileSync(file, content);
