# Footing recovery threat-theme polish - 2026-08-04

## Scope

This pass corrects the visual semantics of the existing full-pace recovery confirmation during pursuit. It does not change movement, detection, Joe, Contact Break, hazard geometry, timing, or scoring.

## Observed issue

The shared state banner selected red fill, border, and type whenever Joe's mode was `chase`. As a result, `FOOTING CLEAR // FULL PACE` looked like another danger even though it reported a positive recovery. The contradiction was most apparent in the 844x390 presentation, where color carries more hierarchy than text size.

## Implemented

- Added an explicit recovery-banner predicate tied to the active recovery timer and exact recovery copy.
- Recovery uses a dark green fill, mint border, and mint text even while Joe is pursuing.
- Joe's objective dossier, attention meter, `PURSUIT LOCK`, Contact Break, edge pressure, and all non-recovery chase banners retain their existing red danger language.
- Added `stateBannerPresentation.theme` values for `recovery_mint`, `danger_red`, and `field_amber`.

## Validation

- Focused gameplay validation passed 18/18 checks, including the authoritative 0.66-to-1.0 recovery, single textual owner, movement tint, pursuit focus, mint banner theme, material responses, Vertical Pass pressure, hard-cover waiting, seven traversable centers, seven bypasses, and zero browser errors.
- Responsive validation passed 40/40 at 2560x1600, 1280x720, 844x390, and 1280x720 with Reduced Camera Motion.
- Original-resolution inspection confirmed recovery remains mint while the surrounding pursuit interface stays red. The banner remains clear of the objective, Joe panel, map, reticle, Contact Break, and foreground cover.
- The official-client smoke route reached live first-person play, moved ten meters, preserved navigation and onboarding handoff, and produced no error artifact. Canvas work measured 8.60ms average / 1.70ms final across 92 frames.

## Evidence

- `output/route-pressure-validation/08-pursuit-recovery-theme.png`
- `output/route-pressure-visual-validation/01-high-resolution-footing-recovery.png`
- `output/route-pressure-visual-validation/03-compact-footing-recovery.png`
- `output/route-pressure-visual-validation/04-reduced-motion-footing-recovery.png`
- `output/recovery-theme-official-smoke-2026-08-04/shot-0.png`

## Suggested playtest tuning

Trigger full-pace recovery during a naturally acquired chase in a brighter course zone. If the recovery banner loses contrast, adjust only its mint luminance. Preserve the semantic separation between positive recovery and red pursuit pressure.
