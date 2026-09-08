# Cloud PBX Phone AI & Developer Repository Rules

## Source Baseline

This project was created from `vibtools/vibproject-template` baseline commit `a106198176e281bff0afa9057e40a2b156959dd4`.

## Document Placement

```text
Internal project development/management → project/
Public user documentation               → docs/
Repository structure explanation        → README.md
```

## Scope Control

Follow `project/README.md` and `project/PROJECT_UPDATE_WORKFLOW.md`. Respect the Official Baseline Freeze, per-phase Scope Lock, and Zero Freedom policy. Planning does not authorize implementation unless the applicable plan/scope is explicitly approved.

## Product Boundary

The approved initial scope is a UI-only PBX operations dashboard. No SIP, WebRTC, Asterisk, FreeSWITCH, backend, database, authentication, production telephony control, or deployment work may be introduced without separate approval.

## Git Behavior

Do not initialize, stage, commit, alter remotes, or publish Git state unless explicitly authorized.

## README Freeze Rule

**CRITICAL**: The `CallBridge` branding, description, and the Mermaid diagram (mindmap) for features and quick start at the very top of `README.md` are **FROZEN**. It must NEVER be removed, modified, or overwritten under any circumstances. Always preserve this section exactly as it is in its visual design structure.

## Table Design Guidelines

When creating data tables in this project, you MUST adhere to the following professional and compact design principles:

### 1. Structural Compactness
- Avoid unnecessary white space between columns.
- Use `width: "1%"` and `whiteSpace: "nowrap"` on minor columns (e.g., Status, Time, Actions, Phone Numbers).
- Use `width: "98%"` (or a large percentage) on the primary content column (e.g., Description, Caller Name, Label) so that it flexes appropriately and absorbs the remaining space.

### 2. Responsiveness
- ALWAYS wrap tables in a `<div className="table-wrap">` or similar scrollable container (`overflow-x: auto`) to ensure horizontal scrolling on smaller screens.
- Do not let long texts break the table layout.

### 3. Essential Features for Data-Heavy Tables
For tables expected to hold many records (such as Call History, Logs, or large directories):
- **Pagination MUST be implemented.** (e.g., using `@tanstack/react-table` pagination or custom slice logic).
- **Search / Filter MUST be implemented.** Users should be able to search through the records easily.
- **Rows per page control MUST be included** (e.g., allowing users to select 10, 20, 50 rows).
