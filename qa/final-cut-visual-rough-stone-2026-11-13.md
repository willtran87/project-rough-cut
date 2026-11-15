# Final Cut: authored rough and masonry finish

This pass completes FV23 and FV30, retains the small stubble acceptance for FV51, and repairs a renderer startup regression. The 72-item goal remains active. Overall Level 1 parity is not claimed.

## Implementation

- `web/final-cut-rough.js` replaces plain standing blades with three authored fescue clumps on bent, rooted planes. Their color and depth shaders share atlas selection and gentle wind. The same 1,944 sample locations still use authoritative `isCut` state. Cut plants swap to 3.5–5.1 cm stubble. No cover or damage rules changed.
- `web/final-cut-masonry.js` dresses the existing 73 wall/body envelopes with 7,576 bevelled pieces, including 300 coping pieces and 1,458 short-end headers. Variable block lengths, fixed-height courses, three stone families and selectively damp lower stones replace the previous repeated slate-like masonry. Coping and backing no longer share a top plane.
- The pavilion approach previously matched the pavilion refuge prefix and received duplicate construction. Both base and detail selection now exclude route walls from refuge construction.
- Airborne cuttings referenced the old removed rough geometry, preventing startup (`leaf is not defined`). They now own a small blade geometry and disposable material. Actual reel-driven particle emission remains FV52 work.

## Authored assets

The built-in image_gen tool generated the following source assets in the preceding implementation pass; this pass integrated them. Runtime WebP files are lossless encodings. No generated stone joints are used: joints and corners are geometry.

- `assets/environment/final-cut/rough-clumps-v1.png`: 1536x1024 RGBA. Prompt: `assets/environment/final-cut/rough-clumps-v1-prompt.txt`. Runtime: `web/assets/optimized/final-cut-rough-clumps-v1.webp`.
- `assets/environment/final-cut/stone-materials-v1.png`: 1536x1024, six material cells. Prompt: `assets/environment/final-cut/stone-materials-v1-prompt.txt`. Runtime: `web/assets/optimized/final-cut-stone-materials-v1.webp`.

## Verified evidence

All paths below are under `output/final-cut/visual-rough-stone/` unless otherwise stated.

- `accepted/report.json`: 2560x1600 standing/crouched grass, actual keyboard crouch and strafe, actual partial/full cutting pass and saved partial-state restoration. The partial pass cuts 96 tufts, restoration preserves those 96, and the completed first strip cuts 648. Six masonry approaches cover all refuges, the route wall, the overlook and ramp. No browser errors. Smaller framebuffers are 1920x1080, 1280x720, 844x390 and 390x844, with no horizontal overflow.
- `masonry-bounds.json`: the actual production estate builder is exercised. Every transformed vertex of each masonry piece is contained by one authoritative physical envelope. Exactly 73 walls/bodies are dressed once.
- `shared-sightlines-final/report.json`: corrected shared `AMBUSH_CORRIDOR_X=22.8` replaces the stale hardcoded 21.5 fixture coordinate. All 48 standing/crouched, near/far, lateral-offset, four-direction captures exactly match their diagnostic no-mower counterpart. PNG bytes are compared in memory; four representative views and failures only are retained. This supersedes the earlier expanded test's coordinate assumption.
- `routes/browser.json`: all three uninterrupted real-input direct/garage/drain finales pass, including bank/open crossings, a ball diversion, pump, bell, physical collapse, road and completion. Zero captures and no errors. 71 screenshots. The direct run preceded removal of duplicate approach dressing; gameplay and collision were unchanged. Final targeted views verify that cleanup.
- `final-hardware/report.json`: final backing/coping fix checked in seven views and all five viewport sizes. Render tiers are actually 1600/1920/2560 pixels wide and persist. No errors. Short GPU-completed moving-camera samples: medians 2.8/2.8/2.5 ms, p95 3.1/3.1/2.9 ms for balanced/high/ultra. Warm geometry/texture counts remain 104/53. These are isolated draw samples with cut grass, not sustained FPS, worst-case foliage cost, or a complete FV71 budget.
- `client/state-0.json`, `client/shot-0.png`: installed Playwright client, SwiftShader, 960x540 render. Intro and keyboard movement complete, ready/playing at y=9.531; no error artifact. Screenshot inspected. This client predates only final course alignment, duplicate-wall cleanup and backing-top adjustment, all covered by later hardware fixtures.
- `verify-final-cut-mowing.mjs`, `verify-final-cut-rig.mjs`, `verify-final-cut-plant-contact.mjs` pass: multi-rate mowing/restore, 2,000 independent contact samples, four-heading physical plant response, skipped-render recovery and pause invariance.

Visual inspection included standing/low grass, the close passing mower, mown ground, all new masonry approaches, portrait layout, final overlook/pump, software gameplay, and final-route fork/win frames. Initial fixture errors were fixed: crouch is C (not Control), and the bunker approach must be outside the raised ramp. Fixed course heights also resolve misaligned joints between adjoining walls.

## Remaining requirements

Ground still needs authored fairway transitions, physical shallow terrain and wetting; refuge identities, timber/fixture/interior finish still need acceptance; mower materials/parts and Joe's face/acting remain incomplete. Close headlight illumination can overexpose blades. Story art continuity, UI, effects, wreck aftermath, matched Level 1 comparisons and the full performance budget remain open. The current all-cut foundation fixture cannot prove worst-case standing-foliage performance.

## Capture retention update

The following ground pass retained the prior route report and 23 representative screenshots, and removed 48 superseded PNGs to recover disk space. All 71 original route capture points were executed; only representative images remain on disk.
