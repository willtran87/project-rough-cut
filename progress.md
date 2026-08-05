Original prompt: continue to refine and polish the game experience, make sure the game is engaging and addictive, fun and beautiful

## Current pass

- Added bounded world-space footfall responses to all four traversable surface families: fairway compression and dew displacement, outward-bending rough blades, soaked-turf ripples and cold highlights, and granular bunker scuffs.
- Alternating steps inherit the shared course projection, fade naturally behind the camera, cap at 18 instances, and are thinned with decorative effects quality. Reduced Camera Motion preserves a static fading imprint without expansion.
- Generated ornamental verge plants now bend from their planted base when the player or Joe's moving mower passes nearby, with the mower applying the stronger local disturbance; Reduced Camera Motion keeps the atlas static.

- Added Second Wind after a chase is broken within 18 meters of Joe.
- Close Cuts grant 2.6 seconds; Razor Cuts grant 3.4 seconds.
- Second Wind increases non-crouched, non-focus movement pace by 14%, strengthens stride feedback, and exposes a short tail timer after the larger Risk Premium award clears.
- Reduced Camera Motion preserves the pace reward but suppresses bob, surge, and speed lines.
- Added a chase-break HUD priority sequence: Risk Premium renders first, Delivery waits without aging, ambient Joe state/bark yields, and threat captions collapse to one spatial card during focused rewards.
- Movement chevrons and labels yield during Risk and Delivery awards so score text remains unobstructed.
- Made the onboarding HUD movement-aware: the full field briefing now receives a 5.5-second reading window and accelerates into the compact field view after 18 meters of travel.
- Separated onboarding, manual, rematch, and Listening Focus expansion states so H/Y recalls and focus information never collapse just because the player already crossed the onboarding distance.
- Reworked Joe's turf investigation into a paced Trail Chain: he discovers at most one print per cooldown, physically approaches its world position, and lets stronger consecutive evidence extend the search.
- Added first-print and ×3/×5 trail milestones with explicit fairway/cut-turf counterplay, truthful threat captions, and trail-specific HUD priority that suppresses duplicate Joe bark/search cards during the evidence beat.
- Fixed reused threat-caption keys so updated text and category replace stale content instead of only resetting the old caption timer.
- Closed the Trail Chain recovery loop: breaking a ×3-or-deeper chain outside active pursuit now triggers Evidence Denied, cools attention, records the best broken chain, and feeds the Delivery combo.
- Added a two-event Evidence Delivery-family cap, shallow-chain/chase/filing exclusions, a 3.2-second Trail Cold status window, a world-space broken-trail ripple, and a focused recovery presentation.
- Made turf deduction bidirectional: Joe's mower cuts now retain bounded forensic value for 28 seconds and 120 meters, with fresh/warm/fading states and historical travel headings.
- Added brighter fresh-cut clipping detail in the world plus a Listening Focus bearing/age marker and mini-map heading highlight; releasing focus removes the interpretive overlay.
- Added Cut Trace commitment: continuously inspect an unlogged cut for 0.55 seconds to memorize its historical heading for six seconds after Listening Focus is released.
- Added partial-scan progress, a bounded 12-mark log, once-per-cut lockout, fading world and mini-map memory markers, input-aware release guidance, and Reduced Motion-safe presentation.
- Turned Cut Trace into an actionable Counter-Route loop: move 12 meters at least 62% against Joe's historical heading before the six-second memory expires to earn +95 through a capped three-event Intel Delivery family.
- Counter-Routes reduce non-sand movement noise to 54% for 3.2 seconds, lower Joe's residual alert slightly, expose a live Quiet Lane timer, and use dedicated world, mini-map, audio, banner, and message feedback. Active pursuit and Final Filing are ineligible.
- Consolidated active pursuit into one information owner: the contact-break card now combines Joe's direction, visual/audible state, immediate counterplay, break progress, and live Risk preview while background threat-caption cards yield.
- Deferred the one-time turf tutorial during pursuit and made concealment instructions yield during Risk Premium and Delivery awards, preserving the chase message and eliminating recovery-card overlap.
- Added Blindside Transfers as an optional quiet-phase mastery loop: leave hard cover or crouched rough while Joe is moving away, travel 14 meters, and enter different shelter within 5.5 seconds to earn +115 through a capped three-event maneuver Delivery family.
- Added a shelter-aware `BLINDSIDE READY // MOVE` attention cue, an active countdown/distance card, restrained route diamonds, open/success world effects, two-note feedback, first-use instruction, timeout guidance, and Reduced Motion-safe presentation.
- Reworked Joe's persistent mower wake from bright repeated yellow-green slashes into layered course scars: a crushed near-black turf bed, fresher bruised interior, interrupted mower grooves, irregular wet edge clippings, rare rusty debris, and a restrained cool rim that decays with the cut's forensic freshness.
- Removed the midpoint performance ramp: automatic effect recovery can now move from low to balanced but never silently promotes the live course into the uncached high-cost tier after a clean opening.
- Reduced the persistent map's offscreen surface from 1280×720 to its actual 234×340 panel, preserving identical world coordinates through a translated drawing context while cutting the map buffer's pixel area by roughly 91%.
- Replaced per-frame reconstruction of every detailed Joe cut with nine cached pixel-art wake stamps (fresh/warm/fading across three variations), retaining the layered scar treatment while reducing each visible mower mark to one transformed image draw.
- Added a 1.5ms presentation tolerance to the 60Hz scheduler plus actual presented-frame telemetry; sustained frame intervals above 23.5ms now push effects to the low tier, and low quality cannot recover until both render and presentation timing are healthy.
- Rebuilt the ground-fog treatment into persistent, depth-separated banks with zone-specific palettes and density: cool blue-green mist around water and the Night Range, unhealthy warm haze across the Dead Green and Release Corridor, and restrained green-gray drift elsewhere.
- Joe's off-screen threat pressure now subtly thickens the ground fog without concealing gameplay silhouettes; Reduced Camera Motion keeps the atmosphere but freezes the drift.
- Corrected the fog-wisp coordinate transform so localized banks render at their intended screen positions, then retained adaptive three/four/five-layer density so the effect scales down safely under presentation pressure.
- Expanded the course backdrop into ten explicit depth planes, adding a dedicated image-generated estate perimeter, three additional independently drifting cloud placements, and left/right near-canopy framing.
- The estate panorama adds distant pine clusters, Tudor villas, maintenance sheds, fencing, berms, and a water tower without duplicating the independent moon layer; its chroma-key source was converted to a project-local alpha PNG.
- Strengthened forward parallax with depth-specific scale and vertical progression, and verified lateral separation from 0.02× at the moon through 0.105× at the estate, 0.34× at the near canopy, and 0.58× at the course surface.
- Corrected the same coordinate-origin issue in the two horizon-fog bands so their localized wisps now occupy their intended background plane.
- Reworked player locomotion around a smoothed panic-momentum envelope: ordinary running targets 0.48 intensity, sprinting 0.76, and active threat can drive the response to 1.0.
- Panic momentum now controls stride cadence, asymmetric footfall impact, alternating shoulder roll, camera surge, tunnel pressure, forward streaks, near-edge grass rush, footstep weight, and exertion heartbeat; Second Wind and Joe pressure intensify the same system.
- Normal movement is now labeled `RUNNING`, and the effect ramps up and settles instead of switching abruptly between calm walking and a disconnected sprint treatment.
- Reduced Camera Motion retains pace, cadence, weighted footsteps, and heartbeat while forcing bob, stride impact, shoulder roll, surge zoom, tunnel pressure, and all motion streaks to zero.

## Validation notes

- Exact movement regressions reached 48m on fairway with five live response instances after ten steps, retained the balanced effects tier, averaged 2.86-3.32ms of sampled render work across the before/after wet-ripple correction runs, and produced no browser errors.
- Targeted material validation exercised fairway, bent rough, soaked rough, bunker sand, and Reduced Camera Motion. Every scenario reported the correct surface response, retained at most three live instances in the sampled burst, and produced no browser errors; visual review corrected wet ripples from a heading-rotated vertical stroke to a low ground-plane arc.
- Full-route regression reached the Dead Green and Night Range, retained all eight zones, three Sprint Reviews, authored collision, and responsive 2560x1600, 1280x720, and 800x600 layouts without browser errors or response accumulation.

- Generated and integrated `rough-cut-verge-atlas-v1.png`, a transparent six-cell high-resolution pixel-art vegetation atlas containing moonlit fescue, cattails and reeds, fern and hosta, pale wildflowers, sculpted juniper, and withered rough.
- Added 28 non-blocking, zone-aware verge placements to the shared world projection and depth sort. Each cluster uses a grounded contact shadow, perspective-correct scale, bounded dew glints, and base-anchored micro-sway; Reduced Camera Motion freezes the sway, and the low effects tier culls only decorative instances.
- The opening movement regression visually confirmed readable foreground and middle-distance planting without hiding obstacles, the route ribbon, interaction cues, or map. The sampled tee scene averaged 2.67ms of render work and produced no browser errors.

- Local user-test server: `http://127.0.0.1:4173/web/`.
- Temporary test servers and browser sessions must be cleaned up after validation; leave the user-test server running only while the user is actively testing.
- Forced full-chain validation covered chase break, Razor Risk Premium, Second Wind activation, 27m boosted movement versus 24m normal movement, timer expiration, and Reduced Camera Motion. Browser errors: none.
- Boundary validation confirmed a normal break at 25m grants Risk Premium without Second Wind or misleading Second Wind copy.
- Standard Playwright movement regression remained in `first_hole`, reached 48m, rendered at a 1.67ms measured average in the sampled tee scene, and produced no browser errors.
- HUD-priority validation confirmed `risk_premium → delivery_award` sequencing, one-caption focus, suppressed bark/state duplication, and a clean Second Wind tail. The standard movement regression remained in `first_hole` at 48m with a 1.93ms sampled render average and no browser errors.

- Onboarding HUD validation confirmed the initial expanded state at 0m, automatic compact state by 26m, a full-duration manual H recall beyond the movement threshold, and an independent Listening Focus expansion after the timer expired. Browser errors: none.
- The standard movement regression remained in `first_hole` at 48m with the HUD compact, a 1.72ms sampled render average, and no browser errors.
- Deterministic Trail Chain validation confirmed one initial discovery, no second discovery during the 0.82-second cooldown, sequential chain depths 1→2→3, physical approach within roughly 8m of the active print at the sampled frame, eventual discovery of six authored prints, return to patrol after chain expiration, and no browser errors.
- Visual review confirmed clean first-print and ×3 presentations with one cause-specific directional caption, one counterplay instruction, and no duplicate noise alert or Joe bark.
- The exact standard movement client remained in `first_hole` at 48m with a compact HUD, no accidental trail state, a 1.85ms sampled render average, and no browser errors.
- Natural six-print validation confirmed the full discovery chain expires into one Evidence Denied event, records a best broken chain of six, and returns Joe to patrol.
- Eligibility validation confirmed a ×3 search break awards +125, a ×2 break awards nothing, an active-chase ×5 awards nothing, the second eligible break respects the live Delivery multiplier, and a third eligible break receives relief feedback without exceeding the two-event evidence score cap. Browser errors: none.
- Visual review confirmed the Evidence Denied award, Trail Cold attention status, broken-trail world ripple, one directional caption, and counterplay message remain legible together without reward-overlay collisions.
- The exact standard movement client remained in `first_hole` at 48m, created no false evidence reward, rendered at a 2.11ms sampled average, and produced no browser errors.
- Joe-cut validation confirmed a 4-second cut appears as fresh at 52m, a 12-second cut becomes warm, a 29-second cut is no longer disclosed, releasing Listening Focus hides the marker/map highlight, and Reduced Motion preserves the full clue. Browser errors: none.
- Visual review confirmed the fresh/warm label, directional arrow, brighter world clippings, and focus-only map ring remain readable without obscuring Joe, objectives, or the route ribbon.
- The exact standard movement client remained in `first_hole` at 48m with no out-of-range cut disclosure, a 1.94ms sampled render average, and no browser errors.
- Cut Trace validation confirmed a 250ms partial scan remains unlocked, the full 0.55-second commitment logs exactly once, the memory remains visible for six seconds after release, expires cleanly, rejects duplicate locks, and preserves the same navigation data under Reduced Motion. Browser errors: none.
- Visual review confirmed the partial-scan arc, logged state, post-Focus world heading, mini-map memory ring, and release instruction remain legible in both standard and Reduced Motion scenes.
- The exact standard movement client remained in `first_hole` at 48m with no false Cut Trace state, a 2.69ms sampled render average across 181 frames, and no browser errors.
- Counter-Route validation confirmed the aligned 12m move awards exactly once, adds +95 as Intel, lowers sampled movement noise from 0.25 to 0.15 during Quiet Lane, restores normal noise after expiry, rejects wrong-way travel, and rejects a geometrically valid route during pursuit. Browser errors: none.
- Standard and Reduced Motion visual review confirmed the opposite-direction marker, live distance requirement, mini-map progress, gold lane-break effect, Delivery award, Quiet Lane HUD timer, and compact result message remain readable without collisions.
- The exact standard movement client remained in `first_hole` at 48m with no false forensic state, a 1.71ms sampled render average across 186 frames, and no browser errors.
- Organic pursuit validation confirmed real sight/sound acquisition at roughly 43m, 4.9 seconds of chase, authored east-pine line-of-sight cover, a natural chase-to-search transition after 1.25 seconds without contact, +166 Risk Premium, +110 Contact Broken Delivery, and a reactive-score fall from the 96 BPM pursuit ostinato to 56 BPM search. Browser errors: none.
- Visual review confirmed the active chase now shows one actionable contact card with no stacked directional captions, the one-time turf tutorial no longer overwrites the escape instruction, and the recovery award no longer collides with the concealment label.
- Deterministic reward validation covered a +361 Close Cut with 2.6 seconds of Second Wind, a +400 Razor Cut with 3.4 seconds, 27m boosted movement versus 24m normal movement, timer expiry, a standard 25m break with no boost, and Reduced Camera Motion preserving +14% pace while suppressing bob, surge, and speed lines. Browser errors: none.
- The exact standard movement client remained in `first_hole` at 48m, rendered at a 1.83ms sampled average across 185 frames, and produced no browser errors.
- Blindside Transfer validation confirmed the sheltered readiness cue becomes true only while Joe is moving away; a 22.8m cover crossing completes once, awards +115 through the maneuver family, and starts a seven-second cooldown. Returning to the origin shelter remains active without scoring; facing Joe never opens the window; pursuit cancels immediately; timeout awards nothing and explains recovery; the fourth eligible completion respects the three-event family cap. Browser errors: none.
- Standard and Reduced Motion visual review confirmed the attention-panel readiness cue, active 5.5-second card, distance-to-cover state, completion ripple, Delivery handoff, and static reduced-motion presentation remain legible without caption or reward collisions.
- The exact standard movement client remained in `first_hole` at 48m with no false Blindside state, rendered at a 1.68ms sampled average across 183 frames, and produced no browser errors.
- Mower-wake validation covered patrol and Listening Focus clues, dense organic pursuit, contact break, Joe's search state, fresh/warm/expired aging, and Reduced Motion. The wake remains route-readable at near and middle perspective scales without the previous neon slash silhouette; browser errors: none.
- The exact standard movement client remained in `first_hole` at 48m, rendered at a 2.19ms sampled average across 186 frames on the final run, and produced no browser errors after the wake redraw.
- Midcourse optimization validation preserved the course map pixel-for-pixel after the compact-buffer change, kept the opening regression in `first_hole` at 48m with a 1.78ms sampled render average, and produced no browser errors.
- Sustained eight-second real-time validation confirmed the presentation-aware scaler reaches the protective low tier under the deliberately slow headless renderer and never rebounds into the expensive high tier; browser errors: none.
- Full-route probes covered tee, Audit Row, Water Hazard, Clubhouse Crossing, Service Maze, Dead Green, Night Range, and Release Corridor. The cached mower-wake draw measured about 0.035ms at the clubhouse transition versus roughly 0.08ms before stamping, while organic pursuit and fresh/warm/expired/Reduced Motion cut-clue regressions remained correct with no browser errors.
- Fog-specific visual validation covered the Water Hazard and Dead Green in standard motion plus a Reduced Motion Dead Green pass. The mist remained behind cover, signage, Joe, and interaction cues; Reduced Motion reported static placement; browser errors: none.
- Full-route profiling measured the strengthened fog pass at roughly 0.05-0.08ms across the sampled course zones, retaining the protective three-layer low tier and producing no browser errors.
- The exact standard movement client remained in `first_hole` at 48m with visible tee fog, a 1.65ms sampled render average, and no browser errors.
- Background-depth validation covered the tee at x=-64/0/+64, the Dead Green after 500m of forward travel, and a Reduced Motion Dead Green pass. All ten layers retained ordered offsets, the generated estate remained behind gameplay silhouettes, and browser errors were empty.
- Full-route probes across all eight course zones measured the cached background pass at roughly 2.76-4.88ms in the profiling harness, with no new midcourse spike and no browser errors.
- The exact standard movement client remained in `first_hole` at 48m after the final estate-height adjustment, with no browser errors.
- Panic-run validation exercised sustained normal running, sprinting, a threatened sprint that organically escalated into pursuit, and Reduced Camera Motion. Sampled intensities were 0.48, 0.76, 0.99, and 0.76 respectively; normal running exposed eight forward streaks, sprinting sixteen, threat seventeen, and Reduced Motion zero.
- The same validation confirmed exertion heartbeat for normal and sprint movement, threat-driven danger audio, a zero-motion Reduced Motion presentation, unchanged traversal distances, and no browser errors.
- Targeted instrumentation measured the complete forward-motion overlay at 0.0-0.2ms in the four deterministic scenarios; the heavier Water Hazard frame cost remains dominated by its existing projected landmark art rather than the new panic lines.
- The exact standard movement client remained in `first_hole` at 48m after the final locomotion pass, with a 2.49ms sampled render average and no browser errors.
- Expanded Joe's subtitle-only dialogue from 1,806 to 2,918 total variants: 2,354 capture outcomes across 16 authored themes, 240 patrol/investigate/search/chase barks, and 324 context reactions. New product-discovery, risk, governance, release, telemetry, and course-operations writing deepens his Product Owner voice without treating him as an adjuster.
- Connected dedicated Joe reactions to six player-driven events: securing a Change Request, clearing a Sprint Review, recovering a golf ball, logging a Cut Trace, completing a Counter-Route, and completing a Blindside Transfer. Existing 18-capture and 12-bark rolling repeat windows remain intact.
- Static validation confirmed all 2,304 generated capture IDs are unique, all state pools contain 48 library lines, all ten established context pools contain 24 lines, and all six new event pools contain 14 lines. The exact movement client remained in `first_hole` at 48m, reported the complete 2,918-line library through game state, rendered at a 2.62ms sampled average, and produced no browser errors.
- Event-presentation validation confirmed award-linked barks queue for 4.8 seconds, survive the 2.15-second Delivery card, then surface as a 14-line context pool; twelve consecutive Change Request reactions remained unique. Immediate Cut Trace barks retained the standard 2.65-second window. The final exact movement client reported all 2,918 variants at a 2.90ms sampled render average with no browser errors, and the temporary browser process was closed after capture.
- Established the playable premise, "One Last Action Item": the player is Joe's associate product analyst, sent across the insurer's executive golf course with a signed Night Order at 5:47 PM on release night. The south gate locks, the task is already marked done, and Joe classifies the player as the final unplanned dependency in his turf-risk pilot's live acceptance test.
- Added the story to the Survival Briefing in a compact incident strip, connected the two far-side exits to the locked-gate premise, reframed optional Change Requests as evidence of known pilot safety failures, reinforced the crossing motive in the initial field status/message, and exposed the complete narrative contract through `render_game_to_text`.
- Story-specific browser validation stopped on the briefing and visually confirmed the premise, controls, and three instruction cards remain readable together. Final exact movement regressions dismissed the briefing, traveled 48m, retained the new locked-gate objective and complete narrative state, measured 2.54-2.72ms sampled render averages, and produced no browser errors. Temporary browser sessions and the one-off action payload were cleaned up; the intentional user-test server remains available.
- Removed the zone-specific raster stalls by bounding every extracted image-gen sprite cell to a 384-pixel cache dimension before it becomes a recurring Canvas2D texture. Dedicated hedge, stone, cart, obstacle, clutter, verge, and Dead Green art retain their pixel-art silhouette while no longer uploading full 500-1500px transparent crops for small projected objects.
- Routed all five sand-trap variants through the bounded cell cache instead of repeatedly cropping the full 2-megapixel bunker atlas. This removed the remaining Water Hazard spike without changing bunker placement, collision, wet-sand detail, or gameplay behavior.
- Replaced six simultaneous whole-kit cache primers with one shared idle queue that warms at most two cells per browser idle slice. The protective low tier now also culls decorative clutter to one-third and verge/Dead Green dressing to one-quarter while leaving collision obstacles and gameplay markers intact.
- Before/after full-route profiling reduced average render work from 23.61ms to 5.60ms at the tee, 19.93ms to 4.51ms at the Water Hazard, 30.95ms to 5.20ms in the Service Maze, 22.72ms to 4.54ms at the Night Range, and 39.92ms to 5.39ms in the Release Corridor. The former 86.1ms route maximum was not reproduced.
- Eight-second real-time validation now begins at 15.03ms average and settles to 7.33-9.73ms in the deliberately slow headless renderer, versus the prior 29.63-33.12ms startup window. The final exact movement client remained in `first_hole` at 48m, reported a 1.48ms sampled render average, preserved the visual composition, and produced no browser errors; the intentional user-test server remains available.
- Rebuilt Joe's mower trail as connected, travel-authored segments instead of oversized overlapping blobs. Each mark now follows Joe's actual movement midpoint and heading, uses a controlled 4.4m lane width and 6.4-8.2m segment length, and rejects discontinuous jumps so teleports cannot paint long streaks.
- Replaced the old irregular three-groove wake with a bounded 192x48 cached pixel-art stamp: a gently tapered cut bed, two restrained wheel grooves, a subtle fresh edge, and fewer contained grass clippings. The collision/readability radius remains unchanged, so this is a visual cleanup rather than a balance change.
- Deterministic curved-trail, fresh/warm/expired clue, Reduced Motion, and organic pursuit validations all passed without browser errors. Visual review confirmed smooth perspective taper and clean turns under the normal HUD and panic effects; the cached trail pass measured about 0.0025ms per sampled draw.
- Fixed objective accessibility at the release end of the course. The maintenance shed is now centered behind the authored final gate instead of sitting behind its solid right collider; its doorway colliders were widened and the shed/drain interaction radii increased to 16m/17m so both exits can be filed from a clear, visually credible apron.
- Objective guidance now plans to a reachable point inside the target's interaction radius rather than blindly routing to the prop center. Candidate aprons are collision-tested, route-tested with full player clearance, exposed in `render_game_to_text`, and removed once the player is in reach so reflectors do not continue through the prop.
- Moved Eastern Exception's final Sprint Review away from the overturned range cart. A 2m-grid audit confirmed all 20 keys, valves, Change Requests, review gates, and exits have reachable approaches and no objective center overlaps a blocker; the shed's reachable approach cells increased from 73 to 159.
- End-to-end browser validation followed the final gate, entered each interaction zone without collision, displayed the correct Enter prompt, completed both shed and drain filing, and reached victory. The final standard movement regression remained in `first_hole` at 48m with a 1.49ms sampled render average and no browser errors.
- Added a course-scale tension director so the expanded level no longer depends solely on Joe's literal travel time. Quiet movement, course progress, and excessive separation now build a bounded pressure floor that feeds the reactive score, distant mower mix, subtle heartbeat, panic locomotion, and truthful Joe-status panel.
- Added fair two-stage service-gate intercepts: after the eight-second opening grace and a sustained safe stretch, a 2.8-second directional warning announces a collision-checked shortcut before Joe can re-enter roughly 54-82m ahead in investigate mode. Intercepts only occur while Joe is distant, patrolling, and off-screen; they are limited to four and cannot repeat within the same zone.
- Preserved player agency around the director. Natural detection, active search/pursuit, escape filing, or a golf-ball distraction cancels a pending shortcut; advancing beyond the warned intercept cancels it and grants a 3.5-second pressure drop; breaking a chase suspends new director beats for 5.5 seconds. Joe's trail and particle origins reset on a shortcut so no teleport streak or debris burst is produced.
- Deterministic pacing validation measured the warning at 0.52 pressure, the warned arrival at 91m in investigate mode and 0.66 pressure, an outrun cancellation at 0.29 pressure, a distraction cancellation, and a 5.42-second remaining post-chase relief window. The reactive score exposed `course_pressure` and `route_override` layers as expected; browser errors were empty.
- A full organic route run reached the Night Range with Joe in active pursuit at 21m instead of leaving the back half empty. The final exact opening regression retained its calm grace period at 0.19 pressure, stayed in `first_hole` at 48m, and produced no browser errors.
- Added a dedicated horror director that turns course depth, tension pressure, Joe proximity, pursuit state, and existing dread/blackout beats into paced environmental scares. The opening retains an 11-second grace period; later beats arrive on a bounded 7.5-16.5-second cadence and ease off during the post-contact relief window.
- Added three non-verbal horror events: a fleeting peripheral groundskeeper-and-mower silhouette with restrained chromatic breakup, rolling ground-fog surges, and short power failures with electrical stings and scan interference. Service-gate warnings now summon the peripheral figure, while Joe's warned arrival rolls fog through the route.
- Preserved gameplay fairness: peripheral manifestations have no collision, fog remains behind entities and interactables, short outages reduce floodlight exposure rather than increasing detection, reduced-motion mode uses a stable apparition and static fog, and all HUD/objective layers remain screen-fixed and fully rendered.
- Deterministic browser validation exercised all three events plus the Reduced Motion presentation and confirmed the automatic scheduler fires organically. The Dead Green surge reached 1.65 fog density, the Night Range outage dropped floodlight power to 0.12, route guidance stayed active in every case, and browser errors remained empty. The final exact opening regression stayed calm at 0.13 horror intensity, rendered at a 1.56ms sampled average, and left no temporary browser process behind.
- Added a first-time, optional tee-side field test that turns the golf-ball briefing into a safe playable lesson. The amber starter-bell target has an explicit landing ring, world marker, mini-map marker, input-aware prompt, and mint aim-lock confirmation; walking beyond 80m or starting a quick rematch skips it without penalty.
- Landing inside the ring now rings a restrained non-verbal cue, commits Joe to a longer investigation, awards a Field Test Delivery beat, and queues one of 14 new Product Owner reactions after the award card clears. Reclaiming the marked training ball closes the resource loop, restores the ball, and extends the Delivery Chain.
- The completed lesson persists in the career save so returning players are not retaught. Misses remain useful distractions while leaving the optional target available, and Reduced Camera Motion preserves every target, aim, and feedback cue without the bell sway or pulsing map marker.
- Deterministic validation covered aim lock, direct hit, Joe's delayed subtitle reaction, persistence, Reduced Motion, and optional skip; all states matched the authored contract and browser errors were empty. Exact recovery validation restored all four balls and produced a two-event Delivery chain with the Field Test and Training Ball Recovery beats.
- Rebuilt the defeat feedback loop around a cause-specific Incident Review. Capture now records the most recent trustworthy sight, sound, trail, proximity, or Final Filing contact and resolves eleven readable root causes spanning floodlights, open-lane sprinting, upright rough, held sightlines, bunker noise, sprint noise, rough rustle, generic movement noise, trail chains, blind corners, and unsafe exit commitments.
- Each review pairs one physical evidence line with one counter-plan, changes the selected Retry card to that plan, and carries it into the reopened run through the banner, rematch target, and initial message. The existing one-action quick retry remains intact and still skips the briefing.
- Consecutive captures from the same cause now persist as a bounded career streak and surface as a restrained Repeat Issue label only on defeat. Successful escape clears the streak, preventing stale coaching from following a recovered player.
- Deterministic browser validation covered an organic sprint capture, unsafe Final Filing, all eleven classifiers, repeated-cause persistence across reload, counter-plan retry, victory reset, and a Reduced Motion trail review. Visual review removed duplicate adjacent advice and confirmed the capture art, Joe portrait/dialogue, evidence, counter-plan, and three result actions remain legible; browser errors were empty.
- The exact standard movement regression remained in `first_hole` at 48m with the new capture state dormant, the tee field test intact, a 1.93ms sampled render average, and no browser errors.
- Generated and integrated two dedicated high-resolution pixel-art victory tableaux using the built-in image-generation path: a warm, rain-dark maintenance-shed refuge and a cold drainage-culvert interior behind a heavy grate. Both `1672x941` opaque originals are stored as versioned runtime assets, and the exact production prompts and art brief are recorded in `design/escape-tableaux-v1.md`.
- Replaced the reused course background on victory with route-aware imagery, restrained camera drift, route-colored refuge glow, a loading-safe fallback, and a translucent after-action ledger that preserves environmental detail around and through the scorecard. A half-second tableau-only beat now lets the escape location register before the scorecard reveals.
- Reduced Camera Motion holds the generated scene and scorecard transition static while preserving route color, result information, and rewards. `render_game_to_text` exposes the selected image, load state, treatment, motion policy, and fallback.
- Deterministic browser validation covered shed and drain tableau reveals, both complete scorecards, right-arrow result selection, and a Reduced Motion drain result. All generated art reported loaded, result routing remained correct, sampled victory rendering stayed around 0.9-1.3ms, and browser errors were empty.
- Turned the optional Change Request into a one-use Emergency Appeal survival decision. While carrying the document, a close 10–26m pursuit exposes an input-aware Interact window; filing it permanently forfeits the +650 evidence bonus and persistent order filing, grounds the consumed clipboard in the field and map, and compels Joe to review the scope for 3.6 seconds before transitioning into search.
- The appeal grants no Risk Premium, does not increment chase-break scoring, cannot be filed during Final Filing, golf-ball commitment, another distraction, or outside pursuit, and cannot be repeated. Joe still captures at point blank, so standing on the dropped document fails while immediate movement produces real separation.
- Added a dedicated appeal-ready extension to the contact-break card, a reduced-motion-aware review timer, transient paperwork/stamp effects, non-verbal filing audio, Joe state handling, HUD inventory status, result-scorecard forfeiture note, and an explicit text-state contract with eligibility and blocked reasons.
- Deterministic validation covered no-document, patrol, too-close, and too-far rejection; actual Enter activation; one-use enforcement; 58m running recovery; review-to-search expiry; point-blank capture while standing still; Reduced Camera Motion; and victory accounting with zero Change Request score and no persistent filing. Browser errors were empty, the exact opening regression remained at 48m with a 1.77ms sampled render average, and visual review resolved contradictory detection copy and overlapping threat captions.
- Added one authored mid-course Status Request to each Night Order, turning Joe's Product Owner role into a live risk decision rather than another collectible. After the opening grace period, a safe crossing can open a 5.4-second request; pressing Interact starts a 1.15-second stationary response, movement cancels the draft while the deadline continues, and the player may retry before time expires.
- Acknowledging earns a capped Status Delivery beat but gives Joe a short investigation at a coarse 14m-grid location. Ignoring triggers Stakeholder Escalation, a longer investigation at a more precise 8m-grid sector with extra tension and a fog surge. If ordinary pursuit starts first, it supersedes the request without penalty so the new decision never competes with immediate survival.
- Added input-aware keyboard, gamepad, and touch prompts; a dedicated countdown/response card; restrained non-verbal request, urgency, acknowledgment, and escalation cues; grounded map and world signals; reduced-motion-safe effects; scorecard outcomes; a complete text-state contract; and 14 new Joe Status Request reactions. Joe's subtitle library now contains 2,946 variants.
- Deterministic validation covered all three Night Order definitions, trigger and activity blockers, actual Enter response, movement cancellation and retry, one-use acknowledgment, timed escalation, pursuit supersession, all three input prompts, Reduced Camera Motion, and both victory scorecards. Browser errors were empty; the exact standard movement client remained in `first_hole` at 48m with a 1.40ms sampled render average.
- Added Crosswind Cover as a bounded weather-and-movement decision during quiet traversal. One gust may occur per visited zone after a 1.35-second grass-and-fog warning; the 4.4-second active front reduces non-sand movement noise to 42% while leaving sightlines, concealment rules, and physical turf evidence intact. Bunker sand and active pursuit never receive the masking benefit.
- Crossing 30 meters inside one gust without building meaningful attention completes a Wind Run and adds a +90 base Weather-family Delivery beat. Scoring caps at three Wind Runs, gusts cannot repeat in the same zone, and a 15–21-second cooldown keeps the weather from becoming continuous or predictable.
- Integrated the wind through near-canopy lean, generated verge response, displaced ground fog, perspective ribbons, airborne grass flecks, foreground blades, two-stage non-verbal ambience, compact/expanded HUD status, mini-map distance tracking, a world-space completion effect, result accounting, and an explicit text-state contract. Reduced Camera Motion preserves a stable directional lean and every gameplay cue without drifting flecks.
- Deterministic validation rejected chase, detection, same-zone, Status Request, Final Filing, Delivery-award, and service-intercept triggers. Sampled fairway noise fell from 0.19 to 0.08 under wind; bunker sprinting stayed loud at 0.57; pursuit stayed unmasked at 0.62; rough wind travel still created tracks; the fourth Wind Run produced no fourth Weather score event; and the next zone reopened eligibility. Browser errors were empty. The exact opening regression remained calm in `first_hole` at 48m with a 1.60ms sampled render average.
- Audited Blindside Transfer opportunity density across the complete authored course. All 48 solid-cover nodes have at least one 14–78m companion route, every one of the eight zones has multiple source covers, and 20m corridor samples never fell below five nearby cover nodes, so the balance and reward window remain unchanged.
- Added shelter-time Blindside lane previews derived from Joe's current position and the real obstacle geometry. The selector rejects same-shelter, colliding, out-of-bounds, non-blocking, and unreachable-distance landing points, retains up to three spatially distinct options, and refreshes only every 0.72 seconds during the rare eligible window.
- Grounded the selected lanes into the first-person view and course map. Visible destinations receive mint landing rings and a primary distance label; lateral or rearward destinations receive a concise left/right/behind field cue, while matching map diamonds and lines preserve overview without making the map mandatory. The attention panel, active timer card, map footer, and text-state contract all report the same lane state.
- Organic geometry validation completed real +115 transfers from the Tee, Clubhouse Crossing, and Night Range, including Reduced Camera Motion. Every destination was collision-clear and actually blocked Joe's sightline; facing-Joe rejection, same-shelter failure, pursuit cancellation, timeout, cooldown, and the three-event cap remained intact. Lane selection averaged 0.18–0.41ms across 120-call samples, the exact movement client remained in `first_hole` with a 1.60ms last-frame render, browser errors were empty, and all temporary test servers were removed.
- Extended Blindside previews beyond solid-object hopping with authored deep-rough landing lanes. Rough targets use their own grass marker and map color, input-aware crouch direction, live concealment progress, and explicit text-state completion requirements while retaining the same collision, distance, pursuit, and scoring rules.
- Revalidated hard-cover, cover-to-rough, and Reduced Camera Motion transfers at the Tee, Clubhouse Crossing, and Night Range. All three primary lanes completed and awarded once, rough lanes required actual crouched concealment, selector cost remained 0.21–0.36ms across 120-call samples, the representative browser pass rendered its final frame in 1.70ms, and browser errors remained empty.
- Added Hold Your Nerve as a voluntary close-search mastery beat. While fully concealed in effective rough with Joe searching 11–42 meters away behind an authored sightline blocker, the player can hold Crouch plus Listening Focus motionless for 1.65 seconds to earn +105 through a new capped Nerve Delivery family. Movement, exposure, distance loss, active filing/status/ball actions, and an in-progress Blindside transfer block or reset the attempt; Joe receives no speed, detection, or search nerf.
- Integrated the decision through a restrained concealment meter, live Joe distance and mode, input-aware keyboard/gamepad/touch copy, compact attention status, non-verbal start/completion tones, threat caption, result accounting, and a complete text-state contract. Nerve guidance temporarily suppresses only idle Blindside previews, preserving active transfers while preventing two stealth systems from competing for the center and map footer.
- Deterministic validation completed the mechanic on real obstacle geometry in standard and Reduced Camera Motion modes, rejected movement, open sightlines, and out-of-range attempts, enforced one completion per zone and the two-award run cap, and found at least one authored rough-plus-blocker opportunity in all eight course zones. Blindside completion still passed at the Tee, Clubhouse Crossing, and Night Range with 0.21–0.33ms lane selection; the exact opening regression remained dormant at 10m with a 2.10ms final render, browser errors were empty, and port 4173 was cleaned up.
- Added a 0.24-second interruption grace for brief blocker-edge or distance flicker during an active Nerve hold. Progress freezes and the meter turns amber with an explicit grace countdown; movement still resets instantly, sustained exposure resets after the grace, and no progress accrues while the sightline is unstable.
- Ran Hold Your Nerve against Joe's unfrozen production search, navigation, detection, terrain, and mower systems across one authored setup in every zone. All eight completed while Joe remained in search mode, with real completion times of 2.9–3.9 seconds including concealment buildup and competing reward feedback; Maintenance Maze and Night Range each consumed three sampled grace frames, proving the tolerance protects real edge motion without becoming the normal path. Browser errors were empty.
- Re-ran the exact standard client after the organic tuning. The opening remained unchanged with the Nerve system dormant, `first_hole` controls intact, a 2.20ms final render sample, no browser error file, and no listener left on port 4173.
- Replaced Delivery-card overwrite behavior with a bounded presentation queue. The first reward keeps the established 2.15-second read, later cards play at a tighter 1.7-second cadence, and the visible card carries a small `NEXT count // queued value` tab so simultaneous smart plays build anticipation rather than silently replacing one another.
- Preserved the score model and HUD priority contract: every event still enters the exact ledger immediately, Risk Premium pauses rather than ages the held Delivery card, Reduced Camera Motion removes entrance drift without changing order, and a five-card visual cap aggregates only the final overflow card while retaining every underlying score event and family cap.
- Deterministic validation sequenced two distinct cards, cleared the queue, preserved Risk priority, matched Reduced Motion, and retained seven ledger events through a synthetic six-card backlog with one visual merge. The exact opening regression remained unchanged in `first_hole`, sampled a 1.70ms final render, produced no browser error file, and left no listener on port 4173.
- Connected Hold Your Nerve to an immediate post-success decision. Completion now opens a 4.4-second exit window that permits mint Blindside lane guidance through the active Delivery card while Joe is moving away or laterally; ordinary distance, detection, shelter, pursuit, and collision rules still apply, and Joe receives no slowdown or search penalty.
- Exposed the exit timer and lane readiness through the attention panel and text-state contract, and updated the completion message to direct the player toward the mint route without promising safety.
- Revalidated standard and Reduced Motion Nerve holds, interruption grace, rejection/cap behavior, reward-queue sequencing, and Blindside transfers through hard cover and deep rough. The representative completion frame showed the Nerve reward, 4.3-second exit timer, world-space mint landing lane, off-screen bearing, and matching map guidance together with no browser errors.
- Extended Listening Focus into a bounded tactical search read. While Joe searches within 126m, the focus ring and attention panel now classify his mower movement as closing, crossing, receding, or paused, and an in-world sweep identifies the last signal or trail check he is investigating with the live search countdown.
- Kept the read observational: it requires held Focus, disappears during pursuit or outside the range, exposes no permanent map tracking, and changes no Joe speed, route, detection, search timer, score, or cooldown. Reduced Camera Motion uses a stable locus ring while retaining the same information.
- Deterministic validation covered all four movement classifications, last-signal and physical-trail loci, released-Focus suppression, pursuit priority, and Reduced Motion. Organic Joe search across all eight authored zones, Hold Your Nerve, hard-cover/deep-rough Blindside transfers, syntax, and browser errors remained clean. The exact standard client stayed in `first_hole` at 10m with the search read dormant, a 2.3ms final render sample, no browser error file, and no listener left on port 4173.
- Full organic visual review caught and resolved a presentation collision after Nerve success. Nerve armed/active/exit states plus Blindside, Risk, and Delivery feedback now temporarily own the field layer; the search read returns only after those decisions clear, preventing its last-trace label from crowding the reward-and-exit handoff.
- Coupled the independent moon and generated cloud layers through a compact alpha-derived occupancy mask. The actual painted cloud silhouette now attenuates the moon disc and halo as it crosses, while a restrained blue-black grade passes over world art and leaves the HUD, map, objective markers, interaction prompts, collision cues, and authoritative stealth exposure untouched.
- Reduced Camera Motion freezes both the cloud and its moon shadow rather than removing the effect. The lighting response is purely atmospheric and exposes coverage, intensity, contributing-cloud count, motion policy, protected layers, and `gameplayEffect: none` through the text-state contract.
- Deterministic clear/covered validation measured coverage from 0.000 to 0.792 and moonlight intensity from 1.000 to 0.509 with identical player light exposure. Reduced Motion held coverage at 0.309 across a simulated three minutes; the alpha-silhouette calculation averaged about 0.0022ms over 600 samples. Background-depth, ground-fog, adaptive-performance, and exact-client regressions passed without browser errors; the final opening frame sampled 1.7ms render work and port 4173 was cleaned up.
- Added Mower Cadence as a quiet-phase observation loop: while concealed, crouched, still, and 34–118 meters from patrolling Joe, hold Listening Focus for 1.25 seconds to snapshot his existing collision-aware path and committed waypoint for seven seconds. The mint forecast appears in the world and persistent map, adds a compact first-person bearing when the endpoint is off-screen, expires naturally, and is revoked immediately if Joe leaves patrol; it never changes AI, movement, detection, or timing.
- Added Cadence-family Delivery scoring at +90 base with one completion per zone and a three-read run cap, plus input-aware progress, attention status, restrained audio, Reduced Motion-safe feedback, text-state diagnostics, result accounting, and explicit shared-input priority: an existing Cut Trace wins, while a valid sheltered Cadence read prevents a fresh cut scan from stealing the hold.
- Deterministic Cadence validation found valid authored concealment geometry in all eight course zones and covered arming, partial progress, success, seven-second expiry, patrol-state revocation, movement cancellation, Delivery accounting, and Reduced Motion with no browser errors. An organic Audit Row scenario completed against Joe's real navigation behind `audit-arch-left`; Cut Trace, Blindside Transfer, and exact-client regressions passed, the baseline opening frame sampled 1.9ms render work, and port 4173 was cleaned up.
- Rebuilt golf-ball landing as a terrain-authored two-stage shot. The aim view and persistent map now distinguish first impact from projected rest; after the airborne arc, the ball visibly follows a damped bounce and decelerating run before Joe commits and the grounded recovery prop becomes active.
- Bound every outcome to existing authoritative state rather than parallel approximations. Mower cuts carried 23.48m, fairway 16.04m, wet turf checked at 7.65m, rough caught at 6.41m, and bunker sand plugged at 2.74m in the deterministic 82%-power matrix. Live sprinkler state changes the wet lie, mower marks change carry, and surface transitions are retained in the ball's text-state history.
- Made obstacle play honest and tactical. First impact inside a solid ellipse resolves to its visible edge and banks back into play; later roll contact stops before the obstacle; maintained-course edges stop the ball without placing it out of bounds. Solid banks create the loudest/longest lure, mower cuts stay crisp, fairway stays clear, rough muffles, wet turf softens, and bunkers mute the distraction. Repeated-shot decay and Overtime scaling remain applied after the lie modifier.
- Added surface-colored impact fragments, solid-contact sparks, a restrained settle ring, terrain-specific impact and settle audio, live run-distance copy, surface-aware map markers, and Reduced Camera Motion behavior that suppresses vertical bounce without changing endpoints, timing, Joe behavior, or recovery.
- Deterministic validation covered fairway, mower cut, wet turf, rough, bunker, solid bank, rolling solid stop, course boundary, Joe redirection, persistent recovery position, actual Enter recovery, lure-profile ordering, text-state parity, and Reduced Motion with no browser errors. All final endpoints were collision-clear and in bounds. The planner averaged 0.246ms over 500 calls with the full 150-mark mower-cut cap. The starter-bell lesson and actual keyboard hold/steer/release path both passed. The final exact opening regression remained clean in `first_hole` at 10m with the golf system dormant, 2.0ms last-frame render work, no browser error file, and no listener left on port 4173.

