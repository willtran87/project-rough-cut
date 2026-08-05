# Rough Cut course boundary kit v1

This two-object production atlas was created with OpenAI image generation on 2026-08-04 to replace the last visible procedural course-hardware stand-ins.

## Files

- `rough-cut-course-boundary-kit-v1-chroma.png` — preserved generated source on a flat magenta chroma field.
- `rough-cut-course-boundary-kit-v1.png` — runtime alpha version produced with the image-generation skill's chroma-removal helper.

## Runtime cells

| ID | Source rectangle | Use |
| --- | --- | --- |
| `reflective_stake` | `x 50, y 50, w 430, h 900` | Exact east/west perimeter anchors |
| `course_limit_placard` | `x 750, y 390, w 750, h 580` | HUD-safe boundary warning card |

The connector rope, directional copy, and warning emphasis remain runtime layers. They depend on live perspective, collision side, localization/accessibility text, and player proximity and are not missing object art.

## Generation prompt

> Use case: stylized-concept. Asset type: production sprite atlas for a high-resolution 2.5D first-person pixel-horror golf-course game. Create exactly two isolated custom game-object sprites arranged in a strict two-column layout with a very wide empty gutter between them. Use a perfectly flat solid #ff00ff chroma-key background with no shadows, gradients, texture, floor plane, reflections, or lighting variation. Left: one tall weathered dark-oak golf-course perimeter stake, hammered metal cap, small rectangular amber reflector, black braided boundary rope tied through an iron eyelet and trailing only a short distance to the right, and a compact irregular base of dead reeds and exposed soil. Right: one low freestanding weathered golf-course boundary placard mounted between two short dark-oak stakes, with a dark nearly-black blank rectangular sign face, thick aged brass/amber frame, small reflector tabs, and restrained dead grass and soil at the base. No letters, symbols, arrows, numbers, logos, or pseudo-text. Very high-detail high-resolution pixel art, crisp deliberate pixel clusters, slightly isometric front three-quarter game sprite, dark moonlit horror palette, oxidized brass, damp wood, moss, cold cyan rim light, and warm amber reflector accents. Each object fully separated and fully visible with generous padding. Opaque solid objects with crisp edges; no #ff00ff inside either object; no watermark; exactly two objects only.

## Transparency pass

The alpha asset was derived from the preserved source with `remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`. The detected border key was `#fc05f9`; 1,149,285 pixels became transparent and 22,834 received partial alpha for clean sprite edges.
