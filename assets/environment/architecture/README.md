# Architecture surface atlas

`pixel-surfaces-v1.png` is the 1536x1024 source atlas generated with the built-in ImageGen tool on 2026-11-06. The exact generation prompt is in `pixel-surfaces-v1-prompt.txt`. No API/CLI fallback was used. The runtime copy is `web/assets/optimized/rough-cut-architecture-surfaces-v1.webp` (lossless WebP, 2,736,628 bytes).

Six 512x512 material tiles, in reading order:

1. Weathered vertical timber with blue paint, exposed grain and knots.
2. Rust-streaked blue-grey roofing metal.
3. Mossy fieldstone masonry.
4. Cracked lime plaster.
5. Worn blue-grey slate.
6. Moss, soil, twigs and leaf litter.

These are surface materials, not building or scenery billboards. `web/pixel-world-props.js` samples the tiles with local triplanar coordinates, nearest magnification, mipmaps and quantized lighting. Architecture offsets grain between boards while keeping it attached to the model. The landscape uses continuous world coordinates across terrain chunks. Original shed, clubhouse and vegetation illustrations remain the visual references; the atlas carries their material vocabulary onto actual geometry.

Regenerate the runtime copy with Sharp's `webp({lossless:true})` conversion. The atlas crop layout and scale are declared in `authoredSurfaces`; preserve the 3x2 layout if replacing the image. The source PNG is kept outside the shipped web folder. Asset validation scans JS modules as well as the entry page for explicit runtime paths.
