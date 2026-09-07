import { Radio } from "lucide-react"
import { LiveCallRow } from "@/components/pbx/LiveCallRow"
import type { PbxCall } from "@/types/pbx"

export function LiveCallsPage({ calls, onHold, onEnd, onOpen }: { calls: PbxCall[]; onHold: (id: string) => void; onEnd: (id: string) => void; onOpen: (call: PbxCall) => void }) {
  const active = calls.filter((call) => ["connected", "hold", "ringing", "waiting"].includes(call.status))
  return <section className="page">
    <div className="page-header"><h1 className="page-title">Live Calls</h1><div className="page-actions"><span className="system-pill"><Radio size={12}/>{active.length} active</span></div></div>
    <div className="panel"><div className="panel-header"><div className="panel-title">Active Calls</div></div><div className="live-list">{active.map((call) => <LiveCallRow key={call.id} call={call} onHold={onHold} onEnd={onEnd} onOpen={onOpen} />)}{active.length === 0 && <div className="empty-state">No active calls.</div>}</div></div>
  </section>
}
