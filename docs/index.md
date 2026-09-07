# Cloud PBX Phone

Cloud PBX Phone is a UI-only demonstration of a modern PBX operations console. Version `0.3.0` preserves the v0.2.1 compact dark/light interface and adds a browser-local autonomous call lifecycle: recurring inbound calls, automatic answer/missed outcomes, balanced connected-call durations, unique fictional US callers, and ringtone cadence.

## Available Demo Surfaces

- Overview dashboard
- Live Calls
- Incoming Calls
- Call History / CDR
- Call detail timeline and recording UI
- Queue status
- Agent status
- Dark and light interface themes

## Call Activity

New inbound calls are scheduled every 3–5 minutes. Ringing calls resolve within 60 seconds, automatically answered calls are assigned to varying agents, and connected calls complete after balanced randomized durations from 2 minutes to 2 hours. Missed/completed calls remain available through the existing Call History / CDR view.

## Branding

The application uses the project's `assets/brand/` logo and favicon files. Theme selection is available from the topbar and is remembered locally in the browser.

## Important Limitation

No SIP, WebRTC, Asterisk, FreeSWITCH, database, authentication, or production call control is included.
