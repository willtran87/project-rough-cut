# Rough Cut Escape Tableaux v1

## Purpose

Give each successful Hole 1 route a memorable visual payoff before and behind the after-action scorecard. The scenes must communicate survival and temporary refuge while preserving the game's horror tone; neither route should read as a cheerful or final victory.

## Shared production brief

- Runtime use: full-canvas `1280x720` victory background with a translucent central scorecard.
- Source format: opaque PNG, `1672x941`, no transparency required.
- Composition: 16:9, low eye-level, readable light sources and silhouettes in the upper third and side margins, darker low-contrast center for runtime UI.
- Style reference: `web/assets/rough-cut-joe-capture-v1.png`, used only for palette, pixel density, crisp clustered rendering, and cinematic night lighting.
- Art direction: high-resolution, high-detail pixel art with deliberate hard-edged clusters; no smooth painted blur, vector shapes, baked UI, text, border, logo, or watermark.
- Runtime motion: restrained sub-pixel camera drift and route-colored refuge glow; static composition under Reduced Camera Motion.
- Fallback: the existing course tableau remains available while a generated scene is loading.

## Maintenance shed route

- Canonical asset: `web/assets/rough-cut-shed-escape-tableau-v1.png`
- Camera: from just inside the maintenance shed, looking toward the nearly closed door.
- Story: warm lamp and the signed Night Order establish fragile refuge while Joe's mower headlight still crosses the wet course outside.
- Palette: rain-dark brown, blue-black, cold moonlight, restrained amber.

### Final built-in image-generation prompt

```text
Use case: stylized-concept
Asset type: route-specific 16:9 victory tableau background for a high-resolution pixel-art horror game
Input images: Image 1 is a style, palette, pixel-density, and lighting reference only; do not edit or reproduce its composition
Primary request: create the maintenance-shed escape payoff for Rough Cut after the player survives Joe's golf-course pursuit
Scene/backdrop: interior threshold of a small weathered golf-course maintenance shed at midnight; the heavy door has just been pulled nearly shut, leaving a narrow wedge of the moonlit course and ground fog visible outside; a distant mower headlight sweeps across wet grass through the gap; scarred workbench, hanging course tools, old turf charts without readable writing, damp floorboards, and one warm practical lamp establish temporary refuge
Subject: the environment is the subject; a signed paper Night Order rests on the workbench as a subtle story prop, but contains no readable text
Style/medium: exceptionally detailed cinematic pixel art with deliberate hand-placed pixel clusters, crisp hard-edged forms, limited dark blue-green and warm amber palette, consistent with Image 1; not smooth digital painting, not vector art, not faux blur
Composition/framing: wide 16:9 establishing view, low eye-level from just inside the shed; strongest environmental silhouettes and light sources in the upper third and outer side margins; preserve darker, lower-contrast negative space across the central and lower-middle area for a translucent scorecard overlay
Lighting/mood: warm amber refuge fighting cold moonlight and sickly mower spill; relief remains fragile, ominous, and horror-first rather than celebratory
Materials/textures: rain-dark wood, oxidized metal, wet boot grit, chipped paint, glass condensation, dense grass and drifting ground fog outside
Constraints: no people, no visible face, no logos, no trademarks, no watermark, no typography, no readable labels, no interface, no border, no split panels
Avoid: bright cheerful victory colors, daylight, gore, distorted tools, excessive clutter in the center, smooth airbrushed surfaces, photorealism
```

## Drainage culvert route

- Canonical asset: `web/assets/rough-cut-drain-escape-tableau-v1.png`
- Camera: low eye-level from inside the storm drain, looking back through the grate.
- Story: cold runoff, the protected Night Order, and the mower beyond the grate make the alternate escape feel illicit, damp, and only temporarily safe.
- Palette: teal, blue-black, oxidized copper, restrained amber.

### Final built-in image-generation prompt

```text
Use case: stylized-concept
Asset type: route-specific 16:9 victory tableau background for a high-resolution pixel-art horror game
Input images: Image 1 is a style, palette, pixel-density, and lighting reference only; do not edit or reproduce its composition
Primary request: create the drainage-culvert escape payoff for Rough Cut after the player survives Joe's golf-course pursuit
Scene/backdrop: inside a wide old storm-drain tunnel beneath the golf course at midnight, looking back toward a circular corrugated culvert mouth and heavy maintenance grate; cold runoff moves toward the viewer over shallow stone and mud; beyond the grate are moonlit wet grass, low ground fog, and a distant mower headlight sliding past without reaching the player; emergency utility niches and old drainage hardware line the tunnel walls
Subject: the environment is the subject; a protected signed paper Night Order sits on a dry concrete ledge as a subtle story prop, but contains no readable text
Style/medium: exceptionally detailed cinematic pixel art with deliberate hand-placed pixel clusters, crisp hard-edged forms, limited cold teal, blue-black, oxidized copper, and restrained amber palette, consistent with Image 1; not smooth digital painting, not vector art, not faux blur
Composition/framing: wide 16:9 establishing view, low eye-level from inside the culvert; circular exit, grate silhouette, water reflections, and small light sources read clearly in the upper third and outer margins; preserve darker, lower-contrast negative space across the central and lower-middle area for a translucent scorecard overlay
Lighting/mood: cold moonlight and faint cyan utility glow with one distant sickly mower beam; exhausted relief, damp claustrophobia, and lingering threat rather than celebration
Materials/textures: corrugated oxidized metal, mossy concrete, shallow black water, silt, wet stones, rivets, roots, drifting mist, hard pixel-art reflections
Constraints: no people, no visible face, no logos, no trademarks, no watermark, no typography, no readable labels, no interface, no border, no split panels
Avoid: bright cheerful victory colors, daylight, gore, sewer monsters, distorted circular geometry, excessive clutter in the center, smooth airbrushed surfaces, photorealism
```

## Validation record

- Native outputs inspected at `1672x941` and integrated at `1280x720`.
- Shed and drain routes tested independently at tableau reveal and full scorecard states.
- The scorecard remains legible over both images with route-specific color treatment.
- Reduced Camera Motion reports and renders a static tableau without changing the reward or result actions.
- Keyboard result navigation still moves from Rematch File to Next Order.
- Final sampled victory rendering remained approximately `0.9-1.3ms` in the deterministic browser harness with no console errors.
