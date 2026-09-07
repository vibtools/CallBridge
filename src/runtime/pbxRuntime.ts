import { agents as baseAgents } from "../mock/agents"
import { initialCalls } from "../mock/calls"
import { queues as baseQueues } from "../mock/queues"
import type { Agent, PbxCall, Queue } from "../types/pbx"

export const RUNTIME_STORAGE_KEY = "cloud-pbx-phone-runtime-v1"
export const RUNTIME_SCHEMA_VERSION = 1
export const HEARTBEAT_MS = 1_000
export const MIN_INCOMING_DELAY_MS = 3 * 60 * 1000
export const MAX_INCOMING_DELAY_MS = 5 * 60 * 1000
export const MAX_INCOMING_RING_MS = 60 * 1000
export const LONG_INACTIVE_RESET_MS = 15 * 60 * 1000
export const MAX_CALL_HISTORY = 250

const MIN_CONNECTED_MS = 2 * 60 * 1000
const MAX_CONNECTED_MS = 2 * 60 * 60 * 1000
const TERMINAL = new Set(["completed", "missed", "busy", "failed", "voicemail", "abandoned", "transferred"])
const FIXED_AGENT_STATES = new Set(["break", "offline"])

const CALLER_NAMES = [
  "Olivia Parker", "Ethan Brooks", "Sophia Reed", "Noah Bennett", "Ava Collins",
  "Liam Foster", "Mia Turner", "Lucas Gray", "Isabella Cooper", "Mason Rivera",
  "Amelia Ward", "James Morgan", "Charlotte Price", "Benjamin Ross", "Harper Kelly",
  "Henry Bailey", "Evelyn Hughes", "Alexander Perry", "Ella Sanders", "Daniel Coleman",
]

const US_AREA_CODES = [
  "202", "206", "212", "213", "214", "215", "216", "305", "312", "313",
  "404", "415", "469", "503", "512", "617", "646", "650", "702", "703",
  "713", "720", "801", "818", "832", "857", "917", "929", "972", "980",
]

const QUEUE_PROFILES = [
  { queue: "Support", callee: "Support", did: "+1 800 555 0100" },
  { queue: "Sales", callee: "Sales", did: "+1 800 555 0110" },
  { queue: "Billing", callee: "Billing", did: "+1 800 555 0120" },
] as const

type PlannedOutcome = "answer" | "miss"

interface CallSchedule {
  plannedOutcome?: PlannedOutcome
  decisionAt?: number
  ringDeadlineAt?: number
  plannedEndAt?: number
}

export interface PbxRuntimeState {
  schemaVersion: 1
  calls: PbxCall[]
  nextIncomingAt: number
  lastProcessedAt: number
  usedCallerNumbers: string[]
  callSequence: number
  schedules: Record<string, CallSchedule>
  wrapUpUntil: Record<string, number>
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function stableRange(seed: string, min: number, max: number): number {
  return min + (hashString(seed) % (max - min + 1))
}

function iso(atMs: number): string {
  return new Date(atMs).toISOString()
}

function parseTime(value?: string): number | null {
  if (!value) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function nextIncomingDelayMs(): number {
  return randomInt(MIN_INCOMING_DELAY_MS, MAX_INCOMING_DELAY_MS)
}

function connectedDurationMs(callId: string): number {
  // Balanced long-duration distribution: 35% 2-8m, 30% 8-20m,
  // 20% 20-40m, 10% 40-60m, 5% 60-120m.
  const roll = hashString(`${callId}:duration-bucket`) % 100
  if (roll < 35) return stableRange(`${callId}:duration`, MIN_CONNECTED_MS, 8 * 60 * 1000)
  if (roll < 65) return stableRange(`${callId}:duration`, 8 * 60 * 1000 + 1, 20 * 60 * 1000)
  if (roll < 85) return stableRange(`${callId}:duration`, 20 * 60 * 1000 + 1, 40 * 60 * 1000)
  if (roll < 95) return stableRange(`${callId}:duration`, 40 * 60 * 1000 + 1, 60 * 60 * 1000)
  return stableRange(`${callId}:duration`, 60 * 60 * 1000 + 1, MAX_CONNECTED_MS)
}

function plannedIncomingOutcome(callId: string): { outcome: PlannedOutcome; delayMs: number } {
  const roll = hashString(`${callId}:answer-policy`) % 100
  if (roll < 60) return { outcome: "answer", delayMs: stableRange(`${callId}:answer-at`, 6_000, 32_000) }
  return { outcome: "miss", delayMs: stableRange(`${callId}:miss-at`, 24_000, MAX_INCOMING_RING_MS) }
}

function uniqueCallerNumber(used: Set<string>): string {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const number = `+1 ${pick(US_AREA_CODES)} 555 ${randomInt(100, 199).toString().padStart(4, "0")}`
    if (!used.has(number)) return number
  }
  for (const area of US_AREA_CODES) {
    for (let subscriber = 100; subscriber <= 199; subscriber += 1) {
      const number = `+1 ${area} 555 ${subscriber.toString().padStart(4, "0")}`
      if (!used.has(number)) return number
    }
  }
  throw new Error("Fictional US caller-number pool exhausted")
}

function makeCallId(atMs: number, sequence: number): string {
  const stamp = new Date(atMs).toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)
  return `PBX-${stamp}-${sequence.toString().padStart(4, "0")}`
}

