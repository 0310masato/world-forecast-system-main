# Memory Layer v0.1 Migration Plan

## 1. Purpose

This document plans how the Memory Layer v0.1 database design can later move
into a reviewed migration implementation.

It is a planning and test-strategy document only. This PR does not create a
migration, change the database schema, change runtime behavior, add worker code,
or modify package files.

## 2. Scope

In scope for the first Memory Layer migration plan:

- `raw_events`
- `market_snapshots`
- `signals`

Out of scope for this plan:

- `normalized_events`
- `forecasts`
- `analysis_records`
- `outcomes`
- `tasks`
- `alerts`
- `reports`
- `approval_requests`
- `context_packs`
- Worker runtime
- Codex App Server runtime

Out-of-scope objects remain later-phase work after the minimum Memory Layer
boundary is reviewed.

## 3. Migration Strategy

The planned database target is SQLite. The future migration should add new
tables to the existing `world_forecast.db` without changing existing tables.

Existing production tables:

- `predictions`
- `ai_bias_feedback`
- `daily_summaries`

Migration principles:

- Do not alter existing tables in the first Memory Layer migration.
- Use new `CREATE TABLE` statements only.
- Preserve current `/api/forecast`, `/api/hormuz`, and `/api/hormuz/news`
  behavior.
- Keep the existing forecast core as the source of record for production
  forecasts, price acquisition, evaluation, prediction persistence, and bias
  feedback.
- Keep all Memory Layer analysis output as proposal data until a separate human
  approval gate and implementation path applies it.

Two execution models are possible:

- Explicit execution: a human runs the migration command intentionally. This is
  safer for the first Memory Layer change because it makes the approval and
  rollback point visible.
- Startup safe execution: the application checks and creates missing tables on
  startup. This can reduce operator steps later, but it risks hiding a schema
  change inside normal application boot unless the guardrails and logs are
  reviewed first.

Recommendation for v0.1: use manual or narrowly explicit execution for the
first migration. Startup execution can be reconsidered after characterization
tests, rollback behavior, and operator approval flow are in place.

## 4. Proposed SQL Draft

The following SQL is a draft for review only. It is not an implemented
migration.

```sql
CREATE TABLE IF NOT EXISTS raw_events (
  id TEXT PRIMARY KEY,
  observed_at INTEGER NOT NULL,
  ingested_at INTEGER NOT NULL,
  source_kind TEXT NOT NULL,
  source_name TEXT,
  source_ref TEXT,
  event_domain TEXT NOT NULL,
  raw_payload_json TEXT,
  summary TEXT,
  confidence TEXT NOT NULL,
  limitations TEXT,
  labels_json TEXT,
  is_mock INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  CHECK (
    source_kind IN (
      'real_api',
      'real_rss',
      'mock',
      'simulated',
      'estimated',
      'manual',
      'derived',
      'fallback_template',
      'local_cache'
    )
  ),
  CHECK (confidence IN ('low', 'medium', 'high')),
  CHECK (is_mock IN (0, 1)),
  CHECK (
    source_kind NOT IN ('mock', 'simulated', 'fallback_template')
    OR confidence <> 'high'
  )
);

CREATE TABLE IF NOT EXISTS market_snapshots (
  id TEXT PRIMARY KEY,
  captured_at INTEGER NOT NULL,
  asset_symbol TEXT NOT NULL,
  asset_name TEXT,
  asset_class TEXT,
  price REAL NOT NULL,
  currency TEXT,
  source_kind TEXT NOT NULL,
  source_name TEXT,
  source_ref TEXT,
  change_percent REAL,
  raw_payload_json TEXT,
  confidence TEXT NOT NULL,
  limitations TEXT,
  created_at INTEGER NOT NULL,
  CHECK (
    source_kind IN (
      'real_api',
      'real_rss',
      'mock',
      'simulated',
      'estimated',
      'manual',
      'derived',
      'fallback_template',
      'local_cache'
    )
  ),
  CHECK (confidence IN ('low', 'medium', 'high')),
  CHECK (
    source_kind NOT IN ('mock', 'simulated', 'fallback_template')
    OR confidence <> 'high'
  )
);

CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  detected_at INTEGER NOT NULL,
  signal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  severity TEXT NOT NULL,
  direction TEXT,
  strength REAL,
  confidence TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  related_raw_event_ids_json TEXT,
  related_market_snapshot_ids_json TEXT,
  labels_json TEXT,
  limitations TEXT,
  proposal_status TEXT NOT NULL DEFAULT 'proposal',
  human_review_required INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  CHECK (
    source_kind IN (
      'real_api',
      'real_rss',
      'mock',
      'simulated',
      'estimated',
      'manual',
      'derived',
      'fallback_template',
      'local_cache'
    )
  ),
  CHECK (confidence IN ('low', 'medium', 'high')),
  CHECK (
    proposal_status IN (
      'proposal',
      'needs_review',
      'approved',
      'rejected',
      'needs_revision',
      'archived'
    )
  ),
  CHECK (human_review_required IN (0, 1)),
  CHECK (
    source_kind NOT IN ('mock', 'simulated', 'fallback_template')
    OR confidence <> 'high'
  )
);
```

