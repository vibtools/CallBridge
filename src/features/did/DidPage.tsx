import { Hash } from "lucide-react"

export function DidPage({ dids }: { dids: { id: string; number: string; active: boolean; label?: string }[] }) {
  return <section className="page">
    <div className="page-header">
      <div>
        <h1 className="page-title">DID Numbers</h1>
      </div>
    </div>
    
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Available Numbers</div>
        </div>
      </div>
      
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Number</th>
              <th style={{ width: "50%" }}>Label</th>
              <th className="col-actions">Status</th>
            </tr>
          </thead>
          <tbody>
            {dids.length > 0 ? dids.map((did) => (
              <tr key={did.id}>
                <td className="mono cell-nowrap">{did.number}</td>
                <td className="cell-truncate">{did.label ?? "—"}</td>
                <td className="col-actions">
                  <span className={`badge ${did.active ? "available" : "offline"}`}>
                    {did.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
                  No DID numbers found. Add them in Settings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </section>
}
