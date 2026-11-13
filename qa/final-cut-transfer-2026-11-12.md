# Final Cut boarding and dismount verification

The full 72-item goal remains active. This pass advances FC08, FC50, FC58 and FC66; it does not certify the complete chapter, human engagement or release performance.

## Implemented behavior

- Joe now alternates fixed foot supports through twelve boarding steps and ten dismount steps. Tread anchors use the same dimensions as rendered/contact geometry. A foot on the rig follows its parent transform; a foot on the ground remains horizontal. At least one foot stays planted throughout each transfer.
- The side housings leave a usable entry, the rear cab posts clear the actor, and a middle step bridges the board and cab. Vertical grab bars replace the rail crossing the entrance. Housing detail follows the shortened panels.
- The collapsed rig's lower steps are submerged. Joe descends facing the rig, lands beyond them and backs clear before beginning the existing ground turn. A shared exit root prevents the transfer and subsequent walking path from disagreeing.
- Leg reach limits and a continuously derived knee pole prevent the lifted ankle from pulling the supporting foot off its tread or flipping a knee. Hands tuck through the entrance and use the reachable side's grab bar.
- Boarding takes 7.5 seconds and dismounting takes 6 seconds. Arrival now decelerates over its final half second and blends into the standing pose; it previously snapped the left boot by 208mm when walking stopped.
- An ending frame crossing the dismount boundary now uses only its post-boundary time for the ground turn. The previous whole-frame turn produced a roughly 12mm skeletal jump in a boundary reconstruction. The idle cycle also starts from the dismount's neutral pose.
- Arrival and ending snapshots carry motionVersion 2. Legacy saves map old transfer progress into the longer motion once, preserve already completed startup/victory and retain valid recorded on-foot positions. Migration belongs to readSave, not current-time fixture construction.

## Evidence

| Check | Result |
| --- | --- |
| `node tools/verify-final-cut-transfer.mjs` | Pass: legacy/current save cases, 2,402 deterministic exit poses across both wreck headings, fixed support positions, shared ground endpoint, arrival speed/deceleration at 30/60/120Hz and fractional ground-turn boundary. |
| `node tools/verify-final-cut-transfer.cjs` | Pass: 322 poses; zero detected full-skin triangle intersections with chassis/step/floor/roof/post/seat and conservative bounds of rendered wheels, wing/reel/comb and hydraulic meshes; zero foot-support failures. Maximum ankle IK error 2.693e-7m. |
| Same command with `--software` | Pass: same 322 poses, zero contacts/support failures and same maximum ankle error. |
| `node tools/verify-final-cut-transfer-lifecycle.cjs` | Pass: all skeletal joints within 5mm across five phase boundaries separated by 0.2ms; worst 2.702mm. Actual Escape pause freezes pose exactly, actual reload/resume restores joints within 1e-5m, actual reduced-motion setting preserves transfer pose, and advancing the production clock finishes both transfers. |
| Same lifecycle command with `--software` | Pass, including four viewport sizes and opposite-heading exit fixture. |
| `node tools/verify-final-cut-arrival.mjs` | Pass: branch waiting, protected demonstration, rail timing/collision, checkpoint restoration, and six walk/sprint route simulations. |
| `node tools/verify-final-cut-ending.mjs` | Pass: physical victory, nonlethal aftermath, gate/road behavior, actor restoration and 30/60/120Hz scenarios. |
| `node tools/verify-final-cut-acting.cjs` | Pass: eight seated poses, full real dismount and encounter cycle, pause/reload, hand/foot reach. |
| Rig simulation/browser suites | Pass: 2,000 arbitrary contact configurations; actual visible/contact agreement across eight poses with 143 contact meshes. |
| Hydraulic browser suite | Pass: 27 geometry poses, eight masonry heights, actual deployment/collapse/pause/reload and unchanged warmed resource counts. |
| `node tools/verify-final-cut-ending-browser.cjs` | Pass: twelve captures through collapse, dismount, actual gate crossing, fence, reload and road completion. |
| `node tools/verify-final-cut-arrival-browser.cjs --replay=0 --out=output/final-cut/transfer/route` | Pass: after a completed-result fixture unlocks Replay, uninterrupted ordinary Gamepad API movement/Use earns all crossings, pump, bell, physical trap and road finish. 136.999 simulated seconds, zero captures/throws/errors. Predictive waits make this a map-aware pilot, not a first-time player test. |
| Installed `web_game_playwright_client.js` | Pass: two ordinary-input bursts; latest state at 6.500 seconds is playing, boarding underway, zero captures. Latest screenshot/state inspected. |

Artifacts: `output/final-cut/transfer/current`, `software-clearance`, `lifecycle`, `software`, `route`, `client`, and `rules.json`. Lifecycle checks use D3D11-requested and SwiftShader-requested launch paths; the installed client's recorded renderer is SwiftShader. These are correctness checks, not comparative performance measurements.

Visuals inspected at **2560x1600, 1280x720, 844x390 and 390x844**, including front boarding, rear dismount, supported and swinging boots, and compact HUD clearance. The installed client faces the protected approach; feature-specific close-up screenshots provide the actual transfer inspection.

## Failures resolved during verification

1. The all-bone boundary audit exposed the 208mm walking-to-standing boot jump; arrival now decelerates and settles instead of switching directly to idle.
2. Tightening the boundary allowance from 25mm to 5mm exposed the post-dismount turn integrating a whole frame. Fractional integration corrected it; the allowance stayed at 5mm.
3. The route verifier's old fixed twelve-second boarding wait expired before the longer startup. It now waits the authoritative BOARD_READY duration. Separate seated/step fixtures also derive their times from the production constants.
4. The new turn test initially compared raw angles across -pi/+pi and reported a false failure. It now compares the shortest angular displacement. The production fix remains covered independently by actual skeletal boundary measurements.

## Remaining work and limits

- The 322 samples establish sampled clearance, not a continuous collision proof. Forefoot support tests inspect actual weighted skin vertices over their assigned tread; they are not a full human biomechanics model.
- Ordinary walking, stopping after the road path and turning still use the existing gait/root behavior. The boarding stop is smoother, but this is not a claim that all ground feet are world-locked.
- Suspension, finger contact, tread attachment/detail and expressive acting need further polish. No unfamiliar-player judgment of dramatic credibility, horror, fun or audio has been collected.
- The uninterrupted browser run covers direct Replay entry; six simulation runs cover direct/garage/drain at two paces. This pass does not claim new full earlier-chapter playthroughs or physical-device qualification.
