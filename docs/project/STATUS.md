# Project Status

This file helps another person or AI session resume work without reconstructing
the current repository state.

This file is not approval to commit, push, create a PR, merge, deploy, release,
publish externally, or promote anything to production.

## Last Reviewed

- Date: 2026-06-04
- Reviewed by: Codex app review-fix pass
- Related PR: PR #51 `docs: apply Project Context Pack v0.2.0`
- Source branch: `chore/apply-project-context-pack-v0.2.0`
- Review basis: PR #51 was open, non-draft, mergeable, and CI-passing before
  this status-doc review fix. Check GitHub PR state or `main` history for the
  current merge state before acting on this file.

## Current Phase

- Phase: AI Dev Relay Kit v0.2.0 Project Context Pack application.
- Current status: Project Context Pack files are introduced through PR #51 for
  human and GitHub review. After PR #51 is merged to `main`, treat
  `docs/project/*.md` as the active restart context for this repository.
- AI Dev Relay Kit v0.1.0: Applied.
- AI Dev Relay Kit v0.2.0 Project Context Pack: Introduced by PR #51; verify
  the live PR or `main` state before assuming it has landed.
- Production promotion approval: Not approved.
- Merge approval: Not granted by this file.
- Deploy/release approval: Not approved.

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

## In Progress

- Current task: Complete human and GitHub review of PR #51.
- Working tree status: must be checked by the active Codex app session before
  editing, commit, push, merge, or any follow-up PR.
- These context files are introduced by the Project Context Pack application
  PR and should remain Markdown-only project context.

## Next Actions

- Next safe action: Re-check PR #51 changed files, CI status, and review
  threads after any review-fix commit.
- Next decision needed: Human decision on whether PR #51 is ready to merge.
- Optional later step, if approved separately: Update `AGENTS.md` reading order
  and `.github/pull_request_template.md` Project Context Impact section.
- Verification for Markdown-only Project Context Pack follow-up:
  - `git status --short`
  - `git diff -- docs/project`
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

## Latest PRs

- AI Dev Relay Kit v0.1.0 applied:
  - PR #50 applied AI Dev Relay Kit v0.1.0 to `world-forecast-system-main`.
- AI Dev Relay Kit v0.2.0 Project Context Pack:
  - PR #51 introduces the four `docs/project/*.md` files.
  - Check PR #51 or `main` history for the current review and merge state.
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
2. `docs/project/STATUS.md`
3. `AGENTS.md`
4. `docs/CONTRACTS_INDEX.md`
5. `.github/pull_request_template.md`

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
