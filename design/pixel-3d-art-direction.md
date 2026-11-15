# Pixel art in a physical 3D course

The original art establishes mood and material language: cool foliage, worn timber, oxidized service equipment, mossy stone and warm brass. Its painted perspective is not a substitute for the perspective of the playable world.

## Rules for new work

1. **Structural objects occupy real space.** Cover, carts, stations, doors, roofs and drainage structures have fixed geometry. Walking around them reveals sides, backs, thickness and occlusion. Do not turn or resize them to face the viewer.
2. **Navigation follows physical boundaries.** Cover volumes derive from existing ellipses/boxes. Do not paint an apparent passage or hiding recess into solid cover. Decorative detail may soften silhouettes, but must not introduce a new apparent route. Route centerlines remain authored gameplay data.
3. **Use the old style as a material vocabulary.** Keep crisp source pixels, restricted surface palettes, clustered wear, timber grain, patina, dark recesses and restrained warm accents. Use local surface detail or purpose-made pixel materials on geometry; do not stretch an entire old object picture over a model.
4. **Keep detail at a useful physical scale.** Material coordinates remain attached to each object. Triplanar mapping blends across changing normals without stretched UV seams; bevels, rings, rails, tread and masonry supply actual depth. Pixel material lighting uses perceptual shade steps so dark greens retain detail.
5. **Mechanisms move, frames stay fixed.** Bell swing, log stamping, release lever and valve rotation consume authoritative interaction state. The shed door and drain grille retain their real state. Labels attach to brackets rather than chasing the camera.
6. **Use flat art where its role supports the space.** Small fixed branch/reed planes can form a volumetric foliage cluster. Distant skyline layers and off-course facade backdrops remain illustrated. Joe uses a skinned 3D model with pixel material maps; the authored directional sprite is a loading/error fallback and explicit comparison. These exceptions do not justify flat whole-prop cover or cart silhouettes.
7. **Light explains shape.** Moonlight casts local depth-tested shadows; a nearby station lamp warms surrounding surfaces. Visual lighting must not modify exposure, detection, action range or pathfinding. Preserve the layered parallax sky and comfort behavior.
8. **Judge in motion.** Check front, rear, oblique and close views, strafing past cover, moving through real openings, and activating mechanisms. A flattering still is insufficient. Check high-resolution desktop and compact touch layouts, then measure the cost separately from recorded video.

The current implementation is `web/pixel-world-props.js`, integrated into `web/scene-3d.js`. The previous full-illustration candidate remains at `?art=illustrated` for comparison; the default is the fixed-volume pixel treatment. This direction supersedes prior recommendations to restore whole old prop illustrations throughout the playable course.
