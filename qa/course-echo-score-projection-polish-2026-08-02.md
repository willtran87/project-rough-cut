# Course Echo score-projection polish — 2026-08-02

## Outcome

Course Echo now distinguishes route pace from the actual record rule. A player can immediately understand that time describes where the saved run was at the same traveled distance, while the projected file score determines whether the record is currently being beaten. Exact time is used only when projected scores tie.

No scoring values or result rules changed.

## Presentation

- Close-race titles now explicitly say `TIME DEAD EVEN`, `TIME FINAL SPRINT`, or `TIME PHOTO FINISH`.
- The Echo card adds a right-aligned `FILE +N`, `FILE -N`, or tied-score tie-break read.
- The existing projected-grade panel reuses its bottom status line for `ECHO SCORE +N // PROJECTED`, `ECHO SCORE -N // CLOSE GAP`, or an exact tied-score tie-break.
- Active grade-change feedback remains higher priority in that panel, preserving the authored explanation for why a grade moved.
- A score deficit uses a warm warning treatment even when the player's time split is ahead.
- When scores tie, the time split increases to hundredth-second precision so the exact tie-break and the rounded pace label cannot disagree.

## Accessibility contract

`render_game_to_text` now exposes projected score, projected grade, projection route, saved record score, signed score delta, score-first result state, and `projectedRecordBeating`. Existing pace, race-phase, visibility, and deferral fields remain intact.

## Exact replay

`output/validate-course-echo-hierarchy.mjs` passed all eighteen assertions, including the previous field, hierarchy, finish, and Reduced Motion coverage plus three adversarial score cases:

1. Time ahead with a 340-point projected score gap remains a projected loss.
2. Time behind with a 240-point projected score lead remains a projected record.
3. Equal projected scores correctly use the exact time edge as the tie-break.

Browser and page logs remained error-free.

Visual evidence:

- `output/course-echo-hierarchy/11-time-ahead-score-gap.png`
- `output/course-echo-hierarchy/12-time-behind-score-lead.png`
- `output/course-echo-hierarchy/13-score-tie-pace-ahead.png`

Machine-readable assertions: `output/course-echo-hierarchy/assertions.json`.

## Required official-client route

The official opening route retained its normal non-Echo presentation and produced no browser-error artifact. Across 231 rendered frames it sampled 2.01 ms average and 2.20 ms final-frame canvas work.

All focused browser contexts were closed. The user-requested local server remains healthy at `http://127.0.0.1:4173/`.
