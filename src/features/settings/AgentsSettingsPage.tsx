import { useState, useEffect } from "react"
import { Users, Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react"
import type { Agent } from "@/types/pbx"
import { fetchAgentsFromDb, saveAgentToDb, deleteAgentFromDb } from "@/lib/agentsDb"

export function AgentsSettingsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({ name: "", extension: "", queue: "Support" })

  useEffect(() => {
    fetchAgentsFromDb().then((data) => {
      setAgents(data)
      setLoading(false)
    })
  }, [])

  const handleToggleActive = async (agent: Agent) => {
    const updated = { ...agent, status: agent.status === "offline" ? "available" as const : "offline" as const }
    setAgents(agents.map(a => a.id === agent.id ? updated : a))
    await saveAgentToDb(updated)
  }

  const handleDelete = async (id: string) => {
    setAgents(agents.filter(a => a.id !== id))
    await deleteAgentFromDb(id)
  }

  const openAddModal = () => {
    setEditingAgent(null)
    setFormData({ name: "", extension: "", queue: "Support" })
    setModalOpen(true)
  }

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({ name: agent.name, extension: agent.extension, queue: agent.queue })
    setModalOpen(true)
  }

  const saveForm = async () => {
    if (!formData.name.trim() || !formData.extension.trim()) {
      alert("Name and Extension are required")
      return
    }

    if (editingAgent) {
      const updated = { ...editingAgent, ...formData }
      setAgents(agents.map(a => a.id === editingAgent.id ? updated : a))
      await saveAgentToDb(updated)
    } else {
      const newAgent: Agent = {
        id: `a${Date.now()}`,
        name: formData.name,
        extension: formData.extension,
        status: "available",
        queue: formData.queue
      }
      setAgents([...agents, newAgent])
      await saveAgentToDb(newAgent)
    }
    setModalOpen(false)
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agent Settings</h1>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={openAddModal}>
            <Plus size={16} /> Add Agent
          </button>
        </div>
      </div>
      
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Registered Agents</div>
          </div>
        </div>
        
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Loading agents...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Extension</th>
                  <th>Queue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const isOffline = agent.status === "offline"
                  return (
                    <tr key={agent.id} style={{ opacity: isOffline ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 400, color: "var(--control-text)" }}>{agent.name}</td>
                      <td className="mono">{agent.extension}</td>
                      <td>{agent.queue}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button 
                            className="icon-btn" 
                            title={isOffline ? "Activate Agent" : "Deactivate Agent"}
                            onClick={(e) => { e.stopPropagation(); handleToggleActive(agent); }}
                            style={{ color: isOffline ? "var(--success)" : "var(--warning)" }}
                          >
                            {isOffline ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          </button>
                          <button 
                            className="icon-btn" 
                            title="Edit Agent"
                            onClick={(e) => { e.stopPropagation(); openEditModal(agent); }}
                            style={{ color: "var(--info)" }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            className="icon-btn" 
                            title="Delete Agent"
                            onClick={(e) => { e.stopPropagation(); handleDelete(agent.id); }}
                            style={{ color: "var(--danger)" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "var(--overlay)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ 
            background: "var(--surface)", 
            padding: 24, 
            borderRadius: "var(--radius)", 
            width: "100%", 
            maxWidth: 400,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            border: "1px solid var(--border)"
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 400, marginBottom: 16, color: "var(--text)" }}>
              {editingAgent ? "Edit Agent" : "Add New Agent"}
            </h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>Agent Name</label>
              <input 
                autoFocus
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: "100%", padding: "8px 12px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)" }}
                placeholder="e.g. Sarah Miller"
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>Extension</label>
              <input 
                type="text" 
                value={formData.extension} 
                onChange={(e) => setFormData({...formData, extension: e.target.value})}
                style={{ width: "100%", padding: "8px 12px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)" }}
                placeholder="e.g. 250"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>Queue Assignment</label>
              <select 
                value={formData.queue} 
                onChange={(e) => setFormData({...formData, queue: e.target.value})}
                style={{ width: "100%", padding: "8px 12px", background: "var(--input-bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)" }}
              >
                <option value="Support">Support</option>
                <option value="Sales">Sales</option>
                <option value="Billing">Billing</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontWeight: 400, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={saveForm}
                style={{ padding: "8px 16px", borderRadius: 6, background: "var(--primary)", color: "white", fontWeight: 400, border: "none", cursor: "pointer" }}
              >
                {editingAgent ? "Save Changes" : "Add Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
