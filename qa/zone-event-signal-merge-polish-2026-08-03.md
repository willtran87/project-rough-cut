# Zone-Event Signal-Merge Polish QA — 2026-08-03

## Scope

Native gameplay review exposed duplicate presentation during course set pieces. The centered state banner and directional threat-caption rail could display the same full event text simultaneously, competing with movement, cover, and route guidance.

## Implementation contract

- An exact threat-caption match folds into a visible state banner rather than drawing a second card.
- The merged banner preserves direction with a compact `SOUND LEFT/RIGHT/AHEAD/BEHIND` line.
- State-banner and matching caption timers use the same 2.8-second duration.
- Independent captions remain eligible for the ordinary subtitle rail.
- If the banner is unavailable, its caption returns as an ordinary directional card.
- Disabling Threat Captions keeps the state banner and removes the directional caption line.
- A merged duplicate no longer claims the threat-caption presentation lane or defers ambient field guidance.
- Reduced Camera Motion changes no information or hierarchy.

## Focused automated replay

Command:

```powershell
node output/validate-zone-signal-merge.mjs
```

Result: 9/9 assertions passed.

Covered cases:

- Zone event merges into one directional banner.
- Duplicate caption card is fully suppressed.
- Ambient guidance lane is released.
- Independent mower caption remains visible.
- Caption fallback returns when the banner is hidden.
- Threat Captions off preserves the ordinary banner.
- Compact layout preserves the one-card hierarchy.
- Reduced Camera Motion preserves all information.
- All scenarios complete without browser or page errors.

## Visual review

Reviewed generated frames at:

- 2560x1600 merged zone event
- 1280x720 merged event with an independent caption
- 1280x720 caption-only fallback
- 844x390 compact layout
- 1280x720 Reduced Camera Motion

The merged event remains legible at the top of the world viewport, independent captions remain centered in the subtitle lane, and no duplicate full-length set-piece line is visible.

## Official uninstrumented client

Command:

```powershell
node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/mature_chase.json --iterations 1 --pause-ms 120 --screenshot-dir output/zone-signal-merge-official-2026-08-03
```

The ordinary opening route triggered the south-gate knock while the player stood near the grounds cart. The result contained one `SOUTH GATE // SOMETHING KNOCKS BACK` banner with `SOUND LEFT`, zero visible duplicate caption cards, the normal solid-cover cue, and no error artifact. Canvas work averaged 2.98ms, the final sample was 3.00ms, and 208 rendered frames were recorded.

## Files

- `web/game.js`
- `web/README.md`
- `progress.md`
- `output/validate-zone-signal-merge.mjs` (ignored local validator)
