# Final Cut — aimed, recoverable golf-ball tactics

Continues the active all-72-item implementation goal. This delivers the optional ball-control and supply system used by the proposed third crossing; it does not complete that crossing's authored route fork or certify human fun, fear or tactical comprehension.

## Playable behavior

- Hold the remappable Chip binding (Space by default), controller X or the touch Chip button. Look to aim, hold longer for distance, release to chip. Looking downward brings the landing closer. Use cancels; pause, focus loss, input clearing and touch cancellation discard the aim without spending a ball. A fast press/release still produces one short shot.
- A dotted world trajectory and landing ring use the same parabola as the moving ball. The marker remains visible in tall rough. Walls, roofs of permanent shelters, fixtures, breakable props, the access rail and course boundaries reject obstructed shots. The blocked text and amber path explain the state; releasing preserves inventory. The preview updates when player pose, power, access-gate position or broken scenery changes.
- Three physical practice-ball baskets sit in the bunker, pump shelter and pavilion. Normal Use refills the three-ball carrying capacity repeatedly. Landed balls can be recovered with Use. Nearby recovery rings remain visible in grass, with wall and height checks so they do not point through masonry or between floor levels.
- A ball makes a spatial landing sound only after its flight completes. Joe can choose the corresponding feasible strip at his next selection; his current committed pass never bends toward it. Masonry reduces hearing reach. A landing too far away receives explicit feedback. The existing repeatable bell remains sufficient to finish with no balls at all.
- Carry count, landed positions and an in-progress flight persist. Reload restores the same flight age and parabola, without replaying an already settled ball's sound. Captured/run history retains thrown-ball and actually-selected distraction counts. A landing after victory cannot queue pursuit or replace victory guidance.
- World balls are capped at twelve; further experimentation retires the oldest entry. The pool and trajectory use fixed instanced geometry. Basket rims share a static batch and basket labels share the existing atlas. Landing sound reuses the existing fourteen-source audio graph.

## Verification

`node tools/verify-final-cut-balls.mjs` passes nine groups:

1. Real charge/release/landing/next-strip selection at 30, 60 and 120 Hz, preserving the current pass and feasible headland path.
2. Variable yaw, pitch and power; actual wall, roof and boundary obstruction without inventory loss.
3. Reused stationary full-charge preview, correctly invalidated by looking, sliding access and destroyed props.
4. Cancellation, fast taps, landed-state round trips and actual Use recovery.
5. Mid-flight save/reload continuity and one landing event.
6. Protected victory messaging and no new lure from a late landing.
7. Repeated actual Use at all three supply baskets.
8. Twelve-ball cap and rejection of malformed saved positions/inventory.
9. Two complete ordinary-input simulation routes: zero balls throughout (125.71 s), and a selected charged distraction before the normal bell ending (117.01 s). These are informed scripted pilots, not measured player durations or proof that one tactic is always faster.

`node tools/verify-final-cut-balls-browser.cjs` passes keyboard/mouse, remapped V, injected Gamepad API X/right-stick and actual CDP multi-touch hold/drag/release. It tests blocked release, Use/pause cancellation, holding X across pause/resume, touch cancellation, real walking to recover a ball, all three baskets, landed-state reload and four-size aiming captures. The focused control checks use explicit `?test` fixtures; they are not full playthroughs.

`node tools/verify-final-cut-arrival-browser.cjs --balls` completes three **uninterrupted Final Cut browser routes** using normal Gamepad API movement/look/Use/Chip handlers, from the actual direct, garage and drain spawns. There is no live-state placement on these routes. Each waits for an audible middle-strip approach, chips toward the final strip, verifies that Joe completes the current commitment and selects the landed sound, then finishes all crossings, pump, bell, physical collapse, road and result. Direct/garage/drain times are **172.72/172.34/173.38 s**, all with zero captures, one thrown ball, one selected distraction, and earned Unbroken/Borrowed attention mastery. A read-only simulation clone chooses safe crossing waits. These runs do not prove novice comprehension, physical controller ergonomics, or complete playthroughs of the preceding chapters.

Regressions passed during the pass: main 13 rule groups/seven pilots, source-specific outcome/mastery tests, essential warning arbitration and existing remap/gamepad/touch/defeat tests. Release verifier: 70 referenced images, 34.16 MB, 90 action scenarios, no warnings or failures.

Visual inspection used **2560×1600, 1280×720, 844×390 and 390×844**. Found and corrected hidden grass-level landing/recovery markers, intersecting basket labels and a support post obscuring lettering. Blocked copy now asks the player to adjust aim rather than promising a shot. The standard installed web-game client was rerun after the meaningful changes; latest evidence is `output/final-cut/balls/client-final/`.

Artifacts: `output/final-cut/balls/rules.json`, `browser.json`, eleven focused screenshots and `routes/browser.json` plus 41 route/inspection captures. No image-generation assets were added.

## Performance and remaining scope

A local simulation-only diagnostic of 20 virtual seconds holding aim took approximately 1856 ms CPU before preview reuse and 337 ms afterward. This is one CPU experiment, not browser FPS, a sustained benchmark or a fix for the known software-renderer regression. New scene materials are explicitly owned and disposed; the broader resource lifecycle/performance audit remains open.

The third crossing still needs its authored route fork and readable reason to choose one lane over another. Full dogleg composition, cover-erasure relocation, finished rig/actor/environment art, audio, defeat presentation and other ledger requirements remain. Ball flight is an intentional chip arc with obstruction rejection, not a bouncing/rolling golf simulation. Human tactical discovery, fear, fun, sound intelligibility and physical-device comfort remain untested.
