const fs = require('fs');

function updatePage(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (let r of replacements) {
        if (content.includes(r.from)) {
            content = content.replace(r.from, r.to);
            changed = true;
        } else if (r.regex) {
            let before = content;
            content = content.replace(r.regex, r.to);
            if (before !== content) changed = true;
        }
    }
    if (changed) fs.writeFileSync(file, content);
}

// 1. AgentsSettingsPage.tsx
updatePage('src/features/settings/AgentsSettingsPage.tsx', [
    {
        from: '<table className="data-table compact-table">',
        to: '<table className="data-table">'
    },
    {
        regex: /<th>Name<\/th>\s*<th>Extension<\/th>\s*<th>Queue<\/th>\s*<th>Status<\/th>\s*<th><\/th>/,
        to: `<th style={{ width: "30%" }}>Name</th>
                <th style={{ width: "20%" }}>Extension</th>
                <th style={{ width: "20%" }}>Queue</th>
                <th style={{ width: "15%" }}>Status</th>
                <th className="col-actions">Actions</th>`
    },
    {
        regex: /<td style={{ fontWeight: 500, color: "var\(--control-text\)" }}>\{agent\.name\}<\/td>\s*<td className="mono">\{agent\.extension\}<\/td>\s*<td className="mono">\{agent\.queue\}<\/td>\s*<td>\s*<span className={`badge \$\{agent\.status === "available" \? "available" : "offline"\}`}>\s*\{agent\.status === "available" \? "Active" : "Inactive"\}\s*<\/span>\s*<\/td>\s*<td style={{ textAlign: "right" }}>/g,
        to: `<td className="cell-truncate" style={{ fontWeight: 500, color: "var(--control-text)" }}>{agent.name}</td>
                      <td className="mono cell-nowrap">{agent.extension}</td>
                      <td className="mono cell-nowrap">{agent.queue}</td>
                      <td className="cell-nowrap">
                        <span className={\`badge \${agent.status === "available" ? "available" : "offline"}\`}>
                          {agent.status === "available" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="col-actions">`
    }
]);

// 2. QueuesSettingsPage.tsx
updatePage('src/features/settings/QueuesSettingsPage.tsx', [
    {
        from: '<table className="data-table compact-table">',
        to: '<table className="data-table">'
    },
    {
        regex: /<th>Queue Name<\/th>\s*<th>Description<\/th>\s*<th>Status<\/th>\s*<th><\/th>/,
        to: `<th style={{ width: "35%" }}>Queue Name</th>
                <th style={{ width: "45%" }}>Description</th>
                <th style={{ width: "10%" }}>Status</th>
                <th className="col-actions">Actions</th>`
    },
    {
        regex: /<td style={{ fontWeight: 500 }}>\{queue\.name\}<\/td>\s*<td>\{queue\.description \?\? "—"\}<\/td>\s*<td>\s*<span className={`badge \$\{queue\.active \? "available" : "offline"\}`}>\s*\{queue\.active \? "Active" : "Inactive"\}\s*<\/span>\s*<\/td>\s*<td style={{ textAlign: "right" }}>/g,
        to: `<td className="cell-truncate" style={{ fontWeight: 500 }}>{queue.name}</td>
                  <td className="cell-truncate">{queue.description ?? "—"}</td>
                  <td className="cell-nowrap">
                    <span className={\`badge \${queue.active ? "available" : "offline"}\`}>
                      {queue.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="col-actions">`
    }
]);

// 3. DidSettingsPage.tsx
updatePage('src/features/did/DidSettingsPage.tsx', [
    {
        from: '<table className="data-table compact-table">',
        to: '<table className="data-table">'
    },
    {
        regex: /<th>Number<\/th>\s*<th>Label<\/th>\s*<th>Status<\/th>\s*<th><\/th>/,
        to: `<th style={{ width: "35%" }}>Number</th>
                <th style={{ width: "45%" }}>Label</th>
                <th style={{ width: "10%" }}>Status</th>
                <th className="col-actions">Actions</th>`
    },
    {
        regex: /<td className="mono">\{did\.number\}<\/td>\s*<td>\{did\.label \?\? "—"\}<\/td>\s*<td>\s*<span className={`badge \$\{did\.active \? "available" : "offline"\}`}>\s*\{did\.active \? "Active" : "Inactive"\}\s*<\/span>\s*<\/td>\s*<td style={{ textAlign: "right" }}>/g,
        to: `<td className="mono cell-nowrap">{did.number}</td>
                  <td className="cell-truncate">{did.label ?? "—"}</td>
                  <td className="cell-nowrap">
                    <span className={\`badge \${did.active ? "available" : "offline"}\`}>
                      {did.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="col-actions">`
    }
]);

