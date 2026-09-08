import { Search, Plus, MoreHorizontal } from "lucide-react"

const mockIvrs = [
  { id: "ivr-1", name: "Main Menu", audio: "greeting_main.wav", mapping: "1 -> Sales, 2 -> Support, 0 -> Operator", timeoutAction: "Operator" },
  { id: "ivr-2", name: "After Hours", audio: "after_hours.wav", mapping: "1 -> Emergency, 2 -> Voicemail", timeoutAction: "Voicemail" }
]

export function IvrPage() {
  return (
    <main className="page">
      <header className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">IVR / Auto Attendant</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search menus..." />
          </div>
          <button className="btn btn-primary" style={{ padding: "0 12px", height: 32, fontSize: 13, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} /> Add
          </button>
        </div>
      </header>

      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>IVR Name</th>
                <th style={{ width: "25%" }}>Audio Prompt</th>
                <th style={{ width: "25%" }}>Keypress Mapping</th>
                <th style={{ width: "25%" }}>Timeout Action</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockIvrs.map((ivr) => (
                <tr key={ivr.id}>
                  <td style={{ fontWeight: 400 }}>{ivr.name}</td>
                  <td className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{ivr.audio}</td>
                  <td><span style={{ fontSize: 11, color: "var(--text)" }}>{ivr.mapping}</span></td>
                  <td><span style={{ fontSize: 11, color: "var(--muted)" }}>{ivr.timeoutAction}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><MoreHorizontal size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
