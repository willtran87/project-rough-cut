# Under the Green visual upgrade plan

Status: implementation active. Selected environment features, contact grounding, local humidity, natural spray and physical signal lenses have local acceptance evidence. Most requirements remain partial or pending, and all seven full-level release gates remain open. Track per-item evidence in under-green-visual-upgrade-ledger.json. Level 1 is the minimum quality benchmark; Under the Green should exceed it in close-range material craft, underground atmosphere and environmental storytelling.

## Art target and evidence

High-resolution pixel art in a physical 3D environment: deliberate pixel clusters, restrained material palettes, crisp texture details, convincing silhouettes, layered depth and authored lighting. The new Under the Green illustrations establish the material/mood target; Level 1 establishes the in-game consistency target. Preserve real geometry, perspective, occlusion and navigation.

Reviewed current source plus five fresh 2560x1600 Under the Green captures: root gallery, bunker, pump, range and keeper room. Evidence: output/under-green/visual-review-2026-11-13/. Compared with existing Level 1 hardware ghost/course captures and vegetation-contact captures; software captures are useful for composition, not a matched sharpness benchmark. Historical murky-water captures were also inspected, but their old sky/checkpoint UI is not treated as current behavior. New captures use controlled camera fixtures and later-run state for composition, not an ordinary-input route playthrough.

Current gaps: rope-like smooth roots; repetitive stains and wall patterns; angular mud edging; flat machine panels; conspicuous unshaded signal shapes; repeated rectangular openings; weak contact grounding; large empty upper regions in uncovered districts; and fine noise that does not consistently describe the underlying material. These are visual judgments from the captures, not claims that existing roots, mud, lights or water systems are absent.

P0 = establishes the look; P1 = brings the full route to the bar; P2 = finishing detail after the foundation is accepted. G = shared technique/standard, adopted without silently changing other chapters. L = local Under the Green art or staging.

## Foundation: pixels and materials

| ID | Priority / scope | Improvement | Acceptance |
|---|---|---|---|
| V01 | P0 G | Establish a reference board from Level 1 gameplay and the new intro/loss art, covering stone, roots, soil, water, metal and Joe. | Each new material has an explicit reference and a close/middle/distant test view. |
| V02 | P0 G | Define consistent texture pixel density by physical size; use higher-density art for close interaction props and Joe. | No giant bark pixels beside fine stone grain, stretched rust or differently scaled repeats on adjacent walls. |
| V03 | P0 G | Replace indiscriminate surface noise with authored clusters: mortar, chips, fibers, flakes and sediment. | Materials remain identifiable without color, at normal viewing distance. |
| V04 | P0 G | Provide several coordinated texture variants and broad world-anchored stain masks. | No recognizable identical stain or crack repeats in a normal corridor view; textures remain fixed during movement. |
| V05 | P0 G | Separate albedo, wetness and relief information. A bright pigment mark should not automatically become a bump or glossy patch. | Painted signs stay flat; corrosion and mortar have purposeful relief; dry areas remain matte. |
| V06 | P0 G | Preserve fine source art through sharp magnification and stable distant filtering. Review render resolution separately from asset resolution. | Compare actual render-target sizes at matched settings; no added full-screen blur or blanket low-resolution filter. Current GPU cap is 2560px wide; software adapts from a 960px cap, so a 2560px screenshot alone does not establish native detail. |

## Architecture and composition

| ID | Priority / scope | Improvement | Acceptance |
|---|---|---|---|
| V07 | P0 L | Rebuild key tunnel silhouettes with masonry vaults, irregular ribs, recessed courses and believable wall thickness. | Root gallery reads as old drainage construction from front, oblique and rear views. |
| V08 | P1 L | Break long planar walls with repairs, sealed service recesses, displaced stones and changes in construction age. | Visual variation does not imply a traversable opening in a solid collider. |
| V09 | P1 L | Give each district a different overhead profile: brick vault, bunker retaining structure, pump beams, range service supports, keeper ceiling. | Location is recognizable with district labels hidden. |
| V10 | P0 L | Resolve empty upper silhouettes in uncovered areas using appropriate retaining faces, turf overhangs, grilles or distant enclosure. | Every void reads as a deliberate outdoor opening or enclosed space; opaque walls remain opaque at every distance. No return of trees through walls. |
| V11 | P1 L | Compose foreground framing, middle-distance route and distant light/landmark at important approach views. | The first entrance, first crossing, pump return and sluice each have a deliberate composition in both travel directions. |
| V12 | P1 L | Add chipped edges, settled foundations and debris where construction actually fails. | Wear has structural causes; new decoration stays out of player, camera and scythe clearance. |

