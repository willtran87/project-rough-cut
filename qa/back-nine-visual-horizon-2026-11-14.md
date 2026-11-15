# Back Nine: distant ridge and woodland depth

The old two-layer horizon repeated a blue-lit forest strip around the entire course. Back Nine now uses three layers: a cool far ridge, a darker wooded slope, and muted nearby estate woodland. Heights and angular profiles differ, so the layers overlap differently around the course. This advances BV20 and the broader palette/composition requirements; the full 48-item objective remains active.

## Production change

- New `web/back-nine-horizon.js` builds three cylindrical illustrated layers at radii 660, 365 and 175, with distinct parallax influences. The original high-resolution ridge and treeline artwork supplies the branches and fine edges; there are no new image assets.
- The material retains the artwork's luminance detail and alpha silhouette, using a restrained stepped palette for each distance. Its lower edge darkens into the surrounding woodland instead of retaining the source image's blue glow.
- Broad geometry variation changes the skyline continuously around each ring. Mirrored texture wrapping and even repeat counts close both the illustrated-strip joins and the full cylindrical seam. The first candidate used ordinary repeat wrapping and is intermediate evidence only.
- `createParallax` gains an opt-in `estateHorizon` flag. Only Back Nine enables it. The default Level 1 backdrop follows the existing code path; new textures use separate cache keys to avoid modifying its map transforms.
- Horizon geometry/materials follow existing backdrop disposal. Shared illustration maps remain in the Art cache. No new lights, simulation work, collision, navigation or input changes.
- Back Nine import-map versions are `20261114-horizon-2`. Unique import keys and served module bytes were verified.

## Verification and accepted views

Evidence: `output/back-nine-visual-upgrade/horizon`.

- Geometry unit: all 1,158 vertices finite; 1,152 triangles face outward for interior BackSide rendering; mirrored UV/height seams close; 360 horizontal ray tests cover every direction. The camera remains inside every layer along the course. Course/navigation data is unchanged.
- Native and software browser captures cover nursery, pump yard, range, east/west views, clubhouse, reverse heading and the garage approach at 2560 × 1600. Also checked 1280 × 720 and 390 × 844. Pause/resume and full restart pass with no console/page errors.
- Use `final-native` / `final-software` for the first seven views, and `garage-native` / `garage-software` for the corrected garage and smaller breakpoints. The original `(0,795)` garage fixture was inside collision and its three images are rejected. The replacement `(-33.76177,769.442)` is a clear approach through the foot gate; the test now rejects blocked camera fixtures. Baseline counterparts are `before-native` and `garage-before`.
- Direct GPU comparison of default backdrop rendering at three positions/headings is pixel-identical to the previous module on both renderers. This is a backdrop regression check, not a claim that the whole of Level 1 was retested.
- A separate backdrop render verifies that long travel changes projection, a subsequent camera turn independently changes projection, and moon coverage stays unchanged. Layer origins match their specified world translation factors. The software supplemental test also checks that creating the new horizon leaves existing default texture transforms untouched.
- Disposal observers record exactly three geometry disposals and three material disposals, with no shared texture disposal.
- Actual screenshots were opened and inspected, including native forward/side/reverse views, software range/clubhouse, and the corrected garage approach.
- Installed standard gameplay client, via `tools/verify-presented-client.mjs`, ran forward/turn/rear-look actions on native and software renderers. Both finish at `(20.99670594253312,83.94355811194566)` with player/cart/Joe/time/checkpoint identical to the previous accepted turf pass. No error artifacts; final screenshots and text state inspected. Evidence: `client-native`, `client-software`, `client-comparison.json`.

## Cost and limits

Eight matched native views retain identical player/cart/Joe/time/progression/navigation state, shader-program count and texture count. They add one draw call. The reported main-scene triangle count is unchanged because that statistic excludes the backdrop; the backdrop itself grows from 384 to 1,152 triangles, an increase of 768.

The two-prepared-world profiler alternates 36 GPU-fenced samples per world/view at 960 × 540. Native nursery median is 8.0 → 8.0 ms (P95 10.0 → 12.6); range median 8.1 → 8.2 ms (P95 12.0 → 9.9). These are short, fixed-view comparisons on a shared host, not a whole-level performance guarantee.

Software nursery median is 63.0 → 64.3 ms (P95 93.1 → 97.9); range median 76.9 → 66.1 ms (P95 109.0 → 93.1). Results are mixed and subject to other work on this host; they do not support a general speedup claim. Software rendering and full-load quality remain open.

Actual chase-client observations: native 2560 × 1440, average 12.76 / P95 15.50 ms; software 640 × 360, average 121.69 / P95 184.20 ms. The software fallback remains visibly coarse and slow; no full-quality performance acceptance is claimed.

## Remaining work

The backdrop now has useful atmospheric depth. Distant architecture and sparse practical lights, broader district composition and motion-quality acceptance remain open under BV20. The playable middle distance still has repeated planting shapes and broad empty areas; actor motion, architecture craft, static grounding and combined-load/software quality also remain unfinished. This pass does not establish complete Level 1 parity.
