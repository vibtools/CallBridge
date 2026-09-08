const fs = require('fs');
const file = 'src/lib/agentsDb.ts';

const content = `import { supabase } from "./supabase"
import type { Agent } from "@/types/pbx"
import { agents as defaultAgents } from "@/mock/agents"

const LOCAL_STORAGE_KEY = "pbx_agents_db"
const HAS_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL

export async function fetchAgentsFromDb(): Promise<Agent[]> {
  if (!HAS_SUPABASE) {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (cached) {
        return JSON.parse(cached) as Agent[]
      }
    } catch (err) {
      console.warn("Failed to read from localStorage", err)
    }
    await saveAllAgentsToDb(defaultAgents)
    return defaultAgents
  }

  try {
    const { data, error } = await supabase
      .from("pbx_agents")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Failed to fetch agents from Supabase:", error.message)
      return [] // Return empty or fallback
    }

    if (data && data.length > 0) {
      return data.map(row => ({
        id: row.id,
        name: row.name,
        extension: row.extension,
        status: row.status,
        queue: row.queue || "Support",
        activeCallId: row.active_call_id,
        activeSeconds: row.active_seconds
      }))
    } else {
      // If table is empty, seed it with defaults
      await saveAllAgentsToDb(defaultAgents)
      return defaultAgents
    }
  } catch (err) {
    console.warn("Supabase fetch exception:", err)
    return defaultAgents
  }
}

export async function saveAllAgentsToDb(agents: Agent[]) {
  if (!HAS_SUPABASE) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(agents))
    } catch (err) {
      console.error("Error saving agents to local DB", err)
    }
    return
  }

  try {
    const payload = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      extension: agent.extension,
      status: agent.status,
      queue: agent.queue,
      active_call_id: agent.activeCallId,
      active_seconds: agent.activeSeconds
    }))

    const { error } = await supabase
      .from("pbx_agents")
      .upsert(payload, { onConflict: "id" })

    if (error) {
      console.warn("Failed to save agents to Supabase:", error.message)
    }
  } catch (err) {
    console.warn("Supabase save exception:", err)
  }
}

export async function saveAgentToDb(agent: Agent) {
  if (!HAS_SUPABASE) {
    const all = await fetchAgentsFromDb()
    const existingIndex = all.findIndex(a => a.id === agent.id)
    if (existingIndex >= 0) {
      all[existingIndex] = agent
    } else {
      all.push(agent)
    }
    await saveAllAgentsToDb(all)
    return
  }

  try {
    const payload = {
      id: agent.id,
      name: agent.name,
      extension: agent.extension,
      status: agent.status,
      queue: agent.queue,
      active_call_id: agent.activeCallId,
      active_seconds: agent.activeSeconds
    }

    const { error } = await supabase
      .from("pbx_agents")
      .upsert(payload, { onConflict: "id" })

    if (error) {
      console.warn("Failed to save agent to Supabase:", error.message)
    }
  } catch (err) {
    console.warn("Supabase save exception:", err)
  }
}

export async function deleteAgentFromDb(id: string) {
  if (!HAS_SUPABASE) {
    const all = await fetchAgentsFromDb()
    const filtered = all.filter(a => a.id !== id)
    await saveAllAgentsToDb(filtered)
    return
  }

  try {
    const { error } = await supabase
      .from("pbx_agents")
      .delete()
      .eq("id", id)

    if (error) {
      console.warn("Failed to delete agent from Supabase:", error.message)
    }
  } catch (err) {
    console.warn("Supabase delete exception:", err)
  }
}
`
fs.writeFileSync(file, content);
