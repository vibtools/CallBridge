import { Bell, CircleUserRound, Moon, Radio, Sun } from "lucide-react"
import type { AppTheme } from "@/types/theme"

export function Topbar({ title, theme, onThemeToggle, notificationCount }: { title: string; theme: AppTheme; onThemeToggle: () => void; notificationCount: number }) {
  const nextTheme = theme === "dark" ? "light" : "dark"
  return <header className="topbar"><div className="topbar-left"><div className="topbar-title">{title}</div><span className="system-pill"><span className="status-dot" />System online</span></div><div className="topbar-right"><span className="system-pill"><Radio size={12} />Voice service</span><button className="icon-btn" onClick={onThemeToggle} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`}>{theme === "dark" ? <Sun /> : <Moon />}</button><button className="icon-btn notification-btn" aria-label={`Notifications (${notificationCount})`} title={`${notificationCount} notifications`}><Bell />{notificationCount > 0 && <span className="notification-count">{notificationCount > 99 ? "99+" : notificationCount}</span>}</button><button className="icon-btn" aria-label="User profile"><CircleUserRound /></button></div></header>
}
