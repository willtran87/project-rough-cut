# Solid vehicle contact

The previous simulation charged damage below a centre-distance threshold but never separated the vehicles. Damage invulnerability and checkpoint grace also allowed continued overlap. It did not account for the riding mower's extended cutting decks.

`web/vehicle-contact.js` adds oriented cart/body/deck hulls. Translation and rotation are swept in bounded increments, then contact is refined to the last separated pose. The vehicle moving into contact stops; the other remains free to drive away. Physical solidity remains active during damage cooldowns and spawn/checkpoint protection. Eligible contact still charges one hit per cooldown and three hits still lose the chase. The old automatic forward speed boost on damage is removed.

Hull dimensions conservatively cover the rendered wheels, roof lean, bumpers and unfolded decks. The narrower rear mower body still allows passing behind its wide front decks. Deck clearance deliberately retains its unfolded footprint near shelters; this is an arcade collision envelope, not a rigid-body/mesh physics simulation. Existing circle-based scenery collision and pathfinding remain unchanged. Contact cannot push normal vehicle motion through scenery; a recovery helper also handles overlapping debug/old poses when a valid separation is available.

Checks completed:

- `node tools/verify-vehicle-contact.mjs`: nine groups covering rear impacts, grace, cooldown, escape/reverse, head-on/side/reverse contact, rotation, fast crossings with clear endpoints, narrower rear clearance, boundary and garage pins, existing overlap recovery, pause and defeat. Sustained checks assert separation every simulation step, including 30 Hz steps.
- `node tools/verify-vehicle-contact-browser.cjs`: actual rear, head-on, side, angled and boundary impacts. Rendered geometry containment checks inspect 3,944 cart vertices and 17,324 visible mower/rider vertices, including the cart's maximum steering lean. Zero errors; 16 shader programs and 34 textures before/after.
- Actual contact screenshots inspected at 2560x1600, 1280x720 and 844x390. Rear-camera screen overlap is normal perspective occlusion; the world-space hull and vertex checks establish physical separation.
- `verify-back-nine.mjs`: all six live-Joe routes still finish; route durations and contacts match the prior art pass. `verify-back-nine-tension.mjs` safety checks pass.
- Installed gameplay client via `verify-presented-client.mjs`: two driving/steering/braking iterations pass on software rendering, final cart y30.7, Joe pursuing, no error artifacts. Screenshot and text state inspected.
- Release checks: 90 scenarios, no failures. Syntax and whitespace checks pass.

Evidence is in `output/vehicle-contact/`. The change adds bounded simulation work only when vehicles are close; no graphics/audio resources or rendering passes were added. Existing software-rendering frame spikes are outside this fix. Human judgment of impact feel remains deferred as requested.
