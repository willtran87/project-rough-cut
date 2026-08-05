# Compact HUD glyph normalization polish — 2026-08-05

## Problem

After the punctuation-normalization pass, the upper-left gameplay HUD still displayed `CR � +650`. The authored token is the hollow diamond `◇`, whose UTF-8 sequence was not yet included in the defensive Windows-1252 repair table.

## Implementation

Enumerated every remaining non-ASCII symbol authored in `web/game.js` and added escaped repair pairs for:

- `◇` unfiled Change Request
- `✓` completed/secured state
- `○` and `●` status circles
- `▣` card/status token
- `▼` and `▲` vertical direction
- `Ⅱ` Roman numeral
- `“` and `”` authored quotes
- `⇩` downward action marker
- `⌂` clubhouse/home marker

Both Windows-1252 punctuation-code and direct control-code interpretations are covered. No gameplay strings, collision, controls, scoring, save data, or HUD geometry changed.

## Official browser validation

Client:

`C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js`

Action route:

`web/test-actions/onboarding-route-hierarchy.json`

The 1280×720 gameplay capture reached 28 meters and showed:

- `CR ◇ +650` as one clean hollow-diamond token
- `◀ DRAIN VALVE // 76m` as one clean off-screen arrow
- Intact Hole 1 objective hierarchy, surroundings panel, Joe Attention, map, movement controls, and pause affordance
- No clipped or oversized text frames

Recursive inspection of all exported strings reported:

- Replacement characters (`U+FFFD`): `0`
- Mojibake markers (`â`, `Ã`): `0`
- Normalized icon-bearing state: `◀ DRAIN VALVE // 76m`
- Average render: `4.9 ms`
- Last render: `2.4 ms`
- Browser error artifact: absent

## Follow-up

Capture a secured Change Request to verify the `CR ✓ +650` variant in context. Keep the checked symbol if it renders correctly; do not replace it with ASCII solely for convenience.
