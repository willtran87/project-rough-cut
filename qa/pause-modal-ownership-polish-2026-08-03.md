# Pause Modal-Ownership Polish — 2026-08-03

## Problem

The suspended course remained useful as visual context, but the live onboarding card, map labels, and bottom control rail were still readable around the pause panel. Players pausing to relearn controls therefore saw two instruction layers at once.

## Resolution

- Replaced the flat 72% pause wash with a center-weighted world veil.
- The veil is bounded at 80% in the central modal region and 90% around the HUD-heavy edges.
- Course silhouette, moon, and broad spatial context remain visible without letting live HUD copy compete with `ROUND SUSPENDED`.
- Resume Round remains the selected safe default.
- Objective, zone progress, Joe mode/distance, and sightline remain frozen in the contextual dossier.
- Corrected the resume description to `Continue from the exact point where the audit stopped.`
- Text state reports modal ownership, retained world context, veil treatment, and center/edge alpha.

## Verification

- `node output/validate-pause-modal-ownership.mjs` — 20/20 checks passed.
- Visual review covered 2560x1600, 1280x720, 844x390, and Reduced Camera Motion.
- The official pause capture reported `modalOwnsInstructions: true`, `worldContextVisible: true`, `centerVeilAlpha: 0.8`, and `edgeVeilAlpha: 0.9` with no browser errors.
- `web/test-actions/pause-dossier-resume.json` still completed Pause → Settings → Pause → Resume, returned to `first_hole`, cleared `pauseSnapshot`, and retained the paused Settings return target without errors.
- The full resume regression averaged 3.51ms canvas rendering with a 1.30ms final sample across 126 frames.

## Visual evidence

- `output/pause-polish-baseline-2026-08-03/shot-0.png` (before)
- `output/pause-modal-ownership-official-2026-08-03/shot-0.png` (after)
- `output/pause-modal-ownership-validation/01-high-resolution.png`
- `output/pause-modal-ownership-validation/03-compact.png`
- `output/pause-modal-ownership-validation/04-standard-reduced-motion.png`

## Follow-up boundary

Human-playtest pausing during an active close chase. If orientation becomes difficult, lower only the center veil slightly while preserving the darker HUD edges; do not reintroduce readable live instruction rails behind the modal.
