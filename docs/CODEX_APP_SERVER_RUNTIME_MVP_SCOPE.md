# Codex App Server Runtime MVP Scope v0

## Purpose

This document defines the final docs-only scope for the next Codex App Server
Runtime MVP scaffold implementation PR.

This is not a template or an example. It is a human-reviewed implementation
scope document for the next PR only. This PR does not add runtime code, worker
runtime, scheduler runtime, API connections, DB writes, migrations, package
changes, CI changes, automation, AI job execution, external publishing, or
production promotion.

The next implementation PR must still be separate, human-reviewed, and limited
to the allowed surface below.

Implementation note: the first scaffold implementation remains limited to the
allowed surface in this document. It may add isolated TypeScript metadata,
validation, a disabled local scaffold helper, and a local smoke test, but it
must not enable runtime behavior or connect to production surfaces.

## MVP Goal

The MVP goal is to add the smallest Codex App Server runtime scaffold needed to
represent a non-production AI sidecar boundary in code.

The first implementation must be:

- non-production
- proposal-only
- disabled by default
- local-only
- disconnected from the production forecast core
- disconnected from `/api/forecast`, `/api/hormuz`, and `/api/hormuz/news`
- free of DB writes and migrations
- free of external API integrations
- free of scheduler and worker execution
- free of package, dependency, lockfile, and CI changes

The MVP may define pure TypeScript types, validation helpers, and a disabled
local scaffold record that can be smoke-tested without changing production
behavior.

## Explicit Non-Goals

The next implementation PR must not:

- change production forecast generation
- change price acquisition
- change 10-minute forecast evaluation
- change prediction persistence
- change bias feedback updates
- change `/api/forecast`
- change `/api/hormuz`
- change `/api/hormuz/news`
- change `lib/db.ts`
- write to the database
- add a DB migration or schema change
- change `package.json`
- change any lockfile
- change GitHub Actions or CI
- add an external API integration
- add scheduler runtime
- add worker runtime
- add GitHub Issue or PR automation
- add file-writing automation
- add AI job execution
- promote any proposal to production
- publish externally
- provide automated trading, investment advice, navigation guidance, or
  military guidance

## Proposed MVP Architecture

The next PR should use a library-only scaffold rather than a route, server, or
job runner.

The proposed shape is:

1. Add an isolated `lib/codex-app-server-runtime/` directory.
2. Define MVP runtime proposal-state types and constants in that directory.
3. Add validation helpers that enforce:
   - `proposal_only: true`
   - `is_production_state: false`
   - `required_human_approval: true`
   - disabled-by-default runtime state
   - no protected core connection
   - no API, DB, external integration, worker, scheduler, package, CI,
     automation, or production-promotion permission
   - no restricted content
4. Add a disabled-by-default local scaffold helper that returns reviewable
   scaffold metadata only.
5. Add a smoke test script following the existing `scripts/*-smoke.mjs`
   pattern if it can run without package or CI changes.

The MVP must not add an `app/api/**` route. It must not register a scheduler,
start a worker, call an external service, read or write production data, or
become a source of record.

## Allowed Implementation Surface For Next PR

