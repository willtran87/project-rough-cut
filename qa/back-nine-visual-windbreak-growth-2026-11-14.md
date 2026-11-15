# Back Nine windbreak growth — 2026-11-14

The three existing windbreaks now have closed rounded crowns, irregular sides, connected terminal shoots, and the Level 1 hedge surface. This replaces the previous rows of fern cards wrapped around a dark box. It advances BV14/BV15/BV42; those wider requirements remain incomplete.

## Implemented

- New `web/back-nine-windbreak-growth.js`: 460 connected shoots and 2,300 folded leaves across the nursery, range and clubhouse hedges. The opaque core remains above eye height and inside the original cover footprint.
- Triplanar mapping preserves leaf scale around rounded shoulders and ends. Separate underside/end normals prevent the base from acquiring stretched vertical streaks. Restrained surface fill retains foliage detail at night.
- Outer growth bends slightly; the solid core does not move. Actual reduced-motion settings disable this animation. Existing terrain, collision, navigation and destruction rules are unchanged.
- Existing Level 1 hedge texture reused; no new texture allocation. One additional material program and one draw in the checked hedge views; no extra draw in the unrelated border view.

## Evidence inspected

Evidence root: `output/back-nine-visual-upgrade/windbreak-growth`.

- `geometry.json`: finite geometry/unit normals, original-footprint containment including maximum wind displacement, zero core flex, and 1,832 opaque-core cover rays. All pass.
- `contracts.json`: existing 44 border groups and five destructible planters remain inside their appropriate footprints. Three windbreaks pass updated shape checks.
- `before-native`, `final-native`, `final-software`: 13 matched cases each, including all three hedges, end/side/approach views, nearby Joe/beacon, reduced motion, 1280×720 and 390×844. Main views are 2560×1600. Actual final images opened, including the software range, native phone, beacon and both standard-client traversal images.
- `comparison.json`: all 13 cases retain identical player/cart/Joe/time/objective/checkpoint/service/utility/navigation/destruction/failure state. Renderer variants match. Reduced-motion wind state is zero in the final three cases. Pause freezes the full run; restart checkpoint remains zero; no browser errors.
- Installed standard gameplay client, two movement/turn bursts per renderer: final player `(-5.527627985350055,137.74765124121095)`, both renderers identical. Native canvas 2560×1440, software 640×360. Final native average 11.36 ms / P95 12.70 ms; software 57.65 ms / P95 65.70 ms in this traversal. This is not a whole-level performance claim.
- `profile-native` / `profile-software`: two prepared worlds share one renderer, alternating short GPU-fenced blocks, 36 samples per candidate/view at 960×540. Native medians nursery 8→8 ms, range 7.1→7.1 ms, road 7.1→7.1 ms. Software 65.1→63.6, 66.1→66.1, 62.1→64 ms. Shared-host timing noise precludes a speedup claim. Textures remain 56; programs 35→36. Visible triangles increase 6,232–7,404 in checked hedge views.
- `accepted-source`, `accepted-tools`, `manifest.json`: source snapshots and evidence hashes. `tools/audit-windbreak-growth.mjs` checks current served bytes, unique imports, state/resource comparisons and client outcomes.

## Limits and remaining work

`first-native` and `surface-native` are rejected intermediate renders; the former is too dark and the latter has stretched base texture. Only `final-*` and current clients support acceptance. Existing Level 1 hedge captures were inspected as silhouette/material references; their very dark frontal views do not prove broad lighting parity.

Broader vegetation composition is still unfinished: adjacent tall fern bands remain repetitive and can obscure the runner's lower body. Species variety, stronger middle-distance arrangements, encounter framing, camera composition and full-level performance remain open. Software rendering still shows coarse resolution and lighting differences. This pass does not establish all 48 requirements as complete.
