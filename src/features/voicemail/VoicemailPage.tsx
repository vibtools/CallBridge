import { Search, Play, Download, Trash2 } from "lucide-react"

const mockVoicemails = [
  { id: "vm-1", date: "2026-09-07 09:12:44", callerId: "+1 (555) 123-4567", duration: "00:01:24" },
  { id: "vm-2", date: "2026-09-07 10:04:11", callerId: "Anonymous", duration: "00:00:32" },
  { id: "vm-3", date: "2026-09-06 16:45:00", callerId: "+1 (415) 987-6543", duration: "00:02:10" }
]

export function VoicemailPage() {
  return (
    <main className="page">
      <header className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Voicemail</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search caller..." />
          </div>
        </div>
      </header>

      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Date/Time</th>
                <th style={{ width: "50%" }}>Caller ID</th>
                <th style={{ width: "25%" }}>Duration</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockVoicemails.map((vm) => (
                <tr key={vm.id}>
                  <td className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{vm.date}</td>
                  <td style={{ fontWeight: 400 }}>{vm.callerId}</td>
                  <td className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{vm.duration}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button style={{ padding: 4, background: "transparent", border: "none", color: "var(--primary)", cursor: "pointer" }} title="Play"><Play size={14} /></button>
                      <button style={{ padding: 4, background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }} title="Download"><Download size={14} /></button>
                      <button style={{ padding: 4, background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }} title="Delete"><Trash2 size={14} /></button>
                    </div>
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
