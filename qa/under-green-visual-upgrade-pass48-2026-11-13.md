# Under the Green pass 48 — readable signs in physical scenery

Status: local visual and clearance checks pass; full 53-item objective remains active. V11, V14 and V50 remain partial. The previous list-only goal turn made no implementation progress; this pass resumes the unfinished sign work from pass 47 and verifies new runtime changes.

## Changes

- Raised the first crossing's teaching plate from 2.95m to 3.3m, keeping its scale and source lettering. Moved its side seats to the same height. This clears the projecting signal hood from crouched and standing sightlines.
- Moved the first hanging root knot from x0.6 to x2.1 and reduced its spread from1.45 to0.85. It now grips the maintenance shaft's east edge instead of trailing through the instruction. The other knots and generated branch topology are retained.
- Rerouted the release-console conduit around the sluice sign. One swept tube has rounded bends, retains the console and hoist connections, and keeps the lateral jog above2.4m. Physical UV scale is two metres; its geometry is local to the release's static batch. Existing material/maps/lights are reused.
- Narrowed the short-landscape water panel to a side column, preserving text size and wrapping. Its prior390px width overlapped the central physical bank signals in51 tested cases. No hazard information is removed.

## Evidence

Artifacts are under `output/under-green/visual-upgrade-local/`, a junction to the D-drive artifact store.

- `pass48-accepted/{hardware,software}`:35 current views per renderer;2560x1600,1280x720,390x844 and844x390. Front/rear/oblique/standing/crouched crossing views, valid route-sign approaches, dim-light timing, actual Q, pause/clock freeze and Reduced Motion. Zero shader/page/console errors. Native desktop and software portrait views inspected, including final native sluice lettering at original2560x1600 resolution.
- Actual lettering rays use the rendered sign's UV transform and ink pixels. At the first crossing,48 camera poses/2304 ink rays pass after the change; the saved original has24 blocked poses. This is sampled visibility evidence, not an exhaustive test of every glyph pixel or human comprehension.
- The initial48 row-major ink samples missed a thin vertical conduit. The verifier now supplements the release sign with width/height-stratified actual ink samples,357 per face. Original north approach:18 blocked at2m,15 at4m,31 at7m. Current:0 at2m,0 at4m,19 at7m. The remaining7m obstruction is a real retaining post, not the conduit. Opposite face at2m is clear;4m/7m opposite-face origins have no valid floor and are reported as such.
- All28 actual sign-face meshes are audited at fixed normal approaches, with limited lateral adjustment only to find real floor. Seven blocked route cases remain: six backs of the pump's gauge plaques, and the distant sluice view above. Intended operator-side gauge faces are clear. No scenery was removed to make machinery labels readable through their backs.
- Dim timing61.7s is selected by nearby-lamp attenuation weighting. It is a useful low-light fixture, not a measured absolute luminance minimum for every sign in the level.
- `pass48-signals/after/browser.json`:4176 real touch-layout state/stance/FOV/approach/viewport cases, zero failures/errors;576 camera poses around signal supports pass.20 fixture screenshots plus an actual touch crossing, zero water hits. The initial51 HUD-overlap failures are retained in `pass48-source/signal-failures-before-hud.json`. Final landscape crouch screenshot inspected.
- `pass48-layout-clearance`:2784 camera poses around the teaching plate/release,101 gate travel fractions, no intersections. Actual E releases the gate, pause freezes travel, and resumed movement secures it. This run was repeated after the conduit batch correction.

## Intermediate versus final evidence

`pass48-signs` is the raised-only candidate: it still had root occlusion and must not be presented as the final result. `pass48-final` fixes root placement but predates conduit/HUD work. `pass48-finished` includes the bent conduit before the final spatial-batch correction; its baseline reproduces both original obstructions. `pass48-accepted` is the final current source. The signal-framing run loaded the conduit before the batch correction; the correction preserves its world geometry, and final sign/camera/gate tests use the corrected batch.

## Remaining scope

Full-route composition, material cohesion, illustration/gameplay matching, Level1 parity and every whole-level release gate remain open. V50 is not marked complete from a sampled ray audit: route-level lighting, movement and reading-distance acceptance still need broader review. The distant retaining-post sightline is recorded, not silently treated as clear. Software performance remains a separate unresolved requirement.

Final route/client evidence:

- `pass48-accepted-route`:1379 route frames,106 actual skinned-body/scythe geometry audits, zero intersections/errors. Maximum foot error0.000000242m. Repeated after the final conduit batch correction.
- `pass48-accepted-client`: nine installed-client input bursts, final gameplay position(0,18.44), first crossing visible; shot8/state8 inspected. Initial five-second Preparing-button timeout recovered through subsequent Enter bursts; terminal exit0, no error artifacts. Earlier client captures are intermediate evidence.

## Local rendering cost

Final conduit replaces24 box triangles with1024 tube triangles (+1000). Gallery geometry count stays327674; release approach117992 to118992; release close112982 to113982. Matched native draws414/97/67, textures59/65/65 and144 shader programs are unchanged. There are no new image assets or lights. Static batching stays at the release, with real world-space geometry preserved.

Six warm and24 alternating GPU-fenced samples per view, native then software, after other owned verifiers finished. This is a fixture diagnostic, not ordinary-input FPS or whole-level performance acceptance. Median/P95 milliseconds:

| Renderer / view | Before | After |
|---|---:|---:|
| Native / gallery approach |13.5 /16.2|14.4 /17.4|
| Native / release approach |8.9 /11.6|10.5 /11.9|
| Native / release close |6.6 /9.6|7.1 /9.8|
| Software / galleryApproach |331.4 /352.1|336.9 /361.2|
| Software / releaseApproach |242.0 /269.4|253.2 /267.0|
| Software / releaseClose |111.6 /141.9|117.7 /139.3|

Software costs increase5.5,11.2 and6.1ms at the medians and remain far outside a playable budget in these fixture diagnostics. The benchmark harness passing means samples/errors/resources were collected successfully; it does not mean performance acceptance. No runtime quality was reduced to hide the cost. Native median costs rise0.9,1.6 and0.5ms; unchanged resource counts are not a no-regression claim. Source/harness hashes are in `pass48-source/final-hashes.json`.


All owned pass48 processes are terminal; local server4187 is retained. Full53scope remains29implemented/23in_progress/1pending; all seven release gates remain pending. No commit, deployment, agents or artifact deletion.
