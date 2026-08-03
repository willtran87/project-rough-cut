# Score-Handoff Context Polish QA — 2026-08-03

## Scope

A mature Audit Row frame showed a Delivery award, route-back card, zone message, and 20-meter maintenance-tools warning simultaneously inside the hedge tunnel. The hazard was useful but not imminent, so the extra center plaque reduced the score beat's legibility without improving immediate safety.

## Implementation contract

- Visible Delivery and Risk Premium handoffs defer ordinary blocker, practice, and noise-hazard context cards.
- A noise hazard at eight meters or closer remains authoritative and renders immediately.
- Deferred context is presentation-only; hazards, collision, noise, Joe behavior, scoring, route guidance, and map state continue normally.
- Route-back navigation and zone guidance remain visible during the score handoff.
- The physical context card becomes eligible again as soon as the score focus ends.
- Reduced Camera Motion preserves the same hierarchy and information.
- `render_game_to_text` reports the deferral owner through the existing `contextCue.deferredBy` field.

## Focused automated replay

Command:

```powershell
node output/validate-score-handoff-context.mjs
```

Result: 8/8 checks passed.

Covered cases:

- Delivery defers a non-imminent field plaque.
- The score card remains active while the hazard remains physically present.
- The same tools plaque returns after Delivery ends.
- A seven-meter hazard overrides Delivery deferral.
- Risk Premium receives the same focused presentation.
- Compact layout preserves the hierarchy.
- Reduced Camera Motion preserves the hierarchy.
- All scenarios complete without browser or page errors.

## Visual review

Reviewed generated frames at:

- 2560x1600 Delivery handoff
- 1280x720 context return
- 1280x720 imminent hazard override
- 1280x720 Risk Premium
- 844x390 compact Delivery handoff
- 1280x720 Reduced Camera Motion

The score cards have a clear center read, the imminent override remains obvious, and the returning context plaque uses its established grounded position.

## Official uninstrumented client

Command:

```powershell
node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/mower_effects.json --iterations 1 --pause-ms 120 --screenshot-dir output/score-handoff-context-official-2026-08-03
```

The ordinary route reached Audit Row with `AUDIT ROW REACHED // +70` active and the maintenance-tools hazard 19.2 meters away. Text state reported `focus: delivery_award`, `contextCue.kind: none`, and `contextCue.deferredBy: delivery_award`; the screenshot retained the route-back cue and zone message without the redundant hazard plaque. No error artifact was produced. Canvas work averaged 1.92ms, the final sample was 1.80ms, and 371 rendered frames were recorded.

## Files

- `web/game.js`
- `web/README.md`
- `progress.md`
- `output/validate-score-handoff-context.mjs` (ignored local validator)
