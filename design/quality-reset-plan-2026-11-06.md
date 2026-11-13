# Rough Cut: quality reset after the perspective build was rejected

Status: implementation candidate delivered; see [item-by-item evidence and outstanding acceptance](../qa/quality-reset-2026-11-06.md). This document preserves the original acceptance targets. It is the improvement plan following the user's renewed report that visuals, navigation, movement and gameplay still feel bad. It supersedes the previous 40-item plan as the next-work sequence; earlier implementation reports remain historical evidence. Human tests remain prepared for later. The user's negative experience is evidence that the quality objective is unresolved, not merely waiting for formal approval.

## Assessment

Reviewed the latest saved gameplay capture (`output/perspective/final-client/shot-0.png`), current rendering/input/navigation source and the last recorded benchmark. No fresh live playtest, audio audition or benchmark was conducted for this planning pass.

Observed or source-confirmed:

- The opening presents three different priorities: “TRY A PRACTICE CHIP”, “AUDIT BELL”, and “DRAG OR CLICK: LOOK AROUND”. Its guidance is individually functional but collectively ambiguous.
- Foreground hedge/cart mass dominates the view. Repeated cone trees, faceted foliage, broad flat colors and generic station signs still read as prototype art. Paths and props have weak separation; the distant scene offers little depth or composition.
- The scene renders at 960×540 by default and is enlarged into the 1280×720 game canvas. The last unrecorded active-gameplay samples had approximately 33.3–33.4 ms median frames and 50 ms p95 on the shared headless host. This is not a named-device qualification, but it does not support a smooth 60 FPS claim.
- The renderer copies an offscreen WebGL canvas into a 2D canvas each frame. Copy/compositing is a performance hypothesis to measure, not an established sole bottleneck.
- Crouch immediately selects camera height 1.12 m instead of 1.65 m. Mouse/controller/touch sensitivity multiplies another base sensitivity, producing two places to tune the same response.
- Ball aiming uses yaw plus charge-dependent range; camera pitch does not determine the target. Looking at a location and aiming a chip are therefore different operations.
- Station selection scores proximity, facing and incumbent bias, but its shared selector does not require a clear view or evaluate vertical reticle position. A spatial bracket alone does not fix selection intent.
- Most scenery and routes still inherit the old course layout. Paths are assembled from the navigation planner. Technical route feasibility does not establish good human wayfinding or encounter composition.

The next delivery should be a finished **two-to-three-minute stealth encounter**: see Joe working, choose a route, place a useful ball lure, perform a risky action, break sight and reach a recognizable safe space. Keep the golf-course identity, tactile club/ball interaction and pursuing groundskeeper. Judge every added element by how it supports this sequence.

## Priorities and acceptance

P0 blocks expanding the slice. P1 completes the experience after the P0 foundation works. P2 extends a demonstrated successful core. Targets below are proposed checks, not achieved results. Numbers are initial design targets to validate rather than promises of universal preference.

### A. Frame pacing and movement

| ID | Priority | Concrete work | Done when |
| --- | --- | --- | --- |
| QR01 | P0 | Profile simulation, GPU rendering, WebGL-to-2D copy, HUD and presentation separately during identical movement. | Measurements identify the expensive stages; a named device/browser/configuration and full frame distribution are recorded. |
| QR02 | P0 | Compare current compositing with direct visible WebGL presentation and an independent HUD. Adopt the measured better path; preserve screenshot/state testability. | The same scene, resolution, input and effects are compared without video overhead. Improvement is measured, not inferred from architecture. |
| QR03 | P0 | Establish a stable frame budget, spatially cull geometry, pool transient work and remove sustained per-frame allocation where profiling supports it. | Proposed 60 Hz target: 10-minute named-device run near 16.7 ms, p95 at most 20 ms, p99 at most 33.3 ms; recurring >50 ms stalls explained or fixed. Report misses openly. |
| QR04 | P0 | Give each device one effective sensitivity control; specify pointer-lock, drag, focus-loss and resume behavior. Keep raw mouse response and tune controller response separately. | Small corrections and 180° turns are reproducible; no surprise multiplication, stuck input or camera jump on reacquiring focus. |
| QR05 | P0 | Tune walking, strafing, sprinting and reversal against actual doorways and cover. Compare short acceleration with immediate movement, then ship one deliberate default. | Stops and reversals remain prompt; one repeated traversal feels controllable without requiring settings changes. Compare at equal frame pacing. |
| QR06 | P0 | Smooth stance transitions without smoothing aim; separate collision stance from camera interpolation and recheck stand-up clearance/contact sliding. | Crouch no longer jumps the viewpoint; repeated crouch/stand at corners neither clips nor moves the player unexpectedly. Reduced-motion mode remains usable. |

