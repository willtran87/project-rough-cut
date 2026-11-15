# Vehicle impact feedback and detail

Actual vehicle strikes now produce a directional metal crunch and bass thump, a damped suspension compression/pitch, twelve briefly ejected pixel sparks at the bumper/deck contact edges, and an amber integrity highlight with HIT/BUMP text. Contact position, strength and age come from simulation state. Damage immunity still permits collision feedback, while resting contact cannot retrigger it every frame. No camera movement was added. Reduced Motion retains audio and readable HUD feedback but removes sparks and body recoil.

The audio graph contains nine persistent sources, including the two impact sources. Envelopes are automated on the existing nodes. Audio mute/pause remains effective; there is no unbounded source pool. All effects use simulation time and fixed geometry. The existing damage and solid-collision rules remain in force.

Vehicle additions reuse the original pixel palettes and are batched per material:

- Both: tire treads, hub bolts and more defined bumper hardware.
- Cart: roof framing, rear luggage basket, battery service hatch, foot plates, dashboard gauges and cup holders.
- Industrial mower: service-panel seams and radiator fins, fasteners, fuel cap, control levers, hydraulic hoses, exhaust heat guards, cutting-deck belt covers and vent details.

The updated rendered geometry fits the same collision hulls, including maximum cart steering lean and impact pitch. Conservative unfolded deck clearance remains the collision envelope. This is still arcade contact handling, without chassis deformation or full rigid-body physics.

## Verification

- `verify-vehicle-contact.mjs`: nine simulation groups pass, now also checking single impact emission during sustained contact and feedback during grace without damage.
- `verify-vehicle-contact-browser.cjs`: six actual impacts, damage/invulnerability UI, 12-particle pool, nonzero recoil, effect expiry, Reduced Motion, stable resources and zero errors. All 14,304 cart and 32,772 visible mower/rider vertices fit their collision envelopes. Inspected 2560x1600, 1280x720 and 844x390 captures.
- `verify-vehicle-impact-audio.cjs`: actual offline audio graph, peak .493, left impact RMS .0633 versus right .0106 for a left collision. Exactly one strike played, mute peak zero, paused tail below .0001. This is objective signal validation; perceived sound quality still needs human listening.
- `verify-back-nine-browser.cjs --software`: controls, saves, checkpoint/retry/replay, finish, fullscreen, touch/gamepad and no resource growth pass.
- `verify-back-nine-suspense.cjs`: existing tension presentation/audio still passes with nine fixed voices. Shader/texture counts remain 16/34; local lights remain two.
- Six complete live-Joe route simulations, tension safety tests and 90 release scenarios pass. Normal installed gameplay client passes two drive/steer/brake iterations; state and presented screenshot inspected with no error artifacts.

Software mixed wet/rear sample: 51.48 ms average / 74.60 ms p95 at 960x540; normal opening drive: 29.70 / 37.30 ms. Hardware suspense sample: 13.10 / 23.40 ms at 1280x720. Additional detail costs geometry (mixed software view 67,090 triangles, 117 draws); these short samples are not a controlled proof of unchanged performance. Existing software frame spikes remain.

Evidence: `output/vehicle-contact/`, `output/vehicle-impact/`, `output/back-nine/`, `output/back-nine-suspense/`. Later human checks: distinguish a damaging hit from a protected bump, judge crash loudness against engines, confirm the jolt feels responsive without disrupting steering, and inspect the model details in motion. Human tests remain deferred.
