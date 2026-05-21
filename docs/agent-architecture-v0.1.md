# Agent Architecture v0.1

This document describes a future AI agent organization for World Pattern Memory. It is architecture documentation only; no agent runtime, Codex App Server, worker, or external provider integration is implemented in this phase.

## Operating Model

- Agents produce proposals, summaries, reviews, or tasks.
- Agents do not take external action.
- Human approval is required before publication, operational use, or any consequential decision.
- Every agent output must preserve uncertainty, source kind, and safety limitations.
- Counterfactual and safety review should happen before high-confidence summaries are promoted.

## Agents

### Real-time Data Scout

Purpose: monitor incoming world, market, maritime, weather, and geopolitical inputs.

Responsibilities:

- Identify candidate events for storage.
- Preserve raw source metadata.
- Flag source gaps or stale inputs.
- Avoid generating conclusions beyond the observed source.

### World Memory Archivist

Purpose: maintain durable, searchable World Pattern Memory records.

Responsibilities:

- Link raw events, normalized events, signals, forecasts, outcomes, and reports.
- Preserve source kind and confidence metadata.
- Keep local-only paths and secrets out of shareable records.
- Support future retrieval without rewriting history.

### Event Normalizer

Purpose: convert raw observations into consistent event records.

Responsibilities:

- Extract event type, region, actors, commodities, timestamps, and caveats.
- Separate observed facts from interpretation.
- Mark uncertain fields as estimated.
- Avoid collapsing conflicting sources into one overconfident record.

### Signal Detector

Purpose: detect meaningful changes or patterns across normalized events and market snapshots.

Responsibilities:

- Propose signals with strength, direction, and confidence.
- Link signals to supporting events.
- Mark weak or noisy signals clearly.
- Avoid claiming causality from correlation alone.

### Historical Context Retriever

Purpose: retrieve similar historical patterns for analysis.

Responsibilities:

- Find past events, forecasts, outcomes, and reports related to a current question.
- Summarize similarities and differences.
- Highlight failed analogies and stale assumptions.
- Keep retrieval evidence visible.

### World Direction Analyst

Purpose: summarize directional movement across geopolitics, markets, energy, and global risk.

Responsibilities:

- Produce concise directional briefs.
- Distinguish observed facts, inferred trends, and open questions.
- Avoid investment, military, or navigation advice.
- Route high-impact claims through counterfactual review.

### Counterfactual Reviewer

Purpose: challenge overclaiming, causal certainty, missing evidence, and one-sided analysis.

Responsibilities:

- Identify unsupported claims.
- Propose alternate explanations.
- Lower confidence where evidence is weak.
- Require clearer caveats before analysis is promoted.

### Farm Impact Translator

Purpose: translate world signals into practical impact for poultry farm and Yamato chicken operations.

Responsibilities:

- Interpret likely effects on fuel, electricity, feed, FX, disease, logistics, dining demand, and tourism demand.
- Separate business impact hypotheses from operational instructions.
- Avoid financial advice or automated procurement decisions.
- Keep recommendations as review prompts for humans.

### Maritime Traffic Analyst

Purpose: analyze maritime movement, chokepoints, and estimated energy carrier context.

Responsibilities:

- Review vessel, route, cargo, and chokepoint observations.
- Keep AIS, cargo, and destination claims labeled as estimated unless verified.
- Avoid navigation, military, or security directives.
- Preserve Hormuz Sentinel mock-first safety behavior.

### Operations Monitor

Purpose: watch system health, task flow, and safety gates.

Responsibilities:

- Track failed ingests, stale data, build failures, and review backlog.
- Surface quiet failures for human attention.
- Ensure safety labels and approval states are present.
- Avoid auto-remediation that changes production behavior without approval.
