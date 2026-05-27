## PR Metadata

- Branch:
- Base branch:
- Related issue or task:
- Requested reviewer:
- Risk level: Low / Medium / High
- Human merge approval status: Not approved / Approved

## Summary

- What changed:
- Why:
- Non-goals:

## Changed Files

-

## Scope

- Requested scope:
- Completed scope:
- Out of scope / non-goals:

## Role Handoff

- Codex app implementation notes:
- Web GPT review focus:
- Human reviewer decision needed:

## Validation / Evidence

- CI:
- Lint:
- [ ] `npm run lint`
- Test:
- Build:
- [ ] `npm run build`
- Smoke:

## Skipped Checks And Remaining Risk

-

## High-Risk Change Inventory

Mark every area touched by this PR.

- [ ] API: `app/api/forecast`, `app/api/hormuz`, `app/api/hormuz/news`
- [ ] DB / memory: `lib/db.ts`, `lib/memory/*`, `better-sqlite3`
- [ ] File-writing: `lib/nas.ts`, `lib/memory/write.ts`, write-related runtime helpers
- [ ] Package: `package.json`, `package-lock.json`
- [ ] CI: `.github/workflows/ci.yml`
- [ ] App/runtime: `app/`, `components/`, `lib/codex-app-server-runtime/*`
- [ ] Secrets/env: `.env*`, `process.env`, external provider keys
- [ ] Production promotion / deploy / release / external publishing
- [ ] None of the above

High-risk notes:

-

## Safety

- [ ] No investment, navigation, or military-decision claims added.
- [ ] MOCK / SIMULATED / ESTIMATED labeling remains clear where applicable.
- [ ] No secrets, local filesystem paths, or private credentials exposed.
- [ ] No DB migration unless explicitly approved.
- [ ] No external provider integration unless explicitly approved.
- [ ] No runtime, worker, scheduler, package, CI, file-writing, or production promotion change unless explicitly approved.

## Web GPT Review Criteria

Reviewer should confirm:

- [ ] Scope matches the request.
- [ ] Changed files match this packet.
- [ ] CI, lint, test, build, and smoke evidence is present or skipped with a reason.
- [ ] High-risk areas are declared and reviewed.
- [ ] Existing protected core, human approval, secret handling, and docs stewardship rules are not weakened.
- [ ] No merge, release, deploy, external publishing, or production promotion is requested without human approval.

## Human Approval

- [ ] Human approval for commit has been given, if applicable.
- [ ] Human approval for push has been given, if applicable.
- [ ] Human approval for merge has been given.
- [ ] Human approval for production promotion has been given, if applicable.

Approval notes:

-

## Handoff

- Web GPT review request:
- Human reviewer decision:
- Follow-up owner:

## Rollback / Follow-up

- Known risks:
- Rollback or mitigation notes:
- Follow-up work:

## Notes

-
