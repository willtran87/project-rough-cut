# Level 1: weather progression through field checks

Status: verified implementation progress; the full Level 1 goal remains open.

Each completed Audit Bell, Field Log and Release Review now adds one third of a
gradual nightfall progression. Over fourteen simulation seconds, the existing
cloud banks widen and thicken, the sky darkens and distant fog becomes colder.
Cloud coverage also affects the existing moonlight estimate. The final authored
moon multiplier is bounded at 0.92 and sky multiplier at 0.78; lanterns,
floodlights, fog near/far range, collisions and detection rules are unchanged.
No flashing, extra cloud geometry, texture or shader is introduced.

Completion records are bounded to the three actual check IDs. Duplicate Use
cannot advance the weather again. Sampling is pure and uses the simulation
clock, so camera turns and repeated rendering cannot advance it. Reduced Motion
keeps cloud travel stationary while the slow weather transition remains. A
rehearsal checkpoint copies the transition timestamps and restores the same
progress; older checkpoints with only completed checks restore a settled sky.
A new run starts from the original opening atmosphere. Other chapters omit this
optional progression argument and retain their existing storm/night defaults.

## Verification

- `node tools/verify-course-nightfall.mjs`: passed continuous/monotonic sampling
  at 30, 60 and 144 Hz, accepted IDs, duplicate protection, bounded multipliers,
  fresh reset, checkpoint continuity/no aliasing and older-checkpoint fallback.
- `node tools/verify-course-nightfall.cjs`: final terminal pass, session 11138,
  no page or console errors. Actual E/2/E station inputs from controlled starting
  positions produce all three stages. The fixture advances elapsed time and
  returns to the same camera pose for comparison; this is not a novice or full
  uninterrupted route playtest. Pause is tested during the first unfinished
  transition, plus restoration through the real rehearsal function.
- Weather-only stage changes at an otherwise identical scene hold GPU resources
  at 916 geometries, 102 textures and 69 programs. Completing the Field Log first
  makes one preexisting geometry resident (915 to 916); that is separate from
  weather. Fog range remains 24 to 70. This is resource evidence, not a frame-rate
  benchmark or a claim of complete performance acceptance.
- Rendering preserves player, Joe, distraction, detection, check and weather
  state. Turning does not change moon coverage. Decorative density zero retains
  the authored sky. Shared storm/night defaults are identical before and after
  supplying/removing the Level 1 argument.
- `node tools/verify-encounter-refinement.cjs`: terminal pass, session 40708,
  actual station actions, evasion, and ordinary shed/drain filing to victory.
- `node tools/verify-haunted-course.mjs`: passed ghost timing/counterplay and
  continuous regional palette checks.
- Standard installed client via `verify-presented-client.mjs`: initial pass
  89366, final checkpoint-integration rerun54492 passed. Latest final
  full-page screenshot and state inspected: first_hole, ready, travel distance26.
- Syntax and scoped whitespace checks passed.

Actual rendered views inspected at 2560x1600, 1280x720, 844x390 and 390x844.
The four opening compositions show successively larger clouds and colder distant
color while warm path lights remain visible. Additional final-weather high-res
views cover Water Hazard, Service Maze and Release Corridor. Close ground in the
maze is still dark; ordinary-display/human readability needs acceptance. Portrait
remains heavily letterboxed. Captions in these positioned fixtures retain prior
context and are not evidence of route/HUD comprehension.

Artifacts: `output/course-nightfall/report.json`, opening/check-1/check-2/check-3
2560 screenshots, final-water/maze/release-2560 screenshots, final-1280/844/390,
and standard-client-final full-page capture/state.

## Known verification gaps

The old `verify-atmosphere.cjs` stops at its expected `original-pixel-art` label;
the current renderer identifies itself as `pixel-3d`. Its later checks did not run.
`verify-haunted-course.cjs` expects `suppressed` but observes `recovery`, and
`verify-atmosphere-return.cjs` expects a manifestation eventAnchor that is null.
Both failures repeat with the new weather input disabled using the diagnostic
runner in `output/course-nightfall/legacy-baseline.cjs` (terminal sessions18531
and6344). These are existing fixture/behavior mismatches requiring a focused
review; they have not been declared resolved or silently relaxed.

Initial new-fixture failures were test setup: waiting for renderer readiness
before entering the controlled scene, and comparing resource counts across
different station activation states. The final test starts the scene explicitly
and isolates weather changes for the GPU-resource comparison. Historical failure
artifacts remain; the final report is authoritative for this feature.

Remaining scope includes broader dramatic pacing and zone composition, stronger
art detail, search/perception behavior, responsive polish, full performance and
human fear/fun/listening/comprehension acceptance.
