# Project Structure Standard

## Purpose

Cloud PBX Phone is derived from the Vib Project Template baseline `a106198176e281bff0afa9057e40a2b156959dd4`. The canonical VibProject separation between implementation, internal project management, and public documentation is preserved.

## Standard Repository Structure

- `src/` — actual React/TypeScript implementation.
- `tests/` — automated and static contract tests.
- `scripts/` — setup, verification, build, and maintenance utilities.
- `assets/` — images, icons, favicons, and other static resources; configured as the Vite public static directory.
- `config/` — project configuration when required.
- `data/` — mock/runtime data when required.
- `examples/` — public examples when required.
- `docs/` — exclusively public/user-facing documentation.
- `project/` — canonical private/internal planning, architecture, research, specifications, scope, and implementation records.
- `.github/` — GitHub-specific repository configuration.

## Root File Responsibilities

- `README.md` explains structure only.
- `AGENTS.md` defines repository-level behavior and placement rules.
- `vibproject.ygit` contains VPMS v2 metadata for this project.
- `docs/docs.manifest.ygit` describes the public documentation package.
- `setup-project.ps1` prepares a copied fresh-project workspace and never publishes Git state.

## Responsibility Boundary

```text
project/  → INTERNAL project development and management
docs/     → PUBLIC user documentation
README.md → PROJECT STRUCTURE only
```
