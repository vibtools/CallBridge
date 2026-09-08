import { useState, useEffect } from "react"
import { 
  Globe, Save, Activity, Trash2, CheckCircle2, AlertTriangle, 
  XCircle, Copy, Check, ExternalLink, RefreshCw, Database, Table, Code2
} from "lucide-react"
import type { PbxSettings } from "@/runtime/pbxRuntime"
import type { PbxCall, Agent } from "@/types/pbx"
import { clearAllCallsInDb, syncCallsToDb, diagnoseSupabaseAccess } from "@/lib/callsDb"
import { saveSettingsToDb } from "@/lib/settingsDb"
import { saveAllAgentsToDb } from "@/lib/agentsDb"
import { supabase, HAS_SUPABASE } from "@/lib/supabase"

const SQL_MIGRATION_SCRIPT = `-- COMPLETE PBX DATABASE SCHEMA MIGRATION

-- 1. PBX SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.pbx_settings (
    id INTEGER PRIMARY KEY,
    country_code TEXT,
    mock_enabled BOOLEAN DEFAULT true,
    min_call_delay INTEGER,
    max_call_delay INTEGER,
    min_call_duration INTEGER,
    max_call_duration INTEGER,
    calls_per_interval INTEGER,
    dids JSONB,
    queue_assignments JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pbx_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users on settings" ON public.pbx_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.pbx_settings (
    id, country_code, mock_enabled, min_call_delay, max_call_delay, 
    min_call_duration, max_call_duration, calls_per_interval, dids, queue_assignments
) VALUES (
    1, '+1', true, 8, 45, 120, 7200, 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;


-- 2. PBX AGENTS TABLE
CREATE TABLE IF NOT EXISTS public.pbx_agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    extension TEXT NOT NULL,
    status TEXT NOT NULL,
    queue TEXT NOT NULL DEFAULT 'Support',
    active_call_id TEXT,
    active_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pbx_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users on agents" ON public.pbx_agents FOR ALL USING (true) WITH CHECK (true);


-- 3. PBX CALLS TABLE (CALL HISTORY & ACTIVE CALLS)
CREATE TABLE IF NOT EXISTS public.pbx_calls (
    id TEXT PRIMARY KEY,
    direction TEXT,
    caller TEXT,
    caller_name TEXT,
    callee TEXT,
    did TEXT,
    extension TEXT,
    agent TEXT,
    queue TEXT,
    status TEXT,
    started_at TEXT,
    answered_at TEXT,
    ended_at TEXT,
    ring_seconds INTEGER,
    talk_seconds INTEGER,
    total_seconds INTEGER,
    codec TEXT,
    recording_available BOOLEAN,
    timeline JSONB
);

ALTER TABLE public.pbx_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for all users on calls" ON public.pbx_calls FOR ALL USING (true) WITH CHECK (true);`

interface TableState {
  exists: boolean | null
  count: number
  error?: string
}

