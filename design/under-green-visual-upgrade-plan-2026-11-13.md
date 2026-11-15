# Under the Green visual upgrade plan

Status: implementation active. Selected environment features, contact grounding, local humidity, natural spray and physical signal lenses have local acceptance evidence. Remaining requirements are partial or pending, and all seven full-level release gates remain open. Track per-item evidence in under-green-visual-upgrade-ledger.json. Level 1 is the minimum quality benchmark; Under the Green should exceed it in close-range material craft, underground atmosphere and environmental storytelling.

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


Passes28–30: V34 dark-value/material separation accepted locally; root circumference sampling corrected across native/reduced geometry; dedicated4x4m masonry field replaces vertically repeated4x2mstrip at unchanged source texel density.23implemented29in_progress1pending,allseven gatesopen. Full requirements retained; see QA/ledger for acceptance limits.

Pass31: visible bunker/range roof loads via31knee braces; corrected invalid structural vertex-color flags that blacked out existing timber/earth. Newgeometry>=3.41m, existingbankface3.26m; inspection/gate openings preserved. V09/V10/V11 stillpartial; full53scope/seven gates retained.


## Pass 32 — retaining-wall seams

Closed a confirmed six-centimetre cap-to-upper-face gap in 47 retaining faces, with two-centimetre overlap and no added meshes, maps or lights. 4,920 mesh rays, 21 gate positions and native 34-view review pass. Distant outside sentinel visible through the original slit is fully occluded after the fix. V10 remains partial pending whole-level enclosure review; all 53 requirements and seven release gates remain in scope. See qa/under-green-visual-upgrade-pass32-2026-11-13.md for final renderer receipts and test limitations.


## Pass 33 — district overhead identities

V09 now locally implemented: pump I-beams and suspended service rack; keeper timber lining and supported joists complete the five distinct overhead profiles alongside gallery vaults, bunker shoring and range service steel. 2,796 triangles, existing maps/lights, actual E/Q/pause/reduced and 40 native/40 software views; 2,016 camera positions per renderer, 21 gate positions and 48 actor poses pass. Original material batching retained after direct timing comparison found no consistent benefit from separate ceiling batches. Full material finishing, route composition, Level 1 parity and all seven release gates remain open. Ledger24implemented/28in_progress/1pending. See qa/under-green-visual-upgrade-pass33-2026-11-13.md for source and timing evidence.


## Pass 34 — keeper timber pixel material

Selected native1254square timber artwork replaces512square procedural ring grain on keeper ceiling and furniture, at4m/313.5source texels per metre. Actual285structuralmesh hashes unchanged;32native/32software views, camera return, Q/pause/reduced and installedclient pass. Draw/map/light/shader counts unchanged; approximately6.7MiB additional estimatedtexturestorage and2,686,964encodedbytes. V02–V06 remain partial for whole-level material craft/variation; all53items and7gates retained. See qa/under-green-visual-upgrade-pass34-2026-11-13.md for generatedsource/prompt and measuredtimings.


## Pass 35 — continuous sediment banks

Merged wall deposits into continuous irregular slumps with shared normals, thin films and matching floor aprons. 144 fewer mud triangles; roots unchanged; final20native/20software views,1379routeframes/106actor audits and installedclient verified. V17/V18 remain partial for material craft and whole-route/flood review. Full53requirements/seven gates retained. See qa/under-green-visual-upgrade-pass35-2026-11-13.md.


## Pass 36 — sediment pixel material

Dedicated1254square compacted-soil artwork replaces the old627square fibrous mud quadrant at4m/313.5texels per metre. Floor shader now shares the bank physical scale.34native/34software views,285structural mesh hashes and draw/triangle/map/program count parity; installedclient verified. Source2,270,209bytes, about6MiB additional estimatedGPU storage. Material/whole-route requirements and all seven gates remain open; full53scope retained. See qa/under-green-visual-upgrade-pass36-2026-11-13.md.


## Pass 37 — sign lettering and mounting

