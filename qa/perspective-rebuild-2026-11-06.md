# Rough Cut — perspective candidate and 40-item disposition

The local default is now a playable depth-tested 3D candidate. This report supersedes claims that the previous hybrid presentation settled the user's visual/movement complaints. **It does not mark all 40 experience outcomes accepted.** Engineering checks, visual inspection, performance qualification and player evaluation are separate. Human sessions remain prepared for later, as requested.

## What changed

`web/scene-3d.js` renders the actual course and calibration/bell practices, using the same live collision, interaction, enemy and progression state. It replaces the mismatched lateral projection with one perspective scale, gives props/cover/Joe volume, animates individual mechanisms, and renders ball flight, roll, recovery and bounded material effects in world space. Three.js r187 is vendored with its MIT license; no runtime CDN is required.

`web/spatial-controls.js` adds saved FOV, resolution, independent device sensitivity, vertical inversion and immediate/short-ramp movement comparison. Existing base sensitivity remains effective. Pitch, body clearance, eye height and speeds now share the scene scale. Hidden roadmap/second-wind speed multipliers are removed in this renderer. Main HUD uses readable sans-serif text and suppresses routine messages during lessons/actions. New runs use playable hints. The Standard valve moved to the water crossing, reducing backtracking. Fixed paths, secondary approaches, matching zone signs and destination pennants provide environmental guidance.

The previous renderer is selectable with `?renderer=legacy`. Its source snapshot at the start of this task is also preserved under `output/perspective/baseline/`. No deployment or commit was made.

## Evidence

- `tools/verify-spatial.cjs`: scale invariant, mouse pitch/yaw/inversion, movement/braking, optional ramp, synthetic controller and touch look, ball flight/roll/recovery, bell Use, saved settings, four viewport captures. These tests use controlled fixtures and do not simulate a novice.
- `tools/verify-experience.cjs`: existing controls, Joe facing, practice-miss recovery, distinct station choices and 63 collision-driven station/access/exit approaches across three variants.
- `tools/verify-rebuild.cjs`: isolated practice, direct keyboard/DOM/controller choices, cancellation, comfort, stable navigation and selected exits.
- `tools/play-complete-route.cjs`: Standard shed and drain victories through ordinary keyboard/mouse input. Its read-only route planner knows geometry, so these are feasibility runs, not discovery/fun evidence.
- Installed develop-web-game client: ordinary startup/onboarding/action capture. `tools/verify-release.mjs`: 53 referenced images and 90 scenario files validated; scenario parsing is not execution of 90 human or browser runs.
- High-resolution visual inspection starts at **2560×1600**, then **1280×720, 800×600 and 844×390**. Captures include near cover, cart side/rear, bell, field log, range, exit, ball and compact choices. Inspection found and corrected inverted bell geometry, an unclear cart footprint, small-screen text overlap and incorrectly sized light pools. Inspection is not user art acceptance.

## Frame pacing and recordings

`tools/profile-spatial.cjs` compares both renderers on the current game rules, with real rAF, DOM look events, strafe input, interaction and controlled scene placement. Default measurements do not record video. `--video` records a separate run. Event-to-next-rAF timing is diagnostic scheduling latency, **not physical input-to-display latency**. Full host/browser/source hashes and p99/max values are in `output/perspective/realtime/report.json`.

Final unrecorded shared-headless-host sample (1280×720 output, perspective scene 960×540):

| Scene | Legacy median / p95 ms | Perspective median / p95 ms |
| --- | --- | --- |
| Turn and strafe | 66.7 / 100.1 | 33.4 / 50.0 |
| Maintenance | 66.7 / 100.0 | 33.3 / 50.0 |
| Chase | 83.3 / 116.6 | 33.4 / 50.0 |
| Interaction | 66.7 / 116.7 | 33.4 / 50.0 |
| Pause | 50.0 / 66.7 | 50.0 / 50.1 |
| Retry scene | 50.0 / 66.7 | 33.3 / 50.0 |

The candidate is faster in this comparison, but **60 FPS remains unmet on this host**. Native-resolution antialiasing plus video recording was substantially slower (66.7–83.4 ms medians); that configuration was rejected as the default. Its report is retained as `recorded-native-report.json`, with `legacy.webm` and `perspective.webm`. Do not present those recordings as the final lower-cost configuration or compare their timings directly with an unrecorded run. A sustained named-device qualification remains open; no further content expansion is justified by these measurements alone.

## Item ledger

“Candidate” means implemented or integrated and available to evaluate. “Retained” means an existing mechanic was connected to the new presentation and checked; it is not newly authored. Visual status refers only to the inspected candidate scenes. **Player evaluation is pending for every item** and must not be inferred from a passing test. Performance is qualified only to the limited sample above; no row implies target-device certification.

