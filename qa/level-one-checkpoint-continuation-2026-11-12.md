# Level 1 checkpoint continuation

Implemented a usable Continue path from the existing encounter rehearsal. This
advances F7/P4/P5; it is not full Level 1 acceptance.

## Behavior

- Defeat selects Continue when a recovery point exists. Restart Run remains an
  explicit fresh run. Continue shows the number of checks at the saved point and
  its unranked status. Neither option repeats the opening/tutorial sequence.
- A recovery point requires three continuous calm simulation seconds, patrol
  state, at least 110 course units from Joe, no sight/hearing/detection pressure,
  and no active distraction, inspection, ball flight/roll, aim, map, status request,
  quiet filing or exit interaction. Saves refresh at most every five seconds.
  Pausing cannot earn a save. Continued runs can earn later recovery points.
- `course-checkpoint.js` snapshots checks, access, supplies/reserves, recoverable
  balls, spent hazards, review rewards, discoveries/environment progression and
  accumulated result statistics together. Restoration makes independent copies;
  later changes cannot mutate the saved point. Transient pursuit/input/HUD and
  incomplete interactions reset. Joe resumes patrol at the saved distant location.
- Continued runs retain the existing score-record isolation. Successful real
  exit filing still records campaign paperwork and unlocks the next chapter.
  New journal discoveries persist. Ordinary unranked rehearsal/lab runs remain
  excluded from campaign receipts.
- The optional journal launcher yields to compact result controls, fixing the
  observed portrait overlap. It remains accessible from the menu and pause.

## Verification

`node tools/verify-course-checkpoint.cjs` passes five groups with no browser errors.
It rings the first bell and files the second station through keyboard input,
waits for automatic recovery points, triggers physical capture, uses the selected
Continue action with Enter, repeats after new progress, then explicitly restarts.
It checks snapshot isolation, pause, unsafe-save conditions, inventory/keys/
valve/document/hazards/recoverable balls and retained chase/result statistics.
Continued shed and drain scenarios use actual Use/filing/sealing and check the
unranked result plus stored campaign receipt and chapter unlock. New journal
persistence is checked through the game's collection routine.

These are controlled encounter fixtures: positions and optional discoveries,
supplies and prior statistics are staged. The optional status request is already
acknowledged in the fixture. The first version of the extended test failed when
that request correctly blocked the next checkpoint; it is now explicitly tested
as a save blocker. This is not an uninterrupted traversal or novice playtest.

Screenshots inspected at 2560×1600, 1280×720, 844×390 and 390×844. Initial result
captures omitted fixture asset loading; final captures wait for the result assets.
The journal overlap was observed and corrected. Continued play and victory were
also inspected. Artifacts: `output/course-checkpoint/`.

Additional passing checks:

- `node tools/verify-encounter-refinement.cjs`: eight groups including both exits.
- `node tools/verify-course-nightfall.cjs`: actual check progression, legacy
  checkpoint weather restoration, pause/comfort and shared sky behavior.
- `node tools/verify-final-cut-receipt-source.cjs`: ordinary completed paperwork,
  interrupted filing, rehearsal exclusion and downstream receipt consumption.
- Installed game client through `verify-presented-client.mjs --level-one`, two
  actual arrival-input iterations. Latest page/state inspected; no error files.
- JavaScript syntax and scoped tracked-file whitespace checks pass.

The final focused run includes the result-statistics/status-request additions.
The existing encounter/weather/receipt suites preceded those isolated snapshot
additions. The installed client was rerun afterward.

## Remaining acceptance

Recovery points are in memory for the current run, not browser-reload saves.
They restore the saved boundary, not actions earned after it. Whole-route save
frequency, all terrain/route/pressure combinations, physical controller/touch
use, score-history completeness, fairness and human retry satisfaction remain
open. Portrait letterboxing remains. Existing readiness failures for
`hidden_collision_owned_by_parent_art` and `gameplay_frame_budget` remain; this
pass makes no performance or full-course completion claim.
