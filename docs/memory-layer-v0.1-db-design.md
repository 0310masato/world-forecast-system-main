# Memory Layer v0.1 DB Design

## 1. Purpose

Memory Layer v0.1 is the first durable data-design step toward World Pattern
Memory. Its purpose is to define the minimum database shape needed to preserve
source-aware observations, market context, and reviewable analysis candidates
without changing production forecast behavior.

This document is not a migration, implemented schema, runtime contract, worker
implementation, or package-change request. It records design decisions for the
next database implementation PR.

## 2. Scope

v0.1 is limited to these minimum proposed tables:

- `raw_events`
- `market_snapshots`
- `signals`

v0.1 does not design or implement these later-phase tables:

- `normalized_events`
- `forecasts`
- `analysis_records`
- `outcomes`
- `tasks`
- `alerts`
- `reports`
- `approval_requests`
- `context_packs`

Those objects remain later-phase work after the minimum Memory Layer boundary is
reviewed.

## 3. Design Principles

- Keep raw source material separate from interpretation.
- Preserve `source_kind`, `confidence`, and `limitations` on records that can
  influence analysis.
- Do not mix `mock`, `simulated`, or `estimated` records with real-world
  evidence as though they are equivalent.
- Treat AI output as proposal data.
- Do not make these tables the source of record for production forecasts,
  prices, evaluations, or saved predictions.
- Do not promote proposal data into production state without human approval.
- Do not store secrets, `.env` values, raw local filesystem paths, NAS paths, or
  unnecessary private data.

## 4. `source_kind` Policy

Proposed `source_kind` values:

- `real_api`: current data fetched from an external API with source metadata.
- `real_rss`: current data fetched from an RSS or feed-like source with source
  metadata.
- `mock`: local fixture or demo input.
- `simulated`: fictional scenario or generated demo event.
- `estimated`: inferred value derived from incomplete or uncertain inputs.
- `manual`: human-entered note or operator-provided observation.
- `derived`: computed record based on other stored records.
- `fallback_template`: safe template output used when a real source is
  unavailable.
- `local_cache`: cached value retained from a previous fetch or local-only
  collection path.

`mock`, `simulated`, and `fallback_template` records must not be treated as
real-world evidence. A future migration plan should decide whether the existing
documentation value `live` maps to `real_api`, `real_rss`, or a broader
real-source category.

## 5. `confidence` Policy

`confidence` uses these values:

- `low`
- `medium`
- `high`

A record may be marked `high` only when all of these are true:

- `source_kind` is `real_api` or `real_rss`.
- `source_ref` is present.
- `observed_at` or the table-specific observation timestamp is present.
- The source is not stale for the intended use.
- The record is not `mock`, `simulated`, or `fallback_template`.

`mock`, `simulated`, and `fallback_template` records may be at most `medium`.
Unknown, single-source, incomplete, or old information should be `low` or
`medium` depending on review context.

## 6. `raw_events` Table Proposal

Purpose: store external or internal raw event observations before downstream
interpretation.

Minimum column proposal:

- `id`
- `observed_at`
- `ingested_at`
- `source_kind`
- `source_name`
- `source_ref`
- `event_domain`
- `raw_payload_json`
- `summary`
- `confidence`
- `limitations`
- `labels_json`
- `is_mock`
- `created_at`

Responsibilities:

- Preserve raw or minimally wrapped source data.
- Preserve `source_kind` and source metadata.
- Provide input for downstream analysis, normalization, signals, and context
  building.

Forbidden:

- Do not store secrets.
- Do not store raw local filesystem paths or NAS paths.
- Do not mix AI interpretation into this raw source table.

## 7. `market_snapshots` Table Proposal

Purpose: store point-in-time price, market, and commodity context.

Minimum column proposal:

- `id`
- `captured_at`
- `asset_symbol`
- `asset_name`
- `asset_class`
- `price`
- `currency`
- `source_kind`
- `source_name`
- `source_ref`
- `change_percent`
- `raw_payload_json`
- `confidence`
- `limitations`
- `created_at`

