import { CdrTable } from "@/components/pbx/CdrTable"
import type { PbxCall } from "@/types/pbx"

export function CallHistoryPage({ calls, onOpen }: { calls: PbxCall[]; onOpen: (call: PbxCall) => void }) {
  return <section className="page"><div className="page-header"><h1 className="page-title">Call History / CDR</h1></div><CdrTable calls={calls} onOpen={onOpen} /></section>
}
