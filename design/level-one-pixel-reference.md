# Level 1 pixel-art reference and acceptance board

This is a working art reference for the comprehensive upgrade. Screenshots are evidence of the current state, not a declaration that the pictured surfaces meet the final bar.

## Matched foundation views

| View | Before | Higher-resolution candidate | What to judge |
|---|---|---|---|
| Opening | [1280 scene in2560 viewport](../output/level-one-hd-foundation/before/opening-2560.png) | [2492 scene in2560 viewport](../output/level-one-hd-foundation/after/opening-2560.png) | skyline layers, readable signs, plant silhouette hierarchy, route |
| Service building | [Before](../output/level-one-hd-foundation/before/service-2560.png) | [After](../output/level-one-hd-foundation/after/service-2560.png) | wood grain, roof thickness, document text, rooted plants, warm practical light |
| Lit terrain | [Before](../output/level-one-hd-foundation/before/ground-2560.png) | [Physical lighting comparison](../output/level-one-hd-foundation/after-physical-light/ground-2560.png) | intact turf/path albedo, darker gaps, source falloff and object contact |

The service-building view is the strongest current close-environment reference. The lit-terrain view still needs more deliberate ground materials and fixture craft. The two service-window flat panes have since been replaced with perspective workshops; see the matched window views below. Exterior framing/light response and wider architectural craft remain open.

## Workshop-window refinement

[Former flat pane](../output/level-one-workshop-windows/before/service-building-front-2560.png) → [workshop interior](../output/level-one-workshop-windows/after/service-building-front-2560.png). [Oblique maintenance view](../output/level-one-workshop-windows/after/maintenance-shed-right-2560.png) shows room perspective behind fixed mullions. Bench, shelves, paper, tool case and hanging tools should remain attached during traversal. This is one locally verified architectural improvement, not acceptance of the whole level.

## Worn path refinement

[Before range path](../output/level-one-path-wear/before-standard_review/second-lit-path-2560.png) → [worn range path](../output/level-one-path-wear/after-standard_review/second-lit-path-2560.png). [Atlas inspection crop](../output/level-one-path-wear/after-standard_review/atlas-detail.png) makes the broken ruts, compacted patches and irregular shoulder incursions easier to judge. Sand/mud markings stay distinct. Default, eastern and closing variants use lossless bakes matching their runtime fallback. Broad terrain composition and object contact remain separate open requirements.

## Floodlight construction and haze

[Former box and stepped cone](../output/level-one-floodlight-craft/before/approach-2560.png) → [constructed fixture and sparse haze](../output/level-one-floodlight-craft/after/approach-2560.png). Judge the tilted head, reflector divisions and bracket silhouette at approach distance. [Base inspection](../output/level-one-floodlight-craft/after/base-2560.png) shows the bolted foot and junction box; [rear inspection](../output/level-one-floodlight-craft/after/rear-2560.png) shows cooling fins. The haze now leaves the ground texture visible and fades near its12m cutoff. These locally verified improvements do not establish whole-level lighting/material acceptance.

## Material/detail hierarchy

- Normal scenery should share roughly160–320 source texels/metre within a material family. Existing procedural128px/.7m textures sit around183texels/metre. Variation should describe construction, not random fine noise.
- Close inspection props, faces, readable plates and weatherboard can use roughly320–512texels/metre, with deliberate clusters large enough to survive ordinary encounter distance.
- Foliage and distance backdrops use their own silhouette-led hierarchy: large readable masses first, secondary leaf groups second, individual pixels last. Do not increase all texture sizes indiscriminately.
- Preserve nearest magnification, authored aspect ratios, stable mipmapped minification and world/object-anchored coordinates. Judge sampling during motion as a separate gate from native target size.
- Lighting should explain material form. Broad albedo texture detail must survive local lighting; no unlit grey/blue disc should replace the ground beneath a physical source.
- Highlight ramps should be sparse: cool edge light on steel, restrained warm brass, matte rubber, fibrous timber and irregular masonry. A pixel-art look does not require similarly noisy grain on all of them.