Responsibilities:

- Preserve point-in-time market state.
- Provide input for future forecast review, signal detection, and context packs.

Forbidden:

- Do not make AI-created prices the source of record.
- Do not label fallback cache data as `real_api`.

## 8. `signals` Table Proposal

Purpose: store analysis candidates detected from `raw_events`,
`market_snapshots`, or later Memory Layer records.

Minimum column proposal:

- `id`
- `detected_at`
- `signal_type`
- `title`
- `summary`
- `severity`
- `direction`
- `strength`
- `confidence`
- `source_kind`
- `related_raw_event_ids_json`
- `related_market_snapshot_ids_json`
- `labels_json`
- `limitations`
- `proposal_status`
- `human_review_required`
- `created_at`

Responsibilities:

- Preserve analysis candidates.
- Provide input to AI analysis jobs and future context packs.
- Keep analysis candidates separate from direct production behavior.

`proposal_status` candidates:

- `proposal`
- `needs_review`
- `approved`
- `rejected`
- `needs_revision`
- `archived`

`approved` means a human approved the candidate as a proposal. It does not mean
the signal has been applied to production behavior.

## 9. Relationship to Existing Tables

Existing tables include:

- `predictions`
- `ai_bias_feedback`
- `daily_summaries`

Policy:

- v0.1 does not change existing tables.
- `raw_events`, `market_snapshots`, and `signals` are Memory Layer candidates
  separate from the existing `/api/forecast` path.
- These tables must not take over the source-of-record responsibility of
  `/api/forecast`.
- Future work may connect Memory Layer data to `prediction_results` or
  `outcomes` after a separate reviewed design.

## 10. Relationship to `/api/forecast`

Current state: `/api/forecast` combines acquisition, prediction, evaluation, and
persistence responsibilities.

v0.1 design:

- Do not change `/api/forecast` behavior in this phase.
- First document the Memory Layer schema boundary.
- Next add characterization tests around current forecast behavior.
- After that, consider read APIs, worker separation, and collector separation in
  separate reviewed PRs.

## 11. Proposal-only Boundary

AI analysis jobs, a future Codex App Server, and the self-improvement loop may
use Memory Layer data to create reviewable proposals.

Boundary rules:

- AI may create signals or analysis proposals.
- AI output is not a production forecast.
- AI output is not a production price.
- AI output is not a prediction evaluation.
- AI output must not be reflected in production behavior without human approval
  and a separate reviewed PR.

## 12. Human Approval Requirements

Human approval is required before:

- Creating or running a DB migration.
- Changing `/api/forecast`.
- Changing `/api/hormuz`.
- Changing the `source_kind` policy.
- Changing the `confidence` policy.
- Changing production forecast logic.
- Changing safety labels.
- Adding an external API integration.
- Changing NAS storage rules.

## 13. Open Questions

- What is the retention policy for `raw_payload_json`?
- What exact format should `source_ref` use for APIs, feeds, and manual inputs?
- Should `event_domain` be a strict enum, a tag, or a later normalized table?
- When should `labels_json` move from JSON into normalized label tables?
- How should `severity` be defined for `signals` across market, energy,
  geopolitical, maritime, and system-health domains?
- Should `high` confidence require multi-source corroboration for some domains?
- How should `fallback_template` and `local_cache` be displayed in the UI?
- How should Memory Layer records relate to local-only NAS synchronization?
- What is the first safe bridge from existing `predictions` into future
  `prediction_results` or `outcomes`?
- When should `context_packs` become stored records instead of generated review
  artifacts?

## 14. Next PR Recommendation

Recommended next PR:

`docs or feat: add Memory Layer v0.1 migration plan`

The next PR should still prefer a migration plan and test strategy before
creating tables. It should document the exact migration shape, rollback path,
characterization tests, and source-kind compatibility decisions before any
database change is introduced.
