# Intro title break and continuous start — 2026-11-14

The user requested removal of the newly drawn grass, a seamless static-screen-to-intro transition without fading, and a title breakup triggered by the mower breaching the lower grass.

## Changes

- Removed the twelve procedural pressure blades, vector edge stems, and the long strand across Joe's face (including its late clipping). Original painted grass, textured falling clumps and small cut speckles remain.
- Gate and intro use the same cached title and curtain placement. Starting the presentation sets transitionAlpha to zero; the input prompt slides off-screen. The title holds until the first mower contact at 1.3 seconds.
- Twenty-six opaque pieces cut from one cached 416x88 title canvas scatter outward and fall off-screen. No opacity fade or late title reappearance. Portrait layout positions the title at the lower mower opening too.
- Closed sections of the aperture no longer create degenerate clipping paths, preventing antialiased pinholes before the upper cuts.
- Reduced motion clears the title at impact without flying fragments. Existing reveal pacing, motor audio, controls and eventual menu handoff are retained. The Joe line remains subtitle-only.
- No new animation loop, timer, audio context, media request or continuous menu work. Title fragments are finite and stop after the burst.

## Verification

Evidence: output/intro-title-break. Native desktop at 2560x1600 and portrait at 390x844; native and software intro checks; installed gameplay client; silent actual-input preview. Source snapshots and hashes are in final-source.

Continuity regression compares the UI backing surface pixel-for-pixel across a real Enter input: identical gate and intro time-zero frames, transitionAlpha zero, on both viewports. Actual page screenshots cover the intact title, breakup, cleared title and Joe reveal. The first version of the test incorrectly read the WebGL presentation canvas; the final test reads the actual UI backing surface.

An older concealment assertion then found five changed face-region pixels after the lower cut. Separate polygons for actual openings fixed the zero-width clipping artifact, preserving the strict zero-pixel assertion.

Performance figures and final run results follow below. Browser task time is not GPU frame time; measurements on this shared host do not guarantee behavior of another browser's YouTube playback.

## Final results

- Final native run: 363/334ms browser task time over 9.81/9.86sec, 295/296 render-counter increments. Native functional suite passed after the clipping fix: keyboard/touch/gamepad skip, reduced motion, focus/hidden pause, and menu return. No page errors.
- Software rendering run (before the final closed-edge mask correction): 349/294ms task time over 9.79/9.86sec, 316/315 render-counter increments; functional checks passed. Counter increments include incidental renders; the existing animation target remains 30Hz.
- Menu idle: 63/55/54ms task time per three seconds; zero layout, background art copies and observed layer paints. Particle movement observed on 59/59 intervals; blur pauses it with zero paints. Menu code unchanged.
- Final reveal regression: face-region changed pixels 0/3300/25563/75184 across four holds; retreat brightness 208.75 to 112.22; final hold identical; neutral-to-grin transition passed. Actual motor filter 344 to 6164Hz and zero motor gain during stare; stinger timing and missing-portrait concealment passed.
- Final continuity check passed both viewport sizes with identical first frames and no fade. Final title-burst desktop/portrait images and installed-client page were opened and inspected. Client ends at intro 6.7sec, pose2, title cleared, drawnGrass false, ready true; no browser error artifact.
- Actual-input silent preview reaches the menu normally; final menu image inspected. Preview: output/intro-title-break/preview/intro-to-menu.mp4.
- Syntax and targeted whitespace checks passed. Existing server on4187 retained; no commit or deployment. Changes in this task are confined to intro presentation, its start transition/cache key, regression tooling and evidence documentation.
