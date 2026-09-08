const fs = require('fs');
let file = 'src/runtime/pbxRuntime.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export function reconcileRuntime\(input: PbxRuntimeState, nowMs = Date\.now\(\)\): PbxRuntimeState {\n  if \(nowMs - input\.lastProcessedAt >= LONG_INACTIVE_RESET_MS\) return rebuildAfterLongGap\(input, nowMs\)/,
  'export function reconcileRuntime(input: PbxRuntimeState, nowMs = Date.now()): PbxRuntimeState {\n  if (input.settings && input.settings.engineEnabled === false) {\n    return { ...input, lastProcessedAt: nowMs };\n  }\n  if (nowMs - input.lastProcessedAt >= LONG_INACTIVE_RESET_MS) return rebuildAfterLongGap(input, nowMs)'
);

fs.writeFileSync(file, content);
