# Data Model v0.1

This is a future Memory Layer proposal. It is not an implemented schema, does not require a migration, and should not be treated as a database contract yet.

## Design Principles

- Keep raw source material separate from normalized interpretation.
- Track `source_kind`, confidence, and limitations on every record that can influence analysis.
- Preserve forecasts and outcomes so the system can learn calibration over time.
- Keep human approval state separate from AI-generated analysis.
- Never store secrets or local-only filesystem paths in shareable records.

## Common Fields

Future records should consider these shared fields:

- `id`: stable record identifier.
- `created_at`: creation timestamp.
- `updated_at`: last update timestamp.
- `source_kind`: `live`, `mock`, `simulated`, `estimated`, `manual`, or `derived`.
- `source_ref`: non-secret source reference.
- `confidence`: `low`, `medium`, or `high`.
- `labels`: searchable tags.
- `notes`: human-readable caveats.

## Objects

### RawEvent

Unmodified or minimally wrapped source observation.

Candidate fields:

- `id`
- `observed_at`
- `source_kind`
- `source_ref`
- `raw_payload`
- `ingest_method`
- `ingest_status`
- `redaction_status`

### NormalizedEvent

Cleaned event derived from one or more raw events.

Candidate fields:

- `id`
- `raw_event_ids`
- `event_type`
- `region`
- `actors`
- `commodities`
- `summary`
- `normalized_at`
- `confidence`
- `limitations`

### MarketSnapshot

Point-in-time market or commodity context.

Candidate fields:

- `id`
- `captured_at`
- `market`
- `symbol`
- `price`
- `currency`
- `change`
- `source_kind`
- `confidence`

### Signal

A detected pattern or analysis-worthy change.

Candidate fields:

- `id`
- `detected_at`
- `signal_type`
- `region`
- `related_event_ids`
- `strength`
- `direction`
- `confidence`
- `explanation`

### Forecast

Forward-looking statement produced by the system or a human operator.

Candidate fields:

- `id`
- `created_at`
- `horizon`
- `topic`
- `forecast_text`
- `probability`
- `assumptions`
- `supporting_signal_ids`
- `status`

### AnalysisRecord

Agent or human analysis attached to events, signals, or forecasts.

Candidate fields:

- `id`
- `created_by`
- `agent_role`
- `analysis_type`
- `input_refs`
- `claims`
- `evidence`
- `counterarguments`
- `approval_state`

### Outcome

Later observed result used to evaluate a forecast or signal.

Candidate fields:

- `id`
- `linked_forecast_id`
- `observed_at`
- `outcome_summary`
- `outcome_value`
- `evaluation`
- `calibration_notes`

### Task

Reviewable work item for a human or future AI worker.

Candidate fields:

- `id`
- `title`
- `task_type`
- `status`
- `priority`
- `assigned_role`
- `input_refs`
- `approval_required`
- `audit_log`

### Alert

Attention request generated from a signal, forecast, or threshold.

Candidate fields:

- `id`
- `created_at`
- `severity`
- `topic`
- `trigger_ref`
- `message`
- `recommended_review`
- `acknowledged_at`

### Report

Human-readable output assembled from approved analysis.

Candidate fields:

- `id`
- `title`
- `created_at`
- `report_type`
- `sections`
- `source_refs`
- `safety_notes`
- `approval_state`
