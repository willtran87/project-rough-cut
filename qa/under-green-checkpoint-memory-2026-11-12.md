# Under the Green — checkpoint pursuit continuity

This pass advances review items 1, 16, 21, 22, 35 and 41. The full 44-item goal remains active.

## Reproduced cause and implemented behavior

Checkpoint 1 previously restored Joe at his authored position with the checkpoint's last-known player position, but discarded his actual observation of westward movement into the bunker. Fresh walking, wet and sprint routes all produced that observation. The reset therefore changed the encounter: Joe retraced the spillway toward an old position instead of considering the existing service-exit inspection. The dry retry had no visual contact and no time within 10 m of Joe.

The chapter save now retains an optional `bunkerRouteObserved` boolean, set only by consecutive actual sightings of movement into the bunker. A witnessed eastward reversal clears it. An unseen move cannot set or clear it. Checkpoint crossing saves a prior observation; a first observation or reversal after checkpoint 1 increments the save serial once when the value changes.

Reload and Retry checkpoint restore that knowledge at checkpoint 1, using the existing authored position, walking speed, lost-contact delay and fixed service-exit destination. They do not restore a live enemy coordinate, attack, weapon state or unseen player destination. A new chapter clears the memory; later checkpoints do not activate the bunker inspection from this flag.

The field is an additive optional part of the existing version-3 chapter payload. Legacy saves lacking it default to false, and only the boolean true is accepted. This preserves unobserved/legacy retries rather than inventing a sighting. The local serializer owns the knowledge; campaign preference storage and other chapters' progress remain independent.

The stronger restored encounter exposed a presentation problem: pump success text could hide a nearby approach warning. With pursuit captions enabled, a walking/turning Joe who has a clear sighting within 8 m now takes priority over ordinary event text and routine interaction suppression. Water recovery and immediate attack instructions remain higher priority. Disabling optional pursuit captions still works; essential attack coaching remains available.

## Route evidence

The following are phase-aware scripted pilots using ordinary movement and explicit evasions, not human completion times or enjoyment ratings.

| Checkpoint-1 retry | Elapsed | Final separation | Seconds within 10 m | Evasions |
| --- | ---: | ---: | ---: | ---: |
| No recorded observation, dry | 51.23 s | 26.08 m | 0.00 s | 0 |
| Recorded observation, dry | 51.23 s | 15.26 m | 5.53 s | 0 |
| Recorded observation, wet | 51.25 s | 12.89 m | 17.32 s | 1 |
| Recorded observation, sprint | 38.75 s | 12.57 m | 4.55 s | 2 |
| Recorded observation, steady pressure | 51.23 s | 12.53 m | 5.73 s | 0 |
| Recorded observation, relentless pressure | 51.23 s | 12.85 m | 6.90 s | 1 |

The dry route's duration stays the same while Joe makes a legitimate service-passage approach. Sprint still completes, but its scripted route now needs two evasions and encounters a different water phase. No movement-speed or water-cycle change was made.

## Verification

- `tools/verify-under-green-checkpoint-memory.mjs`: observed versus unseen entry, serialization, authored restart position, calm attack state, hidden-position independence, bounded walking, one inspection, witnessed reversal, invalid/legacy values, new-chapter reset and later-checkpoint isolation. Five restored routes complete with per-frame body/tool clearance assertions. Results: `output/under-green/checkpoint-one/memory-verified.json`.
- `tools/verify-under-green-checkpoint-memory-browser.cjs`: actual W movement creates the checkpoint record in browser storage, real reload and Retry checkpoint actions retain it, pause freezes state, Restart chapter clears it and a sibling save sentinel survives. The retry-handler test begins from a defeat fixture; physical capture remains covered separately by the core suite.
- Browser presentation covers 2560×1600, 1280×720, 844×390 and 390×844. The encounter screenshot is an actual simulated restored-route frame. The close warning replaces pump success text, respects its optional toggle, and yields to essential windup coaching. No browser errors were recorded.
- Core simulation, folded routes, navigation and rule suites pass. The general simulation save-roundtrip expectation now includes the new false-by-default field.
- The required standard client reaches ordinary gameplay with 3.84 m/s walking, no water hit and no error artifact. Latest screenshot and text state inspected.

In portrait, Joe is outside the narrow view at the captured route frame. The warning is readable and the camera remains free; this is not a claim that the enemy is automatically framed at every aspect ratio. Actual device ergonomics, sound intelligibility and unfamiliar-player fairness still need evaluation.

## Rejected experiments and remaining work

The closer-start experiment and a possible western return-channel passage were evaluated in isolated probe processes. Neither changes the shipped layout or spawn. The closer starts caused a long return around the bunker; the passage reduced that problem but did not solve the missing observation. Evidence remains in `spawn-experiment.json`, `decision-trace.json`, `return-passage-experiment.json` and `memory-experiment.json` under `output/under-green/checkpoint-one/`. These are experimental artifacts, not accepted level geometry.

Continue broader district composition and dynamic camera review, remaining Level 1 canvas/controller/profile integration, measured device performance, and unfamiliar-player/headphone/device sessions. This fix establishes pursuit continuity for witnessed retries; it does not certify the entire chapter's pacing or all 44 review items.

Final verification: the five restored routes pass body/tool clearance across 14,402 observed frames. The presentation regression also passes water phases, compact caption placement, attack priority, reduced motion and journal/results. All known test processes returned terminal; no pending test remains.