export function SettingsPage({ 
  settings, 
  calls = [], 
  agents = [], 
  onSettingsChange, 
  onClearData 
}: { 
  settings: PbxSettings
  calls?: PbxCall[]
  agents?: Agent[]
  onSettingsChange: (settings: PbxSettings) => void
  onClearData: () => void 
}) {
  const [engineEnabled, setEngineEnabled] = useState(settings.engineEnabled ?? true)
  const [countryCode, setCountryCode] = useState(settings.countryCode || "+1")
  const [mockEnabled, setMockEnabled] = useState(settings.mockEnabled ?? true)
  const [minCallDelay, setMinCallDelay] = useState(settings.minCallDelay ?? 8)
  const [maxCallDelay, setMaxCallDelay] = useState(settings.maxCallDelay ?? 45)
  const [minCallDuration, setMinCallDuration] = useState(settings.minCallDuration ?? 120)
  const [maxCallDuration, setMaxCallDuration] = useState(settings.maxCallDuration ?? 7200)
  const [callsPerInterval, setCallsPerInterval] = useState(settings.callsPerInterval ?? 1)
  
  const [saveStatus, setSaveStatus] = useState<{ status: "idle" | "saving" | "saved" | "error"; message: string }>({
    status: "idle",
    message: ""
  })

  // Real Database verification states
  const [dbStatus, setDbStatus] = useState<"idle" | "checking" | "connected" | "tables_missing" | "error">("idle")
  const [dbMessage, setDbMessage] = useState("")
  const [tableStates, setTableStates] = useState<{
    settings: TableState
    agents: TableState
    calls: TableState
  }>({
    settings: { exists: null, count: 0 },
    agents: { exists: null, count: 0 },
    calls: { exists: null, count: 0 },
  })

  // Sync state
  const [syncStatus, setSyncStatus] = useState<{ status: "idle" | "syncing" | "success" | "error"; message: string }>({
    status: "idle",
    message: ""
  })

  const [copiedSql, setCopiedSql] = useState(false)
  const [showSqlViewer, setShowSqlViewer] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearedMessage, setClearedMessage] = useState(false)

  // Extract Supabase project reference for direct link
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const projectRef = supabaseUrl.replace(/^https?:\/\//, "").split(".")[0]
  const sqlEditorUrl = projectRef && !projectRef.includes("placeholder")
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
    : "https://supabase.com/dashboard"

  // Real Live Database Verification
  const checkDatabaseTables = async () => {
    if (!HAS_SUPABASE) {
      setDbStatus("error")
      setDbMessage("Supabase credentials not configured in .env.local")
      return
    }

    setDbStatus("checking")
    setDbMessage("Querying Supabase project for tables...")

    try {
      const [resSettings, resAgents, resCalls] = await Promise.all([
        supabase.from("pbx_settings").select("id", { count: "exact" }).limit(1),
        supabase.from("pbx_agents").select("id", { count: "exact" }).limit(1),
        supabase.from("pbx_calls").select("id", { count: "exact" }).limit(1),
      ])

      const settingsOk = !resSettings.error
      const agentsOk = !resAgents.error
      const callsOk = !resCalls.error

      setTableStates({
        settings: {
          exists: settingsOk,
          count: resSettings.count || 0,
          error: resSettings.error ? resSettings.error.message : undefined,
        },
        agents: {
          exists: agentsOk,
          count: resAgents.count || 0,
          error: resAgents.error ? resAgents.error.message : undefined,
        },
        calls: {
          exists: callsOk,
          count: resCalls.count || 0,
          error: resCalls.error ? resCalls.error.message : undefined,
        },
      })

      if (settingsOk && agentsOk && callsOk) {
        setDbStatus("connected")
        setDbMessage("All 3 tables verified and active in Supabase!")
      } else {
        const missing = [
          !settingsOk && "pbx_settings",
          !agentsOk && "pbx_agents",
          !callsOk && "pbx_calls",
        ].filter(Boolean)
        setDbStatus("tables_missing")
        setDbMessage(`Tables missing in Supabase (${missing.join(", ")}). Run the SQL migration script below.`)
      }
    } catch (err: any) {
      setDbStatus("error")
      setDbMessage("Connection check failed: " + (err?.message || "Unknown error"))
    }
  }

  // Check tables on mount
  useEffect(() => {
    if (HAS_SUPABASE) {
      checkDatabaseTables()
    } else {
      setDbStatus("idle")
      setDbMessage("No Supabase configuration detected in .env.local")
    }
  }, [])

  useEffect(() => {
    setEngineEnabled(settings.engineEnabled ?? true)
    setCountryCode(settings.countryCode || "+1")
    setMockEnabled(settings.mockEnabled ?? true)
    setMinCallDelay(settings.minCallDelay ?? 8)
    setMaxCallDelay(settings.maxCallDelay ?? 45)
    setMinCallDuration(settings.minCallDuration ?? 120)
    setMaxCallDuration(settings.maxCallDuration ?? 7200)
    setCallsPerInterval(settings.callsPerInterval ?? 1)
  }, [settings])

  // Real Save Settings Handler
  const handleSave = async () => {
    const updatedSettings: PbxSettings = {
      ...settings,
      engineEnabled,
      countryCode,
      mockEnabled,
      minCallDelay: Number(minCallDelay),
      maxCallDelay: Number(maxCallDelay),
      minCallDuration: Number(minCallDuration),
      maxCallDuration: Number(maxCallDuration),
      callsPerInterval: Number(callsPerInterval),
    }

    setSaveStatus({ status: "saving", message: "Saving settings..." })
    onSettingsChange(updatedSettings)

    const dbRes = await saveSettingsToDb(updatedSettings)
    if (dbRes.success) {
      if (HAS_SUPABASE && tableStates.settings.exists) {
        setSaveStatus({ status: "saved", message: "Settings saved and synced to Supabase database!" })
      } else {
        setSaveStatus({ status: "saved", message: "Settings saved locally (Supabase table 'pbx_settings' not created yet)." })
      }
    } else {
      setSaveStatus({ status: "error", message: `Saved locally. Supabase error: ${dbRes.error || "Failed to save"}` })
    }

    setTimeout(() => {
      setSaveStatus(prev => prev.status === "saved" ? { status: "idle", message: "" } : prev)
    }, 4000)
  }

  // Real Sync Database Handler
  const handleRealSync = async () => {
    if (!HAS_SUPABASE) {
      setSyncStatus({ status: "error", message: "Supabase credentials not configured in .env.local" })
      return
    }

    setSyncStatus({ status: "syncing", message: "Checking Supabase tables before syncing..." })

    // Check if tables exist
    const [resSettings, resAgents, resCalls] = await Promise.all([
      supabase.from("pbx_settings").select("id").limit(1),
      supabase.from("pbx_agents").select("id").limit(1),
      supabase.from("pbx_calls").select("id").limit(1),
    ])

    const firstErr = resSettings.error || resAgents.error || resCalls.error
    if (firstErr) {
      console.error("[SettingsPage] Pre-sync table check failed:", firstErr)
      setSyncStatus({
        status: "error",
        message: `Database pre-check failed (${firstErr.code || "Network/CORS"}): ${firstErr.message}`
      })
      await checkDatabaseTables()
      return
    }

    setSyncStatus({ status: "syncing", message: "Syncing settings, agents, and calls to Supabase..." })

    try {
      const sResult = await saveSettingsToDb(settings)
      if (!sResult.success) {
        setSyncStatus({ status: "error", message: "Failed to sync settings: " + sResult.error })
        return
      }

      const aResult = await saveAllAgentsToDb(agents)
      if (!aResult.success) {
        setSyncStatus({ status: "error", message: "Failed to sync agents: " + aResult.error })
        return
      }

      const cResult = await syncCallsToDb(calls, { forceAll: true })
      if (!cResult.success) {
        setSyncStatus({ status: "error", message: "Failed to sync calls: " + cResult.error })
        return
      }

      await checkDatabaseTables()
      setSyncStatus({
        status: "success",
        message: `Sync successful! Saved PBX settings, ${agents.length} agents, and ${calls.length} calls to Supabase database.`
      })
    } catch (err: any) {
      setSyncStatus({ status: "error", message: "Sync failed: " + (err?.message || "Unknown error") })
    }
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 3000)
  }

  const allTablesReady = tableStates.settings.exists && tableStates.agents.exists && tableStates.calls.exists

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
        </div>
      </header>
      
      <div className="page-content" style={{ maxWidth: 840 }}>
        
        {/* Engine Settings */}
        <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 24 }}>
            <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Activity size={20} /> Call Engine Settings</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Enable Auto Incoming Calls</label>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
                <input type="checkbox" checked={mockEnabled} onChange={(e) => setMockEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: mockEnabled ? "var(--primary)" : "var(--border)", transition: ".4s", borderRadius: 24 }}>
                  <span style={{ position: "absolute", content: '""', height: 18, width: 18, left: mockEnabled ? 22 : 3, bottom: 3, backgroundColor: "white", transition: ".4s", borderRadius: "50%" }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Default Country Code</label>
                <input 
                  type="text" 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)} 
                  className="input" 
                  placeholder="+1"
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }} 
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Calls Per Batch Interval</label>
                <input 
                  type="number" 
                  value={callsPerInterval} 
                  onChange={(e) => setCallsPerInterval(Number(e.target.value))} 
                  className="input" 
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }} 
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Min Call Delay (seconds)</label>
                <input 
                  type="number" 
                  value={minCallDelay} 
                  onChange={(e) => setMinCallDelay(Number(e.target.value))} 
                  className="input" 
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }} 
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Max Call Delay (seconds)</label>
                <input 
                  type="number" 
                  value={maxCallDelay} 
                  onChange={(e) => setMaxCallDelay(Number(e.target.value))} 
                  className="input" 
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }} 
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Min Call Duration (seconds)</label>
                <input 
                  type="number" 
                  value={minCallDuration} 
                  onChange={(e) => setMinCallDuration(Number(e.target.value))} 
                  className="input" 
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }} 
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Max Call Duration (seconds)</label>
                <input 
                  type="number" 
                  value={maxCallDuration} 
                  onChange={(e) => setMaxCallDuration(Number(e.target.value))} 
                  className="input" 
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }} 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Save Settings Button */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={saveStatus.status === "saving"}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 24px", background: "var(--primary)", color: "var(--primary-text)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 500 }}
          >
            <Save size={16} /> {saveStatus.status === "saving" ? "Saving..." : "Save Settings"}
          </button>
          {saveStatus.message && (
            <span style={{ 
              color: saveStatus.status === "saved" ? "var(--success-text)" : saveStatus.status === "error" ? "var(--danger-text)" : "var(--muted)", 
              fontSize: 14 
            }}>
              {saveStatus.message}
            </span>
          )}
        </div>

        {/* REAL DATABASE & STORAGE PANEL */}
        <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
            <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Database size={20} /> Supabase PostgreSQL Database
            </h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
              Live connection status to your Supabase project (<code>{projectRef || "none"}</code>). Client-side credentials require the database tables to be initialized once via the Supabase SQL editor.
            </p>

            {/* Live Connection Banner */}
            <div style={{ 
              background: dbStatus === "connected" ? "rgba(16, 185, 129, 0.08)" : dbStatus === "tables_missing" ? "rgba(245, 158, 11, 0.08)" : "var(--surface)", 
              border: `1px solid ${dbStatus === "connected" ? "var(--success)" : dbStatus === "tables_missing" ? "rgba(245, 158, 11, 0.4)" : "var(--border)"}`, 
              borderRadius: "var(--radius)", 
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {dbStatus === "connected" ? (
                  <CheckCircle2 size={22} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                ) : dbStatus === "tables_missing" ? (
                  <AlertTriangle size={22} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
                ) : dbStatus === "checking" ? (
                  <RefreshCw size={22} className="spin" style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
                ) : (
                  <XCircle size={22} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 2 }} />
                )}

                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                    {dbStatus === "connected" && "Supabase Connected & All Tables Active"}
                    {dbStatus === "tables_missing" && "Supabase Connected, but Tables Not Created Yet"}
                    {dbStatus === "checking" && "Verifying Supabase Tables..."}
                    {dbStatus === "idle" && "No Supabase Credentials Found"}
                    {dbStatus === "error" && "Supabase Connection Notice"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                    {dbMessage}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn"
                  onClick={async () => {
                    setDbMessage("Running full CORS, Schema & Authorization diagnostics...")
                    const res = await diagnoseSupabaseAccess()
                    if (res.networkCors.ok && res.schema.ok && res.authorization.ok) {
                      setDbMessage("All Supabase checks passed! CORS, schema, and RLS write permissions are active.")
                    } else {
                      setDbMessage(`Audit failed: ${res.networkCors.error || res.schema.error || res.authorization.error || "Check browser console"}`)
                    }
                  }}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6, 
                    padding: "8px 14px", 
                    background: "var(--surface-raised)", 
                    border: "1px solid var(--border)", 
                    color: "var(--text)", 
                    cursor: "pointer",
                    borderRadius: "var(--radius)",
                    fontSize: 13
                  }}
                >
                  <Activity size={14} /> Audit Connection
                </button>
                <button
                  className="btn"
                  onClick={checkDatabaseTables}
                  disabled={dbStatus === "checking"}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8, 
                    padding: "8px 14px", 
                    background: "var(--surface-raised)", 
                    border: "1px solid var(--border)", 
                    color: "var(--text)", 
                    cursor: "pointer",
                    borderRadius: "var(--radius)",
                    fontSize: 13
                  }}
                >
                  <RefreshCw size={14} className={dbStatus === "checking" ? "spin" : ""} /> Verify Tables
                </button>
              </div>
            </div>

            {/* REAL SCHEMA TABLE STATUS GRID */}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Table size={15} /> Real Database Tables Status in Supabase Schema <code>public</code>:
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                
                {/* Table: pbx_settings */}
                <div style={{ 
                  background: "var(--surface-raised)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius)", 
                  padding: "12px 14px" 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>public.pbx_settings</span>
                    {tableStates.settings.exists === true ? (
                      <span style={{ color: "var(--success)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={13} /> Active
                      </span>
                    ) : tableStates.settings.exists === false ? (
                      <span style={{ color: "var(--danger)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <XCircle size={13} /> Missing
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>Checking...</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {tableStates.settings.exists 
                      ? `${tableStates.settings.count} row stored` 
                      : "Table not found in Supabase"}
                  </div>
                </div>

                {/* Table: pbx_agents */}
                <div style={{ 
                  background: "var(--surface-raised)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius)", 
                  padding: "12px 14px" 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>public.pbx_agents</span>
                    {tableStates.agents.exists === true ? (
                      <span style={{ color: "var(--success)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={13} /> Active
                      </span>
                    ) : tableStates.agents.exists === false ? (
                      <span style={{ color: "var(--danger)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <XCircle size={13} /> Missing
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>Checking...</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {tableStates.agents.exists 
                      ? `${tableStates.agents.count} agents stored` 
                      : "Table not found in Supabase"}
                  </div>
                </div>

                {/* Table: pbx_calls */}
                <div style={{ 
                  background: "var(--surface-raised)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius)", 
                  padding: "12px 14px" 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>public.pbx_calls</span>
                    {tableStates.calls.exists === true ? (
                      <span style={{ color: "var(--success)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={13} /> Active
                      </span>
                    ) : tableStates.calls.exists === false ? (
                      <span style={{ color: "var(--danger)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <XCircle size={13} /> Missing
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>Checking...</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {tableStates.calls.exists 
                      ? `${tableStates.calls.count} calls stored` 
                      : "Table not found in Supabase"}
                  </div>
                </div>

              </div>
            </div>

            {/* ACTION & GUIDANCE BOX: If tables missing, show clear instructions */}
            {!allTablesReady && (
              <div style={{ 
                background: "var(--surface-raised)", 
                border: "1px solid #f59e0b", 
                borderRadius: "var(--radius)", 
                padding: "18px",
                marginTop: 8
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f59e0b", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                  <AlertTriangle size={18} /> How to Create the Database Tables in 30 Seconds:
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px 0", lineHeight: 1.5 }}>
                  Because client-side keys cannot execute <code>CREATE TABLE</code> statements directly over the web, PostgreSQL schemas in Supabase must be executed once through your project's SQL editor:
                </p>

                <ol style={{ fontSize: 13, color: "var(--text)", paddingLeft: 20, margin: "0 0 16px 0", lineHeight: 1.8 }}>
                  <li>Click <strong>"Copy SQL Schema"</strong> below to copy the full database migration script.</li>
                  <li>Open your <strong>Supabase Dashboard</strong> and click the <strong>SQL Editor</strong> (the <code>&gt;_</code> icon on the left menu).</li>
                  <li>Click <strong>"New Query"</strong>, paste the copied SQL, and click <strong>"Run"</strong>.</li>
                  <li>Come back here and click <strong>"Verify Tables"</strong> — all tables will turn green!</li>
                </ol>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button 
                    className="btn" 
                    onClick={handleCopySql}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 8, 
                      padding: "8px 16px", 
                      background: copiedSql ? "var(--success)" : "var(--primary)", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "var(--radius)", 
                      cursor: "pointer",
                      fontWeight: 500,
                      fontSize: 13
                    }}
                  >
                    {copiedSql ? <Check size={16} /> : <Copy size={16} />}
                    {copiedSql ? "Copied SQL to Clipboard!" : "Copy SQL Schema"}
                  </button>

                  <a 
                    href={sqlEditorUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 8, 
                      padding: "8px 16px", 
                      background: "var(--surface)", 
                      border: "1px solid var(--border)", 
                      color: "var(--text)", 
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 500
                    }}
                  >
                    <ExternalLink size={15} /> Open Supabase SQL Editor
                  </a>

                  <button
                    className="btn"
                    onClick={() => setShowSqlViewer(!showSqlViewer)}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 6, 
                      padding: "8px 14px", 
                      background: "transparent", 
                      border: "1px solid var(--border)", 
                      color: "var(--muted)", 
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    <Code2 size={15} /> {showSqlViewer ? "Hide SQL" : "View SQL Script"}
                  </button>
                </div>

                {/* Collapsible SQL Script Preview */}
                {showSqlViewer && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>SQL Migration Script (supabase_full_schema.sql):</span>
                    </div>
                    <pre style={{ 
                      background: "var(--surface)", 
                      border: "1px solid var(--border)", 
                      borderRadius: "var(--radius)", 
                      padding: "12px", 
                      fontSize: 12, 
                      maxHeight: 220, 
                      overflowY: "auto", 
                      color: "var(--text)" 
                    }}>
                      <code>{SQL_MIGRATION_SCRIPT}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* REAL SYNC SECTION */}
            <div style={{ 
              borderTop: "1px solid var(--border)", 
              paddingTop: 16, 
              display: "flex", 
              alignItems: "center", 
              gap: 12, 
              flexWrap: "wrap" 
            }}>
              <button 
                className="btn" 
                onClick={handleRealSync}
                disabled={syncStatus.status === "syncing"}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  padding: "8px 18px", 
                  background: allTablesReady ? "var(--primary)" : "var(--surface-raised)", 
                  color: allTablesReady ? "white" : "var(--text)", 
                  border: "1px solid var(--border)", 
                  cursor: "pointer",
                  borderRadius: "var(--radius)",
                  fontWeight: 500,
                  fontSize: 13
                }}
              >
                <RefreshCw size={14} className={syncStatus.status === "syncing" ? "spin" : ""} /> 
                {syncStatus.status === "syncing" ? "Syncing..." : "Sync Database Now"}
              </button>

              {syncStatus.message && (
                <span style={{ 
                  color: syncStatus.status === "success" ? "var(--success-text)" : syncStatus.status === "error" ? "var(--danger-text)" : "var(--info-text)", 
                  fontSize: 13,
                  fontWeight: 400
                }}>
                  {syncStatus.message}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Danger Zone */}
        <div className="panel" style={{ padding: 24, marginBottom: 24, border: "1px solid var(--danger-border)" }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 24 }}>
            <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--danger-text)" }}><Trash2 size={20} /> Danger Zone</h2>
          </div>
          <div>
            <p style={{ color: "var(--muted)", marginBottom: 16, fontSize: 14 }}>
              Clear all PBX call history, active calls, and data to start completely fresh. This action cannot be undone.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!confirmClear ? (
                <button className="btn btn-danger" onClick={() => setConfirmClear(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px" }}>
                  <Trash2 size={16} /> Clear All Call Data
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--danger-text)", fontSize: 14, fontWeight: 500 }}>Are you sure?</span>
                  <button className="btn btn-danger" onClick={() => { 
                    onClearData(); 
                    clearAllCallsInDb();
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
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
