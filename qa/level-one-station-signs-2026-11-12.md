# Level 1 station signs and choice continuity — November 12, 2026

Scope: V7/P1/P2 and latest brief16/17/37/38. Full goal remains active.

## Changes

Field Log and Release Review labels sat behind their projecting hoods. The Audit
Bell also hid the bottom of its label behind the crossbeam. Moved the existing
wood-backed plates onto front brackets: hooded signs at2.06m with front offset.38m;
Audit Bell at2.34m with offset.03m. Labels, backing and bracket remain fixed in the
world and rotate with their station. Existing material/geometry counts are reused;
interaction anchors, range, collision, station mechanisms and timings are unchanged.

The first candidate cleared obstruction but raised the hooded signs too far in the
close view. Lowering them onto the fascia improved framing. Crouched players can
look up with ordinary mouse input to inspect the complete sign.

Screenshot review also exposed direct choices showing the previous station's
options for up to the independent100ms refresh interval. RCRebuildUI.renderChoices
now runs with the game render (including opening-story transitions). The existing
map/tools timer remains. A button compares the live owner/options with its displayed
signature before committing; if different, it refreshes and does nothing. This
prevents an old Quiet Stamp button from committing a Release Review choice.

Sources: web/pixel-world-props.js, web/rebuild-ui.js, web/game.js. Scene/import and
HTML cache versions updated. No external deployment or commit.

## Evidence

`tools/verify-course-station-signs.cjs` instruments the actual created sign planes
before static batching, records nine world-space samples per plate and raycasts
against the actual visible opaque scene meshes. It also projects samples into the
camera and captures presented screenshots. Instrumentation exists only in the
browser test; no production QA globals or extra meshes were added.

- Before report output/course-station-signs/before:15poses,62/135 samples blocked,
  including all five Field Log and Release Review views and four Audit Bell views.
  Three actual E interactions completed. Baseline session16856 terminal0; baseline
  intentionally records failures without requiring clear signs.
- Final hardware70112 terminal0:21views,zero blocked samples,three actual E
  completions,no browser errors. Includes approach/reach/crouch/left/right for
  each station, actual mouse look-up from crouch, and actual W approach until the
  real interaction owner becomes available. At that approach point all nine sign
  samples are clear and on screen. Reset each independent walk-up scenario.
- Four-size screenshots2560x1600,1280x720,844x390,390x844. Reviewed high-resolution
  Field Log standing/walk-up, Audit Bell crouched inspection, ordinary Release
  Review and portrait Release Review. Front-mounted signs read clearly in these
  views; nearby geometry still properly occludes other objects.
- The focused stale-button test updates the actual owner from Field Log to Release
  Review, then sends the old displayed button's click in the same JS task before
  any timer can run. No station completes; labels refresh to the two retreat
  choices. A real browser click then completes only Release Review. Pause hides
  choices. This covers both synchronization and the click guard.
- Hardware before/final sampled resource counts stayed74programs/106textures.
  Resource equality is not frame-budget qualification.
- Syntax checks for changed scripts passed. Final software/mechanism/client
  results follow after their processes finish.

## Test corrections and limits

The added walk-up sequence initially reused the earlier multi-zone camera survey
state. It inherited an active remote status request; trace showed that request
owning the prompt throughout the walk past the Field Log. Independent fresh-run
setups corrected the fixture. No status-request priority or movement rule changed.
Earlier intermediate passes/failures remain diagnostic history; final report.json
and terminal result identify the qualified version.

Nine sample rays and inspected screenshots prove these tested views, not every
possible camera pose or universal pixel visibility. At very close crouched angles,
looking upward is still needed to frame an overhead sign. Human comprehension,
fun/fear/listening, physical devices and sustained whole-course performance remain
open. The broader art/atmosphere/model/pacing requirements remain in the full ledger.

## Final verification

- Hardware70112 and software19280 terminal0:21views/189samples each,zero blocked
  samples,all three ordinary W approaches reach their owner after five100ms bursts,
  all three E actions complete,stale-choice guard/fresh-click/pause pass,no errors.
  Software keyboard-approach image and corrected ordinary Release Review choices
  inspected. These are controlled setups plus actual input, not novice full runs.
- Existing verify-station-mechanisms.cjs final32228 terminal0: quiet filing press,
  cancellation,pause,loud stamp,lever,receipt,persistent ink,repeated Use and reduced
  motion all pass.74programs/106textures remain stable during these actions.
- Installed client6443 terminal0:
  node tools/verify-presented-client.mjs --level-one --url http://127.0.0.1:4187 --actions-file tools/fixtures/course-arrival-input.json --iterations 2 --pause-ms 250 --screenshot-dir output/course-station-signs/final-client
  Latest page/state inspected:first_hole,tee,Joe patrol,no error files.
  Readiness56/57; gameplay_frame_budget remains the only failed gate.
- All owned test processes terminal. Local server4187 retained; shared later
  chapter work preserved. Full implementation goal remains active.