## Roots, mud and damp growth

| ID | Priority / scope | Improvement | Acceptance |
|---|---|---|---|
| V13 | P0 L | Sculpt roots with changing cross-sections, knots, forks, split bark and flattened pressure points. | Thick roots read as wood under close light rather than smooth tubes or cables. |
| V14 | P0 L | Author several large root tangles, with dominant roots and finer branching systems; vary density along the route. | Distinct silhouettes, quiet wall stretches and dense choke-point framing; no repeated root curtain. |
| V15 | P1 L | Show where roots enter masonry: lifted bricks, cracked mortar, dirt wedges and contact shade. | Roots feel embedded and load-bearing rather than pasted onto walls. |
| V16 | P1 L | Add fine root hairs and moist moss selectively to shaded crevices and ceiling knots. | Detail enriches close views without filling every pixel or creating alpha shimmer. |
| V17 | P0 L | Replace the continuous angular mud skirting with irregular deposits, rounded slumps, shelves and thinner smears. | Wall bases vary naturally; no sawtooth or uniform ribbon appearance. |
| V18 | P1 L | Build mud layers around runoff: gritty sediment, soft wet patches, drying crust, stones and trapped leaves. | Wet/dry transitions follow drainage and low points rather than random speckle. |
| V19 | P1 L | Add a restrained family of algae, mineral runs, tide marks and pale fungal growth. | Different substances have different shape, color and reflectance; bioluminescence is optional and extremely sparse. |

## Floors and water

| ID | Priority / scope | Improvement | Acceptance |
|---|---|---|---|
| V20 | P0 L | Layer the floor into worn slabs, muddy joins, shallow runnels and localized puddles. | The floor has readable large forms and does not resemble one repeated gravel sheet. |
| V21 | P1 L | Add meaningful traces: washed-out footprints, scythe grooves, sediment around bolts and golf balls caught in drains. | Marks explain movement or flow and do not falsely promise a safe route. |
| V22 | P0 L | Separate shallow puddles, moving channels and rising flood water with related but distinct materials. | Each reads immediately; deeper water obscures the bed instead of looking like transparent colored glass. |
| V23 | P0 L | Refine jets into irregular breakup, fine droplets, impact splash fans and brief spray clouds. | No solid blue streams or repeated chains of large triangular shards; clear hazard envelope remains visible. |
| V24 | P1 L | Add localized ripples from drips, footsteps, Joe and blade contact. | Rings originate at actual contact positions and fade naturally; pooled effects have a fixed budget. |
| V25 | P1 L | Make reflected practical lights fragment along water movement. | Small amber/green-gray highlights under actual lamps; no uniform bright cyan sheet or glowing foam. |
| V26 | P1 L | Give a flood rise convincing edges: climbing waterline, darkened wall bases and debris lifting at onset. | Visual height agrees with gameplay depth throughout rise/recession; no water through sealed walls; the keeper floor participates in the whole-level flood, while elevated records and shelves remain dry according to their actual height. |
| V27 | P2 L | Add sparse floating leaf clumps, silt plumes and local eddies near outlets. | Direction agrees with flow; movement is slow and varied outside active surges. |

## Lighting, shadows and atmosphere

