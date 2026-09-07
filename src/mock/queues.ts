import type { Queue } from "@/types/pbx"

export const queues: Queue[] = [
  { id: "q1", name: "Support", waiting: 6, agents: 12, availableAgents: 5, averageWaitSeconds: 72, longestWaitSeconds: 278, serviceLevel: 84 },
  { id: "q2", name: "Sales", waiting: 3, agents: 8, availableAgents: 4, averageWaitSeconds: 24, longestWaitSeconds: 98, serviceLevel: 93 },
  { id: "q3", name: "Billing", waiting: 1, agents: 4, availableAgents: 2, averageWaitSeconds: 18, longestWaitSeconds: 54, serviceLevel: 96 },
]
