# Cloud PBX Phone — Project Structure

This repository is a VibProject-based UI-only PBX operations dashboard. This README explains repository structure and responsibility boundaries only.

## Repository Structure

```text
.
├── .github/              GitHub repository configuration
├── assets/               Static/public brand and project assets
├── config/               Project configuration
├── data/                 Mock/runtime data resources
├── docs/                 Public/user documentation
├── examples/             Public examples
├── project/              Private/internal project management workspace
├── scripts/              Project utility and verification scripts
├── src/                  React/Vite application source
├── tests/                Automated/static tests
├── AGENTS.md             Repository behavior and placement rules
├── CHANGELOG.md          Public change history
├── LICENSE               MIT license
├── PROJECT_STRUCTURE.md  Detailed structure contract
├── VERSIONING.md         Public versioning policy
├── setup-project.ps1     Fresh-project workspace preparation
└── vibproject.ygit       VPMS v2 project manifest
```

## Responsibility Boundary

```text
project/  → INTERNAL project development and management
docs/     → PUBLIC user documentation
README.md → PROJECT STRUCTURE only
```
