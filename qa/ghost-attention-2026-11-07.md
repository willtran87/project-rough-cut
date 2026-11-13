# Ghost notice and rush acting

Revision: `20261107-ghost-attention`.

The previous whole-body turn is now staggered: the head leads toward the noticed position, the shoulders follow, then the body and mower turn. The bounded head/torso offsets settle before the existing rush windup. Hands and mower remain outside the torso deformation mask. Facial/body shading now follows the rotated normals.

During the rush, the head is steadier and the tilt is smaller. Forward lean follows speed and eases back as the ghost slows. The jaw has a single intake/slackening envelope instead of a repeating motion. Facial midtones are softer while preserving dark eyes and the original pixel-textured brows, cheeks and mouth.

No new assets, geometry, animation targets, lights or rendering passes. The existing model remains one draw / 5,648 triangles; torso sine/cosine are calculated once on the CPU. The original face atlas, dither palette, cubic walk blend, committed safe lane, player clearance, real Joe navigation and comfort controls remain.

Verification:

- Pure behavior checks prove head lead, settled shoulders before rushing, monotonic jaw relaxation, recovery of forward lean, unchanged target/lane safety and stable duplicate samples.
- Isolated renderer checks show visible pose changes, reset of all parameters, normalized cubic weights and continuous gait velocity. Notice/rush visibility remains stronger than waiting, with one draw.
- Face close-up and staggered notice sequence inspected at 2560x1600.
- Fourteen hardware location cases pass, including all three profiles, rushing and screen tears with unchanged gameplay snapshots.
- Three software profile cases also pass. Effects CPU p95 .20ms hardware / .40ms software, max .60ms / .50ms respectively; these are CPU update samples, not whole-frame GPU timings.
- Legacy movement, feedback/mouse limits, release (90 action fixtures / 56 referenced images), syntax and whitespace checks pass.
- All 17 atmosphere groups pass, including shader preparation, depth occlusion, visible mist, unchanged simulation and four viewport sizes (2560x1600, 1280x720, 800x600 and 844x390). Reduced Motion plus zero atmosphere density keeps a visible still ghost at 8.6 seconds with every motion parameter zero, no tear, and working apparition-off suppression.
- Normal installed gameplay client completed two iterations and 14 units of travel with no error artifacts; final screenshot/state inspected. Hardware/software gameplay rush screenshots inspected at 2560x1600.

Artifacts: `output/ghost-attention-20261107/`. Human comfort/fright tuning remains deferred. No claim that existing whole-game software-renderer throughput issues are solved.
