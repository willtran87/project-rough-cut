# Chase commitments and emergency cuts — 2026-11-09

Implemented after the user's request to add lane commitments, emergency shortcuts and close-pass encounters while preserving pixel art, performance, controls and collisions.

## Behavior

- After the first panic reveal, Joe can warn for 1.8 seconds and commit to a recorded lane or an actually clear parallel passing corridor. Hidden player steering cannot move that target. Passing sides alternate where geometry permits; occupied corridors are rejected. The existing bounded route planner drives every attack, with an 18.3 m/s burst ceiling and unchanged steering/collision resolution.
- A missed attack holds a forward recovery target for three seconds at a reduced speed, then cools down. Checkpoints, immunity, alarms, ram recovery and the garage retain priority. Existing ram backoff and escape windows remain intact.
- Three optional cuts (nursery, pump, clubhouse) have worn tracks, paired lanterns and breakaway timber. Normal acceleration breaks them at speed; holding drive for 0.7 seconds against the beam pushes through at low speed. Breaking costs 28% of current speed. Reverse remains available. Rough terrain remains slower; the narrow posts admit the cart and force the wide mower to route around. All cuts reconnect with the course and do not bypass relay requirements.
- A close-pass cue is earned by Joe physically crossing ahead within nine metres, once per attack: directional mechanical scrape and eight clipping flecks from the existing particle pool. Warning revs, deck movement and captions announce the chosen side. No new input action.
- Kept shared pixel materials, sky/parallax, vehicle details, wet effects, existing controls, instancing/culling and paced uploads. Rebuilt the static navigation bake for the new posts and cleared shortcut corridors (signature 47348588).

## Verification

- `verify-chase-decisions.mjs`: fixed predictions, warning duration, speed ceiling, protection cancellation, actual physical pass (closest 6.078 m, zero hits), fixed recovery, pause, all three gates at speed and slow push, one break event, reset, end-to-end cart clearance and blocked direct mower clearance.
- Six complete simulated routes still win, including both checkpoint starts and three alternate branches. Ordinary full-route driving triggers a commitment; fast uninterrupted driving can escape without a close pass.
- Original hunt tests pass with the new optional attack delayed in the focused sightbreak test, preserving a genuine test of old interception/lost-sight behavior. Tension, panic and decoy suites pass. All five ram recovery/escape scenarios pass.
- Hardware vehicle contact browser suite: six contact scenarios, visible geometry contained by hulls, no intersections. Hardware controls suite: keyboard, pause, save/reload, second relay, garage win, retry, touch, gamepad, stable resources.
- New browser scenarios passed on D3D11 and SwiftShader; inspected screenshots at 2560x1600, 1280x720 and 844x390. New warning, pass, three closed/broken gates, captions and Reduced Motion. No page/console errors. Installed standard client used for ordinary driving.
- Offline audio: one pass sound, no repeat, peak 0.202, quiet tail <0.0001, muted output exactly zero; impact suppresses the pass strike. Nine persistent voices.
- Independent navigation rebuild matches every baked edge; production edge checks remain zero.

## Resources and timing

17 shaders, 34 textures, two local lights, nine audio voices; spray capacity stays 32. Timber pool grows from 36 to 54 pieces for three gates. Startup remains 15 paced batches, largest 2,060,232 bytes. No new GPU buffer allocations in tested wet, foliage/mower and gate/mower views.

Sequential fixed-960x540 SwiftShader ABBA comparison against this task's saved scene baseline, using the current course for both: wet medians baseline 41.0/44.0 vs new 40.6/42.6 ms; foliage 54.9/62.5 vs 55.5/58.1; mower/gate 47.4/36.8 vs 37.8/37.3. Foliage new p95 64.2/66.6 ms. These short runs show host/warmup variability and no consistent large new cost; they do not establish stable 60 FPS or solve remaining software frame spikes. The baseline comparison isolates scene additions, not a full pre-change geometry comparison.

Evidence: `output/chase-decisions/` (simulation, audio, hardware/software reports, screenshots, performance, final-client). Human driving/feel assessment remains prepared for later as requested. Useful playtest: bait a chosen lane, deliberately escape through each cut, test holding/releasing rear view during an overtake, and assess warning readability and whether the three-second recovery feels fair.
