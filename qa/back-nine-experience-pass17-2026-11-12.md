# Back Nine experience pass17 — contact-aligned falls and clear death-camera sides

Previous goal turn was progress (pass16 seeded variation and camera consistency). Full38-item objective stays active. No agents, commits, deployment or human testing.

## Implementation

The old animation interpolated the runner's entire yaw toward Joe while falling. A frontal contact rotated the victim180degrees through the mower, obscuring the fall. The new pose preserves the runner's original facing and tips their torso along the actual impact heading: backward for frontal hits, sideways for lateral hits. Ground-side limbs tuck; arms and legs settle after body contact rather than remaining rigidly raised.

Ground support uses the existing immutable mesh positions and current limb matrices, so diagonal, backward and lateral poses neither sink through the road nor hover. A direct typed-array scan is cached by death/pose age and stops after1.11s; duplicate draws, pauses and settled aftermath reuse it. No geometry rebuild, new material, texture, light, render target or sound source. Twenty-four runner meshes/26,754 vertices retained. Regular gait and ejection code remain unchanged.

Death camera selects one side from real course-clearance tests at impact, considering early, final and reduced-motion views. It retains that side and checks the interpolated camera position against cover as well as the destination. The run-over diagnostic no longer assumes the body must lean forward: it correctly recognizes backward/sideways deaths. Physics, damage, Joe's pursuit, defeat timing and escape windows are unchanged.

## Evidence

Authoritative artifacts: `output/back-nine-experience/runover-contact/`. Pre-pass sources preserved in its `baseline-source/` directory. `verify-runover-contact.cjs` uses actual fatal contacts and separately poses the actual world renderer; its scene-only screenshots retain the setup HUD, so UI behavior is verified by the full browser suite.

-36 impact headings×85 animation samples verify retained facing, impact-aligned torso direction and exact mesh ground support. Minimum/rest gap0.015m, including intermediate diagonal poses. Exactly68 scans per death at60Hz; repeated renders do not rescan. Same body/camera poses at60/30/15 renderedHz.
- Seven actual fatal-contact cases: rear, front, side, relay approach, garage approach and both sides of a windbreak. Camera rays stay on the victim's side of cover. Hardware/software pass with no page errors.
- Frontal fall at0.4s:63→896 hardware rendered pixels (895software), rear847→903, side488→1049, using actual framebuffer subtraction. Stronger test requires>500pixels in each open approach, not merely a visible flag. High-resolution fall/rest images inspected. Natural occlusion remains while the mower crosses the victim.
- At the closed garage the mower physically stops before completing its pass; the fall remains visible (~1030pixels), while the body is occluded beneath the stopped machine afterward. It is not moved through the gate or teleported aside to manufacture an unobstructed aftermath.
- Current support/update CPU sample mean0.088ms hardware/0.087ms software, p95about0.2ms, sampled maxima3.2/2.9ms. Baseline's single-direction fall was cheaper (~0.006ms mean). This is a bounded visual-quality cost, not a GPU improvement. An intermediate accessor-based scan averaged0.155ms and was replaced with direct typed-array access. Samples are local update CPU timings, not displayed frame rates.
- `verify-chase-runover.mjs`, `verify-runner-controls.mjs`, `verify-chase-camera.mjs`, `verify-chase-outcome.mjs`, `verify-chase-garage.mjs` exit0: physical run-over, backoff, ejection protection, mouse-independent steering, finite warned charge/recovery, camera clearance, four ending/six failure contexts and both garage arrivals.
- `verify-runner-gait.cjs` session53307 exit0:60/30/15Hz gait, fence slide, gap, reversing turn, stopping/restarting and look-back;24meshes/26,754vertices, no duplicated-render drift, actual planted travel≈0.004m and correct facing. Death-support scans stay zero during ordinary running.
- `verify-cart-ejection.cjs --software` session62891 exit0: existing ejection floor clearance0.01167m,25programs/40textures, no errors. Source changes after that check are confined to death settling.

## Remaining full-goal work

The frontal fall defect is corrected. Human judgment of animation weight and comfort remains in the deferred playtest kit. Whole-course route/cover/landmark/darkness/spatial-audio/retry/omen acceptance and measured software frame stability remain active; this pass makes no startup/FPS improvement claim. Preserve both cart and on-foot victories and do not force destruction.


## Final lifecycle and standard-client checks

- Final `verify-chase-runover-browser.cjs --front --software`27364 and hardware696a87 exit0 after limb settling: actual impact, unskippable animation, pause, ignored revival inputs, one impact/landing sound, defeat, retry reset, reduced motion and smaller displays. Grounded front victim0.015–0.37964m.20hardware/25software programs,40textures,12voices, no new buffers or console errors. Earlier rear suite9543 also passed; final all-heading contact suite covers current rear pose.
- Final contact support suite hardware89395 and software72029 exit0. 3,060 sampled poses,2,448 support scans; hardware/software camera/body quaternions agree across60/30/15Hz. Minimum support0.015m. Resting arms now settle by1.11s. Source snapshots, separate baseline artifacts and current diagnostics retained.
- Installed standard gameplay client28351 exit0/two iterations with actual front collision. Final page/state inspected: on foot, dying at1.7667s, yawπ collision versus original player facing0, mower travelled6.2957m, fallen actor visible, ready and no error artifacts. Software canvas800×450 under existing adaptive budget. No software throughput improvement is claimed.
- Inspected2560×1600,1280×720 and844×390 actual scene/gameplay captures, including front/side falls, settled bodies, windbreak camera choice, garage obstruction and reduced motion. Versioned all three changed runtime imports with20261112-experience-17. Syntax/import-map checks pass. All owned test handles terminal; local4187server retained.

Item34's technical acceptance is now recorded as implemented. Natural occlusion while under the machine is distinct from the corrected early frontal twist/hidden fall. Human recognition/comfort remains a later test rather than an assertion inferred solely from pixel counts.
