# Loss-screen consistency review — 2026-11-15

Requested standard: prominent splash art depicting Joe defeating the player in the lost chapter's setting, with varied product-owner/golf/grass expressions. This is a review only; no runtime/art/intro/lead-in changes.

Fresh rendered evidence: `output/loss-screen-review/`. Captured all four loss screens at actual 2560×1600 first, then 1280×720 and 390×844. Checked loaded image dimensions, displayed art bounds, visible text and dialogue-selection source. Capture reports have no page errors. Loss states were staged with isolated browser hooks, not earned through full route playthroughs. Twelve selector samples each for Night Order and Back Nine produced twelve distinct line IDs; this is a spot check backed by inspection of their repeat-protection logic.

## Current state

| Chapter | Art and context | Joe's loss dialogue |
| --- | --- | --- |
| Night Order | Joe approaches with the mower on the moonlit course. Correct setting and threatening viewpoint, but art is secondary to a report layout. | Varied authored lines selected from run facts with recent-history exclusion. Product-owner, golf and turf themes are present. Dialogue is hidden when subtitles are disabled. |
| The Back Nine | Joe in the industrial mower, wrecked cart and course setting. Appropriate chase aftermath. | Randomized contextual shuffle bags, persistent history and a stable selection per run. Twelve sampled IDs were distinct. Several lines use insurance/underwriting language, which is less aligned with this request's specific themes. |
| Under the Green | Joe's scythe over the fallen player's hand in the wet/rooted underground setting. Strongest explicit victim viewpoint. | No Joe taunt. The visible scythe/cause and retry text describe the loss rather than giving Joe a line. |
| The Final Cut | Correct championship setting and tournament reel mower, but the composition reads more like a vehicle showcase than an unmistakable finishing moment. | One hard-coded line: “There. That’s the part we needed to correct.” No variation. |

## Required refinements

1. **Make the artwork dominant.** At2560×1600, Night Order's frame measures625×352px (5.4% of the viewport); the other chapters' frames measure530×364px (4.7%). At1280×720 the frames occupy17.6–20.9%; at390×844 they occupy17.3–18.5%. The three later chapters also letterbox a1672×941 image inside a16:11 desktop frame, making actual picture coverage smaller. These are compact illustrated reports, not large splash screens.

   Recommended direction: one art-led loss layout across chapters, with a wide dominant hero image, compact outcome/taunt band and persistent retry/menu actions. Target roughly half of the visible loss composition for art. On high-resolution desktops, allow the hero to grow beyond the current1120/1280px card caps. On phones, use a deliberately composed taller crop or alternate crop that preserves Joe's face, weapon and victim viewpoint; do not stretch or blindly crop the art.

2. **Use consistent image framing.** Preserve forest/brass materials and chipped corners, match frames to the picture's intended aspect ratio and remove unused letterbox bands. Keep the primary action hierarchy and chapter-specific retry behavior. Night Order currently titles the report above its art, whereas later chapters title it beside the art; standardize that hierarchy.

3. **Strengthen Final Cut's defeat storytelling.** Its existing scene establishes the machine and location, but Joe and the lethal cutting bank should more clearly bear down on the fallen player's viewpoint. Under the Green is the strongest reference for readable character/weapon/victim staging. This can remain non-graphic and use the approved high-resolution pixel-art style. Retain each chapter's specific weapon and environment; do not substitute the same mower everywhere.

4. **Give every chapter a themed, non-repeating taunt pool.** Under the Green needs a pool; Final Cut needs its fixed quote replaced by one. Preserve Night Order/Back Nine's existing variety and repeat protection. Prefer complete authored lines, with chapter-specific references: mower/fairway in Night Order, cart/velocity in Back Nine, roots/scythe/drainage below the green, reels/final review in Final Cut. Review insurance-heavy Back Nine lines against the requested product-owner/golf/grass voice.

   Select once when the loss is recorded, retain it while the screen is open, and avoid recent repeats across retries. A shared presentation/selection contract can support separate chapter pools without showing cart or scythe lines in the wrong setting.

5. **Give Joe's taunt the same prominence everywhere.** Night Order places it beneath the image with a tone label; Back Nine uses a boxed product-owner label beside the art; Final Cut has an unattributed fixed quote and another prose paragraph; Under the Green has none. Use a consistent small Joe label plus a prominent one- or two-line quote near the image. Put one useful retry tip beneath it and fold detailed reports away. Decide consistently whether these are visual loss-screen quotations or subtitle-controlled dialogue; current behavior differs.

## Meaning of expressions

The review treats expressions primarily as Joe's spoken/written remarks. If facial expressions are also intended, the active splash illustrations currently have fixed faces. Dialogue entries contain expression/tone metadata in places, but that does not swap the faces in the active splash artwork. Facial variation would require authored image variants or an intentionally integrated portrait treatment; changing a tone label alone would not satisfy it.

## Performance direction

Use cached static images and select one quote per defeat. No continuous redraw, animated facial rig, extra WebGL scene or new lighting is necessary. Larger artwork should use appropriately sized compressed assets, predecoded before display where practical. No performance benchmark was run during this read-only review. Preserve the approved intro animation and lead-in.

## Source references

- `web/game.js`: `selectJoeCaptureDialogue()`, `responsiveResultPresentation()` and `drawDefeat()`.
- `web/defeat-dialogue.js`: contextual pools and `createDefeatPicker()`; `web/back-nine.js` consumes the result once per mode transition.
- `web/under-green.js`: caught-state UI and retry copy; no taunt picker or quote element.
- `web/final-cut.js`: hard-coded `loss-quote` and static `FINAL_CUT_ART.loss`.
- `web/game-theme.css`: caught-state grid and16:11 art frames; Night Order's result canvas uses16:9.