function elapsedSeconds(startMs: number | null, endMs: number): number {
  return startMs === null ? 0 : Math.max(0, Math.floor((endMs - startMs) / 1000))
}

function refreshDurations(call: PbxCall, nowMs: number): PbxCall {
  const started = parseTime(call.startedAt)
  if (started === null) return call
  const answered = parseTime(call.answeredAt)
  const ended = parseTime(call.endedAt)
  const effectiveEnd = ended ?? nowMs
  const ringEnd = answered ?? ended ?? nowMs
  return {
    ...call,
    ringSeconds: elapsedSeconds(started, ringEnd),
    talkSeconds: answered === null ? 0 : elapsedSeconds(answered, effectiveEnd),
    totalSeconds: elapsedSeconds(started, effectiveEnd),
  }
}

function rebaseTerminalHistory(nowMs: number): PbxCall[] {
  const history = initialCalls.filter((call) => TERMINAL.has(call.status)).slice(0, 2)
  return history.map((call, index) => {
    const durationMs = Math.max(20_000, call.totalSeconds * 1000)
    const endedAt = nowMs - (7 + index * 8) * 60 * 1000
    const startedAt = endedAt - durationMs
    const answeredAt = call.answeredAt ? startedAt + call.ringSeconds * 1000 : undefined
    const rebased: PbxCall = {
      ...call,
      startedAt: iso(startedAt),
      answeredAt: answeredAt ? iso(answeredAt) : undefined,
      endedAt: iso(endedAt),
      timeline: call.timeline.map((event, eventIndex) => ({ ...event, at: iso(startedAt + eventIndex * 5_000) })),
    }
    return refreshDurations(rebased, nowMs)
  })
}

function connectedSeed(base: PbxCall, id: string, nowMs: number, elapsedMinutes: number, remainingMinutes: number): { call: PbxCall; schedule: CallSchedule } {
  const startedAt = nowMs - elapsedMinutes * 60 * 1000
  const ringMs = Math.max(3_000, base.ringSeconds * 1000)
  const answeredAt = startedAt + ringMs
  const call: PbxCall = refreshDurations({
    ...base,
    id,
    status: "connected",
    startedAt: iso(startedAt),
    answeredAt: iso(answeredAt),
    endedAt: undefined,
    timeline: [
      { id: `${id}-seed-ring`, at: iso(startedAt), kind: "ring", label: base.direction === "outbound" ? "Outbound call initiated" : "Incoming call", detail: base.caller },
      { id: `${id}-seed-answer`, at: iso(answeredAt), kind: "answer", label: base.agent ? `Answered by ${base.agent}` : "Call answered", detail: base.extension ? `Extension ${base.extension}` : undefined },
    ],
  }, nowMs)
  return { call, schedule: { plannedEndAt: nowMs + remainingMinutes * 60 * 1000 } }
}

