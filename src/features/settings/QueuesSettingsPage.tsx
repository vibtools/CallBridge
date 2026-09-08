import { useState } from "react"
import { Headphones, Plus, Save, Trash2, Edit } from "lucide-react"

export function QueuesSettingsPage({ queues, onUpdate }: { queues: { id: string; name: string; description: string; active: boolean }[], onUpdate: (newQueues: any[]) => void }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [active, setActive] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleEdit = (q: any) => {
    setEditing(q.id)
    setName(q.name)
    setDescription(q.description)
    setActive(q.active)
  }

  const handleSave = () => {
    if (!name.trim()) return

    let newList = [...queues]
    if (editing) {
      newList = newList.map(d => d.id === editing ? { ...d, name, description, active } : d)
    } else {
      newList.push({ id: `q-${Date.now()}`, name, description, active })
    }
    
    onUpdate(newList)
    setEditing(null)
    setName("")
    setDescription("")
    setActive(true)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = (id: string) => {
    onUpdate(queues.filter(d => d.id !== id))
  }

  const handleToggleActive = (id: string) => {
    onUpdate(queues.map(d => d.id === id ? { ...d, active: !d.active } : d))
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Queue Settings</h1>
        </div>
      </header>

      <div className="page-content" style={{ maxWidth: 800 }}>
        
        <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 24 }}>
            <h2 className="panel-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Headphones size={20} /> {editing ? "Edit Queue" : "Add Queue"}</h2>
          </div>
          
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 13 }}>Queue Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sales"
                style={{ width: "100%", padding: "8px 12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: "block", marginBottom: 8, color: "var(--text)", fontWeight: 400, fontSize: 13 }}>Description</label>
              <input 
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Sales and product questions"
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
              <button className="btn" onClick={() => { setEditing(null); setName(""); setDescription(""); setActive(true); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "var(--surface-raised)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 400, height: 36 }}>
                Cancel
              </button>
            )}
          </div>
          {saved && <div style={{ color: "var(--success-text)", fontSize: 13, marginTop: 12, fontWeight: 400 }}>Saved successfully!</div>}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Managed Queues</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Queue Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queues.length > 0 ? queues.map((q) => (
                  <tr key={q.id}>
                    <td><strong>{q.name}</strong></td>
                    <td>{q.description}</td>
                    <td>
                      <span className={`badge ${q.active ? "available" : "offline"}`}>
                        {q.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => handleToggleActive(q.id)} style={{ padding: "4px 8px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>
                          {q.active ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => handleEdit(q)} style={{ padding: 4, background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(q.id)} style={{ padding: 4, background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
                      No queues found. Add one above.
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
