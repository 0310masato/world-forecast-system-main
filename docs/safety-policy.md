# Safety Policy

World Pattern Memory must support analysis without pretending to be a source of operational authority. This policy applies to dashboard content, APIs, future memory records, future agents, and generated reports.

## Prohibited Use

The system must not provide:

- Investment advice or trading instructions.
- Navigation decisions or maritime routing instructions.
- Military targeting, escalation, defense, or tactical decisions.
- Claims that simulated, mock, or estimated data is verified ground truth.

## Required Labels

Use clear labels whenever data is not verified live source material:

- `MOCK`: local fixture or demo input.
- `SIMULATED`: fictional scenario or generated scenario feed.
- `ESTIMATED`: inferred, modeled, incomplete, or uncertain information.

Labels must remain visible in user-facing summaries and preserved in future memory records.

## `source_kind` Policy

Future records should use explicit `source_kind` values:

- `live`: externally sourced current data, with source metadata.
- `mock`: local fixture used for development or fallback.
- `simulated`: fictional scenario feed or demo event.
- `estimated`: inferred value derived from incomplete data.
- `manual`: human-entered note or override.
- `derived`: computed record based on other stored records.

`source_kind` must not be omitted when data influences a forecast, signal, alert, report, or agent output.

## Local Path and Secret Policy

- Do not expose local filesystem paths in API responses, reports, or shareable memory records.
- Do not commit `.env`, `.env.local`, provider tokens, API keys, credentials, or private hostnames.
- NAS writes must remain opt-in and local-only.
- Share status metadata instead of raw local paths.
- Redact sensitive payload fields before storing or summarizing them.

## Human Approval Required

Human approval is required before:

- Publishing reports externally.
- Treating an AI-generated analysis as an operational recommendation.
- Enabling new external providers.
- Adding migrations or durable production storage.
- Changing safety labels, source-kind behavior, or approval gates.

## Quiet Failure Policy

The system should fail quietly for users when a source, worker, or optional persistence path is unavailable, but it must not hide the condition from operators.

Expected behavior:

- Use safe fallback data when designed to do so.
- Mark stale, missing, mock, or simulated data clearly.
- Record a non-secret status for operator review.
- Do not invent live data to cover a failed source.
- Do not retry in a way that leaks secrets or floods providers.

## Forecast and Analysis Wording

Forecasts and agent summaries should:

- State assumptions and confidence.
- Separate observation from inference.
- Include counterarguments for consequential claims.
- Avoid imperative action language.
- Avoid implying certainty from single-source evidence.
