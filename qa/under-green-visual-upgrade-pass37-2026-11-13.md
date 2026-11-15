# Under the Green pass 37 — sign lettering and mounting

Status: concrete progress toward V02/V06/V50; requirements remain partial. Previous pass36 was progress. All53items and seven release gates retained;24implemented/28in_progress/1pending.

## Production changes

- Large enamel plates now rasterize their actual lettering at1024px wide (usually1024x256; pump instruction1024x192), with crisp thresholded coverage and fine native edge wear. This is newly rendered higher-resolution typography, not an enlarged512bitmap. Small256x64gauge tags already have high physical density and retain their source dimensions. Text, arrows, panel dimensions, positions, palette and non-emissive diffuse-bounce treatment stay the same.
- Irregular rust halos and dark sockets align with existing bolt positions. Added12-segment physical washers beneath all112bolt heads, merged into each existing backing mesh; no extra washer draw calls. Added2688triangles across14plates, within existing plate/bolt outer envelopes.
- Identical front/back artwork now shares its canvas texture; directional arrow reversals retain distinct artwork.28textures become17. Despite fewer textures, larger sources increase estimatedRGBA+mipmap storage from8.17MiB to19.83MiB (+11.67MiB); texture count alone is not a memory saving claim.
- Two iron edge tabs connect the maintenance-records plate to the retaining face and timber frame, adding24triangles. Existing backing face is about8cm behind the plate. Tabs remain clear of the lettering and above2.1725m. No new navigation obstacle, simulation change, checkpoint, control or banner change.

## Evidence

- Final `tools/verify-under-green-sign-finish.cjs`:37native/37software views;14paired route/close fixtures,1280x720/390x844/844x390,three lighting-clock samples,Q,pause and ReducedMotion. All14plates/28faces retain text and physicaldimensions, all lettering fits; large sources double each dimension while tiny tags retain theirs. Zero browser errors.
- Actual rendering2560x1600native,960x600software at2560x1600viewport. Inspected native records close/front bracket detail, firstcrossing comparison andportrait; software records close; installed client gameplay.
- Actual-scene lateral rays at each bracket's air gap miss before and hit the final iron tab at~.19m. The initial longitudinal test was invalid for proving an air gap: it hit the existing retaining face~.075m behind its start. Replaced it with lateral probes through the gap; preserved diagnostic evidence. The keeper plate already sits against masonry, so speculative extra keeper mounts were removed.
-1,098actual-triangle probes across both faces of the firstcrossing instruction area remain clear before/after. This checks support obstruction, not automatic text comprehension or all sign visibility under every possible flicker.
- Final dryroute:1,379frames/106actor mesh audits and included camera checks, zero intersections; foot/hand errors within existing tolerances. Final `pass37-selected-clearance`.
- Installed develop-web-game client finalshot4/state4 inspected, ready/playing(0,8.84),960x540. InitialPreparing5secondclicktimeout recovered via later input; no startupacceptance.
- Paired native view draw and program counts unchanged; submitted triangles increase according to visible washers/tabs. Allocated scene textures converge from76to65 after visiting the fixtures, consistent with11shared back-face textures. No new lights or shader effects.

## Artifacts and limits

New artifacts use `output/under-green/visual-upgrade-local` on C: because the existing visual-upgrade junction's I: volume has limited space; original junction/evidence preserved. Final directories:pass37-selected/{hardware,software},pass37-selected-clearance,pass37-selected-client,pass37-budget andpass37-source. Earlierpass37-final/clearance/client are superseded intermediate candidate evidence. Runtime changes are only sign-art and the records tabs in districts.

V50 remains in progress for full-route readability through all lighting/accessibility settings, ordinary movement and distant approaches. The existing broad weathering and support system was retained and refined, not newly invented. Do not treat74views or narrow instruction probes as whole-level acceptance. All remaining material, architecture, water, lighting, narrative and presentation requirements plus seven release gates remain active.

## Isolated rendering measurements

Native and software jobs ran sequentially after other owned render jobs ended. Six warm frames then24alternating GPU-fenced samples per view. Values include CPU submission, polling and context overhead; these are scoped comparisons.

| Renderer/view | Median before / after ms | P95 before / after ms |
|---|---|---|
| hardware/crossing | 14.9 / 15.1 | 17.7 / 16.2 |
| hardware/records | 10.9 / 9.4 | 12.6 / 12.2 |
| software/crossing | 180.9 / 182.2 | 197.2 / 206.6 |
| software/records | 117.2 / 118.6 | 126.7 / 124.4 |

Native changes are small in these samples. Software adds~1.3–1.4ms median and remains far below the full performance target in these draw-heavy views. No general performance acceptance. All owned pass37 jobs terminal; server4187 retained.
