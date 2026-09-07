import { StatusBadge } from "@/components/pbx/StatusBadge"
import { formatDuration } from "@/lib/utils"
import type { Agent } from "@/types/pbx"

function initials(name: string) { return name.split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase() }

export function AgentRow({ agent }: { agent: Agent }) {
  return <div className="agent-row">
    <div className="agent-name"><span className="agent-avatar">{initials(agent.name)}</span><div><div className="call-number">{agent.name}</div><div className="call-name">{agent.queue}</div></div></div>
    <div className="mono">{agent.extension}</div>
    <div><StatusBadge status={agent.status} /></div>
    <div className="muted">{agent.activeCallId ? "Active call" : "—"}</div>
    <div className="mono">{agent.activeSeconds != null ? formatDuration(agent.activeSeconds) : "—"}</div>
  </div>
}