```yaml
allowed_files_for_next_pr:
  - path: "docs/CODEX_APP_SERVER_RUNTIME_MVP_SCOPE.md"
    reason: "May be updated to record the final implemented scaffold boundary and validation notes."
    change_type: "modify"
    risk: "low"
  - path: "docs/CODEX_APP_SERVER.md"
    reason: "May add a short reference to the non-production disabled-by-default MVP scaffold if the implementation lands."
    change_type: "modify"
    risk: "low"
  - path: "docs/CODEX_APP_SERVER_RUNTIME_INTAKE.md"
    reason: "May add a short reference showing that the MVP scaffold remains within intake and human approval boundaries."
    change_type: "modify"
    risk: "low"
  - path: "docs/CONTRACTS_INDEX.md"
    reason: "May update the contract map and PR history for the MVP scaffold implementation."
    change_type: "modify"
    risk: "low"
  - path: "lib/codex-app-server-runtime/types.ts"
    reason: "New isolated pure TypeScript types for non-production proposal-state and disabled scaffold metadata."
    change_type: "add"
    risk: "low"
  - path: "lib/codex-app-server-runtime/validation.ts"
    reason: "New isolated validation helpers for proposal-only, non-production, disabled-by-default runtime scaffold records."
    change_type: "add"
    risk: "low"
  - path: "lib/codex-app-server-runtime/scaffold.ts"
    reason: "New isolated local-only helper that returns disabled scaffold metadata and performs no API, DB, worker, scheduler, external, or production action."
    change_type: "add"
    risk: "medium"
  - path: "scripts/codex-app-server-runtime-smoke.mjs"
    reason: "Optional smoke test using the existing local TypeScript compile-and-assert pattern without package or CI changes."
    change_type: "add"
    risk: "low"
forbidden_files_for_next_pr:
  - path: "app/api/forecast/route.ts"
    reason: "Protected production forecast API behavior."
  - path: "app/api/hormuz/route.ts"
    reason: "Protected Hormuz API behavior."
  - path: "app/api/hormuz/news/route.ts"
    reason: "Protected Hormuz news API behavior."
  - path: "app/api/**"
    reason: "MVP scaffold must not add or change API routes."
  - path: "lib/db.ts"
    reason: "Protected database helper and production persistence boundary."
  - path: "lib/api.ts"
    reason: "Production-facing API helper surface is outside the MVP scaffold."
  - path: "lib/nas.ts"
    reason: "Local/NAS path handling is outside the MVP scaffold and must not be touched."
  - path: "lib/news.ts"
    reason: "External/news acquisition is outside the MVP scaffold."
  - path: "lib/maritime/**"
    reason: "Hormuz and maritime analysis behavior are production-adjacent and outside the MVP scaffold."
  - path: "package.json"
    reason: "Package scripts and dependencies must not change in the next PR."
  - path: "package-lock.json"
    reason: "Lockfile changes are forbidden."
  - path: "pnpm-lock.yaml"
    reason: "Lockfile changes are forbidden."
  - path: "yarn.lock"
    reason: "Lockfile changes are forbidden."
  - path: ".github/**"
    reason: "GitHub Actions, CI, and automation changes are forbidden."
  - path: "next.config.ts"
    reason: "App-wide Next.js runtime configuration is outside the MVP scaffold."
  - path: "db/**"
    reason: "Database files and schema surfaces are outside the MVP scaffold."
  - path: "migrations/**"
    reason: "DB migrations are forbidden."
  - path: "prisma/**"
    reason: "Schema and migration surfaces are forbidden."
```

## Forbidden Implementation Surface

The next implementation PR must not touch or introduce:

- production forecast generation change
- price acquisition change
- 10-minute forecast evaluation change
- prediction persistence change
- bias feedback update change
- `/api/forecast` change
- `/api/hormuz` change
- `/api/hormuz/news` change
- `lib/db.ts` change
- DB migration or schema change
- package or dependency change
- lockfile change
- GitHub Actions or CI change
- external API integration
- scheduler runtime
- worker runtime
- GitHub Issue or PR automation
- file-writing automation
- AI job execution
- production promotion
- external publish
- automated trading
- investment advice
- navigation guidance
- military guidance

## Data Boundary

The MVP scaffold may represent proposal metadata only. It must not read, write,
or promote production forecast, price, evaluation, prediction, bias feedback,
Hormuz, maritime, or operational data.

Allowed data is limited to:

- static constants
- TypeScript type definitions
- synthetic smoke-test fixtures
- sanitized repository-relative policy references
- disabled scaffold metadata
- validation issues and review notes

Restricted content must be absent:

- secrets
- `.env` values
- OAuth tokens
- API keys
- raw local paths
- NAS paths
- private network details
- production logs
- real operational data
- unnecessary private data

Smoke tests may use the existing temporary compile-and-assert pattern, but they
must not write product records, source files, docs, PRs, issues, operational
files, or production state.

## Human Approval Boundary

The MVP scaffold must preserve:

- `proposal_only: true`
- `is_production_state: false`
- `required_human_approval: true`
- human review before any later use
- rejection, revision, and archive as valid outcomes

Human approval for the next PR means review permission for a disabled
non-production scaffold only. It does not authorize production application,
runtime enablement, API behavior changes, DB writes, migrations, deployment,
worker execution, scheduler execution, external publishing, or production
promotion.

The next implementation PR must stop at review until the Human Owner, QA
Reviewer, and Risk / Safety Reviewer can confirm that the scaffold remains
disabled-by-default, non-production, proposal-only, and limited to the allowed
files in this document.

## Runtime Disable / Rollback Plan

The MVP must be disabled by default. A safe rollback or disable path must be:

1. Leave production forecast core unchanged.
2. Stop consuming any Codex App Server runtime scaffold output.
3. Keep `/api/forecast`, `/api/hormuz`, and `/api/hormuz/news` unchanged.
4. Keep DB schema and production data unchanged.
5. Revert only the isolated scaffold files and optional docs references.
6. If validation labels become unclear, treat all scaffold output as archived
   proposal material and do not use it downstream.

Because the MVP must not connect to production behavior, rollback should be a
code revert of isolated files only. No data rollback, DB migration rollback,
external service cleanup, scheduler disable, worker shutdown, or deployment
rollback should be required.

## Test Plan For MVP Scaffold

The next PR should use tests that fit the existing repository without package
or CI changes.

Required checks:

- `git diff --check`
- `npm run lint`, if dependencies are available in the implementation worktree
- changed files reviewed against the allowed and forbidden file lists in this
  document
