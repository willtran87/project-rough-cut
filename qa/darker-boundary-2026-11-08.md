# Neutral carts, darker night and visible rear boundary

Revision: `20261108-darker-boundary`, local `web/` on port 4187.

- All seven solid service carts use a dedicated weathered gray enamel palette on the body, roof and cargo rails. Original geometry, tires, tools and small amber safety beacon remain. The 128×128 generated surface uses nearest pixel sampling and the existing procedural surface shader.
- Reduced hemisphere fill (.85 → .58), ambient fill (.25 → .16), and base moon intensity (2 → 1.4) for the pixel-volume scene. Darkened the parallax sky, distant ridge/trees/estate, and base/zone fog tint. Existing lanterns, objective illumination, ghost/mist budgets, cloud-driven dimming, comfort settings and parallax motion remain. Fog distances and rendering resolution are unchanged.
- Fourteen timber fence panels span the rear boundary. Varied slat heights, slight lean, cross-bracing and metal post caps use existing wood/iron surfaces and static spatial batching. Approximately 2,208 added triangles; no transparent fence pass, new lights, shader program type or downloaded art. The new cart surface adds one small texture and associated material batches. This is not a whole-game performance improvement claim.
- Fence placement reads the authoritative course bounds passed through the scene adapter: 112 lateral / 720 longitudinal course units. Geometry stays just beyond the rear movement clamp, behind the shed and drain approaches. No new collision or pathfinding obstacles; player movement and Joe navigation are unchanged.

## Verification

- `verify-darker-boundary.cjs`, hardware and `--software`: eight camera captures each, all 14 fence panels within expected world bounds, forward boundary contact stops movement, continued forward input remains stopped, backward input escapes cleanly, no browser errors.
- Captures at 2560×1600, 1280×720 and 844×390. Inspected the neutral cart, darkened scene, rear fence and both exit approaches, including software captures. An initial camera fixture landed beneath the existing pine canopy; moved it to the open forecourt for a representative fence view.
- The movement solver stops approximately .2 course units before 720 with this input step; the check accepts its conservative substep margin rather than demanding an exact floating-point coordinate.
- `verify-win-objectives.cjs output/darker-boundary-20261108/objectives`: all three variants × two exits pass, including zero-ball required checks and cancellation/retry of exit filing. Controlled actor fixtures isolate these gates; this pass does not claim six full human-style route runs.
- Release check: 90 action scenarios and all 56 runtime images / 20.8 MB pass. Syntax checks pass for changed runtime modules.

Evidence: `output/darker-boundary-20261108/{hardware,software,objectives,client}`. Existing software frame-pacing limitations remain; no new frame-time benchmark was performed. Human darkness/readability preference testing remains useful.
`Installed normal Playwright client`: two iterations / 14 units, ready first-hole state, no error artifacts; final screenshot inspected.
