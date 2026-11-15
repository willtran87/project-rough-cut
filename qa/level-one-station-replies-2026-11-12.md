# Level 1 station animation completion

## Delivered

- Quiet Field Log filing now causes one loose page to turn over after the player retreats and the existing aftermath scheduler finds a clear interval. Loud filing causes one additional press/rebound. The existing stamped form remains completed.
- Release Review now closes its hinged hood over the upper mechanism. The completed lever, ink and lower receipt persist. The caption names the hood and leaves direction to the live sound-caption bearing.
- Replies use simulation time: 1.2 seconds for the page, .8 seconds for the stamp, and 1.1 seconds for the hood. Paper rustle starts with the turn, stamp sound occurs at .4-second contact, and the latch sounds when the hood closes. All use the existing spatial ambience bus. Pause cannot consume a pending contact sound.
- Existing retreat, danger, interaction and suspense priority remain authoritative. No new pursuit targets, collision objects, rewards or mandatory waiting. Reduced Motion shows settled page/hood results immediately and suppresses stamp travel.
- Response state and whether its sound has played are part of the existing checkpoint engagement snapshot. Older snapshots without station responses remain compatible.
- Reuses an existing loose sheet and metal hood as dynamic meshes with existing materials. No new textures, shaders or lights.

## Tests and evidence

- `node tools/verify-station-mechanisms.mjs`: passes existing filing/cancellation/contact/completion clocks and the three reply poses, repeated evaluation and Reduced Motion.
- `node tools/verify-station-replies.cjs`: passes actual keyboard filing choices, Use and retreat for all three cases. Controlled scheduler fixtures then verify ten deferral conditions each (chase, map, message, interaction owner, zone scene, sealing, tutorial, priority caption, accent cooldown and proximity), sustained clearance, exactly one response and no changes to Joe/evidence/completed actions. These are integration tests, not a full uninterrupted route playtest.
- Tests inspect actual Three.js page/hood/stamp transforms, not only derived pose telemetry. Pause and duplicate renders leave them frozen. Sound invocation occurs at the original source and expected simulation time, exactly once. Settled checkpoints restore mesh results without replaying sound. Legacy snapshots and Reduced Motion pass.
- `node tools/verify-station-mechanisms.cjs --out=output/station-replies/interactions`: existing quiet hold/cancel/success, loud contact, release lever/receipt, repeated Use, visibility and caption layout tests pass. Both browser reports contain zero errors. GPU resources stay at 75 programs and 106 textures across the action/reset/comfort cases; this is resource stability evidence, not an FPS benchmark.
- Syntax checks pass for game, renderer and prop builder. Two installed-client iterations through normal Level 1 startup/input complete in `output/station-replies/standard-client`; final caption-only source update is also checked in `standard-client-final`.
- Screenshots captured at 2560x1600, 1280x720, 844x390 and 390x844. Inspected high-resolution page motion, stamp contact and closing/closed hood, normal landscape and portrait completion views. The hood covers the gong while leaving the receipt below; the page settles across the loose papers. Caption/context blocks stay separated in the inspected views.
- Initial new harness attempted input before scene preparation finished; fixed by awaiting readiness. Another test compared negative zero to positive zero; fixed the assertion tolerance. Neither required gameplay changes. Final reply report is `output/station-replies/report.json`.

## Limits

Automated audio checks verify routing calls and timing, not subjective listening quality. No human fear/fun or physical-device acceptance is claimed. The broader Level 1 overhaul and existing full-route frame budget work remain open; this completes the requested station animation pass.