- Added Shot Craft as a restrained mastery layer over the completed terrain-shot system. A committed ball can earn exactly one prioritized accolade: Pressure Chip for a chase release with Joe 12–32m away (+145 base), Deliverable Bank for a deliberate solid impact with at least 3m of run (+120), or Lie Switch for at least 4.5m across two distinct surfaces (+95).
- Routed all three through a shared Delivery family capped at three scored shots per run. Practice shots do not score, a settled roll cannot be awarded twice, and a shot satisfying multiple rules takes only the highest-priority result. The accolade does not alter Joe's diversion timer, lure multiplier, pathing, detection, speed, or recovery economy.
- Added a restrained world-space seal, Reduced Camera Motion-safe pulse, non-verbal two-note cue, grounded-ball accolade record, complete text-state thresholds/count/event contract, Delivery ledger integration, and a compact post-run Shot Craft count in the resource row.
- Deterministic browser validation covered Pressure-over-Bank-over-Lie priority, each individual category, an ordinary shot, practice exclusion, duplicate suppression, the three-award farm cap, Reduced Camera Motion, and the actual commit → flight → banked roll → settle pipeline. The production planner produced a 6.09m bank and retained the chase-time context through settlement; Joe still entered `investigate`, browser errors were empty, and the exact hold/steer/release client remained clean with a 1.8ms last-render sample. Both temporary test servers were removed.

- Made Shot Craft intentionally playable rather than retrospective. The live aim evaluator now forecasts Pressure Chip, Deliverable Bank, or Lie Switch using the exact priority and geometry rules used at settlement, including current Joe mode/distance, practice exclusion, family count, and the three-award cap.
- Integrated the forecast into the shot panel as its own color-coded top ledger, the projected rest marker, and the persistent map footer. The panel remains below the authoritative pursuit/contact-break card, avoiding a visual collision discovered during screenshot review. Capped and practice outcomes are labeled as non-scoring instead of silently promising a reward.
- Added one restrained ready cue per craft type per aim session and retained the preview through flight, roll, the grounded ball, and the scored event. Successful awards now record `previewMatched`, and the text-state contract exposes eligibility, blocked reason, thresholds, Joe distance, family count, and cap at every phase.
- Deterministic validation covered all three preview types, Pressure-over-Bank priority, a plain shot, practice and cap suppression, cue deduplication, text parity, Reduced Camera Motion, and preview → commit → flight → roll → grounded-ball → Delivery parity with no browser errors. The untouched production hold/steer/release client still spent one ball, settled one recoverable ball, redirected Joe, and stayed in `first_hole`; sampled render work was 3.4ms last / 2.36ms average, and every temporary server was removed.

- Added a persistent three-entry Shot Book for Pressure Chip, Deliverable Bank, and Lie Switch. The first scored execution saves immediately rather than waiting for escape, so discovery survives a later capture; repeat techniques never duplicate, and the established three-score Shot Craft cap still blocks excess scoring and discovery for that run.
- Added defensive save migration that accepts only the three known string IDs, removes duplicates, and safely initializes older careers. Shot Book completion is global rather than per Night Order and never gates routes, Overtime, the Portfolio, performance stamps, or survival balance.
- Extended the live craft forecast with `NEW SHOT BOOK ENTRY`, changed the first Delivery label to `DISCOVERED`, carried discovery/book-completion metadata through grounded balls and run results, and exposed the complete persistent collection contract in `render_game_to_text`.
- Added color-coded P/B/L seals to the Portfolio header, a Shot Book scorecard note, and a dedicated completion filing beneath the route result. Visual review confirmed two-of-three, complete, Reduced Camera Motion, and after-action states remain legible without crowding the order dossiers or score rows.
- Deterministic browser validation covered first discovery, repeat suppression, cap-blocked discovery, immediate local persistence, persistence through capture and reload, corrupt/duplicate save filtering, all-three completion in one legal three-award run, menu progress, Reduced Camera Motion, and browser errors. The untouched production shot client still spent and settled one ball, redirected Joe, and remained in `first_hole`; sampled render work was 3.1ms last / 2.09ms average, and all temporary servers were removed.

- Resolved the severe mid/late-course slowdown as three independent hot paths rather than reducing visual density. Joe's collision-aware routing no longer performs an allocation-heavy whole-course linear-open-set scan: it now uses a cached static navigation grid, cached edge validity, a binary min-heap, a direct-route fast path, local start-cell seeding, and a longer failed-route backoff. A conservative segment AABB broad phase skips irrelevant obstacle math without changing authoritative ellipse collision.
- Cross-zone navigation validation found real obstructed routes in all eight authored course zones. Every optimized route reached its target with collision-clear intermediate and final legs; measured planner calls were 0-2.9ms across the eight samples instead of the former 133-1,788ms calls and million-check spikes. Uninstrumented active simulation averaged roughly 0.23-0.35ms per update across the Tee, Audit Row, Water Hazard, Maintenance Maze, Night Range, and Release Corridor, with typical p95 values of 0.4-0.8ms.
- Removed recurring atlas-crop stalls from the closest and most repeated animated art. Joe's ten 192px frames now use bounded per-frame caches for both animation sheets, reducing the measured close-Joe draw from about 19.9ms to about 0.15ms while preserving the exact sprite, head movement, mower motion, fog wake, clippings, shadow, and chase presentation. The image-gen path lantern and course-sign cells now use the same cache and idle priming instead of repeatedly cropping their full atlases.
- The lantern/signage cache removed the localized Night Range presentation cliff: the representative uninstrumented Night Range sample fell from 61.75ms average / 60.7ms median render work to 1.79ms average / 1.3ms median, in line with the rest of the course. Final exact-client regression remained in `first_hole`, retained the golf throw, recoverable ball, Joe investigation route, and full visual composition, measured 1.92ms average / 1.7ms last render work, produced no browser error file, and left no listener on port 4173. Close-range visual review confirmed Joe and the cached lantern/signage art render cleanly.

- Replaced the procedural block-figure apparition with a dedicated ImageGen Shadow Joe sprite derived from Joe's portrait and established mower art. The versioned chroma source and cleaned transparent production asset are stored as `web/assets/rough-cut-shadow-joe-v1-chroma.png` and `web/assets/rough-cut-shadow-joe-v1.png`; both the peripheral horror event and distant spectral sightings now share the recognizable cold-eyed Joe-and-mower silhouette while retaining non-collision, flicker, dissolve, and Reduced Motion behavior.
- Re-measured every opaque island in `rough-cut-bunker-atlas-v2.png` and corrected all five atlas source rectangles to use padded, non-overlapping alpha bounds. The former third, fourth, and fifth crops began inside their preceding bunker, and two crops also shaved their own right edge; the new bounds retain the full authored silhouette without importing neighboring chunks.
- Visual validation forced the live Shadow Joe event and rendered a five-cell isolation board. Shadow Joe remained legible beside the HUD without covering navigation, and all bunker silhouettes were complete and cleanly separated. The exact standard client remained in `first_hole`, preserved the golf-shot path, averaged 1.81ms render work, produced no browser error file, and the temporary visual harness reported an empty error list. The user-facing server on port 4173 was preserved throughout; the temporary 4174 server was removed after validation.

- Added two dedicated built-in ImageGen horror overlays: `web/assets/rough-cut-horror-flash-joe-v1.png` is a fragmented close-up of spectral Joe and his mower, while `web/assets/rough-cut-screen-tear-course-v1.png` is a black-backed field of shredded moon, grass, fog, mower teeth, and flag fragments. Both use screen blending so their authored black negative space preserves the live course beneath them.
- Added an independent bounded micro-shock track to the horror director. After the opening grace period it schedules an intensity-weighted Joe flash or course tear roughly every 10.5â€“24.5 moving seconds, never overlaps the peripheral Joe apparition, never changes collision/detection/AI, and refuses to interrupt the tutorial, Risk Premium, Delivery presentation, relief, or Final Filing seal. Each event uses one fade envelope and lasts at most 0.64 seconds rather than strobing repeatedly.
- Integrated the art below the HUD, map, objective copy, prompts, tactical overlays, and crosshair. Standard presentation adds three-step art drift plus sparse horizontal rupture seams; Reduced Camera Motion retains a quieter static custom image with no slice movement. Each event has a short non-verbal danger cue and complete text-state timing, type, asset, count, accessibility, protected-layer, and fairness diagnostics.
- Performance validation rejected an initial live-canvas readback implementation after it measured 57â€“64ms during active tearing. Replacing it with pre-primed screen-sized art caches reduced the representative baseline/Joe-flash/course-tear/reduced-tear renders to 1.72/1.81/2.13/1.01ms with empty browser errors. Deterministic tests covered both flash types, Reduced Camera Motion, and automatic scheduling; the untouched exact client remained in `first_hole`, spent one golf ball, averaged 2.06ms render work, and produced no browser error file.

- Converted both black-backed ImageGen horror overlays into versioned transparent production assets using a soft black chroma key rather than a hard edge cut. `rough-cut-horror-flash-joe-v2.png` is 80.06% fully transparent with a 14.81% feathered matte; `rough-cut-screen-tear-course-v2.png` is 72.40% fully transparent with a 23.04% feathered matte. Every corner is alpha-zero, while the original v1 source art remains untouched.
- Rebuilt the pre-primed horror-overlay cache as an alpha-preserving canvas and retuned the screen blend, seam opacity, and seam thickness. The live sky, moon, fog, course geometry, Joe, and landmarks now remain visible through the authored negative space; the HUD, map, objective, prompt, and crosshair continue to render above the effect. Reduced Camera Motion uses an even quieter 16-20% static treatment.
- Side-by-side baseline, Joe-flash, course-tear, and Reduced Motion captures confirmed the flashes read as brief environmental intrusions rather than replacement screens. Automatic scheduling still fired, browser errors remained empty, and representative baseline/Joe/course/reduced render costs measured 1.726/1.340/1.508/1.092ms. The untouched exact movement-and-shot client remained in `first_hole`, settled one recoverable ball, and averaged 1.88ms render work.

- Promoted Joe's existing mower scars into the Living Roadmap, a run-persistent traversal network rather than a decorative trail. Every visible cut lane now grants exactly 8% more movement pace and retains quieter-footing rules, while the same strip removes rough concealment; bunker sand continues to take priority. A one-time field explanation and compact surface/map status teach the fast/quiet/exposed decision without adding a permanent new meter.
- Matched the authoritative cut footprint to the painted strip through an oriented length-and-width ellipse, removing the former oversized radial gameplay halo. The world retains the restrained bruised-turf stamp, while the persistent map now draws continuous freshness-colored cut segments and a latest-direction arrow. Every 64 cut meters publishes a brief world-space roadmap seal; total, active, and longest lane distance, lane count, milestones, entries, tradeoff, and presentation are exposed through `render_game_to_text`.
- Deterministic validation measured 12.00m normal versus 12.96m cut-lane travel over the same half-second input, exactly the authored 1.08 multiplier. In rough, the painted center reported mowed/fast/no effective rough while a point eight meters beside it remained ordinary concealment-bearing rough; the visual-footprint check likewise rejected the off-strip point. Standard and Reduced Camera Motion captures kept objectives and the course readable, the representative roadmap render measured 1.26ms, and browser errors were empty. The untouched exact chip client remained in `first_hole`, naturally produced six cuts / 32.2m of roadmap while Joe investigated, kept one recoverable ball, and averaged 1.8ms render work.

- Closed the remaining custom-art gap with two built-in ImageGen families. The four-cell course-mechanics atlas now supplies the optional field-test bell, every Sprint Review checkpoint, the shed Final Filing terminal, and the drain release control; the eight-cell terrain-evidence atlas supplies fresh, warm, and fading mower cuts, torn divots, rough tracks, wet tracks, bunker impressions, and fairway compression.
- Retained both chroma sources and cleaned transparent production atlases, recorded the exact generation prompts in `design/course-mechanics-and-evidence-v1.md`, and measured every sprite's alpha bounds. Runtime source rectangles follow actual silhouettes instead of equal-grid assumptions, preventing cropped edges and fragments from neighboring cells.
- Integrated the fixtures at their authoritative world anchors with projected ground contact and cached atlas cells. Accessibility rings, labels, map geometry, and collision feedback remain code-native overlays, while the authored objects beneath them no longer appear as generic geometry. Persistent turf evidence inherits the existing heading, age, surface, and gameplay footprint without changing movement, stealth, collision, or Joe's AI.
- Native and runtime-crop boards confirmed all twelve used sprites are complete and isolated. In-game review confirmed the field bell at course perspective and generated bunker impressions during traversal. The exact gameplay client remained in `first_hole`, completed its shot choreography, produced no browser error file, and measured 1.98ms average / 2.2ms last render work. Port 4173 remained untouched.

## Follow-ups

- Added a true hold-to-glance rear view. The rebindable R key, standard-gamepad R3, and a dedicated multi-touch Rear button now rotate the world projection through 180 degrees while movement, collision, concealment, interactions, and Joe's AI remain body-relative. Releasing returns smoothly to the forward route; the screen-fixed HUD and persistent map never rotate.
- Integrated the mechanic across the survival briefing, How to Survive page, expanded and compact HUD copy, keyboard remapping, gamepad polling, touch pointer lifecycle, pause/reset cleanup, and `render_game_to_text`. A restrained teal rear-view frame reports that movement remains unchanged and switches to a Joe-distance warning when he is actually visible behind the player. Reduced Camera Motion retains the tactical view with a quieter positional/tint transition and no directional streaks.
- Browser validation covered keyboard hold/release, sprinting 36 meters forward while the rear camera remained at 180 degrees, synthetic standard-gamepad R3, synthetic multi-touch hold/release, the reduced-motion mid-turn and stable states, tutorial dismissal, and console/page errors. All exercised paths reported `movementDirection: body_relative_unchanged`, returned cleanly to zero on release, and produced no browser errors. The exact game client remained in `first_hole` with the course, HUD, map, and golf interaction intact at 2.17ms average render work. The temporary 4174 test server was removed after validation; the user-facing 4173 instance was preserved.

## Predator pass v1

- Generated a dedicated `2172x724` high-resolution pixel-art rear service-boundary panorama from the existing estate-perimeter style reference. The scene supplies a locked wrought-iron gate, guard kiosk, irrigation pipes, utility sheds, fence, pines, security lamps, and distant insurance annex without baking Joe, sky, moon, clouds, fog, text, or UI into the art.
- Retained `web/assets/rough-cut-rear-service-boundary-v1-chroma.png` and created the transparent production asset `web/assets/rough-cut-rear-service-boundary-v1.png` with the image-generation chroma helper. The soft matte contains 1,169,369 transparent and 152,595 partially transparent pixels. The gate plane was moved in front of the generic tree line after the first in-game review exposed a depth-order conflict, and its final runtime opacity was raised to 0.82 for a clearer rear landmark.
- Integrated the panorama into the existing hold-to-look-behind renderer as a reverse-parallax crossfade. The forward estate, villas, and clubhouse yield as the rear boundary appears; the independent sky, moon, clouds, ridge, tree line, canopy, fog, course, HUD, and map remain live. The text-state scene decomposition now reports the active rear blend and landmark set.
- Formalized Joe's predator vocabulary around three readable course tactics: the existing warned service intercept, False Retreat with falling-throttle telegraph / retreat / snapback phases, and Cover Shred with a threatened-rough warning followed by a physical Living Roadmap cut. A shared cooldown, distance window, tactic re-entry guard, and direct sight/sound/point-blank cancellation preserve ordinary pursuit fairness.
- Added a projected mower headlight and fog-volume cone tied to Joe's actual screen position, mode, distance, and committed tactic. Patrol remains restrained, chase turns red, and Cover Shred warms toward cutting orange; Reduced Camera Motion removes pulse while retaining the lane warning.
- Added one authored atmospheric identity to all eight course zones: boundary knock, hedge breath, submerged lights, clubhouse door cycle, hedge breach, black sprinklers, Night Range volley, and Release Corridor lockdown sweep. Each triggers once per run, owns a bounded banner/caption window, and changes no collision, detection, movement, or AI values.
- Added presentation-only Composure with Steady, Tense, Frayed, and Panic states. Real detection, Joe distance/mode, pursuit pressure, tactics, and scares lower it; quiet cover, rough concealment, calm travel, and an informative rear glance recover it slowly. The value feeds the attention panel, heartbeat, vignette, edge interference, border shock, and result presentation only—never input, speed, collision, detection, or available actions. Reduced Camera Motion keeps a static vignette and removes animated interference.
- Deterministic browser validation exercised False Retreat through retreat, snapback, completion, and cooldown; verified Cover Shred's bounded debris and persistent cut publication; and triggered all eight authored zone identifiers. Normal and Reduced Camera Motion panic states preserved the HUD, map, objective, and interaction layers. Browser errors remained empty.
- The corrected official browser regression now dismisses onboarding, moves 20 meters forward plus a lateral burst, naturally triggers the Tee boundary scare, remains in `first_hole`, and reports 3.01ms average canvas rendering with no error artifact. The exact ImageGen prompt, cleanup settings, behavior contracts, and validation record are documented in `design/predator-pass-v1.md`. The temporary 4174 validation server and browser contexts were removed; the user-facing local instance on 4173 remains running.

## Reciprocal cover occlusion

- Made the visual and AI cover contracts reciprocal. Every drawn obstacle marked `sight: true` now renders at no less than 2.05 camera-space meters high and no less than 1.82 times its projected collision-footprint radius wide. Dedicated hedge, stone, and grounds-cart art retains proportional scaling; lower landscape families such as generic overturned carts, black-water reeds, bunker lips, and bunker walls widen to the real footprint without becoming falsely tall.
- Kept non-cover props at their authored scale and preserved existing collision, cover radius, Joe line tests, pathfinding, interaction ranges, and player movement. Parent structures continue to supply the art for invisible hedge-arch and shed-wall collision sides.
- Added per-visible-obstacle `twoWayCover` telemetry with Joe sight blocking, current player-view blocking, visual dimensions, minimum-height contract, parent-structure ownership, and the explicit shared-cover rule. `navigationReadability.twoWayCover` exposes the global height, width, distance, and guidance-protection contract.
- Forced six representative families directly in front of the camera at collision-safe clearance: dedicated hedge, stone cover, dedicated grounds cart, generic overturned cart, pond reeds, and bunker wall. All six reported both the exact object as Joe's `lineBlockedBy` and `blocksPlayerView: true`; widths ranged from 498-652 pixels and visual heights from 160-295 pixels at the tested distances. Visual review confirmed that large structures dominate the central view, while lower cover breaks the lower sightline without hiding the map, objective, route ribbon, prompts, or contact ring. Browser errors remained empty.
- The official movement regression still dismissed onboarding, traveled 20 meters plus a lateral burst, triggered the Tee scare, and stayed readable at 2.63ms average canvas render work / 55.3 estimated presented FPS. No browser error artifact was produced, and the user-facing 4173 server remained untouched.

## Hedge tunnel wing alignment

- Replaced fourteen invisible left/right hedge-tunnel blockers with visible planted hedge wings across Audit Row, Clubhouse Crossing, Service Maze, the Dead Green, both Night Range transitions, and the final Release gate. Collision ellipses, cover radii, sight blocking, parent arch positions, and center openings are unchanged.
- Reused solid left/right crops from the existing generated expanded-course hedge arch, so the added wings inherit its pixel density, foliage, trunks, lighting, and ground planting instead of introducing mismatched procedural rectangles or duplicate full arches. The original center arch remains the only visual passage.
- Visual review rejected the first crop because it imported a sliver of the arch opening into each wing. Tightening the sources to the solid outer 175-pixel columns removed those false dark gaps while the reciprocal-cover width contract stretches each crop to its authoritative collision footprint.
- Deterministic close tests confirmed the Audit center remains unblocked, the left wing reports `lineBlockedBy: audit-arch-left`, and the same wing reports `blocksPlayerView: true` with a 372x275-pixel near-camera footprint. A seven-family sweep found 16.49 units of center clearance on both sides and visible left/right wing art for every placement, with no browser errors.
- The exact route client traveled organically to 99 meters in Audit Row, showed both 341-pixel-wide wings and the single center opening, remained unblocked at `x: 0`, and rendered at 1.96ms average canvas work. The user-facing 4173 server remained active throughout.

## Hedge tunnel detail-density correction

- Replaced the horizontally stretched 175-pixel side-wing crops with six-segment composites assembled from opaque interior foliage in the original generated hedge arch. The effective 560 source pixels render at the same source-pixel-to-screen-pixel ratio as the untouched 520-pixel center arch, while small overlaps keep the hedge wall continuous.
- Visual review caught and removed the first composite's vertical transparency seams. The final Audit Row frame keeps both wings at 328x240 pixels beside the 304x240 center arch, preserves the authored opening and collision clearance, and reports 1.71 source pixels per screen pixel for all three pieces.
- The exact route client again traveled organically to 99 meters, remained unblocked through the center at `x: 0`, produced no browser error artifact, and left the user-facing 4173 server active.

## Authored hedge tunnel landmark

- Used built-in ImageGen with the expanded course atlas as a strict style reference to replace the interim repeated hedge composites with one seamless 2172×724 landmark. The production alpha crop contains a continuous canopy and planted baseline, unique branches/trunks/fescue/roots, and a completely transparent centered opening.
- Integrated the asset once on each of the seven parent arches and returned the fourteen side objects to collision-only children. Positions, collision ellipses, cover radii, Joe sight blocking, map footprints, contact guidance, center clearance, and parent scales are unchanged. A dedicated 1536-pixel cache preserves foliage detail while reducing a visible tunnel from thirteen atlas draws to one.
- The official center route again reached y 99 at x 0 with `blockedBy: null`, displayed the open passage, averaged 2.17ms of canvas render work, and produced no browser error artifact. The official side-contact route reached x -20 / y 108, reported `blockedBy: audit-arch-left`, retained `MOVE RIGHT AWAY`, averaged 1.69ms, and produced no browser error artifact. The user-facing 4173 server remained active.

## Tension Director v2

- Consolidated suspense into explicit quiet, warning, confrontation, and recovery phases. The shared phase owns the presentation budget: Silent Stalk, direct confrontation, and protected relief now pause unrelated random flashes instead of stacking effects over critical gameplay.
- Added truthful environmental approach omens. Bent grass, fleeing birds, and parted ground fog render at bounded points broadly between the player and Joe, scale with the adaptive effects tier, remain static under Reduced Camera Motion, and change no collision or detection values.
- Added telegraphed mower silence. A 1.65-second engine cough precedes 3.4–4.8 seconds of audio-only Silent Stalk; Joe's movement, AI, detection, routing, collision, and turf wake continue unchanged. Chase, detection above 0.5, or proximity within 28 meters immediately restores the engine. A 24-second cooldown and five-event cap prevent repetition.
- Added rear-glance-specific horror. Rare Shadow Joe crossings and spectral mower-light sweeps appear only in the stable rear projection, clamp away from persistent HUD/map occlusion, carry a cold fog rim and left/right read, preserve body-relative movement, and remain presentation-only.
- Standard organic route validation reached Audit Row without movement, collision, visual, or browser-console regressions. Natural long-hold validation entered Silent Stalk at 13.07 seconds with Joe still patrolling, then returned to a running mower and quiet phase at 17.82 seconds. Targeted keyboard rear-glance validation reached 180 degrees, exposed one left `rear_crossing`, returned to zero on release, and produced no browser/page errors. The user-facing 4173 server remained active.

- Continue expanding organic pursuit routes so Close and Razor Cut outcomes can be exercised through ordinary steering against more than one authored cover formation.
- Exercise real multi-event Delivery stacks during full-course human play; deterministic sequencing, overflow, Risk priority, and Reduced Motion are verified, so tune cadence or the compact next-tab only if physical play feels too slow or too easy to miss.
- Exercise full rough-to-cover Blindside routes against unfrozen Joe pursuit during broader balance playtesting; cover-to-rough handoffs and Reduced Camera Motion now have deterministic completion coverage, so tune only if organic opportunities feel too rare or too dominant.
- Exercise Hold Your Nerve on a physical keyboard, gamepad, and touch device during complete pursuit-to-search transitions; unfrozen automated pathing now completes in all eight zones, so further timing changes should respond only to human feel rather than synthetic success rate.
- Revisit mower-wake color only after broader display testing; the current dark scar is intentionally readable through silhouette and fresh edge detail rather than saturation.
- Recheck physical-device frame pacing through the Service Maze and Release Corridor; automated profiling now exposes `averagePresentationMs` and `estimatedFps` alongside render cost so any remaining GPU-specific stall can be localized instead of inferred.
- Tune golf carry and lure multipliers only after complete human runs on keyboard, gamepad, and touch; the physics, collision, practice lesson, recovery economy, and accessibility contracts are deterministic, so further changes should respond to shot feel rather than synthetic completion.

## Course suspense pass v3

- Added a material-aware mower acoustic model driven by the authoritative sight/collision obstacles. Vegetation, earth, structures, and metal now apply distinct low-pass, transmission, and bounded reflection profiles; stacked blockers compound attenuation, restrained Doppler follows real relative distance, and stereo direction rotates through the hold-to-look-behind projection.
- Kept the acoustic layer presentation-only. Joe's hearing, sight, detection, speed, collision, routing, and Silent Stalk contract are unchanged, while captions, attention state, environmental disturbance, and the map preserve danger information without audio.
- Added run-local Shelter Memory for physical cover objects and coarse deep-rough sectors. Settled visits and stationary occupancy can stage Cover Audit after either a third visit or 9.5 seconds in one shelter.
- Added a fair Cover Audit sequence: an amber mower-tooth ground mark, banner, subtitle, spatial cue, and directional caption warn for 2.6 seconds before Joe physically searches the snapshotted shelter for up to 10.5 seconds. Leaving causes Joe to inspect obsolete information; staying accepts ordinary search and capture rules. Direct contact supersedes the audit, each shelter can trigger once, and a global cooldown plus four-event cap prevents pressure spam.
- Integrated Cover Audit into the shared tension budget so Silent Stalk, environmental omens, pursuit, relief, objectives, distractions, Status Requests, and existing predator tactics retain priority instead of stacking.
- Extended `render_game_to_text` with acoustic blocker/material/filter/transmission/reflection/pan/Doppler data and the complete shelter/audit fairness state. The exact behavior contract is recorded in `design/course-suspense-pass-v3.md`.
- The official short-route browser client remained in `first_hole`, produced no error artifact, exposed two-blocker vegetation attenuation at 0.51 transmission / 1180 Hz, and averaged 2.15ms of canvas render work. A longer natural official hold reached the runner's browser-lifetime limit after 112.9 seconds of wall time, so the existing deterministic `advanceTime` hook was used for the targeted sequence rather than changing game timing.
- Targeted natural timing preserved Silent Stalk priority, then staged Cover Audit at 18.55 seconds with 2.43 seconds of warning remaining. Moving away led to `playerLeftBeforeArrival: true`, Joe physically entered search at 21.2 seconds, and the obsolete-shelter outcome was recorded without browser errors. Forward/rear/forward audio validation rotated pan from +0.32 to -0.32 and back to +0.31 while retaining the same vegetation blocker and gameplay state.

## Locked-scope cohesion polish

- Kept the pass entirely inside the existing Hole 1 slice: no new zones, systems, objectives, progression, or art families were added. The work focused on instruction hierarchy, route naming, collision readability, responsive presentation, and regression evidence.
- Removed the optional practice drill's opening message and state-banner takeover. The first actionable message now remains `SOUTH GATE LOCKED — find the shed key or open the drain valve.` for 4.4 seconds, while the world prop uses the shorter `PRACTICE BELL // OPTIONAL` label and only offers its chip prompt within 58 meters.
- Unified the alternate route's player-facing vocabulary around `DRAIN VALVE` across the objective, navigation ribbon, course map, interactable telemetry, world label, and interaction prompt. Internal sprinkler/wet-turf behavior is unchanged.
- The official opening regression remained in `first_hole`, retained the map and optional practice landmark without an irrelevant global chip prompt, produced no browser error artifact, and averaged 2.46ms of canvas render work.
- Revalidated authored collision instead of changing it speculatively. The center hedge route reached Audit Row at x 0 / y 99 with `blockedBy: null`; the visible left wing returned `audit-arch-left`, `MOVE RIGHT AWAY`, and a matching on-screen footprint. Both runs produced no browser error artifact and averaged 1.90–1.97ms of canvas render work.
- Rechecked 844×390 landscape, 1280×720 Reduced Motion, and 390×844 portrait layouts. All retained the complete 16:9 canvas without horizontal or vertical overflow, kept the canvas keyboard-focusable with its game label, and produced no console/page errors. All temporary browser contexts were closed; the requested local server on port 4173 remains available for hands-on testing.

## Release-candidate refinement

- Fixed contradictory route guidance after objective commitment. Opening the drain valve now keeps the world ribbon, map, and text-state target on the drain exit; collecting the shed key keeps them on the shed exit. If both unlocks are acquired, both exits remain eligible and the nearer one wins.
- Added the navigation ribbon's actual next collision-aware world waypoint and distance to `render_game_to_text`, matching the visible lantern path without exposing a teleport or internal-state mutation hook.
- Added a bounded bottom-message text fit and shortened the Release Corridor cue to retain its normal readable size. Final visual review confirmed the complete sentence stays inside the authored panel.
- Made a fresh install inherit the operating system's Reduced Motion preference while preserving an explicit saved on/off override. Reduced gameplay retained sprint speed with zero roll, viewport shift, bob, speed lines, or peripheral rush.
- Completed both existing routes with ordinary input events and no state teleporting. The drain route filed in 55.67 seconds after all eight zones, five clearly identified/recovered contacts, and one rear glance; the shed route filed in 45.50 seconds after all eight zones with no collision contacts and one rear glance. Both Final Filings completed on the first attempt without cancellation or browser errors.
- Revalidated pause/resume, keyboard rear view, chip preview/landing/recovery, crouch plus Listening Focus, standard gamepad movement/sprint/rear/focus/chip, independent multi-touch Move/Run/Rear/Focus, result actions, and tutorial-free targeted rematch. Every exercised control path produced no console/page errors.
- Revalidated 844×390 landscape, 390×844 coarse-pointer portrait, 1280×720 Reduced Motion, portrait rotation copy, canvas labeling, and the visible 3px keyboard focus ring without overflow. Mower acoustics preserved vegetation filtering and flipped stereo pan +0.26 / -0.26 / +0.26 through forward/rear/forward projections.
- The final official browser client remained in `first_hole`, exposed the new waypoint contract, measured 2.21ms average / 1.8ms last canvas render work, and produced no browser error artifact. Full evidence is recorded in `qa/release-candidate-refinement-2026-08-01.md`.

## Environmental noise hazards

- Added twelve one-shot route hazards across the existing eight-zone course without changing level length, objectives, exits, or collision geometry. The set reuses six families from the generated course-clutter atlas: spilled range balls, toppled golf bags, loose hose couplings, maintenance tools, tee stones, and broken flag hardware.
- Added restrained amber ground rings, reflective glints, adaptive near-field labels, spent-prop displacement, material-specific spatial cues, a compact Surroundings warning, and a first-contact explanation. The warning plate moves below mid-distance props and above close props to avoid the horizon tutorial and bottom message rail.
- Contact strength is deterministic: ordinary movement emits 0.78 intensity, sprinting emits 1.0, and crouching or Listening Focus emits 0.52. All contacts route Joe to the exact sound point for a bounded investigation rather than exposing the player's later position.
- Golf-ball impacts can trigger hazards remotely at intensity 1.0, making the same props tactical lures. Triggered props remain visibly spent and cannot fire again during that run; dedicated counters distinguish stepped and remote activations.
- Added sixteen hazard-specific Joe lines using the established Product Owner, Agile, and course-operations voice. The event uses a single cause-specific threat card instead of stacking the generic investigation card over it.
- Extended `render_game_to_text` with total/triggered/stepped/remote counts, the four nearest live hazards, the active sound source, intensity, and timer. Three focused action files cover approach readability, accidental activation, repeat protection, and remote activation.
- Validation confirmed the normal 0.78 step, crouched 0.52 step, and 1.0 remote hit; each put Joe into `investigate` with navigation targeting the authored hazard coordinates. Repeated movement inside the spent opening spill left the trigger count at one. All twelve hazard centers remain outside authored blocking footprints, with normalized center clearance from 1.69 to 4.26.
- Final visual review confirmed separate practice and hazard labels, one hazard alert plus one Joe bark, and readable spent-state feedback. The focused and baseline clients produced no console/page errors; sampled canvas work remained between 1.84ms and 2.92ms after scene warmup. Detailed evidence is recorded in `qa/environmental-noise-hazards-2026-08-01.md`.

