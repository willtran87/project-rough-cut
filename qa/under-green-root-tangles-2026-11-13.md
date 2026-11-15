# Under the Green — tangled roots, mud banks and failing lamps

Follow-up to the user's feedback that the first damp-art pass still looked clean and uniform.

## Changes

- Replaced paired thin roots with irregular overlapping wall clusters. Main roots are 0.36–0.66 m wide at their thick end, with taper, bark grain, knuckles and smaller crossing branches. Wall roots embed into masonry so their increased visual width does not create new walking obstacles.
- Added seven authored ceiling knots with entwined thick roots and hanging feeder roots. These replace the repeated ceiling bundles generated from every floor partition. The lowest tips stay at or above 2.7 m.
- Added wet earthen deposits along 280 actual boundary segments: thin smears rising unevenly up masonry and thicker accumulation at the foot. The shape is sampled in world coordinates so neighboring floor partitions join. Dedicated mud-grit texture avoids using puddle circles on vertical banks. No hazard timing or movement rules changed.
- Reduced ambient/moon fill. Each lamp has a different failure period and phase, with a broad deep dip, hesitant recovery and low-amplitude fluctuation. Lamp lenses and halos now dim with the light pool; lenses share one instanced draw. Light never fully disappears, warning symbols retain their independent visibility, pause freezes lighting, and reduced motion holds it steady.
- Root geometry is placed in the correct spatial batch; small roots use fewer segments than thick roots. No additional shadow maps or post-processing passes.

## Evidence

`output/under-green/root-tangles/` contains full-page screenshots at 2560×1600, 1280×720, 844×390 and 390×844, including a desktop gallery view during a deep voltage dip. The existing desktop scene buffer caps at 1600×1000; HUD is native resolution.

`verify-under-green-damp-atmosphere.cjs --output=output/under-green/root-tangles` passes: geometry presence, saved E/Q/R controls, lamp lower/upper bounds and smooth frame-to-frame change, actual pause freeze and reduced-motion steadiness, no browser errors. The gallery warning remains readable during the dim-light capture.

`verify-under-green-moving-clearance.cjs --dry --output=output/under-green/root-tangles/clearance` passes the final geometry: 1,379 rendered route frames, 109 Joe mesh samples, no scenery intersections or sampled camera intersections.

The installed gameplay client walks the opening crossing and captures the junction/Joe entrance. Its screenshot and text state were inspected. This is automated play evidence, not a human assessment of horror or physical-device qualification.

Sequential 30-second production-renderer smokes at 2560×1600/FOV85 recorded 59.50 rendered frames/s on the local RTX 3090 (1600×1000 scene) and 24.13 on SwiftShader (adaptive scene settled at 480×300). Both had RAF p95 16.8 ms, fixed 16 audio voices, and no errors/context loss. RAF cadence is not the rendered-frame rate. No lap completed during this short sample; it does not establish warmed full-route resource stability or sustained device qualification.

The broad implementation goal remains paused. This pass addresses the requested visual iteration.
