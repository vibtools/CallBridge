import { formatDuration } from "@/lib/utils"
import type { Queue } from "@/types/pbx"

export function QueueCard({ queue }: { queue: Queue }) {
  return <div className="queue-card">
    <div className="queue-head"><div className="queue-title-line"><div className="queue-name">{queue.name}</div><span className="queue-service mono">SL {queue.serviceLevel}%</span></div><div className="queue-waiting-line"><span className="queue-waiting mono">{queue.waiting}</span><span className="queue-waiting-label">waiting</span></div></div>
    <div className="queue-stats">
      <div className="queue-stat"><div className="meta-label">Available</div><div className="meta-value mono">{queue.availableAgents}/{queue.agents}</div></div>
      <div className="queue-stat"><div className="meta-label">Avg wait</div><div className="meta-value mono">{formatDuration(queue.averageWaitSeconds)}</div></div>
      <div className="queue-stat"><div className="meta-label">Longest</div><div className="meta-value mono">{formatDuration(queue.longestWaitSeconds)}</div></div>
    </div>
    <div className="progress"><span style={{ width: `${queue.serviceLevel}%` }} /></div>
  </div>
}
