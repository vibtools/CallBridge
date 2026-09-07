import type { LucideIcon } from "lucide-react"

type StatTone = "primary" | "info" | "warning" | "success" | "danger"

export function StatCard({ label, value, foot, icon: Icon, tone = "primary" }: { label: string; value: string | number; foot?: string; icon: LucideIcon; tone?: StatTone }) {
  return <div className={`stat-card tone-${tone}`}>
    <div className="stat-top"><span className="stat-label">{label}</span><span className="stat-icon"><Icon /></span></div>
    <div className="stat-value mono">{value}</div>
    {foot && <div className="stat-foot">{foot}</div>}
  </div>
}