- Human follow-up: tune individual investigation durations only after full-route keyboard, gamepad, and touch play confirms whether later hazards feel too forgiving or too punitive. The deterministic behavior and accessibility paths are complete.

## Signal hierarchy and route-feedback polish

- Refined the existing environmental-hazard feedback without adding a zone, objective, blocker, progression system, or art family. Nearby guidance now truthfully changes between `WALK WIDE`, sprinting's `FULL ALERT`, and crouch/Listening Focus's `MUFFLED CROSSING`.
- Added one low-volume, directional, player-only proximity rustle at 17 meters. It fires once per hazard and changes no Joe alert, detection, investigation, noise, score, or collision state; the existing amber ring, glint, label, and Surroundings copy preserve the same warning for players without audio.
- Removed the redundant bottom-center `DISTRACTION` plate while the first hazard consequence message is active. After the explanation clears, the authoritative locus returns as `NOISE SOURCE // Ns`, keeping Joe's destination legible without covering the message rail.
- The official approach and activation clients remained in `first_hole`, produced no browser error artifact, and averaged 2.23ms of canvas work in the sampled approach. Visual review confirmed the approach plate remains separate from the practice bell and the activation frame now contains only one consequence banner, one Joe bark, one localized threat caption, and the tutorial rail.
- Rechecked a 390x844 viewport and operating-system Reduced Motion preference. The complete 16:9 canvas remained intact, system preference resolved to `reducedMotion: true`, and no console/page errors were reported. Test browser contexts were closed; the requested local server on port 4173 remains available.

## Presentation hierarchy refinement

- Added a shared HUD-focus suppression rule so Final Filing, Emergency Appeal, Status Request, Risk Premium, Delivery awards, pursuit, Blindside Transfer, Cadence Read, and zone arrival temporarily own the center signal lane instead of stacking ambient threat captions over critical feedback.
- Deferred the large zone-arrival card while a higher-priority presentation is active. The existing Delivery label and bottom zone tip retain the information during the handoff, and the zone card can appear afterward while its timer remains.
- Kept renderer and text-state behavior synchronized through `maximumThreatCaptionCards` and the new `zoneBannerVisible` field.
- Synchronized nearby-noise copy across the world plate and Surroundings panel: sprinting says `SLOW DOWN`, crouch/Listening Focus says `MUFFLED, NOT SILENT`, and ordinary movement says `WALK WIDE OR CHIP IT`.
- Replaced remaining player-facing sprinkler-route wording with `drain valve` and `culvert`, while retaining internal sprinkler naming for the actual released-water simulation and dialogue context.
- Shortened three How to Survive lines that crossed the left-column divider. Final visual review confirmed the complete exit, Review, and look-back instructions remain inside their panel.
- Updated the Survival Briefing's exit card to the same `KEY → SHED • DRAIN VALVE → CULVERT` vocabulary and visually confirmed it fits the authored card.
- The official Audit Row route reported `delivery_award`, `deliveryVisible: true`, `zoneBannerVisible: false`, and zero allowed threat cards at y 94. The official settings route confirmed the revised copy. Both produced no browser error artifact; the Audit Row sample averaged 2.03ms of canvas work. Detailed evidence is in `qa/presentation-hierarchy-polish-2026-08-01.md`.
- The final opening regression retained the zone and south-gate cues while suppressing the redundant bottom-center copy, remained in `first_hole`, produced no browser error artifact, and stayed within the 16.7ms canvas frame budget.

## First-person backtrack wayfinding

- Preserved the working Delivery-to-zone presentation handoff after deterministic validation: the Audit Row Delivery card owns the center first, then the zone card appears with ambient threat captions still suppressed.
- Added a compact first-person rear bearing for the collision-aware objective route. When every reflector is behind the camera, it names the target, rounded distance, and safer left/right turn direction instead of requiring the map to communicate the backtrack.
- Kept the cue guidance-only and screen-safe. It sits below the compact objective HUD or expanded Surroundings panel, and it disappears during briefing, chip aiming, Final Filing, and a committed rear glance. Reduced Camera Motion removes its pulse without removing the information.
- Extended `render_game_to_text` with `firstPersonGuidance.rearBearingCue`, including visibility, side, target, distance, and the explicit `guidance_only` contract.
- The exact Audit Row route reported `TURN BACK`, a visible left cue for `DRAIN VALVE` at 90.57m, and visually rendered clear of the zone card, hedge opening, map, and bottom message. The ordinary forward route reported `BEAR LEFT`, five visible reflectors, ten path lanterns, and no rear cue. Both stayed in `first_hole` with no browser error artifact; sampled averages were 1.74ms and 4.01ms. Evidence is in `qa/first-person-rear-bearing-2026-08-01.md`.

## Contextual pause dossier

- Reworked the existing pause presentation into a frozen round dossier without changing game time, Joe simulation, objectives, or difficulty. It now preserves and displays the active file objective, course zone and completion, Joe's current mode and rounded distance, and whether the sightline was open or blocked at suspension.
- Centralized the Hole 1 objective label so the live overlay, pause dossier, and text-state contract cannot drift into contradictory route language after the key, drain valve, or Final Filing changes state.
- Moved the four pause actions down to make room for the dossier and synchronized their pointer hitboxes with the rendered controls.
- Added a `pauseSnapshot` text-state object only while suspended, explicitly marking the snapshot as frozen and exposing objective, zone, progress, Joe mode/distance, and sightline for accessibility and regression checks.
- The official browser client completed round start, pause, Settings, return to Pause, and pointer resume without resetting the player or Joe. The resumed frame returned to `first_hole` with `pauseSnapshot: null`, no browser error artifact, and 3.38ms average canvas render work. Evidence is in `qa/pause-dossier-polish-2026-08-01.md`.

## Opening signal-lane polish

- Reduced the first playable seconds to one central message owner. While the locked-gate objective rail is active, the redundant Tee arrival card, South Gate state banner, and ambient threat-caption cards yield; the authored gate knock, world reaction, sound, expanded objective dossier, route bearing, controls, and course map remain intact.
- Removed only the initial Tee arrival timer. Every later course-zone arrival still receives the existing authored card, subtitle, Delivery beat, and bottom route cue.
- Added `opening_briefing` to the shared HUD focus contract so renderer suppression and `render_game_to_text` visibility fields remain synchronized. Pursuit, Final Filing, Status Requests, Risk, and Delivery retain higher priority and can interrupt the opening normally.
- The official opening route reported `focus: opening_briefing`, zero permitted threat cards, no zone card, and no Joe/state banner while retaining the locked-gate objective. After the opening handoff, the expanded dossier collapsed without a stale card appearing. Audit Row later reported `focus: zone_arrival`, its normal zone card, and zero overlapping threat captions.
- Visual review covered the opening, post-message field view, and Audit Row. All three remained in `first_hole` with no browser error artifact; sampled canvas render averages were 4.24ms at the cold opening, 2.07ms after handoff, and 1.59ms in Audit Row. Evidence is in `qa/opening-signal-lane-polish-2026-08-01.md`.

## Survival Briefing focus polish

- Turned the existing Survival Briefing into a clearer modal handoff by strengthening its full-screen scrim, slightly deepening the authored panel, and adding a restrained inner keyline. The live HUD, map, and course remain faintly contextual without competing with the instructional cards.
- Increased contrast on the briefing's secondary progression guidance while preserving the established pixel-art palette and card hierarchy.
- Replaced the default-key-specific `PRESS W OR ENTER TO START` instruction with the binding-safe `MOVE OR PRESS ENTER TO START`. Controller and touch copy now use the same behavior-first wording, matching the fact that any configured movement direction can dismiss the briefing.
- Made the start prompt static when Reduced Camera Motion is enabled; normal presentation retains the restrained opacity pulse.
- Official validation covered the briefing, movement-driven dismissal into the live opening, and a Settings-to-briefing route with `reducedMotion: true`. The move route reached 19 meters with `tutorialVisible: false`; all routes stayed in `first_hole`, produced no browser error artifact, and the live sample averaged 3.38ms of canvas render work. Evidence is in `qa/survival-briefing-focus-polish-2026-08-02.md`.

## Defeat result-copy resilience

- Preserved the existing generated Joe capture still and mature Sprint Terminated composition after visual review found the art, incident hierarchy, and action layout already cohesive.
- Added bounded text fitting to both Joe dialogue lines, capture evidence, next-run counterplay, and the selected result-action description. Normal copy retains its authored size; unusually long dialogue or capture-cause variants now scale only as much as necessary instead of clipping outside their panels.
- Created a repeatable ordinary-input capture route for the current 720-unit course. It moves through the center lane, draws Joe into a real search, and backtracks into his path; no debug state or teleport is used.
- The organic route produced a sightline-held capture in Audit Row at 8 meters, rendered the matching Joe line and counterplan, and exposed the complete 2,354-line dialogue pool with no browser errors.
- Verified Retry File end to end. Enter loaded `counter_held_sightline`, reset player progress to 0, returned Joe to patrol at 188 meters, skipped the briefing, and displayed the same counterplan in the live opening. Right-arrow selection also moved to Next Order and synchronized its label/detail in text state.
- Result frames averaged 0.26â€“0.33ms of canvas work; the live retry frame averaged 1.01ms. Evidence is in `qa/defeat-result-copy-polish-2026-08-02.md`.

## Settings modal-cohesion polish

- Brought How to Survive / Settings and Key Bindings into the same focused-modal language as the Survival Briefing: both now use a stronger 0.9 scrim and a restrained inset keyline while retaining a faint contextual view of the menu or suspended course.
- Left all assignment copy, mix values, presentation toggles, caption preview, selection geometry, hitboxes, persistence, keyboard capture, conflict swapping, and return targets unchanged.
- Visual review confirmed the portfolio no longer competes with the assignment steps, sliders, toggles, or binding rows. Selected controls still use the existing orange border plus non-color text and position cues.
- Revalidated the complete remapping chain. Move Forward changed to A, Move Left automatically swapped to W, and the status rail explained both changes. Returning through Settings and starting the round used A for forward movement, reached 7 meters, and updated the live control strip to `A/W/S/D / ARROWS`.
- Rechecked Settings from a suspended round. The stronger scrim kept the course faintly contextual, preserved `returnTarget: paused`, and retained the frozen opening player/Joe state.
- Settings and Bindings samples averaged 3.51ms and 3.17ms of canvas work; the live remapped frame ended at 1.5ms. No route produced a browser error artifact. Evidence is in `qa/settings-modal-cohesion-polish-2026-08-02.md`.

## Opening cinematic input and comfort polish

- Preserved the existing high-resolution grass-cut cinematic and Joe reveal after visual review found the composition, chroma-key opening, cut sparks, and menu handoff already strong.
- Made the launch gate truthful to its handlers: keyboard copy now advertises Click, Enter, and Space; gamepad copy advertises A and Start; touch retains Tap.
- Made the cinematic skip prompt equally truthful: keyboard shows Enter, Space, Escape, and Click; gamepad shows A, B, and Start; touch retains Tap. All revised lines fit the authored 1280Ã—720 composition.
- Extended the existing Reduced Camera Motion treatment by making the launch-panel border steady and lowering the cinematic's single green reveal flash from 0.42 to 0.18 alpha. Existing shake and grass-sway suppression remain unchanged.
- Official input validation used Space at the gate and Enter during the cinematic, then landed on the menu with Begin the Round selected. A Settings-to-Replay route confirmed `reducedMotion: true` during the cinematic. Gate, intro, and menu samples averaged 1.18ms, 0.28â€“0.31ms, and 2.21ms of canvas work with no browser errors. Evidence is in `qa/opening-cinematic-input-polish-2026-08-02.md`.

## Secondary menu branches polish

- Replaced the placeholder-like Clock Out screen with a layered pre-dawn course, animated foreground grass, restrained environmental motes, and a centered personnel-action dossier that matches the game's established interface language.
- Kept the branch intentionally quiet while adding a story consequence: the Night Order is left unsigned and Joe's calendar remains committed.
- Added truthful input-method-aware return copy and keyboard Escape support. Reduced Camera Motion now steadies the grass and prompt pulse without hiding information.
- Synchronized the rejected Change Request reason with its authoritative status string and added keyboard Escape dismissal to match controller B.
- The official client rendered both branches with no browser error artifacts. Enter returned Clock Out to `menu`; the Change Request frame displayed `unauthorized scope in the rough.` exactly. Evidence is in `qa/secondary-menu-branches-polish-2026-08-02.md`.

## World context cue polish

- Consolidated ambient first-person labels into one urgency-based owner: imminent noise, close practice, nearest blocker, farther hazard, then the optional practice target.
- Preserved all generated art, ground rings, collision footprints, route reflectors, path lanterns, map information, and interaction behavior; only competing text plaques yield.
- Limited solid guidance to the nearest blocker and bounded its complete plaque to the left of the persistent course map.
- Removed the redundant floating practice-bell plaque. The generated bell, amber ring, and existing binding-aware bottom prompt now form one cohesive instruction.
- Deferred ambient cues during the first noise-hazard consequence and gated far shed/drain world plaques until relevant, nearby, or requested with Listening Focus.
- Exposed the active context owner, id, distance, presentation lane, and arbitration contract through `render_game_to_text`.
- Official cart, hazard-approach, and hazard-consequence routes produced no browser error artifacts and sampled 1.77–2.94ms of canvas work. A direct quiet handoff confirmed the practice prompt returned at 28.54m and closed its browser in `finally`. Evidence is in `qa/world-context-cue-polish-2026-08-02.md`.

## Distraction signal-lane polish

- Added golf-ball distraction handoffs to the ambient context arbitration. The localized Distraction marker and landing consequence now own the lane without an unrelated nearby-hazard plaque underneath.
- Continued ambient-plaque deferral through active Joe dialogue and threat captions while preserving hazard art, rings, glints, map data, and collision feedback.
- Added an eight-meter safety override so an imminent noise hazard always regains its warning. During an occupied subtitle lane, that exceptional plaque shifts laterally away from Joe and uses a restrained tether to its world prop.
- Verified ordinary hazard guidance remains in its established position when the subtitle lane is free.
- The official Shot Craft impact route preserved hedge collision feedback and produced no browser error artifact. Direct landing, dialogue, and imminent-hazard replays confirmed `active_distraction_handoff`, `joe_dialogue_lane`, and the 6.24m noise override; every browser closed in `finally`. Evidence is in `qa/distraction-signal-lane-polish-2026-08-02.md`.
- Closed 2026-08-02: the existing `mature_escape_linger.json` route still predates the 720-meter course, so the victory audit used a fresh input-only navigator that crossed the full course without state mutation or teleporting.

## Victory route-payoff polish

- Completed a fresh victory audit against the full 720-meter course through ordinary keyboard input. The input-only navigator followed the same collision-aware guidance exposed to players, opened the Drain Valve, crossed all eight zones, and completed Final Filing on its first attempt without freezing Joe, teleporting, or mutating game state.
- Promoted the route outcome from a dense metadata line to a clear `DRAIN/SHED ESCAPE FILED` payoff with a secondary variant/egress line and route-colored filing mark.
- Bounded the score-event ledger at six visible rows. Exceptional runs now retain five specific events plus an accurate overflow summary, preventing later stat rows from colliding with the escape and action regions.
- The settled drain result reached victory at 95% course progress with Joe still active in search 475 meters away, exposed all three result actions, and produced no browser/page errors. The official baseline client also completed with no error artifact and sampled 1.91ms average canvas render work.
- Final visual evidence is recorded in `qa/victory-route-payoff-polish-2026-08-02.md`. All temporary browser contexts were closed; the local 4173 server remains active.

## Zone-arrival hierarchy polish

- Removed the repeated zone title from the bottom tactical rail while the large zone-arrival card owns the center signal lane. The rail now delivers only the actionable terrain/sightline sentence, preserving the same information with a cleaner hierarchy.
- Applied the behavior from the existing zone data across all eight course regions. Power failures, pursuit feedback, hazards, filing, and any other message that is not the exact authored zone cue remain unchanged.
- Synchronized the accessibility/test contract: `message` now matches the contextual copy actually rendered on the canvas, while `messageSource` retains the complete authored cue whenever shortening is active.
- The official input route reached Audit Row at 94 meters with `zone_arrival` focus and rendered one `AUDIT ROW / HEDGE CORRIDOR` title plus `Clipped hedges create hard sight breaks.` in the bottom rail. The sampled canvas work averaged 1.71ms with no browser error artifact.
- Evidence is recorded in `qa/zone-arrival-hierarchy-polish-2026-08-02.md`. All browser contexts closed and the local 4173 server remains active.

## Status Request focus polish

- Exercised the full existing Status Request chain through ordinary keyboard input: issue, partial response, movement cancellation, restart, acknowledgment, and the separate ignore/escalation outcome.
- Made the request card the single actionable presentation owner while active. Generic Joe-state banners, bottom messages, duplicated prompts, and the locomotion label now yield without pausing movement or Joe.
- Integrated cancellation into the card as `DRAFT CANCELLED // SR-01`, with the remaining deadline and a binding-aware `RESTART UPDATE` instruction. This removes the former overlap between `RUNNING`, the request header, a top state banner, and the bottom prompt.
- Kept the text-state contract faithful to the canvas: hidden messages and prompts report null as their visible value, retain their source copy, and identify `status_request` as the deferral reason.
- Acknowledgment still completed at 100%, awarded Delivery, created the coarse rough ping, and redirected Joe. Ignoring still recorded `escalated`, created the precise sector signal, and triggered the longer search. No browser/page errors occurred.
- The required official client sampled 2.49ms average canvas render work with no error artifact. Detailed evidence is in `qa/status-request-focus-polish-2026-08-02.md`; every browser context closed and the 4173 server remains active.

## Emergency Appeal focus polish

- Replayed the complete existing Emergency Appeal branch across every eligibility blocker, all three input methods, successful moving recovery, point-blank capture, Reduced Camera Motion, and victory accounting.
- Made the ready chase card and active review card the single survival-critical presentation owner. Generic Joe banners, duplicated bottom copy, locomotion labels, barks, and threat captions now yield until the review ends.
- Deferred any active Delivery award without aging it while the appeal owns the signal lane. The award resumes with its remaining duration afterward, preserving earned score feedback without obscuring the `MOVE NOW` countdown.
- Synchronized `render_game_to_text`: hidden messages and prompts retain source copy plus an `emergency_appeal` deferral reason, and Delivery visibility reports the held state.
- The dedicated replay ended with `errors: []`; the required official client produced no error artifact and sampled 1.93ms average canvas render work. Detailed evidence is in `qa/emergency-appeal-focus-polish-2026-08-02.md`; every browser context closed and the 4173 server remains active.

## Golf aim and landing focus polish

- Made active golf-ball aiming a focused presentation state without pausing Joe or hiding the attention panel and persistent course map. The expanded onboarding dossier, route-backtrack card, ambient world plaques, stale message/prompt rail, generic controls, Joe banner/bark, and threat captions now yield during the shot decision; imminent noise within eight meters remains the safety override.
- Labeled the authoritative charge bar with a live `SHOT POWER` percentage while preserving the existing trajectory, impact/rest preview, terrain result, Shot Craft forecast, input-aware release/cancel copy, and Reduced Camera Motion behavior.
- Added a distinct landing handoff after the ball settles. The world Distraction marker, one Joe character line, and one mechanical consequence rail remain, while the generic Joe banner, expanded dossier, and redundant threat-caption stack yield until the consequence expires.
- Synchronized `render_game_to_text` with `golf_aim` / `active_distraction` focus, compact-HUD reasons, hidden Joe-state ownership, zero caption capacity during both focused moments, and explicit ambient-cue deferral.
- The Shot Craft replay passed every preview, cap, practice, commit, accessibility, and focus assertion with `noErrors: true`. Ordinary keyboard hold/steer/release consumed one ball, created one recoverable ball, redirected Joe, then returned cleanly to ordinary field presentation after the handoff.
- Required official frames sampled 2.14ms during the landing and 2.12ms after settling with no browser error artifacts. Detailed evidence is in `qa/golf-aim-and-landing-focus-polish-2026-08-02.md`; every browser context closed and the 4173 server remains active.

## Joe dialogue focus polish

- Made ordinary Joe dialogue the sole center-lane card when no higher-priority gameplay message is active. The duplicate generic Joe banner and threat-caption stack now yield while the attention panel, physical Joe label, and authored character line remain visible.
- Kept the new focus below filing, appeals, Status Requests, aiming, landing consequences, awards, pursuit, opening guidance, maneuvers, and zone arrivals so those established presentation contracts retain priority.
- Preserved the accessibility fallback: disabling dialogue subtitles prevents `joe_dialogue` focus, restores the generic Joe-state presentation and normal caption capacity, and leaves Joe's actual behavior unchanged.
- Fixed `render_game_to_text` so `joeBarkVisible` now respects the subtitle setting instead of reporting a line that the canvas correctly hid.
- Dedicated validation passed dialogue focus, subtitle-disabled fallback, bark expiration, and console checks. The required official route produced no browser error artifact and sampled 2.87ms average canvas render work. Detailed evidence is in `qa/joe-dialogue-focus-polish-2026-08-02.md`; every browser context closed and the 4173 server remains active.

## Objective interaction prompt polish

- Audited both final objective approaches and found the live `FILE RELEASE` prompt could be hidden behind a lingering Release Corridor or terrain message even though `render_game_to_text` reported the interaction correctly.
- Made ordinary in-reach field prompts own the bottom rail with a high-contrast mint `ACTION` treatment. Survival Briefing, Emergency Appeal, Status Request, golf-ball flight/roll/aim, and Final Filing retain their existing priority.
- Preserved displaced context in the accessibility contract: the visible message becomes null, its authored copy remains in `messageSource`, and `messageDeferredBy` reports `interaction_prompt`.
- Replayed shed and drain approach, in-reach, filing, seal, and victory states. Both routes displayed their correct binding-aware action, completed successfully, and retained their authored escape tableaux.
- Dedicated assertions passed both prompts, both escapes, and console checks. The required official route produced no error artifact and sampled 1.99ms average canvas render work. Detailed evidence is in `qa/objective-interaction-prompt-polish-2026-08-02.md`; every browser context closed and the 4173 server remains active.

## Delivery toast sightline polish

- Moved the repeatable Delivery score toast from the crosshair/obstacle-reading area into the open upper-center sky lane. Nearby cover, Joe, route reflectors, world interaction geometry, and the central aiming point now remain visible while points are awarded.
- Tightened Change Request pickup copy to one readable instruction: bank the +650 at an exit or use the request near Joe to force review. Award timing, scoring, pickup behavior, and the appeal mechanic remain unchanged.
- Focused replay covered Change Request collection, safe and pressure ball recovery, and Reduced Camera Motion. Every case retained `delivery_award` focus, suppressed competing state/caption cards, and produced no browser/page errors.
- The required official client completed the golf aim/landing/settle route with no error artifact and sampled 2.06ms average / 2.40ms last canvas render work. Detailed evidence is in `qa/delivery-toast-sightline-polish-2026-08-02.md`; every test browser closed and the healthy 4173 server remains available.

## Critical feedback / Delivery sequencing polish

- Sequenced Delivery presentation behind Final Filing, Emergency Appeal, Status Request, golf aim, active distraction consequences, Trail evidence, and pursuit. Earned cards wait without losing display time, then resume when the critical signal lane clears; scoring and the Delivery combo clock remain live.
- Promoted pursuit above active-distraction presentation whenever Joe escalates to chase, keeping the text-state focus aligned with the visible contact-break survival card.
- Focused Sprint Review replay covered restored-ball and full-pocket outcomes, ordinary investigation, mid-handoff escalation, already-active pursuit, both reward resumptions, and Reduced Camera Motion. All eight assertions passed with no browser/page errors.
- The required official route retained its normal Audit Row arrival hierarchy and produced no error artifact, averaging 1.69ms canvas work with a 3.20ms final frame. Detailed evidence is in `qa/critical-feedback-delivery-sequencing-polish-2026-08-02.md`; all test browsers closed and the 4173 server remains available.

## Cadence forecast signal-handoff polish

- Made the seven-second Mower Cadence route forecast own its first 2.45 seconds before the +90 Delivery card. The off-screen `JOE NEXT` compass, world/map route, attention countdown, and consequence copy now communicate the tactical reward immediately.
- Anchored the handoff to forecast time instead of mutable message copy, preventing incidental bunker or environment messages from prematurely releasing the score card.
- Held Delivery presentation does not age, while the forecast and Delivery combo clocks remain live. After the opening read, the score card resumes and the forecast compass can return for the remaining tail.
- Exact normal/reduced-motion replay passed all seven hierarchy, timing, resumption, and error assertions. The required official route retained its Audit Row presentation with no error artifact and averaged 1.70ms / 1.60ms canvas work. Evidence is in `qa/cadence-forecast-signal-handoff-polish-2026-08-02.md`; all test browsers closed and the 4173 server remains available.

## Cadence forecast context-arbitration polish

- Deferred non-urgent ambient world plaques during the focused Cadence forecast handoff, removing the competing `MAINTENANCE TOOLS / WALK WIDE` label from beneath the off-screen `JOE NEXT` compass.
- Preserved the eight-meter safety override: a five-meter noise hazard still renders, offset from the route compass and consequence rail.
- Expanded the exact replay to nine passing hierarchy, timing, ambient-deferral, imminent-safety, Reduced Motion, and error assertions.
- The required official hazard approach retained its ordinary generated prop, ring, and `noise` label at 22.89m with no error artifact, averaging 2.46ms / 1.80ms canvas work. Evidence is in `qa/cadence-forecast-context-arbitration-polish-2026-08-02.md`; all test browsers closed and the 4173 server remains available.

## Counter-Route signal-handoff polish

- Made the first 1.25 seconds of Counter-Route's 3.2-second Quiet Lane own the signal lane before its repeatable Delivery toast. The award waits without aging, then resumes while the tactical benefit is still active.
- Deferred non-urgent ambient plaques during the handoff while preserving the eight-meter safety override. Reduced Camera Motion follows the same hierarchy.
- The exact replay passed seven hierarchy, award-timing, resumption, hazard-safety, exclusion, accessibility, and browser-error assertions. Wrong-way travel and pursuit exclusion remain intact.
- Visual evidence is in `output/counter-route-validation/01-counter-route-success.png` and `04-delivery-resumed.png`; detailed evidence is in `qa/counter-route-signal-handoff-polish-2026-08-02.md`.
- The required official opening route retained its ordinary 22.89m hazard cue, averaged 2.38ms / 2.90ms canvas work, and produced no error artifact. All test browsers closed; the requested 4173 server remains available.

## Blindside signal-lane polish

- Made active Blindside Transfer defer non-urgent ambient plaques and the optional practice-bell prompt, preserving the time-critical `BLINDSIDE OPEN` instruction and mint cover lanes.
- Preserved the eight-meter noise-hazard safety override. Imminent hazard plaques now choose the side opposite the primary mint destination and retain a tether to the physical prop.
- Exact Tee, Clubhouse, and Reduced Motion Night Range replays passed eight focus, instruction, safety, completion, accessibility, and browser-error assertions. Cover geometry, scoring, cooldown, and Joe behavior remain unchanged.
- The required official opening route retained its ordinary 22.89m hazard cue, averaged 2.38ms / 2.40ms canvas work, and produced no error artifact. Evidence is in `qa/blindside-signal-lane-polish-2026-08-02.md`.
- Final cleanup stopped eight lingering official-client browser helpers, confirmed zero test-browser processes, and preserved the requested local server on port 4173.

## Crosswind signal-handoff polish

- Made Crosswind own one concise presentation sequence: the 1.35-second warning, a 1.7-second active brief, and a 1.25-second Wind Run payoff handoff. Redundant Joe-state cards, threat captions, and non-urgent ambient plaques now yield during those focused reads.
- Preserved the eight-meter safety override. The maintenance-tools warning remains grounded, tethered, and readable during Crosswind without displacing its bottom tactical instruction.
- Deferred Delivery cards wait without aging. When a zone arrival and Wind Run are earned together, the unseen zone award is preserved in the queue while the Crosswind reward presents first; already-visible score feedback is never interrupted.
- Pursuit continues to override the weather presentation and footstep masking, bunker sand remains loud, sightlines and turf tracks remain authoritative, and Reduced Camera Motion keeps identical hierarchy.
- Exact replay passed ten focus, timing, ambient-deferral, imminent-safety, reward-order, ledger, pursuit, accessibility, and browser-error assertions. The required official route produced no error artifact and sampled 2.13ms average / 1.40ms last canvas render work across 202 frames.
- Evidence is recorded in `qa/crosswind-signal-handoff-polish-2026-08-02.md`; the requested 4173 server remains available.

## Hold Your Nerve signal-handoff polish

- Made the active 1.65-second Nerve commitment own the signal lane below pursuit and mandatory actions. Listening Focus remains mechanically active, but its large dossier, unrelated interaction rail, authored message, generic Joe state/dialogue, threat captions, ambient plaques, and duplicate concealment strip now yield to the Nerve meter and Joe bearing.
- Preserved the eight-meter safety override. A nearby spilled-ball hazard remains grounded, labeled, tethered, and represented in text state during the hold.
- Added a 1.25-second completion handoff within the existing 4.4-second mint exit window. The route and `NERVE HELD` consequence present before the Delivery card; deferred score feedback waits without aging and then resumes.
- Synchronized `render_game_to_text` with `nerve_hold` focus, compact-HUD reason, hidden message/prompt source copy and deferral reasons, Delivery visibility, Joe-state ownership, and caption capacity.
- Exact normal, Reduced Motion, movement-cancel, sightline-grace, imminent-hazard, same-zone, and next-zone replays passed thirteen assertions with no browser/page errors. The required official route produced no error artifact and sampled 2.23ms average / 1.60ms last canvas render work across 227 frames.
- Evidence is recorded in `qa/nerve-hold-signal-handoff-polish-2026-08-02.md`. Suggested next refinement: audit the Cut Trace scan-to-memory handoff for the same prompt, ambient-context, and reward sequencing consistency.

## Cut Trace signal-handoff polish

- Made the 0.55-second Cut Trace scan own the presentation lane and added a dedicated progress meter with held-input, freshness, distance, and heading-read guidance. Listening Focus remains mechanically active while its large dossier and unrelated message, prompt, Joe state/dialogue, caption, ambient, and concealment lanes yield.
- Added a 1.45-second scan-to-memory handoff that pauses until Listening Focus is released. The six-second world memory and authored cut-back instruction now present before any held Delivery score card; deferred score feedback does not age.
- Preserved the eight-meter hazard safety override and synchronized `render_game_to_text` with `cut_trace` focus, compact-HUD reason, prompt/message sources and deferral reasons, presentation time, reward visibility, Joe-state ownership, and caption capacity.
- Made resolved memories relinquish Cut Trace ownership immediately, preserving the established Counter-Route Quiet Lane handoff even when a fast player crosses 12 meters before the earlier presentation timer would end.
- Exact Cut Trace replay passed thirteen scan, handoff, reward, safety, expiry, duplicate-lockout, accessibility, and error assertions. The existing Counter-Route replay also retained all seven assertions. The required official route produced no error artifact and sampled 1.83ms average / 1.60ms last canvas render work across 236 frames.
- Evidence is recorded in `qa/cut-trace-signal-handoff-polish-2026-08-02.md`. Suggested next refinement: audit the raw Listening Search Read state for the same compact-HUD and prompt-arbitration consistency when Joe is searching off-screen.

## Listening Search Read focus polish

- Made off-screen Listening Search Read own a compact tactical presentation lane. Search locus, Joe bearing/distance/trend, attention, map, terrain, and cover remain visible while the expanded dossier and competing field copy yield.
- Deferred rear navigation, the generic Joe world label, unrelated messages/prompts, Joe state/dialogue, threat captions, duplicate concealment copy, and non-urgent ambient plaques. The eight-meter noise-hazard safety override remains grounded and readable.
- Releasing Listen immediately restores the ordinary field hierarchy, while pursuit overrides Search Read with the established contact-break presentation. Closing, receding, crossing, paused Trail Check, and Reduced Camera Motion behavior remain unchanged.
- Synchronized `render_game_to_text` with `listening_search` focus, compact-HUD ownership, retained source copy, and explicit message, prompt, and rear-navigation deferral reasons.
- Exact replay passed fourteen focus, safety, transition, Reduced Motion, accessibility, and browser-error assertions. The required official route produced no error artifact and sampled 1.83ms average / 1.60ms last canvas render work across 241 frames.
- Evidence is recorded in `qa/listening-search-read-focus-polish-2026-08-02.md`. Suggested next refinement: audit Course Echo's live comparison hierarchy so its directional intelligence remains readable without masking urgent route or hazard information.

## Course Echo live-comparison polish

- Promoted Course Echo from a tiny map-only pace caption to a grounded field read with route, spatial bearing, distance, live pace, and a centered ahead/behind rail beneath the objective HUD.
- Added pace/distance copy to the spectral world marker and a restrained connecting energy trace between spectral footfalls, making the saved path read as one coherent route while preserving the map trail.
- Made the Echo comparison yield to imminent eight-meter noise hazards, required route-back guidance, pursuit, and every established higher-priority presentation focus. Reduced Camera Motion preserves identical tactical information.
- Synchronized `render_game_to_text` with rounded comparison position/distance, direction, pace delta and state, completion, on-screen and world-label visibility, field-card visibility, and explicit deferral ownership.
- Exact replay passed nine field, spatial, pace, hazard, navigation, pursuit, Reduced Motion, accessibility, and browser-error assertions. The required official route produced no error artifact and sampled 1.69ms average / 1.60ms last canvas render work across 231 frames.
- Evidence is recorded in `qa/course-echo-live-comparison-polish-2026-08-02.md`. Suggested next refinement: polish Course Echo's near-tie and record-finished payoff so the final seconds of a close personal-best chase build tension without adding another persistent HUD layer.

## Course Echo finish-tension polish

- Turned the existing Echo comparison into a bounded race arc: Dead Even at a 0.35-second split, Final Sprint inside the record's last eight seconds when pace remains competitive, and Photo Finish when both conditions overlap.
- Added a restrained standard-camera emphasis pulse while Reduced Camera Motion keeps the same state and copy with a static border. No additional persistent HUD layer was introduced.
- Added a 3.2-second Record Filed handoff with the saved target score and `REACH AN EXIT` instruction. The comparison card and nearby world-marker label then retire automatically while the map remains a quiet reference.
- Preserved imminent-hazard, rear-navigation, pursuit, and established focus priority. Expanded `render_game_to_text` with race phase, near-tie/final-sprint flags, score target, record countdown, finish age, and handoff time.
- Exact replay passed fifteen ordinary, Dead Even, Final Sprint, Photo Finish, record-handoff, retirement, hierarchy, Reduced Motion, accessibility, and browser-error assertions. The required official route produced no error artifact and sampled 1.83ms average / 1.70ms last canvas render work across 232 frames.
- Evidence is recorded in `qa/course-echo-finish-tension-polish-2026-08-02.md`. Suggested next refinement: audit the live projected-grade panel during close Echo races so score-grade changes and time pace complement each other without creating conflicting success signals.

## Course Echo score-projection polish

- Reconciled Course Echo's distance-normalized time pace with the actual score-first record rule. Close-race titles now explicitly identify `TIME`, while the same card reports the signed projected file-score delta.
- Reused the projected-grade panel's existing status line for Echo score advantage, deficit, or tied-score tie-break information. Active grade-change explanations retain priority, so the player still sees why a projection moved.
- Added exact hundredth-second precision only when projected scores tie, eliminating a case where the rounded pace read said `EVEN` while the authoritative tie-break had a winner.
- Expanded `render_game_to_text` with projected score/grade/route, signed score delta, score-first result state, and the explicitly named `projectedRecordBeating` flag. Scoring and result rules remain unchanged.
- The full replay passed eighteen assertions, including time-ahead/score-behind, time-behind/score-ahead, and equal-score tie-break cases, with no browser/page errors. The required official route produced no error artifact and sampled 2.01ms average / 2.20ms last canvas render work across 231 frames.
- Evidence is recorded in `qa/course-echo-score-projection-polish-2026-08-02.md`. Suggested next refinement: audit Course Echo's result-screen explanation so a beaten or missed record clearly attributes the outcome to score or the exact time tie-break without lengthening the result flow.

## Course Echo result-adjudication polish

- Reused the existing result-screen escape card as a prominent Course Echo verdict, avoiding a new panel or another result step. Route filing remains visible in the verdict detail.
- Added explicit score-win, score-loss, tied-score faster/slower, and exact score/time tie outcomes. The stat ledger now identifies time as Echo pace for score-decided runs and uses hundredth-second precision only for the authoritative tied-score decision.
- Preserved normal no-Echo victories, result actions, unlock/footer messaging, and Reduced Camera Motion. Scoring and record rules remain unchanged.
- Added `victoryPresentation.courseEchoAdjudication` with outcome, decision basis, score/time deltas, time relation, visible copy, and verdict color; no-Echo runs report null.
- Exact replay passed eight score-first, time-tie-break, exact-tie, Reduced Motion, no-Echo baseline, and browser-error assertions. The required official route produced no error artifact and sampled 1.74ms average / 1.20ms last canvas render work across 227 frames.
- Evidence is recorded in `qa/course-echo-result-adjudication-polish-2026-08-02.md`. Suggested next refinement: audit the Rematch File target copy after an Echo miss so the next action reflects whether the recoverable gap is score or pace, while keeping the three result actions unchanged.

## Course Echo rematch-target polish

- Made the existing Rematch File action reflect the authoritative reason an Echo held the record. Score losses show the exact score gap and retain the faster-time requirement for a tie; tied-score losses show the hundredth-second pace gap and record score; exact ties offer +1 score or at least 0.01 seconds faster.
- Carried the same structured recovery target into the reopened run so the result action, state banner, bottom message, and `render_game_to_text` target cannot drift. Echo wins and no-Echo runs keep the ordinary Performance Stamp target, capture retries keep their Incident Counterplan, and the three result actions remain unchanged.
- Exact replay passed score, pace, tie, successful-Echo, no-Echo, Reduced Motion, preserved-action, Enter-to-rematch, and browser-error assertions. Visual review covered 2560x1600, 1280x720, and 844x390; the required uninstrumented route reached Audit Row with no error artifact at 1.68ms average / 2.80ms last canvas render work.
- Evidence is recorded in `qa/course-echo-rematch-target-polish-2026-08-02.md`. Suggested next refinement: only after human rematch play, consider naming the strongest missed score source alongside the exact gap if the current recovery target still feels too abstract.

