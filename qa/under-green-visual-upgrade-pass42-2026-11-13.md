# Under the Green pass 42 — connected pipe craft

Status: implementation and visual/functional/route verification complete; local native/software rendering diagnostics complete. V38 advances but remains in progress for concentrated joint staining/wetness and whole-route composition. Full 53 requirements and seven release gates remain in scope.

## Change

- New `under-green-pipe-network.js` builds four supported runs with closed cylinder ends, measured cylindrical UVs and existing close-machinery pixel materials. The west feed and horizontal header join into one run; the return meets it at the existing tee. The east turn is a continuous tangent-matched swept elbow instead of intersecting square-ended cylinders.
- Split clamps with seated hex nuts, three longer repair sleeves and three closed torn insulation shells break up the long runs. Insulation exposes a sector of corroded pipe and uses varied torn edges. Gallery supports and cross-feeds remain; seven fitted roof hangers support the pump network. Static pieces enter the existing spatial/material batching and scene geometry audit.
- Return and outlet valve housings now align along their actual pipes; the junction valve stays horizontal. Actual pump state continues to control all spindle angles.
- Three small weep sockets meet the existing drip origins. The return drip origin moves from 3.45m (inside its .31m-radius valve housing) to 3.33m at the underside. Droplet periods, water receivers, splash/ripple logic, hydraulic timing and hazards are unchanged.
- No new image textures, lamps, particles or simulation obstacles. New network construction totals 189 pre-batch pieces / 8,212 triangles before subtracting replaced pipework; this is not the net scene delta. Minimum constructed height 3.09m. Material/cell grouping introduces additional batches.

## Verification

- Pure verifier checks every built vertex/normal/UV is finite, all overhead geometry remains above 3.09m, twelve varied insulation shells are manifold and clear of the underlying pipe, and actual mesh ray hits exist at branch/elbow joins and each drip source. The ray tests establish receiver contact, not a full hydraulic topology proof.
- `pass42-pipes/{hardware,software}`: 23 views per renderer, seven before/after scenes (repair, insulation, return valve, elbow, header, gallery, pump), actual E diversion and three fully rotated spindles, pause, Q and Reduced Motion. Native 2560x1600, software 960x600 at 2560x1600 viewport; additional 1280x720, 390x844, 844x390. Zero page/console errors. Native insulation/elbow/return, software repair and native portrait elbow inspected.
- First native verifier stopped because its pump fixture was 2m away, outside the authored 1.8m interaction reach. Corrected the test camera to 1.4m; current native job45905 and software job87877 passed. No interaction rule was changed to make the test pass.
- `pass42-clearance`: dry route, 1,379 frames / 106 actual actor-tool mesh audits; no intersections, maximum foot error 2.415e-7m. Job13917 terminal0.
- Installed client `pass42-client`: five action bursts, final shot4/state4 inspected; ready/playing at (0,8.84), new pipe network present in state. Initial preparing-button five-second click timeout recovered in later action bursts. No error artifact. Job74669 terminal0.

## Resources and timing

Matched native repair fixture: 117→128 draws, 209,744→218,088 rendered triangles. Elbow: 76→86 draws, 147,416→153,836 triangles. Both retain 59 loaded textures; programs 132→133. View-dependent triangle deltas include changed batching/visibility and are not the standalone mesh addition count. Later responsive views upload other existing textures; compare matched initial fixtures rather than claiming the entire scene always contains 59.

Local budget uses six warm and 24 alternating GPU-fenced before/after samples per view. It is a small local rendering diagnostic, not ordinary real-time whole-level acceptance.

| Renderer/view | Before median / P95 ms | After median / P95 ms |
|---|---:|---:|
| Native repair,2560x1600 | 10.5 / 12.1 | 10.8 / 12.3 |
| Native elbow,2560x1600 | 8.9 / 11.1 | 9.8 / 11.7 |
| Software repair,960x600 | 75.0 / 77.5 | 78.4 / 133.4 |
| Software elbow,960x600 | 51.5 / 65.7 | 55.4 / 71.4 |

Native budget job17287 terminal0. No other verifier was observed at launch, but another chapter's software verifier was observed afterward; overlap cannot be ruled out. Treat those timings as potentially contended, not isolated performance qualification. Software budget job10351 terminal0. Other chapters had live visual verifiers at software launch, so that diagnostic is explicitly contended. The higher P95 and added batches remain concerns, not proof of acceptable performance; whole-level ordinary real-time qualification is still pending.

## Scope and artifacts

Authoritative code snapshots/hashes belong in `pass42-source`; visual evidence `pass42-pipes`, route `pass42-clearance`, installed client `pass42-client`, local budgets `pass42-budget`. The logical `visual-upgrade-local` directory remains the verified junction to D: created in pass41.

V38 remains partial: physical connections/repairs/insulation/drip origins improved, but broad rust fields still need more causal joint staining/wetness and full-route composition review. V02/V03/V06 also remain partial for whole-level material cohesion and filtering. No changes to E/Q, movement, camera mapping, Joe pursuit, checkpoints, banners or hazard rules. Ledger remains 27 implemented / 25 in progress / 1 pending; all seven full-level gates pending.

## Pause verification correction

Review of the verifier found an invalid comparison against absent `state.time`; the exposed field is `seconds`. Corrected the main verifier and added a focused controls-only mode. It now pauses after300ms of actual E-driven pump movement, requires a finite clock and an intermediate lever pose, advances600ms while paused, and checks exact clock/lever/valve/water-animation equality. Resuming2300ms must advance the clock and finish all three real valve spindles. Focused reports are retained in `pass42-controls`; this supersedes the original pause assertion without discarding the valid appearance and interaction evidence.

Both focused controls checks passed: native terminal0, software job49868 terminal0. Software final pump-active image inspected. All owned jobs for this pass are terminal; server4187 retained.
