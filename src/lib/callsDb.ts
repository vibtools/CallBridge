import { supabase, HAS_SUPABASE } from "./supabase"
import type { PbxCall } from "@/types/pbx"

// Cache of signatures for calls already saved to Supabase to prevent redundant network requests
const lastSyncedSignatures = new Map<string, string>()
let isSyncInProgress = false

function getCallSignature(call: PbxCall): string {
  return `${call.status}:${call.ringSeconds || 0}:${call.talkSeconds || 0}:${call.totalSeconds || 0}:${call.endedAt || ""}:${call.agent || ""}:${call.timeline?.length || 0}`
}

/**
 * Diagnostic helper to test Supabase CORS, Schema, and Authorization / RLS
 */
export async function diagnoseSupabaseAccess(): Promise<{
  configured: boolean
  networkCors: { ok: boolean; status?: number; error?: string }
  schema: { ok: boolean; columns?: string[]; error?: string }
  authorization: { ok: boolean; error?: string }
}> {
  console.group("%c[Supabase Diagnostics] Running connectivity & security audit...", "color: #3b82f6; font-weight: bold;")
  
  const results = {
    configured: HAS_SUPABASE,
    networkCors: { ok: false } as { ok: boolean; status?: number; error?: string },
    schema: { ok: false } as { ok: boolean; columns?: string[]; error?: string },
    authorization: { ok: false } as { ok: boolean; error?: string },
  }

  if (!HAS_SUPABASE) {
    console.warn("⚠️ Supabase credentials are not configured in .env.local")
    console.groupEnd()
    return results
  }

  // 1. Test Network & CORS with a simple SELECT
  try {
    const t0 = performance.now()
    const { data, error, status, statusText } = await supabase
      .from("pbx_calls")
      .select("id")
      .limit(1)

    const elapsed = Math.round(performance.now() - t0)
    results.networkCors.status = status

    if (error) {
      if (status === 0 || error.message?.toLowerCase().includes("fetch")) {
        results.networkCors.error = `CORS/Network error: ${error.message}`
        console.error("❌ Network/CORS Check: FAILED. Browser could not complete request. Details:", error)
      } else {
        results.networkCors.ok = true
        console.log(`✅ Network/CORS Check: PASSED (HTTP ${status} in ${elapsed}ms)`)
      }
    } else {
      results.networkCors.ok = true
      console.log(`✅ Network/CORS Check: PASSED (HTTP ${status} in ${elapsed}ms)`)
    }
  } catch (err: any) {
    results.networkCors.error = err?.message || String(err)
    console.error("❌ Network/CORS Check: FAILED with exception:", err)
  }

  // 2. Test Schema (fetch full row to inspect columns)
  try {
    const { data, error } = await supabase
      .from("pbx_calls")
      .select("*")
      .limit(1)

    if (error) {
      results.schema.error = `Code ${error.code}: ${error.message}`
      console.error("❌ Schema Check: FAILED. Table 'pbx_calls' might be missing or corrupted:", error)
    } else {
      results.schema.ok = true
      const cols = data && data.length > 0 ? Object.keys(data[0]) : ["(table empty, query succeeded)"]
      results.schema.columns = cols
      console.log("✅ Schema Check: PASSED. Table 'pbx_calls' accessible. Sample columns:", cols)
    }
  } catch (err: any) {
    results.schema.error = err?.message || String(err)
    console.error("❌ Schema Check: FAILED with exception:", err)
  }

  // 3. Test Authorization & RLS with a test probe upsert and delete
  const testProbeId = `DIAG-PROBE-${Date.now()}`
  try {
    const { error: insertError, status: insStatus } = await supabase
      .from("pbx_calls")
      .upsert({
        id: testProbeId,
        caller: "+15550000",
        caller_name: "Diagnostic Probe",
        status: "ended",
        direction: "inbound",
        started_at: new Date().toISOString(),
        timeline: []
      })

    if (insertError) {
      results.authorization.error = `Code ${insertError.code || insStatus}: ${insertError.message} (Hint: ${insertError.hint || "Check RLS policies"})`
      console.error("❌ Authorization / RLS Check: FAILED. Cannot write to 'pbx_calls':", insertError)
    } else {
      results.authorization.ok = true
      console.log("✅ Authorization / RLS Check: PASSED. Anon client can write and upsert records.")
      
      // Cleanup probe row
      await supabase.from("pbx_calls").delete().eq("id", testProbeId)
    }
  } catch (err: any) {
    results.authorization.error = err?.message || String(err)
    console.error("❌ Authorization Check: FAILED with exception:", err)
  }

  console.table({
    "Configured": results.configured ? "✅ Yes" : "❌ No",
    "Network / CORS": results.networkCors.ok ? "✅ Accessible" : `❌ ${results.networkCors.error || "Failed"}`,
    "Schema (pbx_calls)": results.schema.ok ? "✅ Valid" : `❌ ${results.schema.error || "Failed"}`,
    "Authorization / RLS": results.authorization.ok ? "✅ Write Allowed" : `❌ ${results.authorization.error || "Failed"}`
  })
  console.groupEnd()

  return results
}

