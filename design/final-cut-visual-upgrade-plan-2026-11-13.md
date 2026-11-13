# Final Cut visual upgrade plan

Date: 2026-11-13. Status: implementation authorized and active. Per-item evidence and remaining work are tracked in final-cut-visual-implementation-ledger.json; unchecked items are not acceptance claims.

Level 1 is the minimum acceptance standard. The target is high-resolution, deliberately authored pixel art on a physically coherent 3D world. The final level should exceed that standard in its hero machine, dramatic lighting, environmental response and ending. Retain Joe's real industrial mower direction: exaggerated, aggressive and uncanny, without intentional demonic ornament.

## Evidence and assessment

Compared existing 2560x1600 Level 1 opening/clubhouse captures with the latest Final Cut opening, mower and shelter captures, and reviewed their current source. This is an art-direction review of captured evidence and source, not a new live-playtest claim. Level 1's layered sky, foliage variety, architectural forms and warm/cool separation are stronger. Final Cut still exposes large flat sky/ground regions, uniform reed walls, repeated material grain, broad simplified mechanical panels and competing sign rectangles. Its recent detail counts do not establish artistic parity.

Reference evidence: `output/back-nine-art/level-one-2560.png`, `output/woodland-refinement/after/clubhouse.png`, `output/final-cut/pressure-detail/routes/direct-overlook.png`, `output/final-cut/pressure-detail/mower-close.png`, `output/final-cut/pressure-detail/estate-pump.png`. Source: `design/pixel-3d-art-direction.md`, `web/pixel-buildings.js`, `web/pixel-world-props.js`, `web/pixel-landscape.js`, and the `web/final-cut-*.js` scene modules.

P0 = foundational or highest visible impact. P1 = full Level 1 parity and finish. P2 = additional finale-specific polish. Existing roofs, props, mechanisms and story art should be refined where appropriate; items do not imply those features are absent.

## Art direction and rendering

- [ ] FV01 · P0 · **Create a matched Level 1 reference sheet.** Compare opening vistas, buildings, ground, vegetation, Joe, machinery and night lighting at matching camera distance, field of view and exposure.
- [x] FV02 · P0 · **Support a genuine high-resolution render tier.** Add tested 1920/2560-width rendering options where hardware supports them; the current desktop cap is 1600 pixels. Keep a deliberate performance fallback.
- [ ] FV03 · P0 · **Standardize pixel size across assets.** Set consistent visible pixel density for close hero objects, normal scenery and distant backgrounds so surfaces belong to one art style.
- [ ] FV04 · P0 · **Replace noisy surface grain with authored pixel clusters.** Use deliberate shadow groups, edge highlights, material grain and clustered wear; reduce random speckling on broad surfaces.
- [ ] FV05 · P0 · **Separate material identities.** Steel, painted enamel, rubber, wood, stone, glass and wet turf need distinct color ramps, highlights and wear patterns.
- [ ] FV06 · P0 · **Keep pixel detail stable in motion.** Tune texture sampling and distance detail so fine patterns stay crisp without crawling, sparkling or turning into mush.

## Sky, lighting and depth

- [x] FV07 · P0 · **Replace the flat sky with layered pixel artwork.** Introduce the richness of Level 1's sky through cloud banks, restrained stars, color gradients and a distant horizon.
- [x] FV08 · P1 · **Give the moon authored surface detail.** Use crater clusters, a restrained halo and cloud occlusion; replace the current plain bright disc.
- [ ] FV09 · P1 · **Build a layered estate skyline.** Add varied woodland crowns, distant rooflines and service structures beyond the arena, with coherent atmospheric depth.
- [ ] FV10 · P0 · **Rebalance the nighttime values.** Separate cool moonlit forms, warm safe areas and darker threat zones while keeping playable routes readable.
- [ ] FV11 · P0 · **Ground objects with contact shadows.** Strengthen tire, wall, step, pipe, furniture and foliage contact using bounded shadows or baked shading.
- [ ] FV12 · P1 · **Finish every light fixture.** Give lamps housings, lenses, guards, mounts and believable illumination on nearby surfaces.
- [ ] FV13 · P1 · **Refine the mower's moving light.** Improve headlight shape, surface response, intervening shadows and restrained atmospheric scatter, with light origins matching the actual lamps.
- [ ] FV14 · P2 · **Add localized atmospheric layers.** Use low mist near the swale and distant haze, with stronger staging during major beats; preserve every approach cue and visibility contract.

