# Menu materials and hierarchy — 2026-11-14

Implements the ten approved menu refinements while preserving the animation and lead-in.

| Item | Result |
| --- | --- |
| Weathered borders | Static nine-slice pixel border with chipped corners and tarnished highlights on the main panel and panorama. |
| Unified chapter artwork | Shared muted green grade, shadow treatment and fine surface grain; a brightness correction keeps the drain image legible. |
| Selected chapter | Warm inset frame, brighter title and artwork, and a brass check mark; unselected cards recede. |
| Right-side hierarchy | Wider artwork column, larger panorama, quieter grouping labels and chapter captions. |
| Visible environment | Translucent outer panel edges and rail reveal more of the grounds, with stronger coverage behind central content. |
| Physical game title | Groundskeeper plaque with painted-metal surface, bevel, recessed edge and small mounting pins. |
| Chapter label surfaces | Static scratches and uneven painted-metal shading beneath each image. |
| Typography | Consistent UI label font, reduced tracking, restrained supporting text, serif emphasis for chapter and location names. |
| Crafted Start Game | Aged brass texture, stepped silhouette, inset rim, distinct pressed surface and retained keyboard focus brackets. |
| Quieter footer | Links and control hints share a utility strip. Notice stays above it; Start Game remains at the lower right, stacking on phone. |

## Scope and preservation

New menu-only stylesheet: web/course-menu-materials.css. Two existing template strings receive wrappers for the title plaque, footer utility strip and chapter thumbnails. Only those UI script cache keys and the new stylesheet link change in index.html. No gameplay or menu action logic changes.

SHA256 checks confirm web/intro-presentation.js, web/game.js, web/course-menu-atmosphere.js and web/course-menu-atmosphere-fallback.js unchanged. Original course-menu.css is also unchanged. Existing menu entrance and chapter-change transitions remain; no animation code was edited. No new loops, timers, media, animated filters or backdrop blur. Static SVG surface tiles and border paint are reused by CSS.

## Validation

- Actual rendered desktop 2560x1600 inspected first, then1280x720,844x390,390x844 and320x568, each at1.0 and1.3 UI scale. Ten geometry checks pass: no horizontal content overflow, usable scroll area, visible Start Game/footer, minimum44px buttons, no clipped card titles.
- Four chapter selection images captured; selecting a chapter remains in the menu. Settings return, Controls dialog, focus/pressed Start Game and actual Under the Green navigation passed. Navigation target was intercepted with a test page after the real Start button initiated it; downstream gameplay was not modified or qualified here.
- Existing gallery suite passes: equal chapter-card geometry, rapid switching/transition cleanup, location/emblem updates, completion stamps, malformed/blocked storage, mobile scroll cues, OS/game reduced motion, and no entrance replay.
- Installed standard gameplay client: real Enter then Space input reaches menu; latest full-page screenshot inspected, state.mode=menu, no browser error artifact. New test fixture uses supported client key mappings.
- An initial settings-return assertion ran before the next render; corrected the test to wait for the visible menu. Final suite passes without production logic changes.
- Syntax and targeted whitespace checks pass. All owned jobs completed. Existing4187 server retained; no commit/deployment.

## Performance

Measured sequentially with native D3D11 headless Chromium on the shared machine:

- Before:65.1/61.9/55.9ms browser task time per3sec.
- After:64.8/68.8/66.9ms per3sec, with zero layout, zero background art copies and zero observed layer paints. Particle motion present on59/59 intervals; blur pauses it with zero paints.
- Separate four-chapter idle run:61.4/58.8/58.6/63.6ms per3sec. All four:zero game frames, GPU presents, art copies and layout work while idle. Unfocused29.4ms and hidden43.1ms per3sec, also zero presents/copies/layout.
- These small shared-host timing differences do not establish a speedup; static menu changes preserve the existing low-cost idle behavior. Task duration is not GPU frame time and cannot guarantee another browser's video playback.

Evidence: output/menu-materials/{before,after,runtime,layout,features,client}. Protected file hashes are saved in protected-hashes.json; final-source contains changed runtime files and hashes.
