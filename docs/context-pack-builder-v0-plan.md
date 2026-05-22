# Context Pack Builder v0 Plan

## 1. Purpose

Context Pack Builder v0 defines how `world-forecast-system-main` should assemble
safe, reviewable context for future AI analysis jobs.

The builder is a gatekeeper between Memory Layer records, approved policy
documents, and future AI-sidecar consumers. It should prepare enough context for
an AI job to draft a proposal while preserving the system boundary:

- A context pack is AI analysis input, not production state.
- A context pack is not the source of record for production forecasts, prices,
  evaluations, or saved predictions.
- AI output generated from a context pack remains proposal data until a human
  reviews it.
- AI output must not be promoted into production behavior by the builder.
- The builder must not change `/api/forecast`, `/api/hormuz`, database state,
  persistence rules, safety labels, or external publication behavior.

## 2. Scope

### v0 Inputs

Context Pack Builder v0 may assemble context from these reviewed sources:

- `raw_events`
- `market_snapshots`
- `signals`
- Approved documentation and policy references

Approved docs and policy references include documents such as:

- `docs/CONTEXT_PACKS.md`
- `docs/AI_ANALYSIS_JOBS.md`
- `docs/HUMAN_APPROVAL.md`
- `docs/SELF_IMPROVEMENT_LOOP.md`
- `docs/CODEX_APP_SERVER.md`
- Memory Layer design and migration planning docs

### v0 Exclusions

Context Pack Builder v0 must not include or perform:

- Full database dumps
- Secrets, credentials, API keys, OAuth tokens, or private key material
- `.env` or `.env.local` contents
- Raw local filesystem paths or NAS paths
- Private network host references
- External API direct calls
- Production write instructions
- Unreviewed production database exports
- Runtime Codex App Server integration
- Worker execution
- Database migrations
- Package dependency changes

If a local artifact must be referenced for human follow-up, the context pack
should use a sanitized label rather than the raw location.

## 3. Context Pack Shape

The initial shape should be JSON-compatible and stable enough for future tests.
This is a planning shape only; it does not create a runtime contract yet.

```json
{
  "context_pack_id": "context_pack_example",
  "context_pack_version": 1,
  "created_at": 1770000000,
  "purpose": {
    "job_type": "forecast_review_notes",
    "summary": "Prepare review context for a proposal-only AI analysis job."
  },
  "source_refs": [
    {
      "source_type": "signal",
      "id": "signal_example",
      "source_kind": "real_api",
      "confidence": "medium"
    },
    {
      "source_type": "policy_doc",
      "id": "human_approval_policy",
      "ref": "docs/HUMAN_APPROVAL.md"
    }
  ],
  "included_records": {
    "signals": [
      {
        "id": "signal_example",
        "source_kind": "real_api",
        "confidence": "medium",
        "stale": false,
        "summary": "Sanitized signal summary."
      }
    ],
    "raw_events": [
      {
        "id": "raw_event_example",
        "source_kind": "real_rss",
        "confidence": "medium",
        "stale": false,
        "summary": "Sanitized source event summary."
      }
    ],
    "market_snapshots": [
      {
        "id": "market_snapshot_example",
        "source_kind": "real_api",
        "confidence": "medium",
        "stale": true,
        "limitations": "Older than the intended review window."
      }
    ],
    "policy_refs": [
      "docs/CONTEXT_PACKS.md",
      "docs/AI_ANALYSIS_JOBS.md",
      "docs/HUMAN_APPROVAL.md"
    ]
  },
  "excluded_records": [
    {
      "source_type": "raw_event",
      "id": "raw_event_excluded",
      "reason": "Restricted local path reference was detected."
    },
    {
      "source_type": "market_snapshot",
      "id": "market_snapshot_excluded",
      "reason": "Record exceeded the configured context limit."
    }
  ],
  "safety_labels": [
    "AI analysis input",
    "Not production state",
    "Human approval required",
    "Not investment advice",
    "Not navigation guidance",
    "Not military guidance",
    "Not automated trading guidance"
  ],
  "limitations": [
    "Context may be incomplete.",
    "Stale records are labeled and must not be treated as current facts.",
    "Mock, simulated, and estimated labels are preserved from source records."
  ],
  "human_review_required": true,
  "policy_refs": [
    "docs/CODEX_APP_SERVER.md",
    "docs/HUMAN_APPROVAL.md",
    "docs/CONTEXT_PACKS.md",
    "docs/AI_ANALYSIS_JOBS.md",
    "docs/SELF_IMPROVEMENT_LOOP.md"
  ]
}
```

Recommended timestamp convention for v0 is Unix seconds, matching the Memory
Layer helper conventions.

## 4. Sanitization Rules

Context Pack Builder v0 should apply sanitization before a record can be placed
in `included_records`.

Required rules:

