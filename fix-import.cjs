const fs = require('fs');
let file = 'src/app/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { useEffect, useMemo, useState, useRef } from "react"')) {
  content = content.replace(
    /import \{\s*useEffect,\s*useMemo,\s*useState\s*\} from "react"/,
    'import { useEffect, useMemo, useState, useRef } from "react"'
  );
  fs.writeFileSync(file, content);
}
