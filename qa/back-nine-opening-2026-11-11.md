# The Back Nine: illustrated opening and guide

## Delivered

Fresh shed-route entry and direct `back-nine.html` entry now show five manual-paced illustrations, then the new briefing, then gameplay only after explicit confirmation. Chapter order: the closed shed/cart yard, the one usable cart, two offline relays, Joe's industrial mower, headlights turning toward the player. Narrative stays separate from the artwork. The original Joe portrait and actual cart/mower model captures informed the image prompts; supernatural explanations and chase spoilers are omitted.

The built-in image generator produced five native 1672×941 images. Original PNG masters, complete generation prompts and the asset manifest live in `assets/cutscenes/back-nine-opening/`. WebP quality 90 runtime assets total 2,561,754 bytes (2.56 MB), without enlargement or pixel-filter processing. Repackage with `node tools/package-opening-art.cjs --back-nine`.

The shared Level 1 story controller now accepts chapter data, a heading and an independent preference key. It retains Next/Back/Skip, manual advancement, keyboard/touch/controller operation, slide count, saved skip, replay, subtitles, reduced motion, fullscreen and failed-image recovery. Checkpoints resume through an appropriate briefing without fetching the intro images. Replay from pause preserves the exact run and returns to pause. New rounds show the story unless the player enabled skipping.

The Back Nine guide uses Level 1's cream/brass monospace treatment and dark green panel. It explains the actual route: automatically reconnect both relay shelters, then park fully inside the garage and hold the brake; on foot, stand inside and hold Use. Optional crew-log repairs and alarm treadles are separated from required objectives. It explains 100 cart health, Joe's withdrawal window and continued escape on foot. Keyboard, gamepad and touch instructions follow the most recent input method. Driving speeds remain mph. Compact layouts scroll inside the guide; the start control stays reachable without horizontal overflow.

## Loading and sound

- No chase scene construction or drawing until a fresh intro closes. Browser reports zero rendered chase frames and zero simulation time throughout all five chapters.
- Current image plus one next image; at most two image references retained. References are released on close. Existing browser caching applies.
- Existing nine audio voices supply wind, metal ticks, cart ignition and a growing mower engine. No additional voice pool, audio sample downloads, shader, model or postprocess pass. Saved volume/category settings and subtitles apply. Browser audio starts after a user gesture; hidden/blurred intros silence it.
- The guide may display course preparation after the intro. It stays paused, with Start disabled until ready. The last intro input cannot also start the chase.
- These changes avoid extra gameplay rendering work. They do not establish an FPS improvement or resolve the game's existing software-rendering frame-pacing limits.

## Level 1 objective orientation

`web/station-facing.js` calculates a fixed orientation at model construction using the authored approach paths. Nearby route termini prefer the first authored arrival, preventing the Release Review from selecting the alternate return leg and facing backward. Lateral approaches are splayed where appropriate, but a build-time check against existing obstacle footprints preserves the natural route angle when a splay would face a hedge. The Audit Bell now faces diagonally toward arrival instead of presenting its edge; the Field Log and Release Review face their approach aprons. Key posts, drain valves and optional supply lockers adapt to their variant locations.

The entire root rotates, including papers, lamps, labels and moving parts. Scuffed approach ground follows the same orientation. Models never track the camera. Practice bell, station positions, interaction radii, collider data, Joe's navigation and objective logic are unchanged. No extra geometry, materials or per-frame orientation calculations are added.

## Verification

- `node tools/verify-back-nine-opening.cjs` and `--software`: all five scenes; zero hidden chase frames/time; two-image reference limit; final guide handoff; real driving input; mph; pause/replay preservation; saved skipping; both checkpoint resumes; saved reduced motion; no browser errors.
- `node tools/verify-back-nine-opening-controls.cjs`: controller Next/Back/Skip, held-button protection, Start/Pause, fullscreen, real touch context, scroll-to-start, touch driving controls, missing-image skip, hidden subtitles and system reduced motion. Passed.
- `node tools/verify-back-nine-transition.cjs`: drain rematch remains Level 1; shed continuation resets checkpoint, opens the story and then loads the Level 2 guide. Passed.
- `node tools/verify-opening-story.cjs`: existing Level 1 five-scene flow, engine cutoff, frozen world, responsive guide handoff, skip/replay and reduced motion still pass after shared-controller generalization.
- `node tools/verify-station-facing.cjs`: all eight station types/placements across three Night Order variants; front, side/three-quarter and interaction-distance captures; fixed rotations across viewpoints. Camera positions reject collision geometry; boundary fixtures use reachable three-quarter views.
- `node tools/verify-win-objectives.cjs output/back-nine-opening/objectives`: all six variant/exit combinations reach victory through actual E interactions, including quiet/loud Field Log, zero lure balls, locked-exit rejection and cancelled/retried filing. These are controlled-position gate tests, not six fresh input-only playthroughs.
- `node tools/verify-station-identity.cjs --software`: actual practice landing, supply reward/latch states, Audit Bell swing, reduced motion and unchanged shader/texture counts pass under software rendering.
- `node tools/verify-heavy-impact.mjs`: directional impact speed loss/shove and boundary constraints still pass.
- Standard installed gameplay client through `tools/verify-presented-client.mjs`: story navigation/state and full-page capture pass. DOM story presentation intentionally sits above the raw game canvas.
- `node tools/verify-release.mjs`: 90 existing action fixture validations, 66 referenced runtime images, no unreferenced runtime images or source PNG masters shipped. This validator does not play all 90 fixtures.

Screenshots and reports: `output/back-nine-opening/`. Desktop inspected at 2560×1600 and 1280×720; compact layouts at 844×390 and 390×844. Hardware and SwiftShader flow checks passed. No physical-controller/device or new-player study is claimed.

## Prepared human check for later

1. Finish Level 1 via the shed. Read the five chapters without the gameplay guide first. Describe where you think you are going and why you need the cart.
2. Read the guide. Identify the mandatory route and optional repair/alarm choices before starting. Confirm the distinction is clear.
3. Try the skip checkbox, replay from pause, and reload after each shelter checkpoint. Report any unexpected automatic start, sound or loss of progress.
4. Approach Level 1's Bell, Log, Review, key and valve normally. Note any face that still reads poorly before you reach it; identify the Night Order variant and approach direction.
5. Rate narrative clarity, suspense and readability separately from chase difficulty. Human playtesting remains prepared for later, as requested.

For older Back Nine browser harnesses that wait immediately for `ready`, first dismiss `[data-opening="skip"]` or seed the saved intro skip preference. Normal players should use the visible controls.
