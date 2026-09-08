export type CallDirection = "inbound" | "outbound" | "internal"

export type CallStatus =
  | "ringing"
  | "waiting"
  | "connected"
  | "hold"
  | "completed"
  | "missed"
  | "busy"
  | "failed"
  | "voicemail"
  | "abandoned"
  | "transferred"

export type TimelineKind = "route" | "ring" | "answer" | "hold" | "resume" | "transfer" | "end"

export interface CallTimelineEvent {
  id: string
  at: string
  kind: TimelineKind
  label: string
  detail?: string
}

export interface PbxCall {
  id: string
  direction: CallDirection
  caller: string
  callerName?: string
  callee: string
  did?: string
  extension?: string
  agent?: string
  queue?: string
  status: CallStatus
  startedAt: string
  answeredAt?: string
  endedAt?: string
  ringSeconds: number
  talkSeconds: number
  totalSeconds: number
  codec?: string
  recordingAvailable: boolean
  timeline: CallTimelineEvent[]
}

export type AgentStatus = "available" | "ringing" | "on-call" | "hold" | "wrap-up" | "break" | "offline"

export interface Agent {
  id: string
  name: string
  extension: string
  status: AgentStatus
  queue: string
  activeCallId?: string
  activeSeconds?: number
}

export interface Queue {
  id: string
  name: string
  waiting: number
  agents: number
  availableAgents: number
  averageWaitSeconds: number
  longestWaitSeconds: number
  serviceLevel: number
}

export type AppPage = "overview" | "live" | "incoming" | "cdr" | "voicemail" | "queues" | "ring-groups" | "ivr" | "agents" | "extensions" | "phonebook" | "did" | "settings-did" | "analytics" | "settings" | "settings-agents" | "settings-queues"