export function createInitialRuntime(nowMs = Date.now()): PbxRuntimeState {
  const first = connectedSeed(initialCalls[0], makeCallId(nowMs - 11 * 60 * 1000, 198), nowMs, 11, 24)
  const second = connectedSeed(initialCalls[3], makeCallId(nowMs - 18 * 60 * 1000, 199), nowMs, 18, 37)
  const calls = [first.call, second.call, ...rebaseTerminalHistory(nowMs)]
  const used = new Set(calls.map((call) => call.caller).filter((caller) => caller.startsWith("+1 ")))
  return {
    schemaVersion: RUNTIME_SCHEMA_VERSION,
    calls,
    nextIncomingAt: nowMs + nextIncomingDelayMs(),
    lastProcessedAt: nowMs,
    usedCallerNumbers: [...used],
    callSequence: 200,
    schedules: { [first.call.id]: first.schedule, [second.call.id]: second.schedule },
    wrapUpUntil: {},
  }
}

function trimCalls(calls: PbxCall[]): PbxCall[] {
  const active = calls.filter((call) => !TERMINAL.has(call.status))
  const terminal = calls.filter((call) => TERMINAL.has(call.status)).sort((a, b) => (parseTime(b.endedAt) ?? 0) - (parseTime(a.endedAt) ?? 0))
  return [...active, ...terminal.slice(0, Math.max(0, MAX_CALL_HISTORY - active.length))]
}

function eligibleAgentsForQueue(queue?: string): Agent[] {
  const eligible = baseAgents.filter((agent) => !FIXED_AGENT_STATES.has(agent.status))
  const matching = queue ? eligible.filter((agent) => agent.queue === queue) : eligible
  return matching.length > 0 ? matching : eligible
}

function activeAgentNames(calls: PbxCall[], excludingCallId?: string): Set<string> {
  return new Set(calls
    .filter((call) => call.id !== excludingCallId && ["ringing", "waiting", "connected", "hold"].includes(call.status) && call.agent)
    .map((call) => call.agent as string))
}

function chooseAvailableAgent(calls: PbxCall[], queue: string | undefined, excludingCallId?: string): Agent | null {
  const occupied = activeAgentNames(calls, excludingCallId)
  const available = eligibleAgentsForQueue(queue).filter((agent) => !occupied.has(agent.name))
  if (available.length > 0) return pick(available)
  const anyAvailable = baseAgents.filter((agent) => !FIXED_AGENT_STATES.has(agent.status) && !occupied.has(agent.name))
  return anyAvailable.length > 0 ? pick(anyAvailable) : null
}

function appendIncoming(state: PbxRuntimeState, atMs: number): PbxRuntimeState {
  const used = new Set(state.usedCallerNumbers)
  const caller = uniqueCallerNumber(used)
  used.add(caller)
  const sequence = state.callSequence + 1
  const id = makeCallId(atMs, sequence)
  const profile = pick(QUEUE_PROFILES)
  const callerName = pick(CALLER_NAMES)
  const policy = plannedIncomingOutcome(id)
  const startedAt = iso(atMs)
  const call: PbxCall = {
    id,
    direction: "inbound",
    caller,
    callerName,
    callee: profile.callee,
    did: profile.did,
    queue: profile.queue,
    status: "ringing",
    startedAt,
    ringSeconds: 0,
    talkSeconds: 0,
    totalSeconds: 0,
    codec: hashString(`${id}:codec`) % 4 === 0 ? "G.722" : "G.711 µ-law",
    recordingAvailable: hashString(`${id}:recording`) % 100 < 72,
    timeline: [
      { id: `${id}-ring`, at: startedAt, kind: "ring", label: "Incoming call", detail: caller },
      { id: `${id}-route`, at: startedAt, kind: "route", label: `Routed to ${profile.queue} queue`, detail: `DID ${profile.did}` },
    ],
  }
  return {
    ...state,
    calls: [call, ...state.calls],
    usedCallerNumbers: [...used],
    callSequence: sequence,
    schedules: {
      ...state.schedules,
      [id]: {
        plannedOutcome: policy.outcome,
        decisionAt: atMs + policy.delayMs,
        ringDeadlineAt: atMs + MAX_INCOMING_RING_MS,
      },
    },
  }
}