## Ground and water

- [ ] FV15 · P0 · **Break up the flat, striped arena appearance.** Make fairway, fringe, service lanes and rough read as an authored championship hole with purposeful variation.
- [ ] FV16 · P1 · **Add shallow terrain shape.** Introduce coherent drainage falls, berms and worn depressions; share geometry heights with feet, wheels, movement and effects.
- [ ] FV17 · P1 · **Finish path and ground transitions.** Add irregular gravel margins, buried curbs, soil lips and turf encroachment so paths do not look laid on top of the world.
- [ ] FV18 · P1 · **Author distinct ground materials.** Differentiate close-cut turf, standing rough, exposed earth, compacted service dirt, gravel and saturated ground.
- [ ] FV19 · P1 · **Make the mower leave readable evidence.** Tie flattened turf, cut direction, clipping deposits and tire marks to actual vehicle travel and mowing state.
- [ ] FV20 · P1 · **Make the swale visually change as it floods.** Progress through damp soil, darkened turf, shallow pooling and displaced mud, with readable pixel reflections and shore edges.

## Vegetation

- [x] FV21 · P0 · **Rebuild the grass screens as natural reed stands.** Vary clump height, thickness and edges so the current tall, uniform walls become believable vegetation while still fully concealing Joe.
- [x] FV22 · P1 · **Introduce a coherent planting vocabulary.** Use several grass, sedge, fern and low shrub forms appropriate to the estate, placed in purposeful groups.
- [x] FV23 · P1 · **Improve individual plant silhouettes.** Give leaves taper, bends, broken tips and varied orientations; remove obvious repeated star/cross shapes.
- [x] FV24 · P1 · **Add layered vegetation at ground level.** Place roots, dead leaves, small stones and short growth around existing boundaries without disguising traversable space.
- [x] FV25 · P1 · **Make vegetation respond to the machine.** Bend stalks around the chassis and wings, part them during emergence, and let survivors settle after the pass.
- [x] FV26 · P1 · **Distinguish ambient wind from the attack tell.** Use coherent background wind and a stronger localized disturbance whose direction and timing remain obvious when needed.

## Architecture and estate props

- [ ] FV27 · P0 · **Give each refuge its own silhouette and identity.** Make the bunker solid and defensive, the pump shelter functional and damp, and the pavilion ceremonial and neglected.
- [ ] FV28 · P1 · **Bring roofs up to Level 1 construction quality.** Upgrade broad panels with overlapping slates or corrugated sheets, thickness, ridge caps, varied edges and selective damage.
- [x] FV29 · P1 · **Finish timber construction.** Add convincing joints, braces, plank ends, restrained warping, exposed grain and hardware where the player can see them.
- [x] FV30 · P1 · **Add selective masonry relief.** Give corners, coping and near-camera stones real depth, with irregular mortar and moss collecting in plausible locations.
- [x] FV31 · P1 · **Complete shelter interiors.** Add roof undersides, joists, mounted lighting, service recesses and purposeful stored equipment while keeping every interaction clear.
- [ ] FV32 · P1 · **Refine the grandstand and championship dressing.** Improve seating variation, fasteners, rail connections, fabric, scattered remnants and the silhouette of the empty stands.
- [ ] FV33 · P1 · **Make the pump and irrigation hardware a visual centerpiece.** Finish gauges, flanges, valves, supports and staining, and show the physical change caused by operating the bypass.
- [x] FV34 · P0 · **Integrate signage into the architecture.** Reduce competing oversized labels; use consistent physical brackets, lettering, weathering and a hierarchy that keeps crucial directions legible.

## Joe's mower

