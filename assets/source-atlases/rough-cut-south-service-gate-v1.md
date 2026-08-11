# Rough Cut south service gate v1

This story-critical world object was created with OpenAI image generation on 2026-08-05 to turn the course's abstract south boundary into the physical locked gate described by the opening incident.

## Files

- `rough-cut-south-service-gate-v1-chroma.png` — preserved generated source on a flat magenta chroma field.
- `rough-cut-south-service-gate-v1.png` — transparent runtime sprite.

## Runtime source

| ID | Source rectangle | Use |
| --- | --- | --- |
| `south_service_gate` | `x 0, y 32, w 1759, h 855` | Rear-view gate anchored to the exact `y = 0` south collision boundary |

The gate is revealed only as the rear camera commits, preventing it from appearing in the forward view at the starting plane. Its full connected silhouette, pillars, planted base, chain, and padlock come from the generated sprite. Perspective contact, rear-view reveal, restrained lamp glow, collision response, and accessibility copy remain runtime-owned.

## Generation prompt

> Use case: stylized-concept. Asset type: production world-object sprite for a high-resolution 2.5D first-person pixel-horror golf-course game. Primary request: Create one complete, standalone locked south service gate that physically seals the rear entrance to a haunted executive golf course. The object must read instantly as the gate that snapped shut behind the player. Subject: a wide double-leaf black wrought-iron vehicle gate between two heavy rain-dark stone-and-brick pillars; diagonal iron bracing; thick chain pulled taut across the center; oversized weathered brass padlock; narrow golf-course service-road threshold; small caged amber warning lamps atop both pillars; one bent access-card reader on the right pillar; dense planted ivy, dead fescue, wet moss, and a compact muddy turf base connecting the entire structure. The gate is closed, solid, imposing, and believable as a physical boundary. Composition/framing: 2048x1024 landscape; one centered gate only; symmetrical front three-quarter view with slight depth; full object visible from pillar lamps to planted ground base; generous padding on all sides; wide readable silhouette; the entire gate and both pillars must be a single connected sprite with no cropped edges or detached pieces. Style/medium: extremely detailed high-resolution pixel art, crisp intentional pixel clusters, premium gothic survival-horror game object, matching a dark moonlit golf-course world; readable iron bars, chain, lock, stone courses, wet vegetation, and material wear at gameplay scale. Lighting/mood: cold blue-green moonlight with restrained warm amber practical lamps, rain beads and damp specular edges, ominous and grounded rather than fantasy. Scene/backdrop: perfectly flat, uniform solid #ff00ff chroma-key background across the entire canvas. Constraints: the background must be one uniform #ff00ff color with no shadows, gradients, texture, floor plane, fog, reflections, horizon, or lighting variation; keep the connected gate fully separated from the background with crisp opaque edges; do not use #ff00ff anywhere in the object; no cast shadow beyond the small authored muddy turf base; no readable text, letters, numbers, logos, watermark, border, UI, character, person, mower, vehicle, detached props, or open gate. Avoid: modern suburban driveway gate, fantasy castle gate, ornate gold gate, clean new materials, daylight, smooth vector art, painterly blur, excessive bloom, black background, transparent background, pseudo-text.

## Transparency pass

The runtime image was produced with `remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`. The detected key was `#fb06fa`; 711,948 pixels became fully transparent and 73,870 received partial alpha. Inspection confirmed transparent upper corners, a connected silhouette, intact narrow ironwork, readable lamps and padlock, and no visible magenta field.
