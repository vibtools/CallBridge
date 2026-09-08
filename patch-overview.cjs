const fs = require('fs');
let file = 'src/features/overview/OverviewPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<StatCard label="Today Total Call" value=\{calls.length \+ 138\} icon=\{Phone\} tone="primary" \/>/,
  '<StatCard label="Today Total Call" value={calls.length} icon={Phone} tone="primary" />'
);

content = content.replace(
  /<StatCard label="Missed Today" value=\{missed \+ 26\} icon=\{PhoneMissed\} tone="danger" \/>/,
  '<StatCard label="Missed Today" value={missed} icon={PhoneMissed} tone="danger" />'
);

fs.writeFileSync(file, content);