- [ ] FV35 · P0 · **Finalize the industrial hero silhouette.** Unify the hood, cab, wheels, chassis and wide cutting banks into one convincing heavy machine with aggressively exaggerated proportions; retain the non-demonic direction.
- [x] FV36 · P1 · **Give body panels manufactured shape.** Use folded edges, pressed panels, curved fenders, recessed seams and intentional gaps to replace remaining box-like forms.
- [ ] FV37 · P0 · **Author close-up mower pixel materials.** Create coherent paint chips, grease, oxidation, oil runs and polished contact edges around the actual mechanism instead of evenly distributed wear.
- [x] FV38 · P1 · **Finish the tires and wheels.** Refine tread profile, sidewalls, hub depth, lug nuts and terrain-specific dirt, keeping visible radius and roll physically consistent.
- [ ] FV39 · P1 · **Make the cutting assemblies unmistakably dangerous.** Improve reel depth, blade edge highlights, bedknives, bearings, guards and dense shadow between moving parts.
- [x] FV40 · P1 · **Finish hydraulic routing and connections.** Make hoses terminate at fittings, show clamps and sleeve changes, and animate piston travel and hose flex from the actual wing state.
- [x] FV41 · P1 · **Fill out the engine and undercarriage.** Add credible axles, transmission housings, radiator depth, exhaust connections and service access within the shared clearance envelope.
- [ ] FV42 · P2 · **Give the vehicle convincing weight.** Add restrained suspension travel, acceleration pitch and wing inertia that follow motion and preserve contact and clearance.
- [ ] FV43 · P1 · **Polish the continuous driving animation.** Synchronize wheel steering, tread travel, control movement, Joe's lean and mechanical vibration through fast rolling turns.
- [ ] FV44 · P2 · **Stage a stronger emergence from concealment.** Coordinate reed movement, glimpses of metal, lamp reveal, debris and the full silhouette around the committed charge; avoid revealing the next approach prematurely.

## Joe's appearance and acting

- [ ] FV45 · P0 · **Bring Joe's face to the same pixel-art standard.** Improve eyes, brow, cheek planes, mouth and stubble so he reads at ordinary play distance and survives close inspection.
- [ ] FV46 · P1 · **Create distinct readable expressions.** Differentiate searching concentration, attack commitment, frustration, loss-screen scrutiny and his reaction to the ground giving way.
- [x] FV47 · P1 · **Light Joe as a character.** Use restrained cab/dashboard bounce and directional light to preserve his facial planes without making him glow through concealment.
- [ ] FV48 · P1 · **Improve clothing and body surfaces.** Give his established sweater, checked collar, trousers and boots deliberate folds, texture, wear and a consistent pixel scale.
- [ ] FV49 · P1 · **Polish hands, grips and seated movement.** Show fingers gripping controls, arm effort, shoulder turns and supported boots while retaining the verified contact behavior.
- [ ] FV50 · P1 · **Add character to boarding and dismount.** Refine weight shifts, hand support, hesitation and urgency around the already-clear animation path.

## Motion, effects and the physical finale

- [x] FV51 · P0 · **Replace oversized cut-grass shapes.** Use appropriately scaled stubble, clipped blades and small clumps with crisp authored silhouettes.
- [ ] FV52 · P1 · **Improve reel-driven grass ejection.** Emit clippings from the actual cutting units with believable direction, speed, lighting and settling.
- [ ] FV53 · P1 · **Add terrain-aware tire effects.** Produce dry dust, wet spray or displaced mud only where speed and ground conditions justify them.
- [ ] FV54 · P2 · **Add restrained engine and exhaust effects.** Use pixel-shaped soot, brief load-related puffs and subtle heat treatment without obscuring Joe or smearing the artwork.
- [ ] FV55 · P1 · **Improve destructible furniture aftermath.** Show distinct timber, fabric and metal fragments with readable break points, grounded resting poses and persistent damage.
- [ ] FV56 · P1 · **Connect the water effects to the machinery.** Make bypass flow, pipe rupture, splashes and the approaching mower's disturbance visibly share the same water state.
- [ ] FV57 · P2 · **Build the bogging into a visual climax.** Stage turf deformation, weight transfer, wheel churn, wing loading, rupture and shutdown as a coherent physical sequence.
- [ ] FV58 · P2 · **Finish the persistent wreck tableau.** Leave embedded wheels, folded vegetation, displaced mud, settling water and fading machine light that tell the story after motion stops.

