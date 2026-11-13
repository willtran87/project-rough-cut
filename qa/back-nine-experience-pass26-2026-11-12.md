# Back Nine pass 26 — hidden geometry, stick response and natural routes

The preceding goal turn repeated the improvement list without implementation progress. This pass resumes the complete 38-item goal, closes the interrupted staff-rendering audit and fixes a demonstrated controller defect. Human testing remains prepared for later. No subagents or changes to Joe's pursuit, collisions, damage, music or movement simulation.

## Retained staff-cart optimization

The stationary staff apparition was submitting three entire meshes enclosed by its parked cart's opaque chassis. `staff-cart-layout.js` now shares the unchanged chassis dimensions and seat offset with the story artwork. `hideStaffCartInterior` checks every posed vertex once during construction, retaining any mesh with even one vertex outside a conservative inset box. It excludes leather, sole and seam meshes only when wholly enclosed: 1,471 vertices / 1,343 triangles / three submissions. Upper-body, face and silhouette remain unchanged. Never apply this to animated Joe or the destructible player cart.

Evidence in `output/back-nine-experience/staff-rendering/`:

- Hardware and SwiftShader: 96 paired exterior views each, two sites, three heights and 16 angles. All 192 pairs have zero changed channels and save exactly three draws. The independent posed-vertex audit finds an 8.0004 mm minimum chassis containment margin; production uses a 2 mm inset.
- The initial implementation traversed only visible roots and found nothing because the preparation root is hidden. Corrected to traverse surviving visible child meshes. An initial orbital harness omitted scenery-culling updates and exposed the east figure by culling its chassis; updating real batch culling restores the correct comparison. Neither failure was hidden by reducing an acceptance threshold.
- Moving SwiftShader AB/BA samples, 64 pairs per view, 24 pixel comparisons: all pixel comparisons exact. Departure median 53.5→53.0 ms, p95 57.9→60.9; western turn median 46.8→45.5, p95 51.6→52.0. After look-away the same work gives 53.6→53.0 median, illustrating noise. Retained as less submission with small measured median gains, **not** a proven frame-spike or startup fix. The one-time containment scan costs approximately 3.1 ms in that profile.
- Re-ran the opening browser regression after this optimization: ordinary W/A/Q approaches, look-away, pause, comfort and both checkpoints pass; inspected software occupied image at 2560×1600. Actual approaches also tested at 1280×720 and 844×390. Resources stay 1,114 uploads / 25 software programs / 40 textures / 12 voices; no errors.
- Six software warm retries (two checkpoints × R/Enter/button) pass with the same scene, audio context, uploads, textures, programs and decodes. No asset requests during retry. Observed harness interaction times 45–100 ms are not cold-start measurements.

Original source snapshots remain in `staff-rendering/baseline-source/`. Pure visual optimization leaves the full software-performance requirement open.

## Real controller drift and abrupt onset corrected

Back Nine ignored the saved campaign stick-deadzone setting and used a hard-coded 0.15 cutoff. With a stored 0.30 deadzone, a 0.24 horizontal input turned the cart 0.09925 radians in 0.5 seconds. The failing pre-change browser assertion and measurement are retained in `output/back-nine-experience/stick-controls/baseline.json`.

`chaseDeadzone` and `chaseStickAxis` now respect the validated 0.10–0.30 setting and rescale the remaining axis range continuously to full input. Horizontal/vertical deadzones are independent so forward stick travel cannot reintroduce horizontal drift. Input-device detection uses the same threshold. Keyboard, triggers, brake/use, touch and rear-glance mappings remain unchanged. The mouse continues to have no steering/camera role on foot.

Back Nine's Controls & comfort panel exposes the existing campaign deadzone with a short explanation. The shared DOM settings adapter accepts that existing preference, preserving its pending-write/merge behavior. HTML module versions were updated for the entry, controls and settings adapter.

- `verify-chase-stick.cjs`: 21 browser movement cases pass, including signed boundary/drift rejection, tiny/medium/full steering, foot forward/reverse, live UI edits, persistence/reload, unrelated preference preservation, unchanged mouse behavior and Q return. The first foot fixture placed the runner inside the wreck; moved only the fixture's wreck back to its intended separate position, preserving production collision behavior.
- A 60,003-sample mathematical sweep verifies monotonic bounded response and sign symmetry at all three representative settings, plus full input and malformed-value guards.
- Inspected actual settings at 2560×1600, 1280×720 and 844×390; slider bounds and footer clearance pass. Foot-follow screenshot inspected.
- Existing `verify-chase-bindings.cjs` passes remaps, actual driving/foot movement, mouse independence, look-back, garage activation, gamepad menus, reset, storage failure and interleaved preference preservation.
- `verify-campaign-settings-recovery.cjs` passes Under the Green, Back Nine and Final Cut pending-write recovery. Its scope is storage regression, not proof of controller tuning in other chapters.
- Modified modules pass Node syntax checks; import-map JSON resolves the new module versions.

## Natural course traversal and limits

`audit-back-nine-route-views.cjs` drives through the normal Gamepad API with actual collisions, damage, pursuit and objectives. It follows a predetermined route rather than interpreting visuals, so it establishes physical playability and captures composition; it does not prove novice navigation or fun. The gamepad must connect neutral first; the original stationary failed harness is archived as `driver-neutral-failure.json` and is not counted as a game defect. The prior session 21936 no longer exists; its completed authoritative branch-7 report was recovered instead of restarting it.

Before the stick fix, two completed normal-input runs reached both relays and the garage: main route 81.083 seconds / cart 2 HP, reservoir branch 81.500 seconds / cart 28 HP. No console errors. Each had two contextual Joe lines, approximately 49–51 seconds apart, with objective/service/garage instructions and optional threat captions between them. No engine-rev descriptions, ram announcements or numeric impact-damage chatter appeared. Different seeds prevent attributing their health difference to the route.

The audit driver now inverts the selected deadzone when producing desired analog steering rather than assuming the obsolete 0.15 cutoff. A post-fix reservoir-route run (seed 2839896595) completed at 83.917 seconds, eight impacts, real cart destruction at 73.650 seconds and an on-foot garage arrival. No actor relocation, grace/health override or forced destruction was used. The cart-wreck/recovery/contextual controls sequence appears at 73.650 / 74.300 / 74.500 seconds. Both crew logs and on-foot success were acknowledged. Artifacts in `route-acceptance/stick-controls/`; this remains one successful foot outcome, not all-district balance coverage.

Inspected main-route range, dry-range, relay, clubhouse, service and garage frames, and the post-fix fatal impact, foot approach and success screen at 2560×1600. The range relay and garage openings are visible; the clubhouse clock establishes a destination. Early side routes remain subtler than the main road and require broader route-readability work and later human tests. Do not close #5/#23/#24 on these screenshots alone.

Installed standard client after final runtime changes: two normal keyboard bursts; presented captures, text states and latest full-page image inspected, no error artifacts. It confirms fresh driving/control/render integration, not complete-route acceptance.

## Remaining work

Full 38-item scope stays active. Continue actual software hot-spot improvement, full encounter-priority/readability audits, alternate-route/on-foot balance, required-route wreck placements, broader lighting/landmark/spatial-audio acceptance and restrained supernatural variety. The retained ghost optimization does not resolve visible-mower/foliage/beacon spikes. Add physical-controller feel to the already deferred human kit; no human results are claimed.
