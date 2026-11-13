# Final Cut — opening overlook composition

The all-72 implementation goal remains active. This pass improves FC01/04/05/57/66; FC04 remains **Partial**. No human comprehension or horror acceptance is claimed.

## Changes

- Raised the observation terrace from 3.4 to 4.8 metres. Lengthened the entry ramp to nine metres and the departure ramp to twelve metres. Rendering, camera ground height and solid parapets share the same layout constants.
- Moved direct entry and checkpoint return to the centre of the departure opening, closer to the front of the terrace. The initial downward view shows the actual descending path, first strip, crossing gaps, pump and road marker. Look input remains unrestricted.
- Relocated the close announcement board to the west side parapet. It no longer covers the bunker and course in the forward view. Both physical boards still use the recorded station receipt; the PA is unchanged.
- Preserved unlimited observation, the player-operated demonstration control, Joe's arrival clock, route geometry beyond the ramp and every trap/ending rule.

## Verification

- `verify-final-cut-overlook.cjs` passes on D3D11 hardware and SwiftShader: four viewport sizes (2560×1600, 1280×720, 844×390, 390×844), ordinary Gamepad API look/walking, continuous descent to the controls, pause freeze and actual save/reload. Seven screenshots per renderer; no browser errors. Hardware uses 1600×1000 internally at the largest viewport; software retains its existing rendering cap.
- Actual scene ray tests confirm open sampled lines to the road sign and pump sign. They also record blocked samples to the bunker roof and swale ground. These are explicit remaining composition limitations, not passing terrain-visibility checks.
- `verify-final-cut-arrival.mjs` passes six uninterrupted simulation routes from all three entrances, walking and sprinting; three-minute safe waiting, 30/60/120 Hz demonstration/gate checks and boarding/save continuity remain valid.
- `verify-final-cut.mjs` passes 13 rule groups, including seven complete simulation routes, depleted/fully-cut recovery, physical trap and protected victory. Current direct walking/sprint clear times are 130.16/81.78 seconds; these map-aware pilots are not first-time pacing evidence.
- `verify-final-cut-arrival-browser.cjs --out=output/final-cut/overlook/routes` passes three uninterrupted ordinary Gamepad API finales, without live-state placement: direct 136.11 seconds, garage 138.98, drain 140.02; zero captures and zero throws. All three earn every crossing, pump preparation, bell lure, physical collapse and road completion. Thirty-five screenshots include separate actor/record/scoreboard fixtures.
- `verify-final-cut-announcement-browser.cjs` now aims at the relocated physical board. Receipt variants, maximum-size captions/touch layouts at four sizes, pause/resume, reload, cancellation, fallback and replay pass. Inspected portrait receipt with complete text and caption/control separation.
- Installed web-game client completed two bursts. Latest screenshot/state inspected: playing at 6.52 seconds, moving down the ramp, zero captures, no error artifacts. The final lateral input meets the right ramp wall; this is ordinary collision, not a failure to descend.
- Inspected high-resolution before/after, final hardware/software arrival, compact landscape/portrait, side board and standard-client captures. These establish rendering/layout evidence, not sustained GPU frame rate or physical-device acceptance.

## Findings during development

The old x=-2.8 arrival lined up with the left edge of the parapet opening. A nearly straight ordinary-input walking test caught it on the wall. Centring the spawn at x=-2 fixes that obstruction; the test now walks continuously from the terrace to ground level.

Initial diagnostic pump targets were inside the roof/sign assembly. Changed the probe to the actual exposed sign face instead of counting self-occlusion as a hidden landmark. The independent swale and bunker ground/roof samples remain blocked in the report.

## Remaining work

The bank wall still hides the low swale from the initial overlook. The bunker roof is partly visible, but the refuge entrance and protective masonry need clearer authored framing. Portrait users can turn to inspect the pump and bunker; they are not all visible simultaneously. The complete dogleg/terrain explanation and the distinct two-light reveal remain unfinished. Software performance remains unqualified. Continue the entire backlog, including acting, sound, pacing, device/lifecycle coverage and unfamiliar-player fun/fear tests.

Artifacts: `output/final-cut/overlook/` and the refreshed `output/final-cut/announcement/` captures. Original pre-change scene/layout copies and screenshot are retained under the overlook directory.
