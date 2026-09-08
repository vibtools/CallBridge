const fs = require('fs');
let file = 'src/features/settings/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \[engineEnabled, setEngineEnabled\] = useState\(settings\.engineEnabled \?\? true\)\n  const \[engineEnabled,\n      countryCode, setCountryCode\] = useState\(settings\.countryCode \|\| "\+1"\)/,
  'const [engineEnabled, setEngineEnabled] = useState(settings.engineEnabled ?? true)\n  const [countryCode, setCountryCode] = useState(settings.countryCode || "+1")'
);

fs.writeFileSync(file, content);
