import { Search, Plus, MoreHorizontal } from "lucide-react"

const mockContacts = [
  { id: "pb-1", name: "Acme Corp Main", phone: "+1 (800) 555-0199", company: "Acme Corp", speedDial: "*01" },
  { id: "pb-2", name: "Jane Doe", phone: "+1 (415) 555-0123", company: "Globex Inc.", speedDial: "*02" },
  { id: "pb-3", name: "Tech Support Hotline", phone: "+1 (888) 555-0100", company: "Initech", speedDial: "*03" }
]

export function PhonebookPage() {
  return (
    <main className="page">
      <header className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Phonebook</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search contacts..." />
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
                <th style={{ width: "30%" }}>Name</th>
                <th style={{ width: "25%" }}>Phone Number</th>
                <th style={{ width: "25%" }}>Company</th>
                <th style={{ width: "20%" }}>Speed Dial Code</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockContacts.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 400 }}>{c.name}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{c.phone}</td>
                  <td><span style={{ fontSize: 11, color: "var(--muted)" }}>{c.company}</span></td>
                  <td className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{c.speedDial}</td>
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
