# PBX Control Center v0.1.1 Dependency Fix

Overwrite these files over the existing v0.1.0 project root.

Primary runtime fix:

- `@tanstack/react-table`: `^8.21.4` -> `^8.21.3`

Then run:

```cmd
npm install
npm run dev
```

If a partial `node_modules` folder or lockfile exists from a prior failed install, use:

```cmd
rmdir /s /q node_modules 2>nul
if exist package-lock.json del package-lock.json
npm install
npm run dev
```
