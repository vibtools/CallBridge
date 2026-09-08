const fs = require('fs');

function updatePage(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.from, r.to);
    }
    fs.writeFileSync(file, content);
}

// 1. PhonebookPage.tsx
updatePage('src/features/directory/PhonebookPage.tsx', [
    {
        from: '<table className="data-table compact-table">',
        to: '<table className="data-table">'
    },
    {
        from: /<th style={{ width: "30%" }}>Name<\/th>\s*<th style={{ width: "25%" }}>Phone Number<\/th>\s*<th style={{ width: "25%" }}>Company<\/th>\s*<th style={{ width: "19%" }}>Speed Dial Code<\/th>\s*<th style={{ width: "1%", textAlign: "right" }}>Actions<\/th>/,
        to: `<th style={{ width: "30%" }}>Name</th>
                <th style={{ width: "25%" }}>Phone Number</th>
                <th style={{ width: "25%" }}>Company</th>
                <th style={{ width: "20%" }}>Speed Dial Code</th>
                <th className="col-actions">Actions</th>`
    },
    {
        from: /<td style={{ fontWeight: 500 }}>\{c\.name\}<\/td>\s*<td className="mono" style={{ fontSize: 13 }}>\{c\.phone\}<\/td>\s*<td><span style={{ fontSize: 11, color: "var\(--muted\)" }}>\{c\.company\}<\/span><\/td>\s*<td className="mono" style={{ fontSize: 11, color: "var\(--muted\)" }}>\{c\.speedDial\}<\/td>\s*<td style={{ textAlign: "right" }}>/g,
        to: `<td className="cell-truncate" style={{ fontWeight: 500 }}>{c.name}</td>
                  <td className="mono cell-nowrap" style={{ fontSize: 13 }}>{c.phone}</td>
                  <td className="cell-truncate"><span style={{ fontSize: 11, color: "var(--muted)" }}>{c.company}</span></td>
                  <td className="mono cell-nowrap"><span style={{ fontSize: 11, color: "var(--muted)" }}>{c.speedDial}</span></td>
                  <td className="col-actions">`
    }
]);

// 2. ExtensionsPage.tsx
updatePage('src/features/directory/ExtensionsPage.tsx', [
    {
        from: '<table className="data-table compact-table">',
        to: '<table className="data-table">'
    },
    {
        from: /<th style={{ width: "1%" }}>Ext<\/th>\s*<th style={{ width: "40%" }}>Name<\/th>\s*<th style={{ width: "20%" }}>Device Status<\/th>\s*<th style={{ width: "30%" }}>Forwarding Rule<\/th>\s*<th style={{ width: "1%", textAlign: "right" }}>Actions<\/th>/,
        to: `<th style={{ width: "10%" }}>Ext</th>
                <th style={{ width: "35%" }}>Name</th>
                <th style={{ width: "25%" }}>Device Status</th>
                <th style={{ width: "30%" }}>Forwarding Rule</th>
                <th className="col-actions">Actions</th>`
    },
    {
        from: /<td className="mono" style={{ fontWeight: 600 }}>\{e\.ext\}<\/td>\s*<td>\{e\.name\}<\/td>\s*<td>\s*<div style={{ display: "flex", alignItems: "center", gap: 6 }}>\s*<span style={{ width: 8, height: 8, borderRadius: "50%", background: e\.status === "online" \? "var\(--success-dot\)" : "var\(--danger-dot\)" }}><\/span>\s*<span style={{ fontSize: 11, color: "var\(--muted\)" }}>\{e\.device\}<\/span>\s*<\/div>\s*<\/td>\s*<td><span style={{ fontSize: 11, color: "var\(--muted\)" }}>\{e\.forwarding\}<\/span><\/td>\s*<td style={{ textAlign: "right" }}>/g,
        to: `<td className="mono cell-nowrap" style={{ fontWeight: 600 }}>{e.ext}</td>
                  <td className="cell-truncate">{e.name}</td>
                  <td className="cell-nowrap">
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.status === "online" ? "var(--success-dot)" : "var(--danger-dot)" }}></span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{e.device}</span>
                    </div>
                  </td>
                  <td className="cell-truncate"><span style={{ fontSize: 11, color: "var(--muted)" }}>{e.forwarding}</span></td>
                  <td className="col-actions">`
    }
]);

