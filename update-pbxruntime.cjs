const fs = require('fs');
let file = 'src/runtime/pbxRuntime.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('export function clearRuntimeData')) {
  content += `\nexport function clearRuntimeData(state: PbxRuntimeState, nowMs = Date.now()): PbxRuntimeState {
  return {
    ...state,
    calls: [],
    wrapUpUntil: {},
    lastProcessedAt: nowMs
  }
}\n`;
  fs.writeFileSync(file, content);
}