Largeplates use native1024wide lettering and physicalwashers/boltsockets; recordsplate gains fittededgetabs. Identicalfaceart shared28to17textures, but higherresolution adds11.67MiBestimatedGPUstorage.37native/37software views,1098clearfirstcrossingrays,1379routeframes/106actoraudits andinstalledclient. V02/V06/V50 staypartial; all53requirements/seven gates retained. See qa/under-green-visual-upgrade-pass37-2026-11-13.md.


## Pass 38 — lamp glass and wiring

All17 lamps gain shallow pressed-glass crowns and fitted cable loops/glands within existing fixture envelopes.45native/45software views verify clock agreement, pause/reduced and responsive views;1379dry-routeframes/106mesh checks and installedclient verified. No new textures/lights/draws;4216added triangles. V31 remains partial for selective housing damage/wear; V32 for darkest-phase critical cue/attack readability. Full53scope/seven gates retained. See qa/under-green-visual-upgrade-pass38-2026-11-13.md.


## Pass 39 — selective lamp damage and repair

V31 locally implemented:3chipped/3bent/2riveted-repair hoods complete glass,cage,ceramic,wiring and filament work;9fixtures remain intact.45native/45software views,1379dry-routeframes/106mesh audits and installedclient verified.228additional triangles,no newdraws/maps/lights. V32 darkest-phase encounter readability and all seven full-level gates remain open. Ledger25implemented/27in_progress/1pending. See qa/under-green-visual-upgrade-pass39-2026-11-13.md;full53scope retained.


## Pass40 — low-light cue acceptance

V32 locally implemented after29crossing-state views,5district fullattack sequences,96native/96software captures and380animationframes perrenderer.17independent clocks checked240s/120Hz; source/glass/glow agreement frompass38 retained. Actual low-light candidates selected by attenuation heuristic, not absolute pixel minima. No newbrightness/runtime edits needed. WholeLevel1/route/performance/accessibility gates remain open. Ledger26implemented/26in_progress/1pending;full53scope retained. QA:qa/under-green-visual-upgrade-pass40-2026-11-13.md.


## Pass41 — sluice finish

V37 locally implemented: moving lower-rail sediment, visible guide-foot deposits and corrected machinery texture scale.41native/41software views and travel audits,101pure travel positions,1379dry-routeframes/106mesh audits and installedclient pass. Two extra draws/1152triangles, no new textures/lights. Native local timing regression and inadequate software performance remain documented. Ledger27implemented/25in_progress/1pending; all53requirements and seven release gates retained. See qa/under-green-visual-upgrade-pass41-2026-11-13.md.


## Pass42 — connected pipe craft

Four supported runs, swept east elbow, clamp fittings, three repairs and three torn insulation remnants improve the gallery/pump network. Return/outlet valve axes follow their pipes; existing drip origins meet physical weep sockets.23native/23software views, actual E/Q/pause/reduced,1379routeframes/106mesh audits and installedclient pass. More draw batches; no new image maps/lights. V38 remains partial for concentrated joint stains/wetness and full-route composition. All53requirements/seven gates retained. See qa/under-green-visual-upgrade-pass42-2026-11-13.md.


## Pass43 — causal pipe finish

V38 locally implemented: quieter aged metal, irregular joint corrosion and independent wet sheen at three actual leak sources, covering network/cross-feeds/delivery/valves.35native/35software views,2focused views each, exact189network/113pump geometry parity,96552seam samples and installedclient pass.95488attribute bytes,no newtextures/lights/geometry; local rendering costs documented. Ledger28implemented/24in_progress/1pending,allseven gatespending. Next concrete water issue: local wave offsets currently added to view-space normals need correct coordinate transformation before reflection/motion acceptance. See qa/under-green-visual-upgrade-pass43-2026-11-13.md.


## Under the Green pass 44 — stable water-light orientation

Pass44: corrected channel/puddle local wave normals using the existing per-mesh normalMatrix in the fragment shader. Final native/software actual GPU readback (66before/66after each),64views/75camera steps each, responsive/flood/pause/reduced and installed-client gameplay pass. No new textures, lights, geometry, attributes or varyings. Local timing medians stable after replacing the more expensive intermediate basis; software channel P95 and absolute software performance remain concerns. Shallow/channel/flood art distinction and full reflection acceptance remain open. QA: qa/under-green-visual-upgrade-pass44-2026-11-13.md. Ledger remains28implemented/24in_progress/1pending; allseven gates open.


