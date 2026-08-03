# Crosswind signal-handoff polish — 2026-08-02

## Goal

Give Crosswind a readable warning, a clean active window, and an immediate payoff without letting repeatable score cards or ambient labels obscure the tactical information.

## Production change

- The 1.35-second gust warning now owns the main presentation lane.
- The active gust retains that ownership for a 1.7-second opening brief, then returns the field to its normal information hierarchy while the 4.4-second mechanic continues.
- Completing a 30-meter Wind Run owns a 1.25-second consequence handoff before the Delivery toast appears.
- Delivery cards deferred by Crosswind do not age while hidden.
- If a zone reward and the Wind Run reward are earned together, an entirely unseen zone card moves into the queue and the Crosswind reward becomes the first visible payoff. The zone reward remains intact and presents next. A reward already visible to the player is never interrupted.
- Non-urgent ambient world plaques defer during the focused Crosswind windows.
- A noise hazard within eight meters remains visible as the safety override, grounded by a tether to its physical prop.
- Pursuit still overrides Crosswind presentation and disables its noise masking. Bunker sand retains its louder movement exception.
- Reduced Camera Motion uses the same information hierarchy and timing.

Crosswind duration, traversal target, movement, sightlines, tracks, Joe behavior, collision, scoring values, chain timing, and Weather-family caps are unchanged.

## Focused validation

`node output/validate-crosswind.mjs`

All ten assertions passed:

- The warning owns the presentation focus.
- The active opening brief owns the presentation focus.
- Non-urgent ambient cues defer during the focused window.
- An imminent maintenance-tools hazard remains visible at eight meters.
- The Wind Run handoff owns the presentation focus.
- The Crosswind Delivery reward is promoted ahead of an unseen simultaneous zone card.
- Both earned rewards remain present in the Delivery ledger and queue.
- Pursuit overrides Crosswind and restores authoritative threat presentation.
- Reduced Camera Motion retains the same hierarchy.
- No browser or page errors occurred.

The validator closes its page and browser in `finally`.

## Visual evidence

- `output/crosswind-validation/01-warning.png` — focused gust warning without redundant state cards.
- `output/crosswind-validation/02-active.png` — readable active brief with navigation preserved.
- `output/crosswind-validation/08-warning-imminent.png` — eight-meter hazard safety override grounded in the world.
- `output/crosswind-validation/04-wind-run.png` — clean Wind Run consequence handoff.
- `output/crosswind-validation/07-wind-reward.png` — Crosswind reward presents first while the zone award remains queued.
- `output/crosswind-validation/06-reduced-active.png` — Reduced Camera Motion parity.

## Baseline regression

The required official web-game client retained the ordinary opening route and its 22.89-meter noise-hazard cue, remained in `first_hole`, sampled 2.13 ms average / 1.40 ms last canvas render work across 202 rendered frames, and produced no browser error artifact.

The requested local server remains available on port 4173. Final process cleanup is recorded with the handoff.
