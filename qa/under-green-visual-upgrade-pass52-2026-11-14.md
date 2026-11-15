# Under the Green pass 52 — service hardware material consistency

Previous goal turn: progress through fresh rendered evidence and the detailed refinement review; no runtime implementation in that review. This pass implements its material-scale finding. All original 53 requirements, the review's 48 refinements, and all seven whole-level release gates remain in scope.

## Runtime change

The generic iron, steel, brass, rust and red-enamel materials previously sampled 128px procedural artwork across two metres (64 source texels/metre). `under-green-hardware-finish.js` reuses the existing 627px machinery metal/rust/red maps across two metres (313.5 texels/metre), matching architectural surface density. Restrained individual color multipliers retain material differences. Static world UVs stay fixed; moving parts receive physical local UVs through the existing scene builder.

The materials retain their Lambert shader family. No new maps, geometry, lights, specular passes or simulation behavior. The pump's dedicated hero materials and causal pipe-joint shader are preserved. The scene imports/applies the helper and exposes its material metadata in graphics diagnostics. Other chapters and shared Level 1 materials are unchanged.

## Verification

- `tools/verify-under-green-hardware.cjs`: 28 captures per renderer. Eight paired before/after compositions, nine responsive views at1280x720/390x844/844x390, plus flood, actual Q lookback and Reduced Motion. Native target2560x1600; software desktop960x600. Zero page/console errors.
- Actual runtime base materials retain Lambert/opaque/no-bump behavior, share the machinery texture objects, use627square maps and a2m span. All59 named hardware batches have identical position/index hashes and world matrices before/after. Camera return produces an identical image, confirming no camera-relative material swimming at the gallery fixture.
- All eight paired views preserve player state, render resolution, draw calls, triangles and program count. Loaded textures in the pump view fall62to59; programs remain144. Native pump82draws; software78draws. This verifies resource counts, not sustained performance.
- Inspected native bunker, pump and keeper before/after context; software gallery, portrait crossing and landscape pump. The old multicolored coarse trim now reads as quieter worn metal; wall bands still need broader architectural interruption/composition work. Generic timber and some smaller material families remain outside this pass.
- Installed `develop-web-game` client: seven movement bursts, final screenshot and state inspected at(0,7.304), ready/playing with all five hardware profiles active. Initial5second Preparing-button timeout recovered through subsequent menu input. Terminal exit0, no error artifacts. This is a short ordinary-input movement check, not a complete route playthrough.
- Geometry and collision functions are unchanged; the hardware geometry audit supports retaining prior clearance evidence. No claim of fresh exhaustive actor/camera clearance or attack-animation qualification.

Artifacts: `output/under-green/visual-upgrade-local/pass52-hardware/{hardware,software}`, `pass52-client`, `pass52-budget/{hardware,software}`, `pass52-source`.

## Prior profiling evidence retained

The pass51 component diagnostic has a completed gallery/pump/range report and no page errors; its node process was absent at current inspection. Disabling entire effect classes is diagnostic only. Full-mode medians drift substantially within that run (gallery200.1to278.0ms; range304.0to367.2ms), so omission timings do not establish an isolated cause or an acceptable optimization. No diagnostic omission shipped. The earlier hidden-draw candidate likewise remains unshipped. Software rendering still requires substantive performance work.

## Acceptance boundary

V02/V03/V06 gain local hardware evidence and remain in_progress for full-level material consistency and motion acceptance. V38's existing locally accepted pipe treatment is preserved. The48-point review maps into the original53-item scope rather than replacing it. Ledger stays31implemented/21in_progress/1pending; allseven whole-level gates remain pending. No commit, deployment or agent delegation.

## Measured local cost

Six warm frames and24 alternating GPU-fenced samples per view, native then software after other owned rendering jobs finished. Native2560x1600, software960x600. This measures fixture rendering, not full gameplay FPS.

| Renderer / view | Before median / P95 ms | After median / P95 ms |
|---|---:|---:|
| hardware / gallery | 14.5 / 16.6 | 14.4 / 16.4 |
| hardware / pump | 8.8 / 10.2 | 8.8 / 9.9 |
| hardware / range | 13.4 / 15.4 | 12.4 / 15.4 |
| hardware / keeper | 9.7 / 10.9 | 8.9 / 11.2 |
| software / gallery | 198.4 / 221.7 | 196.4 / 237.1 |
| software / pump | 101.4 / 122.5 | 96.9 / 125.4 |
| software / range | 202.2 / 222.4 | 204.5 / 223.4 |
| software / keeper | 118.7 / 126.5 | 119.4 / 127.4 |

Native values remain close, with a small keeper P95 increase. Software medians are mixed and remain far outside a playable budget. No whole-level speedup or performance acceptance is claimed. Final runtime/harness hashes match the snapshot made during verification. All owned jobs are terminal: native70871, software89394, installedclient98684, nativebudget12110, softwarebudget90514. Server4187 retained; browser temp/artifacts onD. No unrelated processes or files removed.
