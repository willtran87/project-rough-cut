# Course Records and Replay Loop Audit — July 29, 2026

## Goal

Give a successful Hole 1 escape a satisfying payoff and a reason to replay both routes without turning the live horror sequence into a constant arcade score chase.

## Implemented Loop

1. The player begins a round and the persistent player file records the attempt.
2. The game quietly tracks time, attention, pursuit, crouched traversal, resources, contact breaks, and close calls.
3. Escape produces an in-fiction after-action performance review with an S–D risk class.
4. The result is compared with the personal record for that specific route.
5. New route records are filed and surfaced on the main menu for the next attempt.

## Scoring Principles

- Base completion value: 3,000.
- Faster completion earns a declining time bonus.
- Lower maximum attention and shorter pursuit duration earn stealth value.
- Unused golf balls reward restraint and route knowledge.
- Moving carefully while crouched earns a modest composure bonus that remains smaller than the time cost, preventing an idle-score exploit.
- Contact breaks and genuinely close escapes provide capped recovery bonuses.
- The live HUD never displays a running score.

## Verified Evidence

| Requirement | Evidence | Result |
| --- | --- | --- |
| Legitimate scored escape | Input-driven shed route completed in 14.48 seconds with one ball remaining and no formal pursuit | Pass |
| Result calculation | Final result reported score 6,290, grade A, full breakdown, and `newBest: true` | Pass |
| Visual scorecard | Reviewed at 1280×720 with route, grade, score, time, attention, pursuit, close calls, resources, and controls visible | Pass |
| Record creation | First shed completion created a route record and surfaced it on the main menu | Pass |
| Record protection | A later 6,291-point run did not replace a seeded 9,000-point S record | Pass |
| Persistence | Career record remained intact after browser reload | Pass |
| Capture tracking | Deliberate exposed sprint produced defeat, one capture, and persisted the denial count after reload | Pass |
| Attempt tracking | Survival-briefing dismissal increments rounds exactly once per reset | Pass |
| Responsive presentation | Scorecard checked at 800×600 and 2560×1600; document dimensions matched viewport dimensions | Pass |
| Runtime stability | Targeted browser runs and project Playwright client produced no page or console errors | Pass |

## Replay Hooks Now Present

- Separate shed and drain personal records.
- S–D risk grades with route-colored scorecards.
- New-record callout and title-screen record visibility.
- Persistent round, escape, and capture history.
- Capped reward for breaking a close pursuit.
- Resource-preservation incentive that makes golf-ball use a meaningful tradeoff.
