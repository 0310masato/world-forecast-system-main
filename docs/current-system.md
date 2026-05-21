# Current System

This document records the current shape of `world-forecast-system-main` before the World Pattern Memory v0.1 layer is implemented. It is a baseline for future agents and reviewers.

## Stack

- Next.js App Router with React and TypeScript.
- SQLite through `better-sqlite3` for local forecast persistence.
- D3 for 2D map and data visualization utilities.
- `react-globe.gl`, Three.js, and related rendering libraries for the 3D globe.
- Optional local NAS logging for Japan-bound energy carrier observations when explicitly enabled.

## Main Dashboard

The main dashboard is the primary user-facing operations surface. It combines forecast output, visual world context, and mode switching. It should remain usable as a real-time monitor even before any future memory or agent layer exists.

Responsibilities:

- Show current world forecast signals in a compact operational view.
- Provide access to map, globe, and Hormuz Sentinel views.
- Keep simulation, estimation, and uncertainty language visible when data is not verified.

## 3D Globe

The 3D globe provides geographic orientation and a high-level spatial view of world signals. It is presentation and exploration UI, not a verified intelligence product by itself.

Known care points:

- Avoid adding heavy client-side data without performance checks.
- Avoid implying precision when a coordinate, route, or event is estimated.
- Keep globe updates decoupled from API provider changes.

## 2D Map

The 2D map is the lower-friction geographic view for scanning and comparing events. It should stay available even if the globe is too heavy for a device.

Known care points:

- Keep labels readable and uncertainty visible.
- Do not make map markers look more precise than the underlying source data.
- Avoid mixing simulated and live source kinds without clear labeling.

## Hormuz Sentinel Mode

Hormuz Sentinel Mode is Phase 1 of a mock-first maritime and geopolitical monitoring workflow. It visualizes vessel, weather, news, tension, and Japan-bound energy carrier context for the Hormuz area.

Current safety posture:

- Mock-first behavior is supported through environment flags.
- Estimated vessel cargo, route, anomaly, and Japan-bound metadata must remain labeled as estimated.
- Simulated news must be clearly distinguishable from real-world reporting.
- NAS logging is opt-in and local-only.

## `/api/forecast`

`/api/forecast` is responsible for generating and returning forecast records for the dashboard. It is part of the core world forecast experience and may interact with local SQLite state.

Risks:

- Forecast text can be mistaken for advice if wording becomes too confident.
- Local database assumptions can break builds or local smoke tests if setup is incomplete.
- Future agent-generated analysis must not silently bypass safety labels or human review.

## `/api/hormuz`

`/api/hormuz` returns the main Hormuz Sentinel payload: maritime observations, weather context, tension index, scenario news, and Japan-bound energy carrier records.

Safety design:

- Default operation should be mock-first or safe when provider credentials are absent.
- Estimated fields must be represented as estimates, not verified facts.
- API responses must not expose local NAS paths or secrets.
- NAS writes must remain gated by explicit environment configuration.

## `/api/hormuz/news`

`/api/hormuz/news` returns Hormuz-related news or simulated scenario feed items for the Sentinel view.

Safety design:

- Simulated sources must use safe names and `[SIMULATED]` style labeling.
- Mock or simulated items must not claim official reporting status.
- Confidence levels should not overstate the certainty of simulated events.

## Known Risks

- The app is still a real-time dashboard first; it does not yet have durable World Pattern Memory semantics.
- Forecasts and incident summaries can appear more authoritative than the source quality supports.
- Local SQLite and NAS behavior can vary by machine.
- External provider integrations are not yet governed by a unified `source_kind` policy.
- There is no implemented agent task board, context pack builder, or approval workflow yet.

## Do-Not-Break List

Future changes should avoid breaking these surfaces without a dedicated migration plan:

- `app/api/forecast/route.ts`
- `app/api/hormuz/route.ts`
- `app/api/hormuz/news/route.ts`
- `components/HormuzSentinelView.tsx`
- `lib/maritime/*`
- `lib/nas.ts`
- Existing mock-first Hormuz behavior.
- Existing safety wording for estimated, simulated, and mock data.
- Existing local-only NAS path redaction behavior.
