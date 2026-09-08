const fs = require('fs');
let file = 'src/features/settings/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// The end of the file currently is:
//       </div>
//         <div className="panel" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--danger-border)" }}>
// ...
//         </div>
//       </div>
//     </main>
//   )
// }

// Let's replace the last few lines to make sure it's valid.

const correctEnd = `
        <div className="panel" style={{ padding: 24, marginBottom: 24, marginTop: 24, border: "1px solid var(--danger-border)" }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 24 }}>
            <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--danger-text)" }}><Trash2 size={20} /> Danger Zone</h2>
          </div>
          <div>
            <p style={{ color: "var(--muted)", marginBottom: 16, fontSize: 14 }}>
              Clear all PBX call history, active calls, and data to start completely fresh. This action cannot be undone.
            </p>
            <button className="btn btn-danger" onClick={() => { if(confirm('Are you sure you want to clear all call data?')) onClearData() }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
              <Trash2 size={16} /> Clear All Call Data
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
`;

// we will strip everything from `<div className="panel" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--danger-border)" }}>` to the end of file.

const marker = '<div className="panel" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--danger-border)" }}>';
const index = content.lastIndexOf(marker);

// Also we need to make sure we leave the `</div>` that closed the Save section.
// Actually, let's just find `        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>`
const saveSectionMarker = '<div style={{ display: "flex", gap: 12, alignItems: "center" }}>';
const saveSectionIndex = content.indexOf(saveSectionMarker);

if (saveSectionIndex !== -1) {
  let beforeSave = content.substring(0, saveSectionIndex);
  let rest = `
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 24px", background: "var(--primary)", color: "var(--primary-text)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 400 }}>
            <Save size={16} /> Save Settings
          </button>
          {saved && <span style={{ color: "var(--success-text)", fontSize: 14, fontWeight: 400 }}>Settings saved and synced to database!</span>}
        </div>
${correctEnd}
`;
  fs.writeFileSync(file, beforeSave + rest);
}
