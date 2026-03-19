# How to customize

## 1) Edit CLAUDE.md
- Fill placeholders: project name, stack, commands.
- Add non-negotiable rules that must always be respected.

## 2) Adjust permissions
Edit `.claude/settings.local.json`:
- Add/remove `Skill(...)`
- Add/remove `Bash(...)` patterns as needed

## 3) Add/modify skills
Each skill folder must contain a `SKILL.md` with YAML metadata:
- `name`, `description`, `version`

Use keywords to encourage auto-activation.

## 4) Keep it project-local
Prefer `.claude/skills/` per repository for portability.