## Required future comparisons

Mower material comparison: [original glossy quarter view](../output/level-one-mower-finish/before/quarter.jpg) → [separate enamel, steel and matte rubber](../output/level-one-mower-finish/optimized/quarter.jpg). [Side view](../output/level-one-mower-finish/optimized/side.jpg) shows the quieter lower-deck wear; [near Joe](../output/level-one-mower-finish/optimized/near.jpg) and [distant actor](../output/level-one-mower-finish/optimized/far.jpg) supply current encounter references. Actor geometry/face art are unchanged. Full material and motion acceptance remains open.

Current vegetation and pond refinements: [source-lit verge](../output/level-one-verge-lighting/after/floodlight-2560.png), [former pond rim](../output/level-one-pond-banks/before-native/water-approach.jpg), [irregular darker banks](../output/level-one-pond-banks/final/after-native/water-approach.jpg), [close shallow water](../output/level-one-pond-banks/final/after-native/water-detail.jpg). Judge actual source response, grounded silhouettes and edge integration. Contact ripples and broader water/material parity remain open.

Capture matched near/mid/far stone, timber, metal, rubber, vegetation, water and Joe views. Add material swatches and normal-distance silhouettes before accepting V01.1–V01.4. Recheck lighting during actual outages, contact during walking, and text under realistic camera distance. Retain the full category ledger in level-one-comprehensive-visual-upgrade.md.

## Runoff contact refinement

[Previous reed-covered bank](../output/level-one-runoff/verified/before-native/outfall.jpg) → [physical outlet and impact rings](../output/level-one-runoff/accepted/after-native/contact-2.jpg). [Phone inspection](../output/level-one-runoff/accepted/after-native/outfall-390.jpg) re-aims at the same physical lip after walking. Judge the modest source-lit masonry, recessed pipe, clear maintenance gap, and ring origin below the falling droplet. No additional lamp or ambient fill. See `qa/level-one-pond-runoff-2026-11-13.md` for remaining water/composition/performance limits.

## Fixed lantern illumination

[Original camera-selected light](../output/level-one-practical-lighting/settled/before-native/dead-green.jpg) → [fixed physical sources on both sides](../output/level-one-practical-lighting/accepted/after-native/dead-green.jpg). The matched dead-green view shows both foreground lanterns revealing turf, path texture and their handles, with the next pair and adjacent work areas readable in the distance. All40 pre-existing lantern/station anchors now supply light; the28 path lanterns and very low ambient are unchanged. Dark intervals remain. This is local lighting progress, with source shadows and overall software performance still open.

## Sign construction

[Original front](../output/level-one-sign-craft/before-native/front.jpg) → [constructed edges and restrained wear](../output/level-one-sign-craft/after-native/front.jpg). [Rear assembly](../output/level-one-sign-craft/after-native/rear.jpg) shows the connected mast, battens and brackets; [two-sided station reverse](../output/level-one-sign-craft/after-native/station-back.jpg) retains unobscured lettering. [Phone sign view](../output/level-one-sign-craft/after-native/front-390.jpg) is aimed at the same physical object. The original readable material treatment remains; source-lighting integration is a separate open requirement.

## Shared wind response

[Verge pose A](../output/level-one-wind/after-native/verge-a.jpg) and [pose B](../output/level-one-wind/after-native/verge-b.jpg) show restrained bending under the same light. [Pond reeds](../output/level-one-wind/after-native/pond-a.jpg) retain their rooted placement and texture detail. [Phone view](../output/level-one-wind/after-native/verge-390.jpg) keeps foliage/source/HUD composition readable. These stills support shape/placement review only; runtime direction/pause/shelter tests are in the wind QA report. The range pennant remains too dark against trees for artistic acceptance, and software cost remains open.

## Range landmark refinement

