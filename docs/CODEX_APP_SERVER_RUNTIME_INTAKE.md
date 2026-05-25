# Codex App Server Runtime Intake Gate v0

## Purpose

Codex App Server Runtime Intake Gate v0 defines the proposal-only intake step
that must happen before a future Codex App Server runtime design PR.

This document exists to check whether user-provided materials are sufficient,
whether the requested scope preserves the existing safety boundary, and whether
human approval, test plan inputs, and rollback or disable plan inputs are clear
enough to consider a later runtime design PR.

This document does not authorize runtime implementation.

## Scope

This intake gate may be used to:

- Record sanitized references to user-provided materials.
- Identify missing materials and open questions.
- Check whether the requested runtime goal is still proposal-only.
- Check whether protected core, API, DB, worker, scheduler, package, CI, and
  external integration boundaries are preserved.
- Decide whether the next human-reviewed action is to wait, revise, prepare
  runtime design PR instructions only, reject for now, or archive.

The intake output is a human-review artifact. It is not production state and is
not an execution command.

## Non-Goals

This intake gate does not add, request, or authorize:

- Codex App Server runtime code
- worker runtime
- scheduler
- external API integration
- DB migration / schema change
- `/api/forecast` connection
- `/api/hormuz` connection
- `/api/hormuz/news` connection
- production forecast core changes
- package / dependency changes
- GitHub Actions / CI changes
- GitHub Issue / PR automation
- file-writing automation
- AI job execution
- production promotion

## Position In Contract Layer

This document follows the existing proposal-only contract and operations layers:

1. Memory Layer
2. Context Pack Builder v0
3. AI Analysis Job Intake Preflight v0
4. AI Analysis Job Result Contract v0
5. Human Review Decision Contract v0
6. Implementation Proposal Contract v0
7. Task Board / Handoff Contract v0
8. Task Board / Handoff Docs & Templates v0
9. Agent Charter / Operations Runbook v0
10. Operations Routine Templates v0
11. Knowledge / Docs Stewardship v0
12. Codex App Server Runtime Intake Gate v0
13. Codex App Server Runtime Design PR Readiness Review Template v0

The intake gate does not replace the earlier contracts. It preserves
`proposal_only: true`, `required_human_approval: true`, and
`is_production_state: false`.

## Required User-Provided Materials

Before a runtime design PR can be considered, the intake record should identify
whether the following materials are present:

- Human owner for the intake.
- Requested runtime goal.
- Sanitized references to source materials.
- Target environment: `local`, `staging`, `production`, or `unknown`.
- Explicit runtime scope and exclusions.
- Expected proposal outputs.
- Human approval requirement.
- Test plan inputs.
- Rollback or disable plan inputs.
- Known blockers, open questions, and residual risks.

If any material is missing, the intake decision should remain
`waiting_for_context` or `human_review_required`.

## Intake Decision Outcomes

Allowed intake decisions are:

- `waiting_for_context`: required source material or scope detail is missing.
- `human_review_required`: human judgment is needed before a next action can be
  selected.
- `blocked_by_scope_risk`: the request touches protected scope, restricted
  content, production state, or an unclear runtime boundary.
- `ready_for_runtime_design_pr`: enough intake context exists to prepare
  runtime design PR instructions only.
- `reject_for_now`: the request should not proceed in its current form.

`ready_for_runtime_design_pr` is not permission to implement runtime code. It
only means a later human-reviewed design PR instruction draft may be prepared.
Before that instruction draft is prepared, use
`docs/templates/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_TEMPLATE.md`
to review whether the intake, bridge TaskCard, Handoff, QA report, scope,
human approval, test plan inputs, and rollback or disable inputs are sufficient
for instruction-drafting readiness.

The readiness review is not PR creation permission, merge permission, deploy
permission, implementation permission, worker runtime permission, scheduler
runtime permission, API or DB connection permission, package or CI change
permission, GitHub automation permission, file-writing automation permission,
AI job execution permission, or production promotion permission.

## Required Human Approval

Human approval is required for every intake outcome.

Human approval means review permission only. It does not allow runtime
implementation, PR creation, merge, deploy, API change, DB write, migration,
worker execution, scheduler execution, external integration, file-writing
automation, AI job execution, or production promotion.

## Safety Boundary

The intake record must not contain:

- secrets
- API keys
- OAuth tokens
- `.env` or `.env.local` values
- raw local filesystem paths
- NAS paths
- private network details
- unnecessary private data

If a source artifact must be referenced, use a sanitized reference such as
`sanitized user-provided runtime notes`.

## Protected Core Boundary

The intake gate must not touch or authorize changes to:

- production forecast generation
- price acquisition
- 10-minute forecast evaluation
- prediction persistence
- bias feedback updates
- production API behavior
- `/api/forecast`
- `/api/hormuz`
- `/api/hormuz/news`
- `lib/db.ts`
- package files
- database schema or migrations

If the requested runtime design needs any protected surface, the intake must
stop with `blocked_by_scope_risk` or `human_review_required`.

## Required Design Inputs Before Runtime PR

Before preparing a runtime design PR instruction draft, the intake should record
whether the following inputs are available:

- Proposed runtime responsibility boundary.
- Worker separation boundary.
- Scheduler boundary, if any.
- Proposal storage boundary.
- Human approval state model.
- Context pack consumption boundary.
- Restricted content handling.
- Failure modes.
- Disable behavior.
- Rollback plan inputs.
- Required review roles.

