# Under the Green pass 38 — lamp glass and wiring

Status: concrete progress toward V31/V32; both remain in progress. The immediately preceding goal turn restated the visual plan without changing authoritative state; it was no progress. This continuation recovered the terminal hardware report, verified the existing production edits, added geometry/software/clearance/client evidence and isolated measurements. Full 53-item objective and seven release gates remain active.

## Production changes

- All 17 lamp lenses now use a shallow pressed-glass crown. The original perimeter stays seated in its gasket; the front/back crown extends by at most 6.4 mm on ordinary fixtures or 12 mm on the two larger fixtures, behind the existing cages. The four existing 128x128 pixel panes, shared 256x256 atlas and one instanced lens batch remain.
- A slack insulated cable joins each ceramic fitting to the upper housing, with two rubber glands. The local loop stays inside the old fixture envelope and is merged through the existing material batching. Source geometry is disposed after insertion.
- Added 84 lens triangles plus 164 cable/gland triangles per fixture: 4,216 triangles for all 17. No new maps, materials, lights or animation clocks. The existing independent slow flicker remains unchanged.
- Gameplay, E/Q bindings, movement, no-checkpoint retries, opaque walls and pursuit behavior are unchanged.

## Verification

- `verify-under-green-lamp-craft.mjs`: all three physical fixture types preserve their old 14 geometry pieces exactly. Added cable/gland bounds stay within old full fixture bounds; 72 lens perimeter samples remain unchanged. Lens crown stays behind cage. All 17 flicker clocks sampled at 120 Hz over 100 seconds; maximum adjacent change 0.008067, Reduced Motion fixed at 0.72.
- `verify-under-green-lamp-craft.cjs`: 45 hardware and 45 software views. All 17 lamps have floor-valid before/after cameras; additional clock phases, 1280x720, 390x844, 844x390, actual Q, pause and Reduced Motion. Each lamp's instance tint, glow opacity and practical source uniform match the same clock. Pause freezes them exactly. Zero console/page errors; paired player state, resolution, texture/program counts and source levels unchanged.
- Native captures render at 2560x1600; software captures use a 960x600 render target within the 2560x1600 viewport. Software screenshots do not prove native detail. Inspected native entrance/gallery/keeper close views, all-17 contact sheet, portrait, software keeper, and final installed-client gameplay.
- `verify-under-green-moving-clearance.cjs --dry`: 1,379 route frames and 106 actual actor/tool mesh checks, no intersections, maximum foot error 2.42e-7. This is dry-route regression evidence, not the whole flood/encounter clearance gate.
- Installed develop-web-game client: final shot4/state4 ready/playing at (0,8.84), 960x540. The initial five-second Preparing-button click timeout recovered through later actions. No startup-performance acceptance is claimed.

## Art direction and remaining work

The curved glass and cable loops are visible without dominating the lamps. Cage, glass and internal filament remain distinct in warm and cold fixtures. The all-fixture review also shows that the housing silhouettes are still uniform. V31 remains partial for selected damaged/bent housings and localized wear, followed by route-scale review. V32 remains partial for critical crossing and full attack readability through the darkest authored phases; checking clock agreement alone is insufficient.

All broader material, architecture, water, narrative, presentation and performance work remains in scope. Ledger remains 24 implemented / 28 in progress / 1 pending, with seven full-level gates pending.

## Artifacts

Final evidence is under `output/under-green/visual-upgrade-local`: pass38-final/{hardware,software}, pass38-source, pass38-clearance, pass38-client and pass38-budget. Source snapshots and SHA-256 hashes cover three runtime modules and three verifiers. Existing junction and unrelated workspace changes are preserved.

## Isolated rendering measurements

All other owned render jobs were terminal before these tests; native and software ran sequentially. Six warm frames then24alternating GPU-fenced frames per view. This includes CPU submission and polling overhead, not pure GPU timestamps.

| Renderer / view | Median before / after ms | P95 before / after ms |
|---|---|---|
| hardware / gallery-lamp | 8.9 / 9.3 | 10.6 / 11.6 |
| hardware / keeper-lamp | 8.6 / 8.3 | 10.7 / 9.8 |
| software / gallery-lamp | 45.4 / 45.6 | 48.2 / 49.6 |
| software / keeper-lamp | 57.1 / 57.3 | 62.3 / 61.2 |

Draw, texture and program counts remain unchanged in paired views. Software absolute frame times remain inadequate; no full performance acceptance. All owned pass38 jobs are terminal; server4187 retained.
