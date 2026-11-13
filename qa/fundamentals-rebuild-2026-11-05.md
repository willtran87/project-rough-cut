# Rough Cut — fundamentals rebuild implementation record

Date: November 5, 2026. Ruleset: `foundation-rebuild-20261105`.

The local build now has shared movement/projection contracts, contact sliding, a steady default camera, world-anchored terrain, solid hedge/stone cover, reduced overlay density, explicit tactical choices, exit selection, two practice modes, station motion and audio output control. The earlier grades are not upgraded: this is an engineering and visual iteration, with enjoyment and device qualification still awaiting the deferred study.

## Backlog disposition

**New** means code/design work in this rebuild. **Retained** means an existing mechanic was reviewed and covered by the regression checks, not invented again. **Later** means an explicitly deferred human/device acceptance gate. None of these labels means a human acceptance criterion has been observed.

| Item | Disposition and evidence |
| --- | --- |
| M01 | New: separate movement practice with open lane, corner, angled obstacles, gap and Use marker; no campaign threat/terrain logic. No ramp, because elevation traversal is unsupported. |
| M02 | New: shared relative coordinates/projection and documented scale; terrain inverts that same projection. Exact distance/braking and orbit captures. |
| M03 | New: default bob/lean/shake off; independent saved controls; movement and perception stay authoritative. |
| M04 | New: radial movement-stick dead zone; preserve existing sensitivity, inversion and touch separation; physical-device feel is Later. |
| M05 | New: ellipse contact/tangent sliding with neighboring-obstacle checks, replacing axis priority. 63 approach cases pass. |
| M06 | New: listening speed raised to crouch pace; dominant terrain penalty blends briefly; crisp braking retained. Applied distance drives gait. Acceleration ramp rejected for the baseline pending comparison. |
| V01 | New: incremental hybrid solid-cover/ground renderer selected for the slice; baseline/current captures retained. Full depth-buffered 3D remains an alternative if later orbit evaluation rejects painter-order limitations. |
| V02 | New: thick hedge/stone footprints and real wing openings, locally mapped textures. Existing directional cart/shed artwork retained; sprites are still a limitation. |
| V03 | New: fixed material/path atlas and continuous inverse projection; collision-checked path segments, reduced fog. |
| V04 | New: quieter materials/background, no default foreground fringe, fewer labels and conditional threat panel. Four-resolution inspection. |
| V05 | New: world/presentation and art specification; applied to ground/solid cover/HUD. Final cross-asset art consistency needs visual acceptance. |
| V06 | Retained compositions: wet crossing, clubhouse/service area, maintenance enclosure, range lights and exit threshold. New paths/cover and clutter reduction improve their visibility; recognition testing is Later. A complete district-art remake is not claimed. |
| N01 | New: fixed connected path painting plus collision-checked guidance. Both exits earned by ordinary inputs. |
| N02 | New: honest thick openings, removed near-camera decorative barriers; existing playable clearances preserved and tested. |
| N03 | New: single default objective bearing; detailed routes on demand. Fixed a reproduced mud entry/escape-arrow oscillation that stalled a full run. |
| N04 | New: explicit shed/drain preference on the expanded map; actual access requirements and collision route planning retained. |
| N05 | New: facing/distance scoring and target persistence; one displayed choice owner. |
| N06 | New: direct quiet/loud, ball/blackout and cart/hedge controls for keyboard, controller and touch; posture shortcuts retained. |
| F01 | Retained lifecycle checks for aim/flight/recovery, holds, cancellation, spotting and filing; new direct-choice confirmation uses those same transitions. |
| F02 | New: bell swing, log stamp/lift and release motion on activation, with existing synchronized cues. |
| F03 | Retained directional Joe, evidence arrival/inspection and fresh-sight override; removed stationary body twitch. Human readability is Later. |
| F04 | Retained sight/facing, surface noise, tracks and capture explanation; movement and bell practice give isolated examples. |
| F05 | Retained actual evidence inspection, clean-break credit, tactical relief and receding spatial mower; no new invulnerability. |
| F06 | New: direct choices replace verbose bottom prompt, contextual threat panel and suppressed ambient scares during early learning/critical actions; existing warning expiry preserved. |
| G01 | New: bell rehearsal using real lure, bell, cover and clean-break rules. Successful ordinary-input completion verified; 60–90s human pacing/enjoyment target is Later. |
| G02 | Retained distinct bell signal, quiet/loud log and chosen final retreat; new direct controls expose the decisions. |
| G03 | Retained cover/exposure/terrain routes; new visible material families, fixed paths and exit preference make them more explicit. Human choice diversity is Later. |
| G04 | Retained wind-up, flight/landing, surfaces, recovery and Joe response, with regression checks and calmer camera. |
| G05 | Conditional item resolved by reusing the existing crossing blackout rather than adding a new tool before the slice is evaluated. No extra cooldown/collectible system added. |
| G06 | Retained ball versus armed-blackout reward and filing benefits; actual lighting/expiry and selection tested. Relative player value is Later. |
| P01 | Retained short practical move/look/chip lessons; new optional practice entry points and quieter opening presentation. |
| P02 | New: suppress ambient scares during first 18s, aim, quiet filing, interaction and pursuit; existing observation/threat/relief sequence retained. |
| P03 | New: eliminated the reproduced navigation loop and overlapping terrain penalties; existing short filing durations retained. Human travel/wait pacing remains Later. |
| P04 | Retained release commitment, selected cover, actual filing cost preview and both exits; verified full escapes. |
| P05 | Retained one-action retry and capture counterplay; new practice retries restart the same lesson, completion pauses only once. |
| P06 | Retained three distinct lighting/patrol variants and transparent pressure setting; lighting truth stays identical across comfort modes. |
| U01 | New: smaller two-line objective/inventory and contextual threat/relief; one bearing; no permanent duplicate routes. |
| U02 | New: output compressor and sampled peak diagnostics; existing priority ducking retained. Actual loudness/intelligibility is Later. |
| U03 | Retained directional/occluded mower, terrain footsteps and action cues. Physical stereo/mono/caption audition is Later. |
| U04 | New steady camera baseline; existing applied-distance gait/footstep logic verified. No movement after key release. |
| U05 | New readable direct-choice DOM controls, compact HUD and removal of overlapping legacy prompt; captures at 2560×1600, 1280×720, 800×600, 844×390. |
| U06 | New independent saved bob/lean/shake/flash/hold-toggle controls; existing buses/captions/rebinds retained. Lighting no longer changes tactical truth with reduced motion. |
| R01 | New real-rAF A/B profiler, render-cost profiler and prewarmed ground atlas. Initial regression found/fixed. Sustained 60 Hz on target devices is not yet qualified. |
| R02 | New foundation, course-renderer and practice/choice UI modules. Incremental extraction, not a complete monolith rewrite. |
| R03 | New acceptance scenes, camera/choice captures, mud-loop regression and ordinary-input bell/full-exit runs; existing suites retained. |
| R04 | Retained six optional story discoveries and persistent journal; no additional repetitive collectibles. |
| R05 | Retained variant/route comparisons, rehearsal and run export; no fresh progression grind. Voluntary retry interest is Later. |
| R06 | Later, as explicitly requested: expanded the study with movement calibration, bell encounter, direct choices and device/frame-pacing tasks. No invented participants or results. |