Missing inputs should be listed in `missing_materials` or `open_questions`.

## Required Test Plan Inputs

The intake should require test or review inputs for:

- Contract boundary review.
- Template field validation.
- Restricted content review.
- Protected path review.
- Proposal-only / production-state separation review.
- Future runtime design review checklist.
- Future disable or rollback verification plan.

This document does not add tests, CI, runtime checks, or automated validation.

## Required Rollback / Disable Plan Inputs

Before any later runtime design PR, the intake should require a proposed
disable path that keeps the production forecast core operating without the
Codex App Server sidecar.

At minimum, the intake should ask for:

- What can be disabled.
- Who can decide to disable it.
- Which proposal consumption path stops first.
- How production forecast behavior remains unchanged.
- Which human review signal triggers rollback or disable.

## Stop Conditions

Stop and return to human review if:

- User-provided materials are missing.
- Runtime, worker, scheduler, DB, API, external integration, or production
  promotion scope is unclear.
- Human approval is missing.
- Test plan inputs are missing.
- Rollback or disable plan inputs are missing.
- Proposal-only and production state boundaries are unclear.
- Protected core or protected paths are in scope.
- Restricted content appears in the intake.
- The request asks for PR creation, merge, deploy, GitHub automation,
  file-writing automation, AI job execution, or production promotion.

## Output Contract

An intake record must preserve:

- `intake_version: 1`
- `proposal_only: true`
- `is_production_state: false`
- `required_human_approval: true`
- `protected_core_touched: false`
- a single `intake_decision`
- a human-readable `decision_reason`
- open questions, blockers, and residual risks
- a required human-reviewed next action

Use `docs/templates/CODEX_APP_SERVER_RUNTIME_INTAKE_TEMPLATE.md` for the
recommended record shape.

For a sanitized filled example, see
`docs/examples/CODEX_APP_SERVER_RUNTIME_INTAKE_EXAMPLE.md`. The example is a
writing sample only. It is not runtime implementation permission.

When a reviewed intake outcome needs to be carried into Task Board / Handoff
review, use `docs/examples/RUNTIME_INTAKE_TASK_CARD_EXAMPLE.md` and
`docs/examples/RUNTIME_INTAKE_HANDOFF_EXAMPLE.md` as writing samples only. If
the bridge records also need QA before human review, use
`docs/examples/RUNTIME_INTAKE_TASK_BOARD_QA_REPORT_EXAMPLE.md` as a QA report
writing sample. These examples preserve sanitized references, durable facts,
open questions, blockers, residual risks, QA checks, and human-reviewed next
actions. They do not authorize runtime implementation, PR creation, merge,
deploy, worker or scheduler behavior, API or DB connections, package changes,
CI changes, file-writing automation, or production promotion.

After those bridge records have been reviewed, use
`docs/templates/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_TEMPLATE.md`
before drafting future runtime design PR instructions. That template checks
instruction-drafting readiness only and does not create a PR, merge, deploy,
or implement runtime behavior.

## Relationship To Existing Docs

- `AGENTS.md` remains the repository safety boundary for protected core,
  restricted content, and documentation-first App Server work.
- `docs/CONTRACTS_INDEX.md` remains the contract and operations docs map.
- `docs/CODEX_APP_SERVER.md` remains the Codex App Server sidecar policy.
- `docs/HUMAN_APPROVAL.md` remains the human approval policy.
- `docs/AI_ANALYSIS_JOBS.md` remains the AI job proposal boundary.
- `docs/CONTEXT_PACKS.md` remains the sanitized context input boundary.
- `docs/AGENT_CHARTER_OPERATIONS_RUNBOOK.md` remains the CodexApp operating
  runbook for proposal-only Japanese instructions.
- `docs/KNOWLEDGE_DOCS_STEWARDSHIP.md` remains the docs quality and boundary
  review layer.
- `docs/examples/CODEX_APP_SERVER_RUNTIME_INTAKE_EXAMPLE.md` remains a
  sanitized example record for this intake gate. It is not a source contract or
  execution permission.
- `docs/examples/RUNTIME_INTAKE_TASK_CARD_EXAMPLE.md` and
  `docs/examples/RUNTIME_INTAKE_HANDOFF_EXAMPLE.md` remain sanitized bridge
  examples for moving an intake outcome into Task Board / Handoff review. They
  are not source contracts, PR requests, or execution permission.
- `docs/examples/RUNTIME_INTAKE_TASK_BOARD_QA_REPORT_EXAMPLE.md` remains a
  sanitized QA report bridge example for reviewing Runtime Intake TaskCard and
  Handoff examples before human review. It is not a source contract, PR
  request, or execution permission.
- `docs/templates/CODEX_APP_SERVER_RUNTIME_DESIGN_PR_READINESS_REVIEW_TEMPLATE.md`
  remains a human-review-only readiness checklist for deciding whether future
  runtime design PR instructions may be drafted. It is not a source contract,
  runtime design PR, PR request, or execution permission.

## What This Document Does Not Authorize

This document does not authorize:

- implementation
- runtime code
- worker code
- scheduler code
- API connections
- DB writes
- migrations
- external API integrations
- dependency changes
- CI changes
- GitHub Issue / PR automation
- file-writing automation
- AI job execution
- merge
- deploy
- external publishing
- investment advice
- navigation guidance
- military guidance
- automated trading
- production promotion