## Story art and presentation

- [ ] FV59 · P1 · **Bring the splash art into exact visual continuity.** Match the final mower design, Joe's appearance, architecture and palette in the existing high-resolution pixel-art opening.
- [ ] FV60 · P1 · **Polish the intro's visual storytelling.** Give each frame a clear focal point and narrative purpose; use restrained layered motion and crisp transitions where useful.
- [ ] FV61 · P1 · **Strengthen the loss artwork and expression.** Make Joe's gaze, posture and the visible industrial threat carry the failure scene, with readable retry text and suitable framing.
- [ ] FV62 · P1 · **Polish the win cutscene around physical cause and effect.** Show why the machine fails and how Joe reacts, matching the playable collapse and dismount.
- [ ] FV63 · P2 · **Give the road ending a distinct visual release.** Use wider breathing room, distant traffic and a deliberate change in light and composition to contrast with the enclosed course.
- [ ] FV64 · P1 · **Maintain state and asset continuity.** Keep wetness, machine damage, grass condition, clothing and major landmarks consistent across gameplay and story imagery.
- [ ] FV65 · P0 · **Match Level 1's interface craft.** Refine type, spacing, frames, palette and hierarchy across HUD, pause, captions and outcome screens, including compact layouts.
- [ ] FV66 · P1 · **Keep warning graphics clear within the richer scene.** Preserve directional grass cues, important prompts and mute/reduced-motion equivalents while reducing competition from decorative text.

## Acceptance and delivery

- [ ] FV67 · P0 · **Use matched comparison views as the acceptance bar.** Judge final-level opening, shelter, grass, mower, Joe and ending shots against Level 1 references; texture size and object count alone do not establish parity.
- [ ] FV68 · P1 · **Review every improvement in motion.** Inspect approaches, strafing, rapid turns, cutting, boarding, capture and aftermath from front, side, rear and close views.
- [ ] FV69 · P1 · **Verify real resolution and responsive composition.** Check 2560x1600, 1920x1080, 1280x720, 844x390 and 390x844; report internal render size separately from screenshot dimensions.
- [ ] FV70 · P1 · **Preserve physical and visual truth.** Recheck collision, wheel/foot contact, boarded poses, cover, four-direction concealment and visible effect origins after geometry changes.
- [ ] FV71 · P1 · **Measure the complete rendering cost.** Set budgets from baseline frame time, texture memory, shadows, foliage overdraw and worst-case effects; preserve coherent lower-quality art.
- [ ] FV72 · P1 · **Require a complete visual acceptance pass.** Resolve flat placeholder forms, inconsistent materials, visible repetitions, light leaks, floating props, clipping and story/game mismatches across all full routes.

## Recommended production order

1. Establish references, pixel density, material palette and rendering tiers (FV01–06).
2. Complete one representative slice containing a shelter, terrain edge, reed screen, light and close mower view. Use it to prove the new finish in motion before applying it everywhere.
3. Upgrade the sky, lighting, ground and reed silhouette: these dominate the screen during play.
4. Finish the mower and Joe, including the charge and physical contact checks.
5. Bring every structure/prop up to the approved slice, then integrate water, damage and climax effects.
6. Align story artwork and UI to the finished gameplay look and complete FV67–72.

First comparison milestone: the opening overlook, a pump-shelter approach and a close mower encounter should each meet Level 1's finish in silhouette, palette, material readability, depth, composition and motion. Acceptance is visual and behavioral; avoid substituting an asset count for the comparison.

## Refreshed visual priorities

