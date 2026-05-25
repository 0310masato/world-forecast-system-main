# Codex App Server Policy

## Purpose

This document defines the intended role and safety boundary for a future Codex
App Server in `world-forecast-system-main`.

The Codex App Server is an AI analysis sidecar. It may help prepare structured
analysis proposals, context summaries, review notes, and operator-facing
recommendations. It must not become part of the production forecast core.

## Core Boundary

The Codex App Server must not own or replace these core forecast operations:

- Production forecast generation
- Price acquisition
- 10-minute forecast evaluation
- Prediction persistence
- Bias feedback updates
- Morning signal persistence
- Hormuz API response generation

The existing application server remains responsible for production state,
database writes, forecast lifecycle, API responses, and operator-visible
production behavior.

## Allowed Responsibilities

A future Codex App Server may be used for:

- Preparing AI analysis proposals
- Summarizing recent forecast performance
- Suggesting risk labels or review notes
- Producing context-pack summaries for human review
- Drafting refactor or investigation tasks for the task board
- Explaining why a proposed change should be accepted, rejected, or revised

All outputs from the Codex App Server are proposals. They are not production
facts, trading signals, navigation instructions, military assessments, or
automatic system changes.

## Forbidden Responsibilities

The Codex App Server must not:

- Generate or save production forecasts directly
- Fetch live prices as the source of record
- Evaluate 10-minute prediction outcomes as the source of record
- Write directly to production prediction tables
- Modify `/api/forecast` behavior without a separate approved implementation PR
- Modify `/api/hormuz` behavior without a separate approved implementation PR
- Run database migrations
- Add external API integrations without explicit approval
- Trigger automated trading
- Publish externally
- Send messages to external services
- Provide investment advice
- Provide maritime navigation decisions
- Provide military decisions or targeting advice

## Proposal Output Rule

AI output must be stored and treated as proposal data.

Every proposal should preserve:

- Proposal type
- Source context version
- Generated timestamp
- Confidence level
- Reasoning summary
- Known limitations
- Required human approval status
- Final human decision, when available

Proposal data must not be used as production state until a human approval gate
has accepted it and a separate approved implementation path applies it.

## Human Approval Requirement

No Codex App Server output may be promoted to production behavior without human
approval.

Human approval is required before:

- Changing forecast logic
- Changing API behavior
- Changing database state
- Changing persistence rules
- Changing safety labels
- Publishing external text
- Using analysis as an operational decision

Rejection and revision must remain valid outcomes.

## Sensitive Data Policy

The Codex App Server must not output:

- Secrets
- API keys
- OAuth tokens
- `.env` or `.env.local` contents
- Raw local filesystem paths
- NAS paths
- User private data that is not necessary for review

If a proposal needs to refer to a local artifact, it should use a sanitized
label such as `local artifact available` rather than the raw path.

## Required Prerequisites Before Full Introduction

Full Codex App Server introduction must wait until these layers exist and are
reviewed:

1. Memory Layer
2. Worker Separation
3. Task Board
4. Context Pack Builder

Until those exist, work should remain documentation-first or limited to small,
explicitly approved non-production scaffolding.

## Non-Goals For This Phase

This policy phase does not add:

- Codex App Server runtime code
- Worker code
- Database migrations
- New package dependencies
- External API calls
- `/api/forecast` changes
- `/api/hormuz` changes

## Implementation Readiness Checklist

Before any implementation PR, confirm:

- The proposal storage model is documented
- Human approval states are documented
- Context pack inputs are sanitized
- Worker and app-server responsibilities are separated
- Secrets and local paths are excluded from outputs
- Rollback or disable behavior is documented
- Tests cover the proposal-only boundary

Implementation readiness and runtime design PR instruction readiness are
different gates. Implementation readiness applies before a dedicated
implementation PR and still requires explicit human approval, scope, tests, and
rollback planning.

After a Runtime Intake record reaches `ready_for_runtime_design_pr`, use
`docs/templates/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_TEMPLATE.md`
to review only whether future runtime design PR instructions may be drafted for
human review. That template does not authorize PR creation, merge, deploy,
runtime implementation, worker runtime, scheduler runtime, API connection, DB
connection, package change, CI change, GitHub automation, file-writing
automation, AI job execution, or production promotion.

Use
`docs/examples/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_EXAMPLE.md`
only as a filled writing sample for that instruction-drafting readiness review.
The example is not implementation readiness, execution permission, a runtime
design PR, or runtime design PR instructions.

Before the first MVP scaffold implementation PR, use
`docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md` to confirm the exact allowed
implementation surface, non-goals, target files, test plan, rollback or disable
plan, and review gate. That scope document is docs-only and does not add
runtime code or authorize execution by itself.

## Agent Charter / Operations Runbook

Before designing or introducing Codex App Server runtime, use
`docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md` as the proposal-only operating
charter for CodexApp instructions. CodexApp instructions must be written in
Japanese, must preserve the existing contract chain, and must stop at human
review or draft-instructions preparation.

This runbook does not authorize runtime implementation. When Codex App Server
runtime design becomes necessary, it must wait for user-provided materials and
a separate scoped PR.

## Runtime Intake Gate

Before preparing a Codex App Server runtime design PR, use
`docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md` and
`docs/templates/CODEX_APP_SERVER_RUNTIME_INTAKE_TEMPLATE.md` to check whether
the user-provided materials, scope, human approval, test plan inputs, and
rollback or disable plan inputs are sufficient for human review.

The intake gate is proposal-only, template-only, human-review-only, and
non-production. It does not authorize Codex App Server runtime code, worker
runtime, scheduler runtime, external API integration, DB migration, `/api`
connections, package or CI changes, GitHub automation, file-writing automation,
AI job execution, deploy, merge, or production promotion.

If the intake outcome is `ready_for_runtime_design_pr`, run the separate
readiness review template before any instruction draft is prepared. Readiness
means instruction-drafting readiness only, not implementation readiness or
execution permission.

The sanitized filled example at
`docs/examples/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_EXAMPLE.md`
shows the review record shape only. It does not permit PR creation, merge,
deploy, implementation, automation, AI job execution, or production promotion.

## Runtime MVP Scope

`docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md` defines the final docs-only scope
for a later Codex App Server Runtime MVP scaffold implementation PR.

The MVP scope is limited to a disabled-by-default, non-production,
proposal-only scaffold. It may define the next PR's allowed files, forbidden
files, data boundary, human approval boundary, test plan, rollback or disable
plan, acceptance criteria, stop conditions, and review checklist.

The MVP scope document does not add runtime code. It does not authorize
production forecast core changes, `/api/forecast`, `/api/hormuz`,
`/api/hormuz/news`, DB writes, migrations, package or dependency changes,
lockfile changes, CI changes, external API integration, scheduler runtime,
worker runtime, GitHub automation, file-writing automation, AI job execution,
external publishing, or production promotion.