// 3. RingGroupsPage.tsx
updatePage('src/features/routing/RingGroupsPage.tsx', [
    {
        from: '<table className="data-table compact-table">',
        to: '<table className="data-table">'
    },
    {
        from: /<th style={{ width: "30%" }}>Group Name<\/th>\s*<th style={{ width: "20%" }}>Strategy<\/th>\s*<th style={{ width: "25%" }}>Members<\/th>\s*<th style={{ width: "24%" }}>No-Answer Destination<\/th>\s*<th style={{ width: "1%", textAlign: "right" }}>Actions<\/th>/,
        to: `<th style={{ width: "25%" }}>Group Name</th>
                <th style={{ width: "20%" }}>Strategy</th>
                <th style={{ width: "25%" }}>Members</th>
                <th style={{ width: "30%" }}>No-Answer Destination</th>
                <th className="col-actions">Actions</th>`
    },
    {
        from: /<td style={{ fontWeight: 500 }}>\{rg\.name\}<\/td>\s*<td><span style={{ fontSize: 11, color: "var\(--text\)" }}>\{rg\.strategy\}<\/span><\/td>\s*<td className="mono" style={{ fontSize: 11, color: "var\(--muted\)" }}>\{rg\.members\}<\/td>\s*<td><span style={{ fontSize: 11, color: "var\(--muted\)" }}>\{rg\.noAnswer\}<\/span><\/td>\s*<td style={{ textAlign: "right" }}>/g,
        to: `<td className="cell-truncate" style={{ fontWeight: 500 }}>{rg.name}</td>
                  <td className="cell-nowrap"><span style={{ fontSize: 11, color: "var(--text)" }}>{rg.strategy}</span></td>
                  <td className="mono cell-truncate" style={{ fontSize: 11, color: "var(--muted)" }}>{rg.members}</td>
                  <td className="cell-truncate"><span style={{ fontSize: 11, color: "var(--muted)" }}>{rg.noAnswer}</span></td>
                  <td className="col-actions">`
    }
]);

// 4. IvrPage.tsx
updatePage('src/features/routing/IvrPage.tsx', [
    {
        from: '<table className="data-table compact-table">',
        to: '<table className="data-table">'
    },
    {
        from: /<th style={{ width: "25%" }}>IVR Name<\/th>\s*<th style={{ width: "25%" }}>Audio Prompt<\/th>\s*<th style={{ width: "30%" }}>Keypress Mapping<\/th>\s*<th style={{ width: "19%" }}>Timeout Action<\/th>\s*<th style={{ width: "1%", textAlign: "right" }}>Actions<\/th>/,
        to: `<th style={{ width: "25%" }}>IVR Name</th>
                <th style={{ width: "25%" }}>Audio Prompt</th>
                <th style={{ width: "25%" }}>Keypress Mapping</th>
                <th style={{ width: "25%" }}>Timeout Action</th>
                <th className="col-actions">Actions</th>`
    },
    {
        from: /<td style={{ fontWeight: 500 }}>\{ivr\.name\}<\/td>\s*<td className="mono" style={{ fontSize: 11, color: "var\(--muted\)" }}>\{ivr\.audio\}<\/td>\s*<td><span style={{ fontSize: 11, color: "var\(--text\)" }}>\{ivr\.mapping\}<\/span><\/td>\s*<td><span style={{ fontSize: 11, color: "var\(--muted\)" }}>\{ivr\.timeoutAction\}<\/span><\/td>\s*<td style={{ textAlign: "right" }}>/g,
        to: `<td className="cell-truncate" style={{ fontWeight: 500 }}>{ivr.name}</td>
                  <td className="mono cell-truncate" style={{ fontSize: 11, color: "var(--muted)" }}>{ivr.audio}</td>
                  <td className="cell-truncate"><span style={{ fontSize: 11, color: "var(--text)" }}>{ivr.mapping}</span></td>
                  <td className="cell-truncate"><span style={{ fontSize: 11, color: "var(--muted)" }}>{ivr.timeoutAction}</span></td>
                  <td className="col-actions">`
    }
]);

// 5. VoicemailPage.tsx
updatePage('src/features/voicemail/VoicemailPage.tsx', [
    {
        from: '<table className="data-table compact-table">',
        to: '<table className="data-table">'
    },
    {
        from: /<th style={{ width: "25%" }}>Date\/Time<\/th>\s*<th style={{ width: "45%" }}>Caller ID<\/th>\s*<th style={{ width: "15%" }}>Duration<\/th>\s*<th style={{ width: "15%", textAlign: "right" }}>Actions<\/th>/,
        to: `<th style={{ width: "25%" }}>Date/Time</th>
                <th style={{ width: "50%" }}>Caller ID</th>
                <th style={{ width: "25%" }}>Duration</th>
                <th className="col-actions">Actions</th>`
    },
    {
        from: /<td className="mono" style={{ fontSize: 11, color: "var\(--muted\)" }}>\{vm\.date\}<\/td>\s*<td style={{ fontWeight: 500 }}>\{vm\.callerId\}<\/td>\s*<td className="mono" style={{ fontSize: 11, color: "var\(--muted\)" }}>\{vm\.duration\}<\/td>\s*<td style={{ textAlign: "right", whiteSpace: "nowrap" }}>/g,
        to: `<td className="mono cell-nowrap" style={{ fontSize: 11, color: "var(--muted)" }}>{vm.date}</td>
                  <td className="cell-truncate" style={{ fontWeight: 500 }}>{vm.callerId}</td>
                  <td className="mono cell-nowrap" style={{ fontSize: 11, color: "var(--muted)" }}>{vm.duration}</td>
                  <td className="col-actions">`
    }
]);