| ID | Priority / scope | Improvement | Acceptance |
|---|---|---|---|
| V28 | P0 L | Recompose light around actual fixtures, with warm refuge areas, cold service lights and dark intervals. | Depth and material edges remain legible without lifting every surface equally. |
| V29 | P0 G/L | Add convincing contact shade beneath roots, at wall/floor joins, under machines and around Joe's feet. Prefer static/baked treatment where possible. | Objects feel grounded without dirty halos, swimming screen-space outlines or excessive render cost. |
| V30 | P1 L | Use a tightly budgeted moving shadow for Joe/scythe in selected lit encounters, or a validated cheaper equivalent. | Shadow tracks the real actor and light, stays behind opaque geometry and does not reveal hidden pursuit speed through walls. |
| V31 | P0 L | Refine fixtures themselves: dirty glass, cages, ceramic bases, wire runs, dim filaments and broken housings. | Lamps look physically installed; bright surfaces have internal structure rather than plain luminous rectangles. |
| V32 | P1 L | Tune existing independent flicker into authored slow dips and recoveries that affect nearby surfaces consistently. | No synchronized strobe; critical crossing/attack cues remain readable; Reduced Motion offers steady light. |
| V33 | P1 L | Replace uniform depth haze with restrained local humidity around channels, cold openings and low floor pockets. | Air separates layers without bleaching silhouettes or hiding navigable edges. |
| V34 | P1 G/L | Grade dark values deliberately and preserve subtle material color differences. | Near-black cloth, brown mud and green-black water remain distinguishable on normal display brightness; vignette does not hide flank threats or controls. |

## Machinery, props and story

| ID | Priority / scope | Improvement | Acceptance |
|---|---|---|---|
| V35 | P0 L | Bring the pump to hero-prop quality: shaped casing, seams, rounded pipe bends, couplings, seals, bolts and corroded feet. | Main interaction prop holds up at arm's length and visually approaches the intro's pump illustration. |
| V36 | P1 L | Detail controls with worn grip paint, cracked gauge glass, layered dial artwork and fitted brackets. | E-interactable parts remain immediately identifiable; needles and levers reflect real state. |
| V37 | P1 L | Rebuild the sluice with weight: rails, roller housings, seals, worn travel marks and accumulated muck. | Opening/closing shows a mechanically plausible path with no clipping or detached parts. |
| V38 | P1 L | Make pipes a connected system with elbows, repair sleeves, supports, insulation remnants and localized leaks. | Pipes meet fittings; rust and dampness concentrate at joints. |
| V39 | P1 L | Dress the keeper room with a few authored objects: damaged desk, damp records, empty boot rack, old course plan and maintenance tools. | The room reads as a former workplace with one narrative focal point, not scattered generic clutter. |
| V40 | P1 L | Strengthen golf identity through exposed turf roots, sand layers, drain-trapped balls, broken tees and faded course markings. | This remains the underside of a golf course rather than a generic sewer. |
| V41 | P2 L | Place small narrative compositions: a record protected from the water, a tool dragged from its rack, abandoned repairs. | Each arrangement communicates a specific story without new explanatory banners. |

## Joe, scythe and ghosts

| ID | Priority / scope | Improvement | Acceptance |
|---|---|---|---|
| V42 | P0 G/L | Match Joe's face, sweater, checked collar, trousers and shoes to the established character art. Improve pixel clusters and material separation. | Recognizable in dim close-up, front/rear/side; no luminous face or plastic-looking clothing. Shared identity, local dampness. |
| V43 | P1 L | Add restrained local wetness and mud to cuffs, trouser hems, shoes and hands. | Wear follows immersion/contact; skin, wool, leather and steel react differently to light. |
| V44 | P0 L | Refine scythe silhouette and surface detail: tapered curved blade, thin cutting edge, worn wood, fasteners and sharpened steel. | Readable from the gameplay camera at windup/mid-swing/follow-through; no magical glow or hedge-trimmer silhouette. |
| V45 | P1 L | Polish attack weight through shoulder/torso sequencing, wrist alignment and recovery settling while retaining the current fast broad cut. | Hands remain attached, feet planted, collision matches visible blade; readable at 30/60/120Hz. |
| V46 | P1 L | Add physical visual response to actual misses: masonry scrape flecks, dirt falling from roots, a low splash where steel hits water. | Effects follow actual contact and do not become oversized fireworks or obscure the next cue. |
| V47 | P1 L | Refine ghosts with dark internal shading, uneven soft dissolution and only occasional lamp-lit fragments of cloth/blade. | Continuous walking during fades; no bright white silhouette, pop-in or stationary pose; opacity remains stable through occlusion. |

