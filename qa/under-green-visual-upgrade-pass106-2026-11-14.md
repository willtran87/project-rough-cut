# Pass106: gallery sediment coverage

Previous goal turn: progress through a fresh six-district native review and updated priorities. The objective remains all 53 visual requirements, 48 refinements and seven full-level gates.

## Runtime change

The gallery's existing mud coverage is remapped once during mask construction. Thick clay covers paving joints more fully; thin margins break into small stationary patches. This preserves the authored root slumps and seepage fans, with a smooth spatial transition at the gallery bounds. The artwork, ground wetness, relief, water state, collision and controls remain independent.

New helper: web/under-green-gallery-deposit-mask.js, called by web/under-green-ground-finish.js after the four mask channels are packed. It changes 17,235 mud texels: 14,181 gain coverage and 3,054 lose coverage. The existing mask is 1024 square over 64 by 84 metres. The cluster grid is about 11cm; this controls broad deposit coverage, not the illustrated material's fine pixel density. No new shader samples, maps, geometry, lights or draw calls.

## Evidence so far

Native verification completed with 38 captures: gallery approach, floor, pillar, repair, crossing, reverse, bounds, four other districts, four flood times, 1280x720, 390x844, 844x390, crouch, Q and Reduced Motion. Actual native desktop target is 2560x1600. Paired state/resources match. Sand, wetness and foot-wear channels have identical hashes; mud outside the gallery bounds has an identical hash. Pump, keeper, range and bunker control screenshots are pixel-identical. Camera return is pixel-exact and pause freezes simulation time. No recorded browser errors.

Native warm local GPU-fenced medians before/after: approach 29.0/28.4ms, floor 26.3/25.3ms, crossing 21.1/20.2ms; P95 40.5/33.9, 30.8/27.3 and 23.4/22.1ms. Four warm pairs and 24 alternating samples per view. This is local comparison evidence, not a whole-route pacing qualification.

Visually inspected before/after pillar and the compact portrait floor. The deposit reads more distinctly over the slab pattern. This is subtle local material integration; broad gallery composition and overall Level1 parity remain open.

Software verification also completed all 38 views with the same mask, state/resource, outside-district, pause and camera-return assertions passing. Actual render targets were 960x600 at the large viewport, 960x540 at 1280x720, and native 390x844/844x390 compact views. Inspected software pillar and native flood-49 captures. Software medians before/after: approach 295.3/286.4ms, floor 240.4/239.3ms, crossing 296.2/293.6ms; P95 320.6/313.7, 261.3/262.3 and 355.2/334.2ms. Absolute software cost remains unacceptable; no full-level performance pass is claimed.

Installed gameplay client completed ten bursts and exited 0, ready/playing at (0,8.584), checkpoint 0, with no error artifacts. Final shot9 inspected. Its initial five-second click timed out on the disabled Preparing button; subsequent action input entered gameplay successfully. No client script changes. All pass106 jobs are terminal.

## Scope and storage

Runtime manifest: output/under-green/visual-pass106/source-manifest.json (137 files), unchanged at the native check. Reports/captures: output/under-green/visual-pass106/{hardware,software}. Verifier: tools/verify-under-green-gallery-deposit.cjs.

Low disk space was addressed by native NTFS compression of 34 previously uncompressed JSON files belonging to this task, totalling 71,298,409 logical bytes. Every file's SHA256 was checked before and after; contents and paths were preserved. No files were deleted.

No requirement promotions. Full-level art, motion, responsive, accessibility and performance gates remain open. Preserve Level1 movement, noninverted mouse, E/Q, entrance retries, sound-led tension, scythe Joe, moving dark ghost fades, whole-level flood and opaque enclosure.
