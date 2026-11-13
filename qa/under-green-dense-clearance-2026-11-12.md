# Under the Green: full-step danger-sequence clearance

November 12, 2026. This pass changes QA only; no game runtime behavior changed.

## Method and correction

`tools/verify-under-green-dense-clearance.cjs` independently replays complete ordinary-input tapes for dry and wet routes. It verifies final mode, elapsed time, position and water hits against the pilot, and asserts consecutive snapshots are exactly one 60 Hz simulation step apart. The original pilot inspection callback omits some waits, interactions and aftermath steps; directly copying those snapshots would overstate continuous coverage. The corrected recorder includes 42 additional gate-window frames in each route.

Selected windows cover attack windup, sweep, recovery, water recovery and partial gate closure, with 60 preceding frames for pose history and 30 following frames. Ten retained close-recovery fixtures supplement the two complete routes: two standing spillway-gap cases and eight late-entry response tapes. These retained fixtures assert matching final mode and water hits. Runtime actor poses are replayed through the scene before inspecting skinned geometry, footing and camera clearance.

The initial snapshot-based run was explicitly cancelled after identifying the omission. Its incomplete artifacts remain in `output/under-green/dense-clearance`; they are not the final acceptance evidence.

## Results

Authoritative evidence is in `output/under-green/dense-clearance-final/`:

- `report.json`: 15 sequences, 1,213 checked steps, zero geometry intersections, below-floor results or page errors. Includes 93 player-recovery steps and 168 partially closed gate steps.
- 9,704 camera volumes across those steps: forward/rear, 45/85 degree FOV, desktop/portrait aspect. All clear.
- Maximum foot constraint error: 0.0000002381 m. Maximum hand constraint error: 0.0000000821 m; both below the 0.015 m threshold.
- `camera.json`: 45 representative instants, 1,620 additional camera volumes facing Joe or either side, pitch -0.85/0/+0.85, both FOV limits and aspect ratios. All clear; zero page errors.
- Six captures inspected at 2560×1600 and 390×844: pump approach, keeper control during closure, spillway recovery. Recorded player views show readable directional/recovery/closure messages and no visible camera-through-wall artifacts. Joe is outside these recorded forward views; these images do not independently demonstrate his animation quality. Actual actor/scenery clearance is supported by the mesh inspections and earlier gallery close-up captures.

Commands:

```powershell
node tools/verify-under-green-dense-clearance.cjs --output=output/under-green/dense-clearance-final
node tools/verify-under-green-dense-camera.cjs
```

Final execution sessions 11772 and 91967 exited successfully. Initial session 60645 was explicitly cancelled and observed terminal. No owned browser job remains running.

## Scope

Together with the nine-route gallery pass and earlier interaction/entrance audits, this supplies the documented authored-moment coverage requested by review item 23. It is not a proof over every possible player position or animation state. Extreme-pitch probes sample three instants per sequence; only the recorded forward/rear views are checked at every selected step.

This pass does not establish human recognition, tension, fun, physical-device fairness or sustained performance. Current-build performance qualification and unfamiliar-player evaluation remain separate outstanding work. Joe's pursuit and tension remain the user's priority.
