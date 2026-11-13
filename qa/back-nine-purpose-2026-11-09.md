# Back Nine purpose, place and mph

## Player experience

- Speedometer now displays mph for forward/reverse driving (14 m/s reads 31 mph). Quiet-driving copy consistently recommends below 12 mph, safely below the unchanged engine-hearing threshold. Internal simulation units remain metres/seconds.
- Main progression now has an explicit reason: drive through the maintenance relay, then the night-range relay, to restore the clubhouse service shutter. Existing checkpoint triggers, repairs and garage completion requirements are retained. Amber indicators on shelter posts become muted mint after activation; brass floor loops and relay hardware identify the stations without arrows. Indicators are mounted outside the central passage to leave Joe's roll cage clear.
- Two optional service stops: within 4.5 m of a shelter, brake below .7 m/s for 1.1 seconds. Recover its crew log and repair one extra damage point. Releasing the brake/leaving cancels the hold; full-health collection remains valid but cannot exceed maximum health. Each log/repair is once per level attempt, including checkpoint retries and reloads. Restarting the level or replaying resets them. Skipping both still permits victory.
- Logs persist with checkpoint saves and are readable in Pause, caught and completion panels. District headings, contextual opening/resume briefings and short environmental observations establish the maintenance yard, flooded night range and empty clubhouse. Optional captions yield to nearby Joe, ram windups, alarms and impact feedback.

## Art and placement

Added two abandoned maintenance yards containing five derelict carts across the level, barrel/pipe stacks, benches and wheel marks; two four-bay range shelters with tee mats, ball buckets, support cables and ground targets; a deserted members' terrace with chairs, tables, cups and papers. Fairway mowing swaths, tee markers and raked bunker details reinforce the golf-course setting.

Existing high-resolution pixel surface maps, painted sky, foliage templates, fog and palette are reused. Large new scenery is beyond the visible boundary fence; driveable lanes and Joe's navigation grid are untouched. Trees intersecting the new clearings were moved behind the structures, retaining all 140 trees. New static props use existing spatial/material batches and per-piece index culling. Only the relay/log indicator groups change visibility at runtime.

## Validation and limits

- `verify-back-nine-story.mjs`: mph conversion, both service stops, partial hold cancellation, pause freeze, one-use repairs, retry persistence, full health, moving/outside rejection, danger-caption priority and three main objectives pass.
- `verify-back-nine-story-browser.cjs`, hardware and software: mph HUD, actual brake collection, repair result, journal visibility, local-save/reload continuity and fixed shader/texture/audio resources pass. Final hardware pass also checks checkpoint-specific resume copy and both logs at small viewports with reachable Resume control.
- Existing six live-Joe winning-route simulations pass without optional log collection. Alarm simulations still pass all three distractions, evidence reacquisition and expiry. Five ram recovery/escape cases pass.
- Hardware browser regression passes keyboard, touch, gamepad, checkpoint save/reload, completion persistence, caught retry/replay and resource stability. Installed standard client completes two driving bursts; presented image/state inspected.
- Screenshots inspected at 2560x1600, 1280x720 and 844x390, covering landmarks, relay approach, optional prompt and pause journal. A scenery construction error found in the first browser run was fixed before passing verification.

Production remains 16 shader programs, 34 textures, two local lights and nine audio voices. Static batches grow from 112 to 124; paced preparation from 14 to 16 batches, still at most 2,094,984 bytes per batch. No new shadow/postprocessing/transparent-net pass.

Paired SwiftShader ABBA blocks (24 completed frames each, 960x540, same renderer) show the actual added cost and noise:

| View | Draw calls before/after | Median ms before / after (two blocks) | p95 ms before / after |
| --- | ---: | --- | --- |
| Yard | 78 / 87 | 28.8, 28.2 / 27.1, 27.2 | 42.5, 34.9 / 31.9, 35.9 |
| Range | 82 / 93 | 26.2, 26.2 / 26.1, 27.2 | 28.8, 31.8 / 32.9, 34.6 |
| Wet lane | 65 / 75 | 31.5, 31.0 / 31.6, 31.3 | 35.3, 35.1 / 37.7, 34.7 |

These are short staged samples including update, submission, GPU fence and polling. They do not establish unchanged worst-case performance, and software frame spikes remain. Human assessment of atmosphere/objective comprehension remains prepared for later.

Evidence: `output/back-nine-purpose/{hardware,software,performance}.json`, screenshots and `standard-client/`; existing route/ram/alarm reports. The paired performance script requires the preserved pre-change scene in `output/back-nine-purpose/baseline-source/`.
