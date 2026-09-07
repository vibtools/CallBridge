import { PhoneIncoming } from "lucide-react"
import { IncomingCallCard } from "@/components/pbx/IncomingCallCard"
import type { PbxCall } from "@/types/pbx"

export function IncomingCallsPage({ calls, onAnswer, onDecline }: { calls: PbxCall[]; onAnswer: (id: string) => void; onDecline: (id: string) => void }) {
  const incoming = calls.filter((call) => call.direction === "inbound" && ["ringing", "waiting"].includes(call.status))
  return <section className="page">
    <div className="page-header"><h1 className="page-title">Incoming Calls</h1><div className="page-actions"><span className="system-pill"><PhoneIncoming size={12}/>{incoming.length} pending</span></div></div>
    {incoming.length ? <div className="incoming-grid">{incoming.map((call) => <IncomingCallCard key={call.id} call={call} onAnswer={onAnswer} onDecline={onDecline} />)}</div> : <div className="panel"><div className="empty-state">No incoming calls are waiting or ringing.</div></div>}
  </section>
}
