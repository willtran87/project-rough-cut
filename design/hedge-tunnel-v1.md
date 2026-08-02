# Rough Cut Hedge Tunnel v1

## Purpose

Replace the visibly repeated and stretched hedge-wing crops with one coherent high-resolution pixel-art landmark while preserving the already-tested center opening, collision ellipses, sight blocking, map geometry, and contact guidance.

## Image generation

- Mode: built-in ImageGen, using `rough-cut-expanded-course-kit-v1.png` as the strict style reference.
- Chroma source: `web/assets/rough-cut-hedge-tunnel-v1-chroma.png`.
- Production alpha asset: `web/assets/rough-cut-hedge-tunnel-v1.png`.
- Generated size: 2172×724.
- Alpha crop: x 63, y 119, width 2054, height 473.
- Chroma removal: border-sampled soft matte, transparent threshold 12, opaque threshold 220, and magenta despill.
- Alpha validation: 821,410 fully transparent pixels, 23,994 partially transparent pixels, and four fully transparent corners.

## Prompt

```text
Use case: stylized-concept
Asset type: production game environment sprite for a first-person pixel-art horror game
Input images: Image 1 is the strict style, palette, material, foliage-detail, moonlight, and pixel-density reference; use its hedge arch as the design language, but create a new wider coherent asset.
Primary request: create one seamless, very wide clipped hedge tunnel landmark: dense continuous hedge wings extending equally far left and right, with one centered walk-through arched opening. The side wings must contain varied, non-repeating branches, trunks, leaves, fescue, weeds, roots, and subtle dead growth. The hedge top and planted baseline must flow continuously across the entire piece. The arch opening must be completely unobstructed and clearly readable.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background everywhere outside the hedge silhouette and visible through the entire arch opening. No ground plane beyond the planted hedge base.
Style/medium: high-resolution, high-detail hand-crafted pixel art; crisp square pixel clusters; same restrained chunky pixel scale, dense leaf highlights, dark woody structure, and visual fidelity as Image 1. No smooth painting, no vector look, no photorealism.
Composition/framing: single isolated landmark, straight-on orthographic/front view, very wide landscape composition approximately 3:1, centered arch opening about 14 percent of total sprite width, equal-height hedge wings, generous magenta padding on all sides, entire silhouette visible and uncropped.
Lighting/mood: cold blue-green moonlight with restrained sickly yellow-green leaf highlights, near-black inner branches, subtle horror atmosphere baked only into foliage color; no fog or atmospheric background.
Constraints: maintain one coherent pixel density across wings and center arch; unique foliage rather than repeated modules; left and right wings visually varied but balanced; crisp silhouette; no cast shadow, no contact shadow outside the planted base, no gradient or texture in the magenta background; do not use #ff00ff within the hedge; no characters, mower, signs, text, UI, logos, watermark, sky, moon, clouds, buildings, separate props, or extra openings.
```

## Runtime integration

- All seven hedge tunnel parents render the same dedicated asset once at their existing anchors and scales.
- The fourteen side children are collision-only and retain their original positions, radii, cover radii, and Joe sight-blocking behavior.
- The alpha-cropped landmark is cached once at a 1536-pixel maximum dimension, preserving high-detail foliage while reducing each visible tunnel from thirteen atlas draws to one cached draw.
- The world opening remains unobstructed at x 0 in the Audit Row route test. A deliberate left-side approach contacts `audit-arch-left` at x -20 / y 108 and produces the existing `MOVE RIGHT AWAY` response.
