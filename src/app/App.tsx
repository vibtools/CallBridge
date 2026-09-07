import { useEffect, useMemo, useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { CallDetailDrawer } from "@/components/pbx/CallDetailDrawer"
import { AgentsPage } from "@/features/agents/AgentsPage"
import { CallHistoryPage } from "@/features/call-history/CallHistoryPage"
import { IncomingCallsPage } from "@/features/incoming-calls/IncomingCallsPage"
import { LiveCallsPage } from "@/features/live-calls/LiveCallsPage"
import { OverviewPage } from "@/features/overview/OverviewPage"
import { QueuesPage } from "@/features/queues/QueuesPage"
import { armRingtone, setRingtoneActive, stopRingtone } from "@/lib/ringtone"
import {
  HEARTBEAT_MS,
  RUNTIME_STORAGE_KEY,
  answerRuntimeCall,
  declineRuntimeCall,
  deriveRuntimeAgents,
  deriveRuntimeQueues,
  endRuntimeCall,
  reconcileRuntime,
  restoreRuntime,
  serializeRuntime,
  toggleRuntimeHold,
} from "@/runtime/pbxRuntime"
import type { AppPage, PbxCall } from "@/types/pbx"
import type { AppTheme } from "@/types/theme"

function readInitialTheme(): AppTheme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}

function readInitialRuntime() {
  try {
    return restoreRuntime(window.localStorage.getItem(RUNTIME_STORAGE_KEY), Date.now())
  } catch {
    return restoreRuntime(null, Date.now())
  }
}

export default function App() {
  const [page, setPage] = useState<AppPage>("overview")
  const [runtime, setRuntime] = useState(readInitialRuntime)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [theme, setTheme] = useState<AppTheme>(readInitialTheme)

  useEffect(() => {
    const syncNow = () => setRuntime((current) => reconcileRuntime(current, Date.now()))
    const timer = window.setInterval(syncNow, HEARTBEAT_MS)
    const onVisibilityChange = () => { if (!document.hidden) syncNow() }
    window.addEventListener("focus", syncNow)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", syncNow)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(RUNTIME_STORAGE_KEY, serializeRuntime(runtime))
    } catch {
      // The runtime remains functional in memory when browser storage is unavailable.
    }
  }, [runtime])

  useEffect(() => {
    const unlock = () => { void armRingtone() }
    window.addEventListener("pointerdown", unlock, { once: true })
    window.addEventListener("keydown", unlock, { once: true })
    return () => {
      window.removeEventListener("pointerdown", unlock)
      window.removeEventListener("keydown", unlock)
      stopRingtone()
    }
  }, [])

  const calls = runtime.calls
  const hasRingingInbound = calls.some((call) => call.direction === "inbound" && call.status === "ringing")
  useEffect(() => {
    setRingtoneActive(hasRingingInbound)
  }, [hasRingingInbound])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem("cloud-pbx-phone-theme", theme)
    } catch {
      // Theme persistence is optional; the UI still works when storage is unavailable.
    }
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) themeColor.content = theme === "light" ? "#F3F7FB" : "#0D1117"
  }, [theme])

  const runtimeAgents = useMemo(() => deriveRuntimeAgents(runtime, runtime.lastProcessedAt), [runtime])
  const runtimeQueues = useMemo(() => deriveRuntimeQueues(runtime, runtimeAgents), [runtime, runtimeAgents])
  const selected = useMemo(() => calls.find((call) => call.id === selectedId) ?? null, [calls, selectedId])
  const openCall = (call: PbxCall) => setSelectedId(call.id)

  const content = page === "overview" ? <OverviewPage calls={calls} agents={runtimeAgents} queues={runtimeQueues} />
    : page === "live" ? <LiveCallsPage calls={calls} onHold={(id) => setRuntime((current) => toggleRuntimeHold(current, id, Date.now()))} onEnd={(id) => setRuntime((current) => endRuntimeCall(current, id, Date.now()))} onOpen={openCall} />
    : page === "incoming" ? <IncomingCallsPage calls={calls} onAnswer={(id) => { setRuntime((current) => answerRuntimeCall(current, id, Date.now())); setPage("live") }} onDecline={(id) => setRuntime((current) => declineRuntimeCall(current, id, Date.now()))} />
    : page === "cdr" ? <CallHistoryPage calls={calls} onOpen={openCall} />
    : page === "queues" ? <QueuesPage queues={runtimeQueues} />
    : <AgentsPage agents={runtimeAgents} />

  const liveCount = calls.filter((c) => ["connected", "hold", "ringing", "waiting"].includes(c.status)).length
  const incomingCount = calls.filter((c) => c.direction === "inbound" && ["ringing", "waiting"].includes(c.status)).length

  return <><AppShell page={page} onPageChange={setPage} theme={theme} onThemeToggle={() => setTheme((current) => current === "dark" ? "light" : "dark")} liveCount={liveCount} incomingCount={incomingCount} notificationCount={0}>{content}</AppShell><CallDetailDrawer call={selected} onClose={() => setSelectedId(null)} /></>
}
