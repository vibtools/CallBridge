# Run the UI Demo Locally

## Requirements

- Node.js 22.12 or newer recommended for the selected Vite 8 toolchain.
- npm or another compatible package manager.

## Install and run

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run build
npm run verify:static
```

The current `0.3.0` project remains UI-only and supports the existing dark/light themes. The browser-local call engine schedules new inbound calls every 3–5 minutes, resolves incoming calls within 60 seconds, assigns automatically answered calls across existing agents, and automatically completes connected calls within a balanced 2-minute to 2-hour duration range.

The ringtone uses browser audio and therefore begins only after the browser has received a normal user interaction such as a click or key press.
