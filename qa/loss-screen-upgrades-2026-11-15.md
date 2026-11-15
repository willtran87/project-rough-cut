# Loss-screen upgrades — 2026-11-15

Implements all five recommendations from `design/loss-screen-review-2026-11-15.md`.

1. **Dominant chapter art.** Loss cards grow to 1920px with roughly two thirds of the body reserved for the image. At actual 2560×1600 the artwork now occupies 20.7–21.2% of the viewport, up from 4.7–5.4%. At 390×844 it occupies about 31%; Joe, the weapon and the victim viewpoint remain readable. Under the Green uses an explicitly positioned crop to retain the reaching hand.
2. **Shared framing.** All four losses use the same forest/brass material, continuous frame with chipped corners, image/header/quote/tip/details hierarchy and persistent action footer. Desktop frames match the 1672×941 source aspect ratio; no letterbox bands. Original nodes and handlers are moved only on state transitions and restored on exit, retaining each chapter's retry rules.
3. **Final Cut defeat illustration.** Joe and the tournament cutting reels approach a fallen player's hand beneath championship lights. Saved asset: `web/assets/optimized/final-cut-loss-v2.webp` (1672×941, 584,856 bytes). Generated with built-in image generation using the existing Final Cut loss and Under the Green loss illustrations as references. Exact prompt, mode and reference roles: `output/loss-screen-upgrade/art-prompt.txt`; generated PNG preserved as `output/loss-screen-upgrade/final-cut-loss-v2-source.png`. Pillow was used only for WebP encoding. The story asset map remains untouched.
4. **Chapter-specific taunts.** Under the Green and Final Cut each have 12 complete two-line remarks. Back Nine's insurance-heavy remarks now use product-owner, golf and turf language. Its contextual pools and Night Order's existing selector/history remain. Shared selection caches each run in a WeakMap and stores shuffle-bag history separately per chapter, preventing immediate repeats across retries/reloads. New chapter pools exhaust before repeating.
5. **Consistent quote prominence.** A small Joe attribution, prominent serif quotation, one useful retry tip and folded detailed report appear in every loss. These are visible written quotations regardless of the gameplay subtitles preference. Final Cut also has a fallback tip for losses without detailed failure evidence. Night Order supports keyboard activation of the details summary and controller X to toggle loss details.

## Verification

- Actual rendered screenshots inspected at 2560×1600 first, then 1280×720 and 390×844 for all four chapters. Additional geometry assertions at 844×390. Final evidence: `output/loss-screen-upgrade/*-loss-*.png` and `metrics-final.json`.
- Primary actions remain visible; no horizontal overflow; quote fonts at least 19px at the checked sizes. Large text, keyboard details, mobile settings and retry actions exercised. Night Order's victory art/layout and the other chapters' pause layouts restore after loss. A second attempt produces a different quote in the three shared-picker chapters. Each final interaction record has no page errors: `*-interactions.json`.
- `dialogue-checks.mjs`: four full shuffle cycles per pool, stable selection for the same run, persistence/reload repeat protection, and storage-unavailable fallback passed. Night Order's existing selector was also sampled during capture.
- Installed develop-web-game Playwright client completed two input bursts. `client/state-1.json` reports `final_cut_playing`, ready=true; screenshot inspected; no error artifact.
- JavaScript syntax checks passed for changed runtime modules.
- Test fixtures stage losses and completion with browser-only hooks; this is not a full campaign playthrough. Two initial interaction harness issues (missing victory route/result and a missing manual draw after Under the Green retry) were fixed in the harness and rerun successfully. A stopped local preview server was restored on port 4187.

## Performance

The layout uses cached static images. Dialogue selection and node moves occur on transitions; no timers, shaders, animations or additional render loops were added. Night Order avoids the loss-screen canvas copy and displays the existing still directly. Final Cut predecodes its compressed replacement image.

Benchmark results are recorded in `output/loss-screen-upgrade/performance.json`: sequential baseline/current five-second idle loss-screen windows at 1280×720 in native D3D11 Chromium, with CDP task/script/layout metrics and WebGL draw counters. Controller details are checked after, outside the timing window. These are local spot checks, not a guarantee of simultaneous YouTube performance on every device.

## Protected presentation

Intro, lead-in, opening-story and menu implementation files were not edited. Ten SHA-256 checks against the start-of-task snapshot verify the protected files: `output/loss-screen-upgrade/protected-before.json` and `protected-after.json`.

### Measured idle results

Five-second windows; task/script times below are cumulative milliseconds, not frame times.

| Chapter | Task ms before → after | Script ms before → after | New WebGL draws | Layouts |
| --- | ---: | ---: | ---: | ---: |
| night-order | 892.2 → 412.9 | 460.0 → 176.0 | 0 | 0 |
| back-nine | 55.0 → 67.5 | 13.9 → 17.4 | 0 | 0 |
| under-green | 63.3 → 54.1 | 15.0 → 13.0 | 0 | 0 |
| final-cut | 44.3 → 50.5 | 10.8 → 12.1 | 0 | 0 |

All four current controller-details checks passed. No page errors. The later chapters remain at low idle activity; small timing differences are single-sample variation. Night Order avoids the repeated loss-art canvas copy. Its existing per-frame style updates remain (605 style recalculations in both windows); this change does not claim to eliminate all baseline work. The new Final Cut image is 584,856 bytes versus 2,199,362 bytes for the previous loss image.
