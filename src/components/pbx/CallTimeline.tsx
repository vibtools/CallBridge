import { shortTime } from "@/lib/utils"
import type { CallTimelineEvent } from "@/types/pbx"

export function CallTimeline({ events }: { events: CallTimelineEvent[] }) {
  return <div className="timeline">{events.map((event) => <div className="timeline-item" key={event.id}>
    <div className="timeline-time mono">{shortTime(event.at)}</div><div className="timeline-rail"><span className="timeline-dot" /></div><div><div className="timeline-label">{event.label}</div>{event.detail && <div className="timeline-detail">{event.detail}</div>}</div>
  </div>)}</div>
}
