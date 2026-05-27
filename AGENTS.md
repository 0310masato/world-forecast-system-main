<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repository Safety Rules

## Contract / Docs Index

For the repository-wide map of contract and operations docs, see
`docs/CONTRACTS_INDEX.md`. CodexApp and AI workers must review the index and
the target docs before starting work. The index is not execution permission.

When updating docs or templates, also review
`docs/KNOWLEDGE_DOCS_STEWARDSHIP.md`. CodexApp and AI workers must check docs
for source-of-truth alignment, freshness, duplication, broken references, and
runtime boundary drift. Docs stewardship is not execution permission and does
not authorize package, API, DB, runtime, worker, scheduler, automation, or CI
changes.

## Forecast Core Protection

Do not change `/api/forecast`, `/api/hormuz`, `lib/db.ts`, package files, or
database schema/migrations unless the user explicitly asks for that exact
implementation work.

The production forecast core owns:

- Production forecast generation
- Price acquisition
- 10-minute evaluation
- Prediction persistence
- Bias feedback updates
- Production API behavior

## Codex App Server Policy

A future Codex App Server must be treated as an AI analysis sidecar only. It may
prepare analysis proposals, context summaries, review notes, and task
suggestions, but it must not become the source of record for production
forecasts, prices, evaluations, or saved predictions.

AI outputs must be stored and reviewed as proposals. Do not promote an AI output
into production behavior without human approval.

Full Codex App Server introduction must wait until these layers exist and are
reviewed:

1. Memory Layer
2. Worker Separation
3. Task Board
4. Context Pack Builder

## Human Approval Boundary

Human approval is required before applying any AI proposal to:

- Forecast logic
- API behavior
- Database state
- Persistence rules
- Safety labels
- External publishing or posting
- Operational decisions

Rejected and needs-revision outcomes must remain valid.

## Forbidden AI Uses

Do not use this system or future Codex App Server output for:

- Investment advice
- Maritime navigation decisions
- Military decisions
- Automated trading
- External posting or publishing
- Direct production forecast writes
- Direct production evaluation writes

## Secret And Local Path Handling

Do not output, log, commit, or serialize:

- Secrets
- API keys
- OAuth tokens
- `.env` or `.env.local` contents
- Raw local filesystem paths
- NAS paths
- Unnecessary private data

If a local artifact must be referenced in a human-facing proposal, use a
sanitized label instead of the raw path.

## Documentation-First App Server Work

Until the Memory Layer, Worker Separation, Task Board, and Context Pack Builder
are in place, Codex App Server work should remain documentation-first or limited
to explicitly approved non-production scaffolding. Do not add runtime server
code, worker code, external API calls, DB migrations, or package dependencies as
part of policy documentation tasks.

## Task Board And Handoff Operating Boundary

Task Board / Handoff Contract v0 follows the PR #17 contract. TaskCards are
proposal-only management records for draft PR instructions; they are not
execution commands. Handoffs are durable asynchronous handoff artifacts; they
are not conversation logs.

AI workers and CodexApp must keep Task Board autonomy limited to:

- `A0_advice_only`
- `A1_draft_only`
- `A2_prepare_for_approval`

Do not use a TaskCard or Handoff to automatically create a PR, merge, deploy,
change an API, run a database migration, write production state, add runtime
code, add worker behavior, add scheduler behavior, add Codex App Server runtime
behavior, connect an external API, publish externally, or promote proposal data
into production state.

If execution is needed, stop at human review. The execution must have explicit
human approval and a dedicated implementation PR with its own scope, tests, and
rollback plan.

CodexApp work must start from a clean branch and clean worktree. Do not touch
uncommitted changes from the original checkout, and do not stage unrelated
files.

## Agent Charter / Operations Runbook Boundary

Agent Charter / Operations Runbook v0 is documentation-only operating guidance
for CodexApp and AI worker requests. It does not add Codex App Server runtime,
worker runtime, scheduler runtime, external API integration, DB migration,
GitHub automation, file-writing automation, or production promotion.

CodexApp instruction drafts must be written in Japanese while preserving
contract field names, enum values, IDs, file names, and code identifiers in
their defined form. Use `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md` and
`docs/templates/CODEXAPP_OPERATION_REQUEST_TEMPLATE.md` for proposal-only
Japanese request drafting.

## Operations Routine Templates Boundary

Operations Routine Templates v0 is docs/templates only. Morning Standup,
Weekly Review, Nightly QA, Blocker Escalation, and Silent Failure Audit
templates are human-review record formats, not execution instructions.

Do not add scheduler, worker, runtime, Codex App Server runtime, API, DB,
external integration, GitHub automation, file-writing automation, package, or CI
changes for routine template work. If execution becomes necessary later, stop
for human approval and use a dedicated implementation PR with its own scope,
checks, and rollback plan.

## Applied AI Dev Relay Kit: v0.1.0

This repository applies AI Dev Relay Kit v0.1.0 as an operating layer for
Web GPT, Codex app, GitHub, and human review. This section adds review and
handoff requirements. It does not weaken any protected core, human approval,
secret handling, docs stewardship, or runtime boundary rule above.

Codex app must produce a PR Review Packet before asking for review. The packet
must include:

- Summary of the change and why it was requested.
- Exact changed files.
- Requested scope, completed scope, and non-goals.
- CI, lint, test, build, and smoke evidence.
- Skipped checks with the reason and remaining risk.
- High-risk change inventory.
- Known risks, rollback notes, and follow-up work when relevant.
- Human approval status for commit, push, merge, deploy, or production
  promotion.

Web GPT should review whether:

- The change matches the requested scope.
- The changed files match the PR Review Packet.
- CI, lint, test, build, and smoke evidence is present, or skipped checks are
  justified.
- High-risk areas are declared and isolated.
- The PR does not imply merge, deploy, release, external publishing, or
  production promotion without explicit human approval.
- Existing world-forecast safety labels, mock/simulated/estimated disclaimers,
  secret handling, and proposal-only boundaries remain intact.

Codex app must not commit or push unless the human explicitly approves that
action for the current task, repository, and branch. When commit or push is
approved, stage only the approved files and summarize the staged diff before
committing. Do not force push.

Merge, deploy, release, external publishing, and production promotion are
blocked until explicit human approval is given for that exact action.

Treat these world-forecast-system-main areas as high-risk:

- API: `app/api/forecast`, `app/api/hormuz`, `app/api/hormuz/news`.
- DB / memory: `lib/db.ts`, `lib/memory/*`, and `better-sqlite3`.
- File-writing: `lib/nas.ts`, `lib/memory/write.ts`, and write-related
  runtime helpers.
- Package: `package.json` and `package-lock.json`.
- CI: `.github/workflows/ci.yml`.
- App/runtime: `app/`, `components/`, and `lib/codex-app-server-runtime/*`.
- Secrets/env: `.env*`, `process.env`, and external provider keys.
- Production promotion, deploy, release, external publishing, and operational
  decision paths.

For high-risk changes, stop for explicit scope confirmation unless the current
task already names the exact high-risk files and action. Keep such changes
small, include stronger validation evidence, and document rollback or
mitigation in the PR Review Packet.
