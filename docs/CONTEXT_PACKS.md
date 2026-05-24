# Context Packs

## Purpose

This document defines how future AI analysis jobs should receive reviewable
context in `world-forecast-system-main`.

This is a planning document only. It does not add context-pack runtime code,
database migrations, external API calls, worker code, or production forecast
behavior.

Related policies:

- `docs/CODEX_APP_SERVER.md`
- `docs/HUMAN_APPROVAL.md`
- `docs/AI_ANALYSIS_JOBS.md`
- `docs/SELF_IMPROVEMENT_LOOP.md`

## Definition

A context pack is a sanitized, versioned bundle of information prepared for AI
analysis. It gives an AI job enough reviewed context to produce a proposal
without granting direct authority over production state.

Context packs are inputs to proposal generation. They are not production state,
not forecast records, and not price or evaluation sources of record.

## Allowed Inputs

A context pack may include reviewed and sanitized material such as:

- Policy documents and safety rules
- High-level forecast performance summaries
- Aggregated error or miss-pattern summaries
- Operator-written notes
- Approved task-board items
- Sanitized API response examples
- Sanitized UI review notes
- Prior AI proposals and human decisions
- Refactor planning notes

When including examples, keep mock, estimated, simulated, and AI-generated
labels visible.

## Excluded Inputs

A context pack must not include:

- Secrets, API keys, OAuth tokens, or credentials
- `.env` or `.env.local` contents
- Raw local filesystem paths
- NAS paths
- Unnecessary private data
- Direct production write instructions
- Unreviewed database dumps
- Live price feeds as an AI-controlled source of record
- Navigation, military, trading, or investment decision instructions

If a source artifact must be referenced for human follow-up, use a sanitized
artifact label instead of the raw path.

## Sanitization Rules

Before a context pack is used by an AI job, it should be checked for:

- Secret-like values
- Local or NAS paths
- `.env` content
- Private user data that is not necessary for review
- Claims that omit estimated, simulated, mock, or proposal labels
- Instructions that ask the AI to write production state
- Instructions that ask the AI to publish externally

If sanitization is uncertain, the context pack should be held for human review
instead of being sent to an AI job.

## Versioning

Each context pack should have a stable identifier and version, for example:

- `context_pack_id`
- `context_pack_version`
- `source_snapshot_id`
- `created_at`
- `created_by`
- `sanitization_status`
- `policy_version`

Changing the included sources, sanitization rules, or policy references should
create a new context pack version.

## Minimum Metadata

Each context pack should record:

- Purpose
- Included source categories
- Excluded source categories
- Sanitization result
- Known limitations
- Applicable safety labels
- Related task or review target
- Expiration or refresh guidance, if relevant

## Consumption Rules

AI jobs may read a context pack to create proposals. They must not use a context
pack to directly:

- Change `/api/forecast`
- Change `/api/hormuz`
- Change database state
- Change production forecast logic
- Change safety labels
- Publish externally
- Make operational decisions

Those actions require human approval and a separate implementation path.

## Human Review Gate

A human reviewer should be able to inspect:

- What the context pack contained
- What was intentionally excluded
- Which sanitization checks passed
- Which policy versions applied
- Which AI proposals were generated from it

Rejected and needs-revision outcomes must remain valid for both the context pack
and any proposal generated from it.

## Example Record

A safe filled Context Pack example lives in
`docs/examples/CONTEXT_PACK_EXAMPLE.md`.
Use `docs/examples/README.md` as the entry point for the example category,
source contract/type references, reading order, and safety boundary.

The example is a docs-only writing sample, not an operations log, execution
result, production forecast, price record, evaluation source, or saved
prediction. It shows how sanitized sample IDs, source refs, included records,
excluded records, limitations, policy refs, safety labels,
`proposal_only: true`, human review, and `is_production_state: false` can stay
visible for review.

## Non-Goals For PR #5

This planning phase does not add:

- Context-pack builder code
- Storage schema
- Database migrations
- Worker runtime
- External API calls
- Prompt execution
- Production forecast changes
