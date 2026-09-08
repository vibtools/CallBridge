import { useState } from "react"
import { Activity, Headphones, History, PhoneIncoming, Radio, Settings, Users, ChevronDown, ChevronRight, SlidersHorizontal, UserCog, Phone, Hash, Voicemail, Share2, CornerDownRight, Network, PhoneCall, BookUser, BarChart3 } from "lucide-react"
import type { AppPage } from "@/types/pbx"

export function Sidebar({ page, onChange, liveCount, incomingCount }: { page: AppPage; onChange: (page: AppPage) => void; liveCount: number; incomingCount: number }) {
  const [settingsOpen, setSettingsOpen] = useState(page.startsWith("settings"))
  const countFor = (id: AppPage) => id === "live" ? liveCount : id === "incoming" ? incomingCount : 0
  
  const NavItem = ({ id, label, icon: Icon }: { id: AppPage; label: string; icon: any }) => {
    const count = countFor(id)
    return (
      <button className={`nav-item ${page === id ? "active" : ""}`} onClick={() => onChange(id)}>
        <Icon size={18} />
        <span className="nav-label">{label}</span>
        {count > 0 && <span className={`nav-count ${id === "incoming" ? "incoming" : "live"}`}>{count > 99 ? "99+" : count}</span>}
      </button>
    )
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-fallback">CP</span>
          <img className="brand-logo" src="/brand/logos/icon.png" alt="" onError={(event) => { event.currentTarget.style.display = "none" }} />
        </div>
        <div className="brand-copy">
          <div className="brand-title">Cloud PBX Phone</div>
        </div>
      </div>
      
      <div className="sidebar-content" style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
        <div className="nav-section-label">Operations</div>
        <nav className="nav-list">
          <NavItem id="overview" label="Overview" icon={Activity} />
          <NavItem id="live" label="Live Calls" icon={Radio} />
          <NavItem id="incoming" label="Incoming Calls" icon={PhoneIncoming} />
          <NavItem id="cdr" label="Call History" icon={History} />
          <NavItem id="voicemail" label="Voicemail" icon={Voicemail} />
        </nav>

        <div className="nav-section-label" style={{ marginTop: 16 }}>Routing & Queues</div>
        <nav className="nav-list">
          <NavItem id="queues" label="Queues" icon={Headphones} />
          <NavItem id="ring-groups" label="Ring Groups" icon={Share2} />
          <NavItem id="ivr" label="IVR / Auto Attendant" icon={Network} />
        </nav>

        <div className="nav-section-label" style={{ marginTop: 16 }}>Directory</div>
        <nav className="nav-list">
          <NavItem id="agents" label="Agents" icon={Users} />
          <NavItem id="extensions" label="Extensions" icon={PhoneCall} />
          <NavItem id="phonebook" label="Phonebook" icon={BookUser} />
        </nav>

        <div className="nav-section-label" style={{ marginTop: 16 }}>System & Admin</div>
        <nav className="nav-list">
          <NavItem id="did" label="DID Numbers" icon={Hash} />
          <NavItem id="analytics" label="Analytics/Reports" icon={BarChart3} />
          
          <button className={`nav-item ${page.startsWith("settings") ? "active" : ""}`} onClick={() => setSettingsOpen(!settingsOpen)} style={{ marginTop: 4 }}>
            <Settings size={18} />
            <span className="nav-label" style={{ flex: 1, textAlign: "left" }}>Settings</span>
            {settingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {settingsOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2, paddingLeft: 12 }}>
              <button className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => onChange("settings")}>
                <SlidersHorizontal size={18} />
                <span className="nav-label">General</span>
              </button>
              <button className={`nav-item ${page === "settings-agents" ? "active" : ""}`} onClick={() => onChange("settings-agents")}>
                <UserCog size={18} />
                <span className="nav-label">Agent Settings</span>
              </button>
              <button className={`nav-item ${page === "settings-did" ? "active" : ""}`} onClick={() => onChange("settings-did")}>
                <Phone size={18} />
                <span className="nav-label">DID Settings</span>
              </button>
              <button className={`nav-item ${page === "settings-queues" ? "active" : ""}`} onClick={() => onChange("settings-queues")}>
                <Headphones size={18} />
                <span className="nav-label">Queue Settings</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      <div className="sidebar-footer"><span className="status-dot" /><span className="sidebar-footer-label">PBX Service Ready</span></div>
    </aside>
  )
}
