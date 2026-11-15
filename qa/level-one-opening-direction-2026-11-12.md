# Level 1 opening destination and directional captions

Status: verified bounded improvements; full experience goal and O1/N1/P4/P8 acceptance remain open.

## Changes

The opening HUD previously replaced the required Audit Bell objective with optional practice, while the introductory instruction still directed players toward the Audit Bell. The main objective now retains the required destination. The contextual practice prompt and actual optional lesson remain available.

A physical first-path sign at course (-22,40), height 1.55 world meters, names Audit Bell/check 1 and points up the existing lantern path. Its narrow upright sits outside the center walking lane; no collision or navigation changes. One unused cell in the existing 960x672 atlas provides the face, using the existing two geometry batches. On first review the sign was absent because the entire batch followed the optional clear-navigation preference. Draw ranges now select just this course sign by default; enabling clear navigation shows all 15 signs. Existing optional labels retain their preference. The sign becomes filed with the first check. Default rendering now has two small additional draws where this previously hidden batch had none; no frame-time improvement is claimed.

Captions now snapshot a sound's world position and recompute its direction relative to the player's current view, including rear glance and movement. A moving unseen actor cannot drag an old sound caption along with it. A newly heard cue with the same key updates its snapshot; a source-less replacement clears the bearing. Rendering changes only presentation direction, not age, lifetime, sound playback, detection or navigation.

## Verification

- `tools/verify-opening-direction.cjs`: fresh UI start and real W approach, required objective with optional practice available, default sign draw range/atlas/batch/depth checks, four viewport captures, real pointer turn with DOM bearing, extra renders do not age/replay, source snapshot remains after Joe moves, keyed refresh/source-less clearing, real rear glance and pause, first-check sign state. Final report passes with no page errors in `output/opening-direction/report.json`.
- Initial pointer test sent events without a simulation input step and correctly observed unchanged yaw. Fixed the test to process each real pointer burst, then separately checked repeated render stability. Historical failure JSON is superseded by the final passing report.
- `verify-opening-walk.cjs output/opening-direction/natural-route`: real cover/board/first-bell route passes with all movement/look/interact/cover evidence, zero final detection and no page errors. This ran after sign geometry placement, before its default visibility correction; collision geometry was unchanged by that correction.
- `verify-playable-lessons.cjs`: all four lesson/device-persistence groups pass after objective priority correction.
- `verify-objective-cues.cjs`: hardware pass; final `--software` pass after default sign draw-range correction. Completion, access states, real first-bell interaction, read-only rendering, pause, comfort, resource stability and three-size captures retained.
- `verify-environment-guidance.cjs`: final preference/toggle/reload and navigation checks pass. Historical sign-count assertions in clue, environment, exit and station suites now reflect 15 total / 1 default physical sign, while detailed-navigation mode exposes all 15. Clue/exit/station suites were not independently rerun for this metadata-only update.
- `verify-encounter-refinement.cjs`: final real field interactions, release, evasion, urgent HUD, Joe poses and both shed/drain victories pass.
- Installed standard client via `verify-presented-client.mjs --level-one`: two iterations, latest full-page/state inspected in `output/opening-direction/standard-client/`; first_hole, ready course, travel26, zero failed assets/error artifacts.
- JavaScript syntax, scoped whitespace checks and release verification pass:70 referenced images,34.16MB,90 scenario definitions,no warnings/failures.

Inspected 2560x1600 arrival/approach and turned caption plus 1280x720,844x390,390x844. The sign is legible on the direct approach and stays clear of the center route and phone. The small caption/instruction panels remain separate; portrait retains the existing letterboxed stage and heavy world coverage, so mobile ergonomics are still open. Moving beyond the sign naturally takes it out of view. No human first-time route comprehension, subjective horror/listening or sustained-performance acceptance claimed.

## Remaining work

Opening composition is improved but not fully accepted. Audit broader zone identities and dramatic arc next, alongside direct footstep/remaining signal perception, search-source memory and all remaining full-scope items. Preserve existing checks/access and both escape routes. Do not reduce the full experience goal to these clarity fixes.
