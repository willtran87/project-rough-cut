# Level 1: Audit Bell silence and answer

Status: implementation progress, not full Level 1 completion. No human listening,
fear, fun, novice-route or physical-device acceptance claimed.

## Player experience

After completing the Audit Bell and retreating, a clear interval can trigger a
2.6-second environmental hush. Existing environmental voices fade away and new
motifs wait. The actual Audit Bell then swings and sounds once, with a caption
anchored to its location. The environmental bed and music recover afterward.
Joe, direct danger audio, player input, detection and completed checks remain
active. This extends the existing deferred aftermath rather than adding another
independent scare.

The sequence waits for distance, safe clearance and a free presentation interval.
Danger, map/aim/interaction, messages, another zone scene, tutorial, exit sealing,
expired source or return to the station cancel a started hush. Cancellation
restores the mix and cannot replay the event. Pause freezes the clock; reduced
motion suppresses the answering swing while retaining sound and caption.

## Evidence

- `node tools/verify-audit-response.mjs`: passed. Deferred one-shot source copy,
  pause, hush, answer, comfort, restoration and interruption behavior.
- `node tools/verify-audit-response.cjs`: terminal pass (session 56327), no page
  errors. Controlled starting fixture followed by actual E activation and
  keyboard/pointer retreat; one hush/answer, pause/resume, persistent source,
  physical bell pose, repeated-render stability and return to normal ambience.
  Nine interruption fixtures preserve Joe, distraction, player evidence and checks.
- Actual OfflineAudioContext rendering: hush retires ongoing radio/environmental
  voices; total energy 0.0333 versus 0.3082 baseline, tail after 0.8 seconds zero.
  This measures the audio graph, not perceived loudness or listening quality.
- `node tools/verify-encounter-experience.cjs`: terminal pass (92906). All three
  aftermaths, sustained clearance, map/aim/filing/danger priority, timers, shelter
  relief, and spatial bell/paper audio remain verified. Audit-specific fixtures
  now advance through the intended quiet interval. A stale expectation that a
  new remote status request steals the local timer was corrected to match the
  existing `statusRequestCanIssue` rule; it now checks the request remains unissued.
- `node tools/verify-encounter-refinement.cjs`: terminal pass (38029), including
  ordinary shed and drain filing/sealing to victory.
- `node tools/verify-course-soundscape.cjs`: terminal pass (81743), all eight
  profiles including the silent Dead Green.
- Standard installed gameplay client via `verify-presented-client.mjs`, arrival
  fixture, two iterations: terminal pass (66206). Latest page/state inspected:
  first_hole, 26 travel distance, no generated error log.
- Syntax and scoped whitespace checks passed.

Artifacts: `output/audit-response/report.json`, quiet/answer retreat views,
`answer-bell-2560.png`, `answer-1280.png`, `answer-844.png`, `answer-390.png`, and
`standard-client/page-1.png`. Inspected actual rendered views at 2560x1600,
1280x720, 844x390 and 390x844. The lit bell, caption and completed station remain
legible. Portrait retains the existing heavily letterboxed world; mobile layout
acceptance is still open.

## Failure diagnosis and remaining scope

Initial route verification stopped 0.176 seconds before the existing earned
recovery accent expired. Its bounded wait now allows the existing recovery to
finish within the aftermath lifetime; gameplay priority was preserved. The
historical failure files remain in the output directory; the final report is
authoritative for the final run.

Broader zone composition, whole-route pacing, other objective transformations,
remaining perception/search behavior, overall art quality, performance and human
acceptance remain open in the full scope ledger. No new geometry or additional
audio voice budget was introduced for this sequence.