### B. Art direction, composition and visibility

| ID | Priority | Concrete work | Done when |
| --- | --- | --- | --- |
| QR07 | P0 | Produce one finished in-engine art reference for the opening: golf-course materials, lighting, prop scale, Joe and HUD together. | Near, mid and far views read as a deliberate stylized night scene and receive actual visual review before propagation. |
| QR08 | P0 | Replace the repeated primitive kit with distinct modeled cart, mower, bell, maintenance cabinet, hedge modules and vegetation silhouettes. | Objects are recognizable without labels from front/side/rear; leaf gems and identical cone trees no longer define the whole scene. |
| QR09 | P0 | Redesign collisions around the finished prop bodies, using compound/simple hulls where appropriate. Remove the added cart skirt used to fill an inherited ellipse. | Cart clearance, wheels, body and supports predict contact. Gameplay geometry drives a believable object rather than requiring an arbitrary solid plinth. |
| QR10 | P0 | Compose views with a quiet foreground, usable middle-distance route and one strong destination. Reposition dominant opening props. | The starting view has a clear walkable opening and destination; the player is not visually boxed between a hedge and oversized cart. |
| QR11 | P0 | Create a deliberate light/value hierarchy: cool ambient separation, localized warm useful lights, grounded contact shadows and readable dark cover. | Ground, obstacles, exits and Joe remain distinguishable in grayscale and on dim displays. Danger pools match gameplay exposure. |
| QR12 | P1 | Improve ground material transitions, distant scenery, sky and texture filtering; balance sharpness against performance. | A slow walk/turn shows no distracting shimmer or muddy stretched texture; props sit in the landscape instead of floating over painted discs. |

### C. Navigation and spatial design

| ID | Priority | Concrete work | Done when |
| --- | --- | --- | --- |
| QR13 | P0 | Rebuild the opening as four connected spaces: observation point, choice junction, objective pocket and recovery space. | A newcomer can understand the sequence without a persistent route arrow or repeated text correction. |
| QR14 | P0 | Author the physical paths, entrances and sightlines first; derive navigation routes from that layout. | Path bends correspond to visible features and useful decisions, not a drawing of solver waypoints. |
| QR15 | P0 | Give every encounter one exposed shortcut and one covered approach, visible together from a useful vantage point. | The player can predict each route's cost before moving; both reconverge clearly and are traversed by ordinary input. |
| QR16 | P0 | Place the objective and next entrance where terrain, framing, lighting or a recognizable structure introduces them. | A player can point at the next destination in the world. Floating labels are optional support. |
| QR17 | P1 | Make the map a readable representation of actual spaces, entrances, orientation and access state; unify names with signs and objectives. | A map glance reliably produces the next turn; locked and available exits cannot be confused. |
| QR18 | P1 | Remove nuisance backtracking/dead ends and improve recovery from a wrong turn. Use local contextual hints only after demonstrated hesitation. | Every detour has an understandable purpose; help does not repeatedly alternate between competing destinations. |

### D. Core stealth and enemy behavior

