# Rough Cut wet-turf atlas v1

This two-variant wet-course atlas was created with OpenAI image generation on 2026-08-04 for the sprinkler-soak mechanic.

## Files

- `rough-cut-wet-turf-atlas-v1-chroma.png` — preserved generated source on a flat magenta chroma field.
- `rough-cut-wet-turf-atlas-v1.png` — transparent runtime atlas.

## Runtime cells

| ID | Source rectangle | Use |
| --- | --- | --- |
| `soaked_brass_head` | `x 14, y 266, w 779, h 385` | Alternating soak zones with a brass embedded head |
| `maintenance_bog` | `x 986, y 279, w 768, h 385` | Alternating soak zones with mower ruts and an iron head |

Both variants are projected inside the existing wet-zone ellipses. Water spray, shimmer, ending fade, map rings, wet tracks, and gameplay effects remain runtime layers.

## Generation prompt

> Use case: stylized-concept. Asset type: production wet-terrain sprite atlas for a high-resolution 2.5D first-person pixel-horror golf-course game. Create exactly two isolated, wide, low-profile wet golf-course ground sprites in a strict two-column layout with an extremely wide center gutter on a perfectly flat solid #ff00ff chroma-key background. Left: heavily soaked dark golf turf with flattened wet grass, shallow silver-blue puddling, restrained muddy fringe, and a small aged-brass pop-up sprinkler head embedded at the center. Right: a darker waterlogged maintenance-bog patch with two shallow mower-tire depressions, cold puddled highlights, restrained moss and mud, and a small oxidized iron sprinkler head embedded at the center. Use very high-detail high-resolution pixel art, crisp deliberate pixel clusters, premium gothic survival-horror materials, and a slightly elevated front three-quarter ground-plane perspective. No water spray, text, signs, people, tools, balls, machinery, watermark, scene background, deep holes, tall pipes, or #ff00ff inside the sprites.

## Transparency pass

The runtime alpha image was produced with `remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`. The detected key was `#f904f8`; 1,165,091 pixels became fully transparent and 22,776 received partial alpha for clean wet-turf edges.
