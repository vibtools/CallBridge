import { Download, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const bars = [7,13,18,10,21,16,8,14,23,19,9,12,17,22,11,6,14,20,15,10,18,24,14,8,16,19,12,7,13,21,17,9]

export function RecordingPlayer({ available }: { available: boolean }) {
  if (!available) return <div className="recording muted">No recording available for this call.</div>
  return <div className="recording"><div className="recording-row"><button className="call-action" aria-label="Play recording"><Play /></button><div className="wave">{bars.map((h,i) => <span key={i} style={{ height: h }} />)}</div><span className="mono muted" style={{ fontSize: 9 }}>02:14 / 04:52</span></div><div style={{ display: "flex", justifyContent: "flex-end", marginTop: 7 }}><Button variant="ghost"><Download />Download</Button></div></div>
}