| ID | Priority | Concrete work | Done when |
| --- | --- | --- | --- |
| QR19 | P0 | Build and tune the single complete observe → lure → act → escape → recover encounter before extending the course. | A player can describe their plan and what changed because of it, and has an opportunity to retry a different plan. |
| QR20 | P0 | Animate Joe's intent through body orientation, mower motion, head/torso attention, a visible pause and a committed response to evidence. | Patrol, noticing, investigation, inspection and chase are distinguishable without state labels. Cosmetic scanning agrees with perception. |
| QR21 | P0 | Make acquisition fair: investigate suspicion first where appropriate, commit to the observed position and constrain reacquisition to real new evidence. | Recorded captures have an identifiable cause; hiding does not produce unexplained tracking through cover. Legitimate close/new sight still matters. |
| QR22 | P1 | Redesign three encounters around different verbs/problems: lure to open a crossing; manipulate a mechanism while managing attention; choose and execute an exit commitment. | The second and third encounters change tactics rather than repeat Use followed by retreat with a different label. |
| QR23 | P1 | Create decision-rich pursuit routes: readable turns, occlusion and a second relocation opportunity, followed by a real recovery interval. | A chase can be won by a legible decision, and relief can be felt in Joe's motion/audio before a message appears. |
| QR24 | P1 | Tune resource and route tradeoffs using actual time/exposure/noise/inventory costs; remove options that never have a useful situation. | Quiet/loud, ball/blackout and exit choices each have demonstrated advantageous cases. Difficulty changes opportunities fairly. |

### E. Aiming and interaction feel

| ID | Priority | Concrete work | Done when |
| --- | --- | --- | --- |
| QR25 | P0 | Choose a coherent ball-aim model. Prototype reticle-to-world targeting with bounded chip trajectories and explicit power/loft behavior; remove accidental pitch/target disconnect. | Looking and aiming have a predictable relationship. Controller and touch can select the same reachable locations. |
| QR26 | P0 | Share the actual trajectory/collision calculation between preview, flight, impact and roll; distinguish impact from final resting position. | Representative flat, banked, wet and obstructed shots match the indicated behavior within a stated tolerance. |
| QR27 | P0 | Make Use targeting require range and a clear interaction point within a view/reticle cone; keep a small stable commitment margin. | Looking between adjacent objects selects intentionally; objects behind cover or behind the camera do not steal Use. |
| QR28 | P1 | Show believable club/hand anticipation, release, follow-through and recovery; support clean cancellation without involuntary shots. | The action is readable without charge text; latency stays low and hands do not hide the landing area. |
| QR29 | P1 | Give each mechanism persistent physical state: bell/clapper, ink/page, valve/flow, latch/door. Tie visuals and sound to the actual action timeline. | Accepted, underway, completed and cancelled states remain distinguishable with HUD hidden. |
| QR30 | P1 | Make pickup and failure feedback immediate and specific; preserve deliberate holds and prevent repeat activation during the same press. | A missed Use explains range/obstruction/busy state briefly; a successful pickup visibly disappears and updates inventory exactly once. |

### F. HUD, feedback, effects and audio

| ID | Priority | Concrete work | Done when |
| --- | --- | --- | --- |
| QR31 | P0 | Give objective, lesson, interaction and danger messages one explicit priority system. Correct the opening's conflicting chip/bell/look instructions. | One instruction owns the next action; lower-priority guidance yields and resumes only while still relevant. |
| QR32 | P0 | Replace large permanent instruction panels with brief local prompts, subtle resources and contextual danger. Size the map control for its secondary role. | The view stays focused on the environment; essential text remains readable at all supported sizes. |
| QR33 | P1 | Build an action-response specification for chip, impact, Use, detection, escape, failure and victory. Budget effects and message lifetimes together. | Each event has an immediate cue and a clear consequence; optional rewards cannot obscure immediate danger. |
| QR34 | P1 | Make material response physically specific: sand puff, small wet splash, grass clipping, metal strike and a restrained successful interaction cue. | Effects identify cause/material in motion, stay grounded and never cover the threat or route. |
| QR35 | P0 | Audit real gameplay sound: camera-relative direction, distance, cover occlusion, mixer headroom and priority ducking. Remove repetitive announcements. | Mower direction, attention and loss of pursuit are useful on actual headphones/speakers; mono/captions retain necessary information. |
| QR36 | P1 | Make comfort/accessibility independent and discoverable in normal settings; supply readable text, non-color cues, remapping and hold/toggle choices. | Players can configure the game without entering a playtest panel or accidentally changing tactical rules. |

### G. Onboarding, pacing and replay

