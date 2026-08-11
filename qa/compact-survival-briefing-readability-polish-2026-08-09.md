# Compact Survival Briefing Readability Polish

Date: 2026-08-09

## Finding

The Survival Briefing had correct ownership and responsive containment, but the short-screen path still scaled the complete desktop dossier to roughly half size. Its story, three cards, four keycap groups, and supporting copy became physically too small at 800x600 and 844x390. The player could technically start the round, but the information intended to make movement and objectives obvious was hardest to read on the devices that needed the strongest hierarchy.

## Resolution

- Added `tutorialBriefingViewportPresentation()` as the shared breakpoint and diagnostic contract.
- Preserved `desktop_visual_dossier` for standard and high-resolution canvases.
- Added `compact_readable_rows` for small or short canvases.
- Reduced the compact presentation to the assignment context, three large decision rows, two control lines, and one start action.
- Kept the generated key, golf ball, and valve art in the compact rows.
- Selected keyboard, gamepad, or touch wording from the active input method.
- Kept the existing narrative, objectives, key bindings, start behavior, world veil, Reduced Camera Motion behavior, and First Steps handoff unchanged.
- Added the `compact_survival_briefing_readability` readiness check and a release-verifier guard.

No new ImageGen asset was required. The visual problem was density and physical type size; the existing generated object art remains the correct authored asset family.

## Automated and visual validation

- `node --check web/game.js`: passed.
- `node --check tools/verify-release.mjs`: passed.
- `node tools/verify-release.mjs`: passed with 48 referenced runtime assets, zero unreferenced images, zero shipped source masters, 84 deterministic action scenarios, zero warnings, and zero failures.
- Official game client briefing capture: course assets settled to 100%; `first_hole` opened with `tutorialVisible: true` and `desktop_visual_dossier` at the normal canvas size.
- Official game client start route: Enter dismissed the briefing, forward movement reached 19 meters, assets remained settled, readiness passed 38/38, and the run reported 60 estimated FPS at 4.3 ms average / 9 ms p95 render work with no browser error artifact.
- Responsive keyboard captures passed at 2560x1600, 1280x720, 800x600, and 844x390.
- Touch capture passed at 844x390 with touch-specific movement, chip, crouch/listen, rear-view, use, and start wording.
- Desktop captures retained the full dossier; both compact captures selected the large-row layout.
- Enter and touch both dismissed the briefing. Keyboard movement advanced from 0 to 7 meters in the focused responsive test.
- Every tested page matched viewport width with no horizontal overflow and no console or page errors.

## Evidence

- `output/compact-survival-briefing-official-loaded-2026-08-09/`
- `output/compact-survival-briefing-official-start-2026-08-09/`
- `output/compact-survival-briefing-responsive-2026-08-09/`

## Remaining physical gates

The software contract is closed. Release acceptance still requires the standing physical-device sessions: keyboard and mouse, standard controller, touch hardware, and a sustained mid-tier hardware run.
