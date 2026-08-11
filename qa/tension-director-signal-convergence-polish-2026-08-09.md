# Tension Director Signal-Convergence Polish — 2026-08-09

## Finding

A review of 581 recent runtime states and the deepest available Clubhouse Crossing capture found one ambient Tension Director beat using three simultaneous phrases for the same distant approach: an environmental omen card, a directional mower-echo card, and the bottom quiet-window warning. All were truthful, but the repetition reduced suspense and obscured the more useful directional read.

## Resolution

- Added `convergedThreatCaptions()` as a presentation-only filter over the existing caption candidates.
- When `tension_omen` and `director_echo` coexist, the established category priority keeps the mower-amber directional echo.
- An unrelated danger caption remains eligible for the second ordinary field slot.
- A standalone environmental omen remains unchanged, preserving the Silent Stalk warning and other authored uses.
- `render_game_to_text` now reports candidate, visible, and suppressed keys, the complementary bottom warning when present, the no-gameplay-effect contract, and the governing rule.
- Added the `tension_director_signal_convergence` readiness check. Settled gameplay reports 54/54 passed.

No timers, caption text, scare cadence, Joe pathing, detection, audio, collision, objectives, scoring, or accessibility settings changed.

## Verification

- `node --check web/game.js`
- `node --check tools/verify-release.mjs`
- `node tools/verify-release.mjs`
- Official web-game client replay: `output/tension-signal-convergence-official-2026-08-09`
- Natural real-time input replay and responsive capture: `output/tension-signal-convergence-responsive-2026-08-09`
- Direct visual inspection at 2560x1600, 1280x720, and 800x600.

The exact 2560x1600 beat shows one `[ MOWER ECHOES ACROSS THE COURSE — AHEAD ]` field card and the complementary `THE DISTANT MOWER CHANGES PITCH` bottom rail. The synonymous grass omen is absent; the course, generated hedge and cart art, fog, route thread, map, objectives, and Joe Attention panel remain legible. The following 1280x720 and 800x600 settled frames remain centered and contained with no document overflow. Browser error capture is empty.

The natural replay recorded approximately 2.3–2.4 ms average canvas render work, 3 ms p95, 30.1 ms observed maximum, and 54/54 readiness. Presentation-frame cadence in headless responsive resizing is not treated as a gameplay benchmark; the official post-change replay remained at 60 estimated FPS with 2.66 ms average, 3.4 ms p95, 34.5 ms observed maximum, one long render frame, and no browser errors.

## Art decision

No ImageGen asset was added. The inspected generated sky, moon, fog, hedge, cart, ground, route, and course-object layers already provide a strong visual composition; the material gap was editorial hierarchy between existing signals, not missing art.
