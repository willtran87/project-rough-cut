# Back Nine chase escalation — 2026-11-09

## Changes

- Joe has a warned alongside attempt in addition to following, surging and crossing interceptions. The 2.2-second engine-pulse warning names the threatened side. Two fixed waypoints predict the observed heading; hidden steering never updates them. The attempt ends after at most 4.5 seconds, followed by recovery and a cooldown. Checkpoints, damage immunity and the garage approach interrupt it. Surges cannot stack with it.
- The opening, middle and final sections have different pressure levels, with shorter surge cooldowns in the final section. Checkpoints reduce Joe's pursuit speed while he is separated. Hidden stretches quiet the atmospheric bed. A bounded branch-rustle cue comes from the moving mower beside a real windbreak, with matching directional caption and sound.
- The left nursery lane has a narrow, lamp-framed gap that admits the cart but blocks the mower's route. The middle service lane is wet, offering concealment at the cost of traction. Existing paths remain intact; no directional signs were added.
- Six low maintenance hurdles splinter when either vehicle reaches them. Their 36 preallocated pieces reuse the existing wood material in one instanced draw. No debris physics, new textures, lights or audio nodes. Reduced Motion immediately settles broken pieces. One hurdle was moved away from existing foliage, and another was moved off the road after placement checks.
- A steady entrance lamp and tire tracks reinforce the final exposed garage turn. The existing parked shutter finale still protects earned victory. Four seconds after completion, the blades stop; the diesel remains until the existing finite audio tail ends.

## Verification

All commands run locally against port 4187; GPU browser tests ran sequentially.

- `verify-back-nine.mjs`: all six complete routes win with no damage and bounded Joe movement. Full-route durations 67.82–69.18 seconds; fastest routes can leave Joe behind. Natural main-route pursuit now breaks a hurdle.
- `verify-back-nine-escalation.mjs`: cart/mower gate clearance, wet surface, warned attack timing, frozen hidden prediction, non-stacking surge, recovery, three acts, checkpoint respite, single physical break events, directional brush origin and pause pass. A moderately paced input-driven checkpoint route triggers an alongside attempt and recovers by 24.33 seconds with zero damage and no overlap.
- `verify-back-nine-hunt.mjs`, `verify-back-nine-tension.mjs` and `verify-vehicle-contact.mjs`: existing occlusion, garage, tension and nine collision groups pass.
- `verify-back-nine-escalation-browser.cjs`: hardware and software runs pass actual input-driven attack captures, breakage, reduced-motion presentation, pause, fixed resource counts and no console errors. Screenshots inspected at 2560×1600, 1280×720 and 844×390.
- `verify-back-nine-hunt-browser.cjs`: existing parked finale, pause/button resume, one latch, saved completion, finite engine tail and idle completed GPU pass.
- `verify-back-nine-browser.cjs --software`: keyboard, touch, gamepad, checkpoint save/reload, finish, retry, victory reload and resource checks pass.
- `verify-back-nine-escalation-audio.cjs`: actual offline audio graph passes. Timber peak .252; left/right timber difference RMS .0210/.00396; brush .00206/.000388; blade-cut difference .0158. Muted signal is zero, paused tail below .0001, each event plays once. Existing impact audio test also passes.
- Installed standard gameplay client completed two opening input sequences. Captures and text state inspected. Release audit passes 90 scenarios without warnings/failures; syntax and whitespace checks pass.

Evidence: `output/back-nine-escalation/`, `output/back-nine/`, `output/back-nine-hunt/`, `output/vehicle-impact/`.

## Resource budget and limits

Still 16 shader programs, 34 textures, two local lights and nine persistent audio sources. No new downloaded art assets, shadow maps, postprocessing or unbounded effect lists.

Hardware escalation sample: 10.12 ms average / 11.30 ms p95. Comparable software controls/wet/rear sample: 51.32 / 75.00 ms at 960×540, ready in 3.47 seconds; previous sample was 47.49 / 57.20. Longer software rear-facing escalation workload: 76.73 / 97.60 ms, with adaptive resolution reaching 640×360. These are short, different workloads and do not prove performance parity. Software rendering remains a material limitation, especially in longer rear-facing foliage views.

Fast players may avoid alongside attacks entirely. No teleporting or speed boost forces Joe back into range. The wet service lane trades traction for concealment; it is not guaranteed to be the fastest route. Human suspense, sound balance and route-comprehension evaluation remain deferred as requested.