| ID | Engineering disposition | Visual / experience acceptance still required |
| --- | --- | --- |
| S01 | Candidate: perspective camera, depth buffer, world meshes; front/side/rear and practice captures. | Repeated orbit/near-contact review on target hardware; user comparison. |
| S02 | Candidate: .16 m/course-unit scale, .384 m radius, 1.65/1.12 m eyes, FOV controls; equal-axis projection check. | Whether scale and speed feel convincing. |
| S03 | Candidate: shared low-poly material kit replaces mixed cutouts in gameplay. | Art direction remains unaccepted; current meshes are a stylized candidate, not final commissioned assets. |
| S04 | Candidate: authored rounded/clipped hedge crown profiles over physical cover footprints, foliage edges, volumetric carts and filled equipment footprints. | Near/medium/far silhouette review and every near contact still require player acceptance. |
| S05 | Measurement tooling, recordings and comparison delivered; lower-cost default selected from measured regression. | **Open: sustained 60 FPS and physical latency on a named target device.** |
| M01 | Candidate: raw yaw/pitch, independent device multipliers, FOV and vertical inversion; synthetic checks pass. | Physical-device precision, fast turns and comfort. |
| M02 | Both immediate and 80 ms start-ramp options available; release and reversal behavior tested. | Player comparison must choose a preferred baseline; immediate remains provisional default. |
| M03 | Retained stable sliding, shared body/cover scale; 63 route approaches checked. | Oblique contact/gap perception across the complete art set. |
| M04 | Candidate: posture plus one blended terrain cost; hidden speed bonuses removed. | Whether materials/footsteps explain slowing without text. |
| M05 | Candidate: crouched eye height, displacement-based gait, independent motion options and charged club pose. | Body presence and comfort in motion. |
| N01 | Candidate: fixed opening paths, low lamps, physical practice bell and framed check destination. | Uncoached junction decisions; opening layout remains an iteration candidate. |
| N02 | Candidate: actual station meshes/signs/pennants; Standard valve moved forward. | Useful sightlines and goal recognition without the bearing. |
| N03 | Candidate: secondary collision-planned approaches reconverge at each check; no mandatory objective change to escape terrain. | Both approaches need uncoached ordinary-input trials; path existence alone does not establish readable risk. |
| N04 | Candidate: scene signs share zone names with map; heading/access/exit preference retained. | Translating a map glance into the next turn. |
| N05 | Retained single-owner arbitration and target bias, plus a spatial target bracket; direct choices use the same action. | Whether proximity/facing selection matches player intent, including targets near the view edge. |
| G01 | Retained real bell/lure/cover rehearsal, now rendered as physical space with isolated records. | Plan → Joe reaction → recovery understanding and duration. |
| G02 | Candidate: 3D Joe/mower follows actual facing/motion; inspection/search moves the head; audio/state cues retained. | Inferring intent without relying on text. |
| G03 | Retained distinct loud bell, held quiet/instant loud log, and release retreat choice; separate mechanisms animated. | Encounter decisions must feel distinct in play. |
| G04 | Retained ball/blackout, quiet/loud and cart/hedge tradeoffs, with advertised consequences tested. | Dominated-option analysis requires real choices; no claim that tuning is settled. |
| G05 | Candidate: actual planned impact arc, physical flight/roll and recoverable balls; surface cues retained. | Deliberate useful lures and recognition of misses under pressure. |
| F01 | Candidate: action prompt, progress/cancellation, mechanism response and completion lamp; existing action state machine retained. | Perceived response speed and unambiguous interruption. |
| F02 | Candidate: independent bell/clapper, stamp, valve, release lever and exit door motion. | Review without HUD; door payoff and timing need player assessment. |
| F03 | Retained sight/sound/evidence/search rules and cause-specific capture explanations, connected to Joe's pose. | Whether captures are explainable by players. |
| F04 | Retained real inspection, loss-of-sight recovery and expiring lure/relief advice. | Whether relief is noticed without a popup. |
| F05 | Candidate: one primary interaction/lesson, conditional threat, suppressed routine overlap, bounded effects. | Busy chase/caption/touch hierarchy during physical play. |
| A01 | Candidate: water tower, clubhouse volume, maintenance cover, open range and shed threshold. | Label-free landmark recognition; full architectural art remains open. |
| A02 | Candidate: distinct terrain, contact shading and light pools using actual exposure radius/power. | Grayscale/readability review by players, especially low-contrast displays. |
| A03 | Candidate: mipmapped terrain, anisotropy, smooth display scaling, consistent world meshes and selectable render scale. | Slow-turn shimmer/clarity on target displays. |
| A04 | Candidate: bounded depth-tested impact/footstep rings, mower particles and mechanism responses. | Whether effects communicate material/action without clutter. |
| A05 | Retained directional/distance/cover-filtered audio, material cues, buses, compression, mono/captions. | **Open: headphone/speaker audition and real comfort.** Reference tones do not close it. |
| U01 | Candidate: compact sans-serif objective/resources, contextual threat/action and target bracket; compact overlap fixed. | User readability and visual priority acceptance. |
| U02 | Candidate: new 3D runs enter playable hints; optional practice ball visible in the world. | Newcomer learns movement/look/lure without coaching. |
| U03 | Retained one-action retry, practice restart and specific capture correction. | Whether a failed attempt prompts voluntary retry. |
| U04 | Synthetic yaw/pitch, choices, storage and input transitions checked. | **Open: real controller/touch ergonomics and latency.** |
| U05 | Retained captions, text scaling, remapping, hold/toggle, sound buses; added FOV, vertical inversion and device multipliers. | Comfort and menu usability on actual devices. |
| P01 | Existing phase/evidence timeline retained; Standard valve backtrack removed; redundant routine text reduced. | Travel/wait/tension balance requires observation. |
| P02 | Candidate: visible shed threshold, physical opening door, retained filing risk/cancel/commit and two exit victories. | Finale tension and satisfying payoff. |
| P03 | Retained three patrol/access/lighting variants and meaningful resource options; no extra content added merely to increase feature count. | Replay motivation remains unproven. |
| P04 | Representative captures, real-rAF benchmark, recordings and updated observer protocol delivered. | Deferred observer sessions and actual-device qualification. |
| P05 | This ledger separates engineering evidence, inspected presentation, performance limits and pending player acceptance; legacy preserved. | Close each experience outcome only after supporting evidence or user acceptance. |

## Remaining gates

The engineering candidate is available to play locally. The latest changes do **not** establish that visuals, movement, navigation or fun are now good. Art/silhouette acceptance, uncoached route recognition, choice balance, physical device/audio comfort and sustained target-device performance remain open. The prepared study collects these separately; no participants, preferences or grades have been fabricated.
