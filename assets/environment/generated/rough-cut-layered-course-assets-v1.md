# Rough Cut Layered Course Assets v1

Generated July 29, 2026 with the built-in image-generation tool.

The existing `rough-cut-hole-1-night.png` image was supplied as a style, palette, lighting, and pixel-density reference. It was not used as an edit target.

## Course Obstacle Kit

Files:

- `rough-cut-course-obstacle-kit-chroma-v1.png` — generated chroma source
- `rough-cut-course-obstacle-kit-v1.png` — cleaned RGBA master
- `../../../web/assets/rough-cut-course-obstacle-kit-v1.png` — browser runtime copy

Prompt:

> Create a clean 3-column by 2-row sprite sheet containing six separate golf-course obstacle and boundary clusters: dense moonlit rough-grass hedge, weathered rope-and-post boundary, mature pine and shrub cluster, abandoned red maintenance push cart with fuel can and clippings, ominous wooden directional sign without legible text, and bunker-edge reeds, stones, and broken rake. Use high-resolution, high-detail cinematic pixel art with crisp clusters matching the supplied moonlit course. Use cold blue-green moonlight and restrained rust/amber accents. Isolate all six sprites on a perfectly flat `#ff00ff` chroma background with no grid, text, logos, people, overlap, or external shadows.

## Foreground Fringe

Files:

- `rough-cut-foreground-fringe-chroma-v1.png` — generated chroma source
- `rough-cut-foreground-fringe-v1.png` — cleaned RGBA master
- `../../../web/assets/rough-cut-foreground-fringe-v1.png` — browser runtime copy

Prompt:

> Create one continuous wide foreground fringe of very tall wet rough grass, cattails, low brambles, dark stones, and two short weathered boundary posts. Keep the lower-middle route somewhat broken and lower, with taller edge clusters. Use high-resolution cinematic pixel art, a crisp irregular silhouette, cold moonlit rim light, and deep black-green shadows matching the supplied Hole 1 art. Root the art along the bottom and isolate it on a perfectly flat `#ff00ff` chroma background with no people, machinery, interface, text, logos, or external shadows.

## Processing

Both assets used the installed image-generation chroma-removal helper with border auto-key sampling, soft matte, thresholded opacity, and despill. Runtime approval was based on alpha inspection and in-game screenshots rather than the standalone generations alone.

## Clean Hole 1 Background Plate

Files:

- `rough-cut-hole-1-clean-plate-v1.png` — canonical generated background plate
- `../../../web/assets/rough-cut-hole-1-clean-plate-v1.png` — browser runtime copy

Prompt:

> Remove all near-camera foreground elements from the Hole 1 environment: tall close grass walls, cattails, foreground signboard, foreground sprinkler valve, large foreground rocks, and any vegetation that appears attached to the camera. Replace those areas with continuous low-cut fairway and low rough receding toward the existing maintenance shed. Preserve the moonlit sky, distant tree line, clubhouse lights, bunker, shed and warm light, fence posts, camera angle, horizon, palette, pixel density, and cinematic nighttime mood. Add no people, machinery, UI, text, logos, or new foreground objects.

This plate replaced the original gameplay backdrop because the original image contained immovable foreground pixels. The original remains preserved as source art.

## Drainage Culvert Escape

Files:

- `rough-cut-drain-culvert-chroma-v1.png` — generated chroma source
- `rough-cut-drain-culvert-v1.png` — cleaned RGBA master
- `../../../web/assets/rough-cut-drain-culvert-v1.png` — browser runtime copy

Generation mode: built-in image generation.

Prompt:

> Use case: stylized-concept
>
> Asset type: isolated high-resolution pixel-art environment prop for the Rough Cut browser game
>
> Primary request: Create one uncanny golf-course maintenance drainage culvert entrance used as a secret escape route. It is a low concrete headwall embedded in a rough grassy embankment, with a dark circular corrugated drain tunnel, a partly lifted rusty iron grate, a small industrial valve wheel, damp moss, reeds, mud, stones, and a dim amber maintenance lamp mounted above the opening. The opening must read clearly as enterable at small gameplay scale.
>
> Input images: Image 1 is the exact high-detail pixel-art obstacle-kit style, palette, crisp silhouette, edge treatment, and lighting-density reference. Image 2 is the exact moonlit golf-course world, wet turf, fog, night palette, and amber practical-light reference.
>
> Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for removal; no horizon, floor plane, shadow, gradient, texture, or lighting variation in the background.
>
> Style/medium: extremely detailed high-resolution pixel art with crisp intentional pixel clusters and a premium indie horror-game finish; match the existing obstacle kit rather than photorealism.
>
> Composition/framing: one isolated front-facing prop, wider than tall, centered, fully visible with generous padding; grass and stones form a compact grounded base; readable silhouette with the dark drain opening as the focal point.
>
> Lighting/mood: cold moonlit blue-green surfaces with restrained dirty amber rim light, damp and ominous but legible.
>
> Color palette: wet concrete gray-green, oxidized iron brown, black-blue tunnel, dark turf green, muted amber.
>
> Materials/textures: cracked concrete, corrugated metal, rust, wet moss, reeds, mud, stones, dew.
>
> Constraints: no person, no mower, no golf club, no text, no labels, no letters, no logos, no UI, no watermark, no cast shadow, no floor plane; do not use #ff00ff anywhere in the subject; keep every subject pixel separated cleanly from the uniform background.
>
> Avoid: full environment scene, building façade, sewer-city aesthetic, fantasy portal, bright daylight, smooth vector art, 3D render look, blurry antialiasing, gore, key color contamination.

The generated chroma source was cleaned with border auto-key sampling, a soft matte, thresholded opacity, and despill. The resulting master and runtime copy have matching content and were visually validated in the course renderer at near, mid, and distant projection scales.
