# AI Analysis Jobs

## Purpose

This document defines the AI analysis jobs that may be considered for
`world-forecast-system-main` after the Codex App Server prerequisites are in
place.

This is a planning document only. It does not add runtime code, worker code,
database migrations, external API calls, or production forecast behavior.

Related policies:

- `docs/CODEX_APP_SERVER.md`
- `docs/HUMAN_APPROVAL.md`
- `docs/CONTEXT_PACKS.md`
- `docs/SELF_IMPROVEMENT_LOOP.md`

## Operating Principle

AI analysis jobs are sidecar tasks. They may prepare proposals, summaries, and
review notes for a human operator, but they must not become the source of record
for production forecasts, prices, evaluations, or saved predictions.

Every AI job output is proposal data until a human reviews it. Human rejection
and needs-revision outcomes must remain valid.

## Allowed Job Types

Allowed jobs are read-only analysis or planning tasks, such as:

- Summarize recent forecast performance from approved context packs
- Identify recurring forecast miss patterns for human review
- Draft review notes for forecast, Hormuz, or dashboard behavior
- Suggest risk-label changes as proposals
- Suggest follow-up investigation tasks for a task board
- Compare proposal versions and summarize differences
- Prepare refactor notes for `/api/forecast` without changing code
- Explain why an AI proposal should be approved, rejected, or revised

Allowed jobs must keep estimated, simulated, mock, and AI-generated labels
visible in their outputs.

## Forbidden Job Types

AI jobs must not:

- Generate or save production forecasts directly
- Fetch live prices as the source of record
- Evaluate 10-minute prediction outcomes as the source of record
- Write directly to production forecast, price, evaluation, or prediction data
- Modify `/api/forecast` behavior
- Modify `/api/hormuz` behavior
- Run database migrations
- Add external API integrations
- Change safety labels or disclaimers automatically
- Publish or post externally
- Trigger automated trading
- Provide investment advice
- Provide maritime navigation decisions
- Provide military decisions or targeting advice

These limits apply even when an AI output claims high confidence.

## Job Input Rules

AI jobs should receive context through a versioned context pack. The context pack
must be prepared according to `docs/CONTEXT_PACKS.md`.

Job inputs must exclude:

- Secrets, API keys, OAuth tokens, and credentials
- `.env` or `.env.local` contents
- Raw local filesystem paths
- NAS paths
- Unnecessary private data
- Unreviewed production write instructions

If a local artifact is relevant, use a sanitized label instead of the raw path.

## Proposal Output Format

Each AI job should produce a structured proposal containing:

- `job_type`
- `context_pack_id`
- `context_pack_version`
- `generated_at`
- `proposal_status`
- `confidence`
- `summary`
- `evidence`
- `limitations`
- `safety_labels`
- `requires_human_approval`
- `recommended_decision`
- `next_review_steps`

The initial `proposal_status` should be `proposal` or `needs_review`. It must
not default to `approved` or `applied`.

## Human Review Gate

A human reviewer must decide whether a proposal is:

- Approved for a later implementation path
- Rejected
- Sent back for revision
- Archived as informational only

Approval does not automatically apply the proposal. Any production change still
requires a separate reviewed implementation path.

## Intake Contract v0

AI Analysis Job Intake Contract v0 is a preparation layer for future AI-sidecar
jobs. It accepts the output of Context Pack Builder v0 and returns a structured
preflight QA report before any AI analysis job could consume that context.

The v0 preflight report checks:

- `context_pack_version` remains `1`
- `human_review_required` remains `true`
- `proposal_only` remains `true`
- `is_production_state` remains `false`
- required safety labels and policy references are present
- the requested `purpose.job_type` is an allowed AI analysis job kind
- included records preserve `source_kind`, `confidence`, `limitations`, and
  matching `source_refs`
- stale records are visible as review issues
- excluded records preserve reviewable reasons
- restricted content is not present in the context pack

Passing preflight only means the context pack is ready for human review. The
allowed next step is `human_review_only`. The intake contract does not add a
Codex App Server runtime, worker runtime, prompt execution, external API calls,
database migrations, `/api` connections, or AI output promotion into production
state.

## Audit Expectations

When proposal storage is implemented, each job result should preserve:

- The exact context pack identifier and version
- The job type and prompt template version
- The generated timestamp
- The human decision
- The decision reason
- The implementation PR or commit reference, if later applied

Audit records must not store secrets, raw local paths, `.env` contents, or
unnecessary private data.

## Non-Goals For PR #5

This planning phase does not add:

- AI job runtime
- Worker scheduler
- Prompt execution code
- Database schema changes
- External API calls
- Production forecast changes
- Production evaluation changes