## Course Echo recovery-plan polish

- Turned a score-gap Rematch File into one actionable next play by ranking only score sources the completed run actually left available: an unbanked Change Request, missing golf balls, unused bunker baits, lost stealth score, or a faster filing pace.
- Calculated each option from the authoritative scoring rules, including the exact incremental 1.30x Overtime value, then surfaced the strongest option in the selected result card and reopened-run instruction without adding another panel.
- Kept the primary Next Action sentence concise after high-resolution review showed the first combined version was too long. The result card now carries compact evidence such as `SCORE 340 // CHANGE +650`, while the reopened run expands it to `SCORE +340 TO TIE // BANK CHANGE REQUEST +650`.
- Scoring, difficulty, Joe behavior, and result-action count are unchanged. The targeted replay passed sixteen score-source, Overtime, rematch, Reduced Motion, and error assertions; the existing eight-case score-first adjudication suite also remained green.
- Visual review covered 2560x1600, 1280x720, 844x390, and Reduced Motion. The required uninstrumented route reached Audit Row with no error artifact, averaging 1.55ms canvas work with a 1.40ms final sample across 449 rendered frames.
- Evidence is recorded in `qa/course-echo-recovery-plan-polish-2026-08-02.md`. Suggested next refinement: stop extending this result flow until a human rematch confirms the chosen advice is useful; move the next polish pass to a separate observed friction point.

## Opening movement-hierarchy polish

- Re-audited the first playable frame and found that the large HUD, bottom rail, and objective dossier repeated the locked-gate goal while the actual movement instruction remained in the smallest footer text.
- Replaced the redundant surroundings read with a short-lived `FIRST STEPS` card that names the active movement binding, points to the mint route, and reports the nearest viable objective's live distance and bearing.
- Replaced the duplicate gate-warning rail with an input-aware movement instruction. After ten meters it fades, the card returns to ordinary surroundings, and the established 18-meter compact-HUD handoff completes normally.
- Preserved controller and touch wording, Reduced Camera Motion parity, the physical route ribbon, map, objective dossier, manual control recall, threat hierarchy, scoring, and gameplay behavior.
- Focused replay passed ten opening, movement-collapse, manual-recall, controller, compact, Reduced Motion, and browser-error assertions. Visual review covered 2560x1600, 1280x720, and 844x390.
- The required uninstrumented opening and movement routes produced no error artifacts. Initial canvas work averaged 5.54ms with a 1.80ms last sample; active travel averaged 4.98ms with a 1.90ms last sample.
- Evidence is recorded in `qa/opening-movement-hierarchy-polish-2026-08-02.md`. Suggested next refinement: human-playtest the first thirty meters without referring to the map and adjust only the cue's ten-meter lifetime if players still hesitate or if it lingers after intent is clear.

## Starter-bell correction polish

- Audited the first optional golf interaction and found that a missed starter-bell shot consumed a ball and drew Joe but only said the bell remained optional, leaving the next attempt as guesswork.
- Added an impact-derived correction that can report left/right aim, more/less power, or both when the miss has meaningful error on both axes. The feedback also reports how many meters the impact landed outside the amber ring.
- Replaced the vague miss copy with one actionable consequence: the ball is marked for recovery, and the player may retry or continue. After that explanation finishes, the existing action rail preserves the correction from the actual tee position instead of losing it to the former 58-meter proximity gate.
- Carried the same correction into the aim panel, then cleared it immediately on a successful retry. Ball physics, target radius, Joe diversion, recovery, scoring, and the drill's optional skip remain unchanged.
- The exact miss-to-retry-to-success replay passed eleven correction, persistence, controller, compact, Reduced Motion, and browser-error assertions. The established golf-terrain suite also retained all fifteen assertions across fairway, mowed turf, wet turf, rough, bunker, solid bank, boundary, recovery, and Reduced Motion behavior.
- Visual review covered 2560x1600, 1280x720, and 844x390. The required uninstrumented miss produced no error artifact and averaged 1.79ms canvas work with a 2.20ms final sample across 319 frames.
- Evidence is recorded in `qa/starter-bell-correction-polish-2026-08-02.md`. Suggested next refinement: human-playtest whether the combined correction is understood on the first retry; adjust wording only, not golf physics, unless players consistently follow the instruction and still miss.

## Joe world-label occlusion polish

- High-resolution review exposed Joe's world-state label inside the depth-sorted sprite pass, where a nearer cart or hedge could slice it into stray fragments such as `JOE: C...` even when the obstacle correctly blocked the character.
- Separated the label from Joe's sprite and moved it to a bounded post-entity overlay with a restrained ground tether. Open sightlines now produce one compact, screen-safe state panel; nearer world art can no longer cut through the text.
- Made physical sight occlusion authoritative for the label. When `lineBlockedBy` identifies real cover, the entire panel and tether disappear instead of leaking Joe's mode through scenery; the attention panel and last-signal systems retain their established roles.
- Synchronized `render_game_to_text` with the visible label text, panel position and dimensions, occluding object, presentation mode, and explicit cover rule.
- Focused replay passed nine clear-sight, chase, cover, distant-patrol, compact, Reduced Motion, presentation, and browser-error assertions. Visual review covered 2560x1600, 1280x720, 844x390, and Reduced Motion.
- The required uninstrumented route reproduced the grounds-cart cover case without a clipped label or error artifact, averaging 2.03ms canvas work with a 1.60ms final sample across 198 rendered frames.
- Evidence is recorded in `qa/joe-world-label-occlusion-polish-2026-08-03.md`. Suggested next refinement: human-playtest the label's frequency during several natural pursuits and reduce its 52-meter patrol range only if it competes with route decisions; never restore through-cover information.

## Zone-event signal-merge polish

- Native opening-route review found that each course set piece could show the same event twice: once in the centered state banner and again as a full directional threat-caption card. The south-gate knock visibly repeated across the top and lower signal lanes while the player was trying to read route and cover guidance.
- Merged an exact matching threat caption into the visible state banner as a compact `SOUND LEFT/RIGHT/AHEAD/BEHIND` line. The banner and caption timers now share the same 2.8-second window, preventing a stray caption flash after the card retires.
- Preserved independent captions, the threat-caption preference, and caption-only fallback whenever the banner is unavailable. The freed threat-caption lane once again permits ambient obstacle and route guidance rather than deferring it behind an invisible duplicate.
- Centralized the state-banner visibility rule and synchronized `render_game_to_text` with banner direction, merge mode, caption-card visibility, duplicate count, and presentation ownership.
- Focused replay passed nine merge, independent-caption, fallback, preference, ambient-lane, compact, Reduced Motion, and browser-error assertions. Visual review covered 2560x1600, 1280x720, 844x390, and Reduced Motion.
- The required uninstrumented opening route produced one directional south-gate banner, zero duplicate caption cards, and no error artifact, averaging 2.98ms canvas work with a 3.00ms final sample across 208 rendered frames.
- Evidence is recorded in `qa/zone-event-signal-merge-polish-2026-08-03.md`. Suggested next refinement: observe the remaining zone set pieces during a full human route and shorten only individual banner copy that proves hard to parse while moving; retain the single-card hierarchy.

## Locomotion release-feedback polish

- The ordinary opening route ended after 22 idle frames, yet the center HUD still said `RUNNING`. The 0.42-second directional afterglow was correctly retaining the last chevrons but also retaining a full-strength locomotion label, contradicting the authoritative idle input and camera state.
- Split live locomotion from directional inertia. Running, sprint, crouch-walk, and bunker-sand labels now exist only while movement input is held; releasing input immediately removes the text while the last chevrons fade smoothly with their remaining timer and line weight.
- High-resolution review then caught active sprint text touching the nearby noise-hazard plaque. Live locomotion labels now use a protected lower slot whenever a blocker, hazard, practice, or other context card occupies the ordinary line.
- Preserved every existing movement speed, noise, terrain, camera, input-method, and Reduced Camera Motion rule. Added a synchronized text-state contract for feedback visibility, live movement, label, afterglow, direction, context displacement, and presentation phase.
- Focused replay passed ten live-run, release, full-retirement, sprint, crouch, sand, context-slot, compact, Reduced Motion, contract, and browser-error checks. Visual review covered 2560x1600, 1280x720, 844x390, and Reduced Motion.
- The required uninstrumented opening route reproduced the original 22-frame pause with `moving: false`, a faint 0.13 directional afterglow, no locomotion label, and no error artifact. Canvas rendering averaged 2.22ms with a 1.40ms final sample across 197 rendered frames.
- Evidence is recorded in `qa/locomotion-release-feedback-polish-2026-08-03.md`. Suggested next refinement: human-playtest repeated short taps and obstacle bumps; adjust only the 0.42-second chevron decay if the visual inertia feels too long or too abrupt, while keeping labels bound to live input.

## Score-handoff context polish

- Moved the audit beyond the opening into an ordinary Audit Row arrival. The mature frame stacked the +70 Delivery card, route-back bearing, zone message, and a non-imminent `MAINTENANCE TOOLS // WALK WIDE // 20m` plaque inside the hedge tunnel.
- Delivery and Risk Premium now defer ambient blocker, practice, and noise-hazard context cards unless a noise hazard is within the established eight-meter safety threshold. Route-back navigation, zone guidance, map, and authoritative world art remain visible.
- The deferred context is not consumed or aged away: once the score handoff ends, the same physical hazard becomes eligible again immediately. An imminent seven-meter tools hazard still renders during the score card.
- Reused the existing `contextCue.deferredBy` contract, so visual ownership and `render_game_to_text` report `delivery_award` or `risk_premium` without adding a new HUD layer or changing gameplay.
- Focused replay passed eight Delivery, Risk, return, imminent-safety, compact, Reduced Motion, state-contract, and browser-error checks. Visual review covered 2560x1600, 1280x720, 844x390, and Reduced Motion.
- The required uninstrumented Audit Row route reproduced the original hedge-tunnel frame with a 19.2-meter maintenance-tools hazard. The Delivery card remained visible, the ambient plaque deferred, and no error artifact appeared; canvas work averaged 1.92ms with a 1.80ms final sample across 371 rendered frames.
- Evidence is recorded in `qa/score-handoff-context-polish-2026-08-03.md`. Suggested next refinement: human-playtest consecutive queued Delivery beats through Audit Row and confirm the returning hazard plaque does not feel late; preserve the eight-meter override.

## Final Filing focus polish

- Audited the active drain filing and acceptance seal at 2560x1600, 1280x720, and 844x390. Close pursuit was rendering a second `CONTACT BREAK` / Risk panel above the dedicated filing bar, while the acceptance stamp could share its center lane with a stale Joe subtitle.
- Made Final Filing the explicit late-run presentation owner. The generic Joe-state banner and non-imminent ambient context plaques now yield to the filing panel, and close-chase telemetry yields because the filing bar already reports Joe distance and the only actionable choice: stay still or move to abort.
- Preserved Joe's taunts during the vulnerable filing hold, then silenced that subtitle only during the 0.48-second acceptance seal so the large `RELEASE AUTHORIZED` stamp lands cleanly. The eight-meter noise-hazard safety override remains intact.
- Chase presentation returns immediately after an aborted filing. No collision, pursuit, filing duration, input, scoring, route, or Joe-behavior rule changed.
- Added synchronized `hudPresentation.contactBreakVisible`, Joe-subtitle visibility during sealing, generic-banner ownership, and `contextCue.deferredBy: final_filing` diagnostics.
- Focused replay passed nine filing, dialogue, chase-return, compact, Reduced Motion, and browser-error assertions. Visual review covered active filing, close danger, acceptance sealing, compact, and Reduced Motion states.
- The required uninstrumented gameplay route produced no error artifact and remained visually coherent around the opening grounds-cart cover case, averaging 1.74ms canvas work with a 1.20ms final sample across 195 rendered frames.
- Evidence is recorded in `qa/final-filing-focus-polish-2026-08-03.md`. Suggested next refinement: human-playtest both exits under natural pursuit and adjust only the filing-panel copy or vertical placement if the hold feels unclear; preserve the single-owner hierarchy.

## Final Filing withdrawal-handoff polish

- High-resolution review of movement-abort recovery found three simultaneous reads: a top `FILING WITHDRAWN` banner, the restored contact-break meter, and a second bottom withdrawal message. The two withdrawal cards repeated the same consequence while competing with the urgent survival read.
- Removed only the duplicate generic banner. One bottom rail now combines the reason and next action—`MOVEMENT DETECTED` plus the exact Drain or Shed release to revisit—while the objective HUD, map, and contact-break meter retain their established roles.
- Preserved immediate pursuit recovery, Joe dialogue, cancellation count and reason, route availability, the 2.5-second instruction lifetime, input, collision, scoring, and all Final Filing mechanics.
- Exact replay passed nine drain, shed, pursuit, cancellation-state, compact, Reduced Motion, expiry, and browser-error assertions. Visual review covered 2560x1600, 1280x720, 844x390, and both exits.
- The required uninstrumented gameplay route produced no error artifact and retained the ordinary opening hierarchy, averaging 2.52ms canvas work with a 1.50ms final sample across 205 rendered frames.
- Evidence is recorded in `qa/final-filing-withdrawal-handoff-polish-2026-08-03.md`. Suggested next refinement: human-playtest a natural last-second filing abort and adjust only the 2.5-second rail lifetime if it obscures the resumed route longer than necessary.

## Blocker-callout reticle-clearance polish

- The published opening route exposed `SOLID // GROUNDS CART` directly beneath the always-centered `+` reticle. Because the reticle renders later, it deleted part of `CART` and made the key collision callout look like clipped or corrupt text.
- Added a bounded reticle exclusion rule to blocker-callout geometry. Only a card whose default panel would overlap the center reticle takes a 340px upper slot; off-center cards retain the established 370px slot, map clearance, world tether, and obstacle anchor.
- Preserved the reticle, obstacle art, collision footprints, cue arbitration, camera, map, route ribbon, gameplay, and Reduced Camera Motion behavior. The text-state contract now identifies blocker cues as `single_world_label_crosshair_safe`.
- Focused replay passed nine centered, off-center, high-resolution, compact, Reduced Motion, map-clearance, state-contract, and browser-error assertions. The existing score-handoff context suite retained all eight assertions.
- Visual review covered 2560x1600, 1280x720, 844x390, Reduced Motion, centered cart contact, and an off-center cart approach.
- The required uninstrumented opening route reproduced the original cart frame with the full label readable and the reticle intact, no error artifact, and 2.25ms average / 2.10ms last canvas work across 202 rendered frames.
- Evidence is recorded in `qa/blocker-callout-reticle-clearance-polish-2026-08-03.md`. Suggested next refinement: observe other centered obstacle names during natural play and adjust only the exclusion threshold if a longer label still touches the reticle; preserve off-center stability.

## Collision-contact reticle-clearance polish

- Extended the reticle-safe presentation rule from ambient obstacle approach labels to the authoritative orange impact card. A solid directly ahead could previously place the later-rendered `+` inside the `BLOCKED BY` panel even though an off-center cart contact looked correct.
- Centralized active collision-obstacle resolution and contact-card geometry. A card that would intersect the reticle now rises into a protected slot with 34px of canvas clearance while its tether still lands on the authored orange collision footprint; off-center impacts retain the original lower placement.
- Preserved the reticle, collision ellipse, escape direction, obstacle art, map, route guidance, input, collision response, sound, timers, and Reduced Camera Motion behavior.
- Added synchronized collision presentation diagnostics to `render_game_to_text`: presentation mode, whether the reticle-safe slot was needed, and measured reticle clearance.
- Focused replay passed seven centered, off-center, high-resolution, compact, Reduced Motion, state-contract, and browser-error assertions. Visual review covered 2560x1600, 1280x720, 844x390, Reduced Motion, and the natural off-center cart impact.
- The required uninstrumented collision route retained the grounded cart contact, escape instruction, reticle, and map with no error artifact. Canvas work averaged 1.90ms with a 1.70ms final sample across 233 rendered frames.
- Evidence is recorded in `qa/collision-contact-reticle-clearance-polish-2026-08-03.md`. Suggested next refinement: human-playtest repeated straight-on impacts at different depths and adjust only the protected-slot threshold if the tether feels too long; preserve its physical footprint anchor.

## Collision-recovery guidance polish

- Reproduced a sustained obstacle bump and found the ordinary forward movement chevron plus `RUNNING` label rendering after the collision card, visually contradicting `MOVE LEFT OR RIGHT AROUND` while the player remained stuck.
- Gave active collision recovery temporary ownership of the center movement cue. The blocked-input chevron and locomotion label now yield to one orange escape chevron that agrees with the `BLOCKED BY` card; normal live-input labels and the 0.42-second afterglow return when contact feedback ends.
- Replaced the former arbitrary centered choice with a five-meter viability probe against authoritative collision geometry. An off-center contact points outward; a centered contact follows the current objective-side route when both lateral lanes improve clearance; an obstructed side is never recommended.
- Kept boundary-specific instructions and added a back/forward clearance fallback for cases where neither lateral lane is viable. Collision physics, sliding, obstacle footprints, movement speed, camera motion, pathfinding, and objective selection are unchanged.
- Extended `render_game_to_text` with visible versus attempted directions, the collision override flag, presentation mode, and a separate collision-rule contract while retaining the established movement-feedback rule unchanged.
- Focused replay passed 10/10 centered, off-center, left-route, right-route, held-input, high-resolution, compact, Reduced Motion, state-contract, and browser-error assertions. The established movement release suite passed 10/10 after its impossible sand seed was moved from the physical bunker-rake center to open sand; blocker and score-handoff suites retained 9/9 and 8/8.
- The required uninstrumented collision route produced one left escape instruction and orange chevron, no false locomotion label, no error artifact, and 1.68ms average / 1.40ms last canvas work across 226 rendered frames.
- Evidence is recorded in `qa/collision-recovery-guidance-polish-2026-08-03.md`. Suggested next refinement: human-playtest repeated impacts within the hedge tunnels and adjust only the five-meter probe if a visually open lane is consistently too narrow; preserve authoritative collision ownership.

## First-person route-thread polish

- Natural collision review showed two teal route reflectors pointing left at different screen positions. They were consecutive samples of one collision-aware path, but without a visual relationship they could read as duplicated instructions.
- Joined consecutive world-route samples with a restrained dashed ground thread and dark turf underlay. Reflector chevrons, the `FOLLOW LANTERNS` label, objective target, map, path planner, and interaction logic remain unchanged.
- Kept the thread in the existing ground-navigation draw pass before physical entities. Hedges, carts, and cover therefore occlude it honestly, preserving obstacle scale and preventing guidance from floating through scenery.
- Reduced Camera Motion retains a static thread at the same contrast while ordinary presentation uses only a subtle slow alpha pulse. No path, input, collision, player, Joe, score, detection, or route-commitment rule changed.
- Added text-state diagnostics for visible thread segments, presentation mode, world-occlusion ownership, and Reduced Motion behavior while reusing one shared projected-entry calculation for visible reflector counts.
- Focused replay passed 17/17 collision, clear-ground route, high-resolution, standard, compact, Reduced Motion, route-occlusion, state-contract, and browser-error assertions. The established movement suite retained 10/10; key and valve route-commitment handoffs remained correct; all eight zone-spanning obstructed route samples remained collision-clear and reached their targets without browser errors.
- The required uninstrumented collision route reported two visible reflectors and two visible thread segments, retained honest grounds-cart occlusion, produced no error artifact, and averaged 1.87ms canvas work with a 1.50ms final sample across 235 rendered frames.
- Evidence is recorded in `qa/first-person-route-thread-polish-2026-08-03.md`. Suggested next refinement: human-playtest the thread through the most visually dense Dead Green and Release Corridor turns; adjust only contrast or dash spacing if it disappears against those surfaces, never draw it above cover.

## Collision/cover ground-cue handoff polish

- High-resolution impact review exposed two ellipses for the same grounds cart: the authoritative orange collision footprint and the ordinary mint hard-cover socket with an `IN COVER` label. The duplicated geometry made one physical object appear to have two different boundaries.
- During active contact, the matching cover socket ring and cover label now yield to the orange collision footprint and recovery card. The cart art, contact shadow, soil grounding, concealment, line-of-sight break, and hard-cover state remain active.
- The mint cover cue returns automatically after the 1.15-second contact feedback retires, and unrelated cover cues remain eligible. Collision response, obstacle geometry, Joe routing, detection, objective routing, camera, controls, and Reduced Camera Motion behavior are unchanged.
- Extended the text-state contract with `coverGroundCue.visible`, `statePreserved`, and `deferredBy: collision_contact`, making the visual handoff independently auditable without conflating it with gameplay cover state.
- Focused replay passed 19/19 centered, off-center, high-resolution, standard, compact, Reduced Motion, route-thread, cover-handoff, state-contract, and browser-error assertions. Visual review confirmed one authoritative boundary in 2560x1600, 1280x720, and 844x390 frames while ordinary clear-ground navigation remained intact.
- The required uninstrumented collision route preserved hard cover on the grounds cart while deferring only its mint ground cue, produced no error artifact, and averaged 1.93ms canvas work with a 1.40ms final sample across 231 rendered frames.
- Evidence is recorded in `qa/collision-cover-ground-cue-handoff-polish-2026-08-03.md`. Suggested next refinement: human-playtest repeated cover-edge bumps and adjust only the 1.15-second feedback lifetime if the mint cue returns too early or too late; preserve the single-boundary ownership rule.

## Nearby-cover socket hierarchy polish

- A late-route gameplay capture exposed the start hedge and grounds cart rendering simultaneous full-strength cover ellipses and separate `COVER` labels. The physical choices were valid, but the duplicated emphasis competed with the shot-correction rail, Joe dialogue, distraction marker, and first-person route.
- Ordinary shelter guidance now ranks visible nearby sockets by occupied state, footprint clearance, and distance. One primary shelter owns the full ring and `COVER`/`IN COVER` label; secondary shelters retain their dedicated art, contact shadow, soil grounding, collision, concealment, and line-of-sight behavior with a subdued unlabeled ground stroke.
- Included the maintenance shed in the same presentation ranking without changing its filing terminal, exit logic, or physical geometry. Collision contact still supersedes a matching primary cover cue under the established single-boundary rule.
- Extended `render_game_to_text` with the primary cover-cue owner, all nearby candidate IDs, suppressed count, and `one_primary_cover_socket_with_subdued_secondary_grounding` presentation contract.
- Focused replay passed 12/12 primary-owner, secondary-suppression, high-resolution, standard, compact, Reduced Motion, and browser-error checks. The established collision/route/cover suite retained all 19 assertions.
- The required uninstrumented late-route capture selected `start-hedge`, retained `service-cart` as a suppressed nearby shelter, produced no error artifact, and averaged 2.02ms canvas work with a 1.90ms final sample across 461 rendered frames.
- Evidence is recorded in `qa/nearby-cover-socket-hierarchy-polish-2026-08-03.md`. Suggested next refinement: human-playtest a dense shelter transition in Service Maze; adjust only the 11-meter presentation margin if the primary label changes too early, never remove secondary shelter mechanics.

## Starter Bell correction-focus polish

- The natural late-route replay exposed the optional Starter Bell miss rail and Joe's `A new Outcome entered the portfolio` subtitle simultaneously. The correction already reported aim, power, miss distance, ball recovery, and the next choice; the extra center subtitle competed with the short teaching moment.
- Added an explicit `practice_correction` presentation focus while a truthful `BELL MISSED` rail is active. That focus defers Joe's optional subtitle, threat captions, generic Joe-state cards, and ambient context plaques while preserving the grounded Distraction marker, attention panel, map, cover geometry, route guidance, and Joe's actual investigation behavior.
- Centralized Joe-subtitle visibility so the renderer and `render_game_to_text` now share one rule. The state contract exposes `practiceCorrectionVisible`, `joeBarkVisible`, and `joeBarkDeferredBy: practice_correction` rather than reporting a subtitle that is not drawn.
- The correction focus retires at the existing 0.75-second message threshold. Joe dialogue becomes eligible again if its timer remains, and ordinary non-practice distractions retain the established single character line; shot physics, target size, correction math, ball recovery, Joe diversion, dialogue pools, and all timers are unchanged.
- Focused replay passed 24/24 high-resolution, standard, compact, Reduced Motion, correction-retirement, ordinary-distraction, state-contract, and browser-error checks. The existing Joe-dialogue focus suite retained all four assertions, Starter Bell miss/retry/completion retained all eleven assertions, and golf terrain retained all fifteen assertions.
- The required uninstrumented late-route replay reproduced the original 16-meter compound miss with `focus: practice_correction`, `joeBarkVisible: false`, and no error artifact. Canvas rendering averaged 2.02ms with a 1.50ms final sample across 458 frames.
- Evidence is recorded in `qa/starter-bell-correction-focus-polish-2026-08-03.md`. Suggested next refinement: human-playtest the first miss without prior instructions and shorten only the correction sentence if players cannot act on it before the 4.2-second rail retires; preserve the quiet teaching lane.

## Pause modal-ownership polish

- The in-run pause audit found the frozen onboarding card, map labels, and bottom control rail still readable around `ROUND SUSPENDED`. The course context was useful, but two instruction layers competed when the player had paused specifically to review controls or choose a safe action.
- Replaced the flat 72% pause wash with a center-weighted world veil: 80% over the modal region and 90% at the HUD-heavy edges. The course silhouette, moon, and broad layout remain recognizable while live labels retire behind the modal hierarchy.
- Kept Resume Round as the safe default, preserved the contextual objective/zone/Joe/sightline dossier, and corrected the selected description to `Continue from the exact point where the audit stopped.`
- Extended `pauseSnapshot.presentation` with explicit modal ownership, retained world context, veil treatment, and center/edge alpha diagnostics. Simulation freeze, audio, selection, pointer hitboxes, Settings return target, restart, clubhouse return, and resume state are unchanged.
- Focused replay passed 20/20 high-resolution, standard, compact, Reduced Motion, frozen-state, safe-default, presentation-contract, and browser-error checks. The established pause-to-Settings-to-pause-to-resume route returned to `first_hole`, cleared the pause snapshot, retained the paused Settings target, and produced no error artifact.
- The required uninstrumented pause capture reported the 0.80/0.90 bounded veil, no browser errors, and 1.70ms final canvas work. The full resume regression averaged 3.51ms with a 1.30ms final sample across 126 rendered frames.
- Evidence is recorded in `qa/pause-modal-ownership-polish-2026-08-03.md`. Suggested next refinement: human-playtest pausing during an active chase and confirm the dimmed silhouette preserves orientation; adjust only the bounded veil values if context feels too weak, never restore readable live instruction rails behind the modal.

## Capture-aftermath polish

- Replayed the full ordinary-input Audit Row capture and preserved the established generated Joe still, dialogue portrait, Incident Review, three result actions, and cause-specific retry flow after confirming the composition remains cohesive.
- Added a restrained post-impact camera breath, clipped low ground haze, and a faint periodic review sweep to keep the upper capture tableau alive after the initial hit. Every effect is clipped above the fixed result panel; Reduced Camera Motion retains a static still and fixed haze.
- Replaced the generic selected-retry sentence with the diagnosed counterplan itself. The largest `NEXT ACTION` lane now tells the player what to change immediately, while the Retry card retains its compact cause label and the reopened run still loads the same counterplan.
- Extended `render_game_to_text` with capture-art load state, presentation hierarchy, aftermath motion policy, interface-protection contract, and the complete selected action.
- Focused validation passed 20/20 defeat, loaded-art, concrete-counterplan, high-resolution, standard, compact, Reduced Motion, and browser-error checks. The established incident-review suite still classified every failure cause, persisted repeat issues, reopened Retry with the right target, cleared the streak on victory, and reported no errors.
- The required uninstrumented capture reached a Sightline Held defeat in Audit Row at eight meters, loaded the dedicated art, promoted the exact break-sight counterplan, produced no error artifact, and averaged 0.35ms canvas work with a 0.30ms final sample.
- Evidence is recorded in `qa/capture-aftermath-polish-2026-08-03.md`. Suggested next refinement: human-playtest several natural captures and adjust only the aftermath opacity if it draws attention away from Joe's line; preserve the fixed result hierarchy and concrete retry advice.

## Chase subtitle/locomotion handoff polish

- Replayed the established organic pursuit sequence and found the centered `SPRINTING — LOUD` locomotion label drawing directly over Joe's live chase subtitle. Both systems were truthful, but the shared baseline made the two lines look corrupted at the most urgent moment.
- Gave the live Joe subtitle temporary ownership of only that text lane. Directional movement chevrons remain active, pursuit/contact-break telemetry remains fixed, and the locomotion label returns automatically if movement continues after Joe's line expires.
- Added `labelDeferredBy: joe_bark` plus a distinct `live_input_chevrons_with_label_deferred` presentation state to the movement-feedback contract. Input, movement, noise, detection, Joe dialogue timers, subtitle settings, and Reduced Camera Motion behavior are unchanged.
- Focused validation passed 20/20 live-pursuit, Joe-line, chevron-retention, label-return, high-resolution, standard, compact, Reduced Motion, and browser-error checks. The established Joe-dialogue focus suite retained all four assertions and the movement-release suite retained all ten.
- The organic input chase acquired Joe at 43 meters, reproduced the clean subtitle handoff, reached a 31-meter contact-break frame, recovered into search, and produced no browser errors. The required official client preserved the opening cart scene without an error artifact at 2.12ms average / 1.50ms last canvas work.
- Evidence is recorded in `qa/chase-subtitle-locomotion-handoff-polish-2026-08-03.md`. Suggested next refinement: observe a long natural pursuit with several barks and adjust only the subtitle timer if locomotion labels remain absent too long; preserve directional chevrons and single-lane ownership.

## Contact Break/concealment handoff polish

- The organic contact-breaking frame exposed three simultaneous center reads: `ROUGH CONCEALMENT — STAY STILL`, the Nerve panel, and the authoritative Contact Break card. The latter rendered later and obscured both smaller panels while a separate bottom action rail already supplied the correct `HOLD Q` instruction.
- Made Contact Break the sole center owner for the duration of active pursuit. The ordinary rough/hard-cover concealment label and standalone Nerve panel yield visually while concealment, crouch, focus, and Nerve mechanics continue updating unchanged.
- An armed Nerve opportunity keeps one input-aware bottom action rail. After the player commits, that rail yields and the active Nerve percentage plus configured Crouch/Listen bindings fold into a restrained second row inside the expanded Contact Break card.
- Emergency Appeal retains priority in its existing expanded chase card, and the primary Contact Break line now uses bounded fitting for long risk/direction variants. Added explicit center-ownership and `nerve_input_on_bottom_rail` / `nerve_progress_integrated` diagnostics.
- Focused validation passed 20/20 center-ownership, armed-input, active-progress, pursuit-telemetry, high-resolution, standard, compact, Reduced Motion, and browser-error checks. Existing Hold Your Nerve and Emergency Appeal suites completed successfully with no errors.
- The organic input chase reproduced a clean 40% Contact Break at 31 meters with the armed Nerve action on the bottom rail, then recovered into search. The required official client preserved the opening scene without an error artifact at 1.96ms average / 1.70ms last canvas work.
- Evidence is recorded in `qa/contact-break-concealment-handoff-polish-2026-08-03.md`. Suggested next refinement: human-playtest committing Nerve near the end of Contact Break and adjust only the integrated row height if the transition feels abrupt; preserve single-center ownership.

## Clubhouse rotation-preview polish

- Audited the resting first-run Clubhouse and found all three locked Night Order dossiers saying `REVIEW OPEN`. The cards looked actionable even though the player can only follow the career rotation until all three Change Requests are filed.
- Marked the locked board `PREVIEW ONLY // AUTHORIZATION PENDING`, promoted only the actual next order as `NEXT IN ROTATION`, and relabeled later cards `ROTATION PREVIEW`. The footer now states both the three-change unlock requirement and the interim rotation rule.
- Preserved the motivational dossier contents, next-order identity, Change Request progress, performance stamps, Shot Book, Overtime panel, Begin safe default, and every unlock condition. Fully authorized careers retain the existing orange selected dossier, Left/Right navigation, and `REVIEW OPEN` language.
- Added `portfolio.presentationMode` to the text-state contract so validation and accessibility tooling can distinguish `rotation_preview` from `interactive` without inferring it from colors.
- Focused validation passed 20/20 locked/unlocked, career-rotation, authorized-selection, high-resolution, standard, compact, Reduced Motion, and browser-error checks. Visual review covered 2560x1600, 1280x720, 844x390, and the unlocked portfolio.
- The required official web-game client completed without an error artifact at 2.07ms average / 0.60ms last canvas work across 77 rendered frames.
- Evidence is recorded in `qa/clubhouse-rotation-preview-polish-2026-08-03.md`. Suggested next refinement: human-playtest the first Clubhouse visit and confirm players understand that `BEGIN THE ROUND` starts Order 01; adjust only the preview wording if needed, preserving visible long-term progression.

## Survival Briefing ownership polish

- High-resolution and compact review found the live in-round HUD still faintly readable behind the pre-round Survival Briefing. The bottom control rail, objective dossier, attention panel, and map created a second instruction layer before play had begun.
- Moved the tutorial branch earlier in the first-hole presentation order. The course world, authored props, atmosphere, and moonlit depth still render behind the briefing, but all live tactical overlays now wait until the player dismisses it.
- Preserved the complete three-card briefing, story setup, configured bindings, keyboard movement/confirm dismissal, controller prompts, touch prompts and dismissal, Reduced Motion behavior, round recording, and expanded First Steps handoff.
- Added `hole.tutorialPresentation` diagnostics with explicit `survival_briefing` ownership, `liveHudVisible: false`, retained world context, and the shared presentation rule.
- Focused validation passed 36/36 ownership, prompt-mode, dismissal, onboarding-handoff, high-resolution, standard, compact, Reduced Motion, and browser-error checks. The established onboarding regression retained expanded, compact, manual-recall, and Listening Focus states without errors.
- The required official gameplay client dismissed the briefing, restored the onboarding HUD, moved 19 meters, and produced no error artifact at 4.71ms average / 1.70ms last canvas work across 128 rendered frames.
- Evidence is recorded in `qa/survival-briefing-ownership-polish-2026-08-03.md`. Suggested next refinement: human-playtest whether the three briefing cards can be scanned in one pause; shorten only card subdetail if necessary, preserving the single-owner handoff.

## Key Bindings footer-clearance polish

- Audited the Settings and Key Bindings branches at rest. The binding grid and workflow were sound, but the final `ARROWS SELECT / ENTER REBIND / CONFLICTS SWAP` guidance was drawn directly across the ledger's inner and outer bottom borders, making the smallest operational copy look clipped.
- Extended only the Key Bindings modal by 24 pixels, leaving the grid, status lane, reset button, return button, and every pointer hitbox fixed. The help footer now has 19 pixels of measured clearance to the inner border and uses a slightly larger, clearer treatment.
- Added `settings.bindingsPresentation` diagnostics for the protected footer, panel and border geometry, baseline, clearance, and presentation rule.
- Focused validation passed 29/29 high-resolution, standard, compact, Reduced Motion, keyboard, gamepad-copy, touch-copy, capture, conflict-swap, cancel, reset, return, and browser-error checks.
- The required official binding-ledger client produced no error artifact at 3.98ms average / 1.00ms last canvas work across 90 frames. The full official rebind-to-gameplay route retained the A/W conflict swap, updated all live control copy, dismissed onboarding, and traveled seven meters.
- Evidence is recorded in `qa/key-bindings-footer-clearance-polish-2026-08-03.md`. Suggested next refinement: human-playtest keyboard rebinding from a paused chase and confirm the taller ledger still feels connected to the suspended course; preserve the protected footer and unchanged hitboxes.

## Change Request rejection-recovery polish

- Audited the rejected Change Request branch and found that it replaced the menu description with an authoritative reason but left the generic menu/fullscreen footer in place. Escape and controller B dismissal existed but were not communicated, and touch recovery was implicit.
- Gave the rejection state temporary footer ownership. Keyboard now reads `ESC DISMISS` plus menu/confirm controls, gamepad reads `B DISMISS`, touch directs the player to another menu item, and an authorized career retains Left/Right order navigation.
- Preserved direct menu selection from the rejection state, Portfolio Override, Overtime behavior, the selected Change Request item, the reason copy, career rotation, pointer hitboxes, fullscreen, and all menu destinations.
- Added `changeRequestRejection` diagnostics for reason, footer ownership, keyboard/gamepad/touch recovery, and the single-owner presentation rule.
- Focused validation passed 33/33 high-resolution, standard, compact, Reduced Motion, keyboard dismissal, keyboard menu recovery, controller-copy, touch-recovery, locked/unlocked portfolio, and browser-error checks.
- The required official client produced no error artifact at 3.99ms average / 1.00ms last canvas work across 78 frames.
- Evidence is recorded in `qa/change-request-rejection-recovery-polish-2026-08-03.md`. Suggested next refinement: human-playtest whether the terse rejection joke lands before players dismiss it; adjust only the reason wording if needed, preserving explicit recovery controls.

## Clock Out state-parity polish

- Audited the authored Clock Out alternate ending and found a presentation-state mismatch: the frame said `SHIFT ENDED`, `OUT OF OFFICE`, and `LEFT UNSIGNED`, while `render_game_to_text` retained the old Clubhouse assignment status and exposed no ending outcome or return instruction.
- Gave Clock Out its own authoritative status and a shared input-aware return-prompt helper so the visible keyboard, controller, or touch copy and reported state cannot drift apart.
- Added `clockedOutPresentation` diagnostics for the complete outcome, consequence, active input method, visible return prompt, supported return inputs, Reduced Camera Motion state, world context, and modal ownership.
- Preserved the quiet pre-dawn composition, dossier hierarchy, input handlers, menu destination, pointer behavior, audio handoff, and every career/progression rule.
- Focused validation passed 35/35 high-resolution, standard, compact, Reduced Motion, keyboard, controller-copy, touch-copy, outcome-parity, return-handoff, and browser-error checks. Escape, Enter, Space, pointer click, and touch tap all returned cleanly to the Clubhouse.
- The required official client produced no error artifact and reported 3.01ms average / 0.60ms last canvas work across 71 rendered frames.
- Evidence is recorded in `qa/clock-out-state-parity-polish-2026-08-03.md`. Suggested next refinement: human-playtest whether this intentionally quiet branch feels like a satisfying joke ending; preserve its short runtime and single-action return lane.

