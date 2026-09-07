import { Activity, Headphones, History, PhoneIncoming, Radio, Settings, Users } from "lucide-react"
import type { AppPage } from "@/types/pbx"

const nav: { id: AppPage; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "live", label: "Live Calls", icon: Radio },
  { id: "incoming", label: "Incoming Calls", icon: PhoneIncoming },
  { id: "cdr", label: "Call History", icon: History },
  { id: "queues", label: "Queues", icon: Headphones },
  { id: "agents", label: "Agents", icon: Users },
]

export function Sidebar({ page, onChange, liveCount, incomingCount }: { page: AppPage; onChange: (page: AppPage) => void; liveCount: number; incomingCount: number }) {
  const countFor = (id: AppPage) => id === "live" ? liveCount : id === "incoming" ? incomingCount : 0
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark" aria-hidden="true"><span className="brand-fallback">CP</span><img className="brand-logo" src="/brand/logos/icon.png" alt="" onError={(event) => { event.currentTarget.style.display = "none" }} /></div><div className="brand-copy"><div className="brand-title">Cloud PBX Phone</div></div></div>
    <div className="nav-section-label">Operations</div>
    <nav className="nav-list">{nav.map(({ id, label, icon: Icon }) => {
      const count = countFor(id)
      return <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => onChange(id)}><Icon /><span className="nav-label">{label}</span>{count > 0 && <span className={`nav-count ${id === "incoming" ? "incoming" : "live"}`}>{count > 99 ? "99+" : count}</span>}</button>
    })}</nav>
    <div className="nav-section-label" style={{ marginTop: 8 }}>System</div>
    <div className="nav-list"><button className="nav-item"><Settings /><span className="nav-label">Settings</span></button></div>
    <div className="sidebar-footer"><span className="status-dot" /><span className="sidebar-footer-label">PBX Service Ready</span></div>
  </aside>
}
