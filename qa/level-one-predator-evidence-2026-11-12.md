# Level 1 evidence-led predator tactics

This pass advances J3/J5/J6/J8, S3/S8 and P4. It does not complete the full
Level 1 goal, whole-route balance, visual polish or human fear/fun acceptance.

## Baseline and implementation

The baseline verifier held Joe and his search evidence fixed while relocating
an unseen player between opposite sides of the course. False-retreat destinations
changed from(-11.82,22.70) to(-20.34,26.12), despite the same last-known point
(0,110). Cover-cut selection, safety calculations, seed/zone and cancellation
also consulted live player position or concealment.

Both tactics now require fresh, finite sight/sound/trail evidence and own a
copied point/kind/time/zone snapshot. Ball/equipment investigation is not silently
promoted into knowledge of the player. Missing or older-than-eight-second
evidence does not start a tactic. The remembered area's terrain determines the
choice, while valid physical destinations and collision-sampled fairway egress
remain required. The safety visibility estimate uses the conservative maximum
rather than a hidden player's current concealment or lighting.

False retreat moves away from and returns to the recorded approach. Cover cut
finishes the old hiding line even when the player quietly leaves rough. Confirmed
sight/hearing cancels special movement; a new distraction hands control back
without losing its source. Bare proximity is not an independent perception
channel. Normal collision capture and the existing last-chance escape remain.

The expanded test then found that `joeCoursePressureMultiplier` still changed
movement speed with hidden player progress. Its location component now follows
Joe's own course position. Completed-review pressure, chosen pursuit intensity,
overtime and Joe's actual terrain remain in effect.

Tactic cue emission uses local distance/material reception and the physical
mower's location. Both instructions are camera-independent. Cover-cut uses the crouch binding and short-grass
landmark instead of fixed world-axis key directions that become wrong after
camera turning. The sampled world route remains available in diagnostics.
This does not claim that every other status/HUD/audio channel has passed the
remaining distant-announcement audit.

## Verification

- `node tools/verify-predator-evidence.cjs --baseline`: recorded actual old target
  discrepancy before source changes in `output/predator-evidence/baseline`.
- Final `verify-predator-evidence.cjs`: twelve groups, no browser errors. Complete
  physical false-retreat and cover-cut paths are identical across hidden player
  relocations that also change course region. Tests cover source freshness/kind,
  copied memory, expiry/completion, pause, actual confirmed sight/hearing,
  proximity rejection and committed distraction handoff.
- Actual crouch/movement keys follow the sampled rough-to-fairway route in about
  1.023 simulation seconds. Player reaches(-51.89,102.5), remains in first_hole,
  Joe is searching, and cover_shred is still committed. This uses an explicitly
  staged remembered encounter; it is not claimed as a full natural novice route.
- Contact probe originally expected immediate defeat; the actual last-chance
  escape correctly intervened. The assertion now preserves that existing
  contract. The separate encounter suite verifies grace expiry into capture.
- `verify-encounter-refinement.cjs`: terminal exit0, eight groups. Includes
  station interactions, quiet/loud signing, close escape/capture/rearm, four-size
  HUD, character poses, and ordinary shed/drain victories.
- `verify-search-memory.cjs`: terminal exit0, seven groups. Fresh evidence,
  physical path invariance, pause, forgetting and reacquisition remain valid.
- Natural `verify-opening-walk.cjs output/predator-evidence/opening-walk`:
  terminal exit0. Fresh UI, mouse and keyboard route reaches first bell at34.9s,
  detection0, learns movement/look/interact/cover; no state placement or errors.
- Installed standard client: terminal exit0, final page1/state1 inspected at
  1280x720; first_hole, spatial ready, travel26, no error artifacts. Existing
  readiness failures remain hidden_collision_owned_by_parent_art and
  gameplay_frame_budget, matching the preceding pass.
- Tactic screenshots captured at2560x1600,1280x720,844x390 and390x844. Inspected
  high-resolution, landscape and portrait views: caption and action text remain
  separate. Joe is correctly obscured by authored hedge in this rough-pocket
  view; this is not an actor-animation quality approval. Existing portrait
  letterboxing remains unfinished. Syntax/scoped whitespace checks pass.

Artifacts: `output/predator-evidence/`. Earlier failed diagnostics are retained;
the final report and terminal result identify the accepted run. No frame-rate,
physical-device, human listening, whole-course tactic frequency or fairness
acceptance is claimed. Other authored perception sources, distant status
channels, encounter animation/voice and the wider visual/dramatic scope remain.
