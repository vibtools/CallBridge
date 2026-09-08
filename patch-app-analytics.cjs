const fs = require('fs');
let file = 'src/app/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /: page === "analytics" \? <AnalyticsPage \/>/,
  ': page === "analytics" ? <AnalyticsPage calls={calls} />'
);

fs.writeFileSync(file, content);
