# Final Cut illustrated story — 2026-11-13

Six original illustrations created with the built-in OpenAI image generation tool. The user's revised direction takes precedence: a believable industrial reel mower made frightening by mass, reach, repetition and harsh work lighting. No literal demonic ornaments. Joe remains a human office-clothed manager; his expression changes from controlled courtesy to satisfaction on capture and disbelief at the machine's failure.

| Source PNG | Use | Narrative purpose |
| --- | --- | --- |
| `01-final-review.png` | Chapter splash and opening frame 1 | The empty championship arena and oversized tournament mower |
| `02-joe-review.png` | Opening frame 2 | Joe's patient half-smile turns a routine review into a threat |
| `03-load-limit.png` | Opening frame 3 | The neglected drainage fault provides a way to overcome the machine |
| `04-caught.png` | Loss splash | Joe's satisfied grin; the actual capture cause and retry advice remain HTML |
| `05-ground-gives.png` | Victory frame 1 | Waterlogged turf defeats the machine; Joe loses control |
| `06-public-road.png` | Victory frame 2 and result art | The player is safely outside the boundary; Joe cannot continue the pursuit |

Sources are preserved at native generated resolution: 1672×941, except the splash at 1671×941. No upscaling, repainting or pixelation filter was applied. `tools/package-final-cut-story.cjs` produces lossless WebP runtime copies in `web/assets/optimized/final-cut-story/`; `manifest.json` records paths, dimensions and byte sizes. The six runtime files total about 14.5 MB and are loaded as needed, with only the current and next story frame retained by the story player.

The exact final prompts are in `prompts.json`. Joe's earlier capture illustration supplied the identity reference. An initial literal-demonic proposal was rejected after the user's correction; only the corrected industrial design and its matching follow-up frames are packaged here. The runtime mower was corrected to match the revised direction too.

All story captions, dialogue, buttons and accessibility descriptions are in `web/final-cut-story.js` and the chapter HTML. Text is deliberately outside the images. The sequences are illustrated cutscenes with manual advancement and a short optional reveal transition, not rendered video. Back/Next, Skip, replay, a persistent opening-skip preference, keyboard, touch and controller navigation are supported. Reduced motion disables the reveal transition.

The ending art does not invent recovered documents. Evidence-specific reporting remains in the result UI. Existing source artworks under `final-cut-ending/` are retained as historical versions.

Verification: `qa/final-cut-story-2026-11-13.md`.
