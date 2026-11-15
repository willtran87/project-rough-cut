# Pixel detail and parallax - November 6, 2026

User request: restore more of the original illustration detail and atmosphere, keep improved movement/navigation, and bring back parallax. Implemented in the local build; no deployment or commit.

## Changes

- Five background depth layers: original sky/moon, drifting clouds, distant ridge, forest and lit clubhouse. Camera-driven parallax is continuous through turns and strafing. Pause/reduced-motion settings stop autonomous cloud drift.
- Original material crops retain source resolution, with nearest magnification and mipmapped minification. The scene slider is honored continuously: default 960x540, 640x360 at 50%, 1280x720 at 100%.
- Higher-resolution terrain painting, less muddy path centers, varied tree silhouettes, instanced low ferns/flowers, warmer station/guide glows and brass/paper details. Cart tyres/seats/supports retain appropriate distinct materials.
- Movement speed, raw look, crouch, aim, collision and authored paths are unchanged. Separate background projection/depth cannot alter Use targeting or block a route.

## Verification

`node tools/verify-atmosphere.cjs` passes eight groups. Alongside original art loading, four Joe directions, props, screen sizes and resolution/rebuild checks, it verifies ordinary strafing moves near layers more than far layers, a full turn restores each layer projection, and cloud drift freezes under Pause/reduced motion. No page, console or WebGL errors. Raw report, captures and motion video: `output/pixel-atmosphere/acceptance/`.

Visual review opened the 2560x1600 opening first, then cart/Field Log details and 844x390 touch layout; the suite also captures 1280x720 and 800x600. A six-frame contact sheet from the recorded strafe/turn sequence was inspected. The installed web-game client was run again after final changes and its screenshot inspected.

The 16-check quality suite passes, including ordinary opening routes, cart sliding, aiming and actual shot outcome, facing/visibility, focus loss and HUD/settings. Release verification passes 90 scenarios with no warnings/failures.

The earlier smooth-art RTX 3090 endurance report is historical; this pass does not claim renewed sustained FPS qualification or human comfort/art approval. Prepared human playtests remain deferred as requested.