| ID | Priority | Concrete work | Done when |
| --- | --- | --- | --- |
| QR37 | P0 | Teach one action at a time in the first minute: move, observe Joe, aim a lure, see the reaction and pass cover. | The player demonstrates each action; completion follows behavior, not acknowledgement of a tutorial card. |
| QR38 | P1 | Make the first failure recoverable and informative, with a visible counterplay and immediate retry into the same intended challenge. | Retry restores control within a proposed two seconds on the target device and does not replay learned lessons. |
| QR39 | P1 | Edit the course for meaningful rhythm. Measure empty travel, forced waiting, threat duration, repeated messages and useful decisions. | Long low-decision segments are shortened or given purpose; quiet intervals build anticipation rather than pad time. |
| QR40 | P1 | Build a finale with a visible exit, known requirement, escape route and world-level payoff; avoid an opaque final hold. | The player knows why commitment succeeds or fails and sees a satisfying release into safety. |
| QR41 | P2 | Add authored replay variations only after the slice works: patrol schedules, cover/access changes, light patterns and constrained tool choices. | A second run offers a different plan that is visible and learnable, not unexplained punishment. |
| QR42 | P2 | Reward mastery through expressive play and useful discoveries. Remove currency, checklist or collectible pressure that interrupts the central tension. | Players can name what they want to try next and choose another run voluntarily. |

### H. Maintainability and honest qualification

| ID | Priority | Concrete work | Done when |
| --- | --- | --- | --- |
| QR43 | P0 | Extract the new slice's movement/input, interaction selection, encounter state and presentation interfaces from the large legacy game module incrementally. | A tuning change has one owner and can be tested without editing unrelated presentation branches; no speculative wholesale rewrite. |
| QR44 | P0 | Define single authoritative data for world scale, collision, interaction points, lighting exposure and action timing. | Rendering and rules consume the same values; visual patches do not compensate for conflicting contracts. |
| QR45 | P0 | Add representative regression cases for the newly identified failures: conflicting instructions, pitch/aim, hidden targets, stance snapping and difficult contacts. | Tests fail for the original failure and pass after the fix; successful full-route scripts remain smoke tests rather than quality scores. |
| QR46 | P1 | Capture equal-condition before/after motion and frame timing, with visual inspection at 2560×1600, 1280×720, 800×600 and 844×390. | Same route/device/resolution/inputs are compared; recorded and unrecorded measurements are labeled separately. |
| QR47 | P1 | Prepare distinct uncoached novice, returning-player, controller/touch and audio sessions for later, respecting the user's deferral. | Protocol records wrong turns, corrections, capture explanations, discomfort, enjoyable moments and voluntary retry. No participant results are invented. |
| QR48 | P0 | Track implementation, regression verification, visual review, frame pacing and player acceptance independently. Reopen outcomes the user rejects. | “Resolved” has evidence for the actual complaint. The next report does not call a prototype migration completion of art, feel or fun. |

## Execution order

1. **Measure and simplify:** QR01–06, QR31, QR43–45, QR48. Fix controllability, input ownership and contradictory instructions. Decide presentation architecture using measured data.
2. **Finish one space:** QR07–16, QR25–27, QR32. Deliver the same short traversal with a finished visual reference, useful paths and precise aiming/Use. Inspect in motion before multiplying props across the course.
3. **Prove one encounter:** QR19–21, QR23, QR28–30, QR33–38. Deliver the complete lure/objective/escape/recovery loop with direct causal feedback.
4. **Extend deliberately:** QR17–18, QR22, QR24, QR39–40 after the slice meets technical gates. Keep full-course migration reversible while player sessions are deferred.
5. **Qualify and then vary:** QR46–47 supply evidence throughout; QR41–42 wait for evidence that the core experience is desirable.

Do not respond to the next failed feel review by adding another menu of sensitivity/acceleration alternatives, increasing particles, enlarging labels, or switching engines again without diagnosis. Use the existing comparisons to choose a good default. Acceptance of art and enjoyment cannot be automated or guaranteed; engineering can prepare the candidate and eliminate identifiable defects while the requested human sessions remain deferred.
