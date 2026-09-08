import { QueueCard } from "@/components/pbx/QueueCard"
import type { Queue } from "@/types/pbx"

export function QueuesPage({ queues }: { queues: Queue[] }) {
  return <section className="page"><div className="page-header"><div><h1 className="page-title">Queues</h1></div></div><div className="queue-grid">{queues.map((queue) => <QueueCard key={queue.id} queue={queue} />)}</div></section>
}
