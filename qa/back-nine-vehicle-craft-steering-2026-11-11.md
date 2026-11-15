# Vehicle detail and on-foot steering

Implemented both requests: more substantial vehicle models, and cart-style directional controls after ejection.

## Behavior

- On foot: W/S run forward/back, A/D turn, automatic follow camera. Arrow keys use the same steering inputs. Q temporarily glances behind without changing movement direction. Mouse, touch dragging and gamepad right stick no longer rotate the camera. Left-stick/touch steering remains available. Reverse steps preserve the character's facing direction.
- Updated guide, HUD, ejection message and comfort controls. Shake, flash and reduced-motion options remain; obsolete camera sensitivity is removed.
- Cart: shaped bonnet and roof, rounded tires and detailed rims, padded seats, suspension, instrument panel, pedals, motor and trim.
- Mower: shaped bonnet and rear engine housing, radiator, drive pulleys, filters, hydraulic components, reinforced cutting decks and gauge wheels.
- Existing damage assemblies, collision hulls, Joe's navigation, ram recovery and ejection protection are retained. Geometry uses existing materials and rendering batches.

## Verification

- Runner simulation and browser checks passed: ejection, ignored mouse/right-stick/drag input, turn in place, forward/reverse, look-back return, pause instructions, fence sliding, charge evasion and garage completion from a prepared finale state. This does not substitute for a human full-course steering balance playtest.
- Software damage checks passed all seven health stages, collapse/settling, repair, pause, reduced motion and repeated actual rams through ejection. No additional buffers allocated during damage changes; no page errors.
- Solid vehicle contact checks and release verification (90 scenarios, 67 runtime images / 26 MiB) passed.
- Installed standard Playwright client passed two on-foot action iterations. Screenshots inspected at 2560x1600 and 1280x720; damage fixtures additionally captured 844x390.
- Evidence: output/runner-steering, output/vehicle-overhaul, output/vehicle-refinement/software-damage.json.

## Rendering cost

Controlled before/after view samples retained the same draw counts, materials/programs and texture counts. Cart triangles increased from 6,072 to 11,116; mower from 27,514 to 33,218. Batched rendered mesh counts remain 23 and 26 respectively.

Software GPU-completion times (median / p95 ms, 48 samples per view): driving 31.0 / 34.9 before versus 31.1 / 34.1 after; pursuit 29.0 / 34.0 versus 30.1 / 36.0; wet lane 35.0 / 44.9 versus 34.0 / 38.1. Hardware medians remained approximately 6 ms. These short samples show a small added cost in the mower pursuit view, not a general performance improvement or proof that all frame spikes are resolved.

Later human playtesting: assess turn speed and reverse-steering comfort during a complete chase, plus detail readability at normal driving distance. No deployment performed.
