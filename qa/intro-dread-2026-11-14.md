# Ten tension refinements — 2026-11-14

Implements all ten approved ideas while retaining the concealed grass reveal and existing artwork.

| Idea | Implementation |
| --- | --- |
| Grass bends before first cut | Twelve foreground blades press forward during 0.35–1.3 seconds. |
| Uneven pauses | Cuts at 1.3, 1.98, 3.65 and 5 seconds: quick follow-up followed by a longer wait. |
| False retreat | Joe moves behind the fixed opening and darkens at 2.65–3.45 seconds. |
| Eye contact before smile | Neutral/grip stare through 6.28 seconds; grin precedes the 6.45-second caption. |
| Stubborn strand | One rooted blade crosses the face, bends and snaps at 5.86 seconds. |
| Cutter catches | The third cut holds at 3.78–3.98 seconds, with lower engine pitch, then releases. |
| Tool shadow first | One cached 240x60 silhouette sweeps the grass before each upper cut, clipped to the foreground. |
| Muffled sound opens up | Existing motor low-pass filter ramps from 340 to 6200Hz as breaches open; no extra audio graph. |
| One final clipping | Main debris fades out by 5.85 seconds; a single late stem falls through the quiet stare at 6.04–6.4. |
| Longer threatening ending | Caption ends 8.15 seconds, motionless stare until 8.9, then handoff ends 9.85. This extends the prior post-line hold by 0.5 seconds. |

The line remains the game's existing subtitle-only delivery. Motor stays silent from 5.4 seconds to menu handoff. Existing stinger is delayed until handoff so it does not interrupt the final stare. Other ambient buses remain as before.

`web/intro-presentation.js` owns an explicit timing score and maps established visual beats onto it. `web/game.js` consumes exported timings for caption state, completion and stinger, and automates the existing motor filter. All game.js edits preserve CRLF and unrelated work. No new RAF, interval, WebGL context, media download or generated artwork. Reduced motion omits bend, shadow, retreat displacement and loose strand animations. Existing menu idle renderer unchanged.

## Validation

`tools/verify-intro-dread.cjs` tests actual rendered regions and the actual audio filter. Initial face exposure 0/4510/26562/75290 pixels across machine/eye/partial/final holds; eye-region brightness drops from 221.9 to 125.7 during retreat. Extended final-hold frames are pixel-identical. Neutral then grin pose assertions pass. Engine stall/release pitch, silence and increasing filter cutoff pass. Actual filter measured 340Hz then 6160.5Hz after settling; motor gain zero during stare. Missing portraits remain concealed. No browser errors.

High-resolution 2560x1600 retreat and rooted-strand frames inspected; remaining native/software, responsive, installed-client and preview evidence under `output/intro-dread`. Existing intro test now captures the line using exported timing rather than assuming the old timestamp. Capture tool retains the last twelve seconds to include the longer sequence. Installed client fixture `tools/fixtures/intro-dread-input.json` reaches the new dialogue beat.

Native timing: 530/449 ms browser task time over 9.84/9.86 seconds, 295/296 render-counter increments. SwiftShader: 525/545 ms over 9.79/9.85 seconds, 304/301 increments. Both natural-completion and functional suites passed keyboard/touch/controller skips, focus/hidden freeze, OS reduced motion, identical reduced-motion holds and completed menu entrance. No browser errors. These are shared-host samples, not a total GPU utilization or simultaneous YouTube test.

Menu idle: 54/53/58 ms task time per three seconds; zero layout, repeated artwork copies and observed layer paints, 59/59 moving particle intervals, pause on blur passed. No new menu work or idle animation owner.

Final strand anchoring/debris cleanup recheck: exposure 0/4485/26570/75314; eye brightness 223.6→119.1 on retreat. Actual filter 344.3→6164.3Hz after settling, stare motor gain zero. Game update asserts stinger remains off at 8.55 and fires at handoff. Final native functional checks passed after timing-aware caption captures. Installed standard client screenshot/state inspected: 2560x1600 page, 1280x720 logical canvas, intro6.75s/pose2/ready/subtitle-only dialogue. Phone390x844 caption and high-resolution strand/retreat inspected. Updated silent video `preview/intro-to-menu.mp4` includes full longer intro. No errors. Syntax/targeted whitespace passed; final sources/hashes saved. All owned test jobs terminal, existing4187 server retained. No agents/CUA/imagegen/commit/deploy.
