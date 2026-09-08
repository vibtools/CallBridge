const fs = require('fs');
let file = 'src/app/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('fetchCallsFromDb')) {
  // Add imports
  content = content.replace(
    /import \{ fetchSettingsFromDb, saveSettingsToDb \} from "@\/lib\/settingsDb"/,
    `import { fetchSettingsFromDb, saveSettingsToDb } from "@/lib/settingsDb"
import { fetchCallsFromDb, syncCallsToDb } from "@/lib/callsDb"`
  );

  // Add the initial fetch for calls right after settings fetch
  content = content.replace(
    /fetchSettingsFromDb\(\)\.then\(\(dbSettings\) => \{/,
    `fetchSettingsFromDb().then((dbSettings) => {`
  );
  
  content = content.replace(
    /      if \(dbSettings\) \{\n        setRuntime\(\(current\) => updateRuntimeSettings\(current, \{ \.\.\.current.settings, \.\.\.dbSettings \}, Date\.now\(\)\)\)\n      \}\n    \}\)/,
    `      if (dbSettings) {
        setRuntime((current) => updateRuntimeSettings(current, { ...current.settings, ...dbSettings }, Date.now()))
      }
    })
    
    // Fetch calls from DB on mount
    fetchCallsFromDb().then((dbCalls) => {
      if (dbCalls && dbCalls.length > 0) {
         setRuntime((current) => ({
            ...current,
            calls: dbCalls,
            callSequence: Math.max(current.callSequence, dbCalls.length + 1)
         }))
      }
    })`
  );

  // Add a throttled effect to save calls to DB
  const throttleEffect = `
  const lastSyncRef = React.useRef(0);
  useEffect(() => {
    try {
      window.localStorage.setItem(RUNTIME_STORAGE_KEY, serializeRuntime(runtime))
      
      // Throttle DB sync to every 3 seconds to avoid rate limiting
      const now = Date.now();
      if (now - lastSyncRef.current > 3000) {
        lastSyncRef.current = now;
        if (runtime.calls.length > 0) {
          syncCallsToDb(runtime.calls);
        }
      }
    } catch {
      // The runtime remains functional in memory when browser storage is unavailable.
    }
  }, [runtime])
  `;

  content = content.replace(
    /  useEffect\(\(\) => \{\n    try \{\n      window\.localStorage\.setItem\(RUNTIME_STORAGE_KEY, serializeRuntime\(runtime\)\)\n    \} catch \{\n      \/\/ The runtime remains functional in memory when browser storage is unavailable\.\n    \}\n  \}, \[runtime\]\)/,
    throttleEffect
  );

  // need to import React if it's not imported (App.tsx imports useEffect, useMemo, useState from "react")
  // So we can just use import * as React from "react" or change React.useRef to useRef.
  content = content.replace('const lastSyncRef = React.useRef(0);', 'const lastSyncRef = React.useRef(0);');
  if(!content.includes("useRef")) {
     content = content.replace(/import \{ useEffect, useMemo, useState \} from "react"/, 'import * as React from "react"\nimport { useEffect, useMemo, useState, useRef } from "react"');
  }
  
  content = content.replace(/React\.useRef/g, 'useRef');

  fs.writeFileSync(file, content);
}
