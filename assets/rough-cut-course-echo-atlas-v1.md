# Rough Cut Course Echo atlas v1

This two-state spectral-runner atlas was created with OpenAI image generation on 2026-08-04 for the recorded Course Echo mechanic.

## Files

- `rough-cut-course-echo-atlas-v1-chroma.png` — preserved generated source on a flat magenta chroma field.
- `rough-cut-course-echo-atlas-v1.png` — transparent runtime atlas.

## Runtime cells

| ID | Source rectangle | Use |
| --- | --- | --- |
| `mint_ahead` | `x 62, y 84, w 372, h 832` | Recorded runner currently pacing ahead of the player |
| `amber_behind` | `x 1094, y 84, w 370, h 832` | Recorded runner behind the player, including Master Echo presentation |

Both variants use the same full-body runner design and apparent height. Recorded path samples, pace timing, ground ring, trail, map state, focus labels, score comparison, and completion rules remain runtime-owned.

## Generation prompt

> Use case: stylized-concept. Asset type: production two-sprite character atlas for a high-resolution 2.5D first-person pixel-horror golf-course game. Primary request: create exactly two isolated spectral runner sprites in a strict single horizontal row with an extremely wide empty gutter between them. They represent an anonymous office worker's recorded Course Echo, not the antagonist Joe. Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal; one uniform color only, with no gradient, texture, floor plane, horizon, cast shadow, reflection, fog, or lighting variation outside the figures. Left subject: one translucent-looking but fully opaque pale mint-and-cyan spectral office worker running away from the viewer into the course, rear three-quarter pose, urgent forward stride, rumpled button-down shirt with rolled sleeves, dark slacks, office shoes, loose lanyard, no equipment. Right subject: the identical runner design, scale, pose, silhouette, and viewing angle in muted antique amber and pale gold, signaling a recorded route that has fallen behind. Style/medium: very high-detail high-resolution pixel art, crisp deliberate pixel clusters, premium gothic survival-horror game sprite art, readable anatomy and clothing at small scale, subtle internal scanline fragmentation and restrained ghostly edge breakup contained inside the silhouettes. Composition/framing: exactly two separate full-body figures only; one centered in each half; identical apparent height; feet aligned; fully visible; generous padding; extremely wide clean central gutter; no overlap. Lighting/mood: eerie moonlit apparition, cold restrained rim on the mint figure and warm tarnished rim on the amber figure, unsettling but tactically readable; no neon bloom. Constraints: crisp isolated fully opaque outer silhouettes suitable for chroma removal; use no #ff00ff inside either figure; no external aura, trail, particle cloud, contact shadow, cast shadow, text, letters, symbols, arrows, signs, weapons, mower, golf club, golf ball, machinery, extra people, watermark, border, divider, or UI; exactly two sprites only. Avoid: Joe likeness, facial portrait emphasis, front-facing pose, standing pose, superhero pose, floating pose, skeletal ghost, robe, transparent outer edges, smooth vector rendering, blurry painterly edges, scene background, duplicated limbs, pseudo-text.

## Transparency pass

The runtime alpha image was produced with `remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`. The detected key was `#fb03f9`; 1,293,047 pixels became fully transparent and 18,105 received partial alpha. Direct inspection confirmed transparent corners, isolated figures, clean gutters, and no visible magenta field.
