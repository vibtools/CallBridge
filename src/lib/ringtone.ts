let audio: HTMLAudioElement | null = null
let wanted = false
let armed = false

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null
  if (!audio) {
    audio = new window.Audio("/Ringtone.mp3")
    audio.loop = true
  }
  return audio
}

export async function armRingtone(): Promise<void> {
  armed = true
  if (wanted) {
    const a = getAudio()
    if (a && a.paused) {
      try {
        a.currentTime = 0
        await a.play()
      } catch {
        // Browser autoplay policies can deny audio until a later user gesture.
      }
    }
  }
}

export function setRingtoneActive(active: boolean): void {
  wanted = active
  const a = getAudio()
  if (!a) return

  if (active) {
    if (armed && a.paused) {
      a.currentTime = 0
      a.play().catch(() => {})
    }
  } else {
    a.pause()
    a.currentTime = 0
  }
}

export function stopRingtone(): void {
  wanted = false
  const a = getAudio()
  if (a) {
    a.pause()
    a.currentTime = 0
  }
}
