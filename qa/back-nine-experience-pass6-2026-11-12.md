# Back Nine experience — pass 6

Scope: playable cart destruction, ejection continuity, clear presentation and evidence for useful wreck cover. The full 38-item goal remains active.

## Changes

- Ejection now distinguishes the leading and trailing leg. One arm braces while the other guards the body; a small torso counter-turn supports the fall. Smooth envelopes return to zero at the exact seated start and running handoff. Both exit sides mirror correctly.
- A brief low landing thud occurs at 0.64 seconds from the actual ejection, between the support buckle and hood drop. It reuses the existing body voice, with no new source, buffer or timer. Muted/missed cues are consumed and never replay on unmute or retry.
- Optional sound descriptions include the landing. The ordinary banner says “CART WRECKED” while airborne, then “Getting back up…” during the brief recovery. During the 1.18-second animation the message rails sit above the character, leaving the fall visible even with enlarged captions.
- The breakdown camera now offsets toward the actual ejection side. Its previous fixed rightward offset could put the roof between the camera and a left-side landing. Existing easing, collision sweep, look-back and reduced-motion behavior remain. Both sides are checked in the browser.
- Validated landing selection, movement, collision hulls, pathing, 0.86-second control return and five-second escape protection are unchanged. Clearance evidence did not justify changing them.

## Evidence

- `verify-chase-breakdown-clearance.mjs` samples 907 legal route placements and 494 placements around course features. Every landing is clear of scenery, the mower and wreck. Actual swept movement in twelve directions finds at least two usable escape directions in every sample; minimum best 0.75-second travel is 5.057 m. This is finite sampled coverage, not proof about every possible cart pose.
- Four actual fatal-impact scenarios (open course, pump approach, range approach and garage approach) initiate ejection, hold the validated landing during recovery and then permit 2.3–2.5 m of motion. Existing full route/choice tests also cover a real late ram followed by the foot passage and garage completion.
- Matched stationary-runner test: exposed player caught after 3.05 seconds; player behind the wreck after 5.43 seconds. Joe takes an 8.87 m lateral detour using eleven plans, without overlapping the wreck. Cover buys time but is not permanent immunity.
- `verify-cart-ejection.cjs` passes on software and hardware rendering. Checks rotated seat anchors, both sides, 61 continuous pose samples per side, no below-ground body or abrupt root/knee transition, pause, reduced motion and control returning during the get-up. Lowest sampled vertex is 0.0117 m above ground. Actual live-browser fatal collision also verifies the landing audio/caption and moving handoff.
- Enlarged-caption layout checked at 2560×1600, 1280×720 and 844×390. Caption rails stay below the objective and above the falling character. Latest screenshots and standard installed gameplay-client captures were inspected.
- `verify-cart-damage-audio.cjs`: one landing, existing four collapse cues, no replay after mute/retry, pause silence, no additional audio allocations. Twelve voices; peak 0.430, paused tail zero in this offline render. Listening/balance feedback remains for the deferred human test.
- Older `verify-cart-damage-audio-browser.cjs` timed out at the introductory cutscene because it predated that screen, and expected the old nine-voice budget. Updated its skip-intro fixture and twelve-voice expectation; real fatal impact, pause, escape, mute and retry now pass.
- Full `verify-back-nine`, `verify-cart-health`, `verify-back-nine-choices`, `verify-chase-drama`, `verify-chase-runover`, `verify-runner-controls` and `verify-quiet-messages` checks pass. Installed client exercises running and turning with the current controls.

## Performance and limits

No new runtime geometry uploads, textures, shader programs or audio nodes from these changes. Same 23 software / 18 hardware programs and 36 textures. In the Node clearance audit, landing selection median was 0.268 ms, p95 0.420 ms, maximum 2.92 ms; these are local CPU samples, not browser frame-time or GPU improvements.

Evidence: `output/back-nine-experience/ejection/`, `output/back-nine-chase-drama/ejection/` and `output/cart-damage-audio/`. Before animation sources and representative captures are retained in the first directory. Entry/import revisions use `20261112-ejection-balance-2`.

Remaining: broader gait/foot planting, exhaustive required-route wreck placement, damage/impact/wobble review, course/lighting/audio/variation work and measured software-rendering spikes. Human feel and horror assessment remain prepared for later, not claimed completed.
