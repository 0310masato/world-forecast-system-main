# Project Status

This file helps another person or AI session resume work without reconstructing
the current repository state.

This file is not approval to commit, push, create a PR, merge, deploy, release,
publish externally, or promote anything to production.

## Last Reviewed

- Date: 2026-05-27
- Reviewed by: Codex app draft preparation
- Related PR: None yet for AI Dev Relay Kit v0.2.0 Project Context Pack
- Local verification basis: clean clone of `main` matched `origin/main` at
  `ef53cd05cd84cbb883086ef7776cbe77a58e5a22` during draft preparation.

## Current Phase

- Phase: Preparing AI Dev Relay Kit v0.2.0 Project Context Pack application.
- Current status: Drafting `docs/project/*.md` content for human/Web GPT review.
- AI Dev Relay Kit v0.1.0: Applied.
- AI Dev Relay Kit v0.2.0 Project Context Pack: Not yet applied.
- Production promotion approval: Not approved.
- Merge approval: Not approved.
- Deploy/release approval: Not approved.
- Commit approval for these draft files: Not approved.
- Push approval for these draft files: Not approved.
- PR creation approval for these draft files: Not approved.

## Completed

- Clean work area prepared outside the existing dirty checkout.
- `world-forecast-system-main` cloned from `main` for Project Context Pack
  preparation.
- `world-forecast-system-main` verified clean and synced with `origin/main`
  before draft file creation.
- `ai-dev-relay-kit` cloned and switched to tag `v0.2.0`.
- AI Dev Relay Kit v0.2.0 Project Context Pack templates confirmed:
  - `templates/project-context/CONTEXT.md`
  - `templates/project-context/DESIGN.md`
  - `templates/project-context/SPEC.md`
  - `templates/project-context/STATUS.md`
- `docs/project/` confirmed absent before v0.2.0 application.
- Existing AI Dev Relay Kit v0.1.0 rules confirmed in `AGENTS.md` and
  `.github/pull_request_template.md`.

## In Progress

- Current task: Introduce Project Context Pack files for:
  - `docs/project/CONTEXT.md`
  - `docs/project/DESIGN.md`
  - `docs/project/SPEC.md`
  - `docs/project/STATUS.md`
- Expected working branch: to be created from latest `origin/main`.
- Working tree status: must be checked by the active Codex app session before
  editing, commit, push, or PR creation.
- These context files are being introduced by the Project Context Pack
  application PR.

## Next Actions

- Next safe action: Have human/Web GPT review the four Project Context Pack
  files.
- Next decision needed: Confirm whether the files are ready for commit and PR
  preparation.
- Next implementation step, if approved: commit only the four Markdown files
  under `docs/project/`.
- Optional later step, if approved separately: Update `AGENTS.md` reading order
  and `.github/pull_request_template.md` Project Context Impact section.
- Next verification step after file creation:
  - `git status --short`
  - `git diff -- docs/project`
  - Confirm the diff is Markdown-only and limited to the approved files.

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
- AI Dev Relay Kit v0.2.0 not yet applied:
  - No Project Context Pack PR has been created.
  - No Project Context Pack commit has been created.
  - `docs/project/*.md` files are still draft-only until reviewed and merged.

## Dirty Checkout Warning

Do not use the existing unrelated dirty checkout on this PC for this task.

The existing OneDrive dirty checkout has unrelated dirty changes and must not be
used for this Project Context Pack task.

Known unrelated dirty files in that checkout:

- `lib/maritime/mock.ts`
- `lib/nas.ts`
- `next.config.ts`

Use the clean preparation clone or another clean worktree for Project Context
Pack work.

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
  unverified for this draft.

Suggested verification after approved Markdown-only application:

- Confirm only intended files changed.
- Confirm Project Context Pack language does not imply execution approval.
- Confirm AI Dev Relay Kit v0.1.0 PR Review Packet rules remain intact.
- Confirm `docs/CONTEXT_PACKS.md` remains clearly separate from
  `docs/project/CONTEXT.md`.
