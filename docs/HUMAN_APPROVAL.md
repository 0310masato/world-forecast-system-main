# Human Approval Policy

## Purpose

This document defines the human approval rules for AI analysis proposals in
`world-forecast-system-main`.

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
