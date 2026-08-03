# Counter-Route signal-handoff polish — 2026-08-02

## Goal

Let the short Quiet Lane tactical benefit read before the repeatable Delivery score toast, without changing scoring, movement, detection, Joe behavior, or the 3.2-second benefit duration.

## Production change

- Added a 1.25-second Counter-Route presentation handoff anchored to the live Quiet Lane timer.
- While that opening handoff is active, `counter_route` owns the HUD focus lane and the earned Delivery card waits without aging.
- Non-urgent ambient world plaques yield during the handoff. Noise hazards within eight meters remain visible.
- After the handoff, the Delivery toast resumes with its full presentation time while the remaining Quiet Lane stays visible in Joe Attention.
- Reduced Camera Motion uses the same information hierarchy.

## Focused validation

`node output/validate-counter-route.mjs`

All seven assertions passed:

- Quiet Lane owns the opening.
- The Delivery card does not age while held.
- Non-urgent ambient context yields.
- Delivery resumes before Quiet Lane expires.
- Reduced Camera Motion retains the hierarchy.
- An imminent six-meter noise hazard remains visible.
- No browser or page errors occurred.

The ordinary success snapshot held the Counter-Route award at its full 2.15 seconds with 2.7 seconds of Quiet Lane remaining. After 0.9 seconds, Delivery resumed with 2.02 seconds of presentation time and 1.8 seconds of quiet movement still active. A simultaneous Audit Row award entered the existing bounded queue instead of replacing either beat.

## Visual evidence

- `output/counter-route-validation/01-counter-route-success.png` — uncluttered Quiet Lane handoff.
- `output/counter-route-validation/04-delivery-resumed.png` — score feedback resumes while Quiet Lane remains active.
- `output/counter-route-validation/03-reduced-success.png` — Reduced Camera Motion parity and imminent-hazard override.

## Regression coverage

- Wrong-way travel still fails the Counter-Route.
- Active pursuit still excludes completion.
- Quiet Lane still expires and returns normal footstep noise.
- Delivery scoring, family caps, combo timing, and queue behavior are unchanged.

The required official web-game client also completed the opening hazard-approach route in `first_hole`, retained the ordinary 22.89-meter noise context cue, sampled 2.38 ms average / 2.9 ms last canvas render work, and produced no browser error artifact. Final cleanup found zero test-browser processes; the requested local server remains available on port 4173.