## Under the Green pass 45 — water material distinction

Pass45: shallow shoreline transparency follows distance to the exact pool/runnel boundaries; stronger restrained practical-light sheen preserves visible paving. Flood normals now follow two broad slow waves. All8patches/33768coverage samples,96native and104software main views (8early reflected views excluded),6corrected focused views per renderer,36actual flood GPU samples each, pause/reduced/responsive and installedclient verified. Added6720triangles/188192geometry bytes overall, no newimages/lights/drawbatches. Localsoftware timing cost recorded; full water-art and performance acceptance remain open. QA: qa/under-green-visual-upgrade-pass45-2026-11-13.md. Ledger28implemented/24in_progress/1pending; allseven gates open.


## Pass 46 — real-surface flood contact

V26 locally implemented:102opaque receivers/19material variants, real wet band and drying residue; old separate wall film removed. Both renderers pass138GPU samples and201-time physical audit,621floor tiles/132floating leaves and elevated records.110views/75camera steps per renderer and installedclient inspected. Software performance remains poor. Ledger29implemented/23in_progress/1pending; allseven gates open. See qa/under-green-visual-upgrade-pass46-2026-11-13.md.


## Pass47 — constructed gallery vaults

Three closed barrel shells and nine fitted masonry ribs replace thin sheets/overlapping boxes. Elliptical arc-length UVs preserve physical pixel scale; original wall stain shader now survives material cloning.31views/4032camera poses per renderer,179closed meshes,75overhead rays,1379route frames/106actor audits and installedclient pass. Added2320triangles, no extra draws/textures/lights; software remains slow. V07/material/composition remain partial; ledger29implemented/23partial/1pending and allseven gates remain open. New actionable V50 finding: signal hood partially obscures the first crossing lower instruction at the close upward approach. See qa/under-green-visual-upgrade-pass47-2026-11-13.md.


## Pass48 — sign sightlines and signal framing

Pass48: first crossing plate raised above its projecting hood, first root knot moved to frame the lettering, sluice conduit bent around the release sign with correct spatial batching, and short-landscape water panel kept clear of physical signals. Final35native/35software views,2304crossing ink rays per renderer,357samples per sluice face,4176touch signal cases,2784camera poses/101gate fractions,1379routeframes/106actor audits and installedclient verified. Six gauge-back views and one distant retaining-post sightline remain documented; V50/full-route composition remain partial. All53requirements/seven gates retained; see QA for timing and evidence limits.


## Pass49 — embedded root junctions

Six compositions now seat buried root ends, fractured masonry, tapered cracks and soil in their real receivers. Final45views/6912camera poses/336support samples per renderer, contact grounding, route replay and installedclient verified. V15 locally implemented; ledger30implemented/22in_progress/1pending. All53requirements/seven gates retained. SoftwareP95 regressions and absolute cost remain unresolved. See qa/under-green-visual-upgrade-pass49-2026-11-13.md.


## Pass50 — authored practical-light direction (2026-11-14)

All17fixed fixtures now have named warm/cold roles and coherent visible/source power. V28 locally implemented after33comparison/responsive and96low-light state views per renderer,380attack frames each, clock/pause/Q/reduced and installedclient checks. Positions/ranges, geometry/maps/draw/program counts unchanged. Ledger31implemented/21in_progress/1pending; all53requirements/seven gates retained. FullLevel1/performance gates remain open. See qa/under-green-visual-upgrade-pass50-2026-11-14.md for scope and cost evidence.


## Pass53 — varied paving and historical wear (2026-11-14)

Mixed slab widths, occasional corner repairs, nine collision-checked historical wear paths and corrected313.5samples/metre bring local V20 to implemented alongside existing puddles/runnels. Final39views per renderer, unchanged20floorbatch geometry, exact before/after deposit RGB CPU/GPU channels,3,095clearwear positions and installedclient verify local behavior. No extra maps/lights/geometry. Full53requirements,48review refinements and seven release gates retained; see qa/under-green-visual-upgrade-pass53-2026-11-14.md for final cost and evidence boundaries.


