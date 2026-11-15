# Final Cut hydraulic construction and finish

Status: FV40 complete against its hydraulic construction requirement. Full72-item objective remains active.

## Construction and motion

- Added a bolted supply manifold, hex fittings, metal crimps, ribbed strain-relief sleeves, cylinder bands, port clamps, rod wipers and pin washers/retainers. All152 parts derive from the existing shared hydraulic layout and therefore participate in masonry clearance and geometry audits.
- Retained fixed-length piston rods and solved slack hoses. Sleeve/crimp lengths are fixed on the first/last hose tangents, with contiguous joints and physical supply/port endpoints. Folding and asymmetric collapse still consume actual wing angles.
- Replaced generic material buckets with one shared authored industrial material. Seven instanced batches use round12-sided tubes,6-sided hex fittings and boxes. Per-instance dimensions scale the authored texture in physical metres so the material does not stretch with cylinder length.6,456triangles; one owned material and no new artwork textures.
- Strengthened the tire-clearance test to use actual inner/outer steering angles, exposing an existing barrel/tire intersection that the former simplified steering check missed. Moved both hydraulic mount planes0.30m rearward (forward0.85→0.55) and biased the hose slack upward. Manifold supplies remain attached to the console's front face. The revised mechanism clears all tested tire poses and Joe's transfer path.

## Evidence to date

- Pure hydraulic12517 passes121 deployment angles, seven actual steering settings,32,594,254 sampled tube/tyre checks, cab-post clearance, fixed rod stroke and hose lengths. Maximum hose-length error0.00001508m. Explicit connection checks verify both hose ends, four contiguous fixed-length crimp/sleeve assemblies and bounded layout caching.
- Hardware hydraulic52929 passes27 actual instanced-geometry poses at eight masonry heights, actual mount attachment, live announce/deployment/pause/resume, asymmetric physical collapse, exact reload restoration and Reduced Motion. No geometry restore error or browser error.
- Transfer3188 passes322 actual skinned-triangle and foot-support poses, zero intersections/support failures, maximum foot-target error2.7e-7m.
- Finish captures inspect native2560x1600 side/front/partial-fold/folded/left views and1920x1080,1280x720,844x390,390x844. Direct on/off comparisons exclude hydraulic cast shadows: hardware side11,286fitting pixels/3,445sleeve pixels; left11,291/3,423. Hardware front527fitting pixels; partial fold15,794; folded988. Raised decks physically obscure some sleeves; no geometry was hidden to manufacture a clearer screenshot.
- First software finish11776 passes five views/five sizes, dimensions and stable resources; side1,582fitting pixels/477sleeve pixels. Software native render960x600 at2560x1600,960x540 at1920x1080/1280x720, and native compact sizes. Final finish harness additionally checks284 actual rendered cap endpoints per pose against the authoritative part endpoints; updated run receipts follow below.
- Pure folding regression passes eight10-second recovery scenarios across30/60/120/144Hz with no masonry penetration. Browser folding regression passes ten poses and real backing-clear recovery. Its stale26-mesh expectation was updated to28 while also requiring all24 authoritative wing identities and retaining every geometric bounds check; split lamp/reel meshes account for the difference.
- Full routes18395 terminal PASS: all3real-input entry routes, four total heard-ball redirects, bank/open crossings, pump, bell, physical collapse, road and completion. Zero captures/errors;77screenshots include route, responsive-entry and separate actor/record fixtures.
- Concealment63957 terminal PASS: all48cardinal/near/far/offset/standing/crouching views are pixel-identical with hidden rig present/removed.
- First software mechanical65340 terminated on the default30s screenshot timeout after its geometric loop. Increased the software harness wait to120s; replacement61090 is live. This does not relax geometry or behavior assertions.

## Scope

This pass addresses FV40. Whole-level Level1 parity, broad mower silhouette/material finish, Joe art/acting, remaining lighting/terrain/refuge/effects/story/UI work and complete performance acceptance remain separate, unfinished requirements. Native inspection still shows broad panel/canopy forms and overbright nearby headlight-lit masonry that belong to those remaining passes.


## Final receipts

- Hardware finish53201 and finalsoftwarefinish81957 pass284 actual cap endpoints per pose, five views/five viewport sizes, actual fitting/sleeve visibility, material metre scaling and stable warmed resource counts. Maximum hardware endpoint deviation1.20e-7m and scale deviation3.41e-8. Geometry133/textures58 remain stable in repeated deployment cycles; this is not a complete performance qualification. Software side/folded aftermath and native side/partialfold/folded images inspected.
- Softwaremechanical61090 terminalPASS:27actualgeometryposes, eight masonryheights, live announce/pause/resume, asymmetric collapse, exact reload andReducedMotion, zeroerrors. Original screenshot-timeout run65340 is superseded.
- Installedclient31765 terminalexit0. Fresh screenshot/state inspected: ready/playing, introcompleted, player y4.7372,960x540internal,152hydraulicparts/7batches/6456triangles. Correct folded startup pose and both hose lengths retained. No errorsartifact.
- Six source/test snapshots inoutput/final-cut/hydraulic-finish/source match the final worktree. All owned test processes are terminal.

FV40 complete; ledger16complete/27in_progress/29pending. Remaining scope is unchanged. Next: improve broad manufactured panel/canopy forms and material/light readability, then Joe's face/clothes/acting, remaining environment/effects/story/UI and matched Level1/performance acceptance.