The latest ground-pass captures (`output/final-cut/visual-ground/accepted/fairway.png` and `pump-apron.png`) show progress beyond the original assessment: layered sky, distant estate architecture, masonry relief and authored ground finishes are present. The remaining wide-view weakness is the large, evenly treated central field, with similarly scaled shelters and many equally prominent sign rectangles. Close ground still reveals repeating crack islands and abrupt differences in material scale. The Level 1 clubhouse reference (`output/woodland-refinement/after/clubhouse.png`) remains stronger in architectural hierarchy, planting around foundations, depth, and warm windows against cool surroundings. These are comparisons of existing captures, not a new matched live acceptance pass.

Prioritize FV03–06, FV10–13, FV15–18, FV27–34 and FV35–49 next. Preserve completed sky, vegetation, masonry and stubble improvements. The older mower close-up remains useful for identifying broad panel shapes and mechanical-detail targets, but is not evidence of the latest environment state.

For the intended high-resolution pixel-art finish, judge deliberate pixel clusters at normal play distance, consistent material scale, crisp silhouettes, selective edge highlights, and stable movement. More texture resolution or more pieces alone do not pass. Use three levels of detail: major silhouette from across the arena; construction and material identity during approach; wear, fittings and expression at close range. Concentrate the finest work where the player actually looks: Joe and the cutting banks, refuge entrances, pump controls, and the physical ending.

Each matched view must meet Level 1 in composition, silhouette richness, material distinction, lighting depth, grounded construction, and motion stability. The finale should exceed it in machinery detail, character acting, environmental response and the collapse/aftermath. Preserve clear paths, readable grass warnings, and the established industrial mower design throughout.

## Latest review for the comprehensive visual list

Refreshed the twelve browser reference captures at a 2560x1600 viewport using `tools/capture-final-cut-reference.cjs`; the run completed without page errors. Inspected the new Level 1 service-building view and Final Cut bunker and front mower views alongside the existing clubhouse, fairway and opening-reveal references. These are diagnostic compositions, not normalized parity acceptance: internal rendering, framing, distance and lighting differ between chapters.

The current bunker has improved timber construction but still presents a broad, evenly lit rectangular wall. Prioritize a distinct roof profile, recessed construction, foundation planting and motivated local lighting. The front mower has readable lamps, tires and an imposing width; its grille, hood and canopy still need finer manufactured forms, layered mechanical depth and more selective wear. Joe needs a consistent authored pixel treatment and intentional facial lighting. The opening staging needs enough localized light to read boarding without exposing later ambushes.

Highest-impact next sequence: lighting and focal hierarchy (FV10–13, FV47), mower silhouette/materials/engine (FV35–41), differentiated refuge construction (FV27–34), terrain variation and transitions (FV15–20), then character acting and story continuity (FV45–50, FV59–66). Preserve and validate completed sky, vegetation, masonry, tire and stubble work rather than treating those features as absent. Fine detail should support a readable silhouette and material at normal play distance, with close-up fittings and wear as the final layer.

## Current comprehensive-list review

Joe now has four generated 1254-square expression variants connected to the real encounter clocks: search, attack, frustration and alarm, plus his original scrutiny face for capture. Native/software close and encounter views, all cardinal capture/escape sequences, ending restoration, full routes and concealment pass; see `qa/final-cut-visual-joe-expressions-2026-11-13.md`. FV46 remains in progress because its separate illustrated loss-screen requirement is not completed by a face hidden behind that screen. Preserve the full FV01–72 scope; coarse neck/clothing transitions, complete character parity, story continuity and performance acceptance remain open.

Latest prioritization includes the turf-condition overview and the formed-panel mower reference. The dry/damp/worn ground variation and real earth material should be retained, but the overview still needs stronger large-scale terrain composition, less visible ground repetition and a clearer hierarchy among the shelters, signs and distant estate. Level 1's clubhouse demonstrates the desired relationship between silhouette, recessed construction, clustered planting and motivated warm/cool light. Match those relationships at normal player distance before spending the remaining budget on tiny props.

