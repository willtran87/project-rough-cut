# Back Nine — portrait HUD and clear playfield

Partial BV47 implementation. The full 48-item visual objective remains active.

## Change

Added `web/back-nine-hud-layout.css`, linked by Back Nine HTML. At portrait widths up to620px, the live HUD uses the available vertical space: objective/tools above the unchanged16:9 canvas; status, captions and touch controls below it. The canvas retains its full width and camera aspect. Desktop and landscape use their existing layout.

- Objective and relay distance remain visible when urgent messages appear. Optional crew-log HUD count is omitted only at360px and narrower; the pause journal remains available for collected logs.
- All six touch controls fit one row, each at least44px square. Sound and Pause also have44px minimum height.
- On foot, hide the redundant empty cart-health bar and0% label; retain the wrecked-cart status. Driving retains the health bar, condition and percentage.
- Captions retain the user's scale preference and have their own rows. Tested a simultaneous warning and sound description at150% scale on320x568.
- Dread and impact effects share the canvas grid area. Fullscreen centres the layout instead of stretching individual rows; no overlay extends into the status/control areas.
- Briefing, pause, defeat and completion layouts remain governed by their existing styles when the live HUD is hidden. No simulation or renderer code changes.

## Evidence

Artifacts under `output/back-nine-visual-upgrade/hud`:

- `before`: existing presentation reproduced by intercepting only the new stylesheet with an empty response.
- `native-accepted`: final layout, ten live views plus two paused captures, native rendering. Includes2560x1600 and1280x720 keyboard desktop,390x844 keyboard portrait,844x390 touch landscape,390x844 and320x568 touch portrait, enlarged caption stress, actual touch movement, damaged cart and fullscreen.
- `software-accepted`: same final browser checks on software rendering.
- `client-native`: installed standard gameplay client using `--back-nine --minor-routes --portrait-hud --native-renderer`; two actual forward movement bursts at390x844. Player moves from(-36.5,342) through y348.857 to356.057, remaining on the footpath. Native buffer1280x720; final screenshot and both states inspected; no error artifacts.

The layout verifier checks camera aspect, header/status/caption/control separation from the playfield,44px targets, text width, no horizontal overflow, total portrait layout height, and exact canvas anchoring of dread/impact effects. It sends a browser touch-start/touch-end pair to Run and verifies player movement, then exercises Pause, Resume, Restart and fullscreen entry/exit. Caption stress text is a controlled layout fixture, not a claim that those two messages occurred simultaneously during gameplay.

At390px the unobscured canvas is388x218.25px; the full ordinary touch layout is425.64px tall. At320px the enlarged-caption fixture fits in554.61px, including the full318x178.875px canvas and controls. The optional log count yields space at this width. Desktop2560/1280 and landscape844 DOM boxes match the pre-change capture exactly; all three JPEG files are byte-identical. Both accepted browser reports pass with zero page/console errors, retaining30 native/37 software programs and53 textures across their ten live views.

Images inspected include before/after touch390, largest-caption320, high-resolution desktop, damaged-cart portrait and fullscreen. Initial candidates were rejected: a two-row control layout pushed enlarged captions below the short viewport, and default fullscreen grid stretching let effect overlays extend below the canvas. Final one-row controls, spacing and centred grid fix those issues.

## Limits

This addresses portrait occlusion, not all BV47 work: physical sign artwork, consistent UI art across the level, landscape touch refinements and broader prompt presentation still need review. It does not improve the software renderer's known low frame rate or prove Level1 parity. Arbitrarily long messages/localizations and every accessibility scale combination are not covered by these representative fixtures.
