const fs = require('fs');
let file = 'src/runtime/pbxRuntime.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export function clearRuntimeData\(state: PbxRuntimeState, nowMs = Date.now\(\)\): PbxRuntimeState \{\n  return \{\n    \.\.\.state,\n    calls: \[\],\n    wrapUpUntil: \{\},\n    lastProcessedAt: nowMs\n  \}\n\}/,
  'export function clearRuntimeData(state: PbxRuntimeState, nowMs = Date.now()): PbxRuntimeState {\n  return {\n    ...state,\n    calls: [],\n    wrapUpUntil: {},\n    schedules: {},\n    lastProcessedAt: nowMs,\n    nextIncomingAt: nowMs + 2000 // A tiny delay to let the engine restart\n  }\n}'
);

fs.writeFileSync(file, content);
