# Victory Route Payoff Polish — 2026-08-02

## Scope

- Audited the current 720-meter Hole 1 victory branch reached through ordinary keyboard input.
- Strengthened the escape-route payoff without changing score calculation, progression, result actions, collision, pursuit, or filing timing.
- Bounded unusually dense score ledgers so exceptional runs cannot overlap the route and action regions.

## Changes

- Split the former single-line route summary into a prominent `DRAIN/SHED ESCAPE FILED` outcome and a quieter variant/egress detail line.
- Added a route-colored filing mark and slightly stronger ledger plate while retaining the existing drain/shed accent colors.
- Capped the visible score-event ledger at six rows. Runs with more events retain five specific entries plus an accurate `ADDITIONAL SCORE EVENTS FILED` summary, keeping all stat rows above the escape banner.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed.
- The required official browser client completed its current scripted input route with no browser error artifact. It remained in `first_hole`, sampled 1.91ms average canvas render work, and closed its browser.
- A separate input-only navigator read the same public `render_game_to_text` guidance shown to players, sent only keyboard events, and used the existing deterministic clock. It did not mutate game state, teleport the player, freeze Joe, or ship a debug hook.
- That run opened the Drain Valve, crossed all eight authored zones, completed Final Filing on its first attempt with zero cancellations, and reached `victory` at 95% course progress. Joe remained active in search 475 meters away. The settled result exposed all three actions and produced zero browser/page errors.
- Final visual review confirmed the route payoff, grade, score ledger, progression line, action descriptions, selected state, and keyboard instructions remain distinct at 1280×720.
- Evidence: `output/victory-route-payoff-polish-2026-08-02.png`.

## Process hygiene

- The temporary input navigator was removed after validation.
- All Playwright/headless browser processes were closed. The user-requested local server on port 4173 remained active.