## Pass 54 — shared timber and secondary root craft (2026-11-14)

Generic sawn timber and bunker shoring share the existing keeper artwork at313.5source texels/metre, with longitudinal beam and cylindrical handle mapping.53minor roots now use tapered ridged geometry and the main bark material. Final native/software25views each,512camera poses each,341unchanged named mesh hashes,1,379dry-route frames/106actor-tool audits and installed-client pass. Initial signal-capture discrepancy retained for broader motion review; fresh paired visible-lens pixel checks pass. See qa/under-green-visual-upgrade-pass54-2026-11-14.md. Material variety, selective wet highlights, full composition and performance remain open. Counts32implemented/20in_progress/1pending; allseven gatespending.


## Pass55 — selective damp response (2026-11-14)

Thin independent wet masks and15material-specific finishes concentrate glints in existing seep patches; pump enamel/iron separate more clearly.37views per renderer,370unchanged named meshes, exact lights-out comparison, installedclient and local GPU budget samples verified. No extra geometry/textures/lights; programs+10. Software performance remains poor. Full requirements and gates retained; see qa/under-green-visual-upgrade-pass55-2026-11-14.md.

## Pass56 — keeper repair composition (2026-11-14)

The desktop now contains an open layered night ledger with an unfinished entry, split bypass seal and repair drawing, spanner/fasteners, tied protected survey records, hollow cup and localized wear. Final26views per renderer,1872camera poses each, unchanged exterior-triangle fingerprints, opaque wall backing, E sluice release and installedclient pass. Existing record texture becomes a1024square four-face atlas; no extra texture count/lights/colliders, local+5draws/+4050triangles. Full requirements,48refinements and seven gates remain; see qa/under-green-visual-upgrade-pass56-2026-11-14.md for timing and limits.

## Pass57 — bunker coping and deposits (2026-11-14)

133 individually shaped coping stones replace the continuous green metal cap, with eight localized soil spills and two fitted repairs. Closed overlapping masonry cores preserve wall opacity. Final33views per renderer,4536camera poses each, six exterior-opacity probes each, exact exterior triangle fingerprints,1379route frames/106actor audits and installedclient pass. No new textures/lights/colliders; full material/composition/performance acceptance remains open. The original53requirements,48refinements and seven gates remain active; see qa/under-green-visual-upgrade-pass57-2026-11-14.md.

## Pass58 — connected gallery root canopy (2026-11-14)

Two unequal root shoulders, subordinate forks, a returning braid and tapered feeders connect the first gallery's existing living pillar to the side walls. Two wall joins receive physically seated fractured courses. Final29views and2112camera poses per renderer,448masonry support samples,2304clear crossing-lettering rays,1379route frames/106actor audits and installedclient pass. No new materials/textures/lights/colliders. This advances the first gallery composition; wet/focal lighting and full Level1 parity remain open. All53requirements,48refinements and seven gates retained. See qa/under-green-visual-upgrade-pass58-2026-11-14.md.


## Pass59 — pump work-light composition (2026-11-14)

The existing work lamp now hangs beside the motor and emits a broad downward beam with restrained cage spill. Fins/casing read more clearly while the upper wall recedes; intended west-side gauges/tags are visibly clear. Final29views per renderer,2112camera poses each, exact outside geometry, stock-light shader parity, E/pause/Q/crouch, route/actor clearance and installedclient pass. No new lights/maps/colliders; programs169to207. Shared-machine timings provisional, software slow. Full scope and all seven gates remain; see qa/under-green-visual-upgrade-pass59-2026-11-14.md.


## Pass60 — channel contact and reflection (2026-11-14)

Finer contact/sediment margins, broken source-lit highlights and continuous-phase optical ripples refine existing water without geometry or gameplay changes. Final41views and198normal probes per renderer, pressure-cycle/pause/reduced checks and installedclient pass. Sequential shared-machine budgets remain provisional; software poor. Full53requirements/48refinements/seven gates retained. See qa/under-green-visual-upgrade-pass60-2026-11-14.md.


## Pass61 — gallery root lighting (2026-11-14)