[Earlier range view](../output/level-one-range-pennant/before-native/approach.jpg) → [crafted marker beside existing floodlight](../output/level-one-range-pennant/after-native/approach.jpg). [Close cloth](../output/level-one-range-pennant/after-native/cloth-a.jpg) shows stitched borders, range emblem, grommets and sparse free-edge wear. [Outage](../output/level-one-range-pennant/after-native/outage.jpg) confirms that the cloth loses its illumination with the existing fixture. [Phone view](../output/level-one-range-pennant/after-native/near-390.jpg) preserves the local composition. The local pennant-readability concern from the wind pass is resolved for the checked approaches; whole-level composition remains pending.

## Opening sign and source integration

[Former unlit board](../output/level-one-sign-lighting/before-front.jpg) → [physical reading fixture](../output/level-one-sign-lighting/after-native/front.jpg). [Source switched off](../output/level-one-sign-lighting/after-native/lamp-off.jpg) demonstrates the panel's actual light dependence. [Opening composition](../output/level-one-sign-lighting/after-native/opening.jpg) retains the original placement, path and28lanterns. [Phone](../output/level-one-sign-lighting/after-native/front-390.jpg) keeps all lettering visible, with slight natural cropping of the outer frame. The source-lit opening board is a local improvement; the other14 navigation boards and broader material/composition parity still require review.

## Body-attached apparition dissolve

[Previous uniform mid-fade](../output/level-one-spectral-surface/before-hardware/surface-30.jpg) → [uneven pixel islands](../output/level-one-spectral-surface/after-hardware/surface-30.jpg). These are close inspection renders of the actual model/material. [Natural sighting in Level 1](../output/level-one-spectral-surface/after-hardware/moving-2560.png) and [phone view](../output/level-one-spectral-surface/after-hardware/moving-390.png) retain the world, HUD and scheduled motion. The field is attached to the figure, so camera movement does not drag screen grain over it. Full supernatural identity/event composition and whole-level performance remain open; see qa/level-one-spectral-surface-2026-11-14.md.

## Connected tree crowns

[Fixed east woodland](../output/level-one-canopy-wind/before-native/east-a.jpg) → [wind pose A](../output/level-one-canopy-wind/after-native/east-a.jpg) / [wind pose B](../output/level-one-canopy-wind/after-native/east-b.jpg). [Opening composition](../output/level-one-canopy-wind/after-native/opening-a.jpg) retains the original lighting and placements. All137tree crowns now share the course wind while their lower trunks remain fixed; dark silhouettes are intentional. Stills support placement review; dynamic field, shadow, culling and comfort checks are documented in qa/level-one-canopy-wind-2026-11-14.md. Full vegetation composition and performance remain open.

## Woodland depth and clearings

[Previous Audit Row tree wall](../output/level-one-woodland-composition/before-native/audit-east.jpg) → [lower foreground groups and distant clubhouse](../output/level-one-woodland-composition/after-native/audit-east.jpg). Six authored pockets adjust28decorative trees while retaining all137trees, original textures, gameplay cover and lighting. [Opening](../output/level-one-woodland-composition/after-native/opening.jpg), [service approach](../output/level-one-woodland-composition/after-native/service.jpg) and [phone](../output/level-one-woodland-composition/after-native/audit-east-390.jpg) retain the dark atmosphere. Native/software motion and reference checks are documented in `qa/level-one-woodland-composition-2026-11-14.md`. Broader composition and pixel/material parity remain open.

## Optional sign-family illumination

[Previous Audit Bell navigation board](../output/level-one-sign-family/before-station.jpg) → [shielded reading fixture](../output/level-one-sign-family/current-native/station-front.jpg). [Reverse face](../output/level-one-sign-family/current-native/station-back.jpg), [junction board](../output/level-one-sign-family/all-native/6-field-log-front.jpg) and [phone](../output/level-one-sign-family/all-native/audit-390.jpg) show the same family treatment. All14optional boards use local Lambert source illumination and remain tied to Clear Navigation; the original opening world-light is preserved. The25local sources illuminate only their own sign assemblies and do not cast actor shadows or spill into the environment. See qa/level-one-sign-family-lighting-2026-11-14.md for checks and remaining limits.

