# Shared text-encoding presentation polish — 2026-08-05

## Problem

The source is predominantly valid UTF-8, but the lightweight local Python server returns `application/javascript` without an explicit charset. Gameplay screenshots showed several multibyte punctuation marks interpreted through Windows-1252, including `â€”` instead of one em dash.

## Implementation

- Added an ASCII-escaped replacement table so the repair logic itself is independent of script decoding.
- Covered em/en dashes, bullets, left/right/up/down arrows, directional triangles, curly apostrophes, ellipses, greater/less-than-or-equal signs, multiplication signs, and non-breaking spaces.
- Normalization runs before `drawText`, `fittedTextSize`, subtitle-card measurement, and world-marker measurement.
- `render_game_to_text` uses the same normalizer through its JSON replacer.
- Career data, settings data, gameplay state, detection, input, collision, and scoring remain unchanged.

## Official browser validation

Client:

`C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js`

Scenarios:

- `web/test-actions/keyboard_bindings_swap.json`
- `web/test-actions/cover-shred-egress-deferral.json`

### Settings

The Key Bindings modal rendered its footer as `ARROWS SELECT • ENTER REBIND • CONFLICTS SWAP`. Each separator was one bullet glyph, spacing remained even, and all help text stayed inside the bordered modal.

### Gameplay

The Audit Row evidence-search capture rendered:

- `[ JOE CHECKS A FRESH PRINT — RIGHT ]`
- `JOE FOUND YOUR BENT-GRASS TRAIL — leave the line or reach cut turf.`

Both separators were single em-dash glyphs. The evidence banner, Joe Attention panel, grounded Joe label, Field Log route, map, fog, and world objects remained correctly layered.

Parsed text state reported:

- Mode: `first_hole`
- Message: `JOE FOUND YOUR BENT-GRASS TRAIL — leave the line or reach cut turf.`
- Non-ASCII code points in that message: `U+2014`
- Average render: `3.25 ms`
- Last render: `3.1 ms`
- Browser error artifact: absent

## Follow-up

Capture an unlocked portfolio or result screen containing arrows and `×` notation. Extend the escaped mapping only if a new real screenshot demonstrates another broken sequence.
