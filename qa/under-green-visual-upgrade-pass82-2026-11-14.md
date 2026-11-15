# Under the Green pass82: gallery focal composition

Local progress toward V11/V28/V31/V52. All53 requirements,48 refinements and seven whole-level gates remain in scope. No item status promotion.

## Retained change

The existing gallery-entry lamp moves four metres along the west side, from(-3.9,11.5) to(-3.9,15.5). Its housing, glass, cable, support, actual light and associated atmosphere all follow the same source position. Power, hue, flicker, reach and all16 other lamps remain unchanged. No texture, material, collider or additional light is introduced.

Three current native candidates were inspected from entrance, close root and return. The retained rear-west position shows the physical warm lamp against the damaged west vault, separates the dark foreground canopy from its lit background, and gives existing wet ground a small source reflection. The cold crossing remains the distant destination. The east-side candidate was rejected: it emphasizes the broad right plaster/wall and gives less useful balance around the main canopy.

This improves the gallery image but is not acceptance of the full reference bay or Level1 parity. Broad plaster/paving, root-wall integration, selective material clusters and whole-route composition remain open. Joe's two still poses establish local visibility only; they do not qualify his full attack animation.

## Verification

Final native56045 exited0:37 captures including12 paired scene/actor views plus paired flood,1280x720,390x844,844x390, real E bypass, Q rear, crouch, pause, Reduced Motion and the entry lamp's minimum intensity. Actual main buffer2560x1600.4,992 camera poses clear. Camera return is pixel-stable; no browser errors.

313,436 outside-fixture triangles have the same exact position hash3488489416.504 lamp/support triangles have the same shape hash1591941847 after removing their four-metre translation (0.1mm quantization for translated coordinates). All other lamps match exactly and the new lamp has a real ceiling mount. Entry rendering remains530draws/433,988triangles/55textures/211programs. Root-facing view adds one visible two-triangle effect; reverse view removes one. Geometry itself is preserved.

The first aggregate comparison failed on ten hood triangles because its old exclusion ended exactly on the front edge, without floating-point tolerance. The corrected audit restricts exclusions to the actual fixture's service materials and source-relative bounds, then independently compares the moved shape. Initial native81324/software38902 runs are superseded by accepted-* evidence; they are not passing suites.

Installed client9795 exited0 after12 input bursts. Initial Preparing click timeout recovered using the subsequent Enter input. Finalready/playing,checkpoint0,player(0,15.24),elapsed3.0667,actual960x540. Final screenshot inspected and no errors artifact.

Software63904 exited0 with the same37 captures and4,992 clear camera poses. Main software buffer is960x600 under the2560x1600 viewport.238,704 outside-fixture triangles retain exact hash1041971261;504 translated fixture triangles retain the same shape hash1591941847 as native. Native accepted entrance, darkest lamp, return Joe, initial final-runtime floor/approach Joe/portrait, software accepted entrance/flood/landscape, preview candidates and actual client images inspected.

Native cost18432 exited0: baseline/current medians entry20.3/20.3ms,root14.5/15.0ms,reverse7.6/7.4ms. Software timing68629 subsequently completed successfully. These are local shared-host diagnostics, not production frame-pacing qualification.

## Remaining work

Finish the coherent gallery floor/roof/material treatment, then water/shore depth and district composition. Maintain full-route actors/ghosts, current matched Level1, comfort and performance gates. The earlier pass81 software regression is explicitly retained in its QA/performance record; this lighting change does not resolve it.


## Final local cost and closeout

hardware: entry median 20.3→20.3ms, P95 22→22.4ms; root median 14.5→15ms, P95 16.4→16.4ms; reverse median 7.6→7.4ms, P95 9.4→9.6ms

software: entry median 387.9→388.7ms, P95 442→453.1ms; root median 334.7→352.1ms, P95 386.5→373.5ms; reverse median 153→148.1ms, P95 170.5→162.2ms

Six warm pairs and24 alternating GPU-fenced samples per view. Own native and software timing runs were sequential; other chapter jobs were active on the shared host (timing-processes.json). These samples establish neither a speedup nor acceptable software throughput. Source snapshots and SHA256 checksums are in final-source-manifest.json. No item or whole-level gate promoted.
