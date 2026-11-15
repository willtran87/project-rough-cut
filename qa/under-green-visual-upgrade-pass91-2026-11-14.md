# Under the Green pass 91: dedicated paving artwork

Scope: V02/V03/V05/V20 material refinement. The complete 53-item plan, 48 refinements and seven whole-level gates remain authoritative. This pass does not establish whole-level parity with Level 1.

## Change

The walking floor previously reused the concrete quadrant of the wall atlas, whose broad peeling shapes read as plaster. A dedicated 1254x1254 stone pigment image now supplies restrained worn mineral grain, shallow pits and sparse grit. The original slab layout, corner repairs, mud/sand deposits, traffic wear, runoff and flood saturation remain independent and unchanged. Material scale is four metres per full image, preserving 313.5 source texels/metre. The ground shader uses that declared scale rather than the previous fixed two-metre concrete tile.

The built-in image_gen tool produced `web/assets/under-green/paving-field-v1.png`; the exact prompt is saved beside it in `paving-field-v1-prompt.txt`. Original output is retained in the Codex generated_images directory. No image processing or image-derived bump/gloss map is introduced. Existing nearest magnification and mipmapped minification remain. The floor's independent wet mask is generated with the same existing deterministic code.

The crafted material loader replaces its unused original floor pigment with the new full field. Ground and walkway now consume that field; architectural concrete remains unchanged. Runtime changes are confined to `under-green-crafted-surfaces.js` and `under-green-ground-finish.js`. One additional texture becomes resident, with approximately 8 MiB RGBA including mipmaps, and a 1,878,674-byte PNG transfer. No added geometry, draws, lights, colliders or gameplay rules.

## Verification so far

- Native comparison passes 53 before/after, district, flood, actor, responsive and control captures with no browser/shader errors. Actual render target is 2560x1600; compact checks include 1280x720, 390x844 and 844x390.
- Identical paired player/flood/light state, submitted triangles and draw calls. Exactly one additional texture per paired view. At the close-floor view: 426 draws, 419,959 submitted triangles, 64 textures and 219 programs.
- The camera return comparison is exact, E operates the pump, pause freezes time, and reduced motion, crouch and Q lookback checks pass.
- Native close-floor before/after, pump controls and portrait entry screenshots were opened and inspected. Stone grain replaces the old plaster-like shapes without displacing joints or runoff. Full gallery staging and the existing broad reflection/shadow bands still need work.
- Source snapshots and hashes: `output/under-green/visual-pass91/final-source-manifest.json`. Baseline is final pass90; its three source hashes were revalidated before editing.

Software comparisons also pass 53 views with no browser/shader errors, at actual 960x600 for the large viewport. Close-floor and short-landscape control images were inspected. Material telemetry confirms the 1254-square/four-metre paving scale and unchanged sampling for every other material in 21 paired views per renderer. Local timing is recorded below. The installed web-game client completes 12 input bursts, ending ready and playing at (0,13.192), elapsed2.533s, checkpoint0, actual960x540. No browser-error artifact; final shot11 opened and inspected. Its initial primary-button click times out while Preparing, then subsequent menu input starts gameplay successfully. This final client covers both pass90 saturation and pass91 artwork. No new full-route collision, actor-animation, low-light legibility or performance acceptance is claimed by this material-only pass.


## Local timing

Six warm-up pairs, then 24 alternating GPU-fenced samples per view. These are provisional shared-machine measurements; they do not qualify the whole-level performance gate. Median/P95 milliseconds:

|Renderer|View|Pass90 baseline|Dedicated paving|
|---|---|---|---|
|hardware|gallery|23.5/34.7|22.7/28.8|
|hardware|crossing|18.7/20.6|17.9/19.9|
|hardware|pump|16.6/21.4|13.5/18.0|
|software|gallery|213.2/225.8|215.1/232.0|
|software|crossing|205.2/233.2|200.4/261.8|
|software|pump|191.1/217.1|192.2/217.0|

Native samples show no added cost in these views. Software medians are near baseline, but approximately 190–215ms at fixed 960x600 remains poor absolute performance. The live adaptive-resolution floor was not benchmarked. The larger texture adds memory; timing improvements in this sample are not an optimization claim.


Final five-file source/asset manifest revalidated after testing. All owned capture, timing and client processes completed. No completion status or whole-level gate promoted.