Timestamp units should be confirmed before implementation so `observed_at`,
`ingested_at`, `captured_at`, `detected_at`, and `created_at` remain consistent
with the existing application conventions.

## 5. Constraints and Checks

SQLite does not provide native enum types, so the first migration should use
`CHECK` constraints for simple allowed-value validation.

Proposed `source_kind` values:

- `real_api`
- `real_rss`
- `mock`
- `simulated`
- `estimated`
- `manual`
- `derived`
- `fallback_template`
- `local_cache`

Proposed `confidence` values:

- `low`
- `medium`
- `high`

Proposed `proposal_status` values:

- `proposal`
- `needs_review`
- `approved`
- `rejected`
- `needs_revision`
- `archived`

Important policy: `mock`, `simulated`, and `fallback_template` records should
not be allowed to use `high` confidence.

This can be partly expressed in SQLite with a table-level `CHECK` constraint:

```sql
CHECK (
  source_kind NOT IN ('mock', 'simulated', 'fallback_template')
  OR confidence <> 'high'
)
```

However, the full confidence policy is broader than this simple rule. For
example, a `high` confidence real source should also require source metadata,
freshness, and intended-use review. Those conditions are better handled with
application-level validation because they depend on context that a static SQLite
constraint cannot reliably evaluate.

Recommendation: combine SQLite `CHECK` constraints for durable minimum rules
with application-level validation for freshness, source-reference requirements,
and domain-specific confidence decisions.

## 6. Index Strategy

Minimum future index draft:

- `raw_events(observed_at)`
- `raw_events(source_kind)`
- `raw_events(event_domain)`
- `market_snapshots(captured_at)`
- `market_snapshots(asset_symbol, captured_at)`
- `signals(detected_at)`
- `signals(signal_type)`
- `signals(proposal_status)`

These indexes support common review and query paths without trying to optimize
unimplemented runtime flows. Additional indexes should wait until read paths and
query shapes are reviewed.

## 7. Rollback Strategy

The first migration is expected to add new tables only, so pre-production
rollback can be simple. Rollback becomes more sensitive after any real data is
stored.

Pre-production rollback:

- Confirm no production or review data has been written to the new tables.
- Drop only the newly created Memory Layer tables.
- Re-run characterization checks for existing forecast and Hormuz behavior.

Post-data rollback:

- Do not drop tables as the default rollback after data exists.
- Prefer disabling read paths or collectors that consume Memory Layer data.
- Preserve existing records for audit and review unless a human explicitly
  approves deletion.

Disable-read-path rollback:

- If a future feature reads Memory Layer data and becomes unsafe or confusing,
  disable that read path while keeping the production forecast core running.
- Keep `/api/forecast`, `/api/hormuz`, and `/api/hormuz/news` independent from
  Memory Layer availability until worker separation is reviewed.

Export-before-drop policy:

- Before any destructive table drop, export the table data to an approved,
  non-secret artifact.
- Confirm the export does not contain secrets, local filesystem paths, NAS paths,
  or unnecessary private data.
