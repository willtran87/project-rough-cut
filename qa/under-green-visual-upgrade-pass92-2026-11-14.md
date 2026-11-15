# Under the Green pass 92: remove false floor shadows

Scope: V29/V34 lighting fidelity and gallery composition. Full 53 requirements, 48 refinements and seven whole-level gates remain active. This is not whole-level art or performance acceptance.

## Diagnosis and change

Ten native diagnostic views isolate floor specular, shallow puddles and baked shadows. Disabling shadows removes the repeated horizontal bands; disabling floor specular removes the separate broad bright patch. The shadow problem is the grazing ground surface comparing against its own coarse depth samples, rather than a paving-texture or water-normal problem.

`under-green-practical-shadows.js` now omits floor/walkway geometry wholly at or below course grade from the one-time shadow bake. The actual level's 20 native ground batches (85 software partitions) all end at y=0 and its lowest lamp is y=2.65. A segment from an above-grade source to an above-grade visible receiver cannot enter a volume wholly below that plane. Raised floors, transformed raised floors, and floors above a below-grade lamp remain eligible. All original walls, roots, masonry, soil and ceiling casters remain. Physical floor geometry, visibility, collision, materials, water and gameplay are unchanged.

The visible paving no longer carries repeated false shadow stripes. The root-pillar cast shadow and other real silhouettes remain. The independent broad floor-specular patch still needs artistic refinement; this pass does not claim to resolve it.

## Verification so far

- Native final suite: 49 comparison, district, flood, actor, responsive and control views. Actual large render target 2560x1600; additional 1280x720, 390x844 and 844x390. Baseline views reused from the completed preview; final current views recaptured after the below-grade-lamp guard was added.
- E pump operation, pause, reduced motion, crouch, Q lookback and exact camera-return rendering pass. Player/flood state, physical lamp definitions, textures, submitted triangles and draw calls match baseline.
- Native entry remains 531 draws, 434,364 submitted triangles, 58 textures and 219 programs. Bake caster batches decrease from133 to113. Shadow atlas dimensions, filtering, bias, per-frame GLSL and render passes are unchanged. The vertex/fragment shadow GLSL is byte-identical to baseline. No timing speedup is claimed.
- Actual ground-height and lamp-height assumptions are inspected in both scene audits. Native floor, full gallery entry, receding flood and portrait entry images opened and inspected.
- Separate native and software GPU probes each read 9,216 depth comparisons across before/after empty-floor and obstructed-floor cases. The baseline falsely shadows1,393 of2,304 unobstructed floor samples; final output lights all2,304 correctly. In the obstructed scene,309 interior blocked and1,297 interior clear samples agree with independent CPU raycasts. Root, wall and raised-platform shadows are retained. Seven eligibility cases include parent transforms and a below-grade light.
- Initial probe classification accepted adjacent points shadowed by different objects as one continuous interior. That included a PCF boundary at the junction of two shadows and failed the strict interior assertion. The corrected classification requires the same first blocker throughout a diagonal-inclusive neighbourhood; clear and blocked interiors then pass. Runtime shadow sampling was not changed to accommodate that diagnostic issue.

Software full-scene verification passes49views, at actual960x600 for the large viewport. All85floor partitions end at y=0; lowest source remains2.65m. Bake caster batches384→299; entry draws820,triangles275,895,textures58,programs222 are unchanged. Close-floor and short-landscape controls screenshots opened and inspected. Installed gameplay client completes12bursts, ending ready/playing at(0,13.192),elapsed2.533s,checkpoint0,actual960x540. No browser-error artifact; finalshot11 opened and inspected. The initial5sprimary-button click expires during Preparing; subsequent menu inputs start gameplay successfully. Final snapshots are in `output/under-green/visual-pass92/final-source-manifest.json`. Native/software full-route motion, complete art parity and absolute software performance remain separate open gates.


Interior probe coverage on each renderer:17root-shadow samples,276wall-shadow samples,16raised-walkway-shadow samples and1,297clear samples. Tests deliberately exclude blended PCF boundaries; complete image comparisons retain the actual soft shadow edges.


All three final source hashes revalidated after testing. All owned processes completed. No full-level gate or item status was promoted.
