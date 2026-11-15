# Back Nine experience — pass34, 2026-11-13

Previous goal turn made progress (pass33). Full38-item goal remains active. User explicitly confirmed this turn: **death restarts the whole level from the shed**. Human playtests remain prepared for later.

## Implemented: audible course machinery

New `web/chase-course-ambience.js` places quiet near-field hums at the four existing irrigation cabinets, two shelter chargers and the garage's actual left circuit housing. Source positions match authored objects; no added geometry, lights, signs or mandatory banners. Charger tone changes with relay power, and the garage circuit is silent until both relays are online.

The existing ambience drone oscillator/filter now crossfades into nearby machinery. A single persistent stereo panner handles heading/Q rear glance; explicit stereo input preserves the old centered signal. Smooth20–24m attenuation, actual static building/windbreak cover muffling, and continuous approach gain make these local sounds. They yield during director attack/interception/gather/tension/finale ownership, physical charge/reveal cues and within12m of Joe; suppression eases over12–30m. They do not change Joe's hearing or pathing.

`back-nine-messages.js` offers matching descriptions only through the optional sound-caption rail and only when Joe is farther than42m. Existing physical warnings/impacts/electrical events retain priority. Ordinary banners are unchanged. Muting ambience works through its existing category bus, preserving envelope continuity when changing volume.

No new audio voices, buffers, event-created nodes, timers or GPU resources. This pass began with14voices (the concurrent five-voice score had already replaced the earlier three-voice score). The new feature retains14voices and adds one panner. This is not a rendering FPS optimization.

## Verification

Evidence: `output/back-nine-experience/course-ambience/`.

- `verify-chase-course-ambience.mjs`:64rule cases, all7authored source positions, cart/on-foot Q orientation, powered-circuit gating, actual garage-wall filtering, priority/mode/range suppression, optional captions, no simulation mutation, reused output object.60,000sample calls took167ms in the final run; a microbenchmark, not a frame-rate claim.
- `verify-chase-course-ambience-audio.cjs`:16actual OfflineAudioContext cases for stereo, monotonic distance attenuation, audible but muffled cover and pause/mute/death/attack suppression; four before/after full-mix comparisons. Maximum PCM difference in unaffected far/intro/death/mower-warning cases<=7.46e-9 (floating-point equivalence, not bit identity). Mower-only warning comparison is exact. No graph allocation during180updates, retry or intro transitions.
- Existing mower suite:32rendered audio cases verify camera-relative direction/captions, distance, muffling, speed/windup progression, pause/mute, and update/retry allocation bounds. Updated its stale12voice assertion to the current14voice score and added an artifact-directory override. Evidence preserved separately in `machine-regression/`.
- Existing mixer suite:44cases plus4directions passes category isolation, live half-volume changes, opening/cart/foot/death, pause and mute. It found a real implementation bug: gating the drone by the ambience slider restarted its envelope when moving from zero. Fixed by leaving the voice lifecycle active under the category gain. Did not relax the mixer assertions. Evidence in `mix-regression/`.
- Hardware/software browser checks each12views at2560×1600,1280×720,844×390,390×844, with real W/Q, pause, mute, live ambience volume, reduced motion and warning priority. Optional captions remain in bounds. No console/page errors. Existing model/terrain unchanged. Current counts stable:14voices,12oscillators+2buffer sources,2buffers,19gains,14filters,4panners;20hardware/25software programs,40textures,1101initialbuffer uploads. Resource counts do not grow during scenes/settings/controls.
- Initial browser fixture expected the pump caption while a real zone-entry electrical event had priority; corrected the fixture to pre-mark that separately tested zone event. Another fixture read reducedMotion from the wrong state section; corrected to campaign settings. No warning priority was weakened.
- Quiet-message/defeat suite passes; no ordinary event-description banners added.
- Installed standard gameplay client, two movement/look-back bursts with sound descriptions. `client/page-1.png` and state inspected: active driving at(28,192.919), nearby pump to the right,14voices, no error artifact. Hardware high-resolution pump, ordinary software foot/charger and compact/portrait garage views inspected.

## Full-run evidence

Two normal-input live-Joe runs use seed2040914899, main and reservoir routes. Both complete with real late cart destruction and on-foot garage arrival. No invulnerability or forced destruction was added. Route states are in `natural-route/`.

- Branch0: back_nine_complete, 87.833s, cart failure70.183s; sampled audible local sources {'garage': 4}; errors[].
- Branch7: back_nine_complete, 88.567s, cart failure70.100s; sampled audible local sources {'pump-0': 1, 'shelter-0': 4, 'garage': 5}; errors[].

Samples are0.5s apart; counts are observations, not exact sound duration. The new layer is deliberately brief during pursuit. The reservoir run also exposed one existing0.7s Joe subtitle slot; broader dialogue timing remains open under33. No human listening, fear, route-recognition or difficulty result is claimed.

## Confirmed whole-level retry policy

Preserved the separately implemented full restart. The warm-retry verifier now defaults to the user's from-shed policy, retaining an explicit `--relay-checkpoint` legacy check. Added assertions for exact fresh spawn(0,14),100health/zerohits, both relays offline, both25point repair reserves, no runner/death, fresh panic/pressure state and preserved course seed. Actual R/Enter/button retries after deaths in both relay regions pass on hardware/software:12total. No intro repeat, asset requests, new scene, new audio context or buffer/texture/program reinitialization. Fresh movement works and held controls are cleared. Observed hardware retry22–71ms; software66–141ms in these fixtures, not a universal latency guarantee.

Updated the human guide for full restart, new local-sound listening tasks and historical disabled alarm-choice scenarios. Human testing remains deferred. The removed alarm/utility mechanism is still open under13; no bell restoration was made.

## Acceptance / remaining work

Item29 now has technical acceptance for existing footsteps/mower and the added environmental sources, output/priority/accessibility checks and two full routes. Human recognition/listening remains in the deferred kit. Item35's retry-policy conflict is resolved, but cold startup/stalls keep it open. Current count21implemented/technically verified,16inprogress,1human kit prepared. All38requirements remain represented.

No GPU/frame-spike improvement claimed. Remaining performance, pacing/relief, route/foot/landmark/darkness/shadow/beacon, animation, supernatural and dialogue acceptance continues. At verification, the shared import-map entries for back-nine-audio/messages use the newer concurrent `20261113-terror-2` cache tag; the new ambience module uses `20261113-course-audio-1`. Preserve those later shared edits. No commit/deployment. All owned processes terminal; local server4187 retained.