## Movement, UI and presentation

| ID | Priority / scope | Improvement | Acceptance |
|---|---|---|---|
| V48 | P1 L | Add sparse environmental movement: drops collecting/falling, pipe tremor, shallow puddle disturbance and tiny loose-root motion. | Most scenery remains still; motion has a cause and avoids repetitive whole-scene sway. |
| V49 | P0 L | Rework hazard signals as weathered physical fixtures with lenses, hoods and inset symbols. | Preserve shape-plus-color coding and visibility; remove the floating flat-icon appearance. |
| V50 | P1 L | Integrate signs with chipped paint, bolt holes, water damage and real mounting. | Directions remain readable; wear does not obstruct critical instructions. |
| V51 | P1 G/L | Harmonize HUD typography, panel spacing and accent colors with Level 1. Keep the world dominant. | E/Q remain consistent; banners do not announce actions or duplicate sound cues. Required hazard/accessibility information stays available. |
| V52 | P1 L | Align opening/defeat illustrations and gameplay through the same lamp designs, wall construction, scythe form and prop colors. | Key objects in the intro are recognizable in play; the transition does not feel like a different art style. |
| V53 | P2 G/L | Refine subtle vignette and panic bob only after scene composition is working. | Adjustable/reduced settings remain effective; camera effects do not substitute for environmental craft or obscure attacks. |

## Location-specific visual targets

| Area | Target |
|---|---|
| Entrance/root gallery | Constricted wet masonry vault, an asymmetric major root knot, dim amber lamp revealing bark fibers, drips falling into shallow mud. |
| First crossing | Worn bank markings, a physically mounted pressure signal, dark water visibly accelerating and breaking into spray, an identifiable waiting bank. |
| Bunker | Exposed sand/soil strata under a ragged turf edge, retaining supports, pale drained sediment against black wet channels; enclosure/opening must be deliberate. |
| Pump house | The clearest industrial focal point: detailed green-painted machinery, red lever, restrained warm work light, connected pipes and localized oil/rust. |
| Range/service stretch | Colder light, corroded metal divisions, trapped practice balls and subtle golf infrastructure; depth framed toward the keeper approach. |
| Keeper room/sluice | Warmer light on damaged paper, tile and timber; substantial gate; modest signs of human use and an eighteenth-hole narrative focal point. |

## Implementation order and release gates

1. **One finished reference bay:** a short root-gallery section containing one lamp, wall, root knot, mud bank and water edge. Accept material scale, silhouettes and lighting together against Level 1 before spreading assets across the level.
2. **Main surfaces and architecture:** V01–V20, V28–V29, V31, V34. Resolve repetition and empty upper regions. Preserve routes/clearance.
3. **Water and focal props:** V22–V26, V35–V40, V49–V50. Upgrade the pump, crossing and sluice as complete scenes.
4. **Actors and atmosphere:** V30, V32–V33, V42–V48. Add dynamic effects only within measured budgets.
5. **Consistency and finishing:** V21, V27, V41, V51–V53 and remaining polish.

Before accepting any pass:

- Compare Level 1 and Under the Green at matched viewport, actual render resolution, quality setting and hardware path. Use close, medium and distant views, not just favorable stills.
- Review 2560x1600, 1280x720, 390x844 and 844x390, plus movement, Q rear glance, crouch and maximum/minimum FOV. Check pixel shimmer, seams, banding and alpha sorting while moving.
- Exercise low/warning/surge/receding water, whole-level flood, pump change, Joe's full attack and sluice movement. Keep visible state consistent with simulation.
- Repeat actual geometry/camera/scythe clearance checks after geometry changes. Preserve opaque walls and ceilings at distance and avoid new invisible navigation obstructions.
- Profile warm frame-time percentiles, draw calls, texture memory and startup decoding before/after. Current review views range from 56 to 281 draw calls; this is a baseline, not spare budget. Batch static detail, pool effects and keep quality fallback deliberate. Set device-specific targets from measured baselines rather than promising unmeasured 60fps.
- Validate Reduced Motion, apparition-off, brightness/readability and optional sound captions. No required danger cue depends only on color or rapid flicker.
- Require each district to be identifiable without its title and each main prop to hold up at interaction distance. The level should feel richer than Level 1 while retaining clarity during pursuit.