## Route pressure and Vertical Pass pursuit polish

- Added seven persistent but avoidable footing hazards across alternating course lanes: Audit Thatch, Irrigation Mud, Exposed Root Mat, Service Thatch, Black Irrigation Mud, Range Root Mat, and Release Windrow.
- Thatch limits movement to 66%, mud to 54%, and roots to 70%. Each carries a material-specific movement-noise floor, while crouch and Listening Focus still provide meaningful mitigation. The player may accept the drag, route wide at full pace, or wait for Joe to turn.
- Used one rotated-ellipse contract for terrain art, physical edge stakes, approach distance, map marks, active highlighting, movement contact, and validation. All seven zone centers are traversable and all seven preserve a nearby full-speed bypass.
- Added pre-contact percentage plaques, active `FOOTING DRAG` feedback, material audio, updated Survival Briefing / How to Survive / keyboard / controller / touch language, and complete text-state telemetry.
- Added Vertical Pass awareness when an exposed player moves forward beyond Joe's mowing line. Sprinting builds the wake fastest; lateral separation, crouching, Listening Focus, rough, and hard cover reduce acquisition.
- Joe now physically creeps toward the last exposed crossing rather than learning the player's live hidden position. Awareness extends the response window and ramps his movement, preventing a simple straight sprint from permanently clearing him.
- Waiting and concealment drain the wake; sustained hard cover resolves it completely as `waited_out_under_cover`. Direct sight, sound, distractions, searches, and existing predator tactics retain priority.
- Focused validation passed 11/11 route, slowdown, wake, creep, counterplay, geometry, bypass, label-handoff, and browser-error checks. High-resolution visual validation passed 24/24 at 2560x1600, 1280x720, 844x390, and Reduced Camera Motion.
- The required official-client approach showed the Audit Thatch cue 3.05m before contact with 15.02m physical clearance, no Joe-label overlap, no browser error artifact, and 2.34ms average / 2.60ms last canvas rendering across 461 frames. Existing first-hole and vertical-chase routes remained intact.
- Evidence is recorded in `qa/route-pressure-vertical-wake-polish-2026-08-04.md`. Suggested next refinement: human-playtest both escape routes and tune only individual multipliers or awareness thresholds if one lane dominates; preserve honest geometry, full-speed bypasses, approximate wake tracking, and hard-cover waiting.

## Footing bypass guidance polish

- Audited the new footing decisions from the first-person view and found that `CROSS OR ROUTE WIDE` did not identify a viable side, pushing an urgent choice back onto the map.
- Added a local evaluator that expands candidate lanes on both sides, rejects player-padded obstacle intersections from approach through exit, and ranks remaining routes by clearance, course-edge room, Joe separation, and player distance.
- The audit caught a real geometry error at Irrigation Mud: its 36-unit horizontal radius and pond banks left no player-clear lateral route. Reduced the shared art/map/contact radius to 30, producing an honest 6.69m-clear left bypass.
- Added one amber world-space bypass thread and forward chevrons beneath physical cover, visually separate from the mint objective route. The field plaque names `FULL-SPEED BYPASS LEFT/RIGHT`; after entry it reports the recommended clear edge and distance.
- Moved the plaque into a screen-stable protected lane so active guidance cannot disappear beneath the bottom consequence rail, while retaining Joe-label displacement and higher-priority HUD ownership.
- Extended `render_game_to_text` with bypass visibility, side, validity, minimum clearance, distance, entry/exit, wait recommendation, alternative blockers, and the under-cover presentation rule.
- Range-gated scoring outside 34m and shared one evaluation between the route and plaque. The final official capture improved from 4.92ms average / 3.90ms final canvas work to 4.02ms / 2.70ms across 456 frames.
- Focused validation passed 12/12 checks, including a collision-clear recommendation for all seven active hazards. Responsive visual validation passed 28/28 at 2560x1600, 1280x720, 844x390, and Reduced Camera Motion, with no browser errors.
- The required uninstrumented replay naturally reached Audit Thatch with a valid 12.67m-clear left recommendation 24.75m from the bypass entry; amber local guidance, mint objective guidance, Joe, the map, and the noise consequence remained readable.
- Evidence is recorded in `qa/footing-bypass-guidance-polish-2026-08-04.md`. Suggested next refinement: human-playtest both exits without the map and adjust only the 34m window or widening margins if a route recommendation changes too late; preserve collision validation and one clear local choice.

## Footing material-response polish

- Gave the three established slow-footing families distinct projected contact responses instead of one generic debris burst. Thatch now bends into layered fibers and sheds straw, mud compresses into dark rims and sticky clods, and roots flex through bark-marked branch impacts.
- Connected those surfaces to restrained locomotion cadence: mud has the heaviest bounded drag, thatch produces an irregular soft pull, and roots create brief uneven impacts. The authoritative 54-70% movement multipliers and noise floors remain unchanged.
- Reduced Camera Motion preserves the static material contact read while removing the added footing lurch, camera bob, and root roll.
- Made the footing-entry explanation the temporary instruction owner. The active bypass plaque returns after that message retires, follows the selected escape edge rather than the already-passed hazard center, remains horizontally centered, and moves clear of Joe's label and the aiming reticle.
- Extended the text-state contract with active footing material, drag, response mode, all seven footfall surface variants, plaque visibility, and entry-feedback deferral.
- Focused validation passed 16/16 material, cadence, slowdown, route, wake, creep, waiting, geometry, recommendation, and browser-error checks. Responsive validation passed 36/36 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion.
- The required official uninstrumented replay preserved an honest 12.67m-clear Audit Thatch bypass, the mint objective route, Joe's grounded label, and the noise consequence with no error artifact. Canvas work averaged 2.74ms with a 2.50ms final sample across 464 rendered frames.
- Evidence is recorded in `qa/footing-material-response-polish-2026-08-04.md`. Suggested next refinement: human-playtest consecutive mud and root crossings without the map and adjust only response amplitude if the material identity is too subtle; preserve the truthful movement penalty, collision-clear bypass, and Reduced Motion contract.

## Footing recovery-handoff polish

- Audited the final edge of a slow-footing crossing and found a state contradiction: movement returned to full speed immediately, but the locked percentage banner and `SLOW FOOTING` explanation could remain visible after the player was clear.
- Added a 1.45-second recovery state that records the cleared zone and material while keeping the authoritative movement multiplier at 1.0.
- The stale slowdown banner now becomes one compact `FOOTING CLEAR // FULL PACE` confirmation, and the obsolete bottom explanation retires immediately. The normal movement label remains unchanged while its existing chevrons briefly tint mint, avoiding a second textual owner.
- Protected higher-priority events: recovery only replaces the exact banner and message produced by the cleared footing zone, so a newer danger, scoring, collision, or objective update is never overwritten.
- Extended `render_game_to_text` with recovery activity, remaining time, cleared zone, material, full-speed multiplier, presentation contract, and movement-tint state.
- Focused validation passed 17/17 material, recovery, slowdown, route, wake, creep, waiting, geometry, recommendation, and browser-error checks. Responsive validation passed 40/40 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion.
- Visual inspection confirmed a single recovery owner with no map, objective, reticle, foreground-cover, or HUD overlap. The required uninstrumented straight crossing also preserved Joe's established pressure: lingering in his sightline produced the expected Sightline Held capture instead of allowing a free sprint-through, with no error artifact.
- Evidence is recorded in `qa/footing-recovery-handoff-polish-2026-08-04.md`. Suggested next refinement: human-playtest the recovery banner during an active chase and adjust only its 1.45-second duration if it is too easy to miss; preserve single-owner messaging and danger-event priority.

## Footing recovery threat-theme polish

- Audited the full-pace handoff under active pursuit at 2560x1600, 1280x720, and 844x390. The recovery text was correct, but it inherited the state banner's chase-red fill, border, and type, visually presenting a positive movement recovery as another danger.
- Added an explicit recovery-banner predicate and mint fill, border, and text theme. Joe's objective frame, attention panel, pursuit lock, Contact Break, vignette, and every danger mechanic remain red and authoritative.
- Added `stateBannerPresentation.theme` diagnostics with `recovery_mint`, `danger_red`, and `field_amber` states so accessibility and screenshot validation no longer infer meaning from color alone.
- Focused validation passed 18/18, including the real 0.66-to-1.0 footing transition and a pursuit presentation preview. Responsive validation passed 40/40 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion.
- The required official-client smoke route dismissed onboarding, moved ten meters, preserved the first-person objective/map handoff, produced no error artifact, and completed at 8.60ms average / 1.70ms final canvas work across 92 frames.
- Evidence is recorded in `qa/footing-recovery-threat-theme-polish-2026-08-04.md`. Suggested next refinement: human-playtest recovery during a naturally acquired chase and adjust only mint luminance if it becomes hard to distinguish against a bright moonlit zone; preserve semantic color separation and pursuit priority.

## Responsive First Steps ownership polish

- Audited the first playable frame and found movement, route, and target guidance repeated across the First Steps panel, bottom instruction message, world target plaque, route label, and persistent control footer. The redundancy reduced course visibility without adding a new decision.
- Assigned one responsive instruction owner while preserving the diegetic route and permanent control footer. Standard, high-resolution, and Reduced Camera Motion presentations keep the detailed First Steps panel and defer the duplicate bottom sentence.
- At short landscape sizes up to 880 pixels wide or 460 pixels tall, the secondary left panel yields and the larger bottom rail owns the movement instruction. This preserves the more legible copy at 844x390 while revealing more of the course center.
- The onboarding movement message now retires at ten meters instead of briefly resurfacing after its primary owner collapses. The pre-round Survival Briefing no longer reports a hidden First Steps cue before dismissal.
- Added text-state diagnostics for `instructionOwner`, `compactViewport`, and `duplicateInstructionRails`, and aligned `hudExpanded`, message visibility, source, and deferral with the rendered owner.
- Responsive validation passed 48/48 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion. The established route-pressure suite retained all 18/18 material, recovery, pursuit, route, geometry, and browser-error checks.
- The required official client dismissed the briefing into a clean desktop First Steps panel at zero travel, reported no duplicate rails, kept the source message deferred by that panel, and produced no error artifact at 5.93ms average / 2.40ms final canvas work across 103 frames.
- Evidence is recorded in `qa/opening-handoff-responsive-ownership-polish-2026-08-04.md`. Suggested next refinement: human-playtest the opening on an actual landscape phone and adjust only the compact breakpoint if browser chrome changes the available height; preserve one instruction owner and the ten-meter retirement.

## Onboarding tactical-handoff polish

- Audited the exact ten-meter First Steps boundary. Desktop correctly converted the detailed card into `SURROUNDINGS`, but compact retired its large bottom instruction and immediately popped in the smaller secondary panel for the remaining onboarding grace distance.
- Kept compact onboarding on the unobstructed course view through that grace window unless the player deliberately holds Listening Focus. Desktop and high-resolution layouts retain the richer Surroundings panel.
- Added `onboardingPresentation` diagnostics for phase, owner, compact decision, secondary-panel visibility, bottom-instruction visibility, and duplicate rails. The compact hidden-panel reason is now reported explicitly rather than appearing as a generic expansion request.
- The new transition scenario exposed a separate timer leak: any tactical message triggered between ten and eighteen meters was being capped to 0.65 seconds by onboarding cleanup. Retirement now clears only the original `MOVE`/`DRAG` sentence, preserving full hazard, collision, Joe, and objective message lifetimes.
- Responsive validation passed 56/56 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion. The established focused gameplay suite retained all 18/18 route-pressure, material, recovery, pursuit, geometry, and browser-error checks.
- The required official client naturally crossed the boundary at eleven meters, reported `tactical_handoff` with the desktop `surroundings_panel`, no bottom instruction, no duplicates, and no error artifact. Canvas work measured 7.61ms average / 2.00ms final across 95 frames.
- Evidence is recorded in `qa/onboarding-tactical-handoff-polish-2026-08-04.md`. Suggested next refinement: human-playtest the first naturally encountered warning between ten and eighteen meters and tune only its authored copy if it feels too dense; preserve its full lifetime and the responsive course-view handoff.

## Late-course route-thread contrast polish

- Audited the first-person objective thread across Dead Green and Release Corridor, where the original 28-38% colored core and sparse `2 / 7` dash cadence could dissolve into dark turf, ground fog, and the late-course grade even though the map remained accurate.
- Added a sampled-zone presentation contract. Routes that touch Service Maze, Dead Green, Night Range, or Release Corridor use a 5.5-pixel dark turf underlay, a 2-pixel bounded-color core, a tighter `3 / 5` cadence, and a higher minimum reflector alpha; earlier zones retain the restrained opening treatment.
- Preserved physical truth: the route remains world projected and is still drawn before authored entities, so hedges, carts, stone, and other cover occlude it normally. No screen-space line, collision rule, pathfinding rule, map behavior, or objective selection changed.
- Extended text-state diagnostics with the active route mode, sampled zones, late-course contrast flag, dash cadence, and stroke widths.
- The established gameplay validation retained all 18/18 route-pressure, material, recovery, pursuit, geometry, and browser-error checks. Responsive visual validation passed 64/64 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion, including dedicated Dead Green and Release Corridor captures.
- The required official-client smoke preserved the opening route, first-person/map handoff, and beneath-cover presentation with no error artifact. Canvas work averaged 6.77ms with a 2.20ms final sample across 104 rendered frames.
- Evidence is recorded in `qa/late-course-route-thread-contrast-polish-2026-08-04.md`. Suggested next refinement: human-playtest both final approaches without consulting the map and adjust only late-zone alpha or dash spacing if a specific surface still swallows the thread; preserve world occlusion and the separate amber footing-bypass language.

## Footing consequence signal-ownership polish

- Audited active slow-footing captures and found three central reads competing at once: the actionable `SLOW FOOTING` escape sentence, an ambient blocker plaque such as `TOPPLED GOLF BAG`, and the objective ribbon's `FOLLOW LANTERNS` caption.
- Made the short footing-entry explanation the temporary owner of that reading lane. Non-imminent ambient blocker/practice plaques and only the objective caption defer; projected route arrows, the target bearing, map, terrain art, physical obstacles, collision feedback, and eight-meter noise warnings remain authoritative.
- Reused the existing `footingHazardEntryFeedbackActive()` lifetime so the change adds no new timer. Ordinary context plaques and the route caption return as soon as the entry explanation yields or the player clears the patch.
- Added route-caption diagnostics for visibility, deferral owner, and continued world-geometry visibility. Existing context-cue diagnostics now explicitly report `footing_entry_feedback` during the handoff.
- The established gameplay suite retained all 18/18 slowdown, response, recovery, pursuit, route, geometry, and browser-error checks. Responsive visual validation passed 72/72 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion.
- Visual inspection confirmed the active crossing loses both competing captions while retaining the route arrows and exact 66% terrain state; the recovery capture restores ordinary route-caption ownership.
- The required official uninstrumented route crossed into Audit Row and preserved the restored caption/context state before Joe's existing Sightline Held capture, with no error artifact. The final result frame averaged 0.36ms canvas work and ended at 0.40ms across 641 rendered frames.
- Evidence is recorded in `qa/footing-consequence-signal-ownership-polish-2026-08-04.md`. Suggested next refinement: human-playtest the active crossing while an eight-meter noise hazard approaches and confirm that safety override feels appropriately urgent; preserve its priority over the footing explanation.

## Sustained footing-guidance ownership polish

- Audited the slow-footing state after its opening explanation expired. The amber `CLEAR LEFT/RIGHT` plaque returned correctly, but ordinary obstacle plaques and the objective caption also became eligible while the player was still physically slowed, recreating the same central competition later in the crossing.
- Added one shared footing signal owner. `footing_entry_feedback` owns the initial explanation; `footing_hazard_guidance` then owns the remainder of the physical crossing until the authoritative terrain ellipse reports clearance.
- Ambient blocker/practice plaques and the objective caption now remain deferred through both stages. Projected objective reflectors, the amber bypass path, target bearing, map, hazard art, collision response, and movement penalty remain live.
- Audited the eight-meter noise-warning overlap at the real intersection of Audit Thatch and Maintenance Tools. An imminent untriggered noise object now temporarily defers the amber footing plaque, while its warning art and label render above both surviving route geometries.
- Reused current terrain contact, entry lifetime, and nearest-noise distance; no new timers, geometry, AI knowledge, or gameplay values were added.
- The focused gameplay suite retained all 18/18 slowdown, material, recovery, pursuit, route, geometry, and browser-error checks. Responsive visual validation passed 80/80 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion.
- Visual inspection confirmed three clean states at every viewport: entry explanation, sustained amber escape plaque, and imminent `MAINTENANCE TOOLS` safety override. Recovery restores ordinary context and objective-caption ownership.
- The required official-client smoke preserved the opening first-person handoff with no error artifact at 6.95ms average / 2.00ms final canvas work across 101 rendered frames.
- Evidence is recorded in `qa/footing-sustained-guidance-ownership-polish-2026-08-04.md`. Suggested next refinement: human-playtest a long mud crossing while Joe is close and adjust only plaque vertical placement if the local instruction competes with Joe's grounded label; preserve the full-crossing owner and imminent-noise priority.

## Footing locomotion-label truth polish

- Audited movement feedback inside an active footing patch and found a semantic contradiction: the terrain banner and camera response reported 54-70% drag while the center locomotion label could still say plain `RUNNING` or `SPRINTING`.
- Reused the established footing signal owner to defer only that generic word during both the entry explanation and sustained local guidance. Directional chevrons, held-input state, camera translation, stride cadence, surface debris, collision escape overrides, and actual movement remain unchanged.
- Kept Joe dialogue priority intact. If a bark and footing state coincide, the existing Joe-bark owner still explains the label deferral; the footing owner resumes afterward without adding another rail.
- Full-pace recovery restores the ordinary locomotion label immediately alongside the mint chevron tint and `FOOTING CLEAR // FULL PACE` banner.
- Extended responsive assertions across entry, sustained movement, imminent-noise overlap, recovery, and Reduced Camera Motion. The gameplay suite retained all 18/18 checks and visual validation passed 88/88 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Visual inspection confirmed forward chevrons remain visible with no contradictory word during drag, while the recovery frame restores `RUNNING` at a movement multiplier of 1.0.
- The required official-client smoke preserved the opening first-person handoff with no error artifact at 6.82ms average / 2.20ms final canvas work across 102 rendered frames.
- Evidence is recorded in `qa/footing-locomotion-label-truth-polish-2026-08-04.md`. Suggested next refinement: human-playtest alternating short taps along a hazard edge and adjust only chevron afterglow if direction feels sticky; preserve truthful text deferral and live-input arrows.

## Close-Joe footing pressure polish

- Audited a sustained irrigation-mud crossing with Joe visible at 28 meters. The existing plaque was geometrically clear of Joe's label and the reticle, but its quiet amber treatment did not communicate that the local route choice had become immediately dangerous.
- Reused the same compact world-space plaque: while guidance is active and visible Joe is within 36 meters, its frame shifts danger-orange and its escape line includes Joe's live rounded distance. No additional HUD card, timer, AI knowledge, route rule, or movement penalty was added.
- Centralized the visible-Joe proximity read so rendering and `render_game_to_text` share the same `route_amber`/`danger_orange` tone, close-pressure flag, and distance contract.
- The focused gameplay suite passed 18/18 slowdown, material, recovery, pursuit, route, geometry, and browser-error checks. Responsive visual validation passed 92/92 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion.
- Visual inspection confirmed the orange `CLEAR LEFT // 26m // JOE 28m` plaque remains grounded over the mud route while clearing Joe's label and the reticle at desktop and compact sizes.
- The required official-client smoke reached the eleven-meter tactical handoff with the first-person objective/map presentation intact and no browser-error artifact. Canvas work averaged 6.94ms with a 1.60ms final sample across 114 rendered frames.
- Evidence is recorded in `qa/footing-close-joe-pressure-polish-2026-08-04.md`. Suggested next refinement: human-playtest the 36-meter transition during natural patrol and tune only that threshold if urgency arrives too early or late; preserve the visible-Joe requirement, single-plaque ownership, and imminent-noise priority.

## Footing proximity-ramp polish

- Compared the same sustained mud crossing with visible Joe at 42, 29, and 23 meters. The local information was truthful, but the plaque jumped directly from quiet amber to one fixed danger-orange treatment at 36 meters and did not visually distinguish close pressure from critical pressure.
- Added a bounded proximity ramp to the existing plaque. Its frame and two text tones begin warming at 48 meters, retain the established live-distance warning at 36 meters, and reach full critical treatment at 24 meters.
- Added one restrained outer-border cadence only while close pressure is active. Its speed follows proximity without moving, resizing, or multiplying the plaque; Reduced Camera Motion preserves the same urgency as a static tone.
- Kept the honesty contract intact: the ramp requires active footing guidance and Joe's already-visible world label, so it reveals nothing through cover. Imminent noise still replaces the plaque, and no collision, slowdown, route, detection, map, or AI values changed.
- Extended `render_game_to_text` with normalized pressure amount, `quiet`/`approaching`/`close`/`critical` band, and motion treatment.
- The focused gameplay suite passed 18/18. Responsive visual validation passed 100/100 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion, including dedicated approach and critical captures.
- The required official-client smoke reached the eleven-meter tactical handoff with no duplicate instruction rails or browser-error artifact. Canvas work averaged 6.77ms with a 2.30ms final sample across 105 rendered frames.
- Evidence is recorded in `qa/footing-proximity-ramp-polish-2026-08-04.md`. Suggested next refinement: human-playtest the approach while Joe crosses the 48-to-24-meter band naturally and tune only the color-ramp endpoints or cadence amplitude if the escalation feels too subtle or too loud; preserve the 36-meter information boundary and cover honesty.

## Slow-footing correction-feedback polish

- Audited a short lateral tap inside irrigation mud at held, 120ms released, and 280ms released states. Live direction was truthful, but the ordinary 420ms chevron afterglow remained eligible long after a small correction stopped, making slow-terrain steering look stickier than the actual input.
- Added one terrain-aware release duration: marked footing uses a 260ms directional echo while ordinary terrain retains 420ms. Held input remains full-strength and immediate, and the collision escape override keeps its separate authoritative timer.
- No movement speed, acceleration, camera translation, collision, route guidance, hazard geometry, input mapping, or Reduced Camera Motion behavior changed.
- Extended `render_game_to_text` with the active afterglow duration and `quick_footing_correction`/`standard_direction_echo` presentation mode.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 112/112 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Visual inspection confirmed full-strength left feedback while held, one faint readable echo after 120ms, and no stale direction after 280ms at every tested size.
- The required official-client smoke preserved the ordinary 420ms fairway echo, reached the eleven-meter tactical handoff without duplicate instruction rails, and produced no browser-error artifact. Canvas work averaged 8.91ms with a 3.40ms final sample across 98 rendered frames.
- Evidence is recorded in `qa/slow-footing-correction-feedback-polish-2026-08-04.md`. Suggested next refinement: human-playtest alternating left/right taps across the actual mud boundary and tune only the 260ms footing echo if the handoff still feels soft; preserve live-input truth, ordinary-terrain readability, and collision-escape priority.

## Footing-boundary feedback-continuity polish

- Audited a continuous right correction that began just inside irrigation mud and reached fairway before release. The player correctly regained full pace, but feedback was reclassified from the 260ms footing echo to the 420ms ordinary echo on the last held frame, so a short correction expanded and changed opacity at the boundary.
- Latched the directional-feedback duration when each continuous movement gesture begins. The gesture now keeps its originating 260ms or 420ms contract through hold and release even if the player crosses a terrain boundary before letting go.
- Added explicit gesture-active and latched-duration state to both fresh-hole paths. A full release arms the next gesture to sample its new starting terrain; direction changes without release remain one coherent gesture.
- Preserved movement speed, full-pace recovery, camera response, collision, route guidance, input mapping, ordinary feedback timing, and the separate collision-escape override.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 124/124 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Visual inspection confirmed the right recovery chevron remains continuous at the mud edge, fades without a timing or opacity jump, and disappears by 280ms at every tested size.
- The required official-client smoke preserved the standard 420ms fairway gesture, reached the eleven-meter tactical handoff without duplicate instruction rails, and produced no browser-error artifact. Canvas work averaged 7.88ms with a 4.20ms final sample across 110 rendered frames.
- Evidence is recorded in `qa/footing-boundary-feedback-continuity-polish-2026-08-04.md`. Suggested next refinement: human-playtest one uninterrupted strafe that crosses into rather than out of marked footing and tune only whether the gesture should preserve its origin or resample after a complete release; preserve the no-mid-gesture-switch contract.

## Field-navigation edge-safety polish

- High-resolution inspection of the mud-boundary recovery exposed an off-axis `SHED KEY` marker pressed against the left course frame. Its 196-pixel card was clamped with only eight pixels of remaining canvas space, making the leading arrow and label look clipped even though their pixels technically survived.
- Added one shared world-marker placement contract based on the actual 196-pixel interactable card or 148-pixel ordinary marker width plus an 18-pixel safe gutter. Rendering and the interactable text-state ledger now consume the same x/y, width, edge direction, and inside-canvas result.
- Added an independent safety contract for the ground-reflector caption. It remains grounded to the first visible route sample but its text center clamps between an 18-pixel left gutter and the persistent map's left edge.
- Preserved world anchors, route geometry, target selection, interaction radii, map state, movement, collision, and input behavior.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 132/132 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Visual inspection confirmed complete edge arrows, labels, distances, card borders, and route captions at every tested size with no map overlap or anchor drift.
- The required official-client smoke showed the off-axis `DRAIN VALVE // 81m` card with the full 18-pixel gutter, reached the eleven-meter tactical handoff without duplicate instruction rails, and produced no browser-error artifact. Canvas work averaged 6.71ms with a 1.80ms final sample across 104 rendered frames.
- Evidence is recorded in `qa/field-navigation-edge-safety-polish-2026-08-04.md`. Suggested next refinement: human-playtest the same marker on the right edge near the persistent map and adjust only the shared gutter if it feels cramped; preserve measured card width, map separation, and world anchoring.

## Right-edge marker/map separation polish

- Exercised the matching right-side case with the `SHED KEY` projected beneath the persistent course map. The prior canvas-only clamp left the 196-pixel prompt card inside the canvas but visually attached it to the map and did not report a right-facing edge arrow.
- Extended the existing world-marker placement contract with a playable field boundary. During the hole, the right boundary is the map's left edge minus the established 18-pixel gutter; non-hole scenes continue to use the full canvas.
- Rendering now consumes the placement contract's left/right edge decision instead of independently comparing against canvas width. The arrow, exported edge direction, and actual clamped card therefore remain synchronized.
- Added text-state diagnostics for the safe region, right boundary, field containment, and map clearance while retaining the original inside-canvas result.
- Preserved world anchors, object visibility, interaction radii, target selection, route geometry, map position, movement, collision, and AI behavior.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 136/136 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Visual inspection confirmed the complete `SHED KEY // 57m ▶` card remains grounded to its projected object while clearing the map at every tested size.
- The required official uninstrumented smoke reached the tactical first-person handoff with the left-side `DRAIN VALVE // 81m` card still honoring the same contract and no browser-error artifact. Canvas work averaged 7.12ms with a 2.10ms final sample across 104 rendered frames.
- Evidence is recorded in `qa/right-edge-marker-map-separation-polish-2026-08-04.md`. Suggested next refinement: human-playtest alternating left/right targets during an active chase and tune only the shared 18-pixel gutter if either edge feels cramped; preserve measured marker width, map separation, and shared rendering/state geometry.

## World-marker label-fit polish

- Audited the shared edge-marker card after map separation and measured the actual bold Courier labels in Chromium. `MAINTENANCE SHED // 150m ▶` exceeded the protected 180-pixel text lane by 21.63px, while `DRAIN EXIT — OPEN // 150m ▶` exceeded it by 28.83px.
- Added one shared marker-label presentation contract. It composes the directional arrow, object name, and optional distance, then fits only the label type from the established 12px size down to a readable 10px floor when needed.
- Preserved the authored 196-pixel interaction card, 148-pixel ordinary marker, 18-pixel edge/map gutter, vertical placement, glyph size, world anchor, and in-reach row.
- Rendering and `render_game_to_text` now share the final label string, font size, maximum width, measured width, and inside-card result.
- The dedicated Release Corridor capture places `MAINTENANCE SHED // 81m ▶` against the map-safe right edge. It resolves to 10px and 164.64px measured width inside the 180-pixel lane; the nearby shorter `DRAIN — SEALED // 42m` remains visually subordinate and clear.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 140/140 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- The required official uninstrumented smoke retained the ordinary left-side `◀ DRAIN VALVE // 81m` label at full 12px, measured it at 161.56px inside the same lane, and produced no browser-error artifact. Canvas work averaged 7.20ms with a 2.30ms final sample across 95 rendered frames.
- Evidence is recorded in `qa/world-marker-label-fit-polish-2026-08-04.md`. Suggested next refinement: human-playtest both exits while Listening Focus is held and confirm the 10px long-label floor remains comfortably readable; preserve fixed card geometry and full-size ordinary labels.

## Navigation target commitment-margin polish

- Audited the Release Corridor with both exits available and found the nearest-target selector had no hysteresis. A small lateral correction around the weighted midpoint could flip the map header, bearing color, route ribbon, and world caption between shed and drain even though the player had not made a meaningful route decision.
- Added an 8-meter target commitment margin to the shared objective selector. Guidance begins on the nearest available objective, retains the incumbent while a challenger is less than 8 meters closer, and switches once that advantage reaches the threshold.
- The selector uses the game's authored `worldDistance` metric, including its 72% lateral weighting, rather than raw Euclidean distance.
- The margin stabilizes presentation only. Both exits remain visible, physically available, and immediately interactable; no objective locations, collision, route planning, movement, detection, or Joe behavior changed.
- Exposed the selection reason, nearest candidate, incumbent, candidate distances, live advantage, and threshold through `render_game_to_text` so map, ribbon, bearing, and automated evidence share one target truth.
- Deterministic Release Corridor validation began on the shed at x=-25, retained it after crossing to x=-33 with the drain only 2.22 meters better, then switched to the drain at x=-45 when its advantage reached 8.61 meters.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 152/152 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Visual inspection confirmed the gold `SHED EXIT` map/ribbon/caption remain synchronized through the minor cross, then all change together to teal `DRAIN EXIT` after the decisive move. Clean test captures invalidate the minimap cache and clear prior dialogue so no stale rail obscures the handoff.
- The required official uninstrumented smoke preserved ordinary opening guidance on `DRAIN VALVE`, reported `current_is_nearest`, and produced no browser-error artifact. Canvas work averaged 7.21ms with a 2.40ms final sample across 91 rendered frames.
- Evidence is recorded in `qa/navigation-target-commitment-margin-polish-2026-08-04.md`. Suggested next refinement: human-playtest the final midpoint while sprinting and tune only the 8-meter margin if the handoff feels too sticky or too eager; preserve synchronized presentation and direct access to either exit.

## World-marker route-hierarchy polish

- Audited the stabilized dual-exit state and found both exit cards still used nearly equal frame weight and opacity. The alternative marker could compete visually with the selected map target and ground-reflector route even though selection itself no longer flickered.
- Added one shared marker-guidance presentation contract for the key, valve, shed, and drain. The selected route keeps full opacity, gains a static two-pixel top rail, and receives a one-pixel frame boost.
- Alternate route markers retain their complete glyph, name, distance, card, ground ring, and interaction at 72% emphasis. Entering an alternate target's interaction radius restores full opacity and the top rail so a direct player choice always takes priority over recommendation.
- Context markers such as Change Requests and distractions retain their existing presentation and never inherit route dimming.
- Passed stable target IDs through both off-axis interactable markers and the two exit markers; `render_game_to_text` now reports `selected_route`, `alternate_route`, or `context`, plus opacity, frame boost, rail, and interaction override.
- Preserved the 8-meter commitment margin, target availability, world positions, card dimensions, label fitting, map clearance, route geometry, collision, movement, AI, and Reduced Camera Motion behavior. The hierarchy is static and adds no animation.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 156/156 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Visual inspection confirmed the gold shed card leads while shed guidance is committed, then the teal drain card takes the stronger rail/frame after the decisive switch; the unselected card remains readable at every tested size.
- The required official uninstrumented smoke showed the opening `DRAIN VALVE` as `selected_route` with full opacity and top rail while the off-screen `SHED KEY` remained an available 72% alternate. No browser-error artifact was produced. Canvas work averaged 8.52ms with a 4.20ms final sample across 94 rendered frames.
- Evidence is recorded in `qa/world-marker-route-hierarchy-polish-2026-08-04.md`. Suggested next refinement: human-playtest deliberately ignoring the reflector route and walking into the alternate exit; tune only the 72% emphasis if the option feels too quiet, preserving the full in-reach override.

## Centered-interactable route-hierarchy polish

- Audited the selected key and valve as they crossed from an off-axis edge card into the centered first-person view. Exported state already named the selected route correctly, but the centered information panel still used the older equal-weight frame and did not carry the selected top rail.
- Extended the existing shared route-presentation contract into the centered interactable panel. Selected and in-reach targets now receive the same static two-pixel top rail and one-pixel frame boost used by edge cards; alternate centered panels inherit the established 72% emphasis until the player enters interaction range.
- Scoped the treatment to the floating information panel. Dedicated image-generated key/valve art, ground anchors, interaction rings, world position, label content, and reach behavior remain full-strength and unchanged, so route hierarchy never makes a usable prop disappear into the course.
- Preserved the 8-meter commitment margin, objective availability, route geometry, map state, collision, movement, Joe AI, input, and Reduced Camera Motion behavior.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 160/160 and confirmed the centered `SHED KEY` as visible, non-edge, and `selected_route` with full opacity, frame boost, and top rail at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion. Direct inspection confirmed readable framing and no new panel, map, reticle, or prop overlap at all four sizes.
- The required official-client smoke preserved ordinary opening guidance on `DRAIN VALVE`, reported `current_is_nearest`, exported full selected-route emphasis, and produced no browser-error artifact. Canvas work averaged 9.35ms with a 4.00ms final sample across 94 rendered frames.
- Evidence is recorded in `qa/centered-interactable-route-hierarchy-polish-2026-08-04.md`. Suggested next refinement: human-playtest walking laterally across the edge-to-center transition and tune only panel emphasis if the handoff feels abrupt; preserve full-strength prop art, static Reduced Motion behavior, and direct access to the alternate route.

## Interactable marker morph polish

- Exercised the selected shed key laterally across the left HUD-safe boundary. The prior presentation changed from a 196-pixel protected edge card to the centered prop and panel on one frame, producing a visible jump even though target selection, map bearing, and world position remained stable.
- Added one 48-pixel projection-driven handoff for key and valve props. It begins only after the object clears the HUD/map safety boundary and completes before the ordinary centered presentation takes ownership.
- Replaced the initial two-card crossfade after visual inspection exposed ghosted duplicate labels, then rejected a staggered dissolve because its midpoint became too quiet. The final implementation renders one continuously legible morph panel whose position, width, height, label size, frame weight, and selected-route top rail interpolate from edge-card geometry into centered-panel geometry.
- The edge glyph fades into the dedicated image-generated prop art across the same spatial progress. The interaction ring remains fully visible and authoritative throughout; no objective availability, reach radius, route selection, map state, collision, movement, Joe AI, or input behavior changed.
- `render_game_to_text` now reports `edge`, `handoff`, or `centered`, plus the active panel owner, prop alpha, normalized blend progress, current HUD-safety clearance, and 48-pixel transition width for key and valve props only.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 172/172 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including deterministic edge, midpoint, and centered captures in every configuration.
- Direct inspection confirmed one readable `SHED KEY` label, continuous selected-route framing, a visible prop handoff, and no HUD, map, reticle, or neighboring-object collision at every tested size. Reduced Camera Motion uses the same position-derived state without time-driven motion.
- The required official-client smoke preserved the opening selected `DRAIN VALVE` edge card, map bearing, movement handoff, and route hierarchy with no browser-error artifact. Canvas work averaged 7.33ms with a 2.00ms final sample across 103 rendered frames.
- Evidence is recorded in `qa/interactable-marker-morph-polish-2026-08-04.md`. Suggested next refinement: human-playtest repeated short left/right corrections directly on the handoff boundary and tune only the 48-pixel span if the morph feels too fast or sticky; preserve the single-panel owner, stable ground ring, and world-projection truth.

## HUD-footprint marker protection polish

- Re-ran the key handoff with the expanded 430-pixel `SURROUNDINGS` panel forced visible. The morph itself was smooth, but its safety threshold still measured only the projected object anchor; a partially transitioned card could therefore extend back underneath the HUD.
- Replaced anchor-only clearance with full-card clearance. The 196-pixel edge card now stays in the lower protected lane until its complete left edge clears the secondary HUD plus the existing 18-pixel gutter. The centered/in-reach maximum width is included in the matching right-side course-map boundary.
- Kept the existing 48-pixel spatial morph after the footprint clears. Its geometry, single label owner, prop fade, selected-route hierarchy, interaction ring, and Reduced Camera Motion behavior are unchanged.
- Expanded the measured-width lane rule to ordinary 148-pixel context markers. The nearby `CR-017` card now moves below `SURROUNDINGS` instead of rendering underneath it, while retaining its context styling and world anchor.
- `render_game_to_text` now reports the active protected lane and the 484-to-988 safe panel region for key and valve presentations. The expanded-HUD validation derives the morph's live width from its normalized progress and confirms its full left edge stays inside that region.
- No objective availability, interaction radius, target selection, route geometry, map state, collision, movement, camera response, Joe AI, input, or scoring behavior changed.
- Focused gameplay validation passed 18/18. Expanded-HUD responsive validation passed 176/176 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including protected edge, morph midpoint, centered prop, and nearby context-card assertions in every configuration.
- Direct inspection confirmed the edge card clears the bottom of `SURROUNDINGS`, the midpoint and centered panel clear its right edge, `CR-017` occupies the lower context lane, and no marker collides with the map, reticle, or neighboring label at any tested size.
- The required official-client smoke preserved the selected opening `DRAIN VALVE`, its left protected lane, map bearing, route hierarchy, and movement handoff with no browser-error artifact. Canvas work averaged 7.09ms with a 2.00ms final sample across 105 rendered frames.
- Evidence is recorded in `qa/hud-footprint-marker-protection-polish-2026-08-04.md`. Suggested next refinement: human-playtest manual HUD expansion while a key, valve, and Change Request share the left field edge; tune only the shared 18-pixel gutter if the grouping feels too loose or cramped, preserving measured widths and exclusive information ownership.

