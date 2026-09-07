// v0.3.1 compatibility facade.
// The live application runtime is timestamp-driven and persisted in src/runtime/pbxRuntime.ts.
export {
  MAX_INCOMING_DELAY_MS,
  MAX_INCOMING_RING_MS,
  MIN_INCOMING_DELAY_MS,
  createInitialRuntime,
  reconcileRuntime,
  restoreRuntime,
  serializeRuntime,
} from "@/runtime/pbxRuntime"