- Require explicit human approval before deleting stored Memory Layer data.

## 8. Characterization Test Strategy

Before implementing a migration, future work should add or run characterization
tests that prove existing behavior is unchanged.

Test targets:

- `/api/forecast?fast=true`
- `/api/hormuz`
- `/api/hormuz/news`
- Database initialization
- Existing `predictions`, `ai_bias_feedback`, and `daily_summaries` behavior
- Safe behavior when optional local NAS logging is disabled

Future test candidates:

- Start the app with a clean local SQLite database and confirm existing tables
  initialize as before.
- Call `/api/forecast?fast=true` and compare the current response shape,
  persistence behavior, safety labels, and evaluation fields.
- Call `/api/hormuz` with mock-first configuration and confirm it returns
  estimated or simulated maritime data without exposing local paths.
- Call `/api/hormuz/news` with mock-first configuration and confirm simulated
  source labels remain visible.
- Confirm `predictions`, `ai_bias_feedback`, and `daily_summaries` still exist
  and can be read after the future migration.
- Confirm optional local NAS logging disabled mode does not throw, does not
  block API responses, and does not expose local path details.

This PR does not add these tests. It records the test strategy that should gate
the migration implementation PR.

## 9. `/api/forecast` Non-Interference

This migration plan does not change `/api/forecast`.

If a future PR connects Memory Layer data to forecast review, it must still
preserve these boundaries:

- Do not replace the forecast core.
- Do not make Memory Layer data the price source of record.
- Do not make AI proposals production forecasts.
- Do not write proposal data into production forecast or evaluation records.
- Do not connect Memory Layer reads to production behavior before worker
  separation is reviewed.

The production forecast core remains responsible for forecast generation, price
acquisition, evaluation, prediction persistence, bias feedback updates, and
production API behavior.

## 10. Source Kind Compatibility

Earlier documents use `live` as a broad source-kind label. The v0.1 DB design
uses more explicit source kinds:

- `real_api`
- `real_rss`

Compatibility policy:

- Do not implement `live` as a database enum value.
- Split `live` into `real_api` or `real_rss` during implementation.
- Preserve source metadata so real API data and real feed data can be audited
  separately.
- UI labels may display a human-friendly label such as `Live`, but the database
  should keep the precise source kind.

This keeps older documentation understandable while making the database policy
less ambiguous.

## 11. JSON Column Policy

SQLite should store flexible JSON payloads as `TEXT` in v0.1.

JSON-text columns:

- `raw_payload_json`
- `labels_json`
- `related_raw_event_ids_json`
- `related_market_snapshot_ids_json`

Policy:

- Validate JSON shape at the application level before writing records.
- Do not rely on SQLite JSON extensions as a required runtime dependency for
  v0.1.
- Keep JSON payloads free of secrets, raw local filesystem paths, NAS paths, and
  unnecessary private data.
- Move repeated or heavily queried JSON structures into normalized tables only
  after real read paths justify the added complexity.

The v0.1 priority is safe flexibility while the Memory Layer review model is
still being shaped.

## 12. Human Approval Gate

Human approval is required before:

- Implementing a migration.
- Running a migration.
- Running rollback.
- Changing existing tables.
- Connecting Memory Layer data to `/api/forecast`.
- Changing `confidence` or `source_kind` policy.
- Promoting an AI proposal into production behavior.
- Adding worker runtime or Codex App Server runtime behavior.

Approval, rejection, revision, and archival outcomes must all remain valid.
`approved` means a human approved a proposal as a proposal; it does not mean the
proposal has been applied to production behavior.

## 13. Next PR Recommendation

Recommended next PR:

`feat: add Memory Layer v0.1 migration scaffolding`

Before that PR starts, confirm:

- The minimal characterization test plan.
- The exact migration file location and naming convention.
- The timestamp unit for new integer timestamp columns.
- The rollback confirmation flow.
- Whether the first migration is manual-only or uses a narrowly explicit runner.

The next PR may add migration scaffolding only after human approval. It should
still avoid changing `/api/forecast`, `/api/hormuz`, runtime worker behavior,
external API integrations, package files, and production data semantics unless
those changes are separately approved.
