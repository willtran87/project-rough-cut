# Back Nine irrigation and architectural craft — partial visual upgrade

The active objective is all 48 visual improvements, with Level 1 as the minimum quality bar. This pass advances irrigation, architectural depth, fixture connections and particles. It does not establish full Level 1 parity or complete the objective.

## Changes

- `web/back-nine-irrigation-art.js` replaces the flat black wet patches with contoured submerged turf, muddy margins, restrained broken reflections, retracting rotating heads, direction-preserving jet trajectories, impact rings and fine impact spray. Normal/boosted spray follows the authoritative sprinkler phase and pressure tool. Pools are bounded at 96 jet drops, 48 fine spray particles and 24 rings; no new texture is allocated.
- Paused rendering preserves every pose. Reduced motion preserves physical wetness with no suspended particle curtain. A new run resets the effect clock. Wet meshes and the underlying turf's discard masks switch together, including distance culling and dry transitions. Hidden terrain is rejected before expensive texture/light work while the outer seam retains its underlayer.
- `web/back-nine-architecture.js` adds 400 static pieces through the existing textured/culling batches: 18 front/west window treatments, corner stonework, cornices, gutter/downpipe connections, overflow marks, chimney flashing/pots, door brackets and lanterns; garage shaft, tracks, motor housing, roof ties, lighting housings, service panel/conduit and tools; relay shelter rafters/braces/gutters/wiring. No new texture, light, collision obstacle or per-frame architecture update.
- Visual inspection found the new garage service panel behind the existing staff record. Moved it to the side wall and recaptured; both are now visible. The existing parking/escape space stays open.

## Verification

- `node tools/verify-back-nine-irrigation-art.mjs`: passed thousands of normal/boosted trajectory samples, terrain/physical bounds, pressure state, pose determinism, pause, reduced motion, dry restoration, culling/mask restoration, retry and resource disposal. Evidence: `output/back-nine-visual-upgrade/irrigation/contracts.json`.
- `node tools/verify-back-nine-irrigation-browser.cjs output/back-nine-visual-upgrade/irrigation/accepted-pass`: passed all three natural wet/dry zones, rotating heads, boosted spray, actual pause and reduced-motion controls; 27 programs / 46 textures, no page/console errors. Screenshots inspected at 2560x1600, with 1280x720 and 390x844 captures. The head inspection viewpoint was offset so the player no longer hides the fixture.
- `node tools/verify-back-nine-ground-art.mjs`: passed sync/async geometry equivalence, 1,737 parts / 500 yields, unchanged course/navigation contracts.
- `node tools/verify-back-nine-experience-upgrade.mjs`: all 14 simulation contracts passed.
- `node tools/verify-back-nine-experience-browser.cjs`: actual keyboard valve use, rolling cart, ghosts, garage release/drive/seal/victory, silence, reduced motion, pause and retries passed with no errors; stable 27 programs / 46 textures. Run occurred before the final purely visual relocation of the service panel. A copy of the report is in this pass's architecture output.
- `node tools/capture-back-nine-visuals.cjs output/back-nine-visual-upgrade/architecture/final-panel`: 11 native viewpoints at 2560x1600, plus 1280x720 and 390x844. Inspected facade, side windows, relay structure, open garage and responsive approach views. Native resources remain 27 programs / 46 textures. The camera and UI retain their existing stage anchors.
- Installed gameplay client was run through `tools/verify-presented-client.mjs` for flood traversal. Both screenshot/state bursts inspected; no error artifact. First burst 960x540, second 800x450, p95 about 65.2ms. This is an unresolved software performance limit, not a pass for full visual-fidelity retention.
- Final installed-client garage approach (`--architecture-art`, `output/back-nine-visual-upgrade/architecture/client-final`) passed two driving/steering/braking bursts at 960x540, 100 health, no error artifact. Screenshot/state inspected; stable 32 software programs / 46 textures. Average completion about 43/44ms, p95 57/104ms: resolution retention passed this sample, sustained frame pacing is not accepted.

## Remaining scope

All numbered items retain their full acceptance requirements. Ledger status after this pass: 19 in progress, 29 pending, zero complete. Irrigation still needs broader art acceptance in chase lighting and combined-load profiling; wetness follows the physical circular zones and is not a new fluid simulation. Architectural work still needs remaining elevations, richer material wear and stronger interior/exterior lighting. The garage shaft/motor details are static; full mechanical animation and dust remain.

Next major visual work: natural middle-distance planting/composition, distinct district vegetation and surface transitions, character/mower craft, material-specific destruction aftermath, lighting/weather/ghost/camera/UI polish, then combined chase/flood/destruction fidelity. Preserve the full 48-item scope and existing no-checkpoint, bell, destruction and chase rules.