// Expose on window for easy developer access in console
if (typeof window !== "undefined") {
  (window as any).diagnoseSupabase = diagnoseSupabaseAccess
}

export async function fetchCallsFromDb(): Promise<PbxCall[]> {
  if (!HAS_SUPABASE) return []

  try {
    const { data, error } = await supabase
      .from("pbx_calls")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(250)

    if (error) {
      console.warn("[fetchCallsFromDb] ⚠️ Failed to fetch calls from Supabase:", error.message)
      return []
    }

    if (data) {
      const calls: PbxCall[] = data.map(row => ({
        id: row.id,
        direction: row.direction,
        caller: row.caller,
        callerName: row.caller_name,
        callee: row.callee,
        did: row.did,
        extension: row.extension,
        agent: row.agent,
        queue: row.queue,
        status: row.status,
        startedAt: row.started_at,
        answeredAt: row.answered_at,
        endedAt: row.ended_at,
        ringSeconds: row.ring_seconds || 0,
        talkSeconds: row.talk_seconds || 0,
        totalSeconds: row.total_seconds || 0,
        codec: row.codec,
        recordingAvailable: row.recording_available || false,
        timeline: row.timeline || []
      }))

      // Register initially fetched calls in the signature cache so we don't re-upload unchanged calls
      for (const call of calls) {
        lastSyncedSignatures.set(call.id, getCallSignature(call))
      }

      return calls
    }
  } catch (err: any) {
    console.warn("[fetchCallsFromDb] ⚠️ Supabase fetch exception (calls):", err?.message || err)
  }
  return []
}

