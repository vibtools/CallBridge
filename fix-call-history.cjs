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

updatePage('src/features/call-history/CallHistoryPage.tsx', [
    {
        from: '<table className="data-table">',
        to: '<table className="data-table">'
    },
    {
        regex: /<th>Direction<\/th>\s*<th>Caller<\/th>\s*<th>Destination<\/th>\s*<th>Status<\/th>\s*<th>Duration<\/th>\s*<th>Agent<\/th>\s*<th><\/th>/,
        to: `<th style={{ width: "12%" }}>Direction</th>
                <th style={{ width: "25%" }}>Caller</th>
                <th style={{ width: "25%" }}>Destination</th>
                <th style={{ width: "15%" }}>Status</th>
                <th style={{ width: "10%" }}>Duration</th>
                <th style={{ width: "13%" }}>Agent</th>
                <th className="col-actions"></th>`
    },
    {
        regex: /<td>\s*<div className="direction">\s*<DirectionIcon size={12} \/>\s*\{call\.direction\}\s*<\/div>\s*<\/td>\s*<td>\s*<div className="call-number">\{call\.caller\}<\/div>\s*<div className="call-name">\{call\.callerName\}<\/div>\s*<\/td>\s*<td>\s*<div className="call-number">\{call\.callee\}<\/div>\s*<div className="call-name">\{call\.queue \?\? call\.extension \?\? "—"\}<\/div>\s*<\/td>\s*<td>\s*<span className={`badge \$\{statusColor\}`}>\s*<StatusIcon size={10} \/>\s*\{call\.status\}\s*<\/span>\s*<\/td>\s*<td className="mono">\{formatDuration\(call\.totalSeconds\)\}<\/td>\s*<td>\{call\.agent \?\? "—"\}<\/td>\s*<td>/g,
        to: `<td className="cell-nowrap">
                  <div className="direction">
                    <DirectionIcon size={12} />
                    {call.direction}
                  </div>
                </td>
                <td className="cell-truncate">
                  <div className="call-number cell-truncate">{call.caller}</div>
                  <div className="call-name cell-truncate">{call.callerName}</div>
                </td>
                <td className="cell-truncate">
                  <div className="call-number cell-truncate">{call.callee}</div>
                  <div className="call-name cell-truncate">{call.queue ?? call.extension ?? "—"}</div>
                </td>
                <td className="cell-nowrap">
                  <span className={\`badge \${statusColor}\`}>
                    <StatusIcon size={10} />
                    {call.status}
                  </span>
                </td>
                <td className="mono cell-nowrap">{formatDuration(call.totalSeconds)}</td>
                <td className="cell-truncate">{call.agent ?? "—"}</td>
                <td className="col-actions">`
    }
]);

