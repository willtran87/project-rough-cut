# Cut Trace signal-handoff polish — 2026-08-02

## Goal

Turn the 0.55-second Cut Trace scan and six-second counter-route memory into one readable tactical sequence instead of letting Listening Focus, objective prompts, ambient plaques, Joe subtitles, state banners, and score cards announce over it.

## Production change

- An active scan now owns the presentation lane below mandatory actions and active distraction consequences.
- The large Listening Focus dossier collapses during scanning; a dedicated centered `READING CUT TRACE` meter exposes exact progress, the required held input, cut freshness, distance, and purpose.
- Unrelated messages, interaction prompts, generic Joe-state banners, Joe dialogue, threat-caption cards, non-urgent ambient plaques, and duplicate concealment copy yield during the focused sequence.
- Hidden prompt and message source copy remains available in `render_game_to_text`, with `cut_trace` identifying the deferral.
- A noise hazard within eight meters remains the safety override with its physical prop, distance, label, and tether intact.
- Locking a trace starts a 1.45-second handoff that pauses until Listening Focus is released. The authored `release Q and move against Joe's arrow` instruction and six-second world memory become the only tactical consequence read.
- Delivery cards wait without aging through the scan and handoff, then resume with their remaining display time.
- Resolving the 12-meter Counter-Route immediately ends Cut Trace ownership so the established Quiet Lane handoff can never be delayed by an overlapping timer.
- Cut freshness, scan duration, memory duration, required distance/alignment, Joe behavior, movement, collision, scoring, duplicate lockout, and Reduced Camera Motion behavior are unchanged.

## Focused validation

`node output/validate-cut-trace-memory.mjs`

All thirteen Cut Trace assertions passed:

- Partial scan owns presentation focus.
- The Listening Focus HUD remains compact.
- Prompt, Joe-state, dialogue, and threat-card lanes isolate correctly.
- Non-urgent ambient context defers.
- An eight-meter spilled-ball hazard remains visible.
- The memory lock owns focus and explains the next action.
- Delivery presentation waits without aging.
- Releasing Listening Focus preserves the handoff.
- Delivery presentation resumes after 1.45 seconds.
- The six-second memory still expires.
- A logged cut cannot be scored twice.
- Reduced Camera Motion retains scan and handoff parity.
- No browser or page errors occurred.

`node output/validate-counter-route.mjs`

All seven existing Counter-Route hierarchy, timing, reward-resumption, ambient-deferral, imminent-hazard, Reduced Motion, and error assertions also passed. A resolved memory with 0.85 seconds left on its dormant Cut Trace timer correctly reported `counter_route` focus.

## Visual evidence

- `output/cut-trace-memory-validation/00-trace-partial.png` — dedicated scan meter and compact HUD.
- `output/cut-trace-memory-validation/00-trace-imminent.png` — eight-meter hazard safety override.
- `output/cut-trace-memory-validation/01-trace-locked.png` — isolated release-and-cut-back instruction.
- `output/cut-trace-memory-validation/02-trace-memory.png` — six-second counter-route world memory.
- `output/cut-trace-memory-validation/02b-trace-reward-resumed.png` — held Delivery card resumes afterward.
- `output/cut-trace-memory-validation/03-reduced-memory.png` — Reduced Camera Motion parity.

## Baseline regression

The required official web-game client retained the ordinary opening route and remained in `first_hole` at 36 meters. Across 236 rendered frames it sampled 1.83 ms average / 1.60 ms last canvas render work and produced no browser error artifact.

Both validators close their browsers. Final helper-process cleanup and local-server health are recorded with the handoff.
