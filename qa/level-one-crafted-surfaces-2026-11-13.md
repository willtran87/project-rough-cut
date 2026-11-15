# Level 1 crafted surface pass — partial comprehensive upgrade

Scope: seven Level1 repeating material maps. Preserve the complete V01–V21 plan, low ambient light,28 symmetric lanterns, larger mower, no red Joe beacon and moving/fading ghosts. Other chapters retain `createCourseSurfaces` unchanged.

## Implementation

`web/course-crafted-surfaces.js` uses connected, directional pixel marks for wood, paint, brass, iron, stone, rubber and rust. Wood has fibre runs/knots; stone has broad mineral planes, stepped fractures, intermediate flakes and sparse fine inclusions; rubber stays quiet and matte; metal maps use restrained corrosion/chipping and scratches. Maps remain128square at the existing.7m repeat scale, with nearest magnification/mipmapped minification. Static maps reuse the existing cache/disposal ownership; no shader, lighting, collision or geometry changes.

`pixel-world-props.js` opts into the new factory. Authored512px architecture maps, source foliage, paper, enamel and other fallback types retain their existing behavior. `scene-3d.js` updates the module version.

The initial smoother stone was visibly too flat/dark. It was revised before acceptance for this incremental pass. This is material separation work, not final artistic acceptance of all material families. In particular, object-specific wear, close metal craft, terrain transitions, window interiors and fixtures remain unfinished.

## Evidence

`node tools/verify-course-crafted-surfaces.cjs --before` captures the saved pre-change pixel-world-props source against the same current game. `node tools/verify-course-crafted-surfaces.cjs` and `--software` exercise the real renderer, seven actual scene maps, camera motion, pause and responsive views. Outputs live under `output/level-one-crafted-surfaces/`.

- Native matched opening/service/ground/stone views:2560x1600 viewport, actual2492x1402 scene. All four before/after draw and triangle counts identical: ground547/534442; stone835/898204; service386/423428; opening651/705550. Scene map count84, geometry961, programs80 remain unchanged.
- Software captures:960x540 render target at2560x1600 viewport;84maps,742geometries,89programs. Software simplification remains existing behavior.
-1280x720 and390x844 gameplay captures inspected. Also inspected material swatches, near stone, service building and keyboard gameplay. All seven named crafted maps are found on real scene materials. Fallback paper and map caching pass.24 camera steps cause no map/geometry/program growth. This is a bounded reuse check, not extended-play leak acceptance.
- Native real ArrowUp input moved the player from(0,200)to(0,212). Escape pause, frozen movement while paused and Escape resume pass. Final software control check recorded in its report.
- Lantern pairs remain14; ambient intensity remains.005. No browser errors in the renderer runs.
- Installed skill client ran to terminal exit0 with Enter/arrow bursts. Its inspected final state remains`opening_story`; its canvas screenshot is not gameplay evidence. The focused renderer harness provides actual gameplay/keyboard evidence separately. Do not describe the installed-client run as a completed gameplay route.

No full performance or full visual-upgrade completion claim. Current native draw counts are substantial and remain a later performance acceptance concern. Prior foundation frame timing reports are historical fixture evidence, not a current whole-level guarantee.
