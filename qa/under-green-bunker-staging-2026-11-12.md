# Under the Green — bunker separation and locating Joe

The user prioritized Joe's pursuit and tension. This pass rechecked the current course, tested two spatial changes, rejected them, and corrected misleading pursuit guidance. It does not qualify the whole chapter's tension or complete the 44-item build.

## Current route evidence

Seven complete-route audits use the existing ordinary-input, map-aware pilot. Baseline dry walking takes 75.97 seconds, includes one pump-encounter evasion, and ends with a 6.71 m lead. The bunker district occupies 13.37 seconds with no forward or hypothetical rear sighting of Joe. He is audible for 11.23 seconds. Actual positions show why: while the player traverses the west loop, Joe physically returns down the central corridor and heads west through the service passage after a witnessed route choice. The two routes are separated by opaque space. His later appearance at the pump is not a teleport.

The audit's checkpoint-one case deliberately lacks durable witnessed-route memory; it is not representative of a normal saved retry. Existing tests of witnessed retries remain the relevant evidence for that behavior.

## Rejected layout experiments

| Candidate | Dry walking result | Decision |
| --- | --- | --- |
| Wider pump/service corner, a 14 × 6 m apron centered at (-10,43) | Pump forward visibility increases only from 1.83 to 1.97 seconds; bunker visibility remains zero | Reject: a larger room does not establish Joe's return to the service passage. |
| Same apron, lever moved from (-24,40) to (-16,44) | Route drops to 66.48 seconds, with no attack/evasion and a 19.54 m final lead; wet-route pilot is captured at 64.08 seconds | Reject: weakens the established dry-route encounter and changes downstream arrival timing without a convincing visibility gain. The wet-route failure is a pilot outcome, not proof of unavoidable capture. |

Both candidates were removed. The final `web/under-green-layout.js` is byte-identical to the saved pre-experiment source. Candidate layouts and all three seven-route reports are retained under `output/under-green/bunker-staging/`. No candidate geometry, mechanism relocation, AI speed change or water retiming ships.

## Delivered guidance correction

The existing stereo-based caption identified a left/right source but always appended the rear-view instruction. That can direct a player away from a lateral approach. A clearly lateral audible source now says **LOOK TOWARD THE SOUND**; ambiguous central sound retains the correctly bound rear-glance option. It still reports only the side present in the existing stereo mix. It does not infer front/back from an unseen position, expose hidden search state, rotate the camera, change sound gain or alter attack warnings. Visible Joe continues to use visual-state descriptions.

Ownership is chapter-local presentation. Shared look controls, preferences, movement and other chapters' prompts are unchanged.

## Verification

- Directional-caption rules pass: left/right and real rear-view reversal, central ambiguity, inaudibility, finite pan threshold, hidden-state indistinguishability and retained range warnings.
- Threat-observation regression passes: real visibility, aspect/pitch/walls, bound central rear hint, unobstructed attack warnings and source privacy.
- `verify-under-green-locate-sound.cjs` passes eight cases using actual mouse pointer movement, emulated controller right stick and CDP touch dragging. Turning toward each indicated side reveals Joe in a controlled clear room without moving the player. All cases remain playing, with no page errors.
- Tested 2560×1600, 1280×720, 844×390 and 390×844 at maximum caption size with muted audio. Screenshots at all four sizes were inspected; the caption stays within the viewport and clear of touch buttons. The high-resolution before/after view shows Joe becoming visible after voluntary input.
- The installed web-game client completes its input burst; latest screenshot/state inspected. Released movement stops, the run is playing, and normal vertical look remains intact.

Browser evidence: `output/under-green/bunker-staging/locate-sound/browser.json`. This is control/presentation evidence, not unfamiliar-player comprehension, perceived fear or physical-device qualification. No fresh sustained renderer-budget claim is made.

## Next pursuit work

Preserve the earned bunker separation while making the service route understandable before the pump encounter. The next prototype must establish a recognizable, physically grounded cue along Joe's actual return path, then validate what a player can see/hear from both bunker branches. A wider exit alone has been disproven for this purpose. Do not retune the attack to compensate for a presentation problem or force every sprinting player into an encounter. Evaluate the later range decisions together with this beat; changed arrival times can remove or create pressure downstream.
