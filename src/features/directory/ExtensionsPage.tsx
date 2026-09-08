import { Search, Plus, MoreHorizontal } from "lucide-react"

const mockExtensions = [
  { ext: "101", name: "Alice Smith", status: "online", device: "SIP/101", forwarding: "None" },
  { ext: "102", name: "Bob Johnson", status: "offline", device: "SIP/102", forwarding: "Mobile" },
  { ext: "103", name: "Charlie Davis", status: "online", device: "SIP/103", forwarding: "None" },
  { ext: "104", name: "Diana Prince", status: "online", device: "SIP/104", forwarding: "Voicemail" },
  { ext: "105", name: "Evan Wright", status: "offline", device: "SIP/105", forwarding: "None" }
]

export function ExtensionsPage() {
  return (
    <main className="page">
      <header className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Extensions</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search extensions..." />
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
                <th style={{ width: "10%" }}>Ext</th>
                <th style={{ width: "35%" }}>Name</th>
                <th style={{ width: "25%" }}>Device Status</th>
                <th style={{ width: "30%" }}>Forwarding Rule</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockExtensions.map((e) => (
                <tr key={e.ext}>
                  <td className="mono" style={{ fontWeight: 400 }}>{e.ext}</td>
                  <td>{e.name}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.status === "online" ? "var(--success-dot)" : "var(--danger-dot)" }}></span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{e.device}</span>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 11, color: "var(--muted)" }}>{e.forwarding}</span></td>
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
