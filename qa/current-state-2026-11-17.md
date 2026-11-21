# Current state — November 17, 2026

What changed between the November 15 documentation audit and the build published on November 17, how each change was checked, and what remains open. Every change below is merged to `main` and deployed to [GitHub Pages](https://willtran87.github.io/project-rough-cut/).

## Published changes

| PR | Date | Change |
| --- | --- | --- |
| [#11](https://github.com/willtran87/project-rough-cut/pull/11) | Nov 16 | Visual upgrade across the menu and all four chapters. |
| [#12](https://github.com/willtran87/project-rough-cut/pull/12) | Nov 16 | Under the Green records its completion, so the Final Cut unlocks. |
| [#13](https://github.com/willtran87/project-rough-cut/pull/13) | Nov 17 | Second visual pass; a whispered voice for Joe. |
| [#14](https://github.com/willtran87/project-rough-cut/pull/14) | Nov 17 | Continuing into an already-cleared chapter starts it instead of showing its completion screen. |
| [#15](https://github.com/willtran87/project-rough-cut/pull/15) | Nov 17 | Under the Green: Joe holds and swings the scythe properly. |
| [#16](https://github.com/willtran87/project-rough-cut/pull/16) | Nov 17 | The Final Cut rebuilt around four floodable hollows. |
| [#17](https://github.com/willtran87/project-rough-cut/pull/17) | Nov 17 | Night Order: slower field checks and seven dread beats. |

## Chapter by chapter

### Night Order

- **Field checks take time.** Each is worked at its station in three audible beats: audit bell 6 s, field log 4.5 s loud or 5 s quiet, release review 7.5 s (5 s while Joe follows a lure). Filing an exit takes 4.2 s (shed) or 5.2 s (drain). Walking away abandons the work but keeps the beats done.
- **Dread beats.** Joe whispers the count back after each bell toll. Each completed check puts out a share of the path lanterns (up to 78%). His engine sometimes dies for 10 s while he keeps moving. Once per station, when he is listening, the work slips back 1.8–2.6 s. After the second check he goes ahead to wait at the last station, and after the third at the nearer exit. A rear glance can show a translucent Joe behind the player. Running with the shed key jingles and extends his hearing range.
- None of the dread beats can capture the player by itself, and the darkened lanterns do not change detection, which uses the floodlights.
- Earlier on Nov 16–17: moon rim light, a working mower lamp, standing grass in the rough, a slower capture with flash and bruise.

### The Back Nine

- Drizzle with a wet sheen, stronger wind that keeps blowing under Reduced motion, a lingering capture moment.
- Continuing in from Night Order always starts the chase; a plain reload of a finished run still shows the escape.

### Under the Green

- Joe carries a curved snath held diagonally, one hand high and one on a side handle, and swings with his hips, weight and follow-through. Arms are lengthened at runtime in this chapter only. The blade, its timing and the clearance volume are unchanged.
- Wakes in standing water, frothing outlet jets, lamp haze, swaying roots, a heavier capture.

### The Final Cut

- **Flood-and-bait loop.** Three fairway hollows and the nursery swale each have a valve with a status beacon. After the pump is primed, pressure feeds one basin at a time: it fills in 5 s, holds for 14 s (the swale 40 s) and drains. A full hollow holds the machine for 6.5 s and is then used up; half-full water only slips his wheels. Two holds give the nursery valve pressure, and only the swale ends the round. Opening a valve is audible and draws his next pass.
- Each hold shortens his warning and takes lamps off the machine. The bell now stands on the open bank. A breaker by the pump shelter drops the floodlights for 12 s.
- The camera closes in each time the ground takes the machine. Records carried out can be filed or kept, which changes the ending. Holds are saved, so a capture costs one stage.
- A 17.5 s closing scene: the floodlight banks go down one at a time into first light.

### Joe's voice

- 243 lines are whispered ElevenLabs takes: every defeat line, the Night Order base capture lines, the Back Nine story cues, the Final Cut's eleven scripted lines and five Night Order dread lines. The remaining Night Order and Back Nine barks still use the synthesised voice, so both voices can be heard in one session.
- The ElevenLabs clips come from the free plan, which requires crediting ElevenLabs and does not include a commercial licence. The game does not yet carry that credit.

## Checks run on November 17

- `node tools/verify-release.mjs` passes (the Pages deploy gate).
- `node tools/verify-campaign-progress.cjs` passes.
- `node tools/verify-final-cut-hollows.mjs` passes: the basin rules, and a scripted player winning on all three cutting plans.
- Across all 332 `tools/verify-*.mjs` scripts, 243 pass. The 89 failures include many that already failed on November 16 because they compare against local `output/` snapshots that are not in Git.
- **Eight Final Cut checks fail because of #16.** They script the old pump-then-bell route: `verify-final-cut`, `-arrival`, `-balls`, `-crossings`, `-outcome`, `-replays`, `-replay-safety` and `-visual-lure`. They need rewriting around the new loop.
- `tools/verify-under-green-light-partitions.mjs` fails because the wake effect from #13 expects a player and Joe on every run and the test supplies neither.
- Each new feature in #14–#17 was exercised in a headless browser with no page errors. Browser checks that need the local server on port 4187 were not run.

## Not yet established

- No person has played any of the November 17 changes. Pacing (the Final Cut's 14 s water window, the longer Night Order checks) is untested.
- Frame cost of the visual passes has not been measured.
- The rear-glance glimpse needs clear ground behind the player; in cluttered spots only its sound plays.
