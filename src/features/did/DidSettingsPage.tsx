import { useState } from "react"
import { Phone, Plus, Save, Trash2, Edit } from "lucide-react"

export function DidSettingsPage({ dids, onUpdate }: { dids: { id: string; number: string; active: boolean; label?: string }[], onUpdate: (dids: any[]) => void }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [number, setNumber] = useState("")
  const [label, setLabel] = useState("")
  const [active, setActive] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleEdit = (did: any) => {
    setEditing(did.id)
    setNumber(did.number)
    setLabel(did.label || "")
    setActive(did.active)
  }

  const handleSave = () => {
    if (!number.trim()) return

    let newDids = [...dids]
    if (editing) {
      newDids = newDids.map(d => d.id === editing ? { ...d, number, label, active } : d)
    } else {
      newDids.push({ id: `did-${Date.now()}`, number, label, active })
    }
    
    onUpdate(newDids)
    setEditing(null)
    setNumber("")
    setLabel("")
    setActive(true)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = (id: string) => {
    onUpdate(dids.filter(d => d.id !== id))
  }

  const handleToggleActive = (id: string) => {
    onUpdate(dids.map(d => d.id === id ? { ...d, active: !d.active } : d))
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">DID Settings</h1>
        </div>
      </header>

      <div className="page-content" style={{ maxWidth: 800 }}>
        
        <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 24 }}>
            <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={20} /> {editing ? "Edit DID Number" : "Add DID Number"}</h2>
          </div>
          
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 13 }}>Phone Number</label>
              <input 
                type="text" 
                value={number} 
                onChange={(e) => setNumber(e.target.value)}
                placeholder="+1 800 555 0000"
                style={{ width: "100%", padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 13 }}>Label / Name</label>
              <input 
                type="text" 
                value={label} 
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Sales Hotline"
                style={{ width: "100%", padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
              />
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 13, cursor: "pointer", height: 36 }}>
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Active
              </label>
            </div>
            <button className="btn btn-primary" onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 24px", background: "var(--primary)", color: "var(--primary-text)", border: "none", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 400, height: 36 }}>
              {editing ? <Save size={16} /> : <Plus size={16} />} 
              {editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button className="btn" onClick={() => { setEditing(null); setNumber(""); setLabel(""); setActive(true); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "var(--surface-raised)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 400, height: 36 }}>
                Cancel
              </button>
            )}
          </div>
          {saved && <div style={{ color: "var(--success-text)", fontSize: 13, marginTop: 12, fontWeight: 400 }}>Saved successfully!</div>}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Managed DID Numbers</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Label</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dids.length > 0 ? dids.map((did) => (
                  <tr key={did.id}>
                    <td className="mono">{did.number}</td>
                    <td>{did.label ?? "—"}</td>
                    <td>
                      <span className={`badge ${did.active ? "available" : "offline"}`}>
                        {did.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => handleToggleActive(did.id)} style={{ padding: "4px 8px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>
                          {did.active ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => handleEdit(did)} style={{ padding: 4, background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(did.id)} style={{ padding: 4, background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
                      No DID numbers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}
