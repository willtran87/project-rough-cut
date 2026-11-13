# Final Cut: Joe's encounter expressions

Progress toward FV45/FV46. The full 72-item goal remains active. This pass supplies state-driven facial artwork; it does not complete loss-screen art, garment/neck finish, whole-character Level 1 parity, or the overall rendering budget.

## Artwork and integration

Four 1254x1254 face textures were edited from the original embedded riding-model face using the built-in image_gen tool: searching concentration, attack commitment, frustration, and alarm. The original face remains the scrutiny expression. Source PNGs and the exact prompts/generator paths are preserved in `assets/enemies/joe/final-cut-expressions-v1/`; `provenance.json` records the edit target and every prompt. No source GLB or original texture was overwritten.

`tools/package-final-cut-joe-expressions.cjs` packs native pixels into lossless WebP files in `web/assets/optimized/joe-expressions-v1/`. It verifies decoded RGBA equality for every source/output pair. The four runtime files total 6,396,292 bytes. Four extra uncompressed RGBA mip chains require approximately 32 MiB of GPU storage; file compression is not GPU compression.

`web/final-cut-joe-expression.js` selects expressions from authoritative phase, phase age, capture facts, and ending age. It never reads the hidden player's position or mutates the encounter. Announcements tighten into the attack expression over 0.28 seconds; a completed attack blends into frustration over 0.18 seconds. The collapse transitions into alarm from 0.12 to 0.7 seconds and into frustration from 6 to 7 seconds. Capture selects the original scrutiny face. Searching is the default for travelling, waiting and boarding.

`final-cut-joe-finish.js` loads and uploads all four variants during startup. Two face samplers blend on the existing UVs, followed by the original face/skin blend and Level 1 material treatment. Body geometry, bones, grips, feet, headlights, attack timings and steering are unchanged. Shader uniforms and textures are reused; expression changes do not create textures or materials. All ten actor texture objects are released on disposal.

## Verification

- Native renderer: 28 views pass at 2560x1600, 1920x1080, 1280x720, 844x390 and 390x844, including front/side, ordinary encounter distance, intermediate transitions, collapse, capture and reduced motion. Pause preserves exact screenshot bytes. All sampled hand/foot errors remain under 5 cm. Warm texture/geometry counts are stable, and ten live actor texture handles become zero after disposal. No console/page errors.
- Real simulation: eight cardinal capture/escape sequences verify searching, attack commitment, frustration or scrutiny. Pause and non-mutating rendering pass. Eleven ending ages restore to exactly the same expression from snapshots.
- Source packaging: all four lossless outputs decode to identical RGBA pixels as their generated PNG sources.
- Inspected native searching/attack/frustration/alarm and the intermediate attack transition on the actual model. Face features remain registered; the different brows, eyelids and mouth are readable close up. Diagnostic close cameras are not the gameplay camera. The existing coarse neck transition and garment treatment remain unfinished.

- Software renderer: all 28 views and the same pause/reduced-motion/restoration/resource checks pass with zero errors. Actual internal sizes are 960x600 or 960x540 for desktop and native 844x390/390x844 for compact layouts. Native rendering uses all five actual viewport dimensions. Inspected the software attack face and native portrait; expression distinctions survive the lower rendering tier.
- Warm resources remain stable at 144 geometries/71 textures on native and 144/68 on software for this test's fixtures. These are stability observations, not comparable before/after timing benchmarks.
- All 48 rig-visible/rig-hidden concealment pairs pass across four cardinal approaches, near/far offsets and standing/crouched views, with casting-light shadows invalidated between renders. No errors.
- All three uninterrupted direct/garage/drain browser routes pass with four heard ball redirects, zero captures, zero errors and 77 screenshots. They cover actual input through the arrival, crossings, pump, bell, physical collapse and road completion, plus separate actual-Use record collection.
- Inspected the capture screen: its existing illustration covers the 3D actor. It confirms why the new actor scrutiny selection must not be counted as finished loss-screen art.

- Installed gameplay client exits 0. Fresh screenshot/state inspected: ready and playing at (-1.8880467, 4.7372006), actual 960x540, nine actor materials/ten textures/five expression maps, searching expression, and no error artifact. This covers the intro and real keyboard movement; dedicated close views cover facial appearance.
- Six production/test source hashes match the final snapshots. All owned packaging, simulation and browser jobs are terminal.

Artifacts: `output/final-cut/joe-expressions/`. The comparison gallery is `comparison.html`. Original pre-change scene/material sources are retained under `source/`.

## Remaining acceptance

FV46 remains in progress: the actor's capture expression is not evidence that the separate illustrated loss screen has been improved. FV61 still requires its own artwork/framing review. FV45 still needs complete close-character finish and matched Level 1 acceptance; the texture changes do not resolve coarse neck/garment joins or the existing low-detail head silhouette. Normal-distance visibility is constrained by the first-person camera and canopy; close diagnostic imagery must not be presented as ordinary gameplay framing. No sustained frame-time or software performance acceptance is claimed.
