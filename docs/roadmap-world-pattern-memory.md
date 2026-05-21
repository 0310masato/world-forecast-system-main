# World Pattern Memory v0.1 Roadmap

World Pattern Memory is the direction for evolving this repository from a real-time world forecast dashboard into a world prediction AI operations room. This document is a design roadmap only; it does not introduce runtime implementation.

## Three Layers

### 1. Real-time Monitor

The current dashboard observes world, market, energy, maritime, and geopolitical signals. It should remain fast, readable, and safe even without the future memory layer.

Core responsibilities:

- Display live or mock current-state signals.
- Keep uncertainty visible.
- Preserve safe mock-first operation for sensitive domains.
- Avoid turning forecasts into advice.

### 2. World Pattern Memory

The memory layer will turn raw observations into durable, reviewable records that can be compared over time.

Core responsibilities:

- Store raw events separately from normalized events.
- Attach source quality, source kind, and confidence metadata.
- Preserve forecasts and later outcomes for calibration.
- Support retrieval by region, theme, actor, commodity, and operational impact.

### 3. AI Agent Operations Room

The agent operations room will coordinate specialized analysis roles over the memory layer and current monitor.

Core responsibilities:

- Generate reviewable analysis tasks.
- Build context packs for human review.
- Compare AI claims against historical patterns and counterfactuals.
- Translate global signals into practical operational impact.
- Require human approval for consequential outputs.

## Phases

### Phase 0: Current System Stabilization

Goal: keep the current dashboard stable while documenting boundaries.

Deliverables:

- CI with lint and build checks.
- PR template with validation and safety sections.
- Current system map.
- Safety policy for forecast, Hormuz, mock, and estimated data.

### Phase 1: Memory Layer Design

Goal: define data contracts before creating tables or migrations.

Deliverables:

- Data model proposal for events, signals, forecasts, outcomes, tasks, alerts, and reports.
- `source_kind` policy for live, mock, simulated, estimated, and human-entered records.
- Guidelines for local-only and secret-safe persistence.

### Phase 2: Dashboard / Worker Separation

Goal: separate user-facing display from background collection and analysis.

Deliverables:

- Worker boundary design.
- Read-only dashboard APIs.
- Proposal-only worker outputs.
- No autonomous external action.

### Phase 3: Task Board

Goal: make AI work visible and reviewable.

Deliverables:

- Task states such as proposed, queued, running, needs_review, approved, rejected, and archived.
- Human-readable audit trail.
- Manual approval gates.

### Phase 4: Context Pack Builder

Goal: gather compact, source-aware context for human and AI review.

Deliverables:

- Context packs by region, market, commodity, actor, and operational impact.
- Source summaries with confidence and limitations.
- Explicit separation of observed facts, model inferences, and human notes.

### Phase 5: AI Agent Operations Room

Goal: coordinate specialized agents over current and historical context.

Deliverables:

- Agent charters.
- Claim review workflow.
- Counterfactual review before high-confidence summaries.
- Handoff artifacts for Codex, Claude Code, and human operators.

### Phase 6: On-demand Intelligence Desk

Goal: support user-initiated intelligence questions without turning the system into an autonomous decision maker.

Deliverables:

- User-requested brief generation.
- Evidence-backed reports.
- Explicit non-advice disclaimers.
- Approval-required export or publication workflow.
