# Project Context

This file is the work-starting entry point for the Project Context Pack in
`world-forecast-system-main`.

It is written for humans, Web GPT, Codex app, GitHub reviewers, other PCs, and
future AI sessions that need to understand the current project context before
editing.

This file does not replace existing repository rules, contract docs, safety
docs, PR review requirements, or human approval gates.

## Target Project

- Project name: `world-forecast-system-main`
- Repository: `0310masato/world-forecast-system-main`
- Application type: Next.js real-time world forecast dashboard
- Main branch: `main`
- Primary project direction: Real-time Monitor -> World Pattern Memory -> AI Agent Operations Room
- Current operating posture: mock-first, proposal-only, human-review-first

## Applied Kit Version

- AI Dev Relay Kit version: `v0.2.0`
- Source repository: `0310masato/ai-dev-relay-kit`
- Source tag or commit: `v0.2.0`
- Applied date: TBD until merged
- Application status: Draft until the Project Context Pack application PR is merged.

## Purpose

`world-forecast-system-main` is a real-time world forecast and monitoring
dashboard. It currently includes a world forecast surface, map/globe-oriented
views, and Hormuz Sentinel Mode for maritime, energy, weather, news, and
geopolitical monitoring around the Hormuz region.

The project is being extended toward World Pattern Memory and proposal-only AI
analysis workflows. Future AI and Codex App Server work must help human review;
it must not become autonomous production behavior.

This Project Context Pack exists to make the project restartable across Codex
app, Web GPT, GitHub review, other PCs, and future threads.

## Read Order

Before editing, read:

1. `docs/project/CONTEXT.md`
2. `docs/project/DESIGN.md`
3. `docs/project/SPEC.md`
4. `docs/project/STATUS.md`
5. `AGENTS.md`
6. `docs/CONTRACTS_INDEX.md`
7. `.github/pull_request_template.md`

Then read the task-specific source docs listed in `docs/CONTRACTS_INDEX.md`.

For this project, common source docs include:

- `docs/current-system.md`
- `docs/roadmap-world-pattern-memory.md`
- `docs/safety-policy.md`
- `docs/CONTEXT_PACKS.md`
- `docs/HUMAN_APPROVAL.md`

## Source-Of-Truth Docs

These documents remain the source of truth:

- Repository rules, protected paths, and high-risk areas: `AGENTS.md`
- Contract and operations docs map: `docs/CONTRACTS_INDEX.md`
- Current application baseline: `docs/current-system.md`
- Roadmap direction: `docs/roadmap-world-pattern-memory.md`
- Safety policy: `docs/safety-policy.md`
- AI analysis context-pack contract: `docs/CONTEXT_PACKS.md`
- Human approval policy: `docs/HUMAN_APPROVAL.md`
- PR Review Packet requirements: `.github/pull_request_template.md`
- Validation commands: `package.json`
- CI expectations: `.github/workflows/ci.yml`

`docs/project/*.md` summarizes work-starting context only. It does not replace
those source-of-truth docs.

## Difference From `docs/CONTEXT_PACKS.md`

`docs/project/CONTEXT.md` and `docs/CONTEXT_PACKS.md` are different.

- `docs/project/CONTEXT.md` is a repository-level work-starting context file.
  It helps a human or AI session understand the project before work begins.
- `docs/CONTEXT_PACKS.md` defines sanitized context packs for future AI analysis
  jobs. Those context packs are inputs to proposal generation and human review.

This Project Context Pack is not an AI job input contract, not production state,
not a runtime feature, not an execution log, and not approval to perform
protected work.

## Update Rules

Update Project Context Pack files when durable project context changes:

- Update `DESIGN.md` when project purpose, design principles, safety posture,
  proposal-only boundaries, or non-goals change.
- Update `SPEC.md` when expected behavior, inputs, outputs, UI, data,
  integrations, validation expectations, or acceptance criteria change.
- Update `STATUS.md` when current phase, completed work, in-progress work,
  blockers, latest PRs, or restart notes change.
- If a PR changes code or docs but does not update context files, explain why in
  the PR Review Packet.

Avoid copying long sections from source-of-truth docs. Prefer a short summary
plus a link to the source doc.

## Approval Boundary

Project Context Pack content is not approval for:

- Commit
- Push
- Pull request creation
- Merge
- Deploy
- Release
- External publishing
- Production promotion
- API behavior changes
- DB writes or migrations
- Runtime, worker, scheduler, package, CI, or file-writing automation changes

AI Dev Relay Kit v0.1.0 PR Review Packet, evidence, high-risk inventory, and
human approval rules remain active.

## Notes For The Next AI Session

- Verify `git status --short`, current branch, and `origin/main` before editing.
- Work from a clean branch and clean worktree.
- Do not touch unrelated dirty changes from another checkout.
- Preserve mock-first behavior and visible `MOCK`, `SIMULATED`, and
  `ESTIMATED` labels.
- Preserve proposal-only AI sidecar boundaries and human-review-only workflows.
- Do not use this system for investment decisions, navigation decisions,
  military decisions, or automated trading guidance.
- Do not expose secrets, `.env` contents, raw local paths, NAS paths, API keys,
  OAuth tokens, credentials, or unnecessary private data.
- Treat `AGENTS.md` high-risk paths as requiring explicit scope confirmation and
  stronger validation evidence.