- no package, lockfile, CI, API route, DB, migration, worker, scheduler,
  external integration, automation, or production-core changes
- TypeScript compile check for any new helper files using the existing local
  `tsc` binary pattern from `scripts/*-smoke.mjs`
- smoke assertions that a valid scaffold record is:
  - disabled by default
  - proposal-only
  - non-production
  - human-approval-required
  - disconnected from API, DB, worker, scheduler, external integration,
    automation, and production promotion
- smoke assertions that unsafe records are rejected when they imply protected
  core connection, production state, restricted content, runtime enablement,
  API connection, DB connection, worker execution, scheduler execution,
  external integration, package/CI change, automation, or production promotion

Optional checks if the implementation adds a smoke script:

- `node scripts/codex-app-server-runtime-smoke.mjs`

The next PR must not add a `package.json` script for the smoke test.

For stdout-only runtime review artifacts layered on top of the MVP scaffold,
the report script may also be checked with:

- `node scripts/codex-app-server-runtime-report.mjs`
- `node scripts/codex-app-server-runtime-report.mjs --summary`
- `node scripts/codex-app-server-runtime-report.mjs --taskcard`
- `node scripts/codex-app-server-runtime-report.mjs --taskcard-qa`
- `node scripts/codex-app-server-runtime-report.mjs --handoff`
- `node scripts/codex-app-server-runtime-report.mjs --packet`

These outputs must remain stdout-only review material. They must not write to
the Task Board, create a HANDOFF file, automate file writes, connect to APIs or
DB, add worker or scheduler runtime, call external services, change package or
CI configuration, create PRs or issues, execute AI jobs, deploy, publish
externally, or promote proposal data to production.

After the stdout-only review packet, any move toward Task Board, HANDOFF, or
repository artifact persistence must pass through
`docs/tool-contracts/TASK_BOARD_HANDOFF_WRITE_TOOL_CONTRACT.md`. PR #43 is
docs-only. It defines the future write boundary and does not authorize or add
write implementation, Task Board write, HANDOFF file creation, API, DB, worker,
scheduler, package, CI, automation, or production promotion.

## Acceptance Criteria For Next Implementation PR

The next implementation PR is acceptable only if:

- all changed files are inside the allowed surface above
- all forbidden files and protected production surfaces are untouched
- no route, worker, scheduler, external API integration, DB write, migration,
  package change, lockfile change, CI change, GitHub automation,
  file-writing automation, AI job execution, or production promotion is added
- the scaffold is disabled by default
- the scaffold is local-only and non-production
- proposal-only and human-review-only boundaries are represented in code
- stdout-only TaskCard, QA, and HANDOFF drafts keep
  `required_next_action` / `allowed_next_step` limited to `human_review_only`
  and require human approval
- restricted content is rejected or explicitly blocked by validation
- test or smoke output does not expose local paths, NAS paths, private network
  details, secrets, real operational data, or production logs
- rollback requires only reverting isolated scaffold files and optional docs
  references
- reviewers can verify that production forecast behavior remains unchanged

## Stop Conditions

Stop before implementation if:

- the next PR needs to touch `/api/forecast`, `/api/hormuz`, or
  `/api/hormuz/news`
- the next PR needs `lib/db.ts`, DB schema, migrations, package files,
  lockfiles, CI, `next.config.ts`, or app-wide runtime config
- runtime, worker, scheduler, API, external integration, or production
  promotion scope is unclear
- the scaffold would be enabled by default
- the scaffold would read from or write to production state
- the scaffold would call an external service
- the scaffold would create issues, create PRs, merge, deploy, or automate
  file writes
- the smoke test cannot run without package or CI changes
- restricted content is needed to proceed
- human approval for the implementation PR scope is missing

## Review Checklist

- [ ] The scope PR was docs-only; the implementation PR remains inside the
      allowed surface in this document.
- [ ] This document is not a template or example.
- [ ] The next PR allowed surface is explicit and repository-relative.
- [ ] The next PR forbidden surface includes production forecast, API, DB,
      migration, package, lockfile, CI, worker, scheduler, external
      integration, automation, and production-promotion boundaries.
- [ ] `proposal_only: true`, `is_production_state: false`, and
      `required_human_approval: true` remain mandatory.
- [ ] The MVP is disabled by default.
- [ ] No production forecast core connection is allowed.
- [ ] No `/api/forecast`, `/api/hormuz`, or `/api/hormuz/news` connection is
      allowed.
- [ ] No DB write or migration is allowed.
- [ ] No external API integration is allowed.
- [ ] No scheduler or worker execution is allowed.
- [ ] No package, dependency, lockfile, or CI change is allowed.
- [ ] The rollback path is isolated-file revert only.
- [ ] Test plan can run through existing local smoke-test patterns.
- [ ] Restricted content is absent.
