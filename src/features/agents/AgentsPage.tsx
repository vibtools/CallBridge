import { AgentRow } from "@/components/pbx/AgentRow"
import type { Agent } from "@/types/pbx"

export function AgentsPage({ agents }: { agents: Agent[] }) {
  return <section className="page"><div className="page-header"><div><h1 className="page-title">Agents</h1><p className="page-description">Presence and current call state for the simulated contact-center team.</p></div></div><div className="panel"><div className="panel-header"><div><div className="panel-title">Agent Status</div><div className="panel-subtitle">Available · ringing · on call · wrap-up · break · offline</div></div></div><div className="agent-list">{agents.map((agent) => <AgentRow key={agent.id} agent={agent} />)}</div></div></section>
}