function completeCall(state: PbxRuntimeState, call: PbxCall, atMs: number): PbxRuntimeState {
  const endedAt = iso(atMs)
  const updated: PbxCall = refreshDurations({
    ...call,
    status: "completed",
    endedAt,
    timeline: [...call.timeline, { id: `${call.id}-auto-end-${call.timeline.length}`, at: endedAt, kind: "end", label: call.agent ? `Call completed with ${call.agent}` : "Call completed" }],
  }, atMs)
  const nextSchedules = { ...state.schedules }
  delete nextSchedules[call.id]
  const wrapUpUntil = { ...state.wrapUpUntil }
  const agent = baseAgents.find((item) => item.name === call.agent)
  if (agent) wrapUpUntil[agent.id] = atMs + stableRange(`${call.id}:wrap-up`, 10_000, 45_000)
  return { ...state, calls: state.calls.map((item) => item.id === call.id ? updated : item), schedules: nextSchedules, wrapUpUntil }
}

function missCall(state: PbxRuntimeState, call: PbxCall, atMs: number): PbxRuntimeState {
  const endedAt = iso(atMs)
  const updated: PbxCall = refreshDurations({
    ...call,
    status: "missed",
    endedAt,
    timeline: [...call.timeline, { id: `${call.id}-miss-${call.timeline.length}`, at: endedAt, kind: "end", label: "Call missed", detail: "No agent answered" }],
  }, atMs)
  const schedules = { ...state.schedules }
  delete schedules[call.id]
  return { ...state, calls: state.calls.map((item) => item.id === call.id ? updated : item), schedules }
}

function connectCall(state: PbxRuntimeState, call: PbxCall, atMs: number, agent: Agent): PbxRuntimeState {
  const answeredAt = iso(atMs)
  const updated: PbxCall = refreshDurations({
    ...call,
    status: "connected",
    agent: agent.name,
    extension: agent.extension,
    answeredAt,
    timeline: [...call.timeline, { id: `${call.id}-answer-${call.timeline.length}`, at: answeredAt, kind: "answer", label: `Answered by ${agent.name}`, detail: `Extension ${agent.extension}` }],
  }, atMs)
  const schedule = state.schedules[call.id] ?? {}
  return {
    ...state,
    calls: state.calls.map((item) => item.id === call.id ? updated : item),
    schedules: { ...state.schedules, [call.id]: { ...schedule, plannedOutcome: undefined, decisionAt: undefined, ringDeadlineAt: undefined, plannedEndAt: atMs + connectedDurationMs(call.id) } },
  }
}

function processDueCallEvents(input: PbxRuntimeState, nowMs: number): PbxRuntimeState {
  let state = input

  // Complete established calls first so their agents can become available to waiting calls.
  for (const call of [...state.calls]) {
    if (!["connected", "hold"].includes(call.status)) continue
    const plannedEndAt = state.schedules[call.id]?.plannedEndAt
    if (plannedEndAt !== undefined && plannedEndAt <= nowMs) state = completeCall(state, call, plannedEndAt)
  }

  for (const original of [...state.calls]) {
    const call = state.calls.find((item) => item.id === original.id)
    if (!call || !["ringing", "waiting"].includes(call.status) || call.direction !== "inbound") continue
    const schedule = state.schedules[call.id]
    if (!schedule) continue
    const deadline = schedule.ringDeadlineAt ?? ((parseTime(call.startedAt) ?? nowMs) + MAX_INCOMING_RING_MS)

    if (nowMs >= deadline) {
      state = missCall(state, call, deadline)
      continue
    }

    if (schedule.plannedOutcome === "miss" && schedule.decisionAt !== undefined && nowMs >= schedule.decisionAt) {
      state = missCall(state, call, schedule.decisionAt)
      continue
    }

    if (schedule.plannedOutcome === "answer" && schedule.decisionAt !== undefined && nowMs >= schedule.decisionAt) {
      const agent = chooseAvailableAgent(state.calls, call.queue, call.id)
      if (agent) {
        const answerAt = Math.min(nowMs, Math.max(schedule.decisionAt, parseTime(call.startedAt) ?? schedule.decisionAt))
        state = connectCall(state, call, answerAt, agent)
        const connected = state.calls.find((item) => item.id === call.id)
        const endAt = state.schedules[call.id]?.plannedEndAt
        if (connected && endAt !== undefined && endAt <= nowMs) state = completeCall(state, connected, endAt)
      } else if (call.status !== "waiting") {
        state = { ...state, calls: state.calls.map((item) => item.id === call.id ? { ...item, status: "waiting" } : item) }
      }
    }
  }

  return { ...state, calls: trimCalls(state.calls.map((call) => refreshDurations(call, nowMs))) }
}

