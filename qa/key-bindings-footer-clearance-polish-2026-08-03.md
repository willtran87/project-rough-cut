# Key Bindings footer-clearance polish — 2026-08-03

## Scope

This pass corrects one binding-ledger presentation defect without changing key selection, capture, conflict swaps, reserved keys, reset behavior, persistence, pointer hitboxes, Settings return targets, gameplay inputs, or control copy.

## Observed issue

The Key Bindings help footer sat at y=633 while the inner modal border ended at y=628 and the outer border ended at y=638. The small `ARROWS SELECT / ENTER REBIND / CONFLICTS SWAP` guidance visibly crossed both lines, making it appear clipped at standard and scaled resolutions.

## Implemented

- Extended only the Key Bindings panel from 556 to 580 pixels high.
- Preserved all binding rows, the status lane, reset and return buttons, and their existing pointer geometry.
- Kept the instruction baseline at y=633 inside the enlarged inner frame, giving it 19 pixels of clearance.
- Increased the footer from 10 to 11 pixels and raised its muted contrast slightly.
- Added a synchronized binding-presentation geometry contract to `render_game_to_text`.

## Validation

- Focused validation passed 29/29 checks across 2560x1600, 1280x720, 844x390, Reduced Camera Motion, controller-specific copy, and touch-specific copy.
- Enter opened capture for Move Forward; assigning A swapped Move Left to W and reported both changes.
- Escape cancelled capture, R restored defaults, and Escape returned to the Settings mix.
- The official rebind-to-gameplay route retained the swap, updated the onboarding dossier and bottom rail, dismissed the briefing, and traveled seven meters.
- No scenario produced a browser error. The resting official client measured 3.98ms average / 1.00ms last canvas work across 90 frames.

## Evidence

- `output/key-bindings-footer-polish-2026-08-03/shot-0.png`
- `output/key-bindings-footer-validation/01-high-resolution-keyboard.png`
- `output/key-bindings-footer-validation/02-standard-keyboard.png`
- `output/key-bindings-footer-validation/03-compact-keyboard.png`
- `output/key-bindings-footer-validation/04-standard-reduced-motion.png`
- `output/key-bindings-footer-validation/05-standard-gamepad-copy.png`
- `output/key-bindings-footer-validation/06-compact-touch-copy.png`
- `output/key-bindings-footer-validation/07-capturing.png`
- `output/key-bindings-footer-validation/08-conflict-swap.png`
- `output/key-bindings-gameplay-regression-2026-08-03/shot-0.png`