Existing gallery-entry fixture moved beside the living root shoulder with actual roof support. Four native candidates compared; final29views/4320camera poses per renderer, unchanged outside geometry, route/actor checks and installedclient pass. No added lights/maps; local12triangles and fourshader variants. Whole reference-bay/Level1 and software-performance gates remain open. See qa/under-green-visual-upgrade-pass61-2026-11-14.md.


## Pass62 — physical channel contact (2026-11-14)

Closed retaining-side deposits now expose unequal mud shoulders above the water; framed catch grates replace simple strip bars. All eight channels reviewed across native/software evidence, water geometry/state parity, 4608 camera poses per renderer and route/actor clearance pass. No new maps/lights/colliders. Broader water/material composition and all seven gates remain open. See qa/under-green-visual-upgrade-pass62-2026-11-14.md.


## Pass63 — optional crossing assistance (2026-11-14)

Normal play now omits the numerical water coaching panel. A saved chapter-only option restores it; independent sound descriptions and physical hazard cues remain. Native/software20views each prove exact scene/state/resource parity and responsive UI, with first crossing, E/Q, persistence/retry and storage-failure checks. Controller/touch setting and installed client pass. All53requirements/48refinements and seven gates retained. See qa/under-green-visual-upgrade-pass63-2026-11-14.md.


## Pass64: submerged channel sediment

V22 advances with the existing sediment artwork refracted onto the actual walking-floor height and obscured by water depth/grazing reflection.51views per renderer,32GPU depth/occlusion probes per renderer and installedclient pass; no geometry/gameplay/resource-count changes. Local timings recorded in qa/under-green-visual-upgrade-pass64-2026-11-14.md. V22 remains partial: broad shore/flood composition and all seven gates remain open. Full53scope retained.


## Pass65: gallery root foundations

Three existing gallery roots now connect to closed uneven soil lobes, embedded masonry and localized floor sediment/moisture.27views/2688camera poses perrenderer,1379routeframes/106actor inspections and finalUV-focused views/client verify local integration; no newdraws/textures/materials/lights. QA: qa/under-green-visual-upgrade-pass65-2026-11-14.md. V12/V17/V20 gain evidence without status changes. Broadgallery/district composition, fullLevel1 parity and allseven gates remain open.


Pass66: localized gallery roof-root plaster failure and connected seepage, verified against solid backing, native/software views, camera and route clearance. Source detail: `../qa/under-green-visual-upgrade-pass66-2026-11-14.md`. Added local drawing cost and poor software performance remain open; no whole-level gate or item status changes.


Pass67 qualification: bunker construction now includes ten varied shoring spans,one reinforced repair,beveled timber with distinct grain selections,fitted roof packing and interrupted soil seams. Originalenclosure/inspection openings,coping and route remain. See `../qa/under-green-visual-upgrade-pass67-2026-11-14.md` for native/software,clearance,opacity and finalartwork evidence. Broaderdistrictcomposition and allseven gates remainopen.


Pass68: software-only off-screen contact-shade index compaction preserves full art and two original transparent batches.43paired views perrenderer are pixel-identical; fullindex coverage/restoration, camera transitions, disposal and installedclient verified. Local stationary timing is modest/mixed; allseven gates remain pending. See `../qa/under-green-visual-upgrade-pass68-2026-11-14.md`.


Pass69:22settled/chipped keeper tile faces and three damp patches integrate the existing root into its wall. Original opaque backing, counter, records, plan and gameplay remain.34captures/1440camera poses perrenderer plus unit/actualE/client verify local work; +2963triangles/no new material, no newtextures/lights. See `../qa/under-green-visual-upgrade-pass69-2026-11-14.md`. Full53scope and seven pending gates retained.


Pass70: the first gallery now connects the east canopy to irregular ceiling-plaster failure and broad floor sediment fans. Closed backing, uneven fragments, existing pixel materials and deposit masks preserve route clearance. Native/software visual,2688camera poses each, flood/E states and1379dry-route frames/106Joe geometry checks pass. Added2005triangles/no newtextures/materials/lights. Full53requirements,48refinements and allseven gates remain open; see qa/under-green-visual-upgrade-pass70-2026-11-14.md.
