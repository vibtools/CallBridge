import type { ReactNode } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import type { AppTheme } from "@/types/theme"
import type { AppPage } from "@/types/pbx"

const titles: Record<AppPage, string> = { overview: "Overview", live: "Live Calls", incoming: "Incoming Calls", cdr: "Call History / CDR", queues: "Queues", agents: "Agents" }

export function AppShell({ page, onPageChange, theme, onThemeToggle, liveCount, incomingCount, notificationCount, children }: { page: AppPage; onPageChange: (page: AppPage) => void; theme: AppTheme; onThemeToggle: () => void; liveCount: number; incomingCount: number; notificationCount: number; children: ReactNode }) {
  return <div className="app-shell"><Sidebar page={page} onChange={onPageChange} liveCount={liveCount} incomingCount={incomingCount} /><main className="app-main"><Topbar title={titles[page]} theme={theme} onThemeToggle={onThemeToggle} notificationCount={notificationCount} /><div className="page-scroll">{children}</div></main></div>
}
