# Chapter menu and Joey opening performance

Applied the Level 1 idle-menu approach to The Back Nine, Under the Green and The Final Cut. Their focused idle menus poll controllers at 20 Hz, repaint only when presentation state changes, and stop polling when hidden or unfocused. Active gameplay retains its existing update cadence. Back Nine's completion audio tail still updates until finished.

The shared story presentation no longer runs continuous decorative mist, lamp or depth animations. One-time image reveals remain, and story playback pauses on loss of focus or visibility. Hidden worlds do not redraw behind story panels.

The Level 1 “Here's Joey” opening caches the scaled background and grass artwork, retains the animated reveal/head/cut effects, and presents at 30 FPS. It stops updating/rendering when hidden or unfocused. Story controller polling is 20 Hz. Opening/menu presentation is excluded from gameplay performance telemetry. Entry-point cache versions were updated.

## Native browser measurements

Chromium with native D3D11, 2560 × 1600 viewport. Each sample covers two seconds. Unfocused measurements override document.hasFocus and dispatch blur; these are controlled tests rather than measurements of another browser's YouTube playback. Main-thread task duration is a CDP measurement and varies with shared-machine load.

| Screen | Focused repeated UI paints before → after | Focused task time before → after | Unfocused task time before → after |
| --- | ---: | ---: | ---: |
| Back Nine | 120 → 0 | 40.884 → 25.023 ms | 35.708 → 19.836 ms |
| Under the Green | 0 → 0 (already dirty-rendered) | 27.865 → 22.210 ms | 27.032 → 24.003 ms |
| Final Cut | 121 → 0 | 34.335 → 24.661 ms | 31.295 → 18.071 ms |

Under the Green's focused input polls fell from 121 to 37. All three chapter menus recorded zero instrumented update/input/draw/paint calls while unfocused after the change.

Joey's opening rendered 87 → 60 frames in the focused sample; main-thread task duration fell from 151.260 to 104.925 ms (about 31%). The unfocused sample rendered 94 → 0 frames and task duration fell from 100.749 to 28.511 ms. This does not measure total system CPU/GPU usage or establish that YouTube playback is fixed on every machine.

## Verification

- `tools/verify-chapter-menu-idle.cjs` passes: all three idle menus, focus restoration, start, story skip, pause and resume; Joey frame cap, unfocused rendering suspension and skip to menu. No page errors.
- Before/after JSON and screenshots: `output/chapter-menu-performance/before` and `output/chapter-menu-performance/after`. Baseline source snapshots are in the adjacent `baseline` directory.
- Inspected all three menus at 2560 × 1600, 1280 × 720 and 390 × 844, plus Joey's caption/reveal screenshot. Narrow layouts retain their existing scrolling behavior.
- Installed develop-web-game Playwright client passed for all four chapters, with native 2560 × 1600 gameplay screenshots and state inspected. Artifacts: `client-back-nine`, `client-under-green`, `client-final-cut`, `client-level-one` beneath `output/chapter-menu-performance`.
- Chapter client adapter: `tools/verify-idle-screen-client.mjs`; Level 1 uses the existing `tools/verify-presented-client.mjs`.
- Syntax checks passed for all nine changed runtime JavaScript files and both verification scripts.

These changes and checks are limited to idle menus and opening presentation. They do not resolve the separate whole-level rendering performance work documented in other chapter QA reports.
