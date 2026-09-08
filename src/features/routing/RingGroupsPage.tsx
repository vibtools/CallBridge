import { Search, Plus, MoreHorizontal } from "lucide-react"

const mockRingGroups = [
  { id: "rg-1", name: "Support Tier 1", strategy: "Ring All", members: "101, 102, 103", noAnswer: "Voicemail (Support)" },
  { id: "rg-2", name: "Sales Team", strategy: "Hunt", members: "104, 105", noAnswer: "Extension 101" },
  { id: "rg-3", name: "Billing", strategy: "Ring All", members: "102, 104", noAnswer: "Hangup" }
]

export function RingGroupsPage() {
  return (
    <main className="page">
      <header className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Ring Groups</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search ring groups..." />
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
                <th style={{ width: "25%" }}>Group Name</th>
                <th style={{ width: "20%" }}>Strategy</th>
                <th style={{ width: "25%" }}>Members</th>
                <th style={{ width: "30%" }}>No-Answer Destination</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockRingGroups.map((rg) => (
                <tr key={rg.id}>
                  <td style={{ fontWeight: 400 }}>{rg.name}</td>
                  <td><span style={{ fontSize: 11, color: "var(--text)" }}>{rg.strategy}</span></td>
                  <td className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{rg.members}</td>
                  <td><span style={{ fontSize: 11, color: "var(--muted)" }}>{rg.noAnswer}</span></td>
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
