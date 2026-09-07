import type { LucideIcon } from "lucide-react"

type StatTone = "primary" | "info" | "warning" | "success" | "danger"

export function StatCard({ label, value, icon: Icon, tone = "primary" }: { label: string; value: string | number; icon: LucideIcon; tone?: StatTone }) {
  return <div className={`stat-card tone-${tone}`}>
    <div className="stat-top"><span className="stat-label">{label}</span><span className="stat-icon"><Icon /></span></div>
    <div className="stat-value mono">{value}</div>
  </div>
}
