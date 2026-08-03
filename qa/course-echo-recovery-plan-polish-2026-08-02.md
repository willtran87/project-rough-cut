# Course Echo recovery-plan polish — 2026-08-02

## Scope

Refine the existing Course Echo Rematch File after a score loss so the exact deficit becomes an actionable next-run plan. This pass does not add a mechanic, alter scoring, change Joe, or add a result action.

## Implementation

- Ranked only score opportunities supported by the completed run:
  - bank an available Change Request;
  - reclaim missing golf balls;
  - bait bunkers that did not score;
  - recover stealth score lost during the run;
  - use faster filing pace when no stronger authored opportunity remains.
- Computed effective score gains through the same base-score and Overtime rules used by the result ledger. Overtime recommendations show the incremental 1.30x value rather than the unmultiplied award.
- Kept the result hierarchy compact. The selected Rematch card carries the exact gap and recommended play, while the existing Next Action sentence remains a short statement of the win condition.
- Carried the expanded recommendation into the reopened-run bottom rail and structured Course Echo target state.

## Validation

- `output/validate-course-echo-rematch.mjs`: 16/16 assertions passed.
  - score gap, pace gap, and exact-tie targets;
  - preserved three-action result flow;
  - Echo win and no-Echo fallbacks;
  - Reduced Motion parity;
  - golf-ball, bunker, stealth, and pace recovery choices;
  - exact Overtime multiplier handling;
  - no browser or page errors.
- `output/validate-course-echo-result.mjs`: 8/8 score-first adjudication assertions passed with no browser errors.
- `node --check web/game.js` and `git diff --check` passed.

## Visual review

- 2560x1600 high-resolution score-gap result and reopened run.
- 1280x720 standard game route.
- 844x390 compact exact-tie result.
- 1280x720 Reduced Motion score-gap result.
- The initial long combined action sentence was rejected during review. Moving the recommendation into the selected action-card detail restored a clean reading order and safe margins.

## Uninstrumented gameplay client

- Reached Audit Row through the ordinary presentation handoff.
- No error artifact was produced.
- Average canvas work: 1.55ms.
- Final canvas sample: 1.40ms.
- Rendered frames: 449; adaptive skips: 2.

## Outcome

The player now receives one truthful, run-specific recovery play instead of a score number alone. The advice remains compact, honors the score-first Echo rule, and does not extend the result flow.
