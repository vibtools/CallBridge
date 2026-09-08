const fs = require('fs');
let file = 'src/features/analytics/AnalyticsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const dynamicAnalytics = `
import type { PbxCall } from "@/types/pbx"

export function AnalyticsPage({ calls }: { calls: PbxCall[] }) {
  const totalCalls = calls.length;
  const connectedCalls = calls.filter(c => c.status === "connected" || c.status === "hold" || c.status === "completed" || c.status === "wrap-up");
  const totalTalkTime = connectedCalls.reduce((sum, c) => sum + (c.talkSeconds || 0), 0);
  const avgTalkTimeSeconds = connectedCalls.length > 0 ? Math.floor(totalTalkTime / connectedCalls.length) : 0;
  
  const m = Math.floor(avgTalkTimeSeconds / 60).toString().padStart(2, '0');
  const s = (avgTalkTimeSeconds % 60).toString().padStart(2, '0');
  const avgTalkTime = \`\${m}:\${s}\`;

  const missedCalls = calls.filter(c => c.status === "missed").length;
  const abandonRate = totalCalls > 0 ? ((missedCalls / totalCalls) * 100).toFixed(1) + "%" : "0.0%";

  // Calculate Peak Hours
  const peakHourMap = new Map<string, number>()
  for (let i = 8; i <= 16; i++) {
    peakHourMap.set(i.toString().padStart(2, '0') + ":00", 0);
  }
  calls.forEach(c => {
    const h = new Date(c.timestamp).getHours().toString().padStart(2, '0') + ":00";
    if (peakHourMap.has(h)) {
      peakHourMap.set(h, peakHourMap.get(h)! + 1);
    } else {
      peakHourMap.set(h, 1);
    }
  });
  
  const peakHourData = Array.from(peakHourMap.entries()).map(([hour, count]) => ({ hour, calls: count })).sort((a, b) => a.hour.localeCompare(b.hour));
`;

content = content.replace(/const peakHourData \= \[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\}\s*\]\n\nexport function AnalyticsPage\(\) \{/, dynamicAnalytics);

content = content.replace(/1,432/, '{totalCalls}');
content = content.replace(/04:12/, '{avgTalkTime}');
content = content.replace(/4\.2%/, '{abandonRate}');

// Wait, the file might have other hardcoded things like +12.5% or something, let's just make it look good.
content = content.replace(/\+12\.5% vs yesterday/, 'Live data');
content = content.replace(/\-8s vs last week/, 'Live data');
content = content.replace(/\-0\.5% vs last week/, 'Live data');

fs.writeFileSync(file, content);
