# Project Specification

This file summarizes current expected behavior for `world-forecast-system-main`.

It is a work-starting specification summary, not a replacement for
source-of-truth docs, contracts, code, tests, or PR review evidence.

## Overview

`world-forecast-system-main` is a Next.js App Router application with React and
TypeScript. It presents a world forecast dashboard, map and globe-oriented
views, Hormuz Sentinel monitoring, and proposal-only AI analysis and handoff
contracts.

Known environment from repository files:

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- SQLite through `better-sqlite3`
- D3, Three.js, and `react-globe.gl`
- Node 20 in GitHub Actions CI

Important constraints:

- Preserve mock-first and safe fallback behavior.
- Keep AI and Codex App Server surfaces proposal-only unless a later dedicated
  implementation is explicitly approved.
- Treat this Project Context Pack as Markdown-only project context.
- Do not infer commit, push, merge, deploy, release, or production promotion
  approval from this file.

## Main Screens / Dashboard Behavior

The main dashboard is the primary user-facing operations surface.

Expected behavior:

- Present current world forecast and monitoring context.
- Provide access to forecast, map, globe, and Hormuz Sentinel views.
- Keep uncertainty, simulation, mock, and estimation language visible.
- Avoid presenting forecasts as investment, navigation, military, or trading
  advice.

Known important UI/runtime surfaces include:

- `app/page.tsx`
- `components/Dashboard.tsx`
- `components/HormuzSentinelView.tsx`

These files are high-risk app/runtime surfaces under `AGENTS.md`.

## Hormuz Sentinel

Hormuz Sentinel Mode is a mock-first maritime and geopolitical monitoring view
for the Hormuz region.

Expected behavior:

- Work without external API keys when mock mode is enabled or provider
  credentials are absent.
- Show maritime observations, weather context, tension index, scenario news, and
  Japan-bound energy carrier records.
- Preserve `MOCK`, `SIMULATED`, and `ESTIMATED` labels.
- Avoid claiming verified vessel cargo, verified route, verified anomaly, or
  official reporting status when data is mocked, simulated, or inferred.
- Do not expose local NAS paths in API responses.

Known high-risk API surfaces:

- `app/api/hormuz/route.ts`
- `app/api/hormuz/news/route.ts`

## World Forecast

The forecast core is protected.

Expected behavior:

- `/api/forecast` remains responsible for forecast responses.
- Forecast text should preserve assumptions, confidence, and uncertainty where
  applicable.
- Forecasts must not become investment, navigation, military, or trading advice.
- AI-generated analysis must not bypass safety labels or human review.

Known high-risk API surface:

- `app/api/forecast/route.ts`

## World Pattern Memory

World Pattern Memory is the roadmap direction for turning observations,
forecasts, signals, outcomes, and review records into durable, reviewable
memory.

Current posture:

- Memory Layer helpers and smoke checks exist.
- Source kind, confidence, limitations, and proposal-only boundaries are central.
- Durable production semantics, migrations, and operational use remain protected
  and require explicit scope and approval.

Primary docs:

- `docs/roadmap-world-pattern-memory.md`
- `docs/data-model-v0.1.md`
- `docs/safety-policy.md`
- `docs/CONTRACTS_INDEX.md`

## API And Data Behavior

Known from docs and repository structure:

- `/api/forecast` handles forecast responses and may interact with local SQLite.
- `/api/hormuz` returns Hormuz Sentinel payloads.
- `/api/hormuz/news` returns Hormuz-related news or simulated scenario feed
  items.
- Local SQLite and NAS behavior may vary by machine.
- Future AI-sidecar data must remain proposal-only until human review and a
  separate approved implementation path.

Data that must not be stored or exposed in shareable artifacts:

- Secrets
- API keys
- OAuth tokens
- `.env` or `.env.local` contents
- Raw local filesystem paths
- NAS paths
- Unnecessary private data
- Unreviewed production write instructions

## Mock / Simulated / Estimated Data Handling

Required labels:

- `MOCK`: local fixture or demo input.
- `SIMULATED`: fictional scenario or generated scenario feed.
- `ESTIMATED`: inferred, modeled, incomplete, or uncertain information.

Expected behavior:

- Labels remain visible in UI summaries where applicable.
- Labels are preserved in future memory records and review material.
- Simulated news must not impersonate real official reporting.
- Estimated vessel fields must not be phrased as verified operational truth.

## NAS Logging Behavior

Japan-bound energy carrier NAS logging is local-only and opt-in.

Expected behavior:

- Disabled unless explicitly enabled by environment configuration.
- API responses must not include raw local or NAS paths.
- Shareable docs and review packets should use sanitized status labels instead
  of raw paths.
- NAS unavailability should not block safe mock-first dashboard behavior unless
  the current task explicitly requires NAS operations.

## External Services / Environment Assumptions

Mock-first development can run without external provider credentials.

Documented environment flags include:

- `HORMUZ_USE_MOCK=true`
- `HORMUZ_NEWS_USE_MOCK=true`
- `JAPAN_BOUND_TANKER_NAS_LOG_ENABLED=false`
- `JAPAN_BOUND_TANKER_NAS_LOG_INTERVAL_SECONDS=60`

Optional provider keys may exist for configured or future integrations, but they
must not be committed, logged, or exposed.

Unknown or task-dependent items:

- Exact local `.env.local` contents are not checked into the repository and
  should not be requested or printed.
- Current external provider availability is unverified.
- Production deployment configuration is unverified in this Project Context
  Pack draft.

## Prohibited Uses

The system must not be used for:

- Investment decisions or trading instructions.
- Maritime navigation decisions or routing instructions.
- Military decisions, targeting, escalation, defense, or tactical guidance.
- Claims that simulated, mock, or estimated data is verified ground truth.
- External publishing or production promotion without explicit human approval.

## Validation / Smoke Expectations

Before asking for review on a change, select checks appropriate to the scope and
record evidence in the PR Review Packet.

Common commands from `package.json` and CI:

- `npm run lint`
- `npm run build`
- `npm run test:characterization`
- `npm run test:memory`
- `npm run test:context-pack`
- `npm run test:ai-analysis-job`
- `npm run test:ai-analysis-job-result`
- `npm run test:human-review-decision`
- `npm run test:implementation-proposal`
- `npm run test:task-board-handoff`

GitHub Actions runs lint, build, and smoke checks on PRs to `main` and pushes to
`main`, `feature/**`, and `docs/**`.

For Markdown-only Project Context Pack work, at minimum verify:

- Only intended Markdown files changed.
- The text does not imply commit, push, PR creation, merge, deploy, release, or
  production promotion approval.
- Existing AI Dev Relay Kit v0.1.0 PR Review Packet, evidence, high-risk, and
  human approval rules remain intact.

## Out Of Scope

This Project Context Pack update does not include:

- API changes.
- DB writes, schema changes, or migrations.
- Runtime, worker, scheduler, or Codex App Server runtime changes.
- Package or dependency changes.
- CI changes.
- File-writing automation.
- GitHub automation.
- Deploy, release, external publishing, merge, or production promotion.
