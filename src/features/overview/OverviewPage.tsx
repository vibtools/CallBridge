import { Activity, Clock3, Headphones, Phone, PhoneIncoming, PhoneMissed, Users } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AgentRow } from "@/components/pbx/AgentRow"
import { QueueCard } from "@/components/pbx/QueueCard"
import { StatCard } from "@/components/pbx/StatCard"
import type { Agent, PbxCall, Queue } from "@/types/pbx"

export function OverviewPage({ calls, agents, queues }: { calls: PbxCall[]; agents: Agent[]; queues: Queue[] }) {
  // Calculate activity chart data based on actual calls
  const activityMap = new Map<string, { time: string, inbound: number, outbound: number }>()
  
  // Initialize buckets for the last 12 hours
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 60 * 60 * 1000).getHours().toString().padStart(2, '0')
    activityMap.set(h, { time: h, inbound: 0, outbound: 0 })
  }

  calls.forEach(call => {
    const h = new Date(call.startedAt).getHours().toString().padStart(2, '0')
    const bucket = activityMap.get(h)
    if (bucket) {
      if (call.direction === "inbound") bucket.inbound++
      if (call.direction === "outbound") bucket.outbound++
    }
  })
  
  const activity = Array.from(activityMap.values())

  const active = calls.filter((c) => ["connected", "hold", "ringing", "waiting"].includes(c.status)).length
  const incoming = calls.filter((c) => c.direction === "inbound" && ["ringing", "waiting"].includes(c.status)).length
  const missed = calls.filter((c) => c.status === "missed").length
  const available = agents.filter((a) => a.status === "available").length
  const waiting = queues.reduce((sum, q) => sum + q.waiting, 0)

  return <section className="page">
    <div className="page-header"><div><h1 className="page-title">PBX Operations Overview</h1></div><div className="page-actions"><span className="system-pill mono">18 Aug 2026 · 20:50 UTC</span></div></div>
    
    <div className="kpi-grid">
      <StatCard label="Today Total Call" value={calls.length} icon={Phone} tone="primary" />
      <StatCard label="Active Calls" value={active} icon={Activity} tone="primary" />
      <StatCard label="Incoming" value={incoming} icon={PhoneIncoming} tone="info" />
      <StatCard label="Queue Waiting" value={waiting} icon={Clock3} tone="warning" />
      <StatCard label="Available Agents" value={available} icon={Users} tone="success" />
      <StatCard label="Missed Today" value={missed} icon={PhoneMissed} tone="danger" />
    </div>

    <div className="panel-grid">
      <div className="panel" style={{ gridColumn: "span 8" }}><div className="panel-header"><div><div className="panel-title">Call Activity</div></div></div><div className="panel-body"><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activity} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}><defs><linearGradient id="inbound" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--info)" stopOpacity={0.26}/><stop offset="100%" stopColor="var(--info)" stopOpacity={0}/></linearGradient><linearGradient id="outbound" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--success)" stopOpacity={0.18}/><stop offset="100%" stopColor="var(--success)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="2 4" vertical={false}/><XAxis dataKey="time" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, color: "var(--text)" }}/><Area type="monotone" dataKey="inbound" stroke="var(--info)" fill="url(#inbound)" strokeWidth={1.6}/><Area type="monotone" dataKey="outbound" stroke="var(--success)" fill="url(#outbound)" strokeWidth={1.4}/></AreaChart></ResponsiveContainer></div></div></div>
      <div className="panel" style={{ gridColumn: "span 4" }}><div className="panel-header"><div><div className="panel-title">Queue Snapshot</div></div></div><div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>{queues.map((q) => <QueueCard key={q.id} queue={q} />)}</div></div>
    </div>

    <div className="panel"><div className="panel-header"><div><div className="panel-title">Agent Presence</div></div></div><div className="agent-list">{agents.slice(0,5).map((agent) => <AgentRow key={agent.id} agent={agent} />)}</div></div>
  </section>
}
