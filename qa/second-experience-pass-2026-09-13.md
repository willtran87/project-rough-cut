# Second experience review — 2026-09-13

Local branch: `codex/horizontal-free-look`. This follow-up preserves the earlier free-look and shed-clearance work. The published Pages build has not been replaced by this pass.

## Review disposition

“Retained” means an existing capability was inspected or exercised rather than replaced. Automated acceptance establishes behavior and completion; it does not establish subjective enjoyment or comfort on physical devices.

| # | Area | Resolution |
|---|---|---|
| 1 | Small-screen composition | Two shallow HUD cards reserve the center for play. The map opens only when requested or listening; keyboard, controller and pointer share its toggle. |
| 2 | Secondary text | Shorter progress/access labels, fitted high-contrast text, consistent settings cards, and larger focused event captions. Four viewport sizes inspected. |
| 3 | Duplicate guidance | One next action and one route line; redundant rear navigation and persistent map defer in focused mode. A recovery instruction takes priority over a distant objective. |
| 4 | Ground contrast | Clear Scenery retains reduced clutter/foreground, strengthens hazard outlines, and preserves physical sockets, cover footprints, lanterns and terrain differences. |
| 5 | Joe animation | Three directional rows with four walking poses each, driven by physical travel distance. Stationary poses stop; existing front/search animation remains. Direction selection uses Joe-to-viewer bearing. Ground padding is excluded from rendered cells. |
| 6 | Large props | Added front, side and rear service-cart views with open cab transparency. Existing hedge/stone cover remains 2.5D and uses projected footprint/cover-height sizing; this is not a conversion of every prop into a 3D mesh. |
| 7 | Shed background | True RGBA alpha replaces the runtime silhouette-clipping workaround. Roof, walls and doorway retain their authored edges; all four views share a ground anchor. |
| 8 | Focused feedback | Ambient/state banner moved below the HUD after an actual screenshot exposed overlap. Existing event-specific audio and priority captions remain; saved progress precedes optional bonus feedback. |
| 9 | Practical introduction | Briefing retains movement/look/cover lessons; focused practice prompt now explicitly says hold, aim, release using the active input method. Practice remains optional and its first miss refunds the ball. |
| 10 | Compact counterplay | Joe's card always includes a concrete action for patrol, investigation, remembered-location search or chase. |
| 11 | Exit requirements | HUD shows check count plus held key/valve and an exit-ready state. All three normal-input victories earned their own access item. |
| 12 | Cover versus memory | Focused status distinguishes being covered from Joe still knowing the last spot; chase advice distinguishes current sight from lost sight. |
| 13 | Station tactics | Nearby prompts explain planning cover, crouching unseen for the quiet stamp, and luring Joe away before Release Review. Shared tactic rules still determine preview and earned signal duration. |
| 14 | Saved progress | Failed Clean Break text leads with CHECK SAVED; optional cover/quiet bonus advice follows. No mandatory check rolls back. |
| 15 | Navigation confidence | Explicit map toggle works independently of priority-event HUD expansion. Existing geometry distinguishes a safe route from direct bearing; collision/footing recovery remains immediate. |
| 16 | Settings | Audio, Controls, Readability, Atmosphere and Challenge categories; category-only reset; paused mouse-look preview; all options remain reachable at small sizes. |
| 17 | Full ordinary runs | Standard Review, Eastern Exception and Closing Shift all complete at Standard pressure through ordinary movement, look, chip and Use inputs. No current-run position, checks or pickups are injected. |
| 18 | Detection clarity | Retained facing-aware distant sight and omnidirectional close/hearing awareness. Compact guidance names the current counterplay; real route tests include patrol, investigation, search and pursuit. |
| 19 | Encounter pacing | Retained station-specific signals, optional quiet/remote tactics and eight-second Clean Break relief. Three complete runs exercise the resulting explore/signal/cover/escape sequence. |
| 20 | Distractions | Retained the shared impact/roll preview, surface-specific response, bank/rest markers and actual investigate/search handoff. Successful ordinary runs use real charged chips; no new random landing behavior was introduced. |
| 21 | Movement comfort | Retained sensitivity, inversion, dead zone, reduced motion and fixed-view option. Cardinal movement, pointer lock, pause, synthetic simultaneous touch and synthetic controller disconnect pass. Physical-device comfort still needs human acceptance. |
| 22 | Encounter rehearsal | Defeat offers REHEARSE from the last safe checkpoint, preserving earned checks/access for practice. Career is cloned and writes suppressed; exit/retry restores the original career. Results are unranked. |
| 23 | Reward value | Retained one-time review balls/reserve, reduced filing time, quieter prepared checks, and Clean Break relief. Feedback explains the cause and keeps completion progress visible. |
| 24 | Variants and records | Variant briefings retain concrete access/patrol differences. Echo, result and portfolio comparisons require matching current rules and pressure, with course/route matching where applicable. Older/different configurations are archived; mid-run pressure changes are unranked. |

