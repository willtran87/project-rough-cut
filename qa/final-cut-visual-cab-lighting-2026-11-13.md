# Final Cut cab lighting and instruments

Completes the local character-lighting requirement FV47. The full 72-item visual upgrade remains active. Joe's face materials, expressions, clothing and acting are separate unfinished requirements.

## Delivered

- Connected the existing ceiling fixture to a warm, bounded downward spotlight. Its origin is 6.5cm along the fixture's forward axis, outside its lens and cage. It follows the same body transforms as the fixture through steering, sinking and roll. The local shadow map is 256 on hardware and 128 on software.
- Added a restrained green instrument-panel fill aimed upward toward Joe's face and grips. Both lights use the existing main-beam reveal state: no illumination during concealed setup, smooth warning/reveal transitions, half intensity at four seconds into the ending, and fully off at eight seconds.
- Built a recessed industrial instrument cluster with a visor, protective edges, corner fasteners, two foot-mounted supports, two faceted gauges, a seven-segment hour-meter reading 1842 and three status lenses. Gauge needles follow actual speed and cutter deployment. The hour reading is fixed machine dressing, not fabricated elapsed player time.
- The panel adds four meshes, 1,464 triangles, two owned materials and no new artwork textures; the finish reuses the shared industrial atlas. The ceiling fixture remains the same two-mesh assembly, preserving its geometry and contact checks.
- First placement intersected Joe during boarding and exit. Moved the panel forward to body z−0.9 and lowered its center to y1.88; resized supports to meet the existing floor. Final geometry clears the actual animated character throughout both transfers.

## Evidence

- `tools/verify-final-cut-cab-lighting.cjs`: hardware run23289 and software68701 pass actual framebuffer on/off comparisons around Joe's face and both grips. Hardware mean channel increases: face10.60, hands2.57/3.10; software10.79,3.18/3.66. These are local illumination measurements, not image-quality scores.
- Front, oblique and instrument close views inspected at a2560x1600 viewport. Hardware renders2560x1600 internally; software960x600. Additional1280x720,844x390 and390x844 captures verify compact framing. Instrument close views show physical panel construction and legible segmented digits.
- Eight heading/phase fixtures preserve lamp attachment; three gauge states match speed/deployment. Actual pause freezes lighting and shadow-refresh state. Reduced Motion preserves the spatial lighting. A checkpoint reload attaches lights to the restored checkpoint rig; it intentionally does not promise restoration of an arbitrary in-pass fixture position. Four ending ages preserve exact light positions/intensities through snapshot restoration.
- Final transfer run75710 passes322 actual skinned-triangle/support poses, zero intersections/support failures, maximum foot-target error2.7e−7m. The new panel and its supports are registered in the geometry audit.
- Existing lamp verifier passes16 poses, three warning samples and four ending states, with all five fixture geometries unchanged.
- Concealment run46330 passes all48 rig-visible/rig-hidden pixel comparisons across four cardinal directions, near/far views, lateral offsets and crouching/standing.
- Reveal run58545 passes12 captures, actual input through the intro/control/reveal, four sizes, unobstructed markers, deployment, pause and reload.
- Full routes52556 pass direct/garage/drain by real input, four heard ball redirects, bank/open crossings, pump/bell/collapse/road, zero captures/errors and20 screenshots.

## Remaining scope

Whole-level Level 1 parity, complete performance budgets, Joe art/acting, engine/hydraulic detail, exterior fixtures, ground/refuge/effects/story/UI work remain unfinished. No complete-goal or whole-device performance claim is made. Final installed-client receipt follows after the existing live process terminates.

## Final smoke receipt and scope

Installed client94840 exited0. Fresh image/state inspected: intro completed, ready/playing, player y4.7372, arrival age0.68333. New cab lights correctly remain off during this opening moment; four instrument meshes and128software shadow size are present. Internal rendering960x540; no error artifact. All owned processes are terminal.

FV47 is complete against its explicit local-lighting requirement, supported by the hardware/software face/grip comparisons, physical attachment, pause/reload/ending checks and48concealment comparisons. Other character-art and broader Level1/performance requirements remain open. Ledger14complete/27in_progress/31pending; entire goal remains active.
