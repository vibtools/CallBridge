import type { Agent } from "@/types/pbx"

export const agents: Agent[] = [
  { id: "a1", name: "Sarah Miller", extension: "204", status: "on-call", queue: "Support", activeCallId: "PBX-20260818-000142", activeSeconds: 267 },
  { id: "a2", name: "John Carter", extension: "205", status: "on-call", queue: "Sales", activeCallId: "PBX-20260818-000139", activeSeconds: 171 },
  { id: "a3", name: "Daniel Wong", extension: "206", status: "available", queue: "Support" },
  { id: "a4", name: "Anna Lewis", extension: "208", status: "ringing", queue: "Support", activeCallId: "PBX-20260818-000144", activeSeconds: 9 },
  { id: "a5", name: "Robert King", extension: "212", status: "wrap-up", queue: "Billing" },
  { id: "a6", name: "Priya Shah", extension: "214", status: "available", queue: "Sales" },
  { id: "a7", name: "Leo Martin", extension: "216", status: "break", queue: "Support" },
  { id: "a8", name: "Emma Brooks", extension: "220", status: "offline", queue: "Billing" },
]
