# Engagement follow-up implementation

This pass addresses the remaining engineering work and prepares the requested human tests for later. It does not assert a higher subjective grade or claim completed human playtests.

| Remaining item | Implementation |
| --- | --- |
| Choice evaluation | Local feedback form, versioned run export, choice/cancellation events, and the [later playtest protocol](engagement-playtest-guide.md). Human sessions remain deliberately pending. |
| Distinct stations | Bell retains a planned retreat; Field Log offers quiet stillness versus immediate noise; Release Review now chooses either the existing Range Cart or a northbound Release Hedge retreat. |
| Joe reaction | On reaching the actual distraction within 6m, Joe stops and turns to inspect it using existing stationary investigation art. The visible label names inspection. Fresh close sight still takes priority. |
| Final encounter | Selected retreat freezes when committed, and navigation, named-cover validation, credit, and handoff agree. Exit prompts preview the exact discounted filing hold and Joe's distance, with advice to lure or break sight when unsafe. |
| Replay decisions | Standard range lamps stay steady; Eastern Exception dims the west lane; Closing Shift slowly trades bright sides. Detection and rendering use the same power in every comfort preset. |
| Optional discoveries | Six authored corporate-horror notices at existing boards; Use collects them into a persistent local field journal. No extra required objective or score grind. Full text wraps during safe reading; danger reduces it to a saved-note reminder. |
| Landmarks | Six board-mounted pennants use distinct colors and one/two/three flag silhouettes, projected and depth-sorted with their parent props. Existing art, terrain, and collision geometry remain. |
| Audio/movement evaluation | Menu/Pause access to comfort presets, left/center/right audio references, local ratings, and a physical-device protocol. Real listening and comfort evaluation remain pending. |

## Mechanical details

- The new hedge target is `(35, 638)`, sheltered from the station by `range-exit-right`. Standing chooses Range Cart; crouching chooses Release Hedge. A remote lure shortens the cart signal to 3s or hedge signal to 3.8s; ordinary signal remains 5s. Clean break remains optional.
- A review blackout saves one charge until authoritative light exposure reaches 0.15. It then lasts 18s with the existing smooth expiry. An already active blackout refreshes; pending charges do not stack. Retries reset the charge. Existing natural darkness can defer activation.
- New evidence is capped at 120 choice events; the existing run timeline is capped separately. Feedback retains the latest 20 reports. Nothing is automatically uploaded.
- Field notes persist in `rough-cut.fieldnotes.v1`; rehearsals do not write discoveries to the permanent journal. Browser storage failures leave a session-only journal/report with a download path.
- The study dialog is available from menu, pause, and result screens. Typing and controller input cannot affect the game while it is open. Escape closes the dialog and leaves the run paused. Fullscreen includes the page so journal controls remain available.
- New run ruleset: `course-discoveries-release-lanes-20261105`. Historical records remain separate.

## Verification

Evidence lives in the ignored `output/engagement-followup/` directory. Automated fixtures verify behavior; ordinary-input routes verify reachable completions. Neither substitutes for human enjoyment or physical-device evaluation.

Current acceptance coverage includes both retreat previews and frozen destinations; real cover geometry and clean-break outcomes; lighting variants and comfort consistency; physical investigation and close-sight override; discovery interaction and retry persistence; local form save/export; keyboard isolation; comfort/audio controls; fullscreen; and final-filing duration previews. Screenshots cover 2560x1600, 1280x720, 800x600, and 844x390. The discovery text overflow found during visual review was fixed with wrapping.

Passed checks: `node --check` for game and study scripts, `git diff --check`, `verify-release.mjs` (53 images, 14.49 MB, 90 parseable fixtures), `verify-engagement.cjs`, `verify-engagement-followup.cjs`, `verify-experience.cjs`, `verify-core-loop.cjs`, and `verify-gameplay-polish.cjs`. The installed develop-web-game client passes **57/57** readiness checks with no browser-error artifact; its final screenshot was inspected. Earlier suites preceded small presentation/fullscreen changes; the final follow-up suite and installed client include those changes.

Four ordinary keyboard/pointer runs earned all three checks and victory with no browser errors:

| Night Order | Exit | Release retreat | Evidence directory |
| --- | --- | --- | --- |
| Standard Review | Drain | Range Cart | `drain/` |
| Standard Review | Shed | Release Hedge | `shed-hedge/` |
| Eastern Exception | Drain | Range Cart | `east-drain/` |
| Closing Shift | Shed | Release Hedge | `closing-shed/` |

All four use Standard pressure. The runner uses read-only route-planning knowledge and ordinary gameplay inputs, so these prove reachable completions, not novice difficulty or human enjoyment. Standard runs preceded the last narrative wrapping/fullscreen changes; Eastern and Closing runs include those mechanics and layout changes; a final copy-only pass shortened compact HUD reminders. This pass does not rerun the historical 18-case pressure matrix or certify sustained hardware performance. No public deployment was performed.
