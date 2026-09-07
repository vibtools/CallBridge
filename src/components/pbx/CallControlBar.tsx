import { ArrowRightLeft, MicOff, Pause, PhoneOff, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CallControlBar({ onHold, onEnd, held = false }: { onHold: () => void; onEnd: () => void; held?: boolean }) {
  return <div className="page-actions">
    <Button variant="ghost"><MicOff />Mute</Button>
    <Button variant="ghost" onClick={onHold}>{held ? <Play /> : <Pause />}{held ? "Resume" : "Hold"}</Button>
    <Button variant="ghost"><ArrowRightLeft />Transfer</Button>
    <Button variant="danger" onClick={onEnd}><PhoneOff />End</Button>
  </div>
}
