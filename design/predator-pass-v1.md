# Rough Cut Predator Pass v1

## Purpose

Make Joe feel like a course-aware predator rather than a single pursuer moving across an oversized map. The pass strengthens spatial horror without weakening navigation: the rear glance has its own authored place, Joe announces committed mower lanes before occupying them, each course zone gets one memorable scare identity, and Composure reports pressure through presentation and heartbeat only.

## Rear service-boundary panorama

- Runtime asset: `web/assets/rough-cut-rear-service-boundary-v1.png`
- Retained chroma source: `web/assets/rough-cut-rear-service-boundary-v1-chroma.png`
- Image-generation style reference: `web/assets/rough-cut-estate-perimeter-v2.png`
- Native output: `2172x724` PNG.
- Runtime crop: `{ x: 0, y: 206, width: 2172, height: 342 }`.
- Composition: locked wrought-iron south gate, guard kiosk, irrigation pipes, utility sheds, perimeter fence, pines, security lamps, and a distant insurance annex.
- Layering contract: no Joe, moon, sky, clouds, text, HUD, or baked fog. Those elements remain independent runtime layers.
- Motion: reverse parallax and a crossfade tied to the existing hold-to-look-behind view. Movement, collision, interaction direction, concealment, and Joe's AI remain body-relative and unchanged.

### Built-in image-generation prompt

```text
Use case: stylized-concept
Asset type: extra-wide transparent-ready rear architectural horizon for a high-resolution pixel-art first-person horror game
Input image: use the supplied Rough Cut estate-perimeter panorama only as a style, palette, pixel-density, material, and nighttime-lighting reference; create the opposite service side of the property and do not copy its arrangement
Primary request: create the rear-facing south service boundary seen when the player looks back while crossing an insurer's executive golf course at midnight
Scene/backdrop: a locked wrought-iron service gate centered in a long perimeter fence; a small weathered guard kiosk, maintenance road, drainage and irrigation pipes, utility sheds, neglected pine and deciduous silhouettes, security lamps, and a distant low insurance utility annex; the boundary should feel plausible, layered, damp, isolated, and ominous
Style/medium: exceptionally detailed cinematic pixel art with deliberate hard-edged clusters, crisp silhouettes, restrained blue-green moonlight, sickly amber practical lights, oxidized metal, wet masonry, and deep readable shadows; match the supplied panorama's scale and cluster density; not smooth digital painting, not vector art, not photorealism
Composition/framing: very wide panoramic horizon strip with grounded structures concentrated in the middle and lower half; preserve irregular negative space above trees and roofs for runtime sky, moon, cloud, and fog layers; keep the central gate immediately readable at gameplay scale and distribute supporting landmarks across both sides for parallax
Background treatment: solid pure magenta #FF00FF chroma field behind every painted object, with no magenta used inside the artwork
Constraints: no people, no Joe, no mower, no characters, no readable text, no logos, no watermark, no interface, no border, no baked moon, no stars, no clouds, no full sky plate, no opaque ground rectangle
Avoid: cheerful daylight, suburban cleanliness, fantasy architecture, gore, smooth gradients, fuzzy antialiasing, tiny unreadable structures, floating props, duplicate gates, and flattened single-plane composition
```

### Alpha cleanup

The selected image was converted with the image-generation skill's chroma-removal helper using `#FF00FF`, soft matte, threshold `20`, soft threshold `82`, feather `1`, contract `0`, and despill enabled. The resulting master contains 1,169,369 fully transparent pixels and 152,595 partially transparent edge pixels out of 1,572,528 total pixels. The cleaned image was inspected both by itself and inside the ten-plane course renderer; the gate plane was moved in front of the generic tree line so its silhouette remains legible.

## Joe predator tactics

The existing warned service-gate intercept remains Joe's course-cutting tactic. Two new behaviors share the same fairness contract and cannot restart while another tactic is active:

1. **False Retreat** — a 1.25-second falling-throttle telegraph, a visible retreat away from the remembered player position, then a committed snapback. Sight, sound, or point-blank contact cancels the special motion and restores ordinary pursuit.
2. **Cover Shred** — a 1.05-second threatened-rough warning followed by a 2.8-second mower advance through that lane. Joe uses the normal persistent Living Roadmap cut system, so the destroyed hiding line becomes real visible terrain rather than a temporary effect.
3. **Service Intercept** — the existing off-screen course cut remains preceded by the service-gate warning and is suspended by contact or active pursuit.

All special movement has a long shared cooldown, a bounded Joe-distance window, explicit field captions, and no teleport during visible contact. Joe's projected mower headlight now paints a restrained screen-blended cone and fog volume along his committed lane before the full sprite is easy to read.

## Authored zone identities

Each zone triggers its signature scare once per run. These are atmospheric only: they do not add collision, alter detection, change player input, or change Joe's movement values.

| Zone | Signature scare |
| --- | --- |
| The Tee | Something knocks back from the locked south boundary |
| Audit Row | The hedge line appears to breathe |
| Water Hazard | Cold lights move below the waterline |
| Clubhouse Crossing | A door-and-window light cycle implies occupancy |
| Service Maze | A hedge breach tears across the lane |
| The Dead Green | Black sprinkler arcs cross the dead turf |
| Night Range | An incoming range-ball volley cuts through the floodlights |
| Release Corridor | A red lockdown sweep crosses the final lanes |

## Composure contract

Composure is a presentation state from `steady` through `tense`, `frayed`, and `panic`. It falls under detection, proximity, pursuit, tactics, and authored scares; it recovers slowly during quiet travel, cover, rough concealment, and informative rear glances. It drives only the HUD read, vignette/interference treatment, border shock, reactive heartbeat, and score presentation. It never changes input, player speed, Joe speed, collision, detection, objectives, or available actions.

Reduced Camera Motion keeps the state and static vignette while removing animated edge interference and rhythmic screen displacement.

## Validation record

- Deterministic browser hooks exercised False Retreat through telegraph, retreat, snapback, completion, and cooldown; Cover Shred published persistent cut evidence and emitted bounded world-space clippings.
- All eight zone scare branches triggered with their expected identifiers and no browser errors.
- Normal and Reduced Camera Motion panic presentations retained the HUD, map, objective, interactable labels, and course view.
- The dedicated rear panorama was reviewed in the active hold-to-look-behind projection after the depth-order fix.
- The final official browser action pass dismissed onboarding, moved 20 meters forward and laterally, triggered the Tee identity, and sampled approximately `3.01ms` average canvas render time with no browser error artifact.