## Verification

- `node tools/verify-release.mjs`: 53 runtime image assets, 90 action scenarios parsed, no missing assets or warnings.
- `node tools/verify-experience.cjs`: physical movement, sensitivity/inversion, facing, practice-ball economy, five station modes and 63 collision approaches pass.
- `node tools/verify-engagement.cjs`: quiet hold/cancellation, both review rewards, simultaneous controller/touch choices, threat priority, actual blackout exposure and responsive HUD pass.
- `node tools/verify-engagement-followup.cjs`: both retreat choices, all variant lighting, inspection/fresh-sight override, journal persistence, dialog/input isolation and filing preview pass.
- `node tools/verify-rebuild.cjs`: new comfort defaults/persistence, isolated calibration, exact walk/braking, marker, radial input, direct quiet/loud choices, controller commit, selected exit and mud-loop regression pass.
- Ordinary-input Standard Review shed + hedge retreat: victory, 3 checks, key, no browser errors. Standard Review selected drain: victory, 3 checks, valve, no browser errors. Bell rehearsal: completion pause after a clean break, no errors.
- An attempted late-access drain route was captured while backtracking for access; this is recorded as a failed run, not silently counted as a success. Early explicit route selection produced the successful drain run. One scripted route is not a balance qualification.
- Installed game client: 57/57 readiness in the final opening capture; no browser errors. The readiness frame budget measures render work, not displayed frame rate.

Artifacts are under `output/rebuild/`: acceptance captures/report, final-verified-client, shed-final, drain-selected, bell-lab, profile-final and realtime. Output artifacts are local and ignored by git.

## Remaining acceptance gates

The rebuild is ready for the deferred study; it is not evidence that all 48 subjective targets are satisfied. The user must reassess movement/visual quality; novices must demonstrate route/choice understanding; physical controller/touch/audio comfort and sustained target-hardware frame pacing must be measured. The hybrid renderer still uses sprites and painter ordering. A full district-art remake, a fully depth-buffered renderer or new environmental tools should be chosen from those results, not represented as already delivered.

## Performance measurements and limits

Shared Windows host: Intel Xeon Gold 6148, headless Chromium 148.0.7778.96, 1280×720. The final real-time samples use the ordinary game loop with scripted turning and fixture positions; each scene is sampled for roughly 2.4 seconds after setup. They are short diagnostics, not a sustained hardware qualification.

| Scene | Baseline median / p95 rAF interval | Rebuilt median / p95 rAF interval |
| --- | --- | --- |
| Turn | 33.4 / 50.0 ms | 33.4 / 66.6 ms |
| Maintenance | 50.1 / 66.7 ms | 50.1 / 83.2 ms |
| Chase | 66.6 / 83.4 ms | 66.7 / 83.4 ms |
| Pause | 33.3 / 50.1 ms | 49.9 / 50.1 ms |
| Retry presentation | 33.3 / 50.0 ms | 33.4 / 50.1 ms |

**The 60 Hz target is not met on this host.** The rebuilt scene has similar median gameplay presentation here and some slower tail intervals. Do not describe it as a measured FPS improvement. It replaces asynchronous scenery updates with coherent frame-by-frame movement, which addresses a different defect. Sustained target-device profiling and further optimization remain open.

Instrumented render-only p95 was 11.8 ms for turns, 12.7 ms maintenance, 10.7 ms chase, 10.4 ms pause and 11.1 ms retry. The cold-turn maximum was 104.7 ms; warmed scenarios had no >50 ms render-work samples. These figures exclude compositor/presentation costs and cannot substitute for rAF results. Ground preparation now occurs before gameplay. The opening client sampled output peaks without clipped samples, but only a device audition and longer audio measurement can qualify the full mix.
