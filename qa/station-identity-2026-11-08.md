# Bell, practice and supply identity

The normal 3D course now has one full-size hanging Audit Bell. Three optional supply reviews use service lockers with recessed shelves, supplies, slatted drawers and brass handles. Each has a weathered pixel sign: SUPPLY READY with ball/blackout instructions, or SUPPLY CLAIMED with its one-use status. Claiming supplies opens the drawer with a short settle; the existing mechanical clack remains. Prompts and noise captions now name the locker. The reward, filing reduction, blackout and Joe investigation rules are unchanged.

The practice model is a low bullseye gong with a segmented ground ring matching the actual landing radius. Its sign explains LAND BALL IN RING / HOLD CHIP AND RELEASE. A successful landing rings the existing chime and swings the gong, then folds it down. Completed/already-learned runs show COMPLETE; skipped lessons show CLOSED. Pressing Use nearby explains its state instead of the generic move-closer message. Skipping/completing the optional lesson still has no effect on the required Audit Bell.

The Audit Bell retains its numbered sign, ringing sound and swing, plus the existing FILED/checkmark completion state. Reduced Motion now suppresses its swing as well as the new transient prop motion. New animations derive from the paused gameplay clock, so rendering cannot retrigger rewards or advance motion.

## Verification

- `verify-station-identity.cjs`, hardware and software: all three lockers accept real E once, ball/reserve and crouched blackout rewards remain correct, no repeated rewards, spent choice buttons disappear, sound functions fire exactly once per successful action. Audit Bell E completion, sound and swing pass.
- Practice verification uses the real landing/rolling pipeline with a controlled valid shot (not an input-only aiming playtest). It checks completion, sound, swinging, settling, pause freeze, skipped/learned state and explanatory Use feedback. Reduced Motion and density zero retain essential status information.
- Inspected models/states at 2560x1600, 1280x720 and 844x390. The larger identity/status text is readable on the approach; small world-space instructions resolve best closer up and are supplemented by the existing binding-aware HUD.
- Program and texture counts are stable across interaction transitions on both renderers. Four new sign instances share the same two opaque batches; the nearest-filtered atlas grows from 960x576 to 960x672 (about 360 KiB extra RGBA storage before driver overhead). Models reuse the existing pixel materials and world disposal lifecycle. No extra lights, downloads, particles, render targets or frame-driven geometry creation. Existing whole-game software stalls are not claimed solved.
- Final normal presented-client run passes two iterations, reaches ready first-hole state, moves 14 units and produces no error artifacts. Full-page screenshot inspected; test browsers closed and local server remains on port 4187.
- Exit regression passes missing prerequisites, ready/filing/opening, movement cancellation and victory through both routes.
- Release verification: 90 scenarios; 56 runtime images / 20.8 MB; no warnings/failures. Syntax and whitespace checks pass.

Evidence: `output/station-identity-20261108/`. Cache revision: `20261108-station-identity`. Human identification/aiming feedback remains deferred.

## Later human check

Without explanation, ask players which object is required, which provides supplies and which needs a golf shot. Revisit a claimed locker and skipped practice target: can they immediately tell why it no longer responds? Record attempts to press Use at the practice gong and whether the explanatory feedback resolves the confusion. Compare first-run and already-learned profiles. Do not count the automated controlled-shot check as human aiming validation.
