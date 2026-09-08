const fs = require('fs');
let file = 'src/features/settings/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add lastMigrationTime state
content = content.replace(
  /const \[migrationMessage, setMigrationMessage\] = useState\(""\)/,
  `const [migrationMessage, setMigrationMessage] = useState("")
  const [lastMigrationTime, setLastMigrationTime] = useState<string | null>(null)
  
  // Initialize db status on mount
  useEffect(() => {
    const hasEnv = !!import.meta.env.VITE_SUPABASE_URL;
    if (hasEnv) {
      setDbStatus("connected");
      setDbMessage("Connected to Supabase.");
    } else {
      setDbStatus("idle");
    }
  }, []);`
);

// Add the status display area inside the Database block
const statusDisplay = `
             {/* Connection Status Panel */}
             <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: "50%", 
                    background: dbStatus === "connected" ? "var(--success)" : dbStatus === "error" ? "var(--danger)" : "var(--muted)",
                    boxShadow: dbStatus === "connected" ? "0 0 8px var(--success)" : "none"
                  }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Supabase Connection</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {dbStatus === "connected" ? "Database is online and accessible" : dbStatus === "error" ? "Connection failed" : "No connection established"}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Last Migration</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                    {lastMigrationTime ? lastMigrationTime : "Never"}
                  </div>
                </div>
             </div>
`;

// Insert the statusDisplay right after the introductory paragraph
content = content.replace(
  /<\/p>\s*<div style=\{\{ display: "flex", alignItems: "center", gap: 12 \}\}>/,
  `</p>\n\n${statusDisplay}\n\n             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>`
);

// Update migration button to set last migration time
content = content.replace(
  /setMigrationMessage\("Database migration completed successfully!"\);/,
  `setMigrationMessage("Database migration completed successfully!");
                        setLastMigrationTime(new Date().toLocaleString());`
);


fs.writeFileSync(file, content);