export async function syncCallsToDb(
  calls: PbxCall[], 
  options: { forceAll?: boolean } = {}
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (!HAS_SUPABASE) {
    console.warn("[syncCallsToDb] ⚠️ Aborted: Supabase credentials not configured in .env.local")
    return { success: false, error: "Supabase credentials not configured in .env.local" }
  }
  if (!calls || calls.length === 0) {
    return { success: true, count: 0 }
  }

  // Prevent overlapping concurrent sync calls
  if (isSyncInProgress) {
    console.log("[syncCallsToDb] ⏳ In-flight sync already in progress. Skipping overlapping invocation.")
    return { success: true, count: 0 }
  }

  // Identify calls that actually changed or are new, unless forceAll is requested
  const callsToSync = options.forceAll 
    ? calls 
    : calls.filter(call => lastSyncedSignatures.get(call.id) !== getCallSignature(call))

  if (callsToSync.length === 0) {
    console.debug(`[syncCallsToDb] ℹ️ All ${calls.length} calls match database signature cache. 0 records need updating.`)
    return { success: true, count: 0 }
  }

  console.groupCollapsed(`[syncCallsToDb] 🔄 Syncing ${callsToSync.length} of ${calls.length} call(s) to Supabase (mode: ${options.forceAll ? "forceAll" : "diff"})...`)
  console.log("Calls to sync IDs and states:", callsToSync.map(c => ({ id: c.id, status: c.status, duration: c.totalSeconds })))

  isSyncInProgress = true

  try {
    // Format and sanitize each call object to match Supabase 'pbx_calls' schema
    const records = callsToSync.map(call => ({
      id: String(call.id || ""),
      direction: call.direction || "inbound",
      caller: String(call.caller || ""),
      caller_name: String(call.callerName || ""),
      callee: String(call.callee || ""),
      did: String(call.did || ""),
      extension: String(call.extension || ""),
      agent: String(call.agent || ""),
      queue: String(call.queue || "Support"),
      status: String(call.status || "waiting"),
      started_at: call.startedAt || new Date().toISOString(),
      answered_at: call.answeredAt || null,
      ended_at: call.endedAt || null,
      ring_seconds: Number.isFinite(call.ringSeconds) ? Math.round(call.ringSeconds!) : 0,
      talk_seconds: Number.isFinite(call.talkSeconds) ? Math.round(call.talkSeconds!) : 0,
      total_seconds: Number.isFinite(call.totalSeconds) ? Math.round(call.totalSeconds!) : 0,
      codec: String(call.codec || "PCMU"),
      recording_available: Boolean(call.recordingAvailable),
      timeline: Array.isArray(call.timeline)
        ? call.timeline.map(t => ({
            id: String(t.id || ""),
            at: String(t.at || new Date().toISOString()),
            kind: String(t.kind || "info"),
            label: String(t.label || ""),
            detail: t.detail ? String(t.detail) : ""
          }))
        : []
    }))

    // Upsert in batches of 50 to avoid request size limits and guarantee reliability
    const BATCH_SIZE = 50
    let upsertedCount = 0

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(records.length / BATCH_SIZE)
      
      console.log(`[syncCallsToDb] 📤 Dispatching batch ${batchNum}/${totalBatches} (${batch.length} calls) to 'pbx_calls'...`)

      const t0 = performance.now()
      const { data, error, status, statusText } = await supabase
        .from("pbx_calls")
        .upsert(batch, {
          onConflict: "id",
          ignoreDuplicates: false // Ensures updates to active/completed calls overwrite existing records
        })
        .select("id")

      const elapsed = Math.round(performance.now() - t0)

      if (error) {
        // Detailed error classification
        const isCorsOrNetwork = status === 0 || error.message?.toLowerCase().includes("fetch") || error.message?.toLowerCase().includes("network")
        const isAuthOrRls = status === 401 || status === 403 || error.code === "42501"
        const isSchema = error.code === "42P01" || error.code === "42703" || error.code === "23502"

        console.error(`[syncCallsToDb] ❌ Upsert failed on batch ${batchNum}:`, {
          classification: isCorsOrNetwork ? "CORS / Network Error" : isAuthOrRls ? "Authorization / RLS Error" : isSchema ? "Database Schema Error" : "Supabase API Error",
          httpStatus: status,
          statusText,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        })

        if (isCorsOrNetwork) {
          console.warn("[syncCallsToDb] 💡 CORS/Network diagnostic: The browser could not reach Supabase. Check if an ad-blocker (uBlock, Brave Shield) is blocking requests to supabase.co, or if running in an iframe with strict isolation.")
        } else if (isAuthOrRls) {
          console.warn("[syncCallsToDb] 💡 Authorization/RLS diagnostic: Supabase rejected anon write. Verify that Row Level Security (RLS) on 'pbx_calls' has an INSERT and UPDATE policy for public/anon.")
        } else if (isSchema) {
          console.warn("[syncCallsToDb] 💡 Schema diagnostic: Missing table or column in 'pbx_calls'. Verify your table schema in the Supabase SQL editor.")
        }

        console.groupEnd()
        return { success: false, error: `${error.message}${error.details ? ` (${error.details})` : ""}` }
      }

      console.log(`[syncCallsToDb] ✅ Batch ${batchNum}/${totalBatches} successfully written (${batch.length} records, HTTP ${status} ${statusText || "OK"}) in ${elapsed}ms`)

      // Update the cache for successfully upserted calls
      const syncedCallsBatch = callsToSync.slice(i, i + BATCH_SIZE)
      for (const call of syncedCallsBatch) {
        lastSyncedSignatures.set(call.id, getCallSignature(call))
      }

      upsertedCount += batch.length
    }

    console.log(`[syncCallsToDb] 🏁 Successfully synchronized all ${upsertedCount} call(s) to Supabase.`)
    console.groupEnd()
    return { success: true, count: upsertedCount }
  } catch (err: any) {
    console.error("[syncCallsToDb] ❌ Caught unhandled exception during sync:", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    })
    console.groupEnd()
    return { success: false, error: err?.message || "Connection error syncing calls to Supabase" }
  } finally {
    isSyncInProgress = false
  }
}

export async function clearAllCallsInDb() {
  lastSyncedSignatures.clear()
  if (!HAS_SUPABASE) return
  
  try {
    const { error } = await supabase
      .from("pbx_calls")
      .delete()
      .neq("id", "0") // Delete all
      
    if (error) {
      console.warn("Failed to clear calls in Supabase:", error.message)
    }
  } catch (err) {
    console.warn("Supabase clear exception (calls):", err)
  }
}
