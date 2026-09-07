import type { AgentStatus, CallStatus } from "@/types/pbx"

export function StatusBadge({ status }: { status: CallStatus | AgentStatus }) {
  return <span className={`badge ${status}`}>{status.replace("-", " ")}</span>
}
