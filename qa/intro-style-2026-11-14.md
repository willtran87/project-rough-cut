# Intro style and performance — 2026-11-14

All ten approved refinements implemented in the pre-menu “Here’s Joey!” animation.

1. Midnight green/olive/cream/brass palette; orange sparks replaced with grass fragments.
2. The menu's weathered Rough Cut SVG appears on the opening gate and the final title beat.
3. A directional turf cut with staggered blade lengths replaces the circular cut-out.
4. Two localized cached headlight catches replace the full-screen green flash.
5. Joe emerges through a dim silhouette into practical light before the spoken line.
6. Small, integer-positioned push-in replaces random shake, rotation and a separate jittering face overlay. Scanline texture removed from the new intro and gate.
7. Bounded grass fragments use the menu's seeds, gusts, depth/color family and clock handoff. At most 80 ambient particles plus 28 brief cut clippings; reduced motion removes them.
8. Cream Georgia subtitle text on the menu's dark/brass caption plate; mobile text and skip prompt enlarged.
9. New pixel artwork shows Joe in his existing clothes behind a broad, worn push mower, with wet timber gate, brass hardware, stone wall and practical lanterns.
10. Last 750 ms dissolves to the selected chapter's menu background. The existing finite menu entrance fades in; particle clock continues. No intervening black flash. The menu's old hidden art overlay is transparent for the same final backdrop.

Implementation: web/intro-presentation.js draws on the existing 1280x720 canvas and 30Hz intro clock. Four large reusable raster caches plus one small light sprite; no new timer, RAF or WebGL context. Existing input, speech and music timing retained. New artwork adds a 572838-byte WebP. Legacy opening remains a load-failure fallback. Menu seedTime methods perform one assignment at handoff, not work during idle. Script/cache links updated.

Assets generated with built-in image_gen (edit with original opening as identity reference), inspected, copied into project, then encoded to WebP for delivery:
- Source: assets/rough-cut-intro-mower-v2.png
- Runtime: web/assets/optimized/rough-cut-intro-mower-v2.webp
- Exact prompt and reference: assets/rough-cut-intro-mower-v2-prompt.txt

Validation:
- Native intro baseline: 422.91/387.33 ms browser task time over ~8.1 sec; final timing: 554.40/513.85 ms over ~8.2 sec. ~241–245 presentations per run, consistent with the existing 30Hz cap. About 129ms extra task time per full intro (~1.6 percentage points of one CPU core); not an intro CPU speedup. Earlier updated run457.27/418.60 retained in console history; host variability applies.
- SwiftShader baseline545.87/538.31 ms vs updated510.62/498.01 ms per full intro. Both complete and functional. These browser metrics are not total GPU utilization or a direct YouTube playback test.
- Menu original baseline60.54/65.55/85.13 ms per3s, updated64.84/62.03/61.15. Both59/59moving sample intervals, zero layout, repeated artwork copies and observed layer paints. No idle regression observed.
- Intro native/software natural completion, Enter/Space/Escape/touch/controller skip, focus freeze/resume and OS reduced motion passed. Final native checks also covered hidden freeze and identical reduced-motion hold screenshots. Initial manual-time test required one presentation tick after key input; fixed the test. Reduced-hold comparison first caught an unsettled ResizeObserver following viewport resize; waiting for settled viewport made captures identical.
- High-resolution2560x1600, ordinary1280x720 and phone390x844 rendered frames inspected. Installed standard game client via adapter captured actual intro at5.73sec/phasejoe,1280x720logical canvas within2560x1600page; image and state inspected.
- Full menu picker regression passed mouse/touch/keyboard/controller, all chapter previews, Settings return, destinations, actual NightOrder launch, and four viewport launch bounds including844x390. Missing-WebGL fallback and reduced-motion stop passed. No browser errors.
- Syntax and targeted diff whitespace passed. All owned jobs terminal; no agents/CUA/commit/deployment.

Evidence: output/intro-style. Native intro before/intro-report.json, after/intro-timing.json, after/intro-checks.json; after/menu-report.json is the menu timing report. Software results in before-software/report.json and after-software/report.json. The earlier generic after/report.json was reused by the menu test, so use the explicitly named reports above. Preview: preview/intro-to-menu.mp4 (silent screen recording; game audio retained in production). Production source snapshots under final-source.
