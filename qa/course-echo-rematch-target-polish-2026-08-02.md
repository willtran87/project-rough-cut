# Course Echo Rematch Target Polish — 2026-08-02

## Scope

Refine the existing Course Echo result-to-rematch handoff without adding a result action, panel, progression system, or gameplay advantage.

## Implementation

- Echo score losses now label Rematch File with the exact score gap and explain that a tied score still requires the faster run.
- Tied-score time losses now identify the exact hundredth-second pace gap and the score that must be held.
- Exact score/time ties now offer the two authoritative break conditions: one additional score point or at least 0.01 seconds faster.
- Echo wins and runs without an Echo retain the ordinary next Performance Stamp target.
- The selected Echo recovery target carries into the tutorial-free reopened run, including source, basis, route, record score, score gap, and pace gap. The opening banner and bottom message use the same target object shown on the result screen.
- Retry File after capture remains owned by the existing Incident Counterplan and is unchanged.

## Validation

- Targeted browser replay passed score-gap, pace-gap, exact-tie, Echo-win fallback, no-Echo fallback, Reduced Camera Motion parity, three-action preservation, Enter-to-rematch handoff, and browser-error assertions.
- Visual review covered `2560x1600`, `1280x720`, and compact `844x390` captures plus Reduced Camera Motion. New copy remained inside the existing action/detail and next-action lanes; the reopened message stayed clear of the course HUD, map, and route bearing.
- The required uninstrumented web-game client reached Audit Row through ordinary input, retained `first_hole`, all existing controls and navigation, produced no error artifact, and sampled `1.68ms` average / `2.80ms` last canvas render work across 445 rendered frames.
- All targeted browser contexts closed. Temporary validation resources are cleaned after the final process audit; the requested local server on port `4173` remains available.

## Suggested next refinement

During broader human rematch play, assess whether the score-gap coaching should additionally nominate the strongest missed score source from the completed run. Keep that as explanatory copy only unless real play shows that the current exact gap is insufficient.
