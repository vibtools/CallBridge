import { useState, useEffect } from "react"
import { Globe, Save, Settings2, Activity } from "lucide-react"
import type { PbxSettings } from "@/runtime/pbxRuntime"

import { Trash2 } from "lucide-react"
export function SettingsPage({ settings, onSettingsChange, onClearData }: { settings: PbxSettings, onSettingsChange: (settings: PbxSettings) => void, onClearData: () => void }) {
  const [engineEnabled, setEngineEnabled] = useState(settings.engineEnabled ?? true)
  const [countryCode, setCountryCode] = useState(settings.countryCode || "+1")
  const [mockEnabled, setMockEnabled] = useState(settings.mockEnabled ?? true)
  const [minCallDelay, setMinCallDelay] = useState(settings.minCallDelay ?? 8)
  const [maxCallDelay, setMaxCallDelay] = useState(settings.maxCallDelay ?? 45)
  const [minCallDuration, setMinCallDuration] = useState(settings.minCallDuration ?? 120)
  const [maxCallDuration, setMaxCallDuration] = useState(settings.maxCallDuration ?? 7200)
  const [callsPerInterval, setCallsPerInterval] = useState(settings.callsPerInterval ?? 1)
  const [saved, setSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearedMessage, setClearedMessage] = useState(false)

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

  const handleSave = () => {
    onSettingsChange({
      ...settings,
      engineEnabled,
      countryCode,
      mockEnabled,
      minCallDelay: Number(minCallDelay),
      maxCallDelay: Number(maxCallDelay),
      minCallDuration: Number(minCallDuration),
      maxCallDuration: Number(maxCallDuration),
      callsPerInterval: Number(callsPerInterval),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
        </div>
      </header>
      
      <div className="page-content" style={{ maxWidth: 800 }}>
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

            <div>
              <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Default Caller Country Code</label>
              <select 
                className="select" 
                value={countryCode} 
                onChange={(e) => setCountryCode(e.target.value)}
                style={{ width: "100%", maxWidth: 300, padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
              >
                <option value="+1">US / Canada (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+61">Australia (+61)</option>
                <option value="+880">Bangladesh (+880)</option>
                <option value="+91">India (+91)</option>
                <option value="+49">Germany (+49)</option>
                <option value="+33">France (+33)</option>
                <option value="+81">Japan (+81)</option>
                <option value="+55">Brazil (+55)</option>
                <option value="+27">South Africa (+27)</option>
                <option value="+971">UAE (+971)</option>
                <option value="+65">Singapore (+65)</option>
                <option value="+34">Spain (+34)</option>
                <option value="+39">Italy (+39)</option>
                <option value="+52">Mexico (+52)</option>
                <option value="+86">China (+86)</option>
                <option value="+7">Russia (+7)</option>
                <option value="+92">Pakistan (+92)</option>
                <option value="+62">Indonesia (+62)</option>
                <option value="+90">Turkey (+90)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Minimum Delay (minutes)</label>
                <input 
                  type="number" 
                  value={Number((minCallDelay / 60).toFixed(2))} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setMinCallDelay(Math.round(val * 60));
                  }}
                  min={0.1}
                  step={0.1}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Maximum Delay (minutes)</label>
                <input 
                  type="number" 
                  value={Number((maxCallDelay / 60).toFixed(2))} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setMaxCallDelay(Math.round(val * 60));
                  }}
                  min={Number((minCallDelay / 60).toFixed(2))}
                  step={0.1}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Min Call Duration (sec)</label>
                <input 
                  type="number" 
                  value={minCallDuration} 
                  onChange={(e) => setMinCallDuration(parseInt(e.target.value, 10))}
                  min={1}
                  max={maxCallDuration}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Max Call Duration (sec)</label>
                <input 
                  type="number" 
                  value={maxCallDuration} 
                  onChange={(e) => setMaxCallDuration(parseInt(e.target.value, 10))}
                  min={minCallDuration}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 14 }}>Simultaneous Calls (Burst Load)</label>
              <input 
                type="number" 
                value={callsPerInterval} 
                onChange={(e) => setCallsPerInterval(parseInt(e.target.value, 10))}
                min={1}
                max={50}
                style={{ width: "100%", maxWidth: 300, padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
              />
            </div>

          </div>
        </div>

        
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 24px", background: "var(--primary)", color: "var(--primary-text)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 400 }}>
            <Save size={16} /> Save Settings
          </button>
          {saved && <span style={{ color: "var(--success-text)", fontSize: 14, fontWeight: 400 }}>Settings saved and synced to database!</span>}
        </div>

        <div className="panel" style={{ padding: 24, marginBottom: 24, marginTop: 24, border: "1px solid var(--danger-border)" }}>
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

