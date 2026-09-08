const fs = require('fs');
const file = 'src/components/pbx/CdrTable.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /style={{ textAlign: header\.column\.id === "recordingAvailable" \? "right" : "left" }}/g, 
  'style={{ minWidth: (header.column.id === "caller" || header.column.id === "callee") ? 140 : "auto", textAlign: header.column.id === "recordingAvailable" ? "right" : "left" }}'
);

fs.writeFileSync(file, content);
