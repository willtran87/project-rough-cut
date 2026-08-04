# Starter Bell Correction-Focus Polish — 2026-08-03

## Problem

A natural Starter Bell miss displayed the full correction rail and Joe's optional subtitle at the same time. The rail already explained the aim adjustment, power adjustment, miss distance, ball state, and next choice, so the center dialogue competed with the game's first precision-shot teaching moment.

## Resolution

- A truthful active `BELL MISSED` rail now owns `practice_correction` presentation focus.
- Joe's optional subtitle, threat captions, generic Joe-state banner, and ambient context plaques yield during that short window.
- The grounded Distraction marker, Joe Attention panel, persistent map, cover geometry, route guidance, and Joe's actual investigation remain active.
- Joe dialogue becomes eligible again after the correction crosses the existing 0.75-second retirement threshold.
- Ordinary non-practice distraction dialogue retains its prior behavior.
- Renderer and text-state diagnostics now share the centralized Joe-subtitle visibility rule.

## Verification

- `node output/validate-practice-correction-focus.mjs` — 24/24 checks passed.
- `node output/validate-joe-dialogue-focus.mjs` — dialogue ownership, caption fallback, field return, and browser-error assertions passed.
- `node output/validate-practice-correction.mjs` — 11/11 miss, compound correction, retry, completion, controller, compact, Reduced Motion, and browser-error assertions passed.
- `node output/validate-golf-terrain.mjs` — all 15 terrain, collision, recovery, Reduced Motion, planner-cost, and browser-error assertions passed.
- Visual review covered 2560x1600, 1280x720, 844x390, and Reduced Camera Motion.
- The official uninstrumented replay reported `focus: practice_correction`, `practiceCorrectionVisible: true`, `joeBarkVisible: false`, and `joeBarkDeferredBy: practice_correction` with no browser errors.
- The official replay averaged 2.02ms canvas rendering with a 1.50ms final sample across 458 frames.

## Visual evidence

- `output/cover-socket-hierarchy-official-2026-08-03/shot-0.png` (before)
- `output/practice-correction-focus-official-2026-08-03/shot-0.png` (after)
- `output/practice-correction-focus-validation/01-high-resolution-correction.png`
- `output/practice-correction-focus-validation/03-compact-correction.png`
- `output/practice-correction-focus-validation/04-standard-correction-reduced-motion.png`

## Follow-up boundary

Human-playtest the first miss without prior coaching. If the compound instruction cannot be acted on before it retires, shorten only the copy or extend the existing 4.2-second rail slightly; do not restore competing subtitle cards or alter shot physics.
