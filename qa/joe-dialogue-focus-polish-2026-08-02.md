# Joe dialogue focus polish — 2026-08-02

## Outcome

Ordinary Joe dialogue now owns the center signal lane when no higher-priority gameplay message is active. While a subtitle is visible, the duplicate generic Joe-state banner and directional threat-caption cards yield; Joe's persistent attention panel, physical world label, mower behavior, and spoken character line remain.

The arbitration sits below Final Filing, Emergency Appeal, Status Request, golf aim, landing consequences, scoring awards, pursuit, opening guidance, maneuvers, and zone arrivals. Those authored priorities therefore retain their established presentation and gameplay behavior.

When dialogue subtitles are disabled, `joe_dialogue` focus does not activate. The normal Joe-state and non-dialogue accessibility presentation remains available. The text-state contract now also includes the missing subtitles check, so `joeBarkVisible` cannot claim a hidden line is on screen.

## Validation

- `node --check web/game.js`
- `git diff --check`
- Required official browser-client route remained in live gameplay, produced no browser error artifact, and sampled 2.87 ms average canvas render work.
- Dedicated search-state replay reported `focus: joe_dialogue`, `joeBarkVisible: true`, `joeStateVisible: false`, and zero permitted threat-caption cards while retaining the authored banner/caption data for later fallback.
- The subtitle-disabled replay returned `focus: field`, hid the bark truthfully, and restored generic Joe-state visibility plus ordinary caption capacity.
- Expiring the bark returned the normal field focus without changing Joe's search state.
- Assertions: `dialogueFocus: true`, `captionFallback: true`, `returnsToField: true`, `noErrors: true`.

## Evidence

- `output/joe-dialogue-focus-validation/01-dialogue-focus.png`
- `output/joe-dialogue-focus-validation/02-caption-fallback.png`
- `output/joe-dialogue-focus-validation/report.json`
- `output/joe-dialogue-focus-official-final-2026-08-02/shot-0.png`
- `output/joe-dialogue-focus-official-final-2026-08-02/state-0.json`

Every Playwright browser context closed after validation. The existing local server on port 4173 was intentionally preserved for player testing.
