# Under the Green pass80: surface shading cost

Progress toward the existing performance gate. All 53 visual requirements, 48 refinements and seven whole-level gates remain in scope; no status promotion.

## Evidence and retained candidate

A component-omission profile at 960x600 identifies opaque Phong shading as the dominant measured cost. These omissions are diagnostics only and never enter production. Gallery full/no-Phong medians were 216/93ms; crossing 198.7/69.1ms; keeper145.1/16ms. Shared-host load means these differences are indicative, not additive component budgets.

Static batches now test each original part's closed bounds as well as their combined envelope when excluding finite practical lights. Empty gaps between separate objects no longer force zero-contribution lamps into their shaders. Original world transforms and movement padding are applied; moving objects retain the full light set. Constructor bounds are released after material preparation.

Software uses 12m longitudinal strips instead of 24m. Native rendering retains 24m strips after the native 12m experiment regressed. Horizontal grouping, all authored triangles/attributes, textures, physical lamps, lighting equations, opacity, gameplay and collision are retained. The shorter software groups trade more draw calls for less fragment lighting work.

## Experiments

- Part bounds alone: native three-view pixel parity passed; average static sources4.1055 to3.9099 and programs218 to211. Software medians were mixed (259/262.3,228.1/224.6,125.5/128ms baseline/candidate). This alone is not a speedup claim.
- 12m strips plus part bounds: software gallery256.7/229.5, crossing233.1/213.3, keeper130.2/125.2ms. Gallery draws530 to666, crossing412 to522, keeper86 to111; average static sources3.5633, programs214. Native20.5/21.6,17.2/19,9.2/9.6ms regressed, so native retains24m strips.
- A shader branch skipping back-facing light calculations was slower (software302.6/310.7,165.9/175.6,85.8/87.4ms). It was tested only by routed source injection and is absent from runtime.
- Native12m grouping changed one pump silhouette pixel by up to8/255. That experiment is superseded by the retained native24m configuration. A software comparison initially counted enlarged viewport pixels, so the authoritative final comparison exports actual drawing-buffer PNGs when hashes differ. Tiny depth/order boundary differences are explicitly bounded and recorded rather than called exact parity.

## Verification

- Native final70335 exited0:31 paired states, every raw framebuffer hash equal. Includes seven districts/control views, pressure/flicker times, flood stages, actual E bypass operation, release animation, Q/crouch, reduced motion, and2560x1600/1280x720/390x844/844x390.
- All377,670 original static triangles retain the same aggregate position/normal/UV/custom-attribute signatures.7,668 part bounds contain all358,931 merged vertices in the native scene. Every omitted source is outside every contributing part bound.436 owned native material variants disposed and original assignments restored.
- Pure bounds test: seven cases including empty gaps, grazing reach, numerical margin, padded movement, translated world bounds, dynamic exclusion and disposal.
- Installed client27845 exited0 after8bursts. Initial Preparing timeout recovered through Enter; finalready/playing,checkpoint0,elapsed1.5333,player(0,10.12),actual960x540. Final image/state inspected; no error artifacts.
- Final software9624 exited0:31 paired states;30 raw framebuffer hashes exact. The bunker differs in17 pixels/51 color channels inside an18x85-pixel edge region of the actual960x600 buffer, maximum16/255. The before/after bunker and amplified difference were inspected; tiny timber-edge depth/order differences are retained, with no broad image change. All302,938 original static triangle attribute signatures match;7,635 part bounds contain316,932 merged vertices. No browser errors. Native gallery/flood/390px controls and installed-client images were also inspected. All563 software material variants disposed and original assignments restored. Final turning timings19352/30735 both exited0: native gallery21.2/21.2ms,crossing17.9/17.2ms,keeper9.9/9.0ms; software231.3/219.9,185.2/184.3,110.0/95.4ms baseline/current medians. Each fixture uses six warm pairs and24 alternating GPU-fenced camera turns. Turning costs include per-frame culling/index updates. Other chapter jobs are inventoried in final-turning/processes-*.json. Six final source snapshots are byte/SHA-verified; all owned runs are terminal.

The absolute software cost is still far too high. These local GPU-fenced diagnostics do not qualify ordinary-input production pacing, whole-route art or Level1 parity.

Pass80 timing caveat: software gallery turning P95 worsens291.3 to467.1ms despite the lower median. Crossing P95273.6 to258.7ms and keeper142 to121ms improve. Shared-host contention prevents firm attribution; the gallery tail regression remains an explicit concern and no overall frame-pacing improvement is claimed.