No new checkpoints, controls changes, banner narration, invisible speed changes or added gameplay obstacles are part of this visual plan.


## Latest visual review: priorities after pass 11

Reviewed the retained native 2560x1600 gallery, Joe and keeper captures, the final 960x540 client frame, 390x844 hardware crossing and 844x390 software crossing. Compared composition with the Level 1 hardware course/ghost reference. This is an art-direction review of existing captures, not a fresh matched-settings benchmark or full-route motion acceptance.

The strongest remaining opportunities are:

1. **Pixel-art authorship (V02-V06, V34, V42):** masonry currently has dense fine contrast across most of its surface while Joe is smoother. Organize texture into deliberate mortar, chip, bark and fabric clusters; use quiet areas to make worked edges legible. Review both material scale and actual rendering resolution.
2. **Organic silhouette and deposition (V13-V19):** preserve existing thick knots but refine smooth offshoots, pressure points and wall entry. Concentrate rounded mud buildup at low points, roots and failed joints, with thinner runoff elsewhere. Avoid evenly dressing both corridor walls.
3. **Physical signal and sign finish (V49-V50):** bright shapes still dominate as flat icons; recess them in readable dirty lenses and hoods. Move support intersections off critical lettering without reducing real clearance.
4. **Water character (V22-V26):** current dark water is a useful base; improve shallow/deep edges, broken practical-light reflections and natural spray. The keeper capture still shows cyan streaks that need desaturation and finer irregular breakup.
5. **Joe and weapon cohesion (V30, V42-V47):** improve cloth/skin/steel separation and damp contact wear; make the cutting edge readable in practical light. Validate the existing broad cut in motion. Any projected shadow must track real actor/light geometry without exposing hidden rapid pursuit.
6. **Composition and infrastructure (V07-V12, V28, V35-V40):** reduce long smooth pipe runs, give major joints/supports visual purpose, and strengthen distinct approach silhouettes in each district. Keep black recesses while allowing key close surfaces to hold detail.
7. **Presentation and acceptance (V51-V53 plus all release gates):** align typography with Level 1, reduce persistent panel competition, and preserve E/Q, cue accessibility and comfortable camera settings. The unresolved software frame-time cost must be addressed before adding expensive dynamic effects.

The 53-item list above remains the comprehensive finish standard. Existing implementations should be judged against their acceptance criteria; the ledger distinguishes implemented work from partial work. Level 1 remains the minimum bar for coherent art direction, legibility and polish, with stronger close-range material craft and environmental storytelling expected underground.

Latest pass15 qualification: V13 root-shape acceptance now has native/software close-view evidence, unchanged root topology, actual branch collars and bark clefts, plus full dry-route and camera-clearance checks. V15 gained soil pockets and updated wall-contact ribbons but remains partial. Existing moss regularity, fine masonry noise and whole-level material/lighting cohesion remain targets. This does not constitute a fresh matched Level1 benchmark or software performance acceptance. See qa/under-green-visual-upgrade-pass15-2026-11-13.md and the ledger for exact scope.

Latest pass16 qualification: V16 and V19 now have selective moss/feeder detail and a distinct damp-growth family, with native/software close views and physical receiver validation for all 1,372 growth vertices. The ledger has 11/53 locally implemented items; all seven release gates remain open. Level 1 remains the minimum bar. Next priority is coherent pixel clusters/material scale and dark-value separation (V02–V06 / V34), followed by the remaining architecture, machinery, water and actor polish. See qa/under-green-visual-upgrade-pass16-2026-11-13.md for evidence and limits.