## Right map-side handoff continuity polish

- Audited the symmetric selected-key handoff beside the persistent course map. Its full marker footprint and map clearance were already correct, but the right-facing edge glyph disappeared immediately when the 48-pixel morph began, before the generated prop was visually strong enough to replace that bearing.
- Added one presentation-only right `directionCue` to the shared handoff state. It remains strong during the early morph, then fades smoothly through the first 55% of spatial progress as the projected prop takes over.
- Kept one label and one panel owner throughout. The arrow follows the live morph panel rather than becoming a second card, and `render_game_to_text` exports its direction and alpha from the same state used by rendering.
- Preserved the 484-to-988 safe panel region, complete interpolated card footprint, 48-pixel transition, generated prop art, ground interaction ring, selected-route hierarchy, map bearing, target selection, interaction, collision, movement, Joe AI, input, and Reduced Camera Motion behavior.
- Focused gameplay validation passed 18/18. Expanded-HUD responsive validation passed 192/192 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including right protected-edge, early-handoff, midpoint-handoff, and centered-prop states in every configuration.
- Direct inspection confirmed the right arrow remains readable while the prop is faint, is nearly retired by the midpoint, and never competes with the single `SHED KEY` label. Every interpolated panel remains fully left of the course map with no HUD, reticle, or neighboring-marker collision.
- The required official-client smoke preserved ordinary opening guidance, the selected `DRAIN VALVE` protected lane, map bearing, and movement handoff with no browser-error artifact. Canvas work averaged 7.04ms with a 2.00ms final sample across 104 rendered frames.
- Evidence is recorded in `qa/right-map-side-handoff-continuity-polish-2026-08-04.md`. Suggested next refinement: human-playtest rapid lateral corrections beside the course map and tune only the 55% directional-cue fade window if necessary; preserve single-panel ownership, complete footprint protection, and world-projection truth.

## Interactable approach-readiness polish

- Audited rapid lateral corrections at the map-side handoff and confirmed its edge-to-morph and morph-to-centered boundaries were already continuous. Preserved that geometry and moved to the more visible remaining gap: usable props had only distant and in-reach ground-ring states.
- Added one presentation-only readiness curve beginning at 2.25 times each prop's authoritative interaction radius. The existing projected ellipse gradually brightens and tightens while four restrained cardinal ticks emerge, communicating the final approach without another text card.
- Crossing the real interaction radius remains authoritative. The ticks retire into the established solid gold ring and input-aware `IN REACH` prompt, so the player receives one clear actionable owner rather than overlapping approach and ready signals.
- Reduced Camera Motion keeps the distance information as static geometry without ambient pulsing. `render_game_to_text` reports the shared zero-to-one readiness plus `far`, `approaching`, `near`, or `ready` from the same radius and distance truth.
- Preserved all interaction radii, availability, generated prop art, route selection, map state, collision, movement, camera behavior, Joe AI, scoring, audio, and input behavior.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 208/208 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including deterministic far, approaching, near, and ready captures in every configuration.
- Direct inspection confirmed the approach geometry remains attached to the real ground footprint, survives course fog and textured turf, stays subordinate to world/context cards, and retires cleanly when the solid ready ring and prompt take ownership.
- The required official-client smoke preserved ordinary opening navigation and produced no browser-error artifact. Canvas work averaged 8.05ms with a 1.70ms final sample across 92 rendered frames.
- Evidence is recorded in `qa/interactable-approach-readiness-polish-2026-08-04.md`. Suggested next refinement: human-playtest the valve and both exits at sprint speed and tune only the 2.25-radius outer threshold if necessary; preserve the authoritative inner radius, single ready prompt, and projected-footprint geometry.

## Interactable context-ownership polish

- Reviewed the new near and ready captures and found the nearest ambient noise plaque could sit directly beneath the key panel. Both cards were truthful, but their similar weight weakened the interaction hierarchy at the moment the player needed to act.
- Added one shared context owner for the key, valve, Change Request, maintenance shed, and drain exit. At the established 0.78 `near` readiness threshold, non-urgent ambient plaques yield to `interactable_approach`; inside the real radius they yield to `interactable_action`.
- Preserved the hazard itself. Noise objects, blocker art, practice art, projected footprints, ground warnings, map state, and HUD awareness remain visible even when their optional field plaque yields.
- Kept urgent and tactical signals ahead of the new owner. Active footing guidance, aiming, distraction/horror handoffs, Joe dialogue, threat captions, and existing focused lanes remain authoritative; any noise hazard within eight meters explicitly interrupts interaction ownership and restores its tethered plaque.
- `render_game_to_text` reports the deferral owner plus the owning interactable's ID, distance, and readiness. No hazard trigger, interaction radius, availability, movement, collision, detection, Joe AI, route selection, scoring, audio, or input behavior changed.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 212/212 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including early approach, near ownership, ready ownership, and imminent-hazard override states in every configuration.
- Direct inspection confirmed the near and ready key views now have one clean actionable hierarchy, while the forced five-meter noise case restores a separated tethered hazard plaque without covering the key panel.
- The required official-client smoke preserved ordinary opening navigation and produced no browser-error artifact. Canvas work averaged 6.70ms with a 1.90ms final sample across 108 rendered frames.
- Evidence is recorded in `qa/interactable-context-ownership-polish-2026-08-04.md`. Suggested next refinement: human-playtest collecting the key during natural Joe pressure and tune only existing panel threat emphasis if necessary; preserve the eight-meter hazard override and single local context owner.

## Interactable action-owner polish

- Exercised the in-reach key state through a live update rather than a static placement and confirmed duplicate binding copy: the grounded panel said generic `ENTER USE` while the bottom rail simultaneously named the precise `ENTER — TAKE SHED KEY` action.
- Added one reach-presentation contract shared by centered props, handoff panels, and edge/world markers. When the bottom rail is available, it exclusively owns the binding and exact action verb; the local panel remains spatially grounded as `IN REACH`.
- Initial visual inspection caught the centered reticle covering the shortened status. Moved `IN REACH` into a measured 12-pixel left inset inside the existing panel, preserving the target-centered crosshair and avoiding a new card or connector.
- Preserved input resilience: if another presentation removes the bottom action rail, the local panel automatically restores its keyboard, gamepad, or touch `USE` binding as a fallback.
- `render_game_to_text` reports local text, role, alignment, inset, binding owner, and action text. No interaction radius, availability, action ordering, input mapping, route state, movement, collision, detection, Joe AI, scoring, audio, or hazard priority changed.
- Focused gameplay validation passed 18/18. Responsive visual validation passed 216/216 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including live action-owner and no-rail fallback assertions in every configuration.
- Direct inspection confirmed the world status and bottom action rail now have distinct jobs, the reticle no longer covers readiness copy, compact text remains legible, and Reduced Motion retains the same static hierarchy.
- The required official-client smoke preserved ordinary opening navigation and produced no browser-error artifact. Canvas work averaged 7.14ms with a 1.90ms final sample across 106 rendered frames.
- Evidence is recorded in `qa/interactable-action-owner-polish-2026-08-04.md`. Suggested next refinement: human-playtest taking the key and immediately moving away and tune only readiness-panel retirement if it feels abrupt; preserve the single exact-action owner and immediate gameplay result.

## Interactable completion-handoff polish

- Exercised the key through a live ready state, the exact post-interaction render before another simulation update, and the following settled tick. The key disappeared immediately, but its old action prompt and navigation selection previously depended on that later update to retire.
- Added one shared completion handoff for the shed key, drain valve, optional Change Request, and golf-ball recovery. It clears the completed prompt atomically; route-changing key and valve actions also refresh navigation and invalidate the minimap cache immediately.
- Taking the key now removes the usable marker, changes the objective ledger to `RETURN TO SHED AND FILE RELEASE`, presents `KEY ACQUIRED`, and points the grounded route plus map at `SHED EXIT` in one coherent state. The following tick preserves that result without a stale prompt or route pop.
- Preserved all interaction radii, action ordering, generated prop and course art, input mapping, movement, collision, detection, Joe AI, scoring, audio, and hazard priority.
- Focused gameplay validation passed 18/18. Responsive visual/state validation passed 228/228 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including ready, immediate-completion, and settled assertions in every configuration.
- Direct inspection confirmed the key prompt and art retire together, the confirmation and next objective remain readable, compact presentation stays clear, and Reduced Motion retains the same static hierarchy.
- The required official-client smoke preserved the uninstrumented opening and selected drain-valve route with no browser-error artifact. Canvas work averaged 5.86ms with a 1.80ms final sample across 107 rendered frames.
- Evidence is recorded in `qa/interactable-completion-handoff-polish-2026-08-04.md`. Suggested next refinement: human-playtest rejection feedback at the locked shed and sealed drain; preserve the atomic successful-action handoff and authoritative retry state.

## Interaction rejection-handoff polish

- Exercised the locked maintenance shed and sealed drain through live ready, rejected, and restored-retry phases. Their failure messages were authored correctly, but the still-valid interaction prompt immediately reclaimed the bottom rail and hid the explanation.
- Added one shared 2.35-second rejection handoff. The bottom rail presents a high-contrast `BLOCKED` reason while the grounded target marker changes to `LOCKED` or `SEALED`, keeping the consequence attached to the attempted exit.
- Preserved the exact input-aware action as deferred state. When the rejection retires, the correct shed or drain prompt returns automatically without requiring the player to leave and re-enter the interaction radius.
- Successful field interactions clear any rejection state atomically. `render_game_to_text` reports the rejected target, local state, remaining time, presentation owners, deferred prompt source, and automatic retry contract.
- Preserved all interaction radii, exit availability, action ordering, objective routes, map behavior, generated course and target art, movement, collision, detection, Joe AI, scoring, audio, and hazard priority.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 252/252 and covers both exits in ready, blocked, and retry phases at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed the orange explanation is legible at high resolution and compact size, while the target, objective HUD, course context, and persistent map remain visible.
- The required official-client smoke preserved the uninstrumented opening, selected drain-valve route, first-steps guidance, map, and generated course art with no browser-error artifact. Canvas work averaged 8.23ms with a 4.80ms final sample across 95 rendered frames.
- Evidence is recorded in `qa/interaction-rejection-handoff-polish-2026-08-04.md`. Suggested next refinement: human-playtest rapid repeated attempts during close pursuit and tune only the rejection duration if necessary; preserve the local blocked state and automatic retry restoration.

## Interaction rejection pressure-release polish

- Exercised rapid repeated Use attempts at the locked maintenance shed and sealed drain. Each press previously restarted the complete 2.35-second explanation and replayed the rattle, allowing panic input to prolong blocked feedback indefinitely.
- Latched the first rejection for its existing presentation window. Further attempts on the same target are absorbed without extending the timer or replaying audio; the text-state contract reports their count and the non-extension policy.
- Grounded rejection feedback now releases when the player retreats beyond 1.35 times the target interaction radius. The boundary uses authoritative weighted world distance, keeps a generous anti-flicker pad, and clears only the matching rejection message.
- Re-entering the footprint restores the exact input-aware action prompt. A later deliberate attempt rearms one fresh rejection, and successful field actions retain their atomic completion handoff.
- Preserved all interaction radii, exit availability, objective routes, map behavior, movement, collision, detection, Joe AI, scoring, generated course and target art, and hazard priority.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 284/284 and covers both exits in ready, blocked, repeat-latched, retreated, re-entered, rearmed, and timed-retry states at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed the repeated attempt retains one readable orange consequence rail, while retreat immediately returns the unobstructed course, persistent map, objectives, and chase presentation.
- The required official-client smoke preserved the uninstrumented opening, selected drain-valve route, first-steps handoff, persistent map, generated course art, and input behavior with no browser-error artifact. Canvas work averaged 6.19ms with a 4.00ms final sample across 107 rendered frames.
- Evidence is recorded in `qa/interaction-rejection-pressure-release-polish-2026-08-04.md`. Suggested next refinement: human-playtest a natural Joe chase through both exit footprints and tune only the 1.35-radius retreat padding if necessary; preserve the latched first attempt and exact prompt restoration.

## World-marker bottom-rail clearance polish

- High-resolution inspection exposed a close-perspective layout defect at both exits. The fixed 51-pixel card ended near logical y=637, its `IN REACH`, `LOCKED`, or `SEALED` baseline landed around y=640 outside the frame, and the bottom action/consequence rail began at y=608.
- Added one shared scale-aware world-marker panel measurement. Its frame now encloses the complete local status row at every projected scale.
- When the bottom action or rejection rail owns the exact verb or consequence, the grounded card lifts only enough to preserve the existing 18-pixel gutter. Distant markers and local-binding fallbacks keep their original position.
- The target ring, world anchor, glyph, label, authored exit art, and generated course composition remain grounded and unchanged. Rendering and text state share panel top, bottom, scale, lift, owner, local-text containment, and rail-clearance truth.
- Preserved all interaction radii, exit availability, prompt ordering, pressure-release behavior, objective routes, map behavior, movement, collision, detection, Joe AI, scoring, audio, and art assets.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 292/292 across isolated layouts and covers ready/action and blocked/rejection ownership for both exits at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed `IN REACH` and `LOCKED` remain fully inside their grounded card, the bottom rail retains a separate job, and the full 18-pixel gap survives high-resolution scaling.
- The required official-client smoke preserved the uninstrumented opening, selected drain-valve route, first-steps handoff, persistent map, generated course art, and input behavior with no browser-error artifact. Canvas work averaged 6.27ms with a 2.00ms final sample across 100 rendered frames.
- Evidence is recorded in `qa/world-marker-bottom-rail-clearance-polish-2026-08-04.md`. Suggested next refinement: human-playtest the exit approach while alternating ordinary movement and Listening Focus and tune only the vertical gutter if necessary; preserve complete local-text containment and exclusive owners.

## World-marker approach-clearance continuity polish

- Audited the corrected close exit card across the interaction boundary. Its final layout was clear, but the complete roughly 58-pixel lift began on the same frame that introduced the bottom action rail and local status, producing a visible vertical pop during small lateral corrections.
- Reused the existing interaction-readiness curve to pre-clear the card progressively after the established 0.78 `near` threshold. The lift is derived from live world distance and reaches the final safe y before the action rail appears.
- Kept the approach card compact. Crossing the real interaction radius expands the framed local-status row downward into the reserved gap rather than moving the card again; blocked feedback inherits the identical final position.
- Reduced Camera Motion retains the same position-driven geometry without ambient animation. Rendering and text state share readiness, lift progress, raw and target y, actual lift, reserve reason, and clearance truth.
- Preserved all interaction radii, readiness thresholds, exit availability, prompt timing, objective routes, map behavior, movement, collision, detection, Joe AI, scoring, audio, and art assets.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 300/300 across isolated layouts and covers mid approach, near edge, ready/action, and blocked/rejection states for both exits at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed a measured partial lift at mid approach, near-final placement immediately outside the radius, and no vertical jump when the bottom rail and framed local status appear.
- The required official-client smoke preserved the uninstrumented opening, selected drain-valve route, first-steps handoff, persistent map, generated course art, and input behavior with no browser-error artifact. Canvas work averaged 6.03ms with a 1.60ms final sample across 120 rendered frames.
- Evidence is recorded in `qa/world-marker-approach-clearance-continuity-polish-2026-08-04.md`. Suggested next refinement: human-playtest alternating lateral taps at the final boundary and tune only the 0.78 pre-clear threshold if necessary; preserve authoritative reach and the final 18-pixel gap.

## Cover-ground label truth polish

- Audited the ground socket beneath the locked maintenance shed and found its proximity-derived `IN COVER` copy could contradict the authoritative environment state, which still reported `hardCover: false`. The same low-priority label also competed with the exact action or blocked-result rail at the bottom of the view.
- Centralized the shed cover target and added one shared label-presentation contract. `CONCEALED` is now reserved for an occupied socket whose authoritative hard-cover blocker matches the shelter, `AT COVER` truthfully reports socket occupancy without concealment, and `COVER` remains the approach state.
- The small ground label now yields to collision contact, the exact action rail, or the blocked-result rail. If the projected socket leaves the playable field, its text defers instead of clipping against the canvas edge; the cover ring, soil treatment, shelter art, collision footprint, and state remain present.
- Rendering and `render_game_to_text` consume the same target, projected point, ownership, screen-safety, occupancy, concealment, role, and deferral result. No cover radius, hard-cover test, collision, interaction, prompt timing, route state, map behavior, movement, detection, Joe AI, scoring, audio, or art asset changed.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 308/308 across isolated layouts and covers ready/action, blocked/rejection, and retreated states for both exits at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed the blocked rail has exclusive explanatory ownership, the grounded cover geometry remains readable, and retreat neither claims false concealment nor paints clipped offscreen text. Compact and high-resolution compositions retain clear course and map navigation.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 6.28ms with a 1.90ms final sample across 107 rendered frames.
- Evidence is recorded in `qa/cover-ground-label-truth-polish-2026-08-04.md`. Suggested next refinement: human-playtest natural entry and exit angles around the shed and solid shelters; preserve authoritative concealment truth, exclusive interaction ownership, and the always-visible physical cover geometry.

## Compound-cover visual truth polish

- Exercised natural exposed and blocked sightline angles at the maintenance shed. Its socket was already presented as one shelter, but authoritative cover resolves against the two invisible collision/sight members (`shed-left-wall` and `shed-right-wall`), so the synthetic `maintenance-shed` cue could never recognize genuine wall concealment.
- Added explicit compound blocker ownership to the shared shed target. The local cue now treats either authored shed wall as the same visual shelter while leaving the actual sightline resolver, hard-cover calculation, collision footprints, and wall geometry unchanged.
- Gave the existing ground ring restrained state language: solid mint means the matching shelter is genuinely blocking Joe, muted segmented sage means the player occupies the socket but remains exposed, and a light dotted ring marks approach. `CONCEALED`, `AT COVER`, and `COVER` use the same shared state.
- Rendering and `render_game_to_text` now expose the ring role, pattern, authoritative blocker, and blocker match from the same presentation contract. Compound association changes presentation truth only; no concealment, collision, interaction, route, movement, detection, Joe AI, scoring, audio, map, or art behavior changed.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 312/312 across isolated layouts and includes both an exposed occupied socket and a true shed-wall sightline block at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed that the segmented and solid rings remain distinct against final-corridor soil and fog at high resolution and compact scale, while the exit card, interaction footprint, persistent map, and maintenance-shed art retain their established hierarchy.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 6.25ms with a 2.50ms final sample across 102 rendered frames.
- Evidence is recorded in `qa/compound-cover-visual-truth-polish-2026-08-04.md`. Suggested next refinement: human-playtest the solid-to-segmented transition while Joe crosses behind the shed; tune only presentation contrast if necessary and preserve the authoritative blocker relationship.

## Cover-ring transition continuity polish

- Audited the exposed-to-concealed switch at the compound maintenance shed. The state and new ring language were correct, but a single-frame replacement between segmented sage and solid mint made Joe grazing a wall edge read like visual flicker.
- Added a 160-millisecond presentation-only handoff. The newly authoritative ring and `CONCEALED` or `AT COVER` label appear on the first correct frame; the previous pattern remains only as a faint retiring afterimage beneath it.
- The handoff is owner-aware, resets instead of smearing between different shelters, and becomes fully settled after its bounded interval. Reduced Camera Motion skips the crossfade and switches instantly while preserving the same authoritative state.
- Rendering and `render_game_to_text` share the previous ring role, eased progress, duration, and `authoritative_crossfade`, `settled`, or `instant_reduced_motion` mode. No sightline, hard-cover, collision, interaction, detection, route, movement, Joe AI, scoring, audio, map, label timing, or art behavior changed.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 316/316 across isolated layouts and covers the initial authoritative frame, 80-millisecond midpoint, settled result, and Reduced Camera Motion bypass at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed the new mint state is immediately readable, the retiring segmented trace remains subordinate, the midpoint does not thicken or obscure the exit card, and compact presentation retains distinct geometry.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 6.14ms with a 1.50ms final sample across 104 rendered frames.
- Evidence is recorded in `qa/cover-ring-transition-continuity-polish-2026-08-04.md`. Suggested next refinement: human-playtest repeated lateral Joe passes at the shed and tune only the 160-millisecond visual duration if necessary; preserve immediate authoritative truth and the Reduced Motion bypass.

## Cover-versus-interaction hierarchy polish

- Inspected the close shed and drain action states after the cover-ring improvements. The cover socket and interaction footprint were both truthful, but two complete high-emphasis ellipses competed beneath the target card precisely when the player needed to read and execute an action.
- Added one presentation-only hierarchy rule. While the exact action or blocked-result rail owns the local command lane, the cover ring retains its geometry and pattern at 44% emphasis behind the gold interaction footprint. Retreat automatically restores full cover emphasis.
- Collision contact still fully defers the optional ring to its stronger physical warning. The socket soil, cover art, authoritative concealment, interaction radius, action footprint, labels, map, and all gameplay state remain intact.
- Rendering and `render_game_to_text` share numeric ring emphasis plus `primary_cover_geometry`, `subordinate_to_interaction`, or `deferred_to_collision` ownership. No radius, sightline, collision, interaction, rejection timing, route, movement, detection, Joe AI, scoring, audio, map, transition duration, or art behavior changed.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 324/324 across isolated layouts and covers both ready/action and blocked/rejection hierarchy at the shed and drain, plus full-emphasis retreat, at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed the actionable gold footprint and exact bottom rail now form one dominant command hierarchy, while the cover socket remains visible as grounded context. Compact layouts retain the same separation without losing terrain readability.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 5.79ms with a 2.00ms final sample across 101 rendered frames.
- Evidence is recorded in `qa/cover-versus-interaction-hierarchy-polish-2026-08-04.md`. Suggested next refinement: human-playtest entering and retreating from both exits during pursuit and tune only the 44% subordinate emphasis if necessary; preserve exact action ownership and full-strength cover recovery.

## Collision-versus-dialogue hierarchy polish

- Inspected movement, footing, noise, and vertical-pass captures after the exit work. The wake scenario exposed the clearest remaining clutter: contacting the water pine could show the grounded `BLOCKED BY` escape card, the larger wake warning, and an optional Joe joke at the same time.
- Gave the short collision contact window priority over optional Joe dialogue. The tethered obstacle card and viable escape direction remain immediate, while the larger wake or pursuit consequence stays on the bottom rail for suspense and tactical context.
- The active bark and its countdown remain in state rather than being cleared or rerolled, so Joe's personality can resume if presentation time remains after the physical correction. This changes presentation ownership only.
- Updated Joe's dialogue signal ownership and `render_game_to_text` diagnostics so a retained hidden bark reports `collision_contact` as its deferral reason. No collision duration, blocker, escape calculation, wake, message, dialogue selection, Joe AI, movement, detection, scoring, audio, map, subtitle setting, or art changed.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 328/328 across isolated layouts and verifies the simultaneous water-pine collision plus vertical-pass wake at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed the high-resolution and compact wake frames now keep one local physical correction plus one larger suspense consequence, with no overlapping Joe subtitle. The obstacle footprint, escape chevron, persistent map, route thread, attention state, and environment remain readable.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 6.50ms with a 2.10ms final sample across 105 rendered frames.
- Evidence is recorded in `qa/collision-versus-dialogue-hierarchy-polish-2026-08-04.md`. Suggested next refinement: human-playtest repeated glancing impacts during a natural chase and verify the preserved bark returns only when still relevant; preserve collision correction and threat-consequence priority.

## Collision-dialogue resume polish

- Followed the preserved Joe subtitle through the end of collision contact. A nearly expired line could previously regain the lane for only a few frames, creating a stale visual flash immediately after the player finished reading the physical escape correction.
- Added a relevance-aware release policy without pausing or extending the bark timer. Dialogue with at least 0.72 seconds remaining resumes; older dialogue retires silently and is not rerolled.
- Relevant dialogue returns through a bounded 160-millisecond opacity handoff after collision clears. The line is authoritative immediately, no collision information is delayed, and Reduced Camera Motion uses an instant return.
- Reset the handoff whenever a fresh bark is selected and exposed deferred, active, progress, threshold, and policy state through `render_game_to_text` for deterministic validation.
- Preserved collision duration, obstacle geometry, escape selection, wake and pursuit warnings, dialogue selection, Joe AI, movement, detection, scoring, audio, map, subtitle settings, and all generated art.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 336/336 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including resume-start, midpoint, settled, and stale-retirement states.
- Direct inspection confirmed the high-resolution handoff moves from an unobstructed collision-release frame through a restrained partial subtitle into one crisp settled card. Compact retains the hierarchy, and Reduced Camera Motion restores relevant copy without animation.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 5.70ms with a 2.10ms final sample across 113 rendered frames.
- Evidence is recorded in `qa/collision-dialogue-resume-polish-2026-08-04.md`. Suggested next refinement: human-playtest repeated glancing impacts during an active chase and tune only the 0.72-second relevance threshold if needed; preserve uninterrupted countdown and collision priority.

## Collision-dialogue glancing-contact continuity polish

- Exercised two fast collision contacts separated by a short clear gap. The relevance-aware resume was correct for one impact, but repeated glances could still let a preserved Joe subtitle surface briefly between physical corrections and then disappear again.
- Added a 120-millisecond stable-clearance check before deferred dialogue may return. A new collision during that interval resets the check, preventing subtitle chatter while the player is still scraping along the same obstacle family.
- The bark countdown remains uninterrupted throughout contact and clearance. Relevance is checked again at release, so the grace interval never grants extra dialogue time; lines below the existing 0.72-second threshold retire without replay or replacement.
- After stable clearance, standard motion retains the existing 160-millisecond opacity return. Reduced Camera Motion preserves the stable-clearance protection and restores a relevant line instantly after it completes.
- Rendering ownership and `render_game_to_text` now distinguish `collision_contact` from `collision_settle` and expose settle activity, progress, duration, resume activity, relevance threshold, and the non-extension policy.
- Preserved collision duration, obstacle art and geometry, escape direction, wake and pursuit warnings, Joe dialogue selection and AI, movement, detection, scoring, audio, map, and subtitle settings.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 340/340 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including first release, partial clearance, repeated contact, restarted clearance, fade, settled, and stale-retirement states.
- Direct inspection confirmed the grounded pine contact card remains the sole local voice through both high-resolution and compact clear gaps, then hands off once to Joe's subtitle. Reduced Camera Motion keeps the same stable ownership without the opacity fade.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 5.72ms with a 1.80ms final sample across 110 rendered frames.
- Evidence is recorded in `qa/collision-dialogue-glancing-contact-continuity-polish-2026-08-04.md`. Suggested next refinement: human-playtest sustained wall scraping and natural obstacle-to-obstacle transfers during pursuit; preserve the bounded clearance check and uninterrupted bark countdown.

## Sustained collision-feedback emphasis polish

- Audited sustained wall scraping after the repeated-contact dialogue work. Because every blocked movement frame refreshed the 1.15-second collision timer, the orange footprint, card, tether, screen wash, and escape chevron could remain at fresh-impact intensity indefinitely.
- Added a presentation-only contact age. Fresh impacts stay at full strength for 180 milliseconds, then settle smoothly over 420 milliseconds to a 66% steady scrape state while contact continues to refresh.
- A genuinely new obstacle or a nearly expired re-contact resets the age and restores full emphasis. Releasing the obstacle retains the established timer-driven fade, capped by the current settled strength so the overlay cannot brighten again on release.
- Reduced Camera Motion preserves the strong impact and readable 66% scrape states but skips the intermediate opacity animation.
- The blocker name, grounded footprint, tether, viable escape direction, movement chevron, wake warning, and collision ownership remain present at every stage. Only repeated-contact emphasis changes.
- `render_game_to_text` now reports feedback mode, emphasis, contact age, settle progress, active refresh, and steady target from the same presentation contract used by the renderer.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 348/348 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including fresh impact, mid-settle, steady scrape, release fade, repeated-contact dialogue, movement, route, interaction, and cover states.
- Direct inspection confirmed the high-resolution and compact steady scrape remains fully legible but reveals more of the pine, turf, route, and fog than the initial hit. Reduced Camera Motion makes the same hierarchy change without interpolation.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 6.08ms with a 1.80ms final sample across 103 rendered frames.
- Evidence is recorded in `qa/collision-feedback-sustained-emphasis-polish-2026-08-04.md`. Suggested next refinement: human-playtest rapid obstacle-to-obstacle transfers and tune only the 66% steady emphasis if necessary; preserve full emphasis for genuinely new contact and the existing escape guidance.

## Collision obstacle-transfer continuity polish

- Audited a rapid transfer from the Water Hazard pine to the nearby audit board. The authoritative card and escape direction changed correctly, but the grounded footprint could teleport across the field and the lower-priority `SOLID // PINE` proximity plaque could remain visible beside the new `BLOCKED BY // AUDIT BOARD` instruction.
- Added a 120-millisecond spatial handoff for direct obstacle-ID changes. The new obstacle receives the full-impact footprint, blocker card, tether, and escape direction on the first correct frame; only the prior footprint remains as a faint dashed retiring trace.
- The previous contact never keeps a label, tether, card, screen wash, or escape instruction. Repeated transfers replace the one retiring trace rather than accumulating a trail of stale contacts.
- Active collision correction now suppresses ambient `SOLID` blocker plaques. Imminent noise and other safety-critical context can still retain their existing priority; only the redundant proximity blocker yields.
- Reduced Camera Motion switches immediately to the new authoritative obstacle and omits the footprint afterimage.
- `render_game_to_text` reports transfer activity, previous obstacle ID, progress, duration, and presentation mode, while the shared context-cue contract reports `collision_contact` as the ambient blocker deferral owner.
- Preserved player collision, obstacle geometry, escape calculation, contact duration and emphasis, audio cooldown, wake warnings, Joe dialogue and AI, movement, detection, scoring, map, and all generated art.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 352/352 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including transfer start, midpoint, settled ownership, sustained scraping, dialogue recovery, routes, interactions, and cover.
- High-resolution inspection directly caught and removed the stale pine plaque. The corrected high-resolution and compact captures show one audit-board card and escape instruction plus only the faint retiring pine footprint; Reduced Camera Motion contains no afterimage.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 8.65ms with a 3.20ms final sample across 97 rendered frames.
- Evidence is recorded in `qa/collision-obstacle-transfer-continuity-polish-2026-08-04.md`. Suggested next refinement: human-playtest zig-zag movement through the densest Service Maze contacts and tune only the 120-millisecond trace duration if needed; preserve immediate new-obstacle authority and single-instruction ownership.

## Collision-context cue handoff polish

- Followed the complete collision-to-dialogue release sequence and found one remaining 120-millisecond ownership gap: the ambient `SOLID // PINE` plaque could appear during stable clearance, then vanish when the preserved Joe subtitle returned.
- Extended collision ownership through the stable-clearance tail only when dialogue is actually pending. The field now progresses from collision feedback to a clean clearance frame to Joe's resumed subtitle without an unrelated one-frame blocker callout.
- Ordinary blocker guidance is not delayed after collisions that have no pending dialogue. Imminent noise and practice guidance retain their established higher priorities, and a repeated impact still restarts clearance immediately.
- `render_game_to_text` now exposes the suppressed ambient cue as `collision_settle`, distinct from active `collision_contact`, so both phases are deterministic and independently testable.
- Preserved collision geometry and duration, transfer traces, dialogue countdown and relevance rules, Joe AI, movement, detection, pursuit, scoring, audio, map, accessibility settings, and generated art.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 352/352 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including settle start, partial clearance, repeated clearance, dialogue resume, routes, interactions, and cover.
- Direct inspection confirmed high-resolution and compact clearance frames contain no transient `SOLID` plaque, while standard and Reduced Camera Motion return Joe's relevant line only after stable clearance.
- The required official uninstrumented client preserved the opening, first-steps handoff, selected drain-valve route, persistent map, layered course art, and input behavior with no browser-error artifact. Canvas work averaged 5.57ms with a 2.20ms final sample across 111 rendered frames.
- Evidence is recorded in `qa/collision-context-cue-handoff-polish-2026-08-04.md`. Suggested next refinement: human-playtest natural Service Maze scraping with dialogue active; preserve the clean ownership bridge and only tune timing if the clearance tail itself feels perceptible.

## Collision-release input ownership polish

- Audited the release frame after a sustained collision and found the old orange escape chevron could remain authoritative while the player was already moving in a different direction. The lingering `MOVE LEFT TO CLEAR` instruction made responsive controls appear sticky even though physical movement had recovered.
- Separated actively refreshed collision correction from the longer collision-memory timer. The orange `BLOCKED BY` card and viable escape chevron now own the field only while movement is actually being rejected.
- Once contact releases, the footprint and card switch to a mint `CLEAR OF` echo, the card reports `LIVE INPUT // KEEP MOVING`, the screen wash retires, the player's current movement chevron returns, and the ordinary locomotion label may render again.
- Restricted obstacle-transfer afterimages to genuinely continuous active contact. Colliding with a different obstacle after the previous contact has already released now starts a fresh impact instead of drawing a spatially misleading bridge.
- The map's orange blocked footprint follows active correction rather than historical feedback, while collision geometry, the readable release echo, dialogue timing, and stored text-state evidence remain intact.
- `render_game_to_text` reports correction activity, instruction mode, and exact instruction alongside the attempted and displayed movement directions, allowing live-input restoration to be validated without visual inference.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 352/352 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed high-resolution, compact, and Reduced Camera Motion release frames show a rightward live-input chevron with no stale leftward escape instruction; the mint echo remains grounded and readable.
- A long official uninstrumented sprint/chase route completed 892 rendered frames with no browser-error artifact. Canvas work averaged 1.67ms with a 1.60ms final sample, and the run ended with no stale collision or escape owner.
- Evidence is recorded in `qa/collision-release-input-ownership-polish-2026-08-04.md`. Suggested next refinement: human-playtest rapid stop-start contact at tunnel mouths and tune only the 80-millisecond active-contact grace if necessary; preserve immediate live-input restoration and truthful direct-transfer detection.

## Collision-release echo timing polish

- Audited the new mint collision release state over its full lifetime. Although input ownership returned immediately, the visual confirmation could inherit most of the longer 1.15-second collision-memory timer and continue occupying the field well after the player understood the recovery.
- Added a dedicated 360-millisecond release-echo lifecycle measured from the end of the 80-millisecond active-contact grace. Standard motion fades the mint card, tether, and footprint through a smooth bounded envelope; Reduced Camera Motion shows one stable confirmation and removes it without opacity interpolation.
- The release echo continues to report `CLEAR OF`, `LIVE INPUT // KEEP MOVING`, and current directional input while present. Once it retires, `blockedBy` no longer reports a visible collision and ordinary `SOLID` proximity guidance may return when no dialogue or threat lane has higher priority.
- Nearby blocker candidate suppression now follows active correction plus the bounded echo instead of the full collision-memory timer. This prevents both overlapping plaques during release and an unnecessary dead interval afterward.
- Kept Joe's collision-deferred subtitle countdown, relevance threshold, stable-clearance protection, wake-warning priority, physical collision, transfer traces, map, movement, detection, scoring, audio, and generated art unchanged.
- `render_game_to_text` now reports release age, progress, duration, visibility, instruction mode, and exact context deferral ownership, including the valid case where a wake warning outranks collision-settle diagnostics.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 356/356 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed the high-resolution and compact mid-release frames remain readable, then hand cleanly to the grounded pine plaque. Reduced Camera Motion performs the same handoff without animated opacity.
- The official uninstrumented shorter traversal completed 468 rendered frames with no browser-error artifact. Canvas work averaged 2.67ms with a 2.40ms final sample; it ended with no stale collision or escape owner.
- Evidence is recorded in `qa/collision-release-echo-timing-polish-2026-08-04.md`. Suggested next refinement: human-playtest whether the 360-millisecond positive confirmation remains legible during rapid chase corrections; preserve the separate active-contact, release-echo, and collision-memory responsibilities.

## Collision-dialogue memory decoupling polish

- Followed the shortened mint release echo into Joe's preserved subtitle and found an unnecessary blank interval: dialogue still waited for the older 1.15-second collision-memory timer even though contact feedback had visibly retired after 360 milliseconds.
- Decoupled dialogue ownership from collision memory. Active physical rejection now owns dialogue and resets the existing 120-millisecond stable-clearance timer; the timer accrues while the mint release echo remains visible, and dialogue can return only after both the clearance requirement and visible echo have completed.
- A renewed glancing collision immediately resets stable clearance and cancels any pending subtitle fade. The bark countdown remains uninterrupted, so no extra dialogue time is created.
- Relevant dialogue returns through the established 160-millisecond standard-motion opacity handoff as soon as the release echo yields. Reduced Camera Motion restores it instantly after the static echo, with no intermediate opacity animation.
- Stale deferred copy is still retired. The deterministic stale-line scenario now also verifies that Joe may select genuinely new context dialogue during the shorter recovery window without replaying the expired line.
- `render_game_to_text` explicitly reports whether the release echo is active, whether clearance runs during it, whether collision memory owns dialogue, and the revised non-extension policy.
- Focused gameplay validation passed 18/18 with no browser errors. Responsive visual/state validation passed 356/356 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed high-resolution and compact layouts move from one mint release owner to one Joe subtitle owner without overlap. Reduced Camera Motion performs the same handoff as an immediate state switch.
- The official uninstrumented traversal completed 459 rendered frames with no browser-error artifact. Canvas work averaged 2.58ms with a 2.10ms final sample, and state confirmed collision memory did not own the live dialogue lane.
- Evidence is recorded in `qa/collision-dialogue-memory-decoupling-polish-2026-08-04.md`. Suggested next refinement: human-playtest rapid collision-release cycles during chase and tune only the 360-millisecond echo if the subtitle return feels early or late; preserve stable clearance, non-extension, and visible-owner exclusivity.

