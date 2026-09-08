const fs = require('fs');
let file = 'src/runtime/pbxRuntime.ts';
let content = fs.readFileSync(file, 'utf8');

// Add engineEnabled to PbxSettings
content = content.replace(
  /export interface PbxSettings {\n  countryCode: string/,
  'export interface PbxSettings {\n  engineEnabled: boolean\n  countryCode: string'
);

// Add to DEFAULT_SETTINGS
content = content.replace(
  /const DEFAULT_SETTINGS: PbxSettings = {\n  countryCode: "\+1",/,
  'const DEFAULT_SETTINGS: PbxSettings = {\n  engineEnabled: true,\n  countryCode: "+1",'
);

fs.writeFileSync(file, content);