Latest pass17 qualification: selected `surfaces-masonry-v3.png` replaces noisy masonry, concrete and ceramic art with deliberate pixel clusters and localized decay. Two brick variants share one four-metre strip at313.5source texels/metre. Final comparison evidence covers26native/responsive and20software views with unchanged draws/triangles/texture counts and exact camera-return sampling. Added source loading and approximately2MiB estimated texture storage are recorded, not hidden behind count comparisons. V02–V06 remain partial; implemented count11/53 and all seven release gates remain open. See qa/under-green-visual-upgrade-pass17-2026-11-13.md.


## Pass 18 — Level 1 HUD coherence (2026-11-13)

V51 accepted locally: current Level 1 DOM Courier typography, muted gold/ivory, square translucent panels and concise objectives, with complete paused guidance. Large optional sound captions stay clear of the aiming centre on landscape phones. Compact closure instruction remains visible during Q rear glance. Final 51-view browser pass plus fresh four-size Level 1 reference and installed-client smoke pass; actual E/Q/pump/pause/stance/controller/touch/sluice interactions verified. QA: qa/under-green-visual-upgrade-pass18-2026-11-13.md. Ledger now 12/53 implemented; all seven full-level gates remain open. V53 and all remaining environmental/actor/performance work remain in scope.


## Pass 19 — dedicated machinery pixel materials (2026-11-13)

Pump, controls and keeper release now use dedicated green enamel/bare metal/red enamel/rust artwork at627source texels per metre, with independent damp response and corrected fixed/dynamic UVs. Final27native/18software views and real E/pause/needle/latch/gate transitions pass; installedclient gameplay verified. Five maps add about8.33MiB estimatedGPU storage; draw/triangle counts unchanged, no frame-time acceptance. QA: qa/under-green-visual-upgrade-pass19-2026-11-13.md. V02/V03/V05/V06/V35/V36/V52 advance but remain partial;12/53implemented,allsevenreleasegatesopen. Fullscope retained.


## Pass 20 — pump/control finishing accepted locally (2026-11-13)

V35/V36 now meet local criteria across passes2/19/20: shaped mechanical assembly with distinct close pixel materials and seals; rounded worn red cast grip; aged dial faces and cracked glass physically above real needles. Native27/software18visual views,41mechanism views/41gatefractions,924clearcamera placements,1379dry-routeframes/106actor-tool audits and installedclient pass. QA: qa/under-green-visual-upgrade-pass20-2026-11-13.md. Ledger14/53implemented; allsevenwhole-levelgatesremainopen. No full-Level1 parity/performance claim; retainallremaining scope.


## Under the Green pass 21 - scythe craft (2026-11-13)

V44 locally implemented: inward-rounded49-vertex forged blade,2mm sharpened edge,18mm spine, dedicated high-resolution pixel wood/steel/wrap surfaces, fitted socket hardware and five merged material draws (13previously). Final21native/15software visual views,449attack samples per renderer,1379dry route frames/106mesh audits and five-burst installedclient pass. QA: qa/under-green-visual-upgrade-pass21-2026-11-13.md. Counts15implemented/30in_progress/8pending;allsevenreleasegatesopen. Actor clothing/dampness, attack weight, contact response, ghost dissolution, remaining environment and full-Level1/performance gates remain in scope. Final artifacts pass21-final,pass21-final-clearance,pass21-client; earlier pass21 art directories are intermediate.


## Under the Green pass 22 - shadow apparition finish (2026-11-13)

V47 locally implemented: dark material-separated, non-emissive ghosts with soft surface-anchored dissolution and limited real-light steel sheen. Continuous walk/interrupt/pause/retry preserved. Final33native/30software views across allfive sighting sites, actual centred behind-wall pixel test, lifecycle/flood/unseen contracts and installedclient gameplay verified. Sourcepixel variation bakes into247616bytes of attributes; oneghostdraw/no newtextures. QA: qa/under-green-visual-upgrade-pass22-2026-11-13.md. Counts16implemented/30in_progress/7pending;allsevenreleasegatesopen. Remainingactor clothing/dampness,attack weight/contact response,environment,matchedLevel1comparison and performance remain in scope. Finalartifacts pass22-all-sites andpass22-client; initialclient5secdisabled-button warning recovered by laterEnterbursts,finalplaying(0,12.68).


