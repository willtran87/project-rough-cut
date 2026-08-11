# Clean Break miss-recovery handoff polish — 2026-08-09

## Finding

A native Audit Bell replay deliberately crossed Hedge Tunnel and left its authored cover before Joe's final verification. The game correctly recorded `left_named_cover_before_expiry`, revealed `CLEAN 0/3`, put Joe into search, and handed the world and map to Field Log on the same frame. The consequence rail nevertheless used present-tense advice—`stay behind HEDGE TUNNEL until Joe's check ends`—after that check had already ended.

## Resolution

- Reframed every missed Clean Break as a retrospective cause, a short next-attempt rule, and a named recovery route.
- Leaving cover now teaches `HOLD COVER NEXT TIME`; moving or making noise teaches `HOLD STILL NEXT TIME`; an incomplete hold states `HOLD NEVER SET` and repeats the 0.9-second settle requirement.
- The current authored follow-up name is passed into the presentation, so Audit Bell recovery says `FIELD LOG CAN STILL SCORE` instead of generic `next station` copy. Later stations use their own live successor.
- Preserved the existing danger-orange miss surface, same-frame navigation refresh, minimap invalidation, mastery count, Joe search, and survival-first feedback deferral.

## Verification

- `node --check web/game.js`
- `node --check tools/verify-release.mjs`
- `node tools/verify-release.mjs`: 48 referenced assets, 87 deterministic action scenarios, no warnings or failures.
- Official web-game client with `web/test-actions/release-hardening-field-signal-breakaway.json`: 51/51 readiness, all 48 runtime assets settled, 60 estimated FPS, 3.43 ms average render work, 3.8 ms p95, 30.8 ms observed max, one long frame, no browser-error artifact.
- Native recoverable-miss replay: exact resolution selected Field Log at 344.12 meters, displayed the revised cause/rule/recovery copy, recorded one miss, and started Joe's search at 65 meters. False Retreat then deferred the lesson at 2.63 seconds while Field Log remained the active route.
- High-resolution visual inspection passed at 2560x1600, 1280x720, and 800x600. The rail stayed contained and readable without covering the objective row, Joe Attention, course map, route art, hedge, or generated station assets.

No ImageGen asset was needed for this pass because the defect was temporal language and consequence hierarchy, not missing or inconsistent world art.
