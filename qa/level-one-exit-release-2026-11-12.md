# Level 1 physical exit release

Advances Z8/N6/N7/V7. The full Level 1 goal remains active; final-crossing
difficulty, human payoff and whole-route pacing are not established by this pass.

## Behavior and presentation

Accepted filing now has a 1.2-second release beat, previously 0.48 seconds.
Requirements, filing cancellation, completed checks, capture before acceptance,
and earned outcomes remain unchanged. The existing accepted-filing stage already
stops course time and commits the escape; this extends that visible payoff.
Existing stamp sound/caption remains. No camera movement is added.

The shed has a physical sliding bolt, housing and fixed keeper. Its bolt
withdraws before the leaf swings inward, revealing the existing warm interior.
The bolt sits above the previous handle and lock hardware.

The drain has grounded guide rails, a geared housing/interlock, cable drum,
two lifting cables and a gate carriage. Opening the remote valve disengages
the interlock; the grate stays closed until filing is accepted. During release,
the drum turns with the lift and the cables shorten between the moving carriage
and fixed drum. The selected route alone opens. The raised optional navigation
board sits above the hoist, clear of its gate/cables.

The grate now travels 0.36 m forward of the old plane, clearing the masonry
instead of passing through the arch. Real gate/carriage mesh samples retain
at least 0.060 m clearance from the frontmost masonry plane throughout the
tested poses. Gameplay collision/access coordinates are unchanged.

`course-exit-release.js` derives the pose exclusively from prerequisites,
selected route, accepted release progress and completion. This works while
course time is stopped and stays stable on pause/repeated renders. Reduced
motion and zero decorative density preserve functional movement. Mechanisms
use nine meshes, 880 triangles and one vertex-color Lambert material, without
new textures, lights or render targets. These counts do not prove frame budget.

## Verification

- `verify-course-exit-release.mjs`: prerequisites/route isolation, bolt-before-
  door timing, 101 monotonic gate poses, cable attachment, frozen pose identity,
  completed pose and exactly-once resource disposal pass.
- `verify-course-exit-mechanisms.cjs`: final hardware-requested process 98676
  exit 0 and software 85162 exit 0, five groups each, no browser errors. Actual
  E rejects locked exits, starts filing, movement cancels, retry earns release
  and both victories. Four actual release samples retain stopped course time;
  real Escape pauses/resumes release. The other exit stays closed.
- GPU geometry identities and texture counts remain unchanged through release.
  First shed opening uploads two previously unsubmitted geometries (919 -> 921);
  repeated warmed renders stay stable. The initial equality assertion failed
  on this legitimate upload and was replaced with source-inventory identity
  plus warmed stability checks, not a claim that the first opening has no cost.
  Earlier failure retained as `failure-prior-first-upload.json`.
- Actual scene reset disposes the old mechanism owner and creates a replacement.
- `verify-course-checkpoint.cjs`: 46710 exit 0, five groups including actual
  capture/Continue and both continued filing victories, receipts and unlocks.
- Existing `verify-exit-cues.cjs`: 2569 exit 0 before the final grate-clearance
  and header-placement refinement. Final focused tests cover those refinements.
- Inspected 2560x1600 shed release and drain approach/full lift; software
  1280x720 and 844x390 approach plus reduced-motion 390x844 release. The high
  drain header naturally leaves the close filing view; HUD gives the release
  instruction. Portrait letterboxing and UI density remain open. Early ready
  fixtures rendered stale prompt text after injected prerequisites; final
  fixture advances simulation before capture. Production interaction works.

Artifacts: `output/course-exit-mechanisms/{hardware,software}/`. No new human
playtest or listening results, complete fresh route, or sustained hardware
performance acceptance are claimed. The remaining authored final crossing,
zone composition, portrait presentation, player art and performance work stays
in the full scope.


Installed client21952 exited0 with two ordinary arrival iterations. Final
page-1/state-1 inspected: first_hole, no error artifacts, readiness56/57; only
gameplay_frame_budget fails. Completed software-scene p95=80.5ms. This is not an
isolated cost comparison. Final cache tag20261112-exit-release; syntax checks pass.
Next inspect actual player collision at the closed drain and its stone shoulders:
this pass proves moving-mesh/masonry separation, not player-body collision with
the drain. Its original grate was presentation geometry; the full S7 collision
requirement remains open and should be checked before final acceptance.
