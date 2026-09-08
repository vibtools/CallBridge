const fs = require('fs');
const file = 'src/components/pbx/CdrTable.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure the table is wrapped in a div with overflow-x: auto;
if (!content.includes('<div className="table-wrap">')) {
  content = content.replace(/<div className="table-wrap" style={{ flex: 1, overflowY: "auto" }}>/g, '<div className="table-wrap" style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>');
}

// Fix column widths in CdrTable if it has explicit widths
// CdrTable seems to use standard headers, I need to check its column definitions.
fs.writeFileSync(file, content);