- Exclude secret-like values.
- Exclude known secret environment variable names and credential markers.
- Exclude private key material.
- Exclude `.env` and `.env.local` content or references to their contents.
- Exclude raw local filesystem paths, file URLs, and NAS paths.
- Exclude private IP or private network host references.
- Exclude unnecessary private data.
- Preserve `mock`, `simulated`, `estimated`, and AI-generated labels.
- Preserve `source_kind`, `confidence`, `limitations`, and relevant source
  metadata.
- Preserve whether a record came from real evidence, mock input, simulated
  input, estimated input, manual input, derived data, fallback templates, or
  local cache.
- Preserve warning labels that say data is not investment advice, navigation
  guidance, military guidance, or automated trading guidance.

If sanitization is uncertain, the record should be excluded and the reason
should be recorded in `excluded_records`.

## 5. Builder Algorithm

Context Pack Builder v0 should use a signal-centered assembly flow.

1. Start from one requested `signal` or a small bounded set of requested
   `signals`.
2. Validate that the requested signal identifiers and options contain no
   restricted content.
3. Load the selected signals with a configured limit.
4. Read related `raw_events` through `related_raw_event_ids_json`.
5. Read related `market_snapshots` through
   `related_market_snapshot_ids_json`.
6. Apply per-source and total context limits so the builder cannot create an
   unbounded context pack.
7. Classify included records by source category:
   - `signals`
   - `raw_events`
   - `market_snapshots`
   - `policy_refs`
8. Preserve each record's `source_kind`, `confidence`, `limitations`, and
   source metadata.
9. Re-check high confidence conditions before including a record as high
   confidence:
   - `source_kind` must be `real_api` or `real_rss`.
   - `source_ref` must be present where the record type supports it.
   - The relevant observation timestamp must be present.
   - The source must not be stale for the requested purpose.
   - The record must not be `mock`, `simulated`, or `fallback_template`.
10. Mark stale records explicitly instead of silently treating them as current.
11. Preserve mock, simulated, estimated, fallback, and local-cache labels.
12. Run sanitization over text fields, JSON payloads, labels, limitations, and
    policy references.
13. Include only records that pass sanitization and scope checks.
14. Add excluded records with concise reasons, such as:
    - restricted content detected
    - unsupported source category
    - stale beyond the configured window
    - exceeded context limit
    - missing source metadata for requested confidence
    - not relevant to the requested purpose
15. Add policy references that define allowed use and human approval boundaries.
16. Set `human_review_required` to `true`.

The builder should fail closed. When a record is ambiguous, unsafe, or outside
the requested purpose, it should be excluded rather than included.

## 6. Human Approval Boundary

A context pack is an input to AI analysis. It is not production state and must
not be treated as production truth.

Human review may be required before running an AI analysis job when:

- The context pack includes stale records.
- The context pack includes mixed real, mock, simulated, estimated, fallback, or
  local-cache sources.
- Sanitization excluded material that may affect interpretation.
- The requested AI analysis could influence future forecast logic, safety
  labels, or operator-facing claims.

Human approval is required before any downstream result can:

- Change forecast logic.
- Change `/api/forecast` or `/api/hormuz`.
- Change database state or persistence rules.
- Change safety labels or disclaimers.
- Publish or post externally.
- Be used for investment, navigation, military, trading, or operational
  decisions.

Approval of an AI proposal does not automatically apply it. Applying an approved
proposal still requires a separate reviewed implementation path.

## 7. Future Implementation Plan

A future implementation PR may add a small, non-production Context Pack Builder
module after this plan is reviewed.

Candidate files:

- `lib/context-packs/types.ts`
- `lib/context-packs/validation.ts`
- `lib/context-packs/build.ts`
- `scripts/context-pack-builder-smoke.mjs`

Suggested first implementation slice:

- Define the JSON-compatible context pack types.
- Add validation helpers that reuse Memory Layer sanitization policy where
  practical.
- Build a signal-centered context pack from an injected database adapter for
  testability.
- Keep all outputs proposal-only and review-only.
- Add a smoke script that uses local mock data or an injected test database.
- Avoid Codex App Server runtime, worker runtime, external API calls, package
  changes, database migrations, and production API changes.

Suggested future tests:

- Context pack keeps `source_kind`, `confidence`, and limitations.
- Mock, simulated, estimated, fallback, and local-cache labels remain visible.
- Secret-like values, `.env` content, local paths, NAS paths, and private
  network references are excluded.
- High confidence records are downgraded or excluded when required source
  metadata or freshness is missing.
- Excluded records preserve a reviewable reason.
- `/api/forecast` and `/api/hormuz` behavior remains unchanged.

## 8. Non-Goals

This planning PR does not add:

- Codex App Server runtime
- Worker runtime
- Runtime Context Pack Builder code
- Database migrations
- Database schema changes
- Package changes
- External API integrations
- `/api/forecast` changes
- `/api/hormuz` changes
- Production forecast writes
- Production evaluation writes
- Production price-source changes
- Automatic promotion of AI output into production behavior
