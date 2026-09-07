let audioContext: AudioContext | null = null
let cadenceTimer: number | null = null
let toneTimer: number | null = null
let wanted = false
let armed = false

const RING_CADENCE_MS = 4_000
const RING_TONE_MS = 1_350

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return null
    audioContext = new AudioContextCtor()
  }
  return audioContext
}

function ringOnce() {
  const context = getAudioContext()
  if (!context || context.state !== "running" || !wanted) return

  const gain = context.createGain()
  const first = context.createOscillator()
  const second = context.createOscillator()
  first.type = "sine"
  second.type = "sine"
  first.frequency.value = 440
  second.frequency.value = 480

  const now = context.currentTime
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.035)
  gain.gain.setValueAtTime(0.055, now + RING_TONE_MS / 1000 - 0.06)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + RING_TONE_MS / 1000)

  first.connect(gain)
  second.connect(gain)
  gain.connect(context.destination)
  first.start(now)
  second.start(now)
  first.stop(now + RING_TONE_MS / 1000)
  second.stop(now + RING_TONE_MS / 1000)

  if (toneTimer !== null) window.clearTimeout(toneTimer)
  toneTimer = window.setTimeout(() => {
    first.disconnect()
    second.disconnect()
    gain.disconnect()
    toneTimer = null
  }, RING_TONE_MS + 100)
}

function startCadence() {
  if (!armed || !wanted || cadenceTimer !== null) return
  ringOnce()
  cadenceTimer = window.setInterval(ringOnce, RING_CADENCE_MS)
}

function stopCadence() {
  if (cadenceTimer !== null) {
    window.clearInterval(cadenceTimer)
    cadenceTimer = null
  }
}

export async function armRingtone(): Promise<void> {
  const context = getAudioContext()
  if (!context) return
  try {
    if (context.state === "suspended") await context.resume()
    armed = context.state === "running"
    startCadence()
  } catch {
    // Browser autoplay policies can deny audio until a later user gesture.
  }
}

export function setRingtoneActive(active: boolean): void {
  wanted = active
  if (active) startCadence()
  else stopCadence()
}

export function stopRingtone(): void {
  wanted = false
  stopCadence()
}
