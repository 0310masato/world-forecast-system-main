# Self-Improvement Loop

## Purpose

This document defines a proposal-only loop for turning AI analysis into reviewed
improvement ideas in `world-forecast-system-main`.

This is a planning document only. It does not add runtime code, worker code,
database migrations, external API calls, or automatic improvement behavior.

Related policies:

- `docs/CODEX_APP_SERVER.md`
- `docs/HUMAN_APPROVAL.md`
- `docs/AI_ANALYSIS_JOBS.md`
- `docs/CONTEXT_PACKS.md`
- `docs/FORECAST_REFACTOR_PLAN.md`

## Core Rule

The self-improvement loop must not automatically apply AI suggestions.

AI may propose improvements. A human must review, approve, reject, or request
revision. Approved proposals still require a separate implementation path before
they affect production behavior.

## Loop Stages

The intended loop is:

1. Prepare a sanitized context pack
2. Run an allowed AI analysis job
3. Store the result as proposal data
4. Review the proposal through a human approval gate
5. Convert accepted proposals into implementation tasks
6. Implement changes in a separate reviewed PR
7. Verify the implementation with relevant tests or checks
8. Record whether the proposal was applied, rejected, or revised

At no stage may an AI proposal directly change production forecast state.

## Proposal Categories

The loop may create proposals such as:

- Forecast miss-pattern investigation notes
- Dashboard or labeling review notes
- Safety-label clarification suggestions
- Context-pack quality improvements
- Refactor planning tasks
- Test coverage suggestions
- Documentation updates

Proposal categories must keep the boundary between proposal state and production
state clear.

## Forbidden Automation

The self-improvement loop must not automatically:

- Change forecast logic
- Change API behavior
- Change database state
- Change persistence rules
- Change safety labels
- Publish externally
- Write production forecast or evaluation records
- Trigger trading, navigation, or military decisions

These actions require human approval and a separate implementation path.

## Review Decisions

Human review should support these outcomes:

- `approved`
- `rejected`
- `needs_revision`
- `informational_only`
- `applied`

`approved` means a human accepted the proposal as a candidate. It does not mean
the proposal has changed production behavior.

`applied` should only be used after a separate reviewed implementation has made
the change and verification has been recorded.

## Evidence And Limitations

Every improvement proposal should include:

- The source context pack version
- The job type
- The observed issue or opportunity
- Supporting evidence
- Known limitations
- Safety impact
- Required human decision
- Suggested verification

If evidence is incomplete or stale, the proposal should say so directly.

## Failure And Disable Path

If proposal quality, safety labeling, or approval status becomes unclear, the
safe fallback is to stop consuming AI proposals and keep the production forecast
core running without the sidecar.

Future implementation work should include a simple disable path before any
runtime integration is introduced.

## Non-Goals For PR #5

This planning phase does not add:

- Self-improvement runtime
- Background workers
- Automated code changes
- Database schema changes
- External API calls
- Production forecast changes
- Production evaluation changes
