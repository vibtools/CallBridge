import { supabase, HAS_SUPABASE } from "./supabase"
import type { PbxSettings } from "@/runtime/pbxRuntime"

// Define a key or row ID to sync settings.
const SETTINGS_ROW_ID = 1
const LOCAL_STORAGE_KEY = "pbx_settings_db"


export async function fetchSettingsFromDb(): Promise<Partial<PbxSettings> | null> {
  if (!HAS_SUPABASE) {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (err) {
      console.warn("Failed to read settings from localStorage", err)
    }
    return null
  }

  try {
    const { data, error } = await supabase
      .from("pbx_settings")
      .select("*")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle()
      
    if (error) {
      console.warn("Failed to fetch settings from Supabase:", error.message)
      return null
    }
    
    if (data) {
      return {
        countryCode: data.country_code,
        mockEnabled: data.mock_enabled,
        minCallDelay: data.min_call_delay,
        maxCallDelay: data.max_call_delay,
        minCallDuration: data.min_call_duration,
        maxCallDuration: data.max_call_duration,
        callsPerInterval: data.calls_per_interval,
        dids: data.dids,
        queues: data.queue_assignments,
      }
    }
  } catch (err) {
    console.warn("Supabase fetch exception:", err)
  }
  return null
}

export async function saveSettingsToDb(settings: PbxSettings): Promise<{ success: boolean; error?: string }> {
  if (!HAS_SUPABASE) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings))
      console.log("Settings synced to localStorage (mock fallback)")
      return { success: true }
    } catch (err: any) {
      console.warn("Error saving settings to local DB", err)
      return { success: false, error: err?.message || "Failed to save to localStorage" }
    }
  }

  try {
    const payload = {
      id: SETTINGS_ROW_ID,
      country_code: settings.countryCode,
      mock_enabled: settings.mockEnabled,
      min_call_delay: settings.minCallDelay,
      max_call_delay: settings.maxCallDelay,
      min_call_duration: settings.minCallDuration,
      max_call_duration: settings.maxCallDuration,
      calls_per_interval: settings.callsPerInterval,
      dids: settings.dids,
      queue_assignments: settings.queues,
      updated_at: new Date().toISOString(),
    }
    
    const { error } = await supabase
      .from("pbx_settings")
      .upsert(payload, { onConflict: "id" })
      
    if (error) {
      console.warn("Failed to save settings to Supabase:", error.message)
      return { success: false, error: error.message }
    } else {
      console.log("Settings synced to Supabase")
      return { success: true }
    }
  } catch (err: any) {
    console.warn("Supabase save exception:", err)
    return { success: false, error: err?.message || "Unknown error saving to Supabase" }
  }
}
