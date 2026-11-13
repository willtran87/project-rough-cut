# Spatial preference failure feedback — November 12, 2026

The preceding goal turn was progress: the saved optional movement response gained three actual consumers and verified browser/simulation evidence. This pass continues the full 44-item Under the Green objective and applicable shared integrations.

## Reproduction and change

`tools/verify-final-cut-spatial-recovery.cjs --baseline` rejects spatial preference writes while allowing ordinary chapter/campaign saves. Final Cut's live resolution, controller sensitivity and movement easing still apply; persistent values remain unchanged. The shared store already retains pending edits and flushes them correctly after recovery, preserving unrelated fields from another tab. The defect is missing player-facing failure feedback: Final Cut displays no spatial-save warning.

`web/final-cut.html` now has a dedicated `role="status"` message beside its spatial settings. `web/final-cut.js` updates that message from the shared store's actual save result, matching the other on-foot adapters. The warning remains while those changes are unsaved and clears after a successful spatial write flushes pending changes. Successful saves in the audio/caption group cannot clear it. The shared store and game rules are unchanged.

Baseline and final reports: `output/final-cut-spatial-recovery/baseline.json` and `verified.json`.

## Verification

- `node tools/verify-final-cut-spatial-recovery.cjs` passes with no page errors.
- Failed writes preserve the old stored values while the current scene resolution changes to .75 of its previous width, controller turning uses the selected 1.5 multiplier, and ordinary walking uses the selected eased first frame of .0336 m.
- A successful campaign mute write leaves the spatial warning visible.
- A same-origin peer changes FOV and an unrelated extension field while failed edits are pending. Recovery preserves those edits and saves all pending spatial preferences. The warning then clears.
- Recovered values survive reload and navigation to Under the Green. When spatial reads as well as writes are blocked, settings remain usable for the current session, show the warning and recover when access returns.
- Final warning captures were inspected at 2560×1600, 1280×720, 844×390 and 390×844. Compact captures use actual touch-capable/mobile contexts. The warning wraps within the fieldset and remains reachable by scrolling.
- Installed gameplay client completed a normal Final Cut movement/release burst, exit 0. Inspected `client-final/shot-0.png` and `state-0.json`: ready, playing at 2.53 seconds, stopped after release, no error files. This is a normal-play smoke check; storage failure is tested by the browser suite above.

An initial harness call used `.75` rather than `0.75` for a browser range input; Playwright rejected it before reproduction. Corrected the harness and retained the subsequent baseline. No production change was needed for that input-format error.

This is targeted completion of a shared-setting integration gap, not a full accessibility or persistence audit. Physical-device and screen-reader acceptance remain open, as do the wider encounter/environment/performance and unfamiliar-player requirements. Return to the remaining Under the Green level work and current performance qualification after recording this evidence.
