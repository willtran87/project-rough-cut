# Comprehensive experience pass — 2026-09-13

Implemented on `codex/horizontal-free-look`, based on published main `612bd49`. This pass remains local. It includes the previously approved free-look prototype and preserves the earlier final-gate removal. No commit, push, merge, or Pages deployment was performed in this pass.

The core loop is three permanent checks, one exit access item, and filing at an unlocked exit. Cover, distractions, and optional Clean Breaks help the player survive. Optional reviews and mastery rewards never replace those completion requirements.

## Disposition of the 26 reviewed areas

“Retained and verified” below identifies existing behavior that already supplies the requested capability; it does not claim a new system was added. Subjective satisfaction and device comfort require human validation.

| # | Reviewed area | Delivered resolution |
|---|---|---|
| 1 | Walkable-space readability | Clear Path Scenery reduces foreground obstruction and suppresses decorative clutter near mandatory interactions and the immediate approach lane. Solid obstacles and useful cover remain visible. |
| 2 | HUD hierarchy | Focused HUD defaults to the next action, permanent check/access progress, balls, and Joe's current threat. Secondary scoring and repeated control instructions defer until requested or relevant. |
| 3 | Text readability | Larger, shorter world labels; high-contrast HUD panels; scalable critical gameplay text; compact settings cards. Fixed progress-label overflow, settings-value clipping, and wrapped threat/advice overlap after screenshot review. |
| 4 | Side and rear views | New directional Joe and shed artwork. Joe retains the existing animated front view; sides/rear follow his movement heading. Shed sides no longer present the front door. Other scenery remains intentionally 2.5D. |
| 5 | Lighting and depth separation | Reduced foreground competition and clearer interaction approaches preserve the existing lantern, ground-ring, collision-footprint, and beacon lighting. Atmosphere renders separately from live objects and UI. |
| 6 | Consistent visual signals | Retained shared marker, map, and route geometry; clearer short labels and explicit HUD states supplement color. Camera-relative bearings, aiming, map facing, and collision directions agree after turning. |
| 7 | Focused feedback | Short check/tactic messages explain earned outcomes; ambient music and drone levels duck during aiming, pursuit, check activation, and filing. Existing check waves, sound cues, captions, and completion seals remain coordinated with actual events. |
| 8 | Frame pacing | All quality tiers cache atmosphere at half resolution with bounded refresh. Background atlas cache dimensions now match this layer. Final turn tests pass the original frame-budget gate, which is now mandatory in the free-look verifier. Device performance remains to be tested. |
| 9 | Core-loop explanation | Focused briefing teaches three checks plus a key or valve, then escape. Contextual action text explains the immediate step instead of leading with optional scores. |
| 10 | Progressive onboarding | Three-step survival briefing and contextual movement, practice, station, concealment, and filing hints. Practice is optional; the first missed chip returns one ball without duplicating a recoverable world ball. |
| 11 | Required versus optional | Briefing explicitly distinguishes permanent checks from optional Clean Breaks/reviews. Missed bonuses never roll back a check. Focused HUD prioritizes actual completion requirements. |
| 12 | Exit readiness | Shared readiness model distinguishes no access, access held, all checks plus an available exit, active filing, and escape complete. The final clear forecourt and existing completion/cancellation behavior are preserved. |
| 13 | Landmark navigation | Existing station-specific silhouettes and named cover destinations remain the route anchors. Reduced approach clutter and directional shed art make these landmarks easier to identify; no wholesale course redesign was needed. |
| 14 | Distinct station experiences | Audit Bell asks the player to plan cover; hidden crouched Field Log shortens its signal from 5.6 to 3.4 seconds; a remote diversion at Release Review shortens 5 seconds to 3. Each still uses the same single Use action. Preview and completion share one tactic rule. |
| 15 | Interaction consistency | Retained explicit Use for reviews/pickups/checks, shared interaction ranges, and held filing at both exits. Already-held approach input is consumed; fresh movement cancels filing with feedback. Regression checks cover interruption and retry. |
| 16 | Accessibility and comfort | Nine saved options add look sensitivity, inversion, stick dead zone, focused HUD, scenery clarity, scanlines, gameplay text size, coaching, and fixed/free view. Existing remapping, subtitles, reduced motion/flash, mix and pressure controls remain available. Compact settings use larger clickable cards. |
| 17 | Movement and collision feel | Corrected physical x scaling so camera-relative strafing is no longer slower than forward movement; normalized diagonals remain. Gait, footsteps, travel distance and blocked-motion feedback also count physical meters. Existing swept collision/sliding is exercised from multiple headings and across mandatory approaches. Analog look uses a configurable dead zone and response curve. |
| 18 | Free-look balance | Distant patrol/search sight now respects Joe's facing, matching the advice to move behind him. Close awareness, active pursuit, hearing, and tracks remain effective. Rear glance returns to the selected heading; listening and captions retain camera-relative bearings. Human difficulty comparison remains open. |
| 19 | Pursuit and counterplay | Focused threat panel distinguishes patrol, sound investigation, last-position search, exposure, and pursuit, with concise advice. Facing checks make visual behavior more consistent with the player's tactical expectations. |
| 20 | Distraction confidence | Forgiving first practice miss; existing landing/sound/response cues retained. Turning immediately before shot release uses the latest aim heading. Remote diversion now has a concrete, advertised benefit at the final check. |
| 21 | Cover reliability | HUD coaching derives from actual sight blockers, rough concealment, crouch and exposure. Named-cover hold guidance remains authoritative; already-seen players still need to break sight and relocate. No arbitrary invulnerability was added. |
| 22 | Level pacing | Clean Break earns eight seconds without a new director ambush or rediscovery of old tracks; fresh sight and sound can still expose the player. Early exit preparation after the first check preserves the earlier reduction in late backtracking. |
| 23 | Rewards with clear causes | Quiet stamp, prepared diversion and Clean Break feedback identify the successful action and its benefit. Existing deliberate optional reviews grant usable balls/reserve and reduce filing; rewards are applied once. |
| 24 | Useful retries | Clear TRY AGAIN / BEAT YOUR RUN actions build on existing targeted capture coaching and recovery adjustments. Retry, pause/resume and filing cancellation remain covered. |
| 25 | Replay variation | Retained the three existing variants, route/access changes, optional risks, challenge progression and personal mastery. Next-order UI now explains the actual upcoming variant instead of generic advancement text. No extra grind currency was added. |
| 26 | Completion reliability | 63 collision-driven approaches cover three variants, all three checks, both access pickups and both exits. The separate shed suite completes 36 approaches through victory, including the former choke point. Ordinary-input probes were also run, with their failures recorded rather than treated as wins. |

