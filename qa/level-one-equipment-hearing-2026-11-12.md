# Level 1 equipment hearing and source fidelity

Status: implemented and checked; J4/J8/S2/A4/P4 remain partial across the whole game.

## Problem and behavior

Equipment previously switched Joe to investigation regardless of distance, overwrote his remembered player position even during chase, raised the player's ongoing noise for remote impacts, and claimed every trigger successfully lured him. Tonal impact layers were centered while the noise used world-x panning.

Equipment reception now measures the real source-to-Joe distance and existing authored acoustic blockers/material transmission. Loud range is 140 course units; intensity and square-root transmission reduce it. This is an authored gameplay range, not a physical acoustic model. Heard equipment draws non-chasing Joe to its actual position; chase and active appeal commitments retain their targets. Unheard equipment still scatters and sounds locally but does not change Joe's alert, memory, detection or distraction. No equipment trigger adds persistent player noise; ordinary movement still owns that system. Messages distinguish actual investigation from continuing pursuit or an unconfirmed response.

All impact tones and noise layers now share camera-relative bearing, distance attenuation and blocker transmission. Existing effects bus/mute behavior is retained. No new audio nodes beyond the existing transient voices or continuous update work were added.

## Verification

- `node tools/verify-equipment-hearing.cjs`: eight checks pass. Controlled actual runtime tests cover far patrol, nearby source investigation, one-shot trigger, chase memory/search retention, protected appeal, an actual occluding course obstacle and crouched contact. Voice-call verification covers six tone types, every tonal/noise layer, opposite camera heading, distance and obstruction. Live audio was enabled for runtime cases; no page errors. This does not prove subjective listening quality.
- `node tools/verify-visible-hazards.cjs`: hardware pass. Final `--software` pass after removing step-carried noise; actual W/Space/rolling contact still works, resources remain fixed and coaching priority/pause passes.
- `node tools/verify-opening-walk.cjs`: final fresh UI/input route passes; cover, board and first bell, zero final detection, no page errors. No runtime state mutations in this route.
- `node tools/verify-encounter-refinement.cjs`: actual three station actions, quiet/loud release, evasion recovery, pause, four-size urgent HUD and both shed/drain victories pass. This ran before the final removal of step-carried equipment noise; that last change is directly covered by the final hearing and software contact suites.
- Installed standard Playwright client via `tools/verify-presented-client.mjs --level-one`, two iterations, final outputs `output/equipment-hearing/standard-client-final/`. Latest text shows first_hole, ready course, 26 units travel and zero failed course assets; latest full-page capture inspected.
- Release verification: 70 referenced images, 34.16 MB, 90 scenario definitions, no warnings/failures. Syntax and scoped diff whitespace checks pass.
- Inspected equipment feedback at 2560x1600, 1280x720, 844x390 and 390x844. No caption/instruction overlap in these captures. Portrait remains heavily letterboxed and is not accepted as final mobile presentation.

All verification processes are terminal. The existing development server remains available at port 4187.

## Next concrete work

`landGolfBall` ordinary (non-equipment) rest still creates a global investigation and player noise; audit that source/response path next, including normal throws during chase and field-log lure combinations. Other authored alarms and direct footstep hearing also need consistent distance/material evidence. The whole AI knowledge, sound mix, full-route pacing, visuals and human first-time/fear/fun acceptance remain incomplete. These checks do not certify the full improvement list.
