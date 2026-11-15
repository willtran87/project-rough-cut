# Under the Green pass 90: paving saturation and flood integration

Scope: local refinement of V05, V18, V20 and V26. The full 53 requirements, 48 refinements and seven release gates remain authoritative. No category or whole-level gate is accepted by this pass.

## Material change

The existing independently authored deposit map now controls paving saturation as well as reflection strength. Saturated stone/clay darkens with a restrained cooler tint; dry sediment gains a modest lighter edge. Dry paving has a weaker, broader reflection response and wet films have a narrower response. Existing pigment textures, source pixel density, slab geometry, joints, wear paths, deposit shapes and actual lamps are preserved. No new textures, geometry, lights or rendering passes are added.

`under-green-ground-finish.js` supplies the ground-specific response. `under-green-flood-wetness.js` combines static runoff and actual flood saturation using their maximum, applying only the remaining pigment change. This avoids darkening already saturated ground again. Flooded dry paving receives the wet reflection response, and residual dampness fades back to the original authored runoff. Non-ground receivers retain their existing flood response. Shader defines distinguish these integrations without string matching private shader statements.

## Evidence recorded so far

- Native `tools/verify-under-green-ground-saturation.cjs` passes 53 before/after, flood, actor, control and responsive captures. The paired player state, flood state, fixed lamp definitions, draws, submitted triangles and texture counts are unchanged. No browser/shader errors.
- Native desktop renders at actual 2560x1600. Additional viewports are 1280x720, 390x844 and 844x390. Close paving, residual dampness and portrait entry images were opened and inspected, as were the initial gallery floor comparison images.
- Native `tools/verify-under-green-ground-saturation-probe.cjs` passes 84 raw GPU outputs at six physical locations and seven flood times. It clones a final flood-bound scene material and reads its actual shader values. Dry paving becomes saturated, reflection sharpness follows saturation, initial residual wetness matches peak flood without extra darkening, and fully dry output restores the original values exactly. Both fully dry paving and permanent saturated runoff are included.
- The initial isolated probe lacked the zero-power PointLight type anchor required by the game's lighting hook. That diagnostic scene failed to compile; no runtime scene failed. The corrected probe includes the anchor, checks shader errors before assertions and passes. Failed output is not acceptance evidence.
- Native entry remains 531 draws, 434,364 submitted triangles, 57 textures and 219 programs in both versions. Counts at the close paving and pump views also match. Equal counts do not establish equal frame time.

Software visual verification passes 53 views and the shader probe passes 84 GPU outputs (42 point states), with no errors. Software west-wall image inspected. The final installed gameplay client covers the combined saturation and dedicated-paving work in pass91:12bursts, ready/playing at(0,13.192),checkpoint0, no browser-error artifact and final gameplay screenshot inspected. See pass91 QA for the startup-click timing qualification. Source snapshots are in `output/under-green/visual-pass90/source/`; candidate final hashes are in `final-source-manifest.json` in that same pass directory.

## Remaining art limits

This improves material response, not the whole gallery composition. The existing floor pigment is the concrete quadrant of `surfaces-masonry-v3.png`, shared with architectural surfaces. Inspection confirms broad plaster-like peeling motifs in that artwork; dedicated paving art is a concrete next step. Current post-flood highlights also expose existing broad reflection/shadow bands. Those, stronger authored pixel clusters, larger scene composition, Level 1 parity, whole-route readability and software performance remain open.


## Completed timing samples

Six warm-up pairs and 24 alternating fenced samples per view; shared-machine measurements are provisional. Native actual 2560x1600, software actual 960x600. Median/P95 milliseconds:

|Renderer|View|Before|After|
|---|---|---|---|
|hardware|gallery|22.9/28.3|28.9/33.8|
|hardware|crossing|19.6/28.3|25.9/31.2|
|hardware|pump|17.5/18.9|20.1/26.1|
|software|gallery|186.3/275.2|188.1/274.6|
|software|crossing|236.2/332.0|248.6/325.9|
|software|pump|299.7/357.8|291.6/348.6|

Native local cost increases; software results are mixed and absolute performance remains poor. Equal resource counts did not imply equal timing. No performance or whole-level acceptance gate is promoted. Pass90 final source hashes were checked against all three current runtime files before pass91 edits. Both timing handles completed successfully.
