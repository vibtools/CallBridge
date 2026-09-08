import { supabase } from "./supabase"
import type { PbxSettings } from "@/runtime/pbxRuntime"

// Define a key or row ID to sync settings. 
// Since it's a mock project, we can just use ID = 1
const SETTINGS_ROW_ID = 1

export async function fetchSettingsFromDb(): Promise<Partial<PbxSettings> | null> {
  try {
    const { data, error } = await supabase
      .from("pbx_settings")
      .select("*")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle()

    if (error) {
      console.warn("Failed to fetch settings from Supabase (table may not exist):", error.message)
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

export async function saveSettingsToDb(settings: PbxSettings): Promise<void> {
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
      console.warn("Failed to save settings to Supabase (table may not exist):", error.message)
    } else {
      console.log("Settings synced to Supabase")
    }
  } catch (err) {
    console.warn("Supabase save exception:", err)
  }
}
