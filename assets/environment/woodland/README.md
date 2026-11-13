# Woodland needle sprays

Generated with the built-in ImageGen tool using the original `rough-cut-course-obstacle-kit-v1.webp` as a style reference. Exact prompt: `needle-sprays-v1-prompt.txt`. No API/CLI fallback.

- Source: `needle-sprays-v1.png`, 1254x1254 RGBA, four isolated conifer boughs.
- Runtime: `web/assets/optimized/rough-cut-needle-sprays-v1.webp`, lossless WebP, 872,608 bytes. Alpha is preserved.
- Broad, dense, sparse and young needle sprays are cropped by `web/pixel-trees.js`. Crops retain padding and are used on small bent, fixed branch planes around tapered 3D trunks, roots and branches. They are not camera-facing whole-tree pictures.
- Nearest magnification and mipmaps preserve detailed pixel clusters; a restrained material lift keeps the original dark needles legible under moonlight.

Regenerate the runtime file with Sharp `webp({lossless:true})`. Keep the source PNG and prompt outside the shipped web folder. The loader has an explicit runtime path so release validation includes the new texture. The original flora and ground atlases still provide the low vegetation and turf detail.
