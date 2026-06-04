# Project Design

This file captures durable design intent for `world-forecast-system-main`.

It guides future work, but it does not replace `AGENTS.md`,
`docs/CONTRACTS_INDEX.md`, `docs/safety-policy.md`, or
`docs/HUMAN_APPROVAL.md`.

## Purpose

`world-forecast-system-main` is a real-time world forecast and monitoring
dashboard evolving toward World Pattern Memory and a proposal-only AI Agent
Operations Room.

The project exists to help a human reviewer inspect global, market, energy,
maritime, and geopolitical signals while preserving uncertainty, source quality,
safety labels, and human approval boundaries.

## Target Users

- Primary users: Masato and human operators reviewing world forecast and
  monitoring context.
- Secondary users: Codex app, Web GPT, GitHub reviewers, and future AI workers
  preparing proposal-only review material.
- Non-users: Anyone seeking investment advice, maritime navigation decisions,
  military decisions, automated trading guidance, or external operational
  directives.

## Core Value

The system is useful when it gives a cautious, source-aware operating picture
without treating mock data, simulated scenarios, estimated data, or AI output as
verified operational authority.

The project must keep:

- The dashboard usable as a real-time monitor.
- Hormuz Sentinel readable and clearly labeled.
- Mock, simulated, estimated, and AI-generated content visibly distinguished.
- AI outputs proposal-only until human review.
- Forecast core, API behavior, DB state, package files, CI, and runtime surfaces
  protected unless explicitly scoped and approved.
- Review and handoff artifacts clear enough for another AI session or human
  reviewer to resume safely.

## Design Principles

- Keep uncertainty visible.
- Separate observation, inference, simulation, and proposal data.
- Prefer docs-first planning before runtime, DB, API, worker, scheduler,
  package, CI, or automation changes.
- Preserve human approval gates for consequential changes.
- Keep proposal-only AI sidecar work isolated from production forecast behavior.
- Avoid duplicating source-of-truth contract language in multiple docs.
- Use sanitized labels instead of secrets, credentials, raw local paths, NAS
  paths, or private operational data.
- Keep review artifacts explicit about scope, evidence, skipped checks, risks,
  rollback notes, and human approval status.

## Mock-First / Simulated / Estimated Labels

This project must preserve clear labels for non-verified data:

- `MOCK`: local fixture or demo input.
- `SIMULATED`: fictional scenario or generated scenario feed.
- `ESTIMATED`: inferred, modeled, incomplete, or uncertain information.

Hormuz Sentinel and Japan-bound energy carrier data must avoid implying verified
cargo, verified route, verified anomaly, or official reporting status when data
is mocked, simulated, or inferred.

Simulated news must not impersonate real official reporting or military /
government sources.

## Human Approval Boundary

Human approval is required before:

- Applying AI proposals to production behavior.
- Changing forecast logic.
- Changing API behavior.
- Changing DB state, persistence rules, or migrations.
- Changing safety labels or disclaimers.
- Enabling external providers or production integrations.
- Publishing externally.
- Deploying, releasing, merging, or promoting to production.
- Using output for investment, navigation, military, or trading decisions.

Review approval does not imply approval to apply, commit, push, merge, deploy,
release, publish externally, or promote to production.

## Proposal-Only AI Sidecar

Future AI and Codex App Server work must remain sidecar-oriented.

Allowed proposal-only responsibilities include:

- Context summaries.
- Review notes.
- Task suggestions.
- Risk-label suggestions.
- Refactor or investigation plans.
- Human-review packets.
- Handoff material.
- Proposal-only Task Board and Handoff drafts.

Forbidden responsibilities include:

- Direct production forecast writes.
- Direct production evaluation writes.
- Source-of-record price fetching.
- Automatic API behavior changes.
- DB migrations without explicit approval.
- External publishing.
- Operational decisions.
- Investment, navigation, military, or automated trading guidance.

## NAS Logging Opt-In

Local NAS logging for Japan-bound energy carrier observations must remain
opt-in and local-only.

Expected posture:

- Disabled unless explicitly enabled by environment configuration.
- No raw local or NAS paths in API responses.
- No raw local or NAS paths in shareable review packets or committed docs,
  unless explicitly approved for a narrow operational reason.
- Status metadata may be summarized with sanitized labels.
- NAS unavailability should not break safe mock-first dashboard behavior unless
  the task explicitly depends on NAS access.

## Non-Goals

This Project Context Pack does not add:

- Runtime code.
- Worker or scheduler behavior.
- DB schema, migrations, or writes.
- API behavior changes.
- Package or dependency changes.
- CI changes.
- GitHub automation.
- File-writing automation.
- Deploy, release, external publishing, or production promotion.

The project itself must not support:

- Investment advice.
- Maritime navigation decisions.
- Military decisions.
- Automated trading instructions.
- Claims that mock, simulated, or estimated data is verified ground truth.

## Safety Policy

Source-of-truth safety policy lives in:

- `AGENTS.md`
- `docs/safety-policy.md`
- `docs/HUMAN_APPROVAL.md`
- `docs/CONTRACTS_INDEX.md`

Durable safety expectations:

- Keep required labels visible.
- Do not expose secrets, `.env` contents, credentials, raw local paths, NAS
  paths, or unnecessary private data.
- Do not weaken proposal-only, human-review-only, or non-production boundaries.
- Treat high-risk paths listed in `AGENTS.md` as requiring explicit scope and
  stronger validation evidence.
- Keep AI outputs as proposal data until human review and a separate approved
  implementation path.

## Success Criteria

User-facing success:

- The dashboard remains readable, cautious, and clearly labeled.
- Hormuz Sentinel and forecast outputs do not overstate certainty.
- Mock, simulated, and estimated data are visibly distinguished.
- Future AI review surfaces help the human decide, not act automatically.

Engineering success:

- Changes are small, scoped, reviewable, and aligned with existing contracts.
- High-risk areas are isolated and declared.
- Lint, build, smoke, and targeted checks are run or explicitly skipped with a
  reason.
- Secrets, credentials, `.env` contents, raw local paths, and NAS paths are not
  exposed.

Review and handoff success:

- Every PR keeps AI Dev Relay Kit v0.1.0 PR Review Packet rules.
- Context files are updated when durable project context changes.
- Another AI session can resume from `docs/project/CONTEXT.md` and
  `docs/project/STATUS.md` without reconstructing the whole repository history.
