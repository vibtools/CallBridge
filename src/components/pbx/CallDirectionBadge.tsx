import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react"
import type { CallDirection } from "@/types/pbx"

export function CallDirectionBadge({ direction }: { direction: CallDirection }) {
  const Icon = direction === "inbound" ? ArrowDownLeft : direction === "outbound" ? ArrowUpRight : ArrowLeftRight
  return <span className={`direction ${direction}`}><Icon />{direction}</span>
}