## Collision-release threat-caption hierarchy polish

- Inspected the repeated collision-release frame and found two simultaneous orange threat captions competing with the mint `CLEAR OF // AUDIT BOARD` card: the upper warning crossed the release panel while the lower warning occupied the navigation/cover lane.
- Added one shared threat-caption presentation contract. During the bounded mint release echo, one live warning is drawn and its baseline is derived from the actual grounded collision-card geometry.
- The release layout reserves a measured 12-pixel canvas gutter above the collision panel. It therefore stays stable at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion instead of depending on browser pixels or viewport scaling.
- Caption contents, queue order, lifetimes, and expiry continue unchanged. Joe's wake awareness, detection, AI, collision, release timing, dialogue handoff, route thread, cover state, map, audio, and scoring are untouched.
- `render_game_to_text` now reports the maximum visible caption count, presentation layout, baseline, and collision-release gutter from the same contract used to draw the frame.
- Syntax and diff checks pass. Focused movement/pursuit validation passes 18/18, and responsive visual/state validation passes 356/356 with no browser errors.
- Direct inspection confirms one current mower warning above one mint recovery card in high-resolution, compact, and Reduced Camera Motion frames; the route line and lower cover lane remain clear, and the subsequent Joe subtitle resumes alone.
- The required official uninstrumented traversal completed 465 rendered frames without a browser-error artifact. Canvas rendering averaged 4.51ms with a 5.40ms final sample.
- Evidence is recorded in `qa/collision-release-threat-caption-hierarchy-polish-2026-08-04.md`. Suggested next refinement: human-playtest natural multi-warning releases during close pursuit; preserve single-card recovery ownership and the measured gutter unless a different local card family proves to need the same shared contract.

## Collision-release warning-priority polish

- Hardened the single-card release hierarchy against a subtler failure: a newly added ambient world caption could displace an older danger warning even while Joe was reacting to the player.
- Added a presentation-only severity policy for the mint release echo. `danger` outranks `mower`, `mower` outranks `world`, and reverse queue order keeps the newest caption authoritative within equal severity.
- The live caption array is never sorted or rewritten. Deferred captions retain their original order, ages, durations, and expiry, while ordinary field presentation continues to use the established recency-based two-card stack.
- The deterministic release scenario now seeds an older mower-wake danger plus a newer course-light ambient caption and verifies that only the danger card renders above `CLEAR OF` with the existing 12-pixel gutter.
- `render_game_to_text` reports the active selection policy plus the primary caption text and category from the same visible-caption result used by the renderer.
- Focused movement and pursuit validation passed 18/18. Responsive visual/state validation passed 356/356 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion with no browser errors.
- Direct inspection confirmed the danger warning remains the one visible release card at high resolution, compact landscape, and Reduced Camera Motion; the newer ambient caption stays deferred and the mint card remains clear.
- The required official uninstrumented traversal completed 464 rendered frames without a browser-error artifact. Canvas rendering averaged 4.16ms with a 4.10ms final sample.
- Evidence is recorded in `qa/collision-release-warning-priority-polish-2026-08-04.md`. Suggested next refinement: human-playtest mixed warning categories during natural pursuit; preserve severity-first release selection, recency tie-breaking, and the unmodified caption queue.

## Semantic threat-caption frame polish

- Audited the selected danger warning after the priority pass and found its orange copy still enclosed by the generic sage subtitle border, weakening the severity read and making the visual language internally inconsistent.
- Extended the shared subtitle-card primitive with an optional frame color while preserving its existing sage default for Joe dialogue and the opening subtitle.
- Added one category theme contract: danger captions use orange text and frame, mower-state captions use amber text and frame, and ambient world captions retain sage text and frame.
- Updated the Settings caption preview to consume the same mower-amber theme as live gameplay, so accessibility configuration demonstrates the real presentation rather than a partial approximation.
- `render_game_to_text` now exposes the selected caption's semantic frame theme. The deterministic mixed-priority release verifies that the danger owner reports `danger_orange` while keeping its geometry, timing, and queue behavior unchanged.
- Responsive visual/state validation passed 356/356 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion. Focused movement and pursuit validation passed 18/18; no browser errors occurred.
- Direct inspection confirmed the orange danger frame remains crisp and separate from the mint recovery card at high resolution, compact landscape, and Reduced Camera Motion. The official Settings capture confirms the mower-amber preview remains aligned inside its panel.
- The official Settings run completed 71 rendered frames at 4.46ms average canvas render and 1.30ms final sample. The official course traversal completed 473 frames at 2.58ms average and 2.20ms final, both without browser-error artifacts.
- Evidence is recorded in `qa/semantic-threat-caption-frame-polish-2026-08-04.md`. Suggested next refinement: human-playtest the full danger/mower/world caption mix against late-course fog and tune only frame alpha if needed; preserve category meaning and caption-background accessibility control.

## Maximum-size caption-preview layout polish

- Audited the Settings preview at the maximum supported 140% caption size. The scaled card rose into the header region while its lower edge retained only about two canvas pixels of breathing room.
- Expanded the preview panel from 57 to 60 canvas pixels and lifted the header baseline, preserving the existing card baseline and neighboring button layout.
- Added a right-aligned `MOWER // AMBER` category label driven by the same semantic theme as the live preview. Disabling threat captions swaps that label to `DISABLED` alongside the existing off message.
- Added a Settings-only text-state geometry contract reporting panel bounds, header and card bounds, category theme, bottom padding, and footer clearance.
- The deterministic visual suite now opens the real Settings renderer at 140% caption size in every viewport and verifies at least 2px header clearance, 5px bottom padding, and 8px footer separation.
- Responsive visual/state validation passed 360/360 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion. Focused movement and pursuit validation passed 18/18; no browser errors occurred.
- Direct inspection confirmed the maximum-size preview stays inside its labeled panel at high resolution, compact landscape, and Reduced Camera Motion without colliding with fullscreen or button controls.
- The required official keyboard-driven Settings flow reached the `subtitle_size` row at 140%, completed 81 rendered frames without a browser-error artifact, and averaged 2.82ms canvas render with a 1.20ms final sample.
- Evidence is recorded in `qa/caption-preview-max-size-layout-polish-2026-08-04.md`. Suggested next refinement: human-playtest pointer and controller adjustments between 80% and 140%; preserve the max-size containment contract and live semantic category preview.

## Zero-backdrop semantic-frame polish

- Audited the semantic threat treatment at the minimum `CAPTION BACKDROP` value and found that the existing `> 0.05` frame gate removed the danger/mower/world border together with the fill.
- Extended the shared subtitle-card primitive with an opt-in minimum frame opacity. Threat captions use a restrained 42% semantic outline at zero backdrop, while their interior remains completely transparent.
- Opening subtitles and Joe dialogue keep the original zero-backdrop behavior because they do not opt into the semantic minimum. The accessibility setting therefore still removes their full card treatment as expected.
- The Settings preview and live danger captions consume the same category theme and minimum frame value. Default and nonzero backdrop levels retain their established full frame strength.
- Added text-state truth for transparent interior, semantic-frame visibility, and effective frame multiplier in both Settings and the live primary-threat contract.
- The deterministic visual suite now captures the hardest combination—140% caption size plus 0% backdrop—in Settings and captures a zero-backdrop danger warning over actual fog, foliage, obstacle art, route geometry, and the mint collision-release card.
- Responsive visual/state validation passed 360/360 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion. Focused movement and pursuit validation passed 18/18; no browser errors occurred.
- Direct inspection confirmed the transparent card reveals the course while its danger-orange boundary and heavy text stroke remain legible at high resolution, compact landscape, and Reduced Camera Motion.
- The required official keyboard flow reached `caption_background` at 0% with caption size at 140%, completed 104 rendered frames without a browser-error artifact, and averaged 2.04ms canvas render with a 0.90ms final sample.
- Evidence is recorded in `qa/zero-backdrop-semantic-frame-polish-2026-08-04.md`. Suggested next refinement: human-playtest zero-backdrop captions across Night Range floodlights and Release Corridor fog; tune only the 42% minimum if needed while preserving transparent fill and category identity.

## Applied-distance locomotion polish

- Audited open-field movement and blocked-contact frames after the caption work. Forward bob, surge, and speed streaks were driven by held input and elapsed time, so pressing into a hard boundary could continue to imply travel and terrain slowdown did not fully affect the visual cadence.
- Added one applied-distance locomotion contract. Each movement step records requested and accepted world distance; the stride phase advances only from accepted travel, preserving partial slide feedback while stopping forward-motion effects on a fully rejected input.
- Camera bob, shoulder roll, stride impact, surge, forward streaks, and peripheral rush now consume that shared translation state. Existing movement arrows and collision escape guidance continue to report the player's live intent while the forward effects stop.
- Rebased existing streak motion on accumulated course travel and added three-to-five restrained near-field turf rush bands. These perspective bands move faster during a real sprint, slow naturally with authored surface multipliers, and remain stationary when the player is blocked.
- Reduced Camera Motion keeps requested-versus-applied movement truth and all collision guidance but continues to omit bob, roll, surge, streaks, and the new animated turf bands.
- Preserved movement speeds, terrain multipliers, collision footprints, obstacle sliding, Joe AI, detection, scoring, audio, route logic, map behavior, and generated art.
- Focused movement/pursuit validation passed 18/18. Responsive visual/state validation passed 368/368 across 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion, including real footing travel and a fully rejected course-boundary input.
- Direct inspection confirmed successful movement retains strong grounded depth cues at high resolution and compact landscape, while the blocked frame keeps its orange correction card and live input direction without fake forward rush. Reduced Camera Motion preserves the same state distinction statically.
- The required official uninstrumented traversal completed 465 rendered frames without a browser-error artifact. Canvas rendering averaged 2.57ms with a 2.30ms final sample.
- Evidence is recorded in `qa/applied-distance-locomotion-polish-2026-08-04.md`. Suggested next refinement: human-playtest long diagonal wall slides and terrain-boundary sprint transitions; preserve applied-distance ownership and tune only the turf-band opacity if necessary.

## Accepted-lateral camera polish

- Followed the applied-distance locomotion contract into sideways movement. Forward effects stopped correctly at a wall, but camera pan, counter-roll, and edge-rush still consumed raw lateral input before collision resolution and could imply side travel that never occurred.
- Recorded requested and applied movement independently on both world axes. The camera now receives requested lateral input for diagnostics and accepted lateral input for presentation.
- Accepted strafes retain the established eased viewport shift, parallax, roll, and edge cue. Fully blocked lateral input targets a stable view, while partial obstacle slides receive proportional camera response rather than a binary snap.
- Movement arrows and collision correction remain input-authoritative, so a blocked attempt still communicates the pressed direction and exact escape instruction even though the world no longer drifts falsely.
- Reduced Camera Motion retains its restrained accepted lateral shift and zero roll. No movement speed, collision, sliding, camera amplitude, camera response timing, route, Joe AI, detection, scoring, audio, map, or art changed.
- Hardened visual scenario isolation after direct inspection caught a stale boundary collision card in the later accepted-strafe capture. The shared placement reset now clears collision presentation state before every independent scenario.
- Focused movement/pursuit validation passed 18/18. Responsive visual/state validation passed 372/372 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion.
- Direct inspection confirmed accepted leftward travel shifts the high-resolution and compact course composition while fully blocked rightward input retains a stable scene behind the grounded orange correction card. Reduced Camera Motion preserves the same truth without roll.
- The required official uninstrumented traversal completed 468 rendered frames without a browser-error artifact. Canvas rendering averaged 2.61ms with a 2.20ms final sample.
- Evidence is recorded in `qa/accepted-lateral-camera-polish-2026-08-04.md`. Suggested next refinement: human-playtest diagonal hedge and cart slides during close pursuit; preserve per-axis acceptance and tune only the existing camera amplitude if necessary.

## Diegetic course-boundary polish

- Audited the accepted-lateral boundary frame and found the next source of frustration: fairway lanterns marked a narrower authored lane, while the true course collision edges at `x = -112` and `x = 112` could remain visually open until the player hit them.
- Added a world-projected perimeter on the exact collision coordinates. Low dashed rope, grounded stakes, and reflective tabs recede through perspective and respond to the existing camera transform instead of behaving like a HUD overlay.
- The nearest boundary warms from restrained sage to amber inside a 34-meter approach band. One small grounded `COURSE LIMIT // KEEP LEFT|RIGHT` placard appears before contact so the player can reroute based on the first-person view.
- At contact, the placard yields while the physical rope remains behind the existing orange footprint and escape card. This preserves one authoritative instruction owner rather than repeating the boundary warning.
- The persistent map and collision logic continue to use the same `±112` width. No playable area, collision, movement, camera, Joe AI, detection, route, scoring, audio, or generated art changed.
- Added text-state diagnostics for nearest side, exact distance, warning amount, contact, placard visibility, visible segments, and explicit collision-coordinate parity.
- High-resolution validation passed 94/94. Responsive visual/state validation passed 376/376 at 2560x1600, 1280x720, 844x390, and 1280x720 Reduced Camera Motion. Focused movement/pursuit validation passed 18/18.
- Direct inspection confirmed the approach perimeter is clear but subordinate at high resolution and compact landscape; Reduced Camera Motion preserves the same static geometry. Contact retains the rope and removes the redundant placard beneath the orange correction card.
- The required official uninstrumented traversal completed 469 rendered frames without a browser-error artifact. Canvas rendering averaged 2.80ms with a 3.50ms final sample.
- Evidence is recorded in `qa/diegetic-course-boundary-polish-2026-08-04.md`. Suggested next refinement: human-playtest the west perimeter and late-course narrow lanes; preserve exact coordinate parity and contact ownership, tuning only approach opacity if needed.

## HUD-safe course-boundary placard polish

- Exercised the previously untested mirrored west approach and found that canvas-only clamping did not reserve the expanded 430-pixel left HUD, allowing a grounded course-limit card to project beneath the surroundings panel.
- Added one shared boundary-card safe-area contract. The left edge follows the actual compact or expanded HUD with a 12-pixel gutter, while the right edge stops 18 pixels before the persistent course map.
- The 140-pixel placard now selects a naturally safe projected stake when one exists. When the west stake is obscured by the HUD, only the card is displaced and a thin outlined amber tether returns it to the exact world-projected stake.
- The east card remains naturally grounded when it already fits. Collision coordinates, playable width, rope and stake anchors, movement, camera, routes, Joe AI, detection, map behavior, scoring, audio, and generated art remain unchanged.
- `render_game_to_text` exposes safe edges, card width, anchor and label geometry, HUD state, displacement, map clearance, HUD clearance, and the resulting presentation mode from the same calculation used by the renderer.
- Focused movement and pursuit validation passed 18/18. High-resolution validation passed 95/95, and the complete responsive/Reduced Camera Motion matrix passed 380/380 with no browser errors.
- Direct inspection confirmed the west card clears the expanded HUD at 2560x1600, remains fully inside the field at 844x390, and retains its precise stake origin; the east card receives no unnecessary tether.
- The required official input traversal completed 467 rendered frames without a browser-error artifact. Canvas rendering averaged 4.87ms with a 4.40ms final sample.
- Evidence is recorded in `qa/hud-safe-course-boundary-placard-polish-2026-08-04.md`. Suggested next refinement: human-playtest both edges during close pursuit and preserve the shared anchor/safe-area contract unless a more urgent local signal needs presentation priority.

## Course-boundary dead-verge polish

- Audited the new perimeter in first person and found that the rope was geometrically truthful but the turf remained nearly identical on both sides, leaving the player to infer which side was playable.
- Added a 14-meter perspective-projected dead verge strictly outside the exact collision coordinates. It fades from a restrained boundary stain into darker neglected turf without creating a visual wall.
- Added deterministic broken reeds and small exposed-soil scars to ground the strip in the game's pixel-horror course art. High-resolution inspection caught an initially symmetrical grass silhouette that resembled a route arrow; it was replaced with irregular, wind-leaning clusters of staggered height and position.
- The treatment uses the existing course projection, camera shift, fog, depth, and foreground occlusion. Reduced Camera Motion receives the same static composition without extra animation.
- Text state now reports verge width, outside-only placement, texture contract, playable-side communication, and explicit non-collision behavior.
- Course width, collision response, movement, footing, camera behavior, map presentation, routes, Joe AI, detection, scoring, audio, and generated art remain unchanged.
- Focused gameplay validation passed 18/18. High-resolution validation passed 95/95, and the complete responsive/Reduced Camera Motion matrix passed 380/380 with no browser errors.
- Direct inspection confirmed the safe side reads more clearly at 2560x1600 and 844x390 while the rope, stakes, placard, and persistent map retain priority.
- The required official input traversal completed 467 rendered frames without a browser-error artifact. Canvas rendering averaged 2.99ms with a 3.40ms final sample.
- Evidence is recorded in `qa/course-boundary-dead-verge-polish-2026-08-04.md`. Suggested next refinement: human-playtest the verge during close pursuit and late-course fog, preserving its outside-only non-collision contract.

## Custom game-object art completion

- Audited every drawable course obstacle and each authored object family after the recent boundary/navigation polish. Existing obstacles, cover, interactables, mechanics, clutter, verge flora, lanterns, signage, bunkers, and turf evidence already resolve to dedicated generated art.
- Closed the remaining visible object-art gap with `rough-cut-course-boundary-kit-v1.png`, a new high-resolution pixel-art atlas containing an authored reflective stake and weathered course-limit placard.
- Preserved the original chroma generation and recorded the complete prompt, cell map, and transparency process beside the runtime asset.
- Replaced the procedural stake and placard frame without changing the exact `x = ±112` collision contract, world projection, HUD-safe displacement, or contact ownership. The connector rope and live directional copy remain deliberate runtime layers because they depend on perspective and state.
- Added a text-state `customObjectArtAudit` that dynamically verifies all 44 drawable course obstacles have mapped art and inventories every generated object atlas. The current audit reports `complete` with no missing IDs.
- Focused movement/pursuit validation passed 18/18. High-resolution validation passed 96/96, and the full responsive/Reduced Camera Motion matrix passed 384/384 with no browser errors.
- Direct inspection confirmed clean transparent edges, grounded authored bases, readable east/west cards, compact HUD clearance, and static Reduced Camera Motion parity.
- The official uninstrumented traversal completed 463 rendered frames without a browser-error artifact. Canvas rendering averaged 3.31 ms with a 5.10 ms final sample.
- Evidence is recorded in `qa/custom-game-object-art-completion-2026-08-04.md`. Any future physical course object should enter through a generated-art cell and be registered in the audit; procedural rendering remains appropriate for stateful geometry, accessibility copy, fog, light, particles, and terrain masks.

## Generated footing-hazard art polish

- Continued the custom-art audit beyond standalone props and found the three high-impact footing materials still relied on procedural terrain fills.
- Generated and integrated `rough-cut-footing-hazards-v1.png`, a dedicated transparent atlas for dead thatch, glossy irrigation mud, and exposed root mats across all seven slow-footing placements.
- Clipped each authored material inside the existing rotated gameplay ellipse, preserving exact collision, slowdown, noise, bypass, and map truth.
- High-resolution inspection caught an overly dominant occupied thatch texture in the first integration. Added a forward-distance fade so distant hazards remain richly legible while near-camera material yields to escape guidance and the course ahead.
- Expanded `customObjectArtAudit` to validate all three unique footing kinds and inventory the new atlas alongside the 44/44 mapped drawable obstacles.
- High-resolution visual/state validation passed 96/96 with no browser errors after the opacity correction. Direct inspection confirmed revised thatch and mud presentation remains grounded and readable.
- The full responsive/Reduced Camera Motion matrix passed 384/384, and focused movement/pursuit validation passed 18/18 with no browser errors.
- The official uninstrumented traversal completed 466 rendered frames without a browser-error artifact. Canvas rendering averaged 3.23 ms with a 2.50 ms final sample; text state reported 44/44 obstacles, 3/3 footing materials, seven art-backed placements, and no missing custom-art IDs.
- Evidence is recorded in `qa/generated-footing-hazard-art-polish-2026-08-04.md`. Suggested next refinement: human-playtest the three materials in late-course fog and tune only the distance-aware authored-material alpha if necessary; preserve the authoritative ellipse and generated material identity.

## Generated wet-turf hardware polish

- Continued the physical-object audit into the activated sprinkler system. The eight wet zones still depended on gradients, spray lines, and a tiny procedural sprinkler dot despite their persistent map and gameplay presence.
- Generated and integrated `rough-cut-wet-turf-atlas-v1.png`, containing two authored wet-course variants with embedded brass/iron sprinkler heads, puddled turf, restrained mud, and maintenance ruts.
- Alternated the variants across all eight existing soak zones without changing activation, positions, radii, wet-track behavior, quiet-route logic, or Joe's mower slowdown.
- Kept spray arcs, shimmer, ending fade, and map rings dynamic; the procedural sprinkler dot now appears only as an asset-loading fallback.
- Added near-camera restraint and registered the source, two variants, eight placements, readiness, and runtime-layer contract in text state and the custom-object audit.
- High-resolution validation passed 97/97. The complete responsive/Reduced Camera Motion matrix passed 388/388 with no browser errors.
- Direct inspection confirmed the generated beds remain grounded and readable at high resolution, compact landscape, and Reduced Camera Motion while live water effects retain ownership.
- Focused movement/pursuit validation passed 18/18. The official uninstrumented traversal completed 475 rendered frames without a browser-error artifact; canvas rendering averaged 4.11 ms with a 3.60 ms final sample.
- Official text state reported both wet-turf variants ready across eight placements, a complete custom-art audit, 44/44 drawable obstacles, 3/3 footing kinds, and no missing art IDs.
- Evidence is recorded in `qa/generated-wet-turf-art-polish-2026-08-04.md`. Suggested next refinement: human-playtest activated sprinklers in the Night Range and Release Corridor; preserve the generated hardware bed and tune only the runtime cyan grade if late-course lighting needs more separation.

## Generated moving golf-ball lifecycle polish

- Audited golf-ball distraction rendering and found that the inventory and landed recovery states used authored generated art, but the ball reverted to a procedural white circle during flight and rolling.
- Generated and integrated `rough-cut-moving-golf-ball-atlas-v1.png`, containing pristine airborne, wet-ground, and scuffed-ground variants with transparent pixel-art silhouettes.
- Selects the rolling material from the authoritative shot surface while keeping trajectory, target shadow, surface tint, rest ring, shot timing, noise, Joe reaction, and reclaim mechanics dynamic and unchanged.
- Drives ordinary ball rotation from actual shot progress and traveled distance. Reduced Camera Motion retains a static generated sprite orientation.
- Expanded `customObjectArtAudit` with the atlas and all three variants, and exposed active material, readiness, lifecycle continuity, runtime layers, and motion preference in text state.
- High-resolution deterministic visual/state validation passed 99/99 with no browser errors. Direct inspection confirmed both flight and wet-roll frames remain crisp, grounded, and proportionate.
- The complete responsive/Reduced Camera Motion matrix passed 396/396, and focused movement/pursuit validation passed 18/18 with no browser errors.
- The required official uninstrumented traversal completed 473 rendered frames without a browser-error artifact; canvas rendering averaged 2.66 ms with a 2.40 ms final sample.
- Official text state reported all three moving-ball variants ready, a complete custom-art audit, 44/44 mapped drawable obstacles, 3/3 footing materials, two wet-turf variants, and no missing custom-art IDs.
- Evidence is recorded in `qa/generated-moving-golf-ball-art-polish-2026-08-04.md`. Suggested next refinement: human-playtest repeated bank and lie-switch shots across fog-heavy late-course surfaces; preserve lifecycle art continuity and tune only sprite diameter if a specific device makes the ball difficult to track.

## Generated Course Echo entity polish

- Tightened the custom-art audit beyond static obstacles and found the replayed Course Echo still used a procedural diamond for its physical world presence.
- Generated and integrated `rough-cut-course-echo-atlas-v1.png`, containing matching mint-ahead and amber-behind spectral office-worker runners with transparent pixel-art silhouettes.
- Preserved recorded route samples, pace delta, map trail, score comparison, finish state, challenge behavior, and the Echo's presentation-only contract.
- Standard presentation adds restrained stride bob to the authored runner; Reduced Camera Motion keeps its orientation and pose static while recorded world motion continues.
- Expanded `customObjectArtAudit` into twelve explicitly counted object families covering interactables, mechanics, clutter/noise hazards, verge dressing, lanterns, signage, bunkers, turf evidence, boundary hardware, wet hardware, moving golf balls, and the Course Echo.
- High-resolution deterministic visual/state validation passed 101/101 with no browser errors. Direct inspection confirmed both variants remain grounded, human-scaled, readable, and distinct from Joe.
- The complete responsive/Reduced Camera Motion matrix passed 404/404, and focused movement/pursuit validation passed 18/18 with no browser errors.
- The required official uninstrumented traversal completed 475 rendered frames without a browser-error artifact; canvas rendering averaged 3.09 ms with a 2.70 ms final sample.
- Official text state reported all 12 object families mapped, two Course Echo variants, 44/44 drawable obstacles, 3/3 footing materials, and no missing custom-art IDs or families.
- Evidence is recorded in `qa/generated-course-echo-art-polish-2026-08-04.md`. Suggested next refinement: human-playtest a real saved-record rematch to judge Echo visibility through the Night Range fog; preserve the recorded-route contract and tune only the existing sprite alpha if a specific zone makes it too faint.

## Solid shed and mandatory field-check route

- Fixed the maintenance shed's apparent transparency/disappearance at close contact. The art now renders at full opacity, and a new overlapping center-door collision footprint closes the gap between the existing side walls so the player cannot cross the visible structure and push it behind the camera.
- Preserved an accessible Final Filing position in front of the solid doorway. Direct contact reports `SHED DOOR` and a viable retreat direction while the complete generated shed image remains visible.
- Added three mandatory generated-art Night Order objectives to the existing course: Audit Bell at the east side of Audit Row, Field Log at the west side of Service Maze, and Release Review at the east side of Night Range.
- The east-west-east route forces meaningful lateral navigation instead of a center-line sprint. Each check creates a loud world signal, pushes Joe into investigation, updates the objective ledger immediately, and advances the obstacle-aware mint route to the next station.
- Added the three checks to world state, contextual interaction ownership, grounded physical rendering, use rings, world markers, the persistent map, onboarding copy, help cards, objective text, and narrative state. Every physical station uses `rough-cut-course-mechanics-atlas-v1.png`; no procedural stand-in or new art family was introduced.
- Final Filing at both shed and drain now requires all three checks in addition to the existing key or valve access. Early attempts receive a clear `CHECKS OPEN` rejection and the HUD reports exactly how many checks remain.
- Focused shed/objective validation passed 9/9, focused movement/pursuit validation passed 18/18, and existing two-route objective-access validation passed 5/5. High-resolution validation passed 101/101; standard, compact, and Reduced Camera Motion passes each passed 101/101 for 404/404 total responsive coverage, all without browser errors.
- The official uninstrumented client reached Hole 1 with `FIELD CHECKS 0/3`, a generated-art Audit Bell target, all three map objectives, and the solid/opaque shed contract reported in text state. Evidence is recorded in `qa/shed-solidity-and-field-objectives-2026-08-04.md`.

## Dedicated Night Order objective-art polish

- Re-audited the three mandatory field checks after their gameplay integration. Although functional and art-backed, they still reused unrelated cells from the older general course-mechanics atlas and therefore lacked a distinct physical identity.
- Used OpenAI image generation with the established course-mechanics art direction as a style reference to create `rough-cut-night-order-objectives-v1.png`: a dedicated brass Audit Bell, illuminated mechanical Field Log kiosk, and blackened-brass Release Review gong.
- Preserved the original chroma source and recorded the complete generation prompt, transparency settings, measured alpha bounds, and runtime roles in `web/assets/rough-cut-night-order-objectives-v1.md`.
- Integrated exact non-overlapping cell bounds through the existing cached world-fixture renderer. All three stations keep authored turf bases, world contact shadows, proximity glow, interaction rings, route guidance, map markers, completion state, and loud Joe-investigation consequences.
- Added idle-time atlas priming and load-triggered rendering so the new high-resolution art does not introduce a first-appearance hitch.
- Expanded `customObjectArtAudit` from 12 to 13 explicitly counted object families. Live text state reports 13/13 mapped families, all three Night Order variants ready, and no missing custom-art IDs or families.
- `node --check web/game.js` and `git diff --check` passed. The official uninstrumented client reached live Hole 1 without a browser-error artifact and completed 144 rendered frames at 4.58 ms average canvas render with a 1.90 ms final sample.
- Direct asset inspection confirmed transparent corners, clean silhouettes, planted bases, separated cells, and no neighboring-atlas fragments. Evidence is recorded in `qa/dedicated-night-order-objective-art-polish-2026-08-04.md`.

## Night Order station feedback polish

- Audited the dedicated Night Order stations in motion and found that their visual identities diverged but all three still played the same practice-bell cue; completed stations also lost most of their world-state emphasis after the interaction ring disappeared.
- Added three distinct effects-bus acoustic signatures: layered brass ring for Audit Bell, mechanical impact/lever/paper snap for Field Log, and low sustained gong with restrained harmonics for Release Review.
- Added a 1.45-second station activation response with a modest scale punch and receding ground waves. Reduced Camera Motion removes the animated punch and presents one static restrained halo.
- Completed stations now keep a subtle mint ground seal and check marker, preserving authored object visibility while making revisited state legible without opening the map.
- Preserved every interaction radius, location, route, noise duration, Joe response, collision footprint, exit rule, scoring rule, and generated asset. The new elements are stateful feedback layers only.
- Added text-state truth for each station's acoustic signature, the current activation timer, motion preference, and the persistent completion presentation.
- The official client followed the real obstacle-aware route around stone cover and completed the Audit Bell end to end. Live state confirmed `FIELD CHECKS 1/3`, immediate Field Log navigation ownership, Joe in `investigate`, `brass_bell` cue identity, and the active station-response timer.
- Direct inspection confirmed the authored bell remains readable under the activation wave, the next route is clear, and the persistent HUD/map retain priority. The successful run completed 615 frames at 3.90 ms average and 3.90 ms final canvas render without browser errors.
- Evidence is recorded in `qa/night-order-station-feedback-polish-2026-08-05.md`. Suggested next refinement: human-playtest the stamp and gong at ordinary listening volume; preserve their distinct profiles and adjust only effect-bus gain if necessary.

## Generated south service gate polish

- Extended the custom-object audit beyond registered playfield props and found one story-critical gap: the south service gate that traps the player existed only inside the distant rear panorama while collision used an abstract `y = 0` course edge.
- Used built-in OpenAI image generation to create `rough-cut-south-service-gate-v1.png`, a dedicated connected world sprite with wrought-iron leaves, wet stone pillars, taut chain, brass padlock, access reader, caged lamps, ivy, dead fescue, and a muddy planted threshold.
- Preserved the chroma source and documented the complete prompt, exact runtime rectangle, transparency settings, and ownership contract in `web/assets/rough-cut-south-service-gate-v1.md`.
- Anchored the generated gate at `x = 0, y = 0`, exactly matching the existing south collision boundary. It enters the ordinary layered-entity depth pass only after rear-camera commitment crosses 50%, preventing leakage into forward play.
- Retained transparency between the iron bars so the live rear environment remains visible. Existing foreground vegetation honestly obscures the planted base, while restrained amber lamp glow responds to the current motion preference.
- Expanded `customObjectArtAudit` from 13 to 14 generated object families and added live text truth for asset readiness, world position, collision-coordinate parity, rear-view amount, visibility, and presentation.
- The official forward smoke reported the gate ready but hidden at rear amount 0 with no browser errors. Exact-key rear validation reported rear amount 1, gate visible, `y = 0` parity, and a complete 14/14 art audit with no missing IDs or families.
- Direct inspection confirmed a grounded, imposing gate, clean transparent ironwork, live environmental depth, foreground occlusion, readable chain and padlock, and no forward-view regression. Final render samples were 1.80 ms forward and 3.60 ms rear.
- Evidence is recorded in `qa/generated-south-service-gate-polish-2026-08-05.md`. Preserve the exact boundary/rear-view contract; future changes should tune only authored scale or lamp intensity if a human playtest identifies a device-specific issue.

## South gate contact-integration polish

- Followed the new generated gate into actual movement contact and found a semantic and tactile disconnect: collision still called it `clubhouse boundary`, while the authored chain, padlock, and iron leaves did not react when tested.
- Renamed the authoritative south-edge landmark to `locked south service gate`, so the existing collision card, text state, and accessibility copy now identify the physical object the player sees.
- Added a bounded 0.72-second impact response on fresh south-edge contact. Standard motion receives a rapidly settling gate shake; Reduced Camera Motion keeps the object fixed. Both retain a centered chain-and-padlock flash with two restrained response waves.
- Added a grounded rear-view gate identity outside contact. During active contact and its release echo, that local label yields to the established orange collision card, preserving one owner for the blocker name and `MOVE FORWARD ONTO COURSE` instruction.
- Preserved the exact `y = 0` course boundary, collision resolution, movement application, rear-camera behavior, objective navigation, map, Joe AI, scoring, audio, and generated asset.
- Added text-state truth for impact activity, timer, count, motion preference, local-label visibility, and collision-card deferral.
- The official backward-input scenario displayed `BLOCKED BY // LOCKED SOUTH SERVICE GATE` with the correct recovery direction and no browser errors. Final rear-impact inspection confirmed the generated gate remains grounded, the lock flash centers correctly, the collision footprint aligns, and duplicated copy is absent.
- Live rear state reported amount 1, one active 0.62-second impact, one contact, and `identityDeferredBy = collision_card`. Final render samples were 3.10 ms in the official collision capture and 1.00 ms in the rear-impact capture.
- Evidence is recorded in `qa/south-gate-contact-integration-polish-2026-08-05.md`. Suggested next refinement: human-playtest repeated taps and sustained contact, preserving one-card ownership and exact boundary parity.

## Onboarding route-hierarchy polish

- Audited the first live gameplay frame and found a nearer `DRAIN VALVE 86m` world plaque competing with the mandatory `AUDIT BELL` route while `FIRST STEPS` was explicitly teaching movement and mint-route following.
- Kept the mandatory navigation target at full strength while giving non-selected key and valve markers a temporary 24% peripheral presentation during the ten-meter movement lesson. The persistent map and physical world remain unchanged.
- Alternate markers automatically return to their established 72% secondary emphasis when First Steps retires. An alternate inside its authoritative interaction radius still overrides the deferral and presents at full strength.
- Added text-state truth through `alternate_route_deferred`, `alphaMultiplier`, and `deferredBy = first_steps_route` without changing navigation selection, marker positions, interaction radii, routes, objectives, or Joe AI.
- Added `web/test-actions/onboarding-route-hierarchy.json` for a deterministic lesson-to-course handoff check.
- The official first-frame capture confirmed the Audit Bell route now owns the lesson while the Drain Valve remains subdued peripheral context. At 28 meters, state confirmed the deferral had retired and alternatives restored to 72%.
- Re-ran the full obstacle-aware Audit Bell scenario. The station filed, Joe investigated, the ledger advanced to 1/3, and Field Log became the next full-strength selected route without browser errors. The 618-frame interaction capture averaged 4.32 ms canvas render with a 5.80 ms final sample.
- Evidence is recorded in `qa/onboarding-route-hierarchy-polish-2026-08-05.md`. Suggested next refinement: human-playtest the first ten meters without consulting the map and tune only the 24% peripheral alpha if necessary.

## Objective-dossier hierarchy polish