## Verification

Local server: `python -m http.server 4187 --bind 127.0.0.1 --directory web`.

| Command | Result |
|---|---|
| `node tools/verify-experience.cjs` | 11 acceptance groups: equal physical movement, comfort controls/storage/pointer settings, facing, real practice input, five station tactic cases, 63 approaches, and four viewport sizes. No browser errors. |
| `node tools/verify-free-look.cjs` | Seven functional groups pass: cardinal camera-relative WASD, aim, clearance directions, glance, real pointer lock/pause, synthetic controller/touch, and both reverse-facing exits. Continuous-turn gate passes. |
| `node tools/verify-core-loop.cjs` | Six groups pass, including both exit completions, interruption, input methods, action priority, and earned Clean Break relief. |
| `node tools/verify-gameplay-polish.cjs` | Twelve regression groups pass, including ordinary-input first check and hazard traversal, review rewards, pursuit recovery, filing and retry. |
| `node tools/verify-exit-preparation.cjs` | Seven groups pass, including both access routes across variants. |
| `node tools/verify-shed-clearance.cjs` | All 36 approach/completion cases pass, plus missing-prerequisite and cancellation checks. |
| `node tools/verify-release.mjs` | 50 referenced runtime assets, 64.28 MB, no missing/unreferenced assets or source masters; 89 action fixtures parse. This is not a claim that all 89 fixtures were executed. |
| `git diff --check` | Pass. |

The skill's official Playwright client replayed `web/test-actions/release-hardening-deep-route.json` and reached the first completed check and mud hazard with 57/57 runtime readiness checks. The initial capture averaged 3.49 ms, p95 7.2 ms. The final visual capture in `output/experience/official-release` passed 57/57 with no browser-error artifact, averaged 2.88 ms and p95 4.9 ms, and confirms the threat-text spacing fix. It loaded before the final gait-distance correction; the experience, core-loop and gameplay-polish suites were rerun after that correction. This replay intentionally does not complete a full course. Its historical timed strafes were updated for the corrected physical movement speed; the functional route assertions remain intact.

