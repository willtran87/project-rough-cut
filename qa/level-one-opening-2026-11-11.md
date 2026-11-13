# Level 1 illustrated opening

## Delivered

`BEGIN THE ROUND` now opens five manual-paced illustrated chapters before the existing Night Order guide. `Next`, `Back`, `Skip intro`, left/right arrows, Enter/Space, Escape, touch and controller actions are supported. The final action opens the guide; it cannot also dismiss it with the same keypress. `REPLAY STORY` ignores the optional saved skip preference and leads to the guide. Retries and Level 2 transitions are unchanged.

The narrative follows the existing `PLAYER_STORY`: the analyst's 5:47 PM Night Order, the insurer's turf-telemetry pilot, Joe's control over the course, three field checks, a locked south gate, and shed/drain alternatives. Joe remains human-looking and the ghosts remain unexplained. These are narrative illustrations, not literal overhead route maps.

Five images generated with the built-in image-generation tool; source PNGs, complete prompts and asset manifest are in `assets/cutscenes/level-one-opening/`. Runtime copies are in `web/assets/optimized/level-one-opening/`. Native resolution is 1672×941, matching the original opening art; no artificial enlargement, resampling or pixel filter. WebP quality 90 totals 2,457,184 bytes (2.46 MB / 2.34 MiB). `tools/package-opening-art.cjs` reproduces compression from the source masters.

## Presentation and cost

- Full-screen accessible dialog with caption and control rows separate from art. Images use contain sizing so no narrative subject is cropped. Intentional letterboxing on compact/portrait screens preserves the whole composition.
- Restrained reveal, 0.8% depth movement, low-opacity mist and a very subtle local glow. System or saved Reduced Motion disables all animations. Hidden tabs freeze animation and fade the intro audio to zero.
- Existing wind, electrical drone and motor voices/buses are reused. Motor targets increase across chapters 1–4, then fall to zero for chapter 5. Saved master, ambience and mower levels apply; sound captions follow the subtitle setting. Narrative text remains visible.
- Only chapter 1 preloads at the menu. The current image decodes asynchronously, then one next image preloads. At most two image promises/objects are retained by the controller; closing releases references. Browser caching is browser-managed.
- While the modal owns presentation, simulation and WebGL/canvas rendering return early. No new shaders, models, gameplay effects, pathing work or audio voices. This removes hidden rendering work during the story; it is not a claim that the existing gameplay frame spikes are fixed.
- Failed art offers Retry and allows continuing/skipping. Slow asset settlement cannot reopen the intro; late image decodes cannot resurrect a closed dialog. Denied preference storage does not block progression.

## Verification

- `node tools/verify-opening-story.cjs`: passed all five chapters, Back/Next, final Enter handoff, keyboard focus, skip preference, replay, reduced motion, initial one-image network preload and maximum two retained images. Player, Joe, elapsed gameplay and 3D frame counter unchanged throughout the story; gameplay movement resumes only after guide confirmation.
- `node tools/verify-opening-story.cjs --software`: passed the same flow with SwiftShader, including loading the real course and movement.
- `node tools/verify-opening-story-edges.cjs`: passed deliberate image failure/retry, blocked course loading, skip during loading, late image settlement, denied local storage, muted master and saved category levels, hidden sound captions, system reduced motion and touch handoff.
- Standard installed gameplay client through `tools/verify-presented-client.mjs`: passed; full-page capture and `openingStory` text state inspected. Its raw canvas capture intentionally shows the underlying canvas, since the cutscene is DOM presentation.
- `node tools/verify-opening-story-controller.cjs`: passed fullscreen enter/exit, controller Next/Back/Skip and held-button protection at the guide; no console errors.
- `node tools/verify-back-nine-transition.cjs`: existing drain rematch and shed continuation to Level 2 still pass.
- `node tools/verify-release.mjs`: validated 90 action fixtures and 61 referenced images, zero unreferenced runtime images, no source masters shipped; passed. This check validates fixtures; it does not play all 90 scenarios.
- Visual checks: 2560×1600, 1280×720, 844×390 and 390×844; captions and controls fit without covering artwork. Evidence in `output/level-one-opening/`.

Human feedback on pacing, emotional impact and preferred sound balance is still deferred as requested. No human-playtest results are claimed.
