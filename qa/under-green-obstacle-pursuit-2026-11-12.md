# Close-cover pursuit — November 12

Continues review items 1, 20, 21, 22 and 41 after the user's pathing/seeking/aggression feedback. The preceding turn made verified runtime progress; this pass checks weaknesses beyond clear-ground steering.

## Reproduced problem and change

A new 30-case dry-floor approach probe found seven stationary-player positions where Joe repeatedly struck scenery for 20 seconds. Existing recovery repositioning only tried sideways/backward offsets with a maximum 1.5m player gap. At the normal attack distance those offsets usually increased distance beyond the allowed gap, producing no usable stance.

After his full blocked-strike recovery, Joe now also tests bounded stances around the **currently visible** player. He selects the shortest clear candidate, checks the complete body path against scenery, active water and player separation, checks the full authored weapon sequence at the destination, and walks there using the existing speed/turn/weapon clearance rules. Candidate travel is capped at 2.5m; existing local-plan cancellation and duration remain unchanged. The original nearby candidates keep priority.

Six reproduced spots now resolve into actual blade-contact captures after one blocked attempt. The seventh lies in a tight pocket between the pump control and machine where the complete swing has no valid reachable stance. Joe watches the opening instead of retrying the same blocked attack indefinitely. This hold requires a visible, stationary player within 1.8m. Moving 0.35m, leaving the close area, losing sight or changing the gate clears it. Movement during recovery cannot leave Joe holding a distant target. A visible caption names the watching state; unseen state remains private. Cover still buys an opportunity to leave.

## Evidence

- Original 30-case report and seven full initial/final reproductions retained in `tools/fixtures/under-green-obstacle-pursuit.json` and `output/under-green/obstacle-pursuit/before.json`.
- Current 30-case probe: 29 physical captures, one intentional cover hold; no repeated unresolved strikes in the seven reproduced cases.
- Dedicated regression replays all seven: full-speed bounds, body/scenery clearance and weapon clearance checked every step. Six captures take 6.52–9.38s from their original approach starts. All seven have at least one ordinary walking escape during recovery, with more than 3m separation after three seconds. These are mechanical opportunities, not human reaction measurements.
- Cover hold: only one blocked strike over the 20-second fixture, pause exact, two hidden player destinations produce identical decisions after sight loss. Walking north or east out of cover and then stopping allows Joe to pursue and catch the player. The north case specifically guards against a stale hold after moving during recovery.
- Existing six blocked-attack/long-turn regression fixtures still capture stationary players and permit ordinary-input escape; loss of sight and pause invariants pass.
- Main simulation: seven routes, all difficulty settings, all checkpoints and optional record complete. Existing threat-observation tests pass.
- Browser: 133 actual moving-state geometry/footing samples pass. Twelve views cover 2560×1600, 1280×720, 844×390 and 390×844. High-resolution guard/range-step and portrait root-step screenshots inspected. Real W movement leaves the hold, release stops the player, and continued simulation produces a physical capture. No page errors.
- Installed gameplay client passes: lesson crossed with zero hits, Joe entering physically, key release produces zero speed; latest screenshot and text state inspected.
- A local 30-call-per-fixture planner microbenchmark records approximately 4.6–6.4ms median for these new fallback cases, with a 26.5ms cold maximum under concurrent verification. This is an event-triggered planner cost, not full-frame/device qualification. See `planner-cost.json`.

The corrected complete water-pressure matrix passes 516 cases: 331 crossings cleared, 185 captures, 91 successful recoveries, zero physical-invariant failures, zero excluded fixtures and zero unfinished attempts. These policies deliberately include late entry and naive waiting; captures are retained outcomes, not proof that an alternative escape is impossible. No claim of human fear, fun, exhaustive map safety or final device performance is made. All 44 review items remain in scope.

Pressure-matrix correction: the first run completed the three recurring channels then entered an unbounded planner search for an event outlet because its QA clock subtracted an absent offset. Confirmed the exact owned process and terminated it; no replacement was started merely because output was delayed. Event fixtures now use offset zero when absent and assert a finite clock. The planner rejects non-finite coordinates/times and nonpositive speed with RangeError; ten rejection cases pass. The existing water-contract suite still matches 173304 original states and 23120 original crossing waits. The corrected full matrix completed successfully. Final installed-client screenshot/state were inspected after this guard was added.