## Audit Bell bronze and shell

[Previous inward-facing shell](../output/level-one-audit-bell/before-final-native/side.jpg) → [correct exterior and cast bronze detail](../output/level-one-audit-bell/final-native/side.jpg). [Ringing](../output/level-one-audit-bell/final-native/ringing.jpg) and [phone](../output/level-one-audit-bell/final-software/side-390.jpg) preserve the attached pixel detail. The original anchor, scale, interaction and light source remain. Dedicated atlas and corrected shell are a local V01/V08/V09 improvement; this does not accept the whole prop family. See qa/level-one-audit-bell-2026-11-14.md.

## Authored station paperwork

[Original Field Log](../output/level-one-station-paper/before-native/log-ready-2560.png) → [authored form and flat completion ink](../output/level-one-station-paper/ink-native/log-filed-2560.png). [Release Review](../output/level-one-station-paper/ink-native/release-filed-2560.png) retains all printed fields after filing; the former raised red block is replaced with a flat impression inside SIGN OFF. [Phone Field Log](../output/level-one-station-paper/ink-native/log-filed-390.png) shows the clearer main form. Faint native shadow facets, cropped close release framing and generic loose papers remain open. See qa/level-one-station-paper-2026-11-14.md; this is local paperwork progress, not whole-level acceptance.

## Native shadow-edge refinement

[Unfiltered Release Review shadow](../output/level-one-station-paper/ink-native/release-filed-2560.png) → [filtered physical shadow](../output/level-one-paper-shadows/after-native/release-filed-2560.png). The previous triangular bands came from overhead timber/sign shadows sampled through the coarse moon map. The current native filter retains the source, caster, receiver, bias and map resolution. [Opening context](../output/level-one-paper-shadows/after-route-native/opening.jpg) preserves the sparse practical lighting. Local close-paper faceting is substantially reduced; full-route contact/motion and software quality remain open. See qa/level-one-shadow-filter-2026-11-14.md.

## Service roof drainage

[Former plain pipe](../output/level-one-building-drainage/before-native/service-building-lit-corner.jpg) → [connected collars and wall supports](../output/level-one-building-drainage/after-native/service-building-lit-corner.jpg). [Eave inspection](../output/level-one-building-drainage/after-native/service-building-eave.jpg) and [outlet inspection](../output/level-one-building-drainage/after-native/service-building-outlet.jpg) show the same physical assembly under existing lighting. Both front/rear eaves have open troughs and hollow pipes. These close service-facade views inspect scenery beyond the playable boundary; actual traversal is checked at the maintenance shed. Dark sides remain dark; full wet-ground/vegetation integration and architectural acceptance remain open. See qa/level-one-building-drainage-2026-11-14.md.

## Drainage footing integration

[Rectangular splash plate and intersecting grass](../output/level-one-drainage-ground/before-native/service-building-splash.jpg) → [chipped sloping stone, stepped stain and local plant clearance](../output/level-one-drainage-ground/after-native/service-building-splash.jpg). [Phone inspection](../output/level-one-drainage-ground/after-native/service-390.jpg) shows the stepped shape more directly. Lighting is unchanged; maintenance outlets remain too dark to establish close-detail readability. Service views are inspection positions outside the playable boundary; actual movement is verified separately at the maintenance approach. This is local integration only, with broader material, composition and performance requirements still open.

## Coursed stone cover

