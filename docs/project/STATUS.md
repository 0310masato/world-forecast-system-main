# Project Status

This file helps another person or AI session resume work without reconstructing
the current repository state.

This file is not approval to commit, push, create a PR, merge, deploy, release,
publish externally, or promote anything to production.

## Last Reviewed

- Date: 2026-06-04
- Reviewed by: Codex app project context gates pass
- Related PRs:
  - PR #51 `docs: apply Project Context Pack v0.2.0`
  - PR #49 `feat: add task board handoff write executor contract stdout v0`
  - PR #52 `docs: record post-merge local MVP readiness`
- Source branch: `codex/project-context-gates-v0`
- Review basis: GitHub `main` was at PR #52 merge commit `f03ca11` before this
  follow-up branch was created. PR #52 merged after PR #49 and PR #51.

## Current Phase

- Phase: Local-confirmable MVP readiness with Project Context PR gates.
- Current status: Project Context Pack files are active on `main`. PR #49 also
  landed the stdout-only write executor contract draft layer for local review.
  PR #52 aligned the Project Context Pack with the post-merge local MVP
  baseline.
- AI Dev Relay Kit v0.1.0: Applied.
- AI Dev Relay Kit v0.2.0 Project Context Pack: Applied through PR #51.
- Local MVP readiness chain: PR #49 landed as metadata-only, stdout-only,
  non-production review material.
- Production promotion approval: Not approved.
- Merge approval: Not granted by this file.
- Deploy/release approval: Not approved.
- Write-capable executor approval: Not approved by this file.

## Completed

- Clean work area was used for the Project Context Pack preparation.
- AI Dev Relay Kit v0.2.0 Project Context Pack templates were confirmed:
  - `templates/project-context/CONTEXT.md`
  - `templates/project-context/DESIGN.md`
  - `templates/project-context/SPEC.md`
  - `templates/project-context/STATUS.md`
- `docs/project/` was absent before the v0.2.0 Project Context Pack
  application.
- PR #51 introduces these four Project Context Pack files:
  - `docs/project/CONTEXT.md`
  - `docs/project/DESIGN.md`
  - `docs/project/SPEC.md`
  - `docs/project/STATUS.md`
- Existing AI Dev Relay Kit v0.1.0 rules were confirmed in `AGENTS.md` and
  `.github/pull_request_template.md`.
- PR #51 was merged into `main` on 2026-06-04.
- PR #49 was merged into `main` on 2026-06-04.
- PR #49 added the stdout-only write executor contract draft layer. It does not
  implement a write executor, apply executor, Task Board write, HANDOFF file
  creation, file-writing automation, runtime, worker, scheduler, API route, DB
  integration, package change, CI change, deploy, release, or production
  promotion.
- PR #52 was merged into `main` on 2026-06-04.
- PR #52 recorded the post-merge local MVP readiness baseline and confirmed
  that write-capable executor behavior, file-writing automation, API routes, DB
  integration, workers, schedulers, deployment, release, and production
  promotion remain outside the approved scope.

## In Progress

- Current task: Add Project Context Pack read-order guidance to `AGENTS.md` and
  Project Context Impact checks to the PR Review Packet template.
- Working tree status: must be checked by the active Codex app session before
  editing, commit, push, merge, or any follow-up PR.
- These context files are introduced by the Project Context Pack application
  PR and should remain Markdown-only project context.

## Next Actions

- Next safe action: Review this Project Context gates PR.
- Next decision needed: Decide whether the next local-MVP slice should stay
  read-only/stdout-only or whether to explicitly scope a future write-capable
  executor PR.
- Optional later step, if approved separately: keep the next local-MVP slice
  read-only/stdout-only, or draft a separate explicit plan for a future
  write-capable executor PR with tests and rollback / disable criteria.
- Verification for Markdown-only Project Context Pack follow-up:
  - `git status --short`
  - `git diff -- AGENTS.md .github/pull_request_template.md docs/project/STATUS.md`
  - `git diff --check`
  - Confirm the diff is Markdown-only and limited to approved files.

## Blockers / Risks

- Human approval is required before commit, push, PR creation, merge, deploy,
  release, or production promotion.
- Project Context Pack must not weaken existing AI Dev Relay Kit v0.1.0 PR
  Review Packet, evidence, high-risk, or human approval rules.
- `docs/project/CONTEXT.md` must not be confused with `docs/CONTEXT_PACKS.md`.
- Existing contract and safety docs remain the source of truth.
- Avoid duplicating large source-of-truth sections from existing docs.
- The PR #49 executor contract draft must not be treated as permission to write
  files, create Task Board records, create HANDOFF files, run automation, or
  promote anything to production.

## Latest PRs

- AI Dev Relay Kit v0.1.0 applied:
  - PR #50 applied AI Dev Relay Kit v0.1.0 to `world-forecast-system-main`.
- AI Dev Relay Kit v0.2.0 Project Context Pack:
  - PR #51 introduces the four `docs/project/*.md` files.
  - PR #51 merged into `main` on 2026-06-04.
  - PR #49 merged after PR #51 and added the stdout-only write executor
    contract draft layer.
  - PR #52 merged after PR #49 and recorded the post-merge local MVP readiness
    baseline.
  - This file does not itself approve merge, deploy, release, production
    promotion, or any protected-surface change.

## Checkout Hygiene

Use a clean branch and clean worktree for Project Context Pack follow-up. If an
existing checkout has unrelated uncommitted changes, do not stage, stash, reset,
overwrite, or include those changes. Create a separate clean worktree from the
current `origin/main` or the active PR branch instead.

## Notes For The Next AI Session

Read before editing:

1. `docs/project/CONTEXT.md`
2. `docs/project/DESIGN.md`
3. `docs/project/SPEC.md`
4. `docs/project/STATUS.md`
5. `AGENTS.md`
6. `docs/CONTRACTS_INDEX.md`
7. `.github/pull_request_template.md`

Do not touch unrelated dirty checkout changes.

Do not change these high-risk areas unless the user explicitly approves that
exact scope:

- `app/api/forecast`
- `app/api/hormuz`
- `app/api/hormuz/news`
- `lib/db.ts`
- `lib/memory/*`
- `lib/nas.ts`
- `package.json`
- `package-lock.json`
- `.github/workflows/ci.yml`
- Runtime, worker, scheduler, package, CI, file-writing automation, deploy,
  release, external publishing, or production promotion surfaces

Known risks:

- Existing docs are broad; avoid creating competing source-of-truth language.
- Context files should summarize and point to source docs, not replace them.
- External provider availability and production deployment configuration are
  unverified for this Project Context Pack.

Suggested verification after approved Markdown-only application:

- Confirm only intended files changed.
- Confirm Project Context Pack language does not imply execution approval.
- Confirm AI Dev Relay Kit v0.1.0 PR Review Packet rules remain intact.
- Confirm `docs/CONTEXT_PACKS.md` remains clearly separate from
  `docs/project/CONTEXT.md`.
