# Right-edge marker/map separation polish — 2026-08-04

## Outcome

Right-side off-axis interaction prompts now stop before the persistent course map instead of using map-covered canvas as navigable presentation space. The complete card, distance, and right arrow remain visible with an 18-pixel gap from the map.

## Implementation contract

- Interactable prompt width remains 196 logical pixels; ordinary markers remain 148 pixels.
- The left safe boundary remains the 18-pixel course-frame gutter.
- During first-hole play, the right safe boundary is `COURSE_MAP_X - 18`; other modes retain the full canvas boundary.
- The shared placement result owns clamping and `left`/`right` edge direction for both rendering and `render_game_to_text`.
- Exported diagnostics report `safeRegion`, `rightBoundary`, `fullyInsideFieldRegion`, and `fullyClearOfCourseMap` in addition to the existing canvas-containment result.
- No world position, interaction, navigation, collision, map, or pursuit rules changed.

## Validation

- `node --check web/game.js`
- `node output/validate-route-pressure.mjs` — 18/18 checks passed.
- `node output/validate-route-pressure-visual.mjs` — 136/136 checks passed at:
  - 2560×1600
  - 1280×720
  - 844×390
  - 1280×720 with Reduced Camera Motion
- Inspected all four dedicated `right-edge-marker` captures. The `SHED KEY // 57m ▶` card remains fully left of the map with a stable gap and no clipping.
- Ran the official uninstrumented web-game client through the first-person tactical handoff. No `errors-0.json` artifact was produced; canvas work averaged 7.12ms and ended at 2.10ms across 104 rendered frames.

## Evidence

- Responsive captures: `output/route-pressure-visual-validation/*-right-edge-marker.png`
- Responsive state ledger: `output/route-pressure-visual-validation/latest-state.json`
- Official smoke: `output/right-marker-map-clearance-official-2026-08-04/`

## Suggested human check

Alternate between left- and right-side objectives while Joe is actively chasing. Adjust only the shared 18-pixel gutter if an edge feels cramped; keep measured card width, map separation, and the shared placement contract intact.
