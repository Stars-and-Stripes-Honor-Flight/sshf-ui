# AGENTS.md — SSHF UI

Conventions for every AI agent on this repo (editor assistants, cloud agents, and similar). **Technical guardrails** live in [`.cursorrules`](.cursorrules), [`.cursor/index.mdc`](.cursor/index.mdc), and [`.cursor/rules/`](.cursor/rules/) — read those for stack, auth, API access, OpenAPI sync, and test patterns. This file covers **team workflow** only; it does not repeat rule-file content.

Rule precedence when guidance overlaps: explicit maintainer/user instructions → [`.cursor/index.mdc`](.cursor/index.mdc) → [`.cursor/rules/index.mdc`](.cursor/rules/index.mdc) (see its conflict order).

## Issues and pull requests

- Every PR ties to an issue. PR bodies use **`Refs #N` only** — never `Closes`, `Fixes`, or `Resolves`. Maintainers close issues.
- Open **draft** PRs with a title that describes the **final** outcome (not a “tests only” phase name).
- Use sanctioned GitHub integrations for repo access; do not bypass them with personal tokens in agent chat.

## Phased TDD (maintainer-gated)

Works with the plan-first, test-first flow in [`.cursor/rules/test-first-planning.mdc`](.cursor/rules/test-first-planning.mdc):

1. **Plan** — Short implementation plan; maintainer approves before coding.
2. **Tests** — Add/update tests only; open or update the draft PR (`Refs #N`).
3. **Review** — Maintainer reviews tests and any pinned decisions.
4. **Implement** — Production code on the **same** PR; do not change tests unless a maintainer approves.
5. **Merge** — Maintainer reviews again; `npm test`, `npm run lint`, and `npm run build` pass in dev; maintainer merges.

## Branch hygiene

Before starting or updating work:

```bash
git fetch origin main
git merge --ff-only origin/main
```

Stay **0 commits behind** `main`.

## Quality bar

- Copy existing patterns; test count should **increase**, not shrink.
- Before merge: `npm test`, `npm run lint`, `npm run build`.
- After API contract changes: sync schemas per [`.cursor/rules/openapi-sync-rule.mdc`](.cursor/rules/openapi-sync-rule.mdc) (`npm run sync-schemas` or documented alternatives).
- Prefer robust code over brittle shortcuts.

## Models

Use **Cursor / Grok family** models for coding agents unless a maintainer directs otherwise: harder reasoning and test design on **Grok**; implementation on **Composer** (or equivalent fast editor model).

## Domain facts (display and copy)

Apply on **every** user-visible label, export, and summary:

| Bus # | Color |
|------:|-------|
| 1 | Red |
| 2 | White |
| 3 | Blue |
| 4 | Green |
| 5 | Gold |

Examples: bus 4 → Green; roster codes like **Alpha4** → Alpha **Green**.

- **Medical Team** — guardians with crew position “Medical Team” (not a separate person type in the UI).
- **SSNs** — never collect, display, log, or commit Social Security numbers.
- **AI features** — stay on Google (Gemini / Vertex AI); do not wire other providers without maintainer approval.

## Security

Align with [`.cursor/rules/security-and-secrets-hygiene.mdc`](.cursor/rules/security-and-secrets-hygiene.mdc): no secrets in code, logs, commits, or agent chat; no tokens in the DOM or console.

## Sibling API repo

Backend lives in [sshf-api](https://github.com/Stars-and-Stripes-Honor-Flight/sshf-api). Shared agent conventions: [sshf-api `AGENTS.md`](https://github.com/Stars-and-Stripes-Honor-Flight/sshf-api/blob/main/AGENTS.md). UI changes that need new fields or endpoints require API work there first (or in parallel with OpenAPI sync in this repo).