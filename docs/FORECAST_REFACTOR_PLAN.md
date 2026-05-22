# Forecast Refactor Plan

## Purpose

This document outlines a future plan for decomposing `/api/forecast` into
reviewable parts while preserving the production forecast core boundary.

This is a planning document only. It does not change `/api/forecast`, add
runtime code, add worker code, run migrations, or change production behavior.

Related policies:

- `docs/CODEX_APP_SERVER.md`
- `docs/HUMAN_APPROVAL.md`
- `docs/AI_ANALYSIS_JOBS.md`
- `docs/CONTEXT_PACKS.md`
- `docs/SELF_IMPROVEMENT_LOOP.md`

## Current Boundary

The production forecast core owns:

- Production forecast generation
- Price acquisition
- 10-minute evaluation
- Prediction persistence
- Bias feedback updates
- Production API behavior

A future Codex App Server or AI worker must not become the source of record for
these responsibilities.

## Refactor Goals

A future refactor should make `/api/forecast` easier to review by separating:

- Request validation
- Price acquisition
- Forecast calculation
- Persistence
- Evaluation scheduling or lookup
- Bias feedback update logic
- Response shaping
- Safety labels and disclaimers
- Error handling and observability

The goal is clearer ownership and testability, not a behavior rewrite.

## Planned Phases

### Phase 0: Documentation And Inventory

- Inventory current `/api/forecast` responsibilities
- Document production state boundaries
- Identify shared helpers already in use
- List existing tests or manual verification commands
- Record known risks and rollback expectations

No code changes are included in this phase.

### Phase 1: Characterization Tests

- Add tests around current behavior before moving logic
- Capture expected response shape
- Capture persistence expectations
- Capture safety-label behavior
- Capture error cases

This phase should avoid changing behavior.

### Phase 2: Extract Pure Helpers

- Move deterministic formatting or calculation helpers behind tests
- Keep database writes and external calls in the existing approved path
- Preserve existing API response behavior
- Avoid adding new package dependencies unless separately approved

Each extraction should be small enough to review independently.

### Phase 3: Separate Persistence Boundary

- Isolate database write responsibilities
- Preserve the existing source of record
- Keep AI proposals out of production persistence
- Add rollback notes for persistence-related changes

Any schema or migration work requires explicit approval and a separate PR.

### Phase 4: Introduce Proposal-Only AI Review Hooks

- Allow reviewed context-pack summaries to inform human review
- Keep AI output as proposal data
- Require human approval before any production change
- Keep the production forecast path independent from AI sidecar availability

This phase must wait until Memory Layer, Worker Separation, Task Board, and
Context Pack Builder prerequisites are reviewed.

## Non-Goals

This plan does not authorize:

- Immediate `/api/forecast` code changes
- `/api/hormuz` changes
- Database migrations
- External API integrations
- Package dependency changes
- Automated production writes by AI
- Automated adoption of AI proposals
- Investment, navigation, military, or trading decisions

## Review Gates

Before any implementation PR, confirm:

- The target phase is explicit
- Human approval is recorded for the implementation scope
- Existing behavior is characterized
- Production state ownership is preserved
- Safety labels remain visible
- Rollback or disable behavior is documented
- Tests or manual verification are listed

## PR #5 Scope

PR #5 only adds this plan and related policy documents. It intentionally leaves
application code, database schema, package files, worker runtime, and external
API behavior unchanged.
