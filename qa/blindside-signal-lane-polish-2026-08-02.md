# Blindside signal-lane polish — 2026-08-02

## Goal

Keep Blindside Transfer's five-second cover-to-cover decision readable when the optional practice drill, ambient world plaques, and nearby noise hazards are present.

## Production change

- Active Blindside Transfer now defers non-urgent ambient world plaques.
- The optional practice-bell prompt no longer replaces the time-critical `BLINDSIDE OPEN` instruction while a transfer is active.
- Ordinary prompts and ambient cues return immediately when the transfer completes or closes.
- A noise hazard within eight meters still overrides the deferral.
- During that safety override, the hazard plaque chooses the side opposite the primary mint destination and retains a tether to its physical prop.
- Reduced Camera Motion uses the same information hierarchy.

The maneuver window, cover destinations, crouch requirement, Joe behavior, collision, scoring, cooldown, and Delivery reward are unchanged.

## Focused validation

`node output/validate-blindside-cover-lanes.mjs`

All eight assertions passed:

- Blindside owns the active HUD focus.
- Tee and Clubhouse ambient plaques defer correctly.
- The `BLINDSIDE OPEN` instruction remains visible and the optional practice prompt yields.
- A 7.5-meter noise hazard remains visible.
- The imminent warning renders opposite the primary mint lane.
- Reduced Camera Motion retains the hierarchy.
- Tee, Clubhouse, and Night Range transfers all complete successfully.
- No browser or page errors occurred.

The validator closes its browser in `finally`.

## Visual evidence

- `output/blindside-cover-lanes/01-tee-active.png` — clean active maneuver and instruction rail.
- `output/blindside-cover-lanes/01-tee-imminent.png` — imminent warning preserved on the opposite side of the mint lane.
- `output/blindside-cover-lanes/01-tee-complete.png` — prompts return after completion.
- `output/blindside-cover-lanes/03-range-reduced-active.png` — Reduced Camera Motion parity.

## Baseline regression

The required official web-game client retained the ordinary opening hazard approach at 22.89 meters, stayed in `first_hole`, sampled 2.38 ms average / 2.40 ms last canvas render work, and produced no browser error artifact.

Final cleanup explicitly stopped eight lingering helpers from the official Playwright profile and confirmed zero test-browser processes remained. The requested local server was preserved.
