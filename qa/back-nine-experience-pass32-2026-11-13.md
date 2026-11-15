# Back Nine pass32 — coherent chase windows and dialogue admission

Previous goal turn: progress (shared shelter choice implemented and verified). Full38-item goal remains active. This pass rejects a rendering candidate, fixes a reproduced director conflict, verifies the shared priority policy, and fixes a separate natural-route dialogue flash. No broad FPS/startup or human-playtest claim.

## Retained changes

`chase-encounter.js` now gives pressure-wave escape openings and announced gather/build-up intervals their own owners. The pressure channel may finish its own countdown; new rams, competing tension/reveals, optional dialogue and omens may not cut across it. Existing committed attacks, recovery, checkpoint/ejection protection, diversions, earned relief and interceptions retain higher priority. No collision, health, speed, turning, pathfinding, ram duration or retreat duration is changed.

Before the fix, a real update with a0.7s gather remaining, a cart at(0,95) moving8m/s and Joe at(0,77) moving16m/s produced owner=cruise, pressure=dormant, ram=lineup: a new ram cancelled the announced gather immediately. The same update now produces owner=gather, pressure=gather, ram=none. Pressure intervals still finish on their original timers, rather than being reset by their own protection.

`chase-score.js` now ducks music during gather to the same0.32 factor used for other announced warnings, leaving the machinery cue room. No new voices or audio assets. A real paired four-second offline render measures0.320000323 RMS during gather, then0.999999999995 of baseline after release; no clipping or extra nodes.

A full dry-range route then exposed a0.4s taunt. Captured state proved Joe had already lost sight0.3s earlier, but the director had not yet crossed its0.7s search threshold. This was a known pending transition, not enough space for a new line. New `dialogue-start` eligibility refuses admission while that sight loss is underway. `createChatterGate` accepts optional `canStart` (default true for all existing callers), separate from urgent interruption. Brief uncertain sight alone does not erase a line already being read. Actual search, danger and objectives retain their existing priority. No pursuit state is changed by dialogue admission.

Cache tags: director/score/message-presentation and Back Nine entry use20261113-director-priority-2. Production scene/shaders/geometry remain identical to the pass-start source.

## Verification

- `verify-chase-director-priority.mjs`:149 valid ordered priority pairs across17 named conditions; all eight channel contracts, quiet-score classification, independent hunt/tension/panic/pressure consumers, pause, and six live opening/gather timelines.15Hz presentation is explicitly substepped to the runtime's30Hz maximum physics step;30/60Hz also tested. Openings finish3.417–3.467s and gathers0.800–0.867s at sampled frame boundaries. No competing ram/windup/reveal starts within these windows.
- Existing encounter test preserves the live35.529m locked on-foot charge over175frames and289frames of earned relief. Panic, tension, utility, dialogue-budget and quiet-message suites pass. Dialogue tests include no selection/consumption during pending sight loss, readable existing-line continuity and mandatory search interruption.
- New hardware and SwiftShader browser checks use actual W/Q/pause input at2560x1600,1280x720,844x390. They verify gather/opening ownership, natural expiry, forward control, quiet banners,0.32 music duck, relief arrangement, pause/resume and reduced motion. Reproduced hidden-boundary UI stays quiet; an explicitly clear slot still displays contextual dialogue. Six views plus comfort/dialogue captures per renderer, zero errors. Selected high-resolution, compact and final client images opened and reviewed.
- Existing dialogue-budget browser suite passes six dialogue contexts, priority/cooldown behavior, actual partial repair, settings and three viewport layouts. Shared gate defaults remain backward compatible; no cross-chapter policy was changed.
- Full simulation regression:12 full/checkpoint/branch finishes, seven with a cart and five on foot, with live Joe and the existing pathing/collision assertions.
- Full normal-input dry-range branch8, seed2040914899: cart fails at70.383s; player completes both relays and garage on foot at96.050s. Repeated after the admission fix: all192 sampled cart/player/Joe/director/progression states identical. The0.4s line is absent; this intense route has no optional taunts. That is not proof of ideal dialogue frequency on quiet routes, so item33 remains partial.
- Installed standard client:three real-input bursts show gather/gather/cruise with pressure becoming active after the gather. First two audio snapshots duck0.32; third returns1. Final page/state inspected. All owned tests terminal; local server4187 retained.

Resources remain hardware20/software25 programs,40 textures,12 voices and1130 prepared buffer uploads. The production changes introduce no geometry, textures, lights, voices, per-frame node creation or render passes. No measured overall frame-time improvement is claimed.

Evidence: `output/back-nine-experience/director-priority/`, including policy.json, hardware-browser.json, software-browser.json, audio.json, full-simulation.json, full-route-final/, dialogue-route-comparison.json and client-final/.

## Rejected rendering probe

`tools/probe-chase-fog-shading.cjs` serves candidate shader source only inside its browser. It attempted to return the final fog colour before lighting fully fogged fragments, retaining alpha testing on foliage. Across seven moving views and48 alternating pairs each, six medians were slower and one equal. Baseline→candidate medians(ms): first pad36.1→39.0, second36.4→38.3, wet lane47.6→50.5, foliage55.6→58.8, mower39.9→41.2, garage37.2→38.4, open36.2→36.2. Cross-context framebuffer hashes differed in all21 sampled pose pairs, failing image acceptance too. Probe terminal1 is an expected rejection, not a production error. No candidate shader is enabled. Do not repeat without new evidence.

This does not resolve the shelter cost observed in pass31 or broad software spikes. Next investigate actual remaining workloads, including whether the existing whole-scene compileAsync still creates an unpaced cold shader burst despite paced buffer uploads. Treat that as a hypothesis to measure, not a proven cause or promised improvement.

## Scope

Item2 now has concrete shared-policy/conflict, consumer, browser/audio and full-run technical acceptance. Item33 advances but retains frequency/tone/full-route questions. Strict count21 implemented/technically verified,16 in progress,1 human-test package prepared. Human recognition/comfort/balance remain deferred under their existing items and guide. Full goal is not complete.
