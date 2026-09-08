const fs = require('fs');
let file = 'src/features/settings/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export function SettingsPage\(\{ settings, onSettingsChange \}: \{ settings: PbxSettings, onSettingsChange: \(settings: PbxSettings\) => void \}\) \{/,
  'import { Trash2 } from "lucide-react"\nexport function SettingsPage({ settings, onSettingsChange, onClearData }: { settings: PbxSettings, onSettingsChange: (settings: PbxSettings) => void, onClearData: () => void }) {'
);

const dangerZoneHTML = `
        <div className="panel" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--danger-border)" }}>
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
`;

content = content.replace(
  /<\/div>\n    <\/main>/,
  `</div>\n        ${dangerZoneHTML}\n      </div>\n    </main>`
);

fs.writeFileSync(file, content);
