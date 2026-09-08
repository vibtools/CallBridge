const fs = require('fs');
let content = fs.readFileSync('src/features/did/DidPage.tsx', 'utf8');

content = content.replace(/<th>Number<\/th>\s*<th>Label<\/th>\s*<th>Status<\/th>/,
    `<th style={{ width: "35%" }}>Number</th>
              <th style={{ width: "50%" }}>Label</th>
              <th className="col-actions">Status</th>`);
              
content = content.replace(/<td className="mono">\{did\.number\}<\/td>\s*<td>\{did\.label \?\? "—"\}<\/td>\s*<td>/g,
    `<td className="mono cell-nowrap">{did.number}</td>
                <td className="cell-truncate">{did.label ?? "—"}</td>
                <td className="col-actions">`);

fs.writeFileSync('src/features/did/DidPage.tsx', content);
