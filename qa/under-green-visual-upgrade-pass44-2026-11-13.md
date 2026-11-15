# Under the Green pass 44 — water lighting coordinates

Status: verified implementation progress; all owned test jobs terminal. Full 53-item scope and all seven release gates retained. The previous list-only goal turn did not advance implementation; this turn resumes the outstanding water correction and replaces its more expensive intermediate shader.

## Change

Channel and puddle shaders previously added authored horizontal wave slopes directly to view-space normals. The highlight orientation therefore changed incorrectly with camera rotation, and east-west channels omitted their own rotation. `under-green-water-normal.js` now transforms the complete local horizontal water normal through Three's existing per-mesh normal matrix in the fragment stage, with front/back side handling. No additional varyings, attributes, texture images, lights, geometry, or CPU uniform updates. These water materials have no bump/normal maps; the helper is deliberately specific to horizontal surfaces.

Existing channel/puddle amplitudes, colors, opacity, clocks, contact effects and gameplay rules remain intact. Flood surface and wall-film shaders are unchanged. This advances V25; it does not complete V22/V25/V26 or any whole-level gate.

## Intermediate evidence and correction

The initial two-varying implementation passed actual GPU readback: 66 samples before and after per renderer. Old maximum normal error .083611; corrected .004750 native / .005626 software. The diagnostic exercises rolled/tilted cameras, north/east channel orientations, nonuniform scale, three times and channel undersides. A diagnostic setup defect initially omitted the PointLight type needed by production material hooks; the harness now adds a stock point light and requires no shader errors plus nonempty readback before accepting results.

Initial 64-view / 75-camera-step native and software reviews passed. Source camera poses are floor-valid; all eight channels and six pools are represented. Returning to a fixed pose produces a byte-identical screenshot. Flood line tracks physical depth; pause freezes finite scene/water clocks; Reduced Motion freezes water motion. Desktop 2560x1600, ordinary 1280x720, portrait 390x844 and landscape 844x390 are covered. The installed client completed gameplay at (0,8.84) after its initial five-second Preparing timeout recovered in later action bursts.

The initial helper added two interpolated vectors. Local timing diagnostics showed concerning regressions, so it was replaced with a direct use of the already-uploaded normalMatrix uniform. Initial artifacts (`pass44-normals`, `pass44-views`, `pass44-client`, `pass44-budget`) are intermediate evidence, not final verification of the replacement. Retained screenshots showed murky water and dark puddles without cyan coloration; shallow-water edge readability still needs further work.

## Final verification

Final `pass44-direct-normals/{hardware,software}` repeats the 66-before/66-after actual GPU sample test with the optimized helper. Maximum error .083611 before, .004750 native / .005626 software after; zero shader/page errors. Jobs86624/31597 terminal0.

Final `pass44-direct-views/{hardware,software}`:64 views and75 deterministic camera-turn steps per renderer. Same all-eight-channel/six-pool, flood, camera-return, pause, Reduced Motion and responsive checks pass. Jobs97588/61506 terminal0. Native bypass, turned gallery pool and landscape views inspected; software turned bypass inspected. Initial native/software flood and portrait captures were also inspected; flood shaders and geometry are unchanged. These scripted fixtures do not establish ordinary full-route hazard/clearance acceptance.

Final installed client `pass44-direct-client`: five action bursts, finalshot4/state4 inspected, ready/playing at(0,8.84), actual960x540 render. Initial Preparing-button timeout recovered in later action bursts. No error artifacts; job43142 terminal0. Server4187 retained.

Local six-warm/24-alternating GPU-fenced timing diagnostics in `pass44-direct-budget`:

| Renderer/view | Before median/P95 ms | After median/P95 ms |
|---|---:|---:|
| Native channel,2560x1600 |12.8/15.4|12.9/14.2|
| Native puddle,2560x1600 |8.4/10.4|7.9/9.4|
| Software channel,960x600 |125.4/164.6|124.4/199.4|
| Software puddle,960x600 |42.8/72.2|43.4/58.4|

Identical before/after draws, submitted triangles,59textures and140programs at both fixture poses. Native339channel/126puddle draws; software252/40. The direct helper avoids the earlier interpolated-basis regression in medians; the software channel P95 is worse. Other chapter verification overlapped early timing work and was absent in the final observed software process inventory. These remain local diagnostics on a shared machine; absolute software cost is unacceptable and no full-level performance acceptance is claimed. Jobs14619/85279 terminal0.

Final six-file snapshots/hashes retained in `pass44-source/final-hashes.json`. Source comparison confirms the channel/puddle edits only import/apply the coordinate helper and change shader cache keys. No geometry or collision changes, so prior route geometry evidence is not invalidated; this is not a substitute for whole-level release checks.

## Remaining work

Next improve shallow-pool/channel/flood distinction and physical water edges. The gallery shallow pool still reads mainly as a dark flat stain, while floodwater uses an unperturbed surface normal despite animated pigment highlights. Review these as a coherent material pass, with shoreline transitions and real-light response, rather than only adding more texture noise. Keep all original visual requirements, controls, no-checkpoint retry and full-level release gates. No global acceptance is inferred from these isolated fixtures.
