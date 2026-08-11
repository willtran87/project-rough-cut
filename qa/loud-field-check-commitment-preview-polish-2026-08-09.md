# Loud Field-Check Commitment Preview Polish

Date: 2026-08-09

## Finding

The complete opening-to-Audit-Bell replay reached a visually clear generated station and an authoritative `ENTER — RING AUDIT BELL` prompt. However, the prompt dropped the risk at the exact commitment point. Earlier material described the field checks as loud, but the player had to remember that lesson, discover the exact verification duration after activation, and wait until Joe was already routing to learn which named cover was the intended counterplay.

This contradicted the otherwise strong interaction contract: consequences should be visible before punishment, and the before/after instruction should describe the same gameplay truth.

## Resolution

- Added `fieldActionCommitmentPreview()` as the shared presentation and diagnostic source.
- Expanded only mandatory station prompts into a contained two-line action rail.
- Kept the active keyboard, gamepad, or touch binding and verb on the first line.
- Added the exact existing signal duration, `JOE WILL VERIFY`, and the existing breakaway cover on the second line.
- Audit Bell previews 6.4 seconds and Hedge Tunnel.
- Field Log previews 5.6 seconds and Service Cart.
- Release Review previews 5.0 seconds and Range Cart.
- Preserved every noise timer, interaction radius, Joe state transition, path, breakaway destination, clean-break timing, objective, score, audio cue, and generated station asset.
- Added `field_action_commitment_preview` to the release readiness audit and a static verifier guard.

No ImageGen asset was required. The generated field-station art was already high quality and correctly grounded; the remaining gap was the clarity of the decision attached to it.

## Verification

- `node --check web/game.js`: passed.
- `node --check tools/verify-release.mjs`: passed.
- `node tools/verify-release.mjs`: passed with 48 referenced runtime assets, zero unreferenced images, zero shipped source masters, 85 deterministic action scenarios, zero warnings, and zero failures.
- Required official game client: reached the Audit Bell through ordinary movement with all course assets settled.
- The owner exported `localStatus: LOUD CHECK` and `LOUD SIGNAL 6.4s // JOE WILL VERIFY // BREAK TO HEDGE TUNNEL` before activation.
- The settled official state passed readiness 39/39 at 60 estimated FPS, 3.21 ms average render work, and 4.7 ms p95 with no browser error artifact.
- The post-activation replay preserved `VERIFYING AUDIT BELL`, the 6.4-second station signal, `BREAK SIGNAL`, the Hedge Tunnel route, the next Field Log objective, and the established Clean Break logic.
- Visual inspection passed at 2560x1600, 1280x720, 800x600, and touch-sized 844x390. The two-line rail remained contained and the touch variant switched the primary action to `TAP USE` without changing consequence copy. Document width matched each viewport exactly, with no horizontal overflow.
- Text diagnostics and the visible rail agreed on owner, duration, cover, and the presentation-only rule.

## Evidence

- `output/field-action-commitment-preview-official-2026-08-09/`
- `output/opening-field-check-audit-2026-08-09/`

## Remaining physical gates

The software contract is closed. The broader release still requires the standing physical keyboard/mouse, controller, touch-device, and sustained mid-tier hardware sessions.
