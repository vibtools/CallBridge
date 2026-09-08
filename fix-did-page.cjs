const fs = require('fs');

let content = fs.readFileSync('src/features/did/DidPage.tsx', 'utf8');

// Replace table definition
content = content.replace(/<table className="data-table compact-table">/g, '<table className="data-table">');

// Replace Table header widths
content = content.replace(/<th style={{ width: "30%" }}>Number<\/th>\s*<th style={{ width: "40%" }}>Label \/ Name<\/th>\s*<th style={{ width: "29%" }}>Routing<\/th>\s*<th style={{ width: "1%", textAlign: "right" }}>Actions<\/th>/, 
    `<th style={{ width: "30%" }}>Number</th>
                <th style={{ width: "40%" }}>Label / Name</th>
                <th style={{ width: "30%" }}>Routing</th>
                <th className="col-actions">Actions</th>`);

// Replace Table body cells
content = content.replace(/<td className="mono" style={{ fontSize: 13, fontWeight: 500 }}>\{did\.number\}<\/td>\s*<td style={{ fontWeight: 500 }}>\{did\.label\}<\/td>\s*<td><span style={{ fontSize: 11, color: "var\(--muted\)" }}>\{did\.routing\}<\/span><\/td>\s*<td style={{ textAlign: "right" }}>/g, 
    `<td className="mono cell-nowrap" style={{ fontSize: 13, fontWeight: 500 }}>{did.number}</td>
                  <td className="cell-truncate" style={{ fontWeight: 500 }}>{did.label}</td>
                  <td className="cell-truncate"><span style={{ fontSize: 11, color: "var(--muted)" }}>{did.routing}</span></td>
                  <td className="col-actions">`);

fs.writeFileSync('src/features/did/DidPage.tsx', content);
