# Under the Green pass 61 — gallery root lighting

The full 53 requirements, 48 refinements and seven acceptance gates remain active. This pass addresses the current review's gallery tonal-separation finding, after completing pass60 water verification.

## Change and visual decision

Moved the existing gallery-entry fixture from course (-2.6,8) to (-3.9,11.5), at its original2.8m height. Its warm color, power1.08, reach13, flicker and source identity remain unchanged. Housing, dirty glass, lead wire, glow, humidity anchor and lighting all follow that same authored position. The service-support builder now hangs it from the actual roof instead of the former pipe clamp. Other lamps are identical.

Four native three-view candidates were compared: original, near-wall, near-root and east. The near-wall position better reveals the unequal root shoulders and braided bark from the entrance while the opposite wall and distant passage remain darker. The near-root candidate favored the nearby ceiling/wall; the east candidate weakened the main pillar's front. Accepted full-resolution entry, reverse, close-fixture, minimum-light, reduced-motion and phone views were inspected, together with software close/landscape and the installed-client screenshot.

Only `web/under-green-scene.js` changes at runtime. There are no new lights, textures, gameplay colliders or simulation changes. This is local composition progress, not acceptance of the reference bay: broad ceiling treatment, selective wet highlights, floor/mud integration and full Level1 parity remain open.

## Verification

Evidence root: `output/under-green/visual-pass61/`.

- `tools/verify-under-green-gallery-light.cjs`: `hardware-final` and `software-final` each pass29views and4320camera poses with no clearance hits or page/console errors. Native buffer2560x1600; software desktop buffer960x600 beneath2560x1600 screenshots. Additional viewports1280x720,390x844,844x390.
- Paired entry/root/reverse/arrival/crossing/close-lamp/keeper/pump-control/flood fixtures preserve player state, actual buffer sizes and texture counts. All lamp definitions except gallery-entry match exactly. Camera departure/return PNG is identical. Actual E interaction diverts the pump, pause freezes simulation, and reduced motion, crouch and Q work in the checked sequence.
- Sorted static-triangle fingerprints outside the lamp/support envelope match exactly: native271995/hash1999810465, software197263/hash3456374386. The initial harness envelope ended just before the old cage's front bars/hood and falsely counted154 changed triangles as outside. Expanded it by15cm to encompass the authored fitting; no runtime adjustment was needed for that harness failure. Final runs retain the corrected audit.
- `tools/verify-under-green-moving-clearance.cjs --dry --output=output/under-green/visual-pass61/route`:1379route frames,106body/scythe geometry samples, zero intersections, maximum foot error2.41e-7. This automated route is separate from human pacing/art acceptance.
- Installed standard client: seven bursts, terminal success, final ready/playing at(0,10.12),elapsed1.5333; no error artifact, final screenshot/state inspected. Initial Preparing-button timeout recovered through later input bursts.
- Baseline and verified runtime copies plus SHA256 manifest retained under `source/`.

## Resource cost

The roof hanger contributes12additional triangles in the checked root/reverse views. Entry gains14triangles/one draw because visibility also changes. Entry525/386546draws/triangles becomes526/386560; root421/325322 becomes421/325334; reverse55/98254 becomes55/98266. Texture counts match. Programs207→211 reflect altered static light-set variants. Startup and whole-level performance remain open.

All owned visual/client/route jobs were terminal before sequential GPU budget runs. Other Level1 shadow-filter rendering was observed on the shared machine. Timing remains provisional; no speedup or no-regression claim.

Native median/P95 milliseconds: entry16.4/17.7→15.6/18.5; root15.3/16.4→14.4/16.3; reverse7.8/9.4→7.8/9.7. Software median/P95 at actual960x600: entry: 189.4/247.8 -> 195.0/220.9 ms; root: 157.3/170.5 -> 161.0/185.5 ms; reverse: 69.2/111.1 -> 69.1/96.5 ms. Both sequential budgets are terminal (native59821/software6030). Software entry/root medians worsened and absolute cost remains too high; shared-machine load limits causal attribution. No performance gate closes.

Next: physical water-edge depth and contact composition; remaining bunker shoring/soil repetition and keeper/range integration; broader selective wet highlights and full-route visual/performance gates. Preserve existing E/Q, Level1 movement, entrance-only retries and sound-led tension.
