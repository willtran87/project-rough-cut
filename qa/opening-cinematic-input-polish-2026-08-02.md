# Opening cinematic input and comfort polish — 2026-08-02

## Scope

This pass refines visible input guidance and the existing Reduced Camera Motion treatment for the launch gate and opening cinematic. It changes no art asset, subtitle text, cinematic duration, cut timing, audio cue, menu state, progression data, or gameplay rule.

## Implemented

- Gate keyboard copy: `CLICK / ENTER / SPACE TO BEGIN`.
- Gate gamepad copy: `A / START TO BEGIN INCIDENT`.
- Intro keyboard copy: `ENTER / SPACE / ESC / CLICK TO SKIP`.
- Intro gamepad copy: `A / B / START TO SKIP`.
- Touch copy remains the concise `TAP` instruction.
- Reduced Camera Motion now holds the launch-panel border at a fixed opacity and lowers the one-shot green reveal flash from 0.42 to 0.18 alpha. Existing camera-shake and grass-sway suppression remains authoritative.

## Validation

The official web-game client ran four focused routes against `http://127.0.0.1:4173/`:

1. `web/test-actions/gate.json` confirmed the expanded keyboard start copy remains centered inside the launch panel.
2. `web/test-actions/mid_intro.json` confirmed the expanded skip copy remains clear of the Joe reveal and inside the canvas.
3. `web/test-actions/intro-input-handoff.json` used Space to begin and Enter to skip. Text state ended in `menu` with `BEGIN THE ROUND` selected.
4. `web/test-actions/intro-reduced-motion.json` enabled Reduced Camera Motion through Settings, selected Replay Incident, and reached 3.03 seconds of the intro with `reducedMotion: true`.

All routes produced no console or page-error artifact. Gate rendering averaged 1.18ms, normal and reduced-motion intro samples averaged 0.28â€“0.31ms, and the menu handoff averaged 2.21ms.
