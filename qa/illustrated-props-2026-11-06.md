# Original illustrated props — November 6, 2026

User request: replace more blocky scenery with the original game's high-resolution pixel-art style. This is a local implementation, not a published build or human art acceptance.

## Changes

- Full original illustrations replace surface-textured primitives for the bell, Field Log, Release Review, key, valve, carts, guide lanterns, grass cover, stone cover, pond reeds, floodlights, notice boards and boundary posts.
- The shed, drain and off-course buildings use original illustrated facades. The existing shed door and rising drain grille remain separate animated mechanisms. Drain bars are thinner, dark and rust-colored.
- Nearby trees use the complete isolated tree illustration instead of crossed rectangular crops of the distant forest. Background forest remains in its parallax layer.
- Source-resolution atlas crops preserve chipped metal, timber grain, brass, paper, foliage and ground-contact detail. No new exported images or dependencies were added.
- Fresh settings use a 1280x720 world. Existing saved resolution preferences remain effective; Controls & comfort can raise an older setting to 100%. The minimum is 640x360. Native HUD resolution is unchanged.
- Station activation has a brief rock/warm tint and persistent completion seal. Key collection hides its art; practice and valve completion show their seals. Authoritative door/grille state remains live.

## Rendering contract

`web/illustrated-props.js` anchors upright camera-facing cards in the existing perspective world. Building facades stay fixed. Cart art selects among four original directions with hysteresis, while projected width follows the unchanged box hull; ellipse cover width follows its unchanged hull. This deliberately uses 2.5D illustrated props. It supersedes the earlier solid-cart description and does not provide continuous volumetric detail inside a sprite. Gameplay collision and sight tests still use authored hulls rather than image alpha.

Movement, navigation, aiming, target selection and physical obstacle coordinates are unchanged. The five-layer parallax background remains active, including Pause/reduced-motion handling. `?art=smooth` retains the previous primitive-art comparison.

## Verification

- `node tools/verify-illustrated-props.cjs`: nine groups pass, no browser/WebGL errors. Checks original asset readiness, 15 principal prop families, four cart directions, four Joe directions, scene-resolution rebuilds, four viewports, ordinary-input strafe parallax, full-turn continuity and paused/reduced-motion cloud drift.
- `node tools/verify-spatial.cjs`: 12 checks pass, including physical scale, immediate movement/release, mouse/controller/touch look, pitch, ball flight, ordinary bell Use, paused-menu repaint and saved settings; no browser errors.
- `node tools/verify-quality.cjs`: 16 checks passed during this art pass, before the final reed/drain/tree-only refinements. Covers authored route clearance, opening branches, targeting/Use, trajectory/rest, focus loss and HUD behavior.
- Installed web-game Playwright client rerun after final visual edits; captured image inspected. Full-page desktop and touch screenshots supplement its canvas-only output.
- `node tools/verify-release.mjs`: 53 referenced runtime image assets, 90 parsed action scenarios, no warnings/failures. This static check does not execute all 90 scenarios.
- Final visuals inspected at 2560x1600 and 844x390, with additional 1280x720 and 800x600 captures. Art evidence is in `output/illustrated-props/acceptance`; client evidence is in `output/illustrated-props/client`.

The prior smooth renderer's sustained RTX 3090 benchmark has not been repeated for this art revision or its higher fresh-default resolution. Human playtests remain prepared for later, as requested. No claim of universal 60 FPS or player acceptance.
