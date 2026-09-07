import { Activity, Clock3, Headphones, PhoneIncoming, PhoneMissed, Users } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AgentRow } from "@/components/pbx/AgentRow"
import { QueueCard } from "@/components/pbx/QueueCard"
import { StatCard } from "@/components/pbx/StatCard"
import type { Agent, PbxCall, Queue } from "@/types/pbx"

const activity = [
  { time: "08", inbound: 28, outbound: 12 }, { time: "10", inbound: 46, outbound: 22 },
  { time: "12", inbound: 38, outbound: 19 }, { time: "14", inbound: 62, outbound: 31 },
  { time: "16", inbound: 54, outbound: 27 }, { time: "18", inbound: 71, outbound: 34 },
  { time: "20", inbound: 49, outbound: 24 },
]

export function OverviewPage({ calls, agents, queues }: { calls: PbxCall[]; agents: Agent[]; queues: Queue[] }) {
  const active = calls.filter((c) => ["connected", "hold", "ringing", "waiting"].includes(c.status)).length
  const incoming = calls.filter((c) => c.direction === "inbound" && ["ringing", "waiting"].includes(c.status)).length
  const missed = calls.filter((c) => c.status === "missed").length
  const available = agents.filter((a) => a.status === "available").length
  const waiting = queues.reduce((sum, q) => sum + q.waiting, 0)

  return <section className="page">
    <div className="page-header"><div><h1 className="page-title">PBX Operations Overview</h1><p className="page-description">Live operational snapshot from the local UI simulation.</p></div><div className="page-actions"><span className="system-pill mono">18 Aug 2026 · 20:50 UTC</span></div></div>
    <div className="kpi-grid">
      <StatCard label="Active Calls" value={active} foot="Across all directions" icon={Activity} tone="primary" />
      <StatCard label="Incoming" value={incoming} foot="Ringing + waiting" icon={PhoneIncoming} tone="info" />
      <StatCard label="Queue Waiting" value={waiting} foot="All queues" icon={Clock3} tone="warning" />
      <StatCard label="Available Agents" value={available} foot={`${agents.length} total agents`} icon={Users} tone="success" />
      <StatCard label="Missed Today" value={missed + 26} foot="Mock daily aggregate" icon={PhoneMissed} tone="danger" />
      <StatCard label="Service Queues" value={queues.length} foot="Support · Sales · Billing" icon={Headphones} tone="primary" />
    </div>

    <div className="panel-grid">
      <div className="panel" style={{ gridColumn: "span 8" }}><div className="panel-header"><div><div className="panel-title">Call Activity</div><div className="panel-subtitle">Inbound and outbound volume</div></div></div><div className="panel-body"><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={activity} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}><defs><linearGradient id="inbound" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--info)" stopOpacity={0.26}/><stop offset="100%" stopColor="var(--info)" stopOpacity={0}/></linearGradient><linearGradient id="outbound" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--success)" stopOpacity={0.18}/><stop offset="100%" stopColor="var(--success)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="2 4" vertical={false}/><XAxis dataKey="time" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, color: "var(--text)" }}/><Area type="monotone" dataKey="inbound" stroke="var(--info)" fill="url(#inbound)" strokeWidth={1.6}/><Area type="monotone" dataKey="outbound" stroke="var(--success)" fill="url(#outbound)" strokeWidth={1.4}/></AreaChart></ResponsiveContainer></div></div></div>
      <div className="panel" style={{ gridColumn: "span 4" }}><div className="panel-header"><div><div className="panel-title">Queue Snapshot</div><div className="panel-subtitle">Current service pressure</div></div></div><div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>{queues.map((q) => <QueueCard key={q.id} queue={q} />)}</div></div>
    </div>

    <div className="panel"><div className="panel-header"><div><div className="panel-title">Agent Presence</div><div className="panel-subtitle">Current mock agent states</div></div></div><div className="agent-list">{agents.slice(0,5).map((agent) => <AgentRow key={agent.id} agent={agent} />)}</div></div>
  </section>
}
