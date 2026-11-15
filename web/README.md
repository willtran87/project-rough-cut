# Rough Cut browser game

Current local guide, checked against source on November 15, 2026. See the [project overview](../README.md), [documentation index](../docs/README.md) and [development guide](../docs/development.md).

## Start locally

From this `web/` directory:

```powershell
python -m http.server 4187 --bind 127.0.0.1
```

From the repository root, use `python -m http.server 4187 --bind 127.0.0.1 --directory web` instead. Open [the local game](http://127.0.0.1:4187/). Serve the files over HTTP; opening the HTML directly does not provide the module/asset-loading environment the game expects. Three.js and runtime assets are included locally; there is no npm build step for play.

The animated grass-cutting/Joe reveal is unskippable and hands off to the main menu automatically. Reduced Motion still applies. This animation is separate from the illustrated chapter stories, whose next/back/skip controls and saved skip preferences remain available.

Use **Chapters** to browse earned chapters. New players can start only Night Order. Each Chapter 2 route unlocks after escaping Night Order through its corresponding exit and continuing into that route; the finale unlocks after completing either Chapter 2 route and continuing into The Final Cut. Locked cards cannot be selected, and direct URLs enforce the same qualifications. Settings return preserves the selection.

Win screens lead forward without replay actions; loss screens retain retry. **Continue story** on the main menu preserves the next step after a win. Earned chapters remain replayable from the menu, with a separate **Replay chapter** choice where continuation is available (keyboard R / controller RB). Progress is saved on this browser; older saves are imported where they contain evidence of the prerequisites and chapter entry.

## Chapters

| Chapter | Entry page | Current flow |
| --- | --- | --- |
| Night Order | `index.html` | Three mandatory field checks, then key/shed or valve/drain escape. Only the original Night Order layout is playable; historical alternate-layout records survive. |
| The Back Nine | `back-nine.html` | Cart pursuit from the shed, two relay shelters, optional service stops and a garage escape. Cart destruction leads to an on-foot escape attempt. New attempts and defeat retries start from the shed; there are no in-run resume checkpoints. |
| Under the Green | `under-green.html` | Timed water crossings and dry alternatives, Joe's hedge-trimmer pursuit, required pump bypass, optional keeper record and closing sluice. New attempts and defeat retries start at the drain entrance; there are no in-run resume checkpoints. |
| The Final Cut | `final-cut.html` | Safe overlook, committed mowing passes, permanent refuges, irrigation preparation, lure/trap and road escape, with illustrated outcome sequences. Defeat retries saved progress. |

A Night Order shed result offers The Back Nine; a drain result offers Under the Green. Both completed second-act routes offer The Final Cut. Reaching one route does not unlock the other. These chapters are locally implemented; dated plans and QA reports describe the extent and limits of their individual verification. See the [campaign flow checks](../qa/campaign-flow-2026-11-15.md).

## Default controls

Saved remaps take precedence. Current keyboard defaults are defined in [control-profiles.js](control-profiles.js); the former Q/Listen and R/rear default pair migrates to **Q/rear and R/Listen** while intentional custom bindings are retained.

| Action | Night Order / Under the Green / The Final Cut | The Back Nine |
| --- | --- | --- |
| Move | WASD or arrows, relative to view | W/Up accelerates; S/Down brakes/reverses; A/D or Left/Right steer. On foot, forward/back and steering retain the same arrangement. |
| Look | Mouse, click/drag; touch scene drag | Camera follows heading while driving and running; no independent mouse look. |
| Run / crouch | Shift / C, with supported hold/toggle preferences | Chapter-specific driving/on-foot controls shown in the guide. |
| Rear glance | Hold Q | Hold Q |
| Listen | Hold R | Not a driving action |
| Use | E | E or Space brakes/operates the contextual action |
| Chip ball | Hold/release Space in Night Order and The Final Cut; no chip action in Under the Green | Space brakes the cart |
| Map / guide | H toggles Night Order's map; H opens The Final Cut guide | Review the guide from Pause |
| Pause / fullscreen | Escape / F | Escape / F |

Night Order and The Final Cut support golf-ball distractions; use the displayed trajectory and chapter-specific aiming prompts. Night Order also offers context-sensitive choices at supported objects. The current in-game guide reflects the active input device and saved bindings.

Controllers use left-stick movement and right-stick look on foot, A for Use/confirm, R3 for rear glance and Start for pause. On-foot chapters use RT to run, LB to crouch and LT to Listen; Night Order and The Final Cut use X for chip shots. Back Nine has its own driving controls in the briefing. Touch provides movement, scene dragging and labeled action buttons. Audio starts after a user gesture.

## Settings, saves and local playtests

Settings and Controls & comfort expose shared audio, subtitles, motion, input and camera preferences, plus chapter-specific options. Shared preferences live in the browser's local storage; chapter records are stored separately. Back Nine and Under the Green retain completion credit but start new attempts from their entrances; The Final Cut restores checkpoint/preparation progress. Saves belong to the browser profile and origin: changing port, switching between `localhost` and `127.0.0.1`, or using the isolated software launcher gives a different save context. Local saves do not sync to the published site.

For Under the Green, open [under-green.html?playtest](http://127.0.0.1:4187/under-green.html?playtest). Pause or finish, open Local playtest report, add optional observations and download the JSON before leaving/reloading. The recorder is page-local, keeps the latest 12 attempts and uploads nothing. See the [session guide](../qa/under-green-human-playtest.md). Back Nine has a separate [human-playtest guide](../qa/back-nine-human-playtest.md).

`?test` enables chapter QA placement hooks; it is not ordinary play. `window.render_game_to_text()` exposes current diagnostics, and test tools use `window.advanceTime()` for deterministic stepping. Night Order additionally exposes `window.audit_rough_cut_readiness()`. These diagnostics do not substitute for human playtests.

## Rendering and verification limits

The current presentation uses real 3D geometry with pixel-art surfaces. Older Night Order comparison modes (`?renderer=legacy`, `?art=illustrated`, `?art=smooth`, `?joe=sprite`) remain development references rather than the default presentation. Full-page browser captures include the DOM interface; canvas-only images can omit it.

On Windows, run `Play Back Nine (Software).cmd` from the repository root, or `node tools/play-back-nine-software.mjs`. This requires Node.js and Chrome/Edge, serves port 4188 and stores its isolated profile in `output/back-nine-software-profile`. It supports `--port`, `--browser` and `--profile`; the server closes when its launched browser exits. [WARP qualification](../qa/back-nine-windows-software-2026-11-14.md) applies to the recorded workload and resolution, not every device or cold frame.

The [November 15 Under the Green entrance fix](../qa/under-green-software-stall-2026-11-15.md) passes its native/software entrance-stall and exact-image checks. Whole-level software performance remains a separate limitation. Test instructions, environment dependencies, and the currently failing release check are in the [development guide](../docs/development.md).

Earlier feature-by-feature notes are preserved in the [browser README archive](../docs/history/web-readme-before-2026-11-15.md). Historical counts, old controls and superseded implementation statuses there are not current requirements.
