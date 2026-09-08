const fs = require('fs');
const files = [
  'src/features/settings/AgentsSettingsPage.tsx',
  'src/features/settings/QueuesSettingsPage.tsx',
  'src/features/did/DidPage.tsx',
  'src/features/did/DidSettingsPage.tsx',
  'src/features/directory/ExtensionsPage.tsx',
  'src/features/directory/PhonebookPage.tsx',
  'src/features/routing/RingGroupsPage.tsx',
  'src/features/routing/IvrPage.tsx',
  'src/features/voicemail/VoicemailPage.tsx',
];

for (let file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // We want to replace <table className="data-table"> with <div className="table-wrap"><table className="data-table">
    // and </table> with </table></div>
    // BUT only if it is not already wrapped.
    
    if (content.includes('<table className="data-table">') && !content.includes('<div className="table-wrap">')) {
      content = content.replace(/<table className="data-table">/, '<div className="table-wrap">\n          <table className="data-table">');
      content = content.replace(/<\/table>/, '</table>\n          </div>');
      fs.writeFileSync(file, content);
      console.log('Wrapped table in', file);
    }
  }
}
