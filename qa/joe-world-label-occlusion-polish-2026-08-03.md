# Joe World-Label Occlusion Polish QA — 2026-08-03

## Scope

This pass fixes a presentation leak discovered during native-resolution review: Joe's world-state text was drawn with his depth-sorted sprite, allowing nearer obstacle art to cover only part of the label. The result looked broken and could expose fragments of Joe's mode while he was physically hidden.

## Implementation contract

- Joe and the mower remain depth-sorted with course entities.
- The compact Joe state panel renders after the entity/effects pass and uses a short tether to Joe's grounded position.
- The panel stays left of the persistent course map and inside the protected world viewport.
- Any authoritative `lineBlockedBy` value suppresses the full panel and tether.
- Listening Search retains ownership of its existing tactical signal lane.
- Patrol labels remain limited to 52 meters; active investigate, search, and pursuit states may label Joe only when he is on-screen and not physically occluded.
- `render_game_to_text` reports the same visibility decision, text, occluder, panel location/size, and presentation rule used by rendering.

## Focused automated replay

Command:

```powershell
node output/validate-joe-world-label.mjs
```

Result: 9/9 assertions passed.

Covered cases:

- Clear investigate state shows `JOE: DISTRACTED`.
- The panel is bounded to the world-safe viewport.
- The presentation reports `post_entity_grounded_panel`.
- Hard cover removes the whole label and reports the occluding object.
- Clear pursuit shows `JOE: PURSUING` with the urgent treatment.
- Distant patrol does not add visual noise.
- Compact 844x390 presentation remains intact.
- Reduced Camera Motion preserves the same information.
- All scenarios complete without browser or page errors.

## Visual review

Reviewed generated frames at:

- 2560x1600 clear sight
- 2560x1600 hard cover
- 1280x720 pursuit
- 844x390 compact layout
- 1280x720 Reduced Camera Motion

Open-sight labels read as one grounded panel beneath Joe. Covered frames contain no partial `JOE:` text, tether, or mode leak.

## Official uninstrumented client

Command:

```powershell
node C:\Users\Will\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js --url http://127.0.0.1:4173/ --actions-file web/test-actions/mature_chase.json --iterations 1 --pause-ms 120 --screenshot-dir output/joe-world-label-official-2026-08-03
```

The route stopped with the grounds cart between the player and Joe, reproducing the original risk case through ordinary game state. The screenshot showed the full cart and normal sightline-blocked feedback with no clipped Joe label. No error artifact was produced. Canvas rendering averaged 2.03ms, the last sample was 1.60ms, and 198 frames were recorded.

## Files

- `web/game.js`
- `web/README.md`
- `progress.md`
- `output/validate-joe-world-label.mjs` (ignored local validator)
