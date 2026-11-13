# Final Cut — cutting motion and full-route browser repair

November 12, 2026. The resumed task fixes the failed full-route browser test and records the preceding cutting-drive work. The full 72-item backlog remains incomplete.

## Cutting motion

`web/final-cut-drive.js` gives each ordinary 60 m cutting pass 2.4 m/s² acceleration and braking, retaining the 7.2 m/s central cutting speed. A pass now takes 11.333 seconds. Motion derives from authoritative position, so copied/predicted states agree without a second animation clock. Simulation, wheel travel, mowing and contact use that motion. Emergency wall abort and exceptional off-road recovery retain their existing behavior.

The drive rules pass eight integrated runs across both directions and 30/60/120/144 Hz, checking independent motion landmarks, bounded acceleration, distance, full mowing, pause, copied states and retry. Three trap-rate checks retain full-speed swale entry and physical bogging. Hardware and software browser audits pass actual rig translation, wheel rolling, fixed bearings, Joe's planted contacts, pause and stopping. Views were captured at 2560×1600, 1280×720, 844×390 and 390×844; inspected samples span all four sizes. These are correctness checks, not a sustained performance benchmark or human dramatic acceptance.

Older mowing/drama test fixtures were updated to observe the longer physical pass instead of assuming the old constant-speed duration. Main rules, crossings, contact, mowing, drama, machinery, arrival, visual lure, ending, balls and replay-safety checks passed. The installed game client also finished successfully; its latest screenshot/state showed the protected boarding sequence without error artifacts.

## Reproduced browser failure

The arrival browser harness allowed only 20 seconds for the rail to open. Garage/drain can request the demonstration before boarding finishes. With the new acceleration, the reproduced garage timeout occurred during the first valid pass at x = −5.88 m; the rail opens after x < −6 m. The direct route had already completed. Evidence: `output/final-cut/cutting-drive/reproduce.log` and `reproduce/garage-gate-timeout.json`.

`tools/verify-final-cut-arrival-browser.cjs` now computes a finite wait budget from unfinished boarding, reveal, announcement and the exported cutting duration, plus one second of margin. While waiting, it asserts active play and that the player remains behind the closed rail. On opening, it asserts the first near-fairway pass, leftward direction, physical clearance and the broken demonstration table. A timeout saves the actual state. Reports include each route's budget and observed wait.

## Final uninterrupted route result

Command: `node tools/verify-final-cut-arrival-browser.cjs --crossings --out=output/final-cut/cutting-drive/routes-fixed`

The process exited 0. All three routes completed through the rail, three crossings, middle-cover retreat, pump, lure, physical trap and road escape using ordinary Gamepad API input. Full-route runs do not place live player state; separate inspection fixtures remain in the harness.

| Route | Rail wait | Completion time | Captures |
| --- | ---: | ---: | ---: |
| Direct | 12.50 s | 186.22 s | 0 |
| Garage | 20.25 s | 191.61 s | 0 |
| Drain | 20.25 s | 244.06 s | 0 |

The drain route also used one ball and recorded one redirection. All three used the bell. The report contains 65 screenshots and an empty browser-errors array. The garage cleared-pass screenshot was inspected: the broken table, cut strip and open crossing instruction agree with the recorded state.

Evidence: `output/final-cut/cutting-drive/routes-fixed/browser.json`, `routes-fixed.log`, `rules.json`, `hardware/report.json`, `software/report.json` and `client/`. Initial failing logs remain for diagnosis; the final reports supersede those failures.

## Remaining scope

Off-road pivot recovery, individual tire phases during turns, suspension, fingers, further expressive acting and human fun/fear/recognition acceptance remain. No commit or deployment was made. The existing local server remains running.