function rebuildAfterLongGap(previous: PbxRuntimeState, nowMs: number): PbxRuntimeState {
  const fresh = createInitialRuntime(nowMs)
  const priorHistory = previous.calls.filter((call) => TERMINAL.has(call.status)).map((call) => refreshDurations(call, nowMs))
  const used = new Set([...previous.usedCallerNumbers, ...fresh.usedCallerNumbers])
  const seedHistory = priorHistory.length > 0 ? priorHistory : fresh.calls.filter((call) => TERMINAL.has(call.status))
  const unique = new Map<string, PbxCall>()
  for (const call of [...fresh.calls.filter((item) => !TERMINAL.has(item.status)), ...seedHistory]) unique.set(call.id, call)
  return {
    ...fresh,
    calls: trimCalls([...unique.values()]),
    usedCallerNumbers: [...used],
    callSequence: Math.max(previous.callSequence, fresh.callSequence),
  }
}

export function reconcileRuntime(input: PbxRuntimeState, nowMs = Date.now()): PbxRuntimeState {
  if (nowMs - input.lastProcessedAt >= LONG_INACTIVE_RESET_MS) return rebuildAfterLongGap(input, nowMs)

  let state = { ...input }
  let guard = 0
  while (state.nextIncomingAt <= nowMs && guard < 8) {
    const dueAt = state.nextIncomingAt
    state = appendIncoming(state, dueAt)
    state = { ...state, nextIncomingAt: dueAt + nextIncomingDelayMs() }
    guard += 1
  }
  state = processDueCallEvents(state, nowMs)
  return { ...state, lastProcessedAt: nowMs }
}

export function restoreRuntime(raw: string | null, nowMs = Date.now()): PbxRuntimeState {
  if (!raw) return createInitialRuntime(nowMs)
  try {
    const parsed = JSON.parse(raw) as Partial<PbxRuntimeState>
    if (parsed.schemaVersion !== RUNTIME_SCHEMA_VERSION || !Array.isArray(parsed.calls) || typeof parsed.nextIncomingAt !== "number" || typeof parsed.lastProcessedAt !== "number") {
      return createInitialRuntime(nowMs)
    }
    const restored: PbxRuntimeState = {
      schemaVersion: RUNTIME_SCHEMA_VERSION,
      calls: parsed.calls,
      nextIncomingAt: parsed.nextIncomingAt,
      lastProcessedAt: parsed.lastProcessedAt,
      usedCallerNumbers: Array.isArray(parsed.usedCallerNumbers) ? parsed.usedCallerNumbers : [],
      callSequence: typeof parsed.callSequence === "number" ? parsed.callSequence : 200,
      schedules: parsed.schedules && typeof parsed.schedules === "object" ? parsed.schedules : {},
      wrapUpUntil: parsed.wrapUpUntil && typeof parsed.wrapUpUntil === "object" ? parsed.wrapUpUntil : {},
    }
    return reconcileRuntime(restored, nowMs)
  } catch {
    return createInitialRuntime(nowMs)
  }
}

export function serializeRuntime(state: PbxRuntimeState): string {
  return JSON.stringify(state)
}

export function answerRuntimeCall(input: PbxRuntimeState, id: string, nowMs = Date.now()): PbxRuntimeState {
  const call = input.calls.find((item) => item.id === id)
  if (!call || !["ringing", "waiting"].includes(call.status)) return input
  const agent = chooseAvailableAgent(input.calls, call.queue, call.id)
  if (!agent) return input
  return { ...connectCall(input, call, nowMs, agent), lastProcessedAt: nowMs }
}

