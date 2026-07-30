# Rough Cut Dead Green Scenery Kit

## Runtime asset

- Source with chroma background: `rough-cut-dead-green-kit-chroma-v1.png`
- Transparent master: `rough-cut-dead-green-kit-v1.png`
- Runtime copy: `web/assets/rough-cut-dead-green-kit-v1.png`
- Canvas: 1672 x 941 pixels, RGBA
- Layout: 3 columns x 2 rows

## Sprite order

1. Brittle dead ornamental grass and bare branches
2. Crooked golf pin with a torn warning flag
3. Burst sprinkler and cracked-earth base
4. Dead spiral topiary
5. Snapped course sign with torn caution ribbon
6. Abandoned reel-mower and golf-club wreck

## Generation prompt

```text
Use case: stylized-concept
Asset type: high-resolution pixel-art game scenery atlas for a perspective horror-comedy golf course
Input images: Image 1 is a style and rendering-quality reference only; do not copy its exact objects or layout details beyond the six-cell atlas structure
Primary request: create six distinct isolated scenery props for the final biome called THE DEAD GREEN: (1) a broad clump of brittle waist-high dead ornamental grass with twisted bare branches, (2) a crooked golf pin with a torn dark red warning flag, (3) a burst rusted sprinkler head and short exposed pipe with a small cracked-earth base, (4) a tall dead spiral topiary with skeletal branches, (5) a snapped wooden course direction sign partly wrapped in red caution ribbon with no readable words, (6) a low heap of abandoned reel-mower blades, bent golf clubs, and dry turf clippings
Scene/backdrop: every prop isolated on one perfectly flat solid #ff00ff chroma-key background for background removal
Style/medium: extremely detailed hand-crafted pixel art, crisp deliberate pixel clusters, 16-bit gothic survival-horror game art, readable silhouettes, restrained dark comedy, matching the reference atlas's lighting, scale language, three-quarter-front view, and painterly pixel density
Composition/framing: exact clean 3-column by 2-row atlas; one complete prop centered in each cell; generous even padding; props must never overlap cell boundaries; top row contains props 1-3 from left to right; bottom row contains props 4-6 from left to right; full silhouette visible for every prop; ground-contact point near the bottom of each cell
Lighting/mood: moonlit night with subtle cold blue-green rim light and small rust-red accents; ominous, decayed, beautiful, legible at game scale
Color palette: dead straw gold, umber, oxidized iron, charcoal, desaturated moss, tiny dark crimson accents; absolutely no magenta inside the props
Materials/textures: brittle blades, splintered wood, cracked soil, corroded metal, dry clippings, sparse dead leaves
Constraints: perfectly uniform #ff00ff background with no shadows, gradients, texture, reflections, floor plane, lighting variation, vignette, border, labels, captions, logos, watermark, or extra objects; no people; no faces; no blood or gore; each silhouette must be fully separated from the others and the background; crisp edges; maintain high-resolution pixel-art detail
```

## Post-processing and integration

The built-in image generator produced the chroma-key source. The imagegen transparency helper removed the magenta background with border sampling, soft matte, despill, and conservative alpha thresholds. The transparent master uses 32-bit RGBA; all four corners were verified at alpha zero.

Runtime cells use authored physical heights and the same pinhole projection as Joe, course obstacles, and exits. Dead Green placements are world-anchored, depth-sorted, non-colliding scenery so they preserve route balance while adding strong motion, scale, and occlusion cues.
