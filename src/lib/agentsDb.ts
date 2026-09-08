import type { Agent } from "@/types/pbx"
import { agents as defaultAgents } from "@/mock/agents"

const LOCAL_STORAGE_KEY = "pbx_agents_db"

// Use localStorage for fast, instant loading instead of waiting for placeholder DB to timeout
export async function fetchAgentsFromDb(): Promise<Agent[]> {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      return JSON.parse(cached) as Agent[]
    }
  } catch (err) {
    console.warn("Failed to read from localStorage", err)
  }
  
  // Seed with default if empty
  await saveAllAgentsToDb(defaultAgents)
  return defaultAgents
}

export async function saveAllAgentsToDb(agents: Agent[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(agents))
  } catch (err) {
    console.error("Error saving agents to local DB", err)
  }
}

export async function saveAgentToDb(agent: Agent) {
  const all = await fetchAgentsFromDb()
  const existingIndex = all.findIndex(a => a.id === agent.id)
  if (existingIndex >= 0) {
    all[existingIndex] = agent
  } else {
    all.push(agent)
  }
  await saveAllAgentsToDb(all)
}

export async function deleteAgentFromDb(id: string) {
  const all = await fetchAgentsFromDb()
  const filtered = all.filter(a => a.id !== id)
  await saveAllAgentsToDb(filtered)
}
