import { BarChart3, TrendingUp, Clock, PhoneCall } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"


import type { PbxCall } from "@/types/pbx"

export function AnalyticsPage({ calls }: { calls: PbxCall[] }) {
  const totalCalls = calls.length;
  const connectedCalls = calls.filter(c => c.status === "connected" || c.status === "hold" || c.status === "completed");
  const totalTalkTime = connectedCalls.reduce((sum, c) => sum + (c.talkSeconds || 0), 0);
  const avgTalkTimeSeconds = connectedCalls.length > 0 ? Math.floor(totalTalkTime / connectedCalls.length) : 0;
  
  const m = Math.floor(avgTalkTimeSeconds / 60).toString().padStart(2, '0');
  const s = (avgTalkTimeSeconds % 60).toString().padStart(2, '0');
  const avgTalkTime = `${m}:${s}`;

  const missedCalls = calls.filter(c => c.status === "missed").length;
  const abandonRate = totalCalls > 0 ? ((missedCalls / totalCalls) * 100).toFixed(1) + "%" : "0.0%";

  // Calculate Peak Hours
  const peakHourMap = new Map<string, number>()
  for (let i = 8; i <= 16; i++) {
    peakHourMap.set(i.toString().padStart(2, '0') + ":00", 0);
  }
  calls.forEach(c => {
    const h = new Date(c.startedAt).getHours().toString().padStart(2, '0') + ":00";
    if (peakHourMap.has(h)) {
      peakHourMap.set(h, peakHourMap.get(h)! + 1);
    } else {
      peakHourMap.set(h, 1);
    }
  });
  
  const peakHourData = Array.from(peakHourMap.entries()).map(([hour, count]) => ({ hour, calls: count })).sort((a, b) => a.hour.localeCompare(b.hour));

  return (
    <main className="page">
      <header className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 12, fontSize: 13, fontWeight: 400 }}>
            <PhoneCall size={16} /> Total Call Volume (Today)
          </div>
          <div style={{ fontSize: 28, fontWeight: 400, color: "var(--text)" }}>{totalCalls}</div>
          <div style={{ fontSize: 11, color: "var(--success-text)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={12} /> Live data
          </div>
        </div>
        
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 12, fontSize: 13, fontWeight: 400 }}>
            <Clock size={16} /> Avg Talk Time
          </div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 400, color: "var(--text)" }}>{avgTalkTime}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Across all active agents</div>
        </div>
        
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", marginBottom: 12, fontSize: 13, fontWeight: 400 }}>
            <BarChart3 size={16} /> SLA Maintenance
          </div>
          <div style={{ fontSize: 28, fontWeight: 400, color: "var(--success-text)" }}>9{abandonRate}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Target: &gt;90%</div>
        </div>
      </div>

      <div className="panel" style={{ padding: 16 }}>
        <h2 style={{ fontSize: 13, fontWeight: 400, color: "var(--muted)", marginBottom: 16 }}>Peak Hour Call Volume</h2>
        <div style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip 
                cursor={{ fill: "var(--row-hover)" }}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 11 }}
              />
              <Bar dataKey="calls" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  )
}
