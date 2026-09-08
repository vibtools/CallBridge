const fs = require('fs');
let file = 'src/features/settings/SettingsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('clearAllCallsInDb')) {
  content = content.replace(
    /import type \{ PbxSettings \} from "@\/runtime\/pbxRuntime"/,
    `import type { PbxSettings } from "@/runtime/pbxRuntime"\nimport { clearAllCallsInDb } from "@/lib/callsDb"`
  );

  content = content.replace(
    /onClearData\(\);\n\s*setConfirmClear\(false\);/,
    `onClearData();\n                     clearAllCallsInDb();\n                     setConfirmClear(false);`
  );
  
  fs.writeFileSync(file, content);
}
