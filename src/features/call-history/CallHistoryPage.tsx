import { CdrTable } from "@/components/pbx/CdrTable"
import type { PbxCall } from "@/types/pbx"

export function CallHistoryPage({ calls, onOpen }: { calls: PbxCall[]; onOpen: (call: PbxCall) => void }) {
  // CRITICAL LOGIC FIX: Filter out live calls
  const cdrCalls = calls.filter(c => !["ringing", "waiting", "connected", "hold"].includes(c.status))

  return <section className="page">
    <div className="page-header">
      <div>
        <h1 className="page-title">Call History / CDR</h1>
      </div>
    </div>
    <CdrTable calls={cdrCalls} onOpen={onOpen} />
  </section>
}
