const fs = require('fs');
let file = 'src/app/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'updateRuntimeSettings,',
  'updateRuntimeSettings,\n  clearRuntimeData,'
);

content = content.replace(
  /<SettingsPage settings=\{runtime\.settings\} onSettingsChange=\{\(s\) => \{ saveSettingsToDb\(s\); setRuntime\(\(current\) => updateRuntimeSettings\(current, s, Date\.now\(\)\)\) \}\} \/>/,
  '<SettingsPage settings={runtime.settings} onSettingsChange={(s) => { saveSettingsToDb(s); setRuntime((current) => updateRuntimeSettings(current, s, Date.now())) }} onClearData={() => setRuntime(current => clearRuntimeData(current))} />'
);

fs.writeFileSync(file, content);
