# Level 1 observed crossing and fair contact loss

Scope: J4/J5/J8, S4/S8 and P4 in the full Level 1 ledger. This is a perception
correction, not completion of the full experience or human fairness acceptance.

## Reproduced problem

`node tools/verify-observed-wake.cjs --baseline` reproduced a silent crossing
behind the actual start hedge. Both fixture positions are navigation-clear.
Player (-44.23,49.74), Joe (-111.77,26.26), no player noise. The old independent
crossing calculation ignored sight/hearing and built awareness despite the
occluder. During four seconds it acquired a target, approached, and eventually
obtained sight. The saved baseline ends in investigation with awareness0.624
and detection1. A first diagnostic incorrectly omitted the old update due to
CRLF matching; the matcher was corrected and the recorded baseline rerun.

The integration fixture supplies applied movement while isolating Joe's update;
it does not claim to be a natural player traversal. Actual input is covered by
the separate movement-hearing and opening-route checks below.

## Implementation

- Crossing pressure now runs inside Joe's perception update using that frame's
  actionable sight and material-attenuated hearing. It cannot independently
  discover hidden players or bypass an appeal commitment.
- A crossing stores a copied point, evidence kind and simulation timestamp.
  Target smoothing uses elapsed time. Without further contact, the target and
  evidence remain fixed and awareness decays independently of hidden position,
  movement, stance or terrain. Expiry clears the evidence and returns control
  to normal patrol/search behavior.
- Existing visible/audible approach pressure remains. Copy describes a noticed
  crossing instead of unexplained sensing. Diagnostics expose its evidence.
- Sight range and detection rate now use collision-resolved applied movement,
  matching movement noise. Holding an input against a wall does not make the
  stationary player look like a runner.
- No new assets, renderer passes, obstruction scans or audio nodes. Other
  predator tactics remain a separate audit, not implicitly fixed here.

## Verification

- `verify-observed-wake.cjs`: terminal exit0, ten groups, no page errors. Covers
  actual hedge occlusion; silent movement behind Joe; visible and audible
  acquisition; identical physical approach and decay for two hidden player
  relocations; expiry; 30/60/144Hz timing; protected appeal; blocked input; Pause.
- `verify-movement-hearing.cjs`: terminal exit0, eight groups, including actual
  keyboard walk/crouch/sprint, collision against the gate and ordinary lure
  interruption. `verify-search-memory.cjs`: terminal exit0, seven groups.
- `verify-opening-walk.cjs output/observed-wake/opening-walk`: terminal exit0.
  Fresh UI/pointer/keyboard route with no state placement reaches the first bell
  at34.9 seconds, learns move/look/interact/cover, files the check, detection0.
- `verify-encounter-refinement.cjs`: terminal exit0, eight groups, no errors.
  Actual station inputs, quiet/loud release rules, close escape, four-size HUD,
  character poses and ordinary shed/drain victories remain functional.
- Installed standard client via `verify-presented-client.mjs --level-one`:
  terminal exit0; latest page1/state1 inspected at1280x720, first_hole/travel26,
  visible path/objective/phone/caption, no error artifacts.
- Focused2560x1600 course view inspected: Joe/mower on course, gate/path and HUD
  intact. This pass changes perception, not layout. Existing portrait
  letterboxing remains open; physical devices and human visual acceptance are
  not claimed. Syntax and scoped whitespace checks pass.

Artifacts: `output/observed-wake/`. The frame-placement fixture initially failed
because Joe's old effect position made him turn away after placement; resetting
his matching effect position corrected the fixture, without weakening the sight
assertion. Saved failed diagnostics remain available.

## Remaining evidence gaps

Existing readiness failures (`hidden_collision_owned_by_parent_art` and
`gameplay_frame_budget`) occur in both the prior movement-hearing client state
and this pass. No broad readiness/performance claim is made. Prior legacy
atmosphere-suite gaps also remain.

False-retreat and cover-shred selection still consult live player state; other
authored stimuli and distant status announcements need review. Full-route
balance, near-pass terror, visual composition, audio listening and human fun
acceptance remain within the original full goal.