[Former attached blocks at the water crossing](../output/level-one-coursed-stone/before-native/water-crossing.jpg) → [fitted staggered courses](../output/level-one-coursed-stone/after-native/water-crossing.jpg). [Near material and joint view](../output/level-one-coursed-stone/after-native/stone-3.jpg), [phone](../output/level-one-coursed-stone/after-native/water-390.jpg), and [actual walked view](../output/level-one-coursed-stone/client-native/page-1.png). All six stone cover objects retain their gameplay volume and existing light sources. This establishes a locally improved constructed silhouette, not whole-route acceptance. Some walls remain too dark for detailed reading, causal wear remains limited, and the initial culling alarm was traced to a faulty test reference. Corrected baseline/current images and restoration are exact in all30checked views; broader software fidelity/performance acceptance remains open. See the corresponding QA and culling-reference correction.

## Stone surface weathering

[Previous mineral faces](../output/level-one-stone-weathering/before-native/stone-3.jpg) → [damp courses and joint runoff](../output/level-one-stone-weathering/after-native/stone-3.jpg). [Normal route distance](../output/level-one-stone-weathering/after-native/water-1280.jpg), [phone](../output/level-one-stone-weathering/after-native/water-390.jpg) and [actual walking client](../output/level-one-stone-weathering/client-native/page-1.png) show the finish under unchanged practical lighting. Judge the irregular ground-contact stain, sparse worn edges and retained mineral detail. Geometry and lighting are unchanged. Whole-route readability, broader materials and software high-resolution performance remain open; see qa/level-one-stone-weathering-2026-11-14.md.

## Sky and practical-light hierarchy

[Previous opening](../output/level-one-sky-hierarchy/before-native/opening.jpg) → [restrained moon/cloud highlights](../output/level-one-sky-hierarchy/after-native/opening.jpg). [Sky-facing view](../output/level-one-sky-hierarchy/after-native/sky.jpg) retains the horizon and tree silhouettes; [phone](../output/level-one-sky-hierarchy/after-software/opening-390.jpg) preserves the route lights. Physical-world pixels remain byte-identical in24matched views. This improves local visual hierarchy; large dark foregrounds and whole-route composition remain open. See qa/level-one-sky-hierarchy-2026-11-14.md.

## Hedge silhouettes and attached growth

[Former round hedge decorations](../output/level-one-hedge-growth/before-native/range-side.jpg) → [pointed leaves and connected shoots](../output/level-one-hedge-growth/after-native/range-side.jpg). [Audit approach](../output/level-one-hedge-growth/after-native/audit-west.jpg) and [phone](../output/level-one-hedge-growth/after-native/hedge-390.jpg) retain the solid cover silhouette and existing illumination. All23hedge cores remain geometrically identical; whole-route dark-area composition and foliage motion remain open. See qa/level-one-hedge-growth-2026-11-14.md.

## Lantern glass and source detail

[Former flat glass](../output/level-one-lantern-glass/before-native/dead-lantern.jpg) → [mantle centres, pane edges and soot](../output/level-one-lantern-glass/after-native/dead-lantern.jpg). [Phone](../output/level-one-lantern-glass/after-native/lantern-390.jpg) and [actual movement](../output/level-one-lantern-glass/client-native/page-1.png) show the clustered finish at relevant sizes. All 28 path lamps retain their symmetric placement and light output; station completion tint remains distinct. Switching off only the map restores the original render exactly in 58 matched views. This improves local source/material craft; broad scene hierarchy and software fidelity/performance remain open. See qa/level-one-lantern-glass-2026-11-14.md.

## Dropped station forms

[Previous ruled polygons](../output/level-one-dropped-paper/before-native/paper-0.jpg) -> [printed, source-lit Field Logs](../output/level-one-dropped-paper/after-native/paper-0.jpg). [Release-station approach](../output/level-one-dropped-paper/after-native/paper-6.jpg) and [phone](../output/level-one-dropped-paper/after-software/paper-6-390.jpg) show the existing folds with station-specific typography, restrained ground stains and local warm illumination. [Dark service approach](../output/level-one-dropped-paper/after-native/paper-3.jpg) deliberately retains low visibility. Adjacent unlit scuffs still need material integration. This is local prop/story progress, not whole-route acceptance; see qa/level-one-dropped-paper-2026-11-14.md.

