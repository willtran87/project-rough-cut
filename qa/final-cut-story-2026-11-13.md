# Final Cut: illustrated narrative and industrial mower

## Shipped behavior

The chapter has a dedicated splash illustration, a three-frame opening, a loss tableau with Joe's expression, and a two-frame victory sequence. Six new high-resolution pixel-art source PNGs are preserved with their exact prompts and lossless runtime copies. The opening explains Joe's final review and the pump/swale/bell relationship. The ending follows the existing flooded-machine reversal and confirmed public-road escape.

The user's latest art direction replaces the prior literal-demonic rig. The playable vehicle now has a conventional louvered radiator, welded bumper, flat industrial canopy and amber beacon. Horns, skull markings, angry brows, fang teeth and red eyes have been removed. Existing detailed tires, heat-shielded exhausts, hydraulic parts, cutting banks and continuous rolling travel remain. The industrial detail layer contains 339 merged parts, nine meshes and 7,866 triangles, plus its small beacon.

## Lifecycle and accessibility

- Opening appears when entering a fresh chapter. Back/Next and Skip are immediate controls; an opening-skip preference persists locally. The story can be replayed from the chapter/pause menu.
- Story images are DOM content rather than WebGL textures. The player retains at most the current and next decoded story frame; closing clears that cache. Image failure exposes Retry and Continue instead of blocking the chapter.
- The simulation stays frozen during the story. Keyboard events and gamepad menu boundaries prevent story navigation from becoming a movement, pickup or replay action.
- Victory is saved through the existing road interaction before its story opens. Skipping, replaying, changing credits views or reloading preserves completion and evidence. A completed save opens the result rather than forcing the cutscene again.
- Loss uses the actual chassis/wheel/cutting-bank cause and corresponding advice. Checkpoint retry remains immediate. On short landscape screens, a fixed action strip keeps Retry visible with enlarged captions.
- Captions are separate HTML, always readable during the story, including with sound muted. Reduced motion removes image reveal animation. Dialogs provide focus containment and keyboard/touch/controller navigation.

## Verification and evidence

- `verify-final-cut-story-browser.cjs` passes on hardware and software renderers: three opening frames, back/next, simulation freeze, completion without key leakage, skip preference/replay, actual capture and touch retry, E road exit, saved victory, ending replay/reload, image failure/recovery, reduced motion, mute and controller B skip.
- `verify-final-cut-arrival-browser.cjs --crossings --out=output/final-cut/story/routes` passes all three uninterrupted ordinary-input routes including the new opening and victory scenes. Direct 115.33 s, garage 119.22 s, drain 152.92 s, zero captures/errors, 71 screenshots. No live placement is used for those routes; the harness's separate presentation fixtures remain labeled separately.
- `verify-final-cut-defeat.cjs` passes all three contact kinds at four viewports with 140% captions, retained preparation, frozen capture, stable audio sources, and immediate keyboard/click/touch/controller retry. Its initial audio-count assumption predated the grass-rustle voice; the test now checks that source allocation stays stable across a frozen capture. Its enlarged-caption layout check exposed the landscape Retry issue, which was fixed.
- `verify-final-cut-outcome.mjs` and `verify-final-cut-outcome-browser.cjs` pass evidence/save/credits/replay checks. Both evidence outcomes now share the accurate new road tableau; source-specific records remain in HTML, avoiding invented documents in art.
- `verify-final-cut-rolling-boss-browser.cjs --out=output/final-cut/story/industrial-rig` passes actual translation/yaw, steering/tire roll, planted Joe contacts, pause and updated vehicle views.
- Images and layouts inspected at 2560×1600, 1280×720, 844×390 and 390×844. Source and runtime images retain native detail; no claim of native 4K or fully animated video is made.
- The installed web-game client passes with `tools/final-cut-story-client-actions.json`: the opening completes, active gameplay begins, E remains the interaction binding, and the final screenshot/state are inspected. No error artifact was produced. All owned final verification sessions exited 0.

Evidence is under `output/final-cut/story/`. The existing defeat and outcome harnesses also retain their screenshots in `output/final-cut/defeat/` and `output/final-cut/outcome/`. The source asset trail is `assets/cutscenes/final-cut-story/README.md`, `prompts.json` and `manifest.json`.

This completes the requested illustrated narrative and revised vehicle-art scope. The wider Final Cut backlog remains separate. No commit or deployment was requested.
