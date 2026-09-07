import { ArrowRightLeft, MoreHorizontal, Pause, PhoneOff, Play } from "lucide-react"
import { CallDirectionBadge } from "@/components/pbx/CallDirectionBadge"
import { StatusBadge } from "@/components/pbx/StatusBadge"
import { formatDuration } from "@/lib/utils"
import type { PbxCall } from "@/types/pbx"

export function LiveCallRow({ call, onHold, onEnd, onOpen }: { call: PbxCall; onHold: (id: string) => void; onEnd: (id: string) => void; onOpen: (call: PbxCall) => void }) {
  return <div className={`live-row status-${call.status}`} onDoubleClick={() => onOpen(call)}>
    <div className="call-primary"><div className="call-number mono">{call.caller}</div><div className="call-name">{call.callerName ?? "Unknown caller"} · <CallDirectionBadge direction={call.direction} /></div></div>
    <div><div className="call-number">{call.queue ?? call.callee}</div><div className="call-name">{call.agent ? `${call.agent}${call.extension ? ` · Ext ${call.extension}` : ""}` : call.callee}</div></div>
    <div><StatusBadge status={call.status} /></div>
    <div className="mono" style={{ fontSize: 11 }}>{formatDuration(call.status === "connected" || call.status === "hold" ? call.talkSeconds : call.totalSeconds)}</div>
    <div className="call-actions">
      <button className="call-action" title={call.status === "hold" ? "Resume" : "Hold"} onClick={() => onHold(call.id)}>{call.status === "hold" ? <Play /> : <Pause />}</button>
      <button className="call-action" title="Transfer"><ArrowRightLeft /></button>
      <button className="call-action" title="Details" onClick={() => onOpen(call)}><MoreHorizontal /></button>
      <button className="call-action danger" title="End call" onClick={() => onEnd(call.id)}><PhoneOff /></button>
    </div>
  </div>
}
