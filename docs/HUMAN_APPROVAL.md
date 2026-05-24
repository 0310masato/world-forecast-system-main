# Human Approval Policy

## Purpose

This document defines the human approval rules for AI analysis proposals in
`world-forecast-system-main`.

For the repository-wide reading order of contract and operations docs, see
`docs/CONTRACTS_INDEX.md`.

The system may use AI to assist analysis, but AI output must not become
production behavior by default.

## Approval Principle

AI output is proposal data until a human explicitly approves it.

Approval must be intentional, visible, and reversible. A default state of
`pending`, `draft`, or `proposal` is preferred over any state that implies the
AI output is already accepted.

## Proposal vs Production State

Proposal state may contain:

- Suggested analysis
- Suggested risk labels
- Suggested forecast review notes
- Suggested task-board items
- Suggested refactor steps
- Suggested context-pack summaries

Production state includes:

- Saved forecasts
- Prediction evaluations
- Price records used as the source of record
- Bias feedback updates
- API responses treated as live behavior
- User-visible operational claims

Proposal state must not automatically become production state.

## Required Approval Gates

Human approval is required before:

- Promoting an AI proposal into production logic
- Changing `/api/forecast`
- Changing `/api/hormuz`
- Writing forecast or evaluation records
- Running a database migration
- Adding an external API integration
- Changing safety disclaimers
- Publishing or posting externally
- Using output for investment, navigation, military, or trading decisions

## Explicitly Forbidden Uses

The system must not use AI output for:

- Investment advice
- Maritime navigation decisions
- Military decisions
- Automated trading
- External posting or publishing
- Direct production forecast writes
- Direct production evaluation writes

These remain forbidden even if an AI proposal claims high confidence.

## Approval Status Model

Future proposal records should use clear status values such as:

- `proposal`
- `needs_review`
- `approved`
- `rejected`
- `needs_revision`
- `applied`

`approved` means a human accepted the proposal. It does not automatically mean
the proposal has been applied to production.

`applied` should only be set after a separate implementation path has safely
made the change.

## Human Review Decision Contract v0

Human Review Decision Contract v0 records how a human handled an AI Analysis Job
Result Contract v0 proposal. It is an audit and review contract only. It does
not apply AI output to production state, update an API, run a database
migration, deploy code, publish externally, or create a saved prediction.

The v0 decision outcomes are:

- `approved_for_later_implementation`
- `rejected`
- `needs_revision`
- `archived_as_informational`

`approved_for_later_implementation` means a human reviewer allows a later,
separate PR or implementation path to be considered. It does not mean automatic
application, production write, API update, DB write, deployment, external
publishing, trading action, navigation guidance, or military guidance.

High-impact operations still require a separate human approval gate and a
dedicated implementation path. The decision record must preserve the boundary
that AI results are proposal-only and human-review-only until a later reviewed
change explicitly implements something within scope.

## Implementation Proposal Contract v0

Implementation Proposal Contract v0 is the next proposal-only contract after a
Human Review Decision Contract v0 record. It may be created only from a decision
whose outcome is `approved_for_later_implementation`, and it only describes a
plan that a future dedicated PR may draft or review.

An implementation proposal is not implementation work. It does not approve,
apply, merge, deploy, publish, write production state, update `/api/forecast` or
`/api/hormuz`, run a database migration, add runtime code, add a scheduler, add
worker behavior, add Codex App Server runtime behavior, or connect an external
API.

`approved_for_later_implementation` remains separate-PR-only. If a later change
needs a database migration, API update, deployment, runtime addition, external
API integration, or production write, that later change needs explicit human
approval and its own dedicated implementation PR.

## Task Board / Handoff Contract v0

Task Board / Handoff Contract v0 is the next contract after an Implementation
Proposal Contract v0 record. It exists to safely hand proposal-only planning to
future human, AI, or Codex work without turning that planning into execution.

Operational rules, templates, allowed statuses, allowed autonomy levels,
protected intended file paths, and reviewer checks are documented in
`docs/TASK_BOARD_HANDOFF.md`.

A task card is a management unit for preparing draft PR instructions only. It is
not an execution command, does not create a PR, does not merge, deploy, update
APIs, run database migrations, connect external APIs, write production state, or
publish externally. A handoff is an asynchronous record that preserves what was
done, what remains open, blockers, risks, and the required next human-reviewed
action; it is not a transient conversation.

If future work needs actual execution, PR creation, merge, deployment, API
updates, DB changes, runtime additions, external API integration, or production
writes, it requires explicit human approval and a dedicated implementation PR.

## Agent Charter / Operations Runbook v0

Agent Charter / Operations Runbook v0 defines how CodexApp or another AI worker
may prepare Japanese proposal-only instructions for human review. It does not
grant authority to execute work, create PRs, merge, deploy, update APIs, write
databases, run migrations, add runtime behavior, connect external APIs, publish
externally, or promote proposal data into production state.

Human approval remains review permission only. If a CodexApp request exposes a
protected path, restricted content, runtime requirement, missing source-chain
context, or production-impacting operation, the worker must stop and return the
request for human review instead of continuing.

## Operations Routine Templates v0

Operations Routine Templates v0 defines proposal-only record formats for
Morning Standup, Weekly Review, Nightly QA Report, Blocker Escalation, and
Silent Failure Audit. See `docs/OPERATIONS_ROUTINES.md`.

Routine reports are human-review artifacts only. They do not run jobs, create
PRs, merge, deploy, update APIs, write databases, run migrations, add runtime,
connect external APIs, automate files, or promote proposal data into production
state.

## Reviewer Responsibilities

The human reviewer should check:

- Whether the proposal is within allowed scope
- Whether it avoids investment, navigation, military, trading, and external
  posting claims
- Whether it hides secrets, `.env` values, and local paths
- Whether it preserves mock, estimated, and simulation labels
- Whether it requires a code change, DB change, or API change
- Whether additional tests are needed

## Audit Trail

When approval records are implemented, they should preserve:

- Reviewer identity or operator label
- Review timestamp
- Proposal version
- Decision
- Short decision reason
- Applied commit or PR reference, when applicable

The audit trail must avoid storing secrets, raw local paths, `.env` contents, or
unnecessary private data.

## Safety Labels

Human-facing review screens and docs should keep these labels clear:

- AI-generated proposal
- Not production state
- Human approval required
- Estimated or simulated where applicable
- Not investment advice
- Not navigation guidance
- Not military guidance
- Not automated trading guidance

## Rollback And Disable Policy

Any future Codex App Server integration should have a simple disable path. If
proposal quality, safety labeling, or approval state becomes unclear, the safe
fallback is to stop consuming AI proposals and keep the production forecast core
running without the sidecar.
