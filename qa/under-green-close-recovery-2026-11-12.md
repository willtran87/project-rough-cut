# Under the Green — close-contact surge recovery

November 12, 2026. Addresses review items 15, 23 and 41; also supplies evidence for the ongoing pursuit/climax investigation. This pass changes one local recovery collision check. Movement speeds, Joe's attack/pursuit rules, water schedules and shared campaign systems are unchanged.

## Reproduced defect and change

Ordinary player/keeper movement can leave a legitimate centre separation between 0.65 and 0.75 metres. Player surge recovery required every candidate step to achieve 0.75 metres immediately. If Joe was beside the player, a shove that increased their separation could still fail that test. Recovery then cancelled on zero travel, leaving the player inside active water until later input or another recovery attempt.

The retained pre-fix boundary matrix has **168 failures out of 288 cases**. For example, at the spillway with Joe 0.70 metres to the side, the player remained at y=60.1 after the surge began. No world-solid overlap or protected capture caused these failures; the player simply did not clear the channel.

`recoverPlayer` in `web/under-green-sim.js` now compares each swept candidate against the smaller of the existing separation and 0.75 metres. Existing close contact may separate incrementally; a current still cannot reduce separation below that bound or push the player through Joe. World collision, bounded displacement, lateral steering and recovery protection remain in force. This is local water recovery behavior, not a campaign-wide change to actor collision or defeat rules.

## Verification

- `tools/verify-under-green-close-recovery.mjs`: **288/288 pass**, covering both banks of six outlets, Joe on either side, four initial gaps (0.66/0.70/0.74/0.80 m), and 30/60/120 Hz simulation steps. Every case clears the active channel after one hit. No sampled world-solid overlap, protected capture, excessive displacement or recovery step violating the separation bound.
- Six additional cases put Joe directly in the return path. The shove remains obstructed instead of passing through him.
- Eight dry-bank approaches use ordinary forward input until an actual surge starts, then neutral, left, right or retreat input on each bank. All receive one hit, clear the channel, remain playing and retain live Joe behavior. These are seeded approach fixtures, not complete chapter runs.
- `tools/verify-under-green-close-recovery-browser.cjs`: **32 replays / 96 views**, at 2560×1600, 1280×720, 844×390 and 390×844. Actual keyboard and browser touch events plus emulated controller polling reproduce the expected positions at surge, displacement and bank stages. Compact captures have touch controls active. Pause freezes the complete state and resume preserves the sequence. No page/console errors.
- Existing recovery-control matrix: **378 cases pass**. Existing pressure-envelope matrix: **516 cases pass its stated invariants**, including 103 recoveries and 173 captures. A passing matrix does not mean every policy survives. Gate/save/timing rules and event-specific outcome regressions also pass.
- Installed web-game client completed two ordinary movement bursts, ending in gameplay at 4.567 seconds with zero water hits. Its latest screenshot/state were inspected. This smoke run reaches the lesson approach; the dedicated browser pass above covers the changed behavior.
- Inspected the high-resolution close-Joe displacement, portrait right-steering bank and installed-client captures. These images demonstrate sampled presentation; they are not all-space mesh clearance or physical-device acceptance.

Artifacts are under `output/under-green/close-recovery/`: retained `baseline.json` and `baseline-examples.json`; current `verified.json`, `current-examples.json`, `browser.json`, screenshots and `client/`. The baseline flag refuses to overwrite the retained pre-fix evidence.

## Failed bank policies: diagnostic finding

`tools/probe-under-green-bank-evasion.mjs` replays the 15 captured keeper-recovery policies and retains their original captured outcomes. Those policies spend 49–94 frames commanding movement without translating; several repeatedly reverse across Joe's approach or continue pushing into his body.

From each final windup, a separate diagnostic branches into sixteen fixed headings at walk, crouch and run pace after a 250 ms neutral delay: **720 trials**. Every source has at least one direction at every pace that survives the 1.5-second interval with over two metres of separation and no world-solid overlap. Available headings range from 7–12 walking, 5–10 crouching and 7–13 running. The report is `output/under-green/bank-evasion/diagnostic.json`.

This is evidence against treating these specific failures as unavoidable or weakening Joe to make the original pilot win. It is not a full recovery-to-exit proof: heading selection is perfect and instantaneous, and the original map-aware pilot is not a human. The other four original range-approach captures remain outside this diagnostic. Human cue comprehension, turn ergonomics, fear and enjoyment remain unverified.

## Remaining work

Keep all 44 requirements active. Investigate the other four range-approach captures and whether actual players recognize bank escape directions. Continue remaining architecture/theme coverage, shared-consumer gaps and cold-start/device qualification. Do not replace retained failed outcomes with these short evasion branches or describe the chapter's balance as complete.

All processes launched in this pass have completed: bank diagnostic 23063/44651, recovery matrix 43035, pressure matrix 91557, browser 64985 and installed client 13914 exited 0. The initial 288-case baseline deliberately records failures; the final matrix passes. No pending test process is being handed off.
