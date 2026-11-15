# Pixel-art restoration - November 6, 2026

**Follow-up:** the [detail and parallax pass](pixel-atmosphere-2026-11-06.md) supersedes this initial restoration, including its default resolution.

The default local build brings the original illustrated style back to the improved perspective scene. Physical routes, collision hulls, movement, aiming, interaction rules and consequences remain intact.

## Restored

- Original Joe in his dark sweater with the red push mower: front poses, side/back walking cycles and stopped investigation/search/chase poses. Direction cells preload and view thresholds use hysteresis.
- Original star field and blue treeline, illustrated leaf/stone/grass textures, weathered cart paint and shed timber. Cart and cover remain solid geometry. Trees use rooted crossed art planes.
- Nearest-neighbor world rendering; sharp monospace HUD with square panels. Default 640x360 world, 320x180 below 75% scene resolution, 1280x720 at 100%.
- Original title and result illustrations remain in use. No new image files or external assets.

## Evidence

`node tools/verify-pixel-art.cjs` passes five groups: asset decoding/WebGL health, multi-angle props, four Joe directions, four viewport captures, and resolution/scene rebuilds. It captures 2560x1600 first, then 1280x720, 800x600 and 844x390, including touch controls. Full-page captures and report are in `output/pixel-restoration/acceptance/`. Opening, oblique cart, Joe front, shed and touch screenshots were opened and inspected after the final texture revisions.

`tools/verify-quality.cjs` passes 16 checks, including ordinary traversal of both opening branches, collision sliding, aim/release/rest agreement, facing/visibility, focus loss, HUD bounds and settings. `tools/verify-spatial.cjs` passed 12 interaction/perspective checks during this pass. The installed web-game client completed again after the final changes; its screenshot was inspected. `tools/verify-release.mjs` passes 90 scenarios, with the same 53 runtime image assets and no warnings/failures.

The previous smooth-art candidate's ten-minute RTX 3090 benchmark was not repeated for this revision. These visual and behavior checks do not establish human style preference, comfort or fun. Prepared human studies remain for later, as requested. No deployment or commit.

Local preview: http://127.0.0.1:4187/ . Prior smooth-art comparison: `?art=smooth`.
