# Varied ghost movement

Revision: `20261107-varied-ghosts`.

Each sighting selects a fixed movement rhythm from its encounter serial and location. The four rhythms are steady, hesitate, late-burst and false-retreat. They vary windup, travel reach, acceleration, pauses, retreat duration and retreat distance. Hesitate briefly stops within the approach; late-burst begins slowly before accelerating; false-retreat briefly advances again while backing away. The watcher/stalker/rusher identities remain separate from these movement rhythms.

All motion remains within the original checked lane and fixed target. Piecewise easing produces zero velocity at each stop/reversal. Gait and lean follow signed movement speed. No per-frame random rerolls, teleporting, new pathfinding, assets, geometry, animation targets or render passes. The same pixel atlas and single 5,648-triangle draw are retained. Live-player clearance now checks the whole movement segment, preventing a long frame from crossing the player.

Validation:

- New pure tests cover all four distinct traces, internal hesitation, retreat feint, finite fade, bounded continuous travel, repeated timestamps and identical paths at 20/100Hz after the same perception event.
- Swept-player crossing dissolves the ghost permanently for that encounter. Existing obstacle/pond/border checks, fixed-target sidestepping and immediate suppression tests pass.
- Fourteen extended hardware location cases passed; actual rendered state covered all four rhythms and included 16 visible reapproach samples during withdrawal. Rush/tear/withdrawal checks and unchanged player/Joe/detection snapshots pass. High-resolution withdrawal screenshot inspected at 2560x1600.
- Existing behavior, feedback/mouse controls, release validation (90 action fixtures / 56 referenced images), syntax and whitespace checks pass.
- Three extended software profile cases pass with unchanged simulation and actual backward-walk rendering; screenshot inspected at 2560x1600. Effects CPU p95 .30ms on both hardware/software runs, max .90ms/.50ms respectively (CPU update samples, not full-frame GPU benchmarks).
- Natural opening with Reduced Motion and zero atmosphere density still produces a visible stationary apparition at 8.6s; all movement parameters remain zero, tearing stays off, and disabling Ghost sightings hides the apparition.
- Normal installed client completed two iterations / 14 units of travel with no error artifacts; final screenshot/state inspected.

Artifacts: `output/varied-ghosts-20261107/`. Deferred human fright/comfort tuning remains open; existing whole-game software-renderer throughput limitations are not claimed solved.
