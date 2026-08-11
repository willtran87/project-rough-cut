# Rough Cut moving golf-ball atlas v1

This three-state moving-object atlas was created with OpenAI image generation on 2026-08-04 so golf-ball distractions retain authored art from release through recovery.

## Files

- `rough-cut-moving-golf-ball-atlas-v1-chroma.png` — preserved generated source on a flat magenta chroma field.
- `rough-cut-moving-golf-ball-atlas-v1.png` — transparent runtime atlas.

## Runtime cells

| ID | Source rectangle | Use |
| --- | --- | --- |
| `pristine_flight` | `x 84, y 170, w 393, h 397` | Airborne ball with restrained moonlit rim |
| `wet_grass_roll` | `x 839, y 170, w 393, h 397` | Rolling ball on wet turf and soaked bunkers |
| `scuffed_ground_roll` | `x 1593, y 170, w 393, h 397` | Rolling ball through rough, roots, mud, or bunker sand |

The ball sprite rotates from real shot progress unless Reduced Camera Motion is enabled. Trajectory, target shadow, surface tint, rest ring, and the generated landed/recovery prop remain state-driven runtime layers.

## Generation prompt

> Use case: stylized-concept. Asset type: production moving-object sprite atlas for a high-resolution 2.5D first-person pixel-horror golf-course game. Primary request: create exactly three isolated golf-ball sprites in a strict single horizontal row with extremely wide empty gutters between them. Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal; one uniform color only, no gradients, texture, floor plane, horizon, shadows, reflections, or lighting variation outside the balls. Left object: one pristine ivory golf ball, perfect spherical silhouette, deep crisp dimples, restrained warm moonlit rim and cool shadow side, suitable for airborne flight. Center object: one wet golf ball, perfect spherical silhouette, crisp dimples, small cold cyan-silver water beads and a restrained dark-green grass smear, suitable for rolling through soaked turf. Right object: one scuffed golf ball, perfect spherical silhouette, crisp dimples, restrained damp brown mud and pale bunker-sand smears on the lower third, suitable for rolling through rough, mud, roots, or bunker sand. Style/medium: very high-detail high-resolution pixel art, crisp deliberate pixel clusters, premium gothic golf-course survival-horror game sprite art, strong readable material identity at small scale. Composition/framing: exactly three separate balls only; one centered in each third; identical apparent diameter and viewing angle; fully visible; generous padding; no overlap; extremely wide clean gutters; no base, grass mound, tee, or ground plane. Lighting/mood: eerie moonlit night, ivory and muted cream body tones, restrained cold cyan rim light, subtle warm amber reflection, readable spherical volume without neon glow. Constraints: opaque perfect circular ball silhouettes with crisp isolated edges; use no #ff00ff inside any ball; no cast shadow, contact shadow, motion trail, reflection, text, letters, symbols, arrows, signs, people, clubs, tees, grass, machinery, watermark, border, divider, or UI; exactly three sprites only. Avoid: oval balls, flattened perspective, giant grime coverage, glowing orbs, glass, smooth vector rendering, blurry painterly edges, scene backgrounds, multiple angles, repeated variants, pseudo-text.

## Transparency pass

The runtime alpha image was produced with `remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`. The detected key was `#fc06fa`; 1,244,366 pixels became fully transparent and 5,283 received partial alpha for clean spherical edges.