export function declineRuntimeCall(input: PbxRuntimeState, id: string, nowMs = Date.now()): PbxRuntimeState {
  const call = input.calls.find((item) => item.id === id)
  if (!call || !["ringing", "waiting"].includes(call.status)) return input
  const endedAt = iso(nowMs)
  const updated = refreshDurations({ ...call, status: "missed", endedAt, timeline: [...call.timeline, { id: `${call.id}-decline-${call.timeline.length}`, at: endedAt, kind: "end", label: "Call declined" }] }, nowMs)
  const schedules = { ...input.schedules }
  delete schedules[id]
  return { ...input, calls: input.calls.map((item) => item.id === id ? updated : item), schedules, lastProcessedAt: nowMs }
}

export function toggleRuntimeHold(input: PbxRuntimeState, id: string, nowMs = Date.now()): PbxRuntimeState {
  const call = input.calls.find((item) => item.id === id)
  if (!call || !["connected", "hold"].includes(call.status)) return input
  const nextStatus = call.status === "hold" ? "connected" : "hold"
  const updated: PbxCall = { ...call, status: nextStatus, timeline: [...call.timeline, { id: `${call.id}-${nextStatus}-${call.timeline.length}`, at: iso(nowMs), kind: nextStatus === "hold" ? "hold" : "resume", label: nextStatus === "hold" ? "Call placed on hold" : "Call resumed" }] }
  return { ...input, calls: input.calls.map((item) => item.id === id ? updated : item), lastProcessedAt: nowMs }
}

export function endRuntimeCall(input: PbxRuntimeState, id: string, nowMs = Date.now()): PbxRuntimeState {
  const call = input.calls.find((item) => item.id === id)
  if (!call || TERMINAL.has(call.status)) return input
  return { ...completeCall(input, call, nowMs), lastProcessedAt: nowMs }
}

export function deriveRuntimeAgents(state: PbxRuntimeState, nowMs = Date.now()): Agent[] {
  return baseAgents.map((agent) => {
    if (FIXED_AGENT_STATES.has(agent.status)) return { ...agent, activeCallId: undefined, activeSeconds: undefined }
    const call = state.calls.find((item) => item.agent === agent.name && ["ringing", "waiting", "connected", "hold"].includes(item.status))
    if (call) {
      const status = call.status === "hold" ? "hold" : call.status === "connected" ? "on-call" : "ringing"
      return { ...agent, status, activeCallId: call.id, activeSeconds: call.status === "connected" || call.status === "hold" ? call.talkSeconds : call.ringSeconds }
    }
    if ((state.wrapUpUntil[agent.id] ?? 0) > nowMs) return { ...agent, status: "wrap-up", activeCallId: undefined, activeSeconds: undefined }
    return { ...agent, status: "available", activeCallId: undefined, activeSeconds: undefined }
  })
}

export function deriveRuntimeQueues(state: PbxRuntimeState, runtimeAgents: Agent[]): Queue[] {
  return baseQueues.map((queue) => {
    const waitingCalls = state.calls.filter((call) => call.queue === queue.name && call.direction === "inbound" && ["ringing", "waiting"].includes(call.status))
    const queueAgents = runtimeAgents.filter((agent) => agent.queue === queue.name)
    const availableAgents = queueAgents.filter((agent) => agent.status === "available").length
    const averageWaitSeconds = waitingCalls.length === 0 ? 0 : Math.round(waitingCalls.reduce((sum, call) => sum + call.ringSeconds, 0) / waitingCalls.length)
    const longestWaitSeconds = waitingCalls.length === 0 ? 0 : Math.max(...waitingCalls.map((call) => call.ringSeconds))
    return {
      ...queue,
      waiting: waitingCalls.length,
      agents: queueAgents.length,
      availableAgents,
      averageWaitSeconds,
      longestWaitSeconds,
      serviceLevel: Math.max(70, Math.min(99, queue.serviceLevel - waitingCalls.length * 2 + Math.min(3, availableAgents))),
    }
  })
}