- Re-audited the first live frame after cleaning up world-marker priority and found a remaining semantic conflict inside the expanded top-left dossier: `FIELD CHECKS 0/3 // AUDIT BELL` was immediately followed by a numbered `1 FIND KEY...` row, making the optional key route look like another primary check and omitting the valve choice.
- Replaced that numbered row with an explicit exit-route summary. Before commitment it reads `EXIT ROUTE // <VARIANT KEY LOCATION> OR VALVE`; key, valve, and dual-route states become `SHED ROUTE // KEY ACQUIRED`, `DRAIN ROUTE // VALVE OPEN`, and `EXIT ROUTES // SHED + DRAIN READY`.
- Kept incomplete field checks authoritative even after an exit route is prepared. The route row reports `deferredBy = field_checks` until the Night Order checks are complete, while the established primary objective function and every gameplay rule remain untouched.
- Added bounded font fitting across all three authored key-location variants and text-state truth for the primary objective, exit-route phase/copy, deferral owner, and their relationship.
- Added `web/test-actions/objective-hierarchy-drain.json` to validate an actual route-choice transition through live player input.
- Direct inspection of the official opening capture confirmed a clean mandatory-versus-route hierarchy. A second official run opened the Drain Valve, activated the 24-second soaked-course state, retained Audit Bell as the primary check, and reported `drain_committed` with `DRAIN ROUTE // VALVE OPEN` without browser errors.
- The 439-frame valve capture averaged 2.86 ms canvas render with a 6.10 ms final sample. Evidence is recorded in `qa/objective-dossier-hierarchy-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest the expanded dossier after collecting the shed key and after preparing both routes; preserve the hierarchy and tune only bounded copy sizing if necessary.

## Objective action-row polish

- Continued the expanded-dossier audit and found its third row still used generic `INTERACT / UNLOCK` copy even though the two rows above now clearly distinguished mandatory field checks from optional exit preparation.
- Added one authoritative action summary that follows the current state: ring Audit Bell, stamp Field Log, sign Release Review, prepare key/valve, file shed/drain, choose a prepared exit, Final Filing progress, or release authorization.
- The summary uses the active keyboard binding, controller `A`, or touch `USE`, inherits the current field station's authored accent, and uses bounded font fitting for long/remapped labels.
- Exposed action phase, copy, color, and target ID inside the existing text-state objective hierarchy. Gameplay prompts, objective order, interactions, navigation, scoring, and compact HUD remain untouched.
- Direct inspection of the opening frame confirmed `FIELD CHECKS 0/3 // AUDIT BELL`, the separate exit branch, and `ENTER RING AUDIT BELL` read as one plan.
- Re-ran the full Audit Bell interaction. The ledger advanced to 1/3 and the action summary became `ENTER STAMP FIELD LOG` with the Field Log target and mint accent.
- Re-ran the Drain Valve route. The branch became `DRAIN ROUTE // VALVE OPEN`, sprinklers activated, and the action row correctly remained `ENTER RING AUDIT BELL` because mandatory checks were still incomplete.
- Both official runs completed without browser errors. Evidence is recorded in `qa/objective-action-row-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest a remapped Interact binding and the post-3/3 filing handoff; preserve authoritative ownership and tune only bounded copy sizing if needed.

## Pause objective-continuity polish

- Audited the paused gameplay frame after improving the live objective dossier. The modal preserved the primary file and Joe threat state but omitted the newly authoritative next-action summary, forcing players returning after a break to reconstruct the control/verb from the dimmed world beneath it.
- Added a centered `NEXT // <BOUND ACTION>` planning line between Active File and Joe state using the same `objectiveActionHudSummary()` consumed by live gameplay.
- Inherited the active station/route/filing accent and bounded copy sizing, so keyboard remaps, controller, touch, field-check progression, prepared exits, and filing states cannot drift between gameplay and pause.
- Shifted all four unchanged pause-menu rows down 14 pixels to provide a measured planning band while preserving their size, order, selection behavior, modal bounds, descriptions, and input footer.
- Added the full next-action object to the frozen text-state pause snapshot.
- Direct inspection confirmed the active objective, `NEXT // ENTER RING AUDIT BELL`, and Joe threat read remain clearly separated above the menu. A deterministic Enter-to-resume scenario returned to live play and accepted six meters of movement with no browser errors.
- Added `web/test-actions/pause-action-continuity.json`; evidence is recorded in `qa/pause-objective-continuity-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest pause during pursuit and Final Filing, preserving the three-line hierarchy and tuning only the menu offset or action font minimum if needed.

## Paused Help context polish

- Followed the improved Pause dossier into How to Survive / Settings. The global help content and displayed controls were already current and input-aware, but entering it from a suspended round discarded the active file and newly authoritative next-action context.
- Added one slim paused-only header strip: `PAUSED FILE // <OBJECTIVE> • NEXT // <BOUND ACTION>`. It reuses the live objective/action helpers, active input method, remapped labels, station/route/filing accent, and bounded font fitting.
- Kept the clubhouse settings path intentionally context-free, preserving How to Survive as a clean global guide when no round is suspended.
- Exposed the path-specific objective, next-action object, and `single_context_strip_above_global_help` contract in text state only while paused settings are active.
- Direct inspection confirmed the strip fits above both assignment/settings columns without collision. A separate clubhouse capture confirmed the strip is absent and `pausedRunContext = null`.
- Re-ran the complete Help→Pause→Resume path; it returned to live play, retired the pause snapshot, and produced no browser errors.
- Added `web/test-actions/pause-how-to-survive.json`; evidence is recorded in `qa/paused-help-context-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest paused Help during Final Filing and with a long remapped Interact label, preserving path-specific visibility and tuning only the fitted-size floor if needed.

## Shed approach clearance polish

- Audited every authoritative solid footprint from Night Range through the maintenance shed after the final exit began feeling blocked. The shed door remained usable from outside its collision ellipse, but the release cart, stone cover, hidden hedge-gate wings, and shed wall ellipses formed two unnecessarily tight handoffs immediately before the filing apron.
- Moved the visible release cart and stone cover outward while preserving their authored art, grounding, cover value, sight blocking, map footprints, and alternating chicane role.
- Narrowed the two collision-only hedge-gate wings to match the visible opening and aligned the shed wall/door ellipses with the physical entrance. The shed stays fully opaque and solid during contact.
- Added a deterministic five-waypoint shed-approach audit to live text state. It samples the path at no more than two-meter intervals using the real 2.4-meter player radius and reports blockers, minimum edge clearance, and filing-radius reachability.
- The official client reported the route clear across 37 samples, no blocking obstacle IDs, 4.6 meters of minimum edge clearance, and a final point 11 meters from the shed inside its 16-meter interaction radius.
- `node --check web/game.js` and `git diff --check` passed. The official live Hole 1 capture completed without a browser-error artifact; the opening presentation and existing course navigation remained intact.
- Evidence is recorded in `qa/shed-approach-clearance-polish-2026-08-05.md`. Future obstacle edits in Release Corridor should preserve `shedApproach.clear = true`, a positive minimum clearance, and filing reachability.

## Night Order next-action handoff polish

- Audited a real Audit Bell completion and found the route and compact dossier updated correctly, but the loud-event consequence rail only explained that Joe was routing to the signal. The actionable next step remained separated in the upper-left HUD during the busiest part of the interaction.
- Added a bounded 3.2-second Night Order handoff bound to the same completion banner and message that created it. The existing orange consequence remains the first line; a second line names the exact current input binding and next action in the next station or exit accent.
- Kept one presentation owner. The first attempt placed the handoff in the state banner, but official capture showed that the station's distraction consequence correctly suppresses that banner. The implementation was moved into the already-visible bottom consequence rail instead of weakening the hierarchy or adding another panel.
- A newer message or state banner invalidates the handoff immediately, and its timer retires independently before the ordinary consequence message. Objectives, station order, interaction radii, Joe alert/investigation behavior, noise durations, route geometry, scoring, and generated art remain unchanged.
- The official obstacle-aware Audit Bell run completed 618 rendered frames with no browser-error artifact. Direct inspection confirmed `AUDIT BELL FILED — Joe is routing to the signal.` above `NEXT // ENTER STAMP FIELD LOG`, while the HUD, mint Field Log ribbon, distraction marker, persistent map, and Joe investigation state remained readable.
- Live text state reported `visible: true`, `nextPhase: field_check`, `nextTargetId: field-log`, and `result_first_bound_next_action_second`. The final render sample was 3.0 ms with a 3.11 ms canvas average.
- Added and ran `web/test-actions/night-order-handoff-settle.json` across the full interaction-to-expiry path. After 220 settled frames, the message, banner, and handoff were all null while the Field Log objective, route, Joe investigation, map, and live play remained intact. The 829-frame run ended without a browser-error artifact at a 3.2 ms canvas average and 3.5 ms final sample.
- Evidence is recorded in `qa/night-order-next-action-handoff-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest the 3/3 handoff with both a prepared and unprepared exit route; preserve the single bottom-rail owner and tune only the 3.2-second duration if ordinary reading speed requires it.

## Joe dialogue/world-label hierarchy polish

- Followed the Night Order handoff through its settled close-investigation state and found Joe's grounded `JOE: DISTRACTED` panel rendering directly behind the centered `JOE // "..."` subtitle. The attention panel already reported `VERIFYING DISTURBANCE`, so the overlap duplicated identity and obscured both pieces of copy.
- Split grounded-label state into authoritative `tacticalVisible` and presentation-only `visible`. While a Joe bark is actually visible, the redundant grounded panel reports `suppressedBy: joe_dialogue`; Joe's sprite, state glow, map rules, distance, AI, and attention panel remain unchanged.
- Preserved slow-footing threat pressure by explicitly consuming `tacticalVisible`, so hiding the label cannot weaken a nearby Joe warning or affect route decisions.
- Subtitle-disabled play retains the grounded label because suppression depends on `joeBarkVisible()`, not merely on a bark timer. Collision, Final Filing, settings, and other established dialogue arbitration continue to own their existing paths.
- Re-ran the full obstacle-aware Audit Bell and settle scenario. At 18 meters Joe remained tactically visible and investigating while the dialogue card rendered alone; direct inspection confirmed the overlapping grounded panel was absent and Joe's sprite, route ribbon, HUD, map, and environmental cues remained readable.
- Live state reported `worldLabel.visible: false`, `tacticalVisible: true`, `suppressedBy: joe_dialogue`, `joeBarkVisible: true`, and `joeMode: investigate`. The 836-frame run ended without a browser-error artifact at a 3.09 ms canvas average and 2.6 ms final sample.
- Evidence is recorded in `qa/joe-dialogue-world-label-hierarchy-polish-2026-08-05.md`. Suggested next refinement: human-playtest the same handoff at 100%, 120%, and 140% subtitle scale; preserve the single Joe-identity owner and tune only subtitle baseline if a specific scale crowds a nearby objective card.

## Dedicated Night Order Joe-dialogue polish

- Audited the close Audit Bell investigation as gameplay rather than presentation. Joe had an open sightline at 18 meters, rising sight detection, no hard cover, unconditional 8.2-meter capture, and a nearly expired loud-source commitment, so the objective remained dangerous rather than creating a safe AI exploit.
- Found the actual character gap in that state: all three mandatory Night Order stations still requested the optional `sprint_review` bark context, giving their distinct art, acoustics, and interactions a shared generic 14-line reaction pool.
- Added three dedicated 18-line software Product Owner / governance response pools: `night_order_audit_bell`, `night_order_field_log`, and `night_order_release_review`. Each station now declares and invokes its own context through the authoritative action definition.
- Added all three contexts to the established award-presentation queue so their dialogue retains the same delayed handoff behavior as Sprint Review and cannot talk over a higher-priority score beat.
- Preserved the rolling 12-bark freshness window, subtitle-only voice policy, Joe state/AI, station noise, investigation timing, route progression, objective handoff, and every generated asset.
- Expanded text-state truth so all three station records expose their bark context. The dynamic library inventory increased from 368 to 422 contextual reactions and from 2,962 to 3,016 total dialogue variants.
- The official obstacle-aware Audit Bell settle run selected `You just opened a governance finding.` from `night_order_audit_bell`. Direct inspection confirmed the line fits cleanly, retains the single Joe-identity hierarchy, and leaves the Field Log route, HUD, map, and physical scene readable.
- The 822-frame run ended without a browser-error artifact at a 3.25 ms canvas average and 3.4 ms final sample. Evidence is recorded in `qa/dedicated-night-order-joe-dialogue-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest Field Log and Release Review to judge tone at ordinary reading speed; preserve their dedicated contexts and adjust individual lines rather than returning to a shared pool.

## Named Night Order investigation-signal polish

- Followed the dedicated station dialogue into the immediate Audit Bell consequence and found one remaining identity break: Joe was correctly investigating the bell, but the grounded source marker still fell through to the generic `DISTRACTION` label.
- Carried the station ID, short label, and authored accent into the existing field-action lure. The shared signal helper now renders `AUDIT BELL SIGNAL`, `FIELD LOG SIGNAL`, or `RELEASE REVIEW SIGNAL` with the authoritative remaining investigation time.
- Kept the existing lure coordinates, Joe mode, alert, noise duration, search handoff, objective order, score, interaction radius, map behavior, generated station art, and sound cues unchanged.
- Exposed the active source ID, label, accent, target, countdown, and exact world label under `hole.fieldChecks.activeSignal` in `render_game_to_text` so visual feedback and Joe's true target can be audited together.
- The official 614-frame Audit Bell route reported `AUDIT BELL SIGNAL // 4.2s` at `{ x: 86, y: 148 }`, Joe in `investigate`, the next Field Log objective, and the established two-line handoff. Direct inspection confirmed the named ring sits on the physical bell signal without obscuring the player, station art, route thread, HUD, or persistent map.
- The run produced no browser-error artifact and averaged 3.52 ms of canvas rendering. `node --check web/game.js` and `git diff --check` passed.
- Evidence is recorded in `qa/named-night-order-investigation-signal-polish-2026-08-05.md`. Suggested next refinement: human-playtest the Field Log and Release Review countdowns at ordinary play speed; preserve station identity and tune only marker width if either longer name crowds a nearby prop.

## Course-map station-signal continuity polish

- Followed the newly named field signal into the persistent map and found that its source ring still used the generic lure color while the map header was claimed by unrelated `LAST SIGNAL` copy for Joe's last known position.
- Added one explicit map-header priority: a live mandatory station signal owns the short-lived header, then Joe's last known signal, then the optional Course Echo pace read. This also prevents the pre-existing last-known-Joe and Course Echo strings from drawing into the same top-right slot.
- The active map header now reports the station and authoritative countdown (`AUDIT BELL 4.3s`, `FIELD LOG 3.8s`, or `RELEASE REVIEW 4.8s`) in the station's authored accent. Its course-map source ring inherits the same accent.
- Preserved the last-known-Joe positional pulse, Course Echo line and marker, map refresh cadence, shot preview precedence, Joe AI, distraction target/timer, objective progression, map geometry, and all route guidance.
- Extended `hole.fieldChecks.activeSignal` with the exact map label and `active_field_signal` header priority so `render_game_to_text` reports the same presentation decision as the canvas.
- The official 634-frame Audit Bell route reported an active `audit-bell` signal at `{ x: 86, y: 148 }`, Joe investigating at 99 meters, Field Log next, a 3.55 ms average render, and no browser-error artifact. Direct inspection confirmed the gold `AUDIT BELL 4.3s` header fits beside `COURSE MAP`, while the gold source ring, last-known-Joe pulse, player marker, objective markers, and route remain distinct.
- `node --check web/game.js` and `git diff --check` passed. Evidence is recorded in `qa/course-map-station-signal-continuity-polish-2026-08-05.md`.
- Suggested next refinement: validate the longer Release Review header in a full late-course run; preserve the bounded fitting and priority order, tuning only the 7-pixel minimum if the authored name becomes difficult to read at compact display scale.

## Joe Attention station-investigation polish

- Followed the named world and course-map signal into the top-right threat panel and found its investigation line still hard-coded to `VERIFYING DISTURBANCE`, breaking station identity at the most important Joe-status read.
- Added an authored-color `attentionLabel` to the shared field-action signal state. Mandatory investigations now read `VERIFYING AUDIT BELL`, `VERIFYING FIELD LOG`, or `VERIFYING RELEASE REVIEW` with the same authoritative countdown used by the world and map.
- Added bounded 11-to-8-pixel fitting inside the existing 228-pixel status lane so the longer Release Review label remains contained without moving or enlarging the Joe Attention panel.
- Kept `VERIFYING DISTURBANCE` for golf-ball, noise-hazard, Status Request, and every other generic investigation. Attention priority, detection, Joe AI, alert, timers, color rules for unrelated states, panel geometry, and gameplay remain unchanged.
- The official 622-frame Audit Bell route exposed `VERIFYING AUDIT BELL // 4.2s` in text state and rendered it cleanly in the bell's gold. Direct inspection confirmed alignment with the matching world and map countdowns, next Field Log route, objective dossier, and two-line consequence rail.
- The run averaged 3.08 ms of canvas rendering, ended on a 2.9 ms sample, and produced no browser-error artifact. `node --check web/game.js` and `git diff --check` passed.
- Evidence is recorded in `qa/joe-attention-station-investigation-polish-2026-08-05.md`.
- Suggested next refinement: validate the full Release Review string at compact canvas scale; preserve the one-line threat lane and only abbreviate `RELEASE REVIEW` if the fitted 8-pixel floor proves difficult to read on a real small display.

## Evidence-attributed Joe search polish

- Followed a completed Audit Bell investigation into Joe's search phase and found `SEARCHING LAST SIGNAL` remained generic even after the player left a discoverable turf trail and the world correctly warned that Joe was following it.
- Added lightweight search-source presentation state for mandatory station sweeps, discovered turf evidence, broken sightlines, and remembered-cover audits. The latest real evidence owns the existing Joe Attention status and countdown; it does not add or extend any search.
- Station follow-up reads `SWEEPING <STATION> AREA`, trail pursuit reads `FOLLOWING TURF EVIDENCE`, contact loss reads `SWEEPING LAST SIGHTLINE`, and cover memory reads `AUDITING LAST COVER`. Listening Focus's live movement read retains higher priority.
- New chase contact clears stale context, unrelated evidence replaces it, and patrol resumption retires it. Distraction targeting, search centers, search timers, trail discovery, cover memory, Joe speeds, detection, pathing, capture distance, scoring, and map behavior remain unchanged.
- Added `web/test-actions/night-order-station-search-handoff.json`. Its first stationary version correctly ended in capture, proving the change did not create safety beside the bell. The revised route retreated after filing and allowed Joe to discover the new turf trail, validating source replacement.
- The official final capture showed `FOLLOWING TURF EVIDENCE // 6.4s` in the Joe Attention panel alongside the existing cover-shred banner, mower-lane warning, grounded Joe search label, persistent Field Log route, and map. Text state agreed on `kind: trail`, target mark 20, 6.38 seconds remaining, Joe searching at 21 meters, and no active station signal.
- The 970-frame final run averaged 3.21 ms of canvas rendering, ended on a 2.3 ms sample, and produced no browser-error artifact. `node --check web/game.js` and `git diff --check` passed.
- Evidence is recorded in `qa/evidence-attributed-joe-search-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest the lost-sightline and remembered-cover labels during an organic chase break; preserve latest-evidence ownership and adjust only wording if either read is too technical under pressure.

## Grounded Joe search-label polish

- Followed evidence attribution back into the first-person world and found Joe's nearby grounded label still used the generic `JOE: SEARCHING`, even while the screen-fixed threat panel correctly reported `FOLLOWING TURF EVIDENCE`.
- Reused the authoritative active search context to provide concise spatial labels: `JOE: TRACKING TRAIL`, `JOE: SIGHTLINE SWEEP`, `JOE: COVER AUDIT`, or `JOE: SWEEPING <STATION>`.
- Inherited the evidence accent for active searches and preserved the existing 184-pixel panel, 11-to-9-pixel bounded fitting, tether line, distance/occlusion rules, subtitle suppression, wet/sand overrides, and tactical visibility used by footing-hazard pressure.
- Added `sourceKind` to the established world-label text state so the grounded label and Joe Attention source can be compared directly.
- The official 963-frame retreat scenario rendered `JOE: TRACKING TRAIL` beside Joe while the attention panel showed `FOLLOWING TURF EVIDENCE // 6.4s`. Both reported `sourceKind: trail`; Joe remained searching at 21 meters with Field Log next.
- Direct inspection confirmed the label fits cleanly between Joe and the route ribbon without colliding with the mower-lane warning, Field Log caption, map, or bottom hiding-line consequence.
- The run averaged 2.71 ms of canvas rendering, ended on a 2.3 ms sample, and produced no browser-error artifact. `node --check web/game.js` and `git diff --check` passed.
- Evidence is recorded in `qa/grounded-joe-search-label-polish-2026-08-05.md`.
- Suggested next refinement: exercise the longer named Release Review sweep in world space; preserve bounded fitting and use an authored abbreviation only if it reaches the 9-pixel floor at ordinary canvas scale.

## Cover Shred signal-hierarchy polish

- Re-audited the evidence-search capture after grounding Joe's label and found Cover Shred simultaneously presented a top state banner, centered directional threat caption, and bottom actionable consequence—all describing the same mower move.
- Added a narrow presentation rule for the authored Cover Shred combination. While its direction caption and `leave the rough` instruction are both active, the synonymous `COVER SHRED // ROUGH ENTERING SCOPE` banner yields instead of creating a third card.
- Preserved the state-banner text, timer, lock, search source, directional caption, actionable message, threat audio, mower effects, tactic phases, target, movement, Joe AI, capture rules, and every other banner path.
- Added `cover_shred_direction_and_action_pair` as the explicit text-state deferral reason, so accessibility and automated inspection can distinguish intentional hierarchy from missing content.
- The official 962-frame retreat scenario retained one visible threat-caption card, `JOE: TRACKING TRAIL`, `FOLLOWING TURF EVIDENCE // 6.4s`, and the full bottom escape instruction while leaving the top-center course view open.
- Text state retained `COVER SHRED // ROUGH ENTERING SCOPE` with `visible: false`, the expected deferral reason, zero duplicate caption cards, Joe searching at 21 meters, and `trail` as the evidence source.
- The run averaged 4.52 ms of canvas rendering, ended on a 4.1 ms sample, and produced no browser-error artifact. `node --check web/game.js` and `git diff --check` passed.
- Evidence is recorded in `qa/cover-shred-signal-hierarchy-polish-2026-08-05.md`.
- Suggested next refinement: inspect False Retreat's simultaneous banner, caption, and message; preserve its deceptive two-stage timing and only collapse copy if the three surfaces are similarly synonymous.

## False Retreat signal-hierarchy polish

- Replayed the mandatory Audit Bell route into Joe's evidence search and confirmed False Retreat repeated its opening warning across three simultaneous surfaces: a top throttle banner, a centered directional return cue, and a bottom caution rail.
- Added a narrow opening-phase presentation rule. While `MOWER FALLS BACK // WATCH FOR THE RETURN` and the `JOE IS YIELDING THE LANE` caution are active, the synonymous `FALSE RETREAT // MOWER THROTTLE DROPPING` banner yields.
- Preserved the stored banner, timers, caption direction, caution copy, mower-headlight lane, search source, Joe AI, tactic movement, and capture behavior. The later `FALSE RETREAT // JOE RECOMMITS` reversal remains outside the rule and retains its top banner.
- Added `false_retreat_direction_and_caution_pair` as the explicit text-state deferral reason and a deterministic `web/test-actions/false-retreat-signal-hierarchy.json` route for replaying the state.
- The official 942-frame run showed one centered `WATCH FOR THE RETURN — RIGHT` cue, the full bottom caution, an open top-center course view, persistent Field Log route guidance, and no browser-error artifact.
- Text state retained the opening banner with `visible: false` and the expected deferral reason while Joe searched 72 meters to the right and followed turf evidence for 6.4 seconds.
- The run averaged 3.44 ms of canvas rendering and ended on a 4.8 ms sample. Evidence is recorded in `qa/false-retreat-signal-hierarchy-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest the retreat-to-snapback beat at ordinary input speed; preserve the single opening hierarchy and adjust only phase timing if players cannot exploit the deceptive gap before the recommit cue.

## False Retreat snapback-handoff polish

- Followed False Retreat through its complete phase sequence and found the 3.1-second withdrawal caution outlived the 2.9-second telegraph-plus-retreat, briefly telling the player Joe was still yielding after the AI had entered snapback.
- Replaced that stale copy at the exact retreat-to-snapback transition with `JOE RECOMMITS — break sideways now; the mower is snapping back to your last route.` The rail lasts exactly the established 1.45-second snapback duration.
- Preserved the retreat, snapback target, phase durations, Joe speed, investigation/search state, capture rules, top reversal banner, threat bearing, audio, and all environmental presentation.
- Added concise active predator-tactic state to `render_game_to_text`: type, phase, remaining time, duration, target, and presentation contract. Inactive tactics remain `null`.
- Added `web/test-actions/false-retreat-snapback-handoff.json` and replayed the full Audit Bell route into the reversal. The official 1,106-frame capture landed in `false_retreat / snapback` with 0.98 seconds remaining.
- The live frame showed `FALSE RETREAT // JOE RECOMMITS`, the right-side threat bearing, and the new lateral action without obscuring the hedge opening, Field Log route, Joe Attention panel, or course map. The old withdrawal message was absent.
- The run averaged 2.41 ms of canvas rendering, ended on a 2.4 ms sample, and produced no browser-error artifact. Evidence is recorded in `qa/false-retreat-snapback-handoff-polish-2026-08-05.md`.
- Suggested next refinement: playtest whether `break sideways` is sufficiently actionable on gamepad and touch; preserve the phase-aligned lifetime and use binding-specific copy only if players hesitate during the one-second response window.

## False Retreat snapback-direction polish

- Re-audited the verified snapback frame and found its center bearing still used the generic `JOE TURNS TOWARD A SOUND`, which described Joe's investigation mode but weakened the authored mower reversal.
- Reused the stable `joe_investigate` caption slot for `MOWER SNAPS BACK INTO YOUR ROUTE` during the exact False Retreat snapback. This replaces generic copy instead of stacking a second center card.
- Protected the authored text in both update orders: the phase transition refreshes the slot immediately, and the central Joe-state announcer retains the snapback wording, danger category, live Joe bearing, and remaining tactic lifetime if investigation is announced again.
- Preserved the caption queue cap, ordinary investigation copy, opening retreat caption, top recommit banner, lower lateral action, Joe Attention panel, tactic timing and target, AI, audio, route guidance, map, and all other tactic paths.
- The first replay correctly exposed an ordering regression: a later investigation announcement overwrote the transition cue. That rejected capture and an empty browser-start artifact were removed before the central ownership fix was replayed.
- The successful official 1,122-frame run landed in `false_retreat / snapback` with 0.98 seconds remaining. Its only visible center card was `MOWER SNAPS BACK INTO YOUR ROUTE — RIGHT` with category `danger`; `JOE TURNS TOWARD A SOUND` was absent from the full queued caption state.
- Direct inspection confirmed the state–direction–action hierarchy remains clear and leaves the hedge gap, Field Log route, reticle, Joe Attention panel, and course map unobstructed. The run averaged 2.48 ms of canvas rendering, ended on a 2.2 ms sample, and produced no browser-error artifact.
- Evidence is recorded in `qa/false-retreat-snapback-direction-polish-2026-08-05.md`. Suggested next refinement: validate the same authored bearing when Joe is left or behind the player; preserve live `directionFromPlayer` ownership and change only positioning if a rear bearing competes with the course-map edge.

## False Retreat cross-input action polish

- Refined the snapback's one-second survival instruction so it names the player's active control instead of asking them to translate `break sideways` under pressure.
- Keyboard copy resolves the current remapped `move_left` and `move_right` bindings; gamepad copy names `LEFT STICK`; touch copy names `LEFT PAD`. All three retain the same `cross the mower's returning line` counterplay.
- Kept the instruction on the existing protected bottom rail for exactly the established 1.45-second snapback. No new overlay, input behavior, phase timing, AI change, or movement advantage was added.
- Replayed the official snapback route with keyboard input. The 1,128-frame capture landed in `false_retreat / snapback` with 0.98 seconds remaining, exported `move_left: A` and `move_right: D`, and rendered `JOE RECOMMITS — A / D SIDEWAYS NOW; cross the mower's returning line.`
- Direct inspection confirmed the 71-character rail fits comfortably without touching the pause control, while the top reversal banner, dedicated right-bearing danger cue, hedge gap, Field Log route, Joe Attention panel, and course map remain readable.
- The run averaged 2.29 ms of canvas rendering, ended on a 2.6 ms sample, and produced no browser-error artifact. Evidence is recorded in `qa/false-retreat-cross-input-action-polish-2026-08-05.md`.
- Suggested next refinement: validate a deliberately long remapped-key pair such as `LEFT ARROW / RIGHT ARROW`; preserve dynamic binding truth and shorten only the trailing counterplay clause if that extreme case approaches the rail boundary.

## False Retreat live-input rail polish

- Audited the cross-input snapback prompt beyond its default keyboard frame. The shared rail already has bounded 15-to-10-pixel fitting, but its selected input copy was stored only once when snapback began.
- Added a single `falseRetreatSnapbackActionCopy()` source and made the rail resolve it from the current input method on every presentation frame. Switching to controller or touch during the response window now updates the visible instruction immediately.
- Added a long-binding safeguard: when the remapped left/right label pair exceeds 18 characters, the rail preserves Joe's recommit, the exact controls, and `SIDEWAYS NOW`, dropping only the secondary `cross the mower's returning line` explanation before heavy font shrink would be needed.
- Reused the same helper at the phase transition so stored message state, visible presentation, and active input begin aligned. Added an inspectable active-tactic `actionRail` contract with text, input method, live-copy flag, and fallback policy.
- Preserved the 1.45-second lifetime, default full explanation, gamepad/touch wording, bottom-rail geometry, text fitter, threat bearing, banners, input handling, AI, target, movement, and capture behavior.
- The official 1,122-frame replay landed in `false_retreat / snapback` with 0.98 seconds remaining. Active input, action-rail input, and exported binding-aware text all agreed on keyboard and `A / D`; `liveInputCopy` was `true`.
- Direct inspection confirmed the ordinary path remains visually identical: the full 71-character rail, authored right danger cue, top recommit banner, hedge opening, Field Log route, Joe Attention panel, and course map all remained clear.
- The run averaged 2.27 ms of canvas rendering, ended on a 1.8 ms sample, and produced no browser-error artifact. Evidence is recorded in `qa/false-retreat-live-input-rail-polish-2026-08-05.md`.
- Suggested next refinement: exercise an actual keyboard-to-gamepad handoff during the 1.45-second window on hardware; preserve live input ownership and only add a short debounce if incidental device noise causes prompt flicker.

## False Retreat Joe Attention polish

- Re-audited the complete snapback frame after fixing its world-space hierarchy and found the top-right Joe Attention status still said `VERIFYING DISTURBANCE`, which described a generic investigate mode rather than the active committed mower reversal.
- Added a compact `SNAPBACK COMMITTED // <time>s` phase status with the authoritative predator-tactic timer and a restrained danger-orange accent. The panel contributes timing only; the top banner, center bearing, and bottom rail continue to own state, direction, and player action.
- Gave the phase status priority below pursuit lock but above service-gate and generic investigation reads. Ordinary investigations, named field-station signals, search evidence, cadence, crosswind, and all other attention states retain their existing copy and colors.
- Added the same label, color, exact remaining seconds, and `joe_attention_phase_countdown` presentation contract to active predator-tactic text state.
- Preserved the attention meter, score projection, composure, Delivery chain, Joe mode, tactic phase duration, target, AI, audio, movement, collision, capture, map, and all other UI geometry.
- The official 1,107-frame replay landed in `false_retreat / snapback` with 0.98 seconds remaining. The panel rendered `SNAPBACK COMMITTED // 1.0s` at its full 11-pixel target size and exported the same 0.98-second timer with color `#f07441`.
- Direct inspection confirmed the compact status stays inside the panel and leaves the full state–direction–action hierarchy, hedge opening, route guidance, projection, composure, Delivery, and map readable.
- The run averaged 2.57 ms of canvas rendering, ended on a 1.9 ms sample, and produced no browser-error artifact. Evidence is recorded in `qa/false-retreat-joe-attention-polish-2026-08-05.md`.
- Suggested next refinement: inspect the opening False Retreat phase in the Joe Attention panel; preserve the deceptive `FOLLOWING TURF EVIDENCE` source read unless a short retreat countdown materially improves the player's ability to time the opening.

## Cover Shred committed-phase polish

- Applied the predator-tactic attention treatment to Cover Shred without erasing its evidence context. The 1.05-second telegraph retains `FOLLOWING TURF EVIDENCE`; only the physical 2.8-second `shred` phase switches the panel to `CUT LINE CLOSING // <time>s`.
- The committed status uses the authoritative tactic timer, restrained danger-orange accent, and the same bounded Joe Attention lane as False Retreat. Pursuit lock and unrelated panel priorities remain unchanged.
- Phase-boundary testing exposed an update-order issue: entering investigate replaced Cover Shred's directional card with generic `JOE TURNS TOWARD A SOUND`. The shared announcer now updates the existing `cover_shred` caption slot to `MOWER CUTS INTO YOUR HIDING LINE` with the cut target's live bearing and remaining duration, so no extra card is added.
- Added reusable active predator-tactic attention arbitration and exported the active status kind, label, color, exact seconds, and presentation contract under `predatorTactic.attentionPanel`.
- Preserved telegraph copy, banner suppression, `leave the rough` rail, tactic target and duration, search evidence, Joe AI, detection/capture precedence, mower movement, audio, map, route, and all non-Cover-Shred states.
- Added `web/test-actions/cover-shred-commit-attention.json`. A telegraph capture confirmed evidence-source preservation; phase-boundary tuning then isolated the first committed frame without allowing Joe's open sightline to cancel the tactic.
- The successful official 969-frame run landed in `cover_shred / shred` with 2.78 seconds remaining, Joe 19 meters away, and the player still in effective rough. The panel showed `CUT LINE CLOSING // 2.8s`; tactic and panel both exported 2.78 seconds.
- The only visible center card was `MOWER CUTS INTO YOUR HIDING LINE — RIGHT` with category `danger`; generic investigate copy was absent from the complete queue. The full bottom rail still said to leave the rough, and the top banner remained intentionally deferred.
- The run averaged 3.10 ms of canvas rendering, ended on a 2.5 ms sample, and produced no browser-error artifact. Evidence is recorded in `qa/cover-shred-committed-phase-polish-2026-08-05.md`.
- Suggested next refinement: human-playtest the full 2.8-second moving escape rather than the phase boundary; preserve pursuit's higher priority and judge whether the cut-line countdown remains useful once the player starts crossing toward fairway.

## Cover Shred rough-exit resolution polish

- Closed the committed-phase loop with explicit counterplay: once physical shredding begins, quietly leaving effective rough resolves the tactic immediately as `evaded_rough` instead of making the player wait through an obsolete mower path.
- Added a compact success handoff through the existing channels: `COVER SHRED EVADED // FAIRWAY CLEAR`, `MOWER CUT MISSES THE FAIRWAY`, and a short keep-moving instruction. No additional overlay or persistent HUD element was introduced.
- Preserved threat priority by evaluating line of sight, audible movement, and point-blank proximity before the rough-exit success. Those states record `contact_cancelled` and return Joe to normal pursuit.
- Exported the latest predator tactic, outcome, completion/cancellation counters, and outcome rule in `render_game_to_text` so success and failure can be distinguished without reading animation alone.
- Added a deterministic crouched contact regression that uses the game's own keyboard rebinding flow. It confirmed the solid hedge's live right-lane escape cue, then confirmed that Joe's sightline at 8 meters correctly overrides the attempted rough exit and records `contact_cancelled`.
- The completed capture averaged 0.33 ms of canvas rendering, ended on a 0.3 ms sample, and produced no browser-error artifact. The defeat presentation remained centered and legible at 1280×720. Evidence is recorded in `qa/cover-shred-rough-exit-resolution-polish-2026-08-05.md`.

## Cover Shred egress-routing fairness polish

- Replayed the previously failed Audit Row escape and traced the conflict to the right hedge wing: the direct left crossing is solid, while the shortest valid fairway path is forward around the wing and then left.
- Added a bounded axis-route planner that samples every 1.4 meters against the same inflated collision footprints used by player movement. Routes must reach non-rough ground within 28 meters.
- Turned the stored route into a live action rail. Keyboard instructions resolve current remapped bindings (`W FORWARD, THEN A LEFT` in the audited route); controller and touch use the same path through left-stick and left-pad wording.
- Shortened the rail to `COVER SHRED // ...` after direct screenshot inspection exposed both redundant state copy and a legacy dash-encoding blemish. Existing banner suppression, threat direction, and Joe Attention countdown retain their lanes.
- A full crouched replay followed the 13.85-meter route and reached fairway at `(49, 127)`, proving the geometry plan. Joe nevertheless closed from the tactic's 28.54-meter start into actionable visibility before completion, so pursuit correctly recorded `contact_cancelled`.
- Extended eligibility from physical reachability to time safety. Estimated crouched travel plus a 0.22-second reaction allowance is compared with Joe's real telegraph/commit speeds and the current concealment/light-adjusted moving-crouch visibility envelope. Unsafe cases defer for 0.8 seconds and retry without presenting tactic UI.
- Final official replay at the old trigger point remained in ordinary search at 27 meters with no active tactic, `coverShreds: 0`, `coverShredDeferrals: 1`, and `lastCoverShredDeferral: no_collision_clear_time_safe_egress`.
- The final screenshot preserved the evidence banner, Joe Attention source, grounded Joe label, Field Log route, world art, and course map. Rendering averaged 2.9 ms, ended at 3.3 ms, and produced no browser-error artifact. Evidence is recorded in `qa/cover-shred-egress-routing-fairness-polish-2026-08-05.md`.
- Suggested next refinement: capture a naturally time-safe Cover Shred at more than the planner's required Joe distance and verify the shortened live rail across keyboard plus one alternate input device; do not lower the new eligibility threshold merely to force a nearby test fixture.

## Shared text-encoding presentation polish

- Direct gameplay screenshot review exposed visible mojibake in otherwise finished messages, including a three-character `â€”` sequence where one em dash belonged. The project source is predominantly valid UTF-8, while the local Python static server serves `application/javascript` without a charset.
- Added an ASCII-escaped repair table for the common punctuation used throughout the game: em/en dashes, bullets, directional arrows and triangles, curly apostrophes, ellipses, comparison signs, multiplication signs, and non-breaking spaces.
- Applied normalization before shared canvas drawing, fitted-text measurement, subtitle-card measurement, and world-marker measurement so repaired strings do not drift outside frames or leave oversized cards.
- Applied the same normalization through the `render_game_to_text` JSON replacer, keeping screenshots and inspectable state aligned without mutating saved career/settings data or authored gameplay state.
- Replaced the one genuinely double-encoded Cadence legend separator with an ASCII `//` divider rather than depending on runtime repair.
- Official settings capture confirmed the Key Bindings footer renders single, evenly spaced bullet glyphs and remains inside the modal. The full gameplay replay confirmed both the trail bearing and bottom instruction render a single clean em dash.
- Node inspection of the exported gameplay message found exactly one non-ASCII code point, `U+2014`; no mojibake code points remained. Rendering averaged 3.25 ms, ended at 3.1 ms, and produced no browser-error artifact.
- Evidence is recorded in `qa/shared-text-encoding-presentation-polish-2026-08-05.md`.
- Suggested next refinement: audit an unlocked portfolio/result screen containing arrows and multiplication signs; keep normalization at the shared boundary and extend the escaped table only for a glyph proven broken in a real capture.

## Compact HUD glyph normalization polish

- Follow-up screenshot review found one remaining replacement glyph in the main gameplay HUD: the unfiled Change Request token rendered as `CR � +650` instead of `CR ◇ +650`.
- Enumerated the complete non-ASCII glyph set authored in `web/game.js` rather than adding only one fix. Extended the ASCII-escaped normalization table for `◇`, `✓`, `○`, `●`, `▣`, `▼`, `▲`, `Ⅱ`, curly double quotes, `⇩`, and `⌂`, including Windows-1252 and control-code variants.
- Preserved all earlier punctuation repair, pre-measurement sizing, subtitle frames, world-marker geometry, JSON normalization, gameplay logic, and saved data.
- Official onboarding gameplay capture at 28 meters showed a clean `CR ◇ +650` reward token, a clean `◀ DRAIN VALVE // 76m` off-screen marker, intact objective hierarchy, and no text overflow.
- Recursive inspection of every exported string found zero `U+FFFD` replacement characters and zero remaining `â` or `Ã` mojibake markers. The normalized state retained the single-glyph `◀` marker text.
- Rendering averaged 4.9 ms, ended at 2.4 ms, and produced no browser-error artifact. Evidence is recorded in `qa/compact-hud-glyph-normalization-polish-2026-08-05.md`.
- Suggested next refinement: capture the secured Change Request state to confirm `CR ✓ +650` visually; preserve the shared table and avoid substituting ASCII if the checked icon renders correctly.
