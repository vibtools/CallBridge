const fs = require('fs');
let file = 'src/features/overview/OverviewPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /new Date\(call\.timestamp\)/g,
  'new Date(call.startedAt)'
);

fs.writeFileSync(file, content);
