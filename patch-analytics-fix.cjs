const fs = require('fs');
let file = 'src/features/analytics/AnalyticsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /new Date\(c\.timestamp\)/g,
  'new Date(c.startedAt)'
);

content = content.replace(
  /c\.status === "completed" \|\| c\.status === "wrap-up"/,
  'c.status === "completed"'
);

fs.writeFileSync(file, content);
