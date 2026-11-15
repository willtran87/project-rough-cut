# Final Cut headlight surface response and reflector profile

This is progress on FV13, not whole-item or whole-level completion. The previous goal turn completed FV36. The present pass addresses the observed loss of pixel detail on nearby masonry while keeping moving illumination readable.

## Implementation

- Reduced full working-beam output from 240 to 48 per lamp after testing five output/falloff combinations at 3, 6, 12 and 24 metres against the same actual stone surface. Retained the 38m range, physical lamp origins, target, decay and shadow projections.
- Added one shared 128x128 linear optical mask: broad horizontal reflector shoulder, modest vertical shaping, feathered edge and restrained lens fluting. It uses the actual spotlight projection and therefore follows the chassis, roll and collapse. No independent animation or camera-relative pattern.
- Both lamps continue to consume rigLampState for their reveal, hidden setup, charge and eight-second ending fade. Fixtures and marker brightness are unchanged. Stats expose peak output and mask size; disposal releases the owned mask.
- Existing light/reveal verifiers now assert the new 48/24 full/half output. Shadow fixtures were re-aimed through the actual pump/bunker walls and the pavilion's low back wall: the old oblique samples lay in the new reflector feather, and an intermediate pavilion fixture looked through its open doorway. The original unoccluded-light gain and blocked-light tolerances remain unchanged.

## Targeted evidence

- Initial study58952 evaluated baseline, 60/40 with existing decay and 80/120 with inverse-square decay. Inverse-square candidates lost much more distant illumination. The chosen output plus profile retains a strong 24m contribution.
- Hardware finish69793 and software finish11635 terminal PASS. Each compares the current beam, lamps off, original 240/no-profile beam, and 48/no-profile beam on the same 675 stone samples at four distances. All assertions use rendered pixels.
- At 6m, all-channel clipping falls from 83.41% to 0% on hardware and 84.59% to 0% on software. At 3m, it falls from 86.37%/86.81% to 0%. This metric means every RGB channel exceeds 245; it is not a claim that no warm highlight ever saturates an individual channel.
- At 24m, hardware mean brightness is 86.57 versus 45.51 with headlights off; software 87.52 versus 46.34. Every distance retains more than 15 mean code values above lamps-off. The shaped and unshaped frames differ, proving the mask affects actual rendered surfaces.
- Native 2560x1600 wall and front/quarter/rear mower images inspected, plus software wall view. Five viewport sizes pass: 2560x1600, 1920x1080, 1280x720, 844x390 and 390x844. Software uses 960x600/960x540 internal renders on large desktops and native compact sizes. Warmed repeated-yaw geometry/texture counts remain stable.
- Hardware lighting76261 terminal PASS: pump/bunker/pavilion floor pixels receive an unoccluded beam but match lamps-off values when actual masonry casts shadows; exterior surfaces retain visible illumination. Four moved lamp positions, exact paused pixels, reduced motion, physical collapse, exact saved/reloaded pixels and shutdown refresh cessation pass. The diagnostic shadow benchmark ran alongside other tests and is not a rendering-budget acceptance.
- Hardware lamp verifier terminal PASS: sixteen cardinal/phase poses, three warning-ramp samples, four saved ending ages, fixture envelopes, actual shared light origins and pause.
- Hardware real-input reveal88396 terminal PASS: staged wing markers, main-beam buildup, width deployment, pause, four viewports and completed-opening reload. No browser errors.

## Outstanding verification and scope

Software shadow lifecycle8724 terminal PASS: all three actual wall occlusion fixtures, moving exterior projection, pause/reduced motion, physical collapse, exact reload and shutdown pass. Its timing samples ran under concurrent software-renderer load and do not establish the isolated mask cost or overall performance. Full routes49102 terminal PASS: all three real-input entries through pump/bell/collapse/road/completion, four heard-ball redirects, zero captures/errors, 77 screenshots. Concealment23058 terminal PASS: all48 exact present/removed hidden-rig image pairs.

FV13 remains in progress: restrained atmospheric scattering and its occlusion/motion/performance acceptance are still outstanding. This pass does not implement volumetric beams or pretend the optical mask supplies airborne scattering. FV10/FV14, full pixel-material/character/environment/story work, matched Level1 comparison and complete performance gates remain open. All 72 items retain their scope.

## Final receipts and performance finding

- Installed client40685 terminal exit0. Fresh screenshot/state inspected: intro completed, ready/playing at player y4.7372, 960x540 internal render, two lights with peak48 and shared128x128 profile; beams correctly off before startup. No errors artifact. This startup client receipt complements, rather than replaces, the separate working-beam visual checks.
- Isolated paired profile-cost audit ran only after the other owned browser jobs ended. Same960x540 scene, both moving shadow maps refreshed each measured frame, nine synchronized render/readback samples per condition, off/on/on/off order. Hardware median batches: 3.8/3.7/3.6/3.5ms, same119 draws; no meaningful measurable profile penalty at this precision.
- Software14312 terminal PASS as an execution receipt, **not a performance acceptance**: no-profile medians1079.8/1081.9ms; profile medians1116.9/1110.5ms, same99 draws. The paired median increase is about3.04%. Absolute software rendering is unacceptably slow even without the profile. FV71 remains unresolved; investigate the dominant software lighting/material/draw work before adding more atmospheric rendering. Do not use stable allocation counts or successful route completion as a substitute for frame-rate acceptance.
- Six source/test snapshots and SHA256 manifest retained in output/final-cut/headlight-finish/source; comparison gallery in output/final-cut/headlight-finish/comparison.html. All owned test processes terminal.
- Counts remain17complete/26in_progress/29pending. Full72 objective ACTIVE. Next: address software render cost under FV71, then finish physically occluded scattering under FV13 and the remaining art/character/environment/story gates.
