import { Clock3, PhoneCall, PhoneIncoming, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/lib/utils"
import type { PbxCall } from "@/types/pbx"

function initials(name?: string) {
  if (!name) return "?"
  return name.split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase()
}

export function IncomingCallCard({ call, onAnswer, onDecline }: { call: PbxCall; onAnswer: (id: string) => void; onDecline: (id: string) => void }) {
  return <div className="incoming-card">
    <div className="incoming-head"><div className="incoming-kicker"><PhoneIncoming size={14} />Incoming call</div><span className="system-pill mono"><Clock3 size={12} />{formatDuration(call.totalSeconds)}</span></div>
    <div className="incoming-main"><div className="caller-avatar">{initials(call.callerName)}</div><div><div className="incoming-number mono">{call.caller}</div><div className="incoming-name">{call.callerName ?? "Unknown caller"}</div></div></div>
    <div className="call-meta-grid">
      <div className="meta-block"><div className="meta-label">Queue</div><div className="meta-value">{call.queue ?? "Direct"}</div></div>
      <div className="meta-block"><div className="meta-label">DID</div><div className="meta-value mono">{call.did ?? "—"}</div></div>
      <div className="meta-block"><div className="meta-label">Destination</div><div className="meta-value">{call.extension ? `Ext ${call.extension}` : call.callee}</div></div>
    </div>
    <div className="incoming-actions"><Button variant="danger" onClick={() => onDecline(call.id)}><PhoneOff />Decline</Button><Button variant="primary" onClick={() => onAnswer(call.id)}><PhoneCall />Answer</Button></div>
  </div>
}
