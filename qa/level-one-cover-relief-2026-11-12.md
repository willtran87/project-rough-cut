# Level 1 physical cover relief and observed-cover inspections

This pass advances D2/D5/D6, J3/J8, S5 and A6. The full Level 1 goal remains open.

## Delivered behavior

`course-cover-rest.js` earns presentation relief after two seconds of a stationary
crouch behind nearby cover that actually blocks Joe's line to the player. Merely
being near a prop is insufficient. Sight, audible movement, proximity, exposure,
standing/movement, interactions and competing scenes end or prevent the interval.
Pause freezes it; the same cover can provide relief on a later visit. Introductory
feedback remains limited to three distinct places and never repeats for the same
place. The old timer-based “quiet is ending” warning is removed.

Background wind/ambience, drone and music smoothly recede. Motor, reflected motor,
effects and mower category levels are unchanged. Real threat information releases
the extra audio duck immediately. Cosmetic ghosts, zone events, incidental engine
stutters and new suspense accents defer during settled cover. Natural patrol,
perception, movement and evidence-driven cover inspections remain active; this
is not an immunity zone. Existing scenes finish before a new rest interval begins.

The longer test exposed the old cover-audit trigger: private player dwell time
could send Joe to a hiding place he had never observed. `course-cover-memory.js`
now learns a nearby cover only from sight/sound/trail evidence, received within
eight seconds. It retains that observation for at most twenty seconds. Repeated
reads of the same evidence cannot count as additional observations. An actual
new observation elsewhere supersedes the cover memory; an expired memory does
not retain its old dwell/revisit count when learned again.

Audit timing/target selection use that remembered evidence, rather than current
hidden player position or private cover-use counters. Warning and investigation
carry a fixed evidence snapshot. Starting the investigation no longer raises
player detection without perception. Audible warnings use Joe's actual location
and the existing distance/material reception rule, rather than broadcasting
remote information from the target cover.

## Evidence

- `verify-course-cover-rest.mjs`: dwell, repeat entry, pause, release and
  blocked presentation at 30/60/144 Hz.
- `verify-course-cover-memory.mjs`: valid/invalid source kinds and timestamps,
  duplicate suppression, spaced observations, expiration and superseding evidence.
- `verify-course-cover-rest.cjs`: five browser groups, zero errors. Actual crouch,
  stand/strafe/re-entry and pause at a physical course cover. Final uninterrupted
  second rest lasts 14.08 seconds, with no cover audit or expiry warning. Ghost
  scheduling and cosmetic scares are suppressed. Nine controlled unsafe/interaction
  cases end relief without rewriting Joe or perception state.
- Actual Web Audio scheduled targets at full shelter: bed 0.032 → 0.0176;
  score 0.0015494 → 0.0003835; drone 0.0063818 → 0.0041482. Motor/reflection/effects/
  mower values are identical. Sight restores the original bed/score targets.
- Offline rendered ambience energy falls from 0.29873 to 0.09679 in the controlled
  comparison; at most six voices. This is audio-graph evidence, not listening approval.
- Three evidence kinds × two hidden player positions: fixed warning snapshots
  and 720 actual Joe simulation samples prove equal search paths for each pair,
  with movement occurring and no artificial detection increase. These observations
  are injected through the production perception-memory interface; this does not
  prove every possible live sensing/terrain combination.
- Screenshots inspected at 2560×1600, 1280×720, 844×390 and 390×844, including the
  introductory cue and a view across the course from cover. Initial camera faced
  nearby foliage; the fixture now faces across the course. The first movement
  revision stepped beyond the cover radius and correctly lost relief; corrected
  the intended within-cover strafe.

Passing regression checks: Audit Bell response (including offline audio), predator
evidence and actual keyboard escape, eight-zone soundscape rules, encounter
experience, tension director, checkpoint continuation, and encounter refinement
with both exit filings. The older encounter test now checks real physical cover
and no expiry warning. The director test now supplies observed cover evidence;
its old global audio-level assertion was corrected to include the pre-existing
0.8 Clubhouse soundscape bed. No runtime mix was changed to satisfy that assertion.

The installed game client ran two ordinary arrival-input iterations after the
final runtime change. Latest page/state inspected, no error artifacts. Syntax and
scoped whitespace checks pass. Artifacts: `output/course-cover-rest/`.

## Remaining work

Whole-route pacing, shelter distribution, pressure balance, human audio/fear/fun
acceptance, physical input devices and broad observed-cover acquisition cases
remain open. Other director behaviors still require the broader J8 audit.
Existing portrait letterboxing and readiness failures for
`hidden_collision_owned_by_parent_art` / `gameplay_frame_budget` remain. No
performance improvement or full-level acceptance is claimed.