An initial final-art turn sweep still reached p95 17 ms. Profiling identified oversized atmosphere textures as the main cost. After lowering only their cached dimensions, the isolated sweep measured 6.25 ms average / 10.9 ms p95. The subsequent full free-look suite measured 5.66 / 11.3 ms and passed every readiness gate. These are headless canvas render timings, not proof of sustained device FPS or absence of occasional long frames.

## Visual evidence

Actual browser captures were inspected at 2560×1600, 1280×720, 800×600, and 844×390. Relevant local artifacts are in ignored `output/experience/` and `output/free-look/`:

- `briefing-*.png`, `large-text-*.png`, `settings-mix-*.png`, `settings-comfort-*.png`, and `search-large-text-*.png`.
- `joe-front.png`, `joe-side.png`, `joe-back.png`; `shed-front.png`, `shed-east.png`, `shed-west.png`.
- Cardinal opening/station/shed views from the free-look suite.
- `official-final/shot-0.png`, `official-final/state-0.json`; `access-matrix.json` and acceptance `verification.json`.

The final threat spacing correction followed inspection of the initial official capture. Subsequent large-text search captures and `official-release/shot-0.png` verify that correction. Atlas source views are four directions, not full rotational 3D meshes or a complete new walk-cycle set.

## Art provenance

Generated with the built-in `image_gen.imagegen` tool using the existing project art as references. The original character and shed images were inspected before generation. The following records summarize the submitted prompt constraints and the selected outputs.

**Joe prompt:** Preserve the supplied Joe identity, dark sweater, brown trousers, red push mower, detailed horror pixel-art palette and scale. Create an evenly arranged 2×2 atlas of front, right, rear and left views with full body and mower, generous transparent padding, no labels, scenery or cast background. Follow-up: remove the checkerboard background to real alpha while preserving every sprite position and detail.

Selected true-RGBA output: `C:/Users/Will/.codex/generated_images/01a07fd8-9285-7de0-b49f-f0bd2cec91fd/exec-640c3da4-d84a-4fbe-9160-719c4a297f6f.png`.

Workspace asset: `web/assets/rough-cut-joe-directions-v1.png`, 1254×1254. The first RGB attempt was superseded by the alpha edit.

**Shed prompt:** Preserve the supplied weathered dark timber shed, corrugated roof, stone footing and pixel-art style. Create four distinct front, east gable, rear long-wall and west gable views. Only the front has the existing entrance. Remove grass, sacks, tools and protruding clutter so the footprint reads cleanly. Keep consistent scale, padding and an isolated transparent background without text.

Selected output: `C:/Users/Will/.codex/generated_images/01a07fd8-9285-7de0-b49f-f0bd2cec91fd/exec-bd6ec824-4866-401a-9af5-f6928b77d3fa.png`.

Workspace asset: `web/assets/rough-cut-shed-directions-v1.png`, 1536×1024. This output is RGB with a checkerboard background; two subsequent alpha requests did not correct it. Runtime silhouette clips remove the unused background/gutters, and actual in-game front and side captures were checked for exposed checkerboard. This limitation is recorded rather than describing the source as transparent.

## Remaining validation limits

- Human first-time comprehension, reward satisfaction, voluntary replay, motion comfort, and difficulty balance have not been established. Automated checks cannot certify that a game is fun or addictive.
- Ordinary-input guided probes reached one check and the key before capture near the second check; an all-sprint probe failed earlier. Neither was a full natural victory. Controlled prerequisite tests prove interaction access and completion logic, not full-course difficulty fairness.
- Controller and touch coverage is synthetic. Physical devices, low-powered hardware and extended play sessions still need validation.
- New directional art is selective. Other props remain billboards; side/rear Joe uses movement bob and existing effect motion rather than new frame-by-frame walk cycles.
- Existing saved performance records retain their historical compatibility behavior; corrected movement may affect comparison with older runs.

The implementation work is reviewable and covered by the listed checks. These remaining experiential acceptance questions should not be represented as resolved by automation.
