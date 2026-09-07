# Changelog

## 0.3.1

- Replaced counter-driven call timing with a persistent timestamp-driven runtime.
- Persisted the next incoming call, call schedules, caller registry, and runtime history.
- Added refresh/background reconciliation and long-gap flood protection.
- Stabilized startup active-call lifetimes.
- Derived agent presence and queue pressure from active runtime calls.
- Preserved existing UI/theme/branding/dependency contracts.

## 0.3.0

- Added autonomous incoming, auto-answer/miss, connected-duration, unique caller, and ringtone behavior.
