import { X } from "lucide-react"
import { CallDirectionBadge } from "@/components/pbx/CallDirectionBadge"
import { CallTimeline } from "@/components/pbx/CallTimeline"
import { RecordingPlayer } from "@/components/pbx/RecordingPlayer"
import { StatusBadge } from "@/components/pbx/StatusBadge"
import { formatDuration, shortTime } from "@/lib/utils"
import type { PbxCall } from "@/types/pbx"

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="detail-item"><div className="meta-label">{label}</div><div className={`meta-value ${mono ? "mono" : ""}`}>{value}</div></div>
}

export function CallDetailDrawer({ call, onClose }: { call: PbxCall | null; onClose: () => void }) {
  if (!call) return null
  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
    <aside className="drawer" aria-label="Call details">
      <div className="drawer-header"><div className="drawer-title-row"><div className="panel-title">Call Details</div><span className="drawer-call-id mono">{call.id}</span></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X /></button></div>
      <div className="drawer-body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><CallDirectionBadge direction={call.direction} /><StatusBadge status={call.status} /></div>
        <div className="detail-grid">
          <Detail label="From" value={call.caller} mono />
          <Detail label="To" value={call.callee} mono />
          <Detail label="Extension" value={call.extension ?? "—"} mono />
          <Detail label="Agent" value={call.agent ?? "—"} />
          <Detail label="Queue" value={call.queue ?? "Direct"} />
          <Detail label="DID" value={call.did ?? "—"} mono />
          <Detail label="Started" value={shortTime(call.startedAt)} mono />
          <Detail label="Answered" value={call.answeredAt ? shortTime(call.answeredAt) : "—"} mono />
          <Detail label="Ring Time" value={formatDuration(call.ringSeconds)} mono />
          <Detail label="Talk Time" value={formatDuration(call.talkSeconds)} mono />
          <Detail label="Total" value={formatDuration(call.totalSeconds)} mono />
          <Detail label="Codec" value={call.codec ?? "—"} mono />
        </div>
        <div className="panel"><div className="panel-header"><div className="panel-title">Call Journey</div></div><div className="panel-body"><CallTimeline events={call.timeline} /></div></div>
        <div><div className="panel-title" style={{ marginBottom: 7 }}>Recording</div><RecordingPlayer available={call.recordingAvailable} /></div>
      </div>
    </aside>
  </div>
}
