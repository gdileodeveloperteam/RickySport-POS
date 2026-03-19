---
name: change-summary-writer
description: Writes concise summaries for important changes (what/why/impact) after modifications are made.
version: 1.0.0
---

# Change Summary Writer

## Purpose
After implementing **important changes**, produce a short, consistent summary:
- **What changed**
- **Why it changed**
- **Impact / risks**
Optionally include: files touched, migration notes, and test notes.

This skill is designed to be used in Claude Code to improve traceability and PR/commit quality.

## Auto-activation keywords
- summary
- summarize changes
- what changed
- why did you change
- refactor
- breaking change
- migration
- schema change
- endpoint change
- permissions
- .claude
- CLAUDE.md

## What counts as an IMPORTANT change (MANDATORY)
Generate a Change Summary if at least one applies:
- Architecture / structure changes (new modules, splitting files, new layers)
- New or changed dependencies (npm packages, runtime tools)
- Database changes (DDL, indexes, stored procedures, migrations)
- Public contract changes (API routes, JSON schema, UI behavior, configs)
- Security/auth changes (permissions, roles, session/auth logic)
- Claude Code setup changes (.claude/skills, permissions, CLAUDE.md rules)

Do NOT generate summaries for trivial edits (formatting, minor CSS tweaks, typo fixes).

## Output format (STRICT)
Return exactly this block:

```md
## Change Summary
- **Qué cambió**: <1–2 lines, factual>
- **Por qué**: <1–2 lines, technical reason>
- **Impacto**: <1–3 bullets, scope + risk + follow-ups>
