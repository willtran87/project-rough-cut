# Locomotion Release-Feedback Polish QA — 2026-08-03

## Scope

The official opening route stopped for 22 frames behind the grounds cart, but the center HUD still displayed `RUNNING`. The directional afterglow and locomotion label shared one timer even though the authoritative movement state was idle.

## Implementation contract

- `RUNNING`, sprint, crouch-walk, and bunker-sand labels require current movement input.
- Releasing movement removes the label immediately.
- Directional chevrons may retain and fade the last movement vector for at most 0.42 seconds.
- Chevron opacity and line weight decay with the remaining afterglow.
- Reduced Camera Motion removes the pulse but retains the same truthful state and restrained fade.
- Active locomotion labels move to a protected lower slot when a contextual blocker, noise, practice, or other field plaque is present.
- Movement speed, camera response, noise, terrain effects, collision, and controls are unchanged.
- `render_game_to_text` reports the same live state, label, afterglow, direction, context displacement, and presentation phase shown on screen.

## Focused automated replay

Command:

```powershell
node output/validate-movement-feedback-release.mjs
```

Result: 10/10 checks passed.

Covered cases:

- Live forward movement shows `RUNNING`.
- Input release retains fading chevrons without stale text.
- Feedback fully retires after the settling window.
- Live sprint retains `SPRINTING — LOUD`.
- Live crouch-walk retains its quiet-state label.
- Live bunker traversal retains its sand warning.
- Context-card displacement keeps active labels clear of world plaques.
- Compact release preserves direction without stale text.
- Reduced Camera Motion preserves truthful release state.
- All scenarios complete without browser or page errors.

## Visual review

Reviewed generated frames at:

- 2560x1600 live running and release
- 1280x720 live sprint with a nearby noise-hazard plaque
- 844x390 compact release
- 1280x720 Reduced Camera Motion release

The live labels remain readable, context cards no longer collide with sprint text, and released frames show only a fading directional chevron.

## Official uninstrumented client

Command:

```powershell
node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/mature_chase.json --iterations 1 --pause-ms 120 --screenshot-dir output/movement-feedback-release-official-2026-08-03
```

The ordinary route ended behind the grounds cart after the same 22-frame idle pause that exposed the defect. Text state reported `moving: false`, `label: null`, `labelVisible: false`, `afterglow: 0.13`, and `directional_afterglow_only`; the screenshot contained no stale `RUNNING` text and no error artifact. Canvas work averaged 2.22ms, the final sample was 1.40ms, and 197 rendered frames were recorded.

## Files

- `web/game.js`
- `web/README.md`
- `progress.md`
- `output/validate-movement-feedback-release.mjs` (ignored local validator)
