const fs = require('fs');
let file = 'src/features/overview/OverviewPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const dynamicActivity = `
  // Calculate activity chart data based on actual calls
  const activityMap = new Map<string, { time: string, inbound: number, outbound: number }>()
  
  // Initialize buckets for the last 12 hours
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 60 * 60 * 1000).getHours().toString().padStart(2, '0')
    activityMap.set(h, { time: h, inbound: 0, outbound: 0 })
  }

  calls.forEach(call => {
    const h = new Date(call.timestamp).getHours().toString().padStart(2, '0')
    const bucket = activityMap.get(h)
    if (bucket) {
      if (call.direction === "inbound") bucket.inbound++
      if (call.direction === "outbound") bucket.outbound++
    }
  })
  
  const activity = Array.from(activityMap.values())
`;

content = content.replace(
  /const activity \= \[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\]\n\nexport function OverviewPage\(\{ calls, agents, queues \}: \{ calls: PbxCall\[\]; agents: Agent\[\]; queues: Queue\[\] \}\) \{/,
  `export function OverviewPage({ calls, agents, queues }: { calls: PbxCall[]; agents: Agent[]; queues: Queue[] }) {${dynamicActivity}`
);

fs.writeFileSync(file, content);
