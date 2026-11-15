# Under the Green visual upgrade — pass31

Scope: V09/V10/V11 overhead legibility and load-bearing composition. Full53requirements and seven gates retained. These broader items remain in_progress pending full district/route acceptance.

## Implementation
Added31 overhead knee braces at actual outside retaining faces: thick reclaimed timber in bunker bays and slender steel in the range.248 associated seat/strap/bolt boxes;3348triangles added total. Reuses existing material families/maps and fixed world lights. Grain follows rotated members at physical source texel scale. Three beam ends at transitions to covered floor deliberately receive no wall brace because no outer wall exists there. No floor posts, collider, navigation, water, actor or control changes.

First visual review showed that geometry alone did not resolve the black overhead areas. bankEarth and shoringWood cloned organic materials with vertexColors=true, but their structural box batches had no color attribute. Disabled vertex colors on those two material families only; their illustrated texture and existing lighting are now visible. This is a shading-contract correction, not a new fill light or emissive lift. Browser audits verify actual batch color attributes against material flags. Original roots and mud keep their valid per-vertex shading.

Corrected enclosure metadata: overall minimum3.26m (existing bank face), new braces/seats minimum3.41m. Former4.1m summary was inaccurate; no existing geometry was lowered. Late change from3.41to3.26 affects stats only, not rendered geometry; pure final audit checks metadata against real boxes.

## Geometry evidence
verify-under-green-joinery.mjs passes. All existing box calls preserved exactly,115bunker and70range panels,17crossbeam supports and three wells unchanged. Every added vertex/box above3.4m, no overlap with inspection/gate shafts, each brace lower end at an outside wall. Rotated box UV edges maintain physical scale. Source before/current retained in pass31-source. No independent full-route collision claim needed for new overhead geometry beyond these bounded additions, but the full clearance release gate remains open for the overall upgrade.

## Rendering evidence
Initial geometry-only native43636PASS28views revealed black material problem and is superseded by final shading-fix images. Final native51865PASS28views: nine paired bunker/range views plus responsive1280x720/390x844/844x390, actualQrear glance,pause/wait andReducedMotion. Actual native desktop2560x1600. Textures and17light states unchanged; paired player/Joe states identical. Visible drawdelta0–4, submittedtriangle delta1224–3288; compiled shader count falls by4 after removing invalid color variants. Inspected before/after bunker dry route, close bearing and range-up final views. District name hidden only in QA so silhouette/material carry identity.

Final software83864 and installedclient52392 started; terminal receipts and isolated GPU timing added below. Do not use concurrent visual tests as timing evidence. No scene or global performance acceptance claimed.

## Remaining work
Pump beam/ceiling composition, gallery/keeper transitions, other partial material/environment requirements and full Level1 parity remain. The earth/wood/metal art is existing illustrated material; no image generation this pass. Allseven gatespending,23implemented29in_progress1pending. No commits/deploy/agents/deletions.


Final visual receipts: software83864terminalPASS28views,zeroerrors; actualdesktop960x600inside2560x1600viewport, drawdelta0–4/triangles216–1704/programs−4. Software bunker dry and native portrait inspected. Installed52392terminalexit0; finalshot4/state4inspected ready/playing(0,8.84),960x540,noerrorartifacts. InitialPreparing5secondclicktimeout retained; no startup acceptance claim. Native/material checks cover actual opaque bank/wood batches.

Isolated hardware budget27104terminalPASS:2560x1600, six warm pairs then24alternating completed frames per fixture. Bunker median12.6→10.7ms,P9513.8→12.3; range15.6→12.6,P9517.9→13.9. GPU-fence duration includes CPU/context-switch/poll overhead; this local result is not proof of an overall frame-rate improvement. No other owned GPUjob overlapped. Scene-wide material inventory finds10missing vertex-color attributes before, zero after. Software isolated budget16687 currentlylive.


FINAL: software budget16687terminalPASS,actual960x600. Bunker median119.8→118.2ms,P95133.1→147.7; range177.9→180.7,P95254.1→253.1. No overlapping owned GPUjobs. Software absolute frame budget remains unmet; variable tail timings preclude a blanket performance-improvement claim. Full-scene missing-color audit zero after on both renderers. All owned jobs terminal; final four source/test snapshots/hash manifest saved. No further runtime changes after metadata correction.

Next V10 audit: source math suggests a possible6cm retaining-face seam between the existing4.10m cap top and the upper face bottom4.16m on non-west-bunker edges. Verify actual joined geometry and seal any true gap before claiming full enclosure acceptance. Current bracing/material work does not prove that broader gate.