The following implementation pass replaces the repeating crack-island path finish with world-aligned stone flags: finer clustered limestone detail, narrow joints, varied stone values and sparse edge chips, including the overlook, ramps and refuge floors. Native and software 19-view checks at five sizes pass. The 19 authored turf-condition regions now distinguish dry crowns, damp edges and worn approaches. These improve FV03–06/FV15/FV17/FV18 without completing their whole-level requirements; see `qa/final-cut-visual-turf-paving-2026-11-13.md`. Broad turf repetition, terrain relief, saturated-ground response and the remaining facade/character/machinery/effects/story work remain.

Joe's riding material adapter now restores the Level 1 body palette, blue collar, original face/skin blend and stepped lighting. Embedded texture identity and the face-mask coordinate basis are verified, and all 26 before/after poses match exactly. FV45/FV48 are now in progress; their facial artwork, expressions, garment wear and full pixel-density requirements remain unfinished. See `qa/final-cut-visual-joe-finish-2026-11-13.md`. The new shading is a foundation for that work, not acceptance of the existing expression or close neck/garment transitions.

For the mower, judge apparent mass from the player's approach and during an actual charge. Preserve its industrial construction and completed fittings; concentrate remaining work on substantial cutting banks, readable layers behind guards, material separation and consistent pixel treatment with Joe. Use recognizable functional exaggeration—wide cutting span, heavy tires, deep radiator and loaded suspension—to create menace. Maintain the real industrial mower direction throughout splash, loss and win art.

The FV01–72 checklist above is the comprehensive scope; completed entries are preservation/validation requirements, while unchecked entries still require work or acceptance. This prioritization review does not change implementation status or claim complete Level 1 parity.

Refreshed all twelve diagnostic browser captures at 2560x1600 with no page errors. Inspected the current Final Cut vista and bunker, the existing Level 1 clubhouse reference, and the latest formed-panels front mower capture. This review is a list/prioritization update, not implementation acceptance or a full-route test. Reference framing and internal resolution remain unequal; do not claim matched parity.

The current mower already has formed canopy edges, supports, guarded lamps, deep front machinery, detailed tires, engine construction and hydraulic fittings. Preserve these improvements. Remaining priorities include consistent authored pixel clusters across Joe and the machine, clearer separation of dark mechanical layers, selective wear, and an imposing silhouette at normal encounter distance. Do not simply enlarge every component: retain Joe, the cab, wheels and deck as readable scale references.

The refreshed 2560x1600 review after the roof and foundation-bed passes shows an expansive evenly treated field, a broad evenly lit bunker wall, repetitive close ground texture, and limited facade value variation beyond the refuge entrances. The subsequent entrance-lighting pass supplies supported caged fixtures, warm apron pools and real masonry occlusion; see qa/final-cut-visual-refuge-lighting-2026-11-13.md. Preserve the differentiated roof profiles, grounded planting, interiors and integrated signage already implemented. Level 1's clubhouse remains the target for recessed construction, material layering, depth and warm/cool lighting. Improve these relationships before adding large quantities of small decorative props. The close mower view also shows a mismatch between Joe's relatively smooth facial treatment and the coarser machine surfaces; prioritize a shared authored pixel language and readable separation of mechanical layers.

Recommended first reviewable slice: the opening overlook through the bunker/pump approach, including one actual mower emergence. It should demonstrate terrain and path transitions, a distinctly constructed refuge, restrained integrated signs, local lighting, Joe's face and machine materials, and concealment that survives the added detail. Retain all FV01–72 requirements and existing completion evidence; this review changes no acceptance status.

Current implementation note: FV36's formed canopy, hood, engine/console panels and wing housings are complete with actual support/clearance, hardware/software and route evidence. FV13 now has a calibrated working-beam output and a shared projected reflector profile. Matched stone samples at 3m and 6m retain their palette instead of washing to white, while 24m illumination remains readable. The physical moving shadows, reveal and hidden approaches are preserved. Atmospheric scattering is still outstanding, so FV13 remains unchecked. Evidence and the paired before/after gallery are in `qa/final-cut-visual-headlight-finish-2026-11-13.md` and `output/final-cut/headlight-finish/comparison.html`; no whole-level parity or complete performance claim follows from this targeted improvement.



