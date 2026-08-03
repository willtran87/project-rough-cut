# Hold Your Nerve signal-handoff polish — 2026-08-02

## Goal

Make the 1.65-second Hold Your Nerve commitment and its 4.4-second mint exit window readable as one suspenseful survival sequence, even when Listening Focus, an interactable objective, ambient plaques, dialogue, and Delivery feedback are all eligible to appear.

## Production change

- An active Nerve hold now owns the HUD presentation lane below pursuit and other mandatory actions.
- Listening Focus remains mechanically active, but its large dossier collapses during the commitment so the Nerve meter and Joe bearing become the central read.
- Unrelated interaction prompts, authored messages, Joe-state banners, dialogue subtitles, threat-caption cards, ambient plaques, and the duplicate rough-concealment strip yield during the hold.
- Hidden message and prompt source copy remains available in `render_game_to_text`, with `nerve_hold` identifying the deferral.
- A noise hazard within eight meters still overrides ambient deferral and retains its grounded prop, world label, distance, and tether.
- Completion opens a 1.25-second escape-lane handoff inside the existing 4.4-second exit window. The mint route and consequence sentence present before the Delivery score card.
- A Delivery card held by this handoff does not age; it resumes with its full remaining presentation time afterward.
- Pursuit remains the higher-priority survival state. Movement cancellation, sightline grace, objective interaction, Joe behavior, collision, scoring, per-zone lockout, two-event run cap, and Reduced Camera Motion behavior are unchanged.

## Focused validation

`node output/validate-nerve-hold.mjs`

All thirteen assertions passed:

- Active Nerve owns the presentation focus.
- The Listening Focus dossier stays compact during the hold.
- Message, prompt, Joe-state, dialogue, and threat-card lanes are isolated correctly.
- Non-urgent ambient context defers.
- The completion handoff retains Nerve focus.
- The handoff visibly explains the mint escape lane.
- Delivery presentation waits without aging.
- Delivery presentation resumes after the 1.25-second handoff.
- An eight-meter spilled-ball hazard remains visible.
- Reduced Camera Motion retains the hierarchy.
- Movement still cancels the commitment.
- Same-zone lockout and the two-event run cap remain intact.
- No browser or page errors occurred.

## Visual evidence

- `output/nerve-hold/01-standard-active.png` — isolated Nerve commitment with compact HUD.
- `output/nerve-hold/01-standard-complete.png` — mint exit lane and consequence handoff.
- `output/nerve-hold/01-standard-resumed.png` — Delivery card resumes after the tactical read.
- `output/nerve-hold/03-imminent-safety.png` — grounded eight-meter hazard safety override.
- `output/nerve-hold/02-reduced-active.png` — Reduced Camera Motion parity.

## Baseline regression

The required official web-game client retained the ordinary opening route and remained in `first_hole` at 36 meters. Across 227 rendered frames it sampled 2.23 ms average / 1.60 ms last canvas render work and produced no browser error artifact.

The validator closes every scenario page and its browser. Final helper-process cleanup and local-server health are recorded with the handoff.
