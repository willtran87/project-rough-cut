# A-grade acceptance study

No participants have been recruited or tested by this implementation pass. This protocol and the local diagnostics prepare that work; synthetic browser tests do not fill in human results.

## Cohorts and consent

Recruit ten first-time players, then a fresh ten-person cohort after the most frequent severe issues are fixed. Invite the first cohort to a returning session a few days later. Explain the horror theme and approximate 20–30 minute session length; allow stopping at any time. Use anonymous participant IDs. Ask permission before recording screen/audio. Do not record names, email addresses or unrelated desktop content in the game evidence.

## Uncoached first session

Use this introduction: “Explore the game and try to escape. Play as you normally would. You can stop whenever you want. Please say what you are trying to do when something is confusing.” Do not explain the checks, access items, distraction or cover before play.

1. Record source SHA-256, build URL, device, OS/browser, input method and settings. Clear game preferences only in a dedicated study profile; do not delete a participant's own career.
2. Time first movement, first turn, first successful distraction, first cover use and first check. At 60 seconds, ask what they think the win condition is without correcting it.
3. Allow up to three Standard attempts. Record captures, unclear instructions, blocked movement, help requests and any section with no meaningful choice for more than ten seconds. Log interventions explicitly.
4. After a capture, ask: “What caused that? What could you try next?” Let the player discover retry and rehearsal.
5. After a run, ask what optional risk they took or declined and what reward it offered. Rate clarity, control comfort, pacing and enjoyment separately on a 1–5 scale.
6. Offer “Another run or stop here?” with equal emphasis. Record the choice and the stated reason; do not encourage a retry to improve the score.
7. Show unlabeled screenshots of visited zones. Record recognition and the landmark used. For readability, show representative threat/object scenes and time identification of the next usable object and an open lane.

Use the numerical acceptance targets in `a-grade-action-plan-2026-09-26.md`. Report denominators, negative results and interventions. Ten-person studies guide development; they do not establish population retention or guarantee enjoyment.

## Returning session

Ask the player to start without a control refresher, choose another variant or exit, and describe a different plan. Offer hidden route guidance only after familiarity is demonstrated. Check whether Listen/map restores guidance and whether the player remembers controls. Record voluntary retry and the reason after novelty has faded.

## Local diagnostics

The game keeps a bounded event history in memory. From the browser console, `export_rough_cut_playtest()` returns JSON for the current run. Save that string locally with the anonymous session ID. It includes variant, pressure, elapsed phase time, first demonstrated actions, detection/check transitions and outcome. There is no automatic upload.

Phase times are exclusive: chase, hidden, threatened, learning, exploring, then stationary waiting. This is a simulation heuristic, not a measure of emotion or attention. Annotate video for human confusion and purposeful observation. “Waiting” alone does not prove boredom. Learned controls persist, but first-action timestamps are recorded again for returning sessions. Rehearsal does not update remembered mastery or career records.

## Device qualification matrix

| Target | Required physical session | Status |
| --- | --- | --- |
| Primary Windows desktop, Chromium browser | Mouse/keyboard; lock/unlock, blur, remapping and full turn/chase | Browser automation only; exact hardware/comfort pending |
| Modest Windows laptop, integrated graphics | Cold startup, full run, heaviest turn/chase | Hardware not supplied; pending |
| Windows desktop, physical controller | Dead zone, stick response, disconnect during aim, all menus | Synthetic controller tests only; pending |
| Representative Android phone, Chrome | Touch movement/look/Use together, orientation, suspension/resume | Synthetic landscape pointer tests only; pending |
| Representative iPhone, Safari | Same touch/lifecycle checks and audio unlock | Not tested; support qualification pending |

Record CPU/GPU, RAM, screen resolution, browser version and power mode. Do not advertise a named device as supported until measured. Proposed desktop target is 60 FPS, p95 presented-frame interval around 16.7 ms. Choose and document any lower mobile tier explicitly. Headless render timings cannot establish physical-device FPS or comfort.

## Friction triage and retest

For each issue record anonymous IDs affected, frequency, severity, exact trigger, screenshot/clip, source hash, proposed fix and validation. Rank completion blockers first, then confusion/control problems, then pacing/reward issues. Fix the top three observed problems and use the fresh cohort for the same tasks. Keep old failures alongside new results. Release requires the full automated route matrix, lifecycle/device gates and human acceptance evidence for the claimed grades.
