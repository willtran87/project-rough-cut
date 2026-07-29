# Rough Cut Expanded Course Landmark Kit

## Runtime asset

- Source with chroma background: `rough-cut-expanded-course-kit-chroma-v1.png`
- Transparent master: `rough-cut-expanded-course-kit-v1.png`
- Runtime copy: `web/assets/rough-cut-expanded-course-kit-v1.png`
- Canvas: 1672 × 941 pixels, RGBA
- Layout: 3 columns × 2 rows

## Sprite order

1. Hedge tunnel arch
2. Overturned golf cart
3. Pond reeds and broken warning stake
4. Bunker retaining wall and rake
5. Blank insurance-audit scoreboard
6. Maintenance floodlight tower

## Generation prompt

```text
Use case: stylized-concept
Asset type: high-resolution 2D pixel-art sprite sheet for a first-person 2.5D horror game environment
Input image: style and layout reference only; do not copy its specific objects
Primary request: create exactly six NEW isolated golf-course horror environment landmarks arranged as a clean 3-column by 2-row sprite sheet.
Top row, left to right: (1) a dense clipped hedge arch / narrow hedge tunnel with a readable walk-through opening, (2) an overturned abandoned golf cart with spilled golf bags and a dangling clipboard but no readable text, (3) a moonlit pond-edge reed cluster with a broken warning stake and a clearly readable dark-water boundary.
Bottom row, left to right: (4) a low sand-bunker timber retaining wall with one abandoned rake, (5) a freestanding insurance-audit scoreboard/sign structure with blank dark panels and no letters or logos, (6) a maintenance floodlight tower with cables, utility box, and one eerie amber lamp.
Style/medium: extremely detailed, high-resolution deliberate pixel art; crisp hard pixel clusters, limited dark golf-course palette, moss green, black-green, muted brown, rust orange and small amber highlights; same visual density, camera angle, edge treatment, and horror mood as the reference sheet.
Composition/framing: each object fully visible, centered within its own equal cell, generous padding, no overlap between objects, aligned ground baselines per row, consistent straight-on/slightly elevated game-sprite perspective. The hedge arch opening must be visibly traversable; the pond water edge and bunker wall must communicate collision boundaries clearly.
Background: perfectly flat uniform solid #ff00ff chroma-key magenta across every unused pixel. No shadows, gradients, texture, lighting variation, floor plane, horizon, or reflections in the background.
Constraints: exactly six objects, no people, no Joe, no mower, no extra props outside the six cells, no text, no letters, no numbers, no logos, no watermark. Do not use #ff00ff anywhere in the objects. No cast shadow or contact shadow extending into the magenta. Preserve crisp pixel edges and strong silhouettes suitable for background removal and perspective scaling.
```

## Post-processing

The built-in image generator produced the chroma-key master. The imagegen transparency helper removed the magenta background using border sampling, a soft matte, despill, and conservative alpha thresholds. The final asset was visually inspected and its four corners verified as fully transparent.