## Under the Green pass 23 - Joe materials (2026-11-13)

V42/V43 locally implemented: Level1 texture/tint/palette identity, nine non-emissive finishes, actual per-foot water contact and jet-wet cuffs/hands with drying/residue. Final30native/27software views, pure wetness contracts and installedclient final gameplay inspected. No new textures/draws;227904attribute bytes. QA: qa/under-green-visual-upgrade-pass23-2026-11-13.md. Ledger18implemented/30in_progress/5pending;allsevenreleasegatesopen. Next: V45/V46 attack weight/contact response, remaining environment and fullLevel1/performance verification.


## Under the Green pass 24 - scythe body acting (2026-11-13)

V45 locally implemented: shoulder-led cut, torso drive/follow-through, zero-velocity phase joins and exact blocked-strike body recovery. Blade damage path/timing, grip IK and planted feet retained. Final25native/19software views,523poses per renderer,242interruption checks,1379routeframes/106mesh audits and installedclient pass. QA: qa/under-green-visual-upgrade-pass24-2026-11-13.md. Ledger19implemented/30in_progress/4pending;allsevenreleasegatesopen. Next: V46 real-contact miss response,V30 shadows,V34 grading,remaining environment and wholeLevel1/performance checks. Fullscope retained;goalactive.


## Under the Green pass 25 - physical water contacts (2026-11-13)

V24 locally accepted afterall-six-pool,three-drip,actualfeet/blade,fade/expiry andresponsive verification. V46 advances: low ballistic blade-water splash plus subtler feet/drip fans; subframe entry andsame-locationre-entry fixed. Final18native/15software main views plus11districtviews perrenderer;819ballistic samples,existingcontact/wetnesscontracts andinstalledclient pass. QA: qa/under-green-visual-upgrade-pass25-2026-11-13.md. No new textures/materials/drawbatches;480reservedslots/38400attribute bytes,+24triangles atsampledbladefan. Ledger20implemented/30in_progress/3pending;allsevenreleasegatesopen. Remainingstone/rootmiss response requires realcontactposes becauseconservativeclearance leavesgap;do not fakeimpactparticles. Retainremainingenvironment,V30/V34/V53 andfullLevel1/performance scope;goalactive.


## Under the Green pass 26 - physical scenery impact (2026-11-13)

V46 locally implemented across passes25/26: physical steel-water splash, small masonry chips and dark falling root dirt. The forged perimeter and authored root/mud geometry are shared with collision; blocked recovery retraces the cleared path. Final31native/29software appearance views,63native/full-software mesh audits,37final-color software audits,1,379routeframes/106mesh checks,30/60/120Hz and live capture/escape pass; current18view water regression and installedclient verified. Bounded48-fragment batch adds1draw/120tri per6-fragment burst; CPU collision typed data6.35MiB. Ledger21implemented/29in_progress/3pending; allseven full-level gates stay open. QA: qa/under-green-visual-upgrade-pass26-2026-11-13.md. Next: V30/V34/V53 and remaining partial environment/material work; fullscope retained.


## Under the Green pass 27 — practical-light actor shadows (2026-11-13)

V30 locally accepted: the real animated body and scythe project onto three selected floor receivers, with an 8-bit stencil union, actual lamp flicker, depth occlusion and hidden-speed suppression. Final32native/32software views, real Q lookback/reset, sampled skin-pose equality and exact behind-wall image comparisons pass. Local paired rendering cost is documented; software absolute performance remains inadequate. Ledger22implemented/29in_progress/2pending, allseven whole-level gates open. QA: qa/under-green-visual-upgrade-pass27-2026-11-13.md. Remaining material, architecture, lighting, water, story and presentation scope is unchanged.
