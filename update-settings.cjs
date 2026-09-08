const fs = require('fs');
let file = 'src/features/settings/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state
content = content.replace(
  /const \[countryCode, setCountryCode\] = useState\(settings\.countryCode \|\| "\+1"\)/,
  'const [engineEnabled, setEngineEnabled] = useState(settings.engineEnabled ?? true)\n  const [countryCode, setCountryCode] = useState(settings.countryCode || "+1")'
);

// Add to useEffect
content = content.replace(
  /setCountryCode\(settings\.countryCode \|\| "\+1"\)/,
  'setEngineEnabled(settings.engineEnabled ?? true)\n    setCountryCode(settings.countryCode || "+1")'
);

// Add to handleSave
content = content.replace(
  /countryCode,/,
  'engineEnabled,\n      countryCode,'
);

// Add UI toggle
const toggleHTML = `
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-raised)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, color: "var(--text)", fontWeight: 600, fontSize: 15 }}>PBX Engine Master Switch</label>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Turn off the PBX simulation entirely when not needed.</div>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: 50, height: 28 }}>
                <input type="checkbox" checked={engineEnabled} onChange={(e) => setEngineEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: engineEnabled ? "var(--success)" : "var(--border)", transition: ".4s", borderRadius: 28 }}>
                  <span style={{ position: "absolute", content: '""', height: 22, width: 22, left: engineEnabled ? 25 : 3, bottom: 3, backgroundColor: "white", transition: ".4s", borderRadius: "50%" }}></span>
                </span>
              </label>
            </div>
`;

content = content.replace(
  /<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>/,
  '<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>\n' + toggleHTML
);

fs.writeFileSync(file, content);
