# Back Nine experience pass35 — readable dialogue admission

Previous goal turn: progress (localized course audio and confirmed whole-level retry policy). Full38-item goal remains active. Human playtesting stays prepared for later. This pass preserves the user’s explicit whole-level restart from the shed and separate removal of every Level2 bell.

## Reproduced problem and correction

A live-Joe reservoir-route run showed a repair response for only0.15seconds at31.233seconds: gap18.74m, cart14m/s and Joe21.28m/s. By31.383seconds Joe was17.63m away and the existing urgency cutoff correctly cancelled the line. Stable cruise ownership alone was insufficient to identify a readable dialogue opportunity.

`dialogueApproachClear` now checks closest projected separation over3.5seconds using current world headings and signed ground speeds. A new line requires at least22m of projected clearance and current/end distances within81m, leaving4m of margin around the existing18/85m interruption boundaries. It considers the actual runner when on foot and ignores look-back camera yaw. It uses no pathfinding, future input or hidden target information and allocates no objects.

Only new-line admission uses this check. Existing dialogue can continue if the projection changes; real attacks, objectives, impact, urgent captions, silence priorities and pause still cancel immediately. Suppressed offers do not consume a shuffled line or cooldown. Pursuit timing, routes, escape windows, movement, damage and visual/audio resources are unchanged. A constant-velocity estimate cannot guarantee reading time after a sudden turn, acceleration or a newly triggered event; such genuine warnings still take priority.

A paired intermediate candidate exposed another leak: a damage reaction appeared for0.05seconds after hunt changed to `signal` but before the cached encounter owner changed from `cruise`. Dialogue now reads current hunt/pressure commitments as well as the owner snapshot. The change applies only to the dialogue channels. The failed intermediate evidence is retained in `approach-intermediate/`.

## Verification

- `verify-chase-dialogue-approach.mjs`: closing/parallel/receding/crossing motion, near/far boundaries, five world orientations, runner versus abandoned-cart state, Q independence, no state mutation, lazy selection and immediate real interruption.
- Shared director regression:149priority pairs and15/30/60Hz opening/gather timelines pass.
- Existing dialogue-budget, quiet-message and100-line deck tests pass;240 persisted defeat selections retain variety.
- Extended dialogue-budget browser suite passes hardware and software. Actual UI rejects fast-closing offers without consuming storage, admits a later safe offer, preserves an active line when only prediction changes, and cancels for a physical windup. Six contexts, repair transfer/departure, pause, cooldown, objective priority and independent audio captions pass.
- Caption-priority browser suite passes both renderers: eight setting cases,18interruptions, eight layouts each at2560x1600,1280x720,844x390,390x844 and100/140% subtitle size.20hardware/25software programs,40textures; no browser errors.
- Installed standard gameplay client: two real input bursts with W/Q, actual readable Joe line plus separate engine caption, no browser errors. Final page1 and state1 inspected;14audio voices retained.
- Inspected actual high-resolution2560x1600 and portrait390x844 longest-line/140% images plus the1280x720 gameplay image. Text does not overlap its sound-caption or HUD rows. Portrait still uses the existing small letterboxed game area; no claim of improved portrait composition.

## Route evidence

Artifacts: `output/back-nine-experience/dialogue-readability/`. Route probe freezes before pressing Start for reproducibility. An explicit116.666667ms input delay reproduces the original run; this is a controlled starting condition, not a runtime change.

Final paired route comparison is recorded in `route-comparison.json`: the reproduced0.15second flash is absent;165sampled player/cart/Joe/encounter/health/music/ambience states and final physical state match exactly. Both runs finish with25health at82.3seconds. No replacement taunt was forced into this busy route. The zero-delay pair also completes after natural cart destruction and on-foot escape at88.0833seconds; it contained no Joe dialogue in either version. This is evidence of unchanged play, not of improved dialogue frequency. No mandatory line or artificial calm window has been added.

## Remaining work

Item33 remains partial: broad route/context availability and tone still need acceptance. Performance/startup and the other open requirements are not closed by a presentation-only fix. Current count remains21implemented/technically verified,16in progress,1prepared human-playtest package. Player-manipulation item13 must use meaningful non-bell course mechanisms; do not restore the explicitly removed Level2 bells. All38 requirements remain in scope.

Final on-foot route rerun (`foot-final/`) completes at88.0833seconds with177physical/audio samples and final state exactly matching baseline. All owned browser/client jobs are terminal; existing server4187 retained.
