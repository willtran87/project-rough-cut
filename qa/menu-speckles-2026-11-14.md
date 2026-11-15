# Menu particles: smooth, faster natural motion

Requests: smooth particle motion without hurting menu performance, then increase speed while retaining an organic appearance.

Current implementation uses one lightweight transparent WebGL point-sprite batch for24–80 fragments. Paths, taper, warm edge shading and flutter are evaluated on the GPU. The capped60Hz callback updates only time and submits one batch; there are no per-particle DOM writes or style/layout calculations. Nominal drift is65% faster. Three depth groups retain different sizes and speeds; shared gusts, curved lift, small turns and gentle flex keep movement natural. Edge fades maintain continuous circulation.

Focus loss freezes the visible effect and cancels the frame callback. Hidden tabs, settings/dialogs, menu exit and OS/game reduced motion likewise stop it. Resize updates the viewport; context-loss/restoration pauses and recovers. Missing or detected software WebGL uses the prior bounded10Hz DOM fallback to protect weak renderers; it cannot offer the hardware path's display-rate smoothness.

## Evidence

`output/menu-speckles-smooth/` contains before/after reports, lifecycle screenshots/report, gameplay client capture, and grass-breeze.mp4.

- Serial native comparison at2560x1600, three3-second samples each: previous task work85.77/87.32/101.79ms; final45.37/46.15/45.18ms. Median main-thread task work fell about48%. Style work fell from16.37–17.14ms to3.55–3.76ms. Zero layout work, full-screen artwork copies, or browser-layer paints in measured windows.
- Motion advanced on59/59 sampled display-frame intervals vs10/59 previously. Active rendering is capped at60Hz; observed cadence depends on display/host load.
- The lifecycle suite passed all four chapters, blur/focus, hidden/visible, OS/game reduced motion, modal/settings return, resize and forced graphics-context loss/recovery. Game-renderer GPU presentations and artwork copies stayed at zero. Unfocused/hidden animation time stayed frozen with no scheduled callback.
-30-second1280x720 continuity check read actual GPU pixels every5seconds:48–58 visible connected particle shapes in each sample. No stream interruption.
- Screenshots inspected at2560x1600,1280x720,390x844,844x390. Lightweight fallback smoke test passed.

These are local measurements on a shared host, not a direct YouTube playback test or a whole-machine GPU benchmark. A per-element browser-animation experiment increased main-thread work and was discarded; it is not the shipped implementation.

Final checks: chapter-picker mouse/touch/keyboard/controller navigation and actual game launch passed. Installed gameplay client passed with a 2492x1402 game-canvas capture and inspected full-page gameplay screenshot. Its raw-canvas selector now excludes the decorative menu overlay. Runtime and adapter syntax/whitespace checks passed. The final recorded menu preview and extracted frame were inspected.
