# Course Echo result-adjudication polish — 2026-08-02

## Outcome

The After-Action Review now explains every Course Echo outcome using the same score-first rule as the game. The existing escape filing card becomes the Echo verdict when a compatible record was active, so the explanation is prominent without adding a panel, increasing result height, or delaying access to Rematch, Next Order, and Clubhouse.

## Adjudication

- Higher score: `ECHO OVERTAKEN // SCORE +N`, even if route pace was slower.
- Lower score: `ECHO HOLDS // SCORE -N`, even if route pace was faster.
- Equal score and faster time: `ECHO OVERTAKEN // SCORE TIED` with a hundredth-second time tie-break.
- Equal score and slower time: `ECHO HOLDS // SCORE TIED` with a hundredth-second time tie-break.
- Identical score and time: `ECHO MATCHED // EXACT TIE`; the existing record holds.

The stat ledger now labels the supporting row `TIME / ECHO PACE`. Score-decided outcomes explicitly describe time as pace, while tied-score outcomes use exact `FASTER`, `SLOWER`, or `EXACT TIE` language. Route filing remains in the verdict card's second line.

Normal victories without an Echo retain the authored route filing card and `TIME ON COURSE` row unchanged.

## Accessibility contract

`victoryPresentation.courseEchoAdjudication` now exposes outcome, decision basis, record score, signed score delta, exact time delta, time relation, visible headline/detail copy, and verdict color. It is `null` when no Echo participated.

## Exact replay

`output/validate-course-echo-result.mjs` passed all eight assertions:

1. Score win overrides slower time.
2. Score loss overrides faster time.
3. Tied score plus faster time wins.
4. Tied score plus slower time loses.
5. An exact score/time tie holds the record.
6. Reduced Camera Motion retains identical adjudication.
7. A normal no-Echo result retains its baseline contract.
8. Browser and page logs remain error-free.

Visual evidence:

- `output/course-echo-result/01-score-win-time-slower.png`
- `output/course-echo-result/02-score-loss-time-faster.png`
- `output/course-echo-result/03-score-tie-time-win.png`
- `output/course-echo-result/04-score-tie-time-loss.png`
- `output/course-echo-result/05-exact-tie.png`
- `output/course-echo-result/06-reduced-time-win.png`
- `output/course-echo-result/07-no-echo-baseline.png`

Machine-readable assertions: `output/course-echo-result/assertions.json`.

## Required official-client route

The official opening route retained its normal presentation and produced no browser-error artifact. Across 227 rendered frames it sampled 1.74 ms average and 1.20 ms final-frame canvas work.

All focused browser contexts were closed. The user-requested local server remains healthy at `http://127.0.0.1:4173/`.
