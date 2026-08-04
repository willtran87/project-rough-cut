# Clock Out state-parity polish — 2026-08-03

## Scope

This pass aligns the Clock Out alternate ending's visible outcome, reported state, and return guidance without changing its artwork, menu destination, input behavior, career progression, saved data, or gameplay.

## Observed issue

The completed frame visibly reported `SHIFT ENDED`, `STATUS // OUT OF OFFICE`, and `LEFT UNSIGNED`, but `render_game_to_text` still exposed the Clubhouse's old `5:47 PM` assignment status. It also provided no Clock Out outcome or active return instruction, leaving accessibility and automation clients out of sync with the player-facing scene.

## Implemented

- Clock Out now assigns the authoritative status `SHIFT ENDED: Night Order left unsigned.` when selected.
- A shared input-aware helper supplies the scene's keyboard, controller, or touch return prompt.
- `render_game_to_text` now exposes the complete ending outcome, personnel state, Night Order result, consequence, active prompt, supported return inputs, pre-dawn world context, modal ownership, and Reduced Camera Motion preference.
- The existing quiet alternate-ending composition, controls, pointer target, Clubhouse handoff, and progression remain unchanged.

## Validation

- Focused validation passed 35/35 checks across 2560x1600, 1280x720, 844x390, Reduced Camera Motion, controller copy, and touch copy.
- Every scenario reported the same `shift_ended`, `out_of_office`, and `left_unsigned` outcome visible in the frame.
- Keyboard prompts returned with Escape, Enter, and Space; pointer click and touch tap also returned cleanly to the Clubhouse. Controller copy remained `A / B // RETURN` and matched its established handlers.
- All return paths cleared the Clock Out presentation state instead of leaking it into the Clubhouse.
- No scenario produced a browser error. The official client measured 3.01ms average / 0.60ms last canvas work across 71 rendered frames.

## Evidence

- `output/clock-out-state-parity-2026-08-03/shot-0.png`
- `output/clock-out-parity-validation/01-high-resolution-keyboard.png`
- `output/clock-out-parity-validation/02-standard-keyboard.png`
- `output/clock-out-parity-validation/03-compact-keyboard.png`
- `output/clock-out-parity-validation/04-standard-reduced-motion.png`
- `output/clock-out-parity-validation/05-standard-gamepad-copy.png`
- `output/clock-out-parity-validation/06-compact-touch-copy.png`