## Grounded work-station approaches

[Former pale polygon trail](../output/level-one-approach-wear/before-native/paper-2.jpg) -> [wear integrated into the lit terrain](../output/level-one-approach-wear/after-native/paper-2.jpg). [Release Review on phone](../output/level-one-approach-wear/after-native/release-390.jpg) preserves the source-lit ground and dark intervals. Surface wear modulates the existing terrain colours; it is intentionally subtle away from lights. All63original approach marks are covered across three variants without additional rendering passes. This resolves the local flat-scuff issue observed during paperwork review; broader material, work-area and route-composition acceptance remain open. See qa/level-one-approach-wear-2026-11-14.md.

## Clubhouse crossing hierarchy

[Former bright panes with dark facade](../output/level-one-landmark-light/before-native/clubhouse.jpg) → [occupied upper room and revealed facade](../output/level-one-landmark-light/after-native/clubhouse.jpg). [West approach](../output/level-one-landmark-light/after-native/clubhouse-west.jpg) shows existing timber/plaster/masonry illuminated by the repositioned existing source; [phone](../output/level-one-landmark-light/after-native/clubhouse-390.jpg) retains the central focal point. Neighbouring rooms are dimmer, with fixed object-attached brightness. No additional lights or ambient increase. This is local composition/interior progress; fullroute reveals, source shadows, material-cluster consistency and software fidelity remain open. See qa/level-one-landmark-light-2026-11-14.md.

## Opening phone and route composition

[Previous held phone](../output/level-one-arrival-composition/before-native/age-2.6.jpg) -> [smaller reading position and pixel lettering](../output/level-one-arrival-composition/after-native/age-2.6.jpg). [Normal moving gameplay](../output/level-one-arrival-composition/client-native-headed/page-2.png), [portrait](../output/level-one-arrival-composition/after-native/read-390.jpg) and [fully lowered before expiry](../output/level-one-arrival-composition/after-native/age-6.19.jpg) show the relevant composition. Message/lifetime/priority rules are unchanged. One anomalous page capture was not reproduced in canvas, repeated headless, headed or ray checks; retain it as an unresolved capture-origin observation. First-person hand art, wider reveal composition and software fidelity remain open. See qa/level-one-arrival-composition-2026-11-14.md.

## First-person grip and material finish

[Previous phone grip](../output/level-one-hand-finish/phone-before-native/read-390.jpg) -> [continuous palm and curled side grip](../output/level-one-hand-finish/phone-native/read-390.jpg). [Lantern-lit club view](../output/level-one-hand-finish/club-lit-native/aim-2560.png) shows the shared quieter skin and directional cloth under existing lighting. [Diagnostic side construction](../output/level-one-hand-finish/geometry/side.png) uses studio lighting solely to inspect contact and shape; it is not a gameplay-lighting change. Pixel material density, broader anatomy/encounter lighting and full route acceptance remain open. See qa/level-one-hand-finish-2026-11-14.md.

## Hedge surface detail

[Lit range hedge](../output/level-one-hedge-surface/after-native/range-side.jpg) and [actual retreat](../output/level-one-hedge-surface/client-retreat-native/page-1.png) show deliberate connected leaves and folded source response. Original opaque geometry and lighting remain unchanged. Wider black silhouette composition and software fidelity/performance remain open.

## Moon directional coherence

[Opening](../output/level-one-moon-alignment/after-native/opening.jpg) and [range](../output/level-one-moon-alignment/after-native/range-approach.jpg) now use the visible moon bearing for physical illumination. All source powers are retained. [Backlit Joe](../output/level-one-moon-alignment/shadow-motion/joe-contact.jpg) demonstrates remaining actor-readability limits; this correction is not full composition acceptance.
