<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repository Safety Rules

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
