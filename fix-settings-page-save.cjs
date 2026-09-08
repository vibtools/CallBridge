const fs = require('fs');
let file = 'src/features/settings/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onSettingsChange\({\s*\.\.\.settings,\s*countryCode,/,
  'onSettingsChange({\n      ...settings,\n      engineEnabled,\n      countryCode,'
);

fs.writeFileSync(file, content);
