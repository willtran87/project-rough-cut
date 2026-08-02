# Course Mechanics and Terrain Evidence v1

Built-in ImageGen produced both production candidates on August 1, 2026. Existing Rough Cut prop and course atlases were supplied as style references only. Each source was generated on a uniform magenta field, retained as a versioned chroma PNG, converted locally to a soft transparent matte with despill, inspected at native size, and integrated through measured non-overlapping source rectangles.

## Runtime assets

- `web/assets/rough-cut-course-mechanics-atlas-v1-chroma.png` — original 1254×1254 chroma source.
- `web/assets/rough-cut-course-mechanics-atlas-v1.png` — transparent production atlas containing the field-test bell, Sprint Review chime, shed filing terminal, and drain release control.
- `web/assets/rough-cut-turf-evidence-atlas-v1-chroma.png` — original 1672×941 chroma source.
- `web/assets/rough-cut-turf-evidence-atlas-v1.png` — transparent production atlas containing three mower-cut ages, a divot, three surface-specific footprint pairs, and fairway compression.

## Course-mechanics prompt

> Use case: stylized-concept
>
> Asset type: production sprite atlas for the Rough Cut browser horror game
>
> Input images: Image 1 and Image 2 are style references only; create entirely new objects matching their high-detail pixel-art scale, palette, materials, crisp silhouette, and moonlit golf-course horror mood.
>
> Primary request: Create exactly four isolated functional golf-course fixtures arranged in a strict 2 columns by 2 rows sprite atlas.
>
> Cell 1 top-left: an old brass field-test bell mounted on a short weathered timber post with a small weighted turf base, clearly recognizable as a golf practice target.
>
> Cell 2 top-right: a sinister Sprint Review checkpoint chime on a dark wood-and-brass post, with a small amber warning lamp and clipboard bracket, no readable writing.
>
> Cell 3 bottom-left: a rugged maintenance-shed final-filing terminal, a weatherproof dark metal document lockbox and mechanical approval punch mounted on a short post.
>
> Cell 4 bottom-right: a drainage-culvert release control, a rusted valve-and-lever console on a low concrete footing with a small teal indicator lens.
>
> Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for local background removal.
>
> Style/medium: high-resolution, high-detail 1990s survival-horror pixel art, deliberate pixel clusters, sharp nearest-neighbor edges, consistent with the supplied Rough Cut prop atlases.
>
> Composition/framing: strict equal 2x2 grid; one complete fixture centered inside each cell; generous internal padding and wide clean gutters; every base fully visible; consistent three-quarter front viewpoint and shared ground line.
>
> Lighting/mood: cold blue moon rim light with restrained warm brass or teal functional highlights; ominous, damp, weathered.
>
> Materials/textures: oxidized brass, wet dark timber, rusted steel, chipped concrete, moss, tiny grass tufts only at each fixture base.
>
> Constraints: four objects only; no people; no loose duplicate parts; no labels; no letters; no UI; no border; no watermark. Background must be one perfectly uniform #ff00ff color with no shadow, gradient, texture, reflection, floor plane, or lighting variation. Do not use #ff00ff anywhere in the objects. No cast shadows outside each silhouette. Crisp separated silhouettes, no overlap between cells.

## Terrain-evidence prompt

> Use case: stylized-concept
>
> Asset type: production terrain-evidence sprite atlas for the Rough Cut browser horror game
>
> Input images: Image 1 and Image 2 are style references only; create entirely new terrain sprites matching their high-detail pixel-art texture, damp moonlit palette, deliberate pixel clusters, and golf-course scale.
>
> Primary request: Create exactly eight isolated ground-contact sprites arranged in a strict 4 columns by 2 rows atlas.
>
> Top row left to right: 1. a long horizontal strip of freshly mower-cut golf rough, dark crushed turf with two broken wheel grooves, bright wet green clippings along both edges, and a restrained cold moonlit sheen; 2. the same type of horizontal mower strip several minutes old, darker olive, fewer wet clippings, softened grooves; 3. a fading old horizontal mower strip merging into surrounding turf, bruised green-brown with sparse clippings and broken edges; 4. a fresh golf divot without a ball, torn oval sod flap, exposed dark damp soil, loose grass crumbs.
>
> Bottom row left to right: 5. a short paired trail of bent rough-grass shoe impressions, two staggered flattened patches with disturbed blades; 6. a short paired trail of wet muddy shoe prints with displaced dew and small cold cyan water glints; 7. a short paired trail of deep bunker-sand shoe prints with raised granular rims and scattered sand; 8. a fairway footfall compression mark with flattened blades and a small crescent of missing dew.
>
> Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for local background removal.
>
> Style/medium: high-resolution, high-detail 1990s survival-horror pixel art, top-down-to-shallow-three-quarter ground decals, sharp nearest-neighbor edges, consistent with the supplied Rough Cut course.
>
> Composition/framing: strict equal 4x2 grid; one complete isolated decal centered within each cell; very wide clean gutters; horizontal objects must remain fully inside their own cell; consistent viewing angle and ground plane.
>
> Lighting/mood: cold moonlight, damp and ominous, readable without neon brightness.
>
> Materials/textures: individual grass blades, crushed wet turf, soil granules, dew, sand grains, clipped grass fibers.
>
> Constraints: eight ground decals only; no people; no shoes; no golf balls; no mower; no tools; no signs; no text; no UI; no border; no watermark. Background must be one perfectly uniform #ff00ff color with no shadow, gradient, texture, reflection, or lighting variation. Do not use #ff00ff anywhere in the sprites. No cast shadows outside the decal silhouettes. Crisp separated silhouettes, no overlap or fragments crossing cell boundaries.

## Integration contract

- Physical objects and persistent terrain evidence use authored art.
- Interaction rings, labels, collision callouts, map geometry, fog, particles, and transient surface-response animation remain code-native because they communicate state or movement rather than represent world props.
- Each fixture is grounded at the same world coordinate as its mechanic. Filing terminals add no independent hidden collision volume.
- Turf evidence inherits the authoritative mark position, heading, age, surface, and gameplay footprint; the art does not alter movement, stealth, or Joe's detection logic.
