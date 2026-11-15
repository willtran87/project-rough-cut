# Back Nine — turf, soil and path margins

Partial BV08 implementation, with BV01/BV09/BV48 evidence. The full 48-item visual upgrade remains active.

## Implemented

- Replaced hard-edged cart-route shoulders with feathered, irregular turf ribbons following the existing rounded routes. The original navigation, movement widths and collision data are unchanged.
- Added narrow exposed-soil margins beside paved routes and the four service courts. Unpaved cart routes now use illustrated soil wheel lines with blended edges instead of straight grey stone strips.
- Reused the existing 1254-square sediment artwork at 4m / 313.5 texels per metre; no additional texture allocation. Paving grain changes from 128px per 1.4m to 128px per .7m, matching the ordinary Level 1 material-density range.
- Soil fades away inside intersecting paved routes. Ground follows the exact existing triangular height field. Tight inner-bend offsets can fold back onto adjacent pieces; backwards decorative slivers are removed, leaving the original opaque road intact beneath them.
- `contourGround` now preserves RGBA vertex colors through terrain clipping, including interpolated alpha. RGB callers retain identical construction results.
- Explicit transparent-layer order draws turf shoulders before soil, then existing fresh mower scars. This fixed a real visual failure: the first wheel-line replacement was nearly hidden beneath its turf layer despite passing geometry/state checks. Flooding remains above both layers and uses the same authoritative wet masks.

## Evidence

Accepted artifacts are under `output/back-nine-visual-upgrade/route-margins`, a junction to `D:/CodexArtifacts/project-rough-cut/visual-upgrade/route-margins-20261114`:

- `before-native`: matched original main path, unpaved track, court, wet road and flooding.
- `native-ordered`, `software-ordered`: final main path, wheel lines, court, clubhouse junction, wet road and flooding at 2560×1600, plus 1280×720 and 390×844 flooding views. Images were opened and inspected. The `native`, `native-final`, and `software` directories are intermediate candidates, not acceptance evidence.
- `client-native`, `client-software`: installed standard game client, two movement/turn bursts, `--route-margins`, `tools/fixtures/back-nine-route-margins.json`. The player moves from path to rough, ending at (-13.145,74.316), with matching state in both renderers. Actual captures and states inspected; no recorded errors.
- `budget`: fixed-camera 960×540 software comparison against saved pre-change scene/landscape/terrain source.
- `baseline-source`: original scene, landscape, terrain and HTML snapshots. `manifest.json` hashes current implementation, accepted reports/states, and baseline sources.

Passing commands:

```text
node tools/verify-back-nine-route-margins.mjs
node tools/verify-back-nine-ground-art.mjs
node tools/verify-back-nine-irrigation-art.mjs
node tools/verify-back-nine-mower-scars.mjs
node tools/verify-back-nine-route-margins.cjs <output>
node tools/verify-back-nine-route-margins.cjs <output> --software
node tools/profile-back-nine-route-margins.cjs <output> <baseline-source>
```

Geometry checks cover 3,106 pieces (978 shoulders / 2,128 soil pieces), 89,720 clipped vertices and 120,794 triangles. Indexed faces point upward; alpha survives clipping and stays in range. All vertex and triangle-centroid samples follow terrain at .03m turf / .041m soil offset (measured .0299915–.0410081m). Course/navigation snapshots remain unchanged. Existing synchronous/asynchronous ground construction, irrigation-state and mower-scar regressions pass.

Final browser checks cover active flooding, pause/restart, stable resources and no console/page errors. The software pass additionally inspects actual margin meshes for explicit -3/-2 layer order, RGBA attributes and native 1254px maps. Native uses 30 programs, software 37; both retain 53 textures across the checked views.

Native final gameplay burst: 2560×1440, average 11.07ms / p95 12.2ms. Software final burst: 640×360, average 120.01ms / p95 143.6ms. The fixed-960 software comparison is baseline median 85.1ms / p95 94.9ms versus current 77ms / p95 100ms, with 110→112 draws and 125,037→138,257 triangles. Median improves while p95 worsens; host variation and this single view prevent a regression-free or whole-level performance claim.

## Still open

BV08 remains in progress. Foot-only paths, shortcut/service spurs, bunker joins and broader court/gravel wear still need consistent transition treatment. This is not acceptance of all materials, scenery density, Level 1 parity, or all lighting conditions. Whole-scene software fidelity/performance remains below target and the portrait HUD obscures much of the small scene. No difficulty, bell, checkpoint, AI or collision changes were made.
