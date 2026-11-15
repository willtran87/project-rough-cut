# Level 1 playable lessons and zone-entry priority

Status: verified implementation progress; full Level 1 goal remains active.
Previous reply restated ideas without authoritative changes. This pass recovered
the earlier lesson report from disk after its process handle was missing, then
continued implementation and reran the affected checks. No agents or deployment.

## Changes

- Both HUD paths now use the same contextual movement/look/interaction/cover/chip
  lesson selection. Looking requires actual accumulated camera rotation (yaw or
  pitch); merely observing Joe no longer counts as learning camera input.
- Successful interactions teach Use. The welcome board is available during the
  optional golf drill. Nearby readable notes and active messages take priority
  over its practice prompt, so reading the board actually displays its contents.
- Cover guidance appears only near relevant cover/rough and explains the
  difference between partial concealment and solid sight blocking. Learning
  requires .6 seconds crouched out of sight in actual cover/rough. Advanced
  Listening Focus/cadence hints wait until this basic lesson is learned and no
  current message owns the instruction rail.
- Learned interaction/cover controls persist per input device; switching devices
  starts fresh evidence counters, and Replay Lessons clears them. Guidance yields
  to danger, messages, interactions, golf aim/flight and filing. Keyboard copy uses
  current bindings and the crouch hold/toggle setting. Updated script cache keys.
- Removed an independent zone-entry path that still played Joe search sounds,
  raised his alert and forced effects despite the zone cue queue. Entry records
  visits/rewards without manufacturing sensory evidence. Introductory zone copy
  yields to current priority. The existing Water Hazard relay dim now starts with
  the paced water scene after a clear interval, retaining the dark crossing
  opportunity; it completes normally if the optional scene subsequently retires.

## Evidence

- `node tools/verify-playable-lessons.mjs`: contextual selection, genuine look
  evidence, per-device distance baseline and optional practice cases pass.
- `node tools/verify-playable-lessons.cjs`: actual W movement and horizontal/
  vertical pointer bursts, normal Use at the welcome board during practice,
  invalid Use, actual crouch with pause/resume, persistence, device change, replay,
  danger/message/disabled guidance suppression pass. No page errors. Report:
  `output/playable-lessons/report.json`.
- The original board fixture teleported inside the opening hedge. Ray inspection
  identified the close geometry as that hedge, not a misplaced beam. Replaced it
  with actual keyboard traversal from the spawn to the board's clear east side.
  This revealed and fixed the real practice-prompt priority bug. The test now
  checks displayed `.q-context` text, not just the stored message. Earlier
  `failure.*` artifacts are superseded by the final report and screenshots.
- Inspected lesson views at 2560x1600, 1280x720, 844x390 and 390x844. Board text,
  cover instruction and learned-cover feedback are visible. Portrait retains the
  existing landscape stage; no portrait redesign claim.
- `verify-zone-cue-queue.mjs` and `.cjs` pass. Added actual update crossing at the
  Water Hazard boundary and four direct boundary cases: existing message/captions
  and Joe state survive, no immediate blackout, visits counted once. Six priority
  contexts still defer the queue; a clear interval starts the water scene and its
  4.2-second relay cycle. Pause, cancellation, expiry, filing and remote request
  behavior retain their earlier checks. Updated water view inspected.
- Encounter refinement passes actual three-station mechanics, quiet/loud options,
  close escape, pause, four-size urgent HUD and both shed/drain victories. First
  impression passes actual approach, ordinary sprint-hearing interruption and
  optional observed anomaly/comfort behavior.
- Installed standard web-game client via `verify-presented-client.mjs --level-one`,
  two iterations, passes after final runtime changes. Latest `page-1.png` and
  `state-1.json` inspected in `output/playable-lessons/standard-client`: ready
  first_hole, 26 course units traveled, no failed assets or error artifacts.
  Software render size 640x360; this proves smoke behavior, not frame-time targets.
- JS syntax and scoped diff whitespace pass. Release validation reports 70
  referenced images, 34.16 MB, 90 scenario definitions, no warnings/failures.
  All test handles are terminal; existing server 4187 remains running.

## Remaining scope

O3, D6 and P1/P2 remain partial pending a complete natural novice route, physical
controller/touch validation and broader priority/pacing audit. A separate slow-
footing tutorial can replace an existing message when entering its patch; the
actual boundary test uses the real boundary rather than that unrelated patch.
Audit that tutorial's urgency/context next. Water dim still uses the existing
course-wide power function; local fixture/circuit storytelling needs review.
Human first-play comprehension, scare discovery, listening, tension and sustained
performance remain unproven. This pass does not complete the full scope ledger.
