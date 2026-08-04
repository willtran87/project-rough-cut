# Late-course route-thread contrast polish — 2026-08-04

## Intent

Keep the first-person objective route readable through the visually dense final course zones without making it a floating HUD line or allowing it to show through physical cover.

## Change

- Added `navigationRibbonPresentation()` to derive route treatment from the zones sampled by the actual world-space path.
- Service Maze, Dead Green, Night Range, and Release Corridor use a wider dark turf underlay, a two-pixel colored core, tighter dashes, and a stronger minimum reflector alpha.
- The opening zones retain the lighter restrained presentation.
- Reduced Camera Motion uses the same static late-course contrast without pulsing.
- Rendering order is unchanged: objective guidance and footing-bypass guidance remain below physical entities.
- Text state reports mode, late-course activation, sampled zones, dash cadence, underlay width, and core width.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 64/64 pass.
- Responsive captures inspected at 2560×1600, 1280×720, 844×390, and 1280×720 Reduced Camera Motion.
- Dedicated Dead Green and Release Corridor scenarios both retained visible world segments, the `late_course_ground_contrast` mode, and beneath-cover occlusion.
- Official web-game client completed the opening first-person smoke with no browser-error artifact; canvas rendering averaged 6.77ms and ended at 2.20ms across 104 frames.
- Local test page returned HTTP 200 at `http://127.0.0.1:4173/`.

## Guardrails retained

- No pathfinding, collision, target selection, objective distance, mini-map, or Joe-behavior values changed.
- The objective route remains visually distinct from the amber slow-footing bypass.
- Cover remains authoritative in both the first-person view and the map.