## Acceptance evidence

| Check | Result |
|---|---|
| `verify-next-experience.cjs` | Five groups pass: map inputs, all settings categories/default isolation/paused preview, rehearsal lifecycle, compatible records, moving/stopped animation. No browser errors. |
| `verify-experience.cjs` | Eleven groups pass, including 63 collision-driven approaches across every required station, pickup and exit in three variants. Rerun after final ground-anchor adjustment. |
| `verify-core-loop.cjs` | Six groups pass, including permanent check progress, both exits, held-input filing, cancellation and synthetic touch/controller. |
| `verify-gameplay-polish.cjs` | Twelve groups pass, including ordinary first-check/hazard play, deliberate review rewards, pressure recovery, filing and retry. |
| `verify-exit-preparation.cjs` | Seven groups pass, including both access routes in every variant. |
| `verify-shed-clearance.cjs` | All 36 approaches complete through victory; missing prerequisites and filing cancellation remain covered. |
| `verify-free-look.cjs` | Seven groups pass; all 57 readiness checks pass. Isolated continuous-turn render average 4.65 ms, p95 8.7 ms. These are headless render timings, not device FPS. |
| `verify-release.mjs` | 51 referenced runtime images / 65.54 MB; zero missing/unreferenced images or source masters in the web payload. All 90 action fixtures parse; not all 90 were executed. |

`tools/play-complete-route.cjs` selects a course through saved menu configuration, then earns every current-run prerequisite using only ordinary inputs. Final snapshots and screenshots:

| Variant | Result | Evidence |
|---|---|---|
| Standard Review | 3 checks, key, shed victory | `output/next-pass/natural-standard-2/route.json` |
| Eastern Exception | 3 checks, valve, drain victory | `output/next-pass/natural-east/route.json` |
| Closing Shift | 3 checks, key, shed victory | `output/next-pass/natural-closing/route.json` |

The first probe failed before the key. Its controller crouched on open ground when Joe was nearby and placed distractions too late. Earlier distractions and crouching at hard cover completed the courses without changing AI parameters. This validates a viable strategy, not first-time-player success rates or balance at every pressure setting.

The required skill Playwright client executed `next-pass-onboarding.json` beyond the briefing into live play. `output/next-pass/official-final/` passes 57/57 readiness checks; its actual screenshot confirms the practice instruction and corrected event-banner placement. `official-grounded/` captures the subsequent ground-anchor correction. Full natural runs and controlled regressions are separate from this short official replay.

## Visual and asset review

Inspected actual game/settings screenshots at 2560×1600, 1280×720, 800×600 and 844×390. Evidence lives in ignored `output/experience/`, `output/free-look/` and `output/next-pass/acceptance/`. The new atlas alpha and cell alignment were inspected directly, followed by in-game front/side/rear and shed views. Original images are preserved under `art-source/`; processing is reproducible using `tools/prepare-directional-art.py` with Pillow. Local processing was explicitly authorized by the user.

Remaining acceptance is human: first-session comprehension, fun, voluntary replay, and physical mouse/controller/touch comfort; low-powered device frame pacing also needs measurement. No automatic test can certify those subjective/device outcomes.
