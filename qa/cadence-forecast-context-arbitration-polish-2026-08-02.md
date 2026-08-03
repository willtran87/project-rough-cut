# Cadence Forecast Context-Arbitration Polish — 2026-08-02

## Outcome

The opening Mower Cadence forecast now defers non-urgent ambient world plaques. The `JOE NEXT` compass, forecast route, map trace, and consequence rail remain the only tactical route-reading signals during the focused 2.45-second handoff.

The existing safety override remains authoritative: an untriggered noise hazard within eight meters still appears. This prevents the presentation cleanup from hiding an immediate footfall risk.

No hazard radius, noise strength, warning distance, Cadence timing, Delivery timing, collision, Joe behavior, or scoring changed.

## Focused validation

The Cadence replay was expanded to cover ordinary ambient clutter and an imminent-hazard override. All nine assertions passed with no browser/page errors:

- the forecast owns its opening signal lane
- the queued award does not age
- the forecast clock remains live
- Delivery resumes after the handoff
- the forecast tail remains available
- Reduced Camera Motion retains the hierarchy
- a 24-meter Maintenance Tools plaque is deferred as `cadence_forecast`
- a five-meter Maintenance Tools plaque remains visible as a noise safety cue
- no console/page errors occur

Visual review confirmed the ordinary forecast frame no longer places `MAINTENANCE TOOLS / WALK WIDE` beneath the route compass. The five-meter override remains offset below and right of the compass without obscuring the route or bottom consequence rail.

Evidence:

- `output/cadence-forecast-handoff-validation/01-forecast-handoff.png`
- `output/cadence-forecast-handoff-validation/05-imminent-hazard-override.png`
- `output/cadence-forecast-handoff-validation/audit-report.json`

## Required official client

The official input-driven hazard approach remained in `first_hole` and exposed the ordinary `noise` context cue at 22.89 meters. The expected generated Spilled Range Balls art, ground ring, label, route guidance, and map remained visible with no browser error artifact. Sampled canvas work averaged 2.46 ms with a 1.80 ms final frame.

Evidence:

- `output/cadence-context-arbitration-official-2026-08-02/shot-0.png`
- `output/cadence-context-arbitration-official-2026-08-02/state-0.json`

## Cleanup

Every focused and official browser context closes after capture. The user-requested local server remains available at `http://127.0.0.1:4173/`.
