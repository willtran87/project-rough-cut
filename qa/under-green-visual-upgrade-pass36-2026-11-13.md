# Under the Green pass 36 — sediment pixel material

Status: verified local material progress, not full-level acceptance. Previous pass35 was concrete progress. All53 requirements and seven release gates retained; ledger24implemented/28in_progress/1pending.

## Selected art and integration

- Built-in image_gen produced a dedicated sediment albedo with compacted fine soil, irregular drying crust, embedded grit and sparse leaf fragments. Selected native1254x1254RGB PNG, requested2048square; no resampling or postprocessing. Source: `assets/environment/under-green/sediment-field-v1.png`; runtime: `web/assets/under-green/sediment-field-v1.png`; complete prompt: `assets/environment/under-green/sediment-field-v1.prompt.md`. Original generated file remains in the Codex generated_images directory, exec-2107b815-d4fc-4eea-8960-05492029f589.png.
- Replaces only the old627square mud quadrant. Existing atlas stays loaded for bark/floor; its other quadrants remain intact. New material spans4x4metres at313.5source texels/metre, matching architectural masters. Nearest magnification and mipmapped minification retained.
- `under-green-ground-finish.js` now supplies an explicit mud UV scale from the material's world dimensions. The custom floor shader does not apply the regular map repeat transform; this prevents the new4mfield from becoming twice as dense on the floor as on banks. Actual compiled uniform(.25,.25) matches bank repeat(.5,.5) on existing2mUVs.
- Existing wetness mask stays independent from albedo; no diffuse-as-bump map. No new lighting, geometry, particles, gameplay, collision or controls changes. The new source is2,270,209encodedbytes; replacing627square with1254square adds6,290,064estimatedRGBA+mipbytes (about6MiB). Texture count equality does not imply unchanged storage or source decode cost.

## Verification

- `tools/verify-under-green-sediment-art.cjs`: final34native/34software views, ten paired close/middle/distant fixtures across five districts, four paired flood stages, three responsive sizes and Q/pause/ReducedMotion. Zero console/page errors. Final artifacts: `output/under-green/visual-upgrade/pass36-complete/{hardware,software}`. Earlier30-view pass36-final folders are valid limited coverage, superseded by complete coverage without further runtime changes.
- Actual desktop render2560x1600native and960x600software, viewport2560x1600. Also1280x720,390x844,844x390. Inspected native close bank/floor, flood rise, normal gallery route, bunker middle distance and portrait; inspected software bank. Soil no longer resembles woody root fibers. In wider shots it remains subordinate to route markings and lights.
- All285actual structural position/normal/index hashes unchanged. All paired draw, triangle, texture and program counts unchanged. Actual native-sized map, independent wetness, absence of bump and floor/bank scale verified. Camera-away-and-return framebuffer hashes exactly match on both renderers.
- Installed develop-web-game client completed five bursts. Final `pass36-client/shot-4.png` and `state-4.json` inspected: ready/playing(0,12.68),960x540. InitialPreparing5secondclicktimeout recovered via subsequent input; startup performance is not accepted by this smoke check.
- Source/runtime asset byte equality verified; provenance and dimensions in environmentmanifest and pass36-source/asset-report.json. Seven final source/test/art hashes in pass36-source/final-hashes.json. Geometry did not change, so pass35 clearance evidence is retained without claiming a fresh route audit this turn.

## Remaining work

V02–V06 and V17/V18/V20 remain partial for whole-level cohesion, variant repetition, causal material layers and final route/flood/pursuit acceptance. Four-metre repetition still exists. Separate wetness mask has not been reauthored around every new crust island; relief remains intentionally geometry-driven. No whole-Level1 parity, startup/decode or full software performance acceptance. Continue remaining architecture, water, lighting, prop/story and presentation requirements; all seven gates stay open.

## Isolated rendering measurements

Native and software timing jobs ran sequentially after other owned browser tests ended. Six warm frames,24alternating GPU-fenced frames per view; values include CPU submission, polling and context overhead. These measurements are scoped, not an FPS guarantee.

| Renderer/view | Median before / after ms | P95 before / after ms |
|---|---|---|
| hardware/gallery | 12.5 / 11.9 | 14.6 / 14.5 |
| hardware/pump | 8.8 / 9.4 | 10.3 / 10.9 |
| software/gallery | 88.1 / 88.1 | 90.9 / 91.7 |
| software/pump | 48.2 / 46.8 | 49.9 / 51.3 |

No material rendering regression established by these two views; native changes within0.6ms, software medians unchanged or slightly lower. Absolute software performance remains inadequate. All owned pass36 processes are terminal. Server4187 and artifact junction retained.
