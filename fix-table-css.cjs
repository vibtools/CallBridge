const fs = require('fs');

let css = fs.readFileSync('src/styles/globals.css', 'utf8');

// Replace old table CSS
const oldCssStart = css.indexOf('.data-table {');
const oldCssEnd = css.indexOf('.record-indicator {');

if (oldCssStart !== -1 && oldCssEnd !== -1) {
  const newTableCss = `.data-table { 
  width: 100%; 
  border-collapse: collapse; 
  table-layout: fixed; 
}
.data-table th { 
  height: 32px; 
  padding: 8px 16px; 
  border-bottom: 1px solid var(--table-divider); 
  color: var(--muted); 
  font-size: 10px; 
  font-weight: 600; 
  letter-spacing: .045em; 
  text-align: left; 
  text-transform: uppercase; 
  background: var(--table-head); 
}
.data-table td { 
  height: 44px; 
  padding: 8px 16px; 
  border-bottom: 1px solid var(--table-divider); 
  font-size: 13px; 
  color: var(--text); 
}
.data-table tbody tr:hover { 
  background: var(--row-hover); 
}
.data-table tbody tr:last-child td { 
  border-bottom: 0; 
}

/* Utilities for data grid */
.col-actions {
  width: 80px;
  text-align: right;
  padding-right: 16px !important;
}
.col-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cell-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cell-nowrap {
  white-space: nowrap;
}
.table-wrap {
  width: 100%;
  overflow-x: auto;
}

`;
  css = css.substring(0, oldCssStart) + newTableCss + css.substring(oldCssEnd);
  fs.writeFileSync('src/styles/globals.css', css);
  console.log("CSS updated!");
} else {
  console.log("Could not find CSS boundaries");
}
