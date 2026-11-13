# Physical objective wayfinding

Added weathered numbered boards above the Audit Bell, Field Log and Release Review, with matching direction signs beside the three main path turns. Key and valve stations have distinct pixel symbols and clear exit-access labels. The station boards face their authored approaches (including the bell's western approach), with readable reverse faces. Direction boards are front-only so their arrows cannot point the wrong world direction when seen from behind.

The first unfinished required check has the strongest restrained amber lettering. Other unfinished checks remain readable but subdued. Completed checks change to a checkmark/FILED, the key to TAKEN and the valve to OPEN, with muted green-gray lettering. When all checks are complete and neither exit is accessible, both access mechanisms gain emphasis. Existing prepared-exit beacons remain.

These are physical depth-tested, fogged signs with fixed positions, mast/frame geometry and steady small amber markers. They do not rotate with the camera, reveal anything through walls, add light to the environment, change detection exposure, or change collision/navigation/interaction rules. No blinking or additional particle effects. They remain at decorative density zero and with Reduced Motion.

## Resources and verification

- Eight signs share two opaque batches and one generated 960×288 nearest-filtered atlas, with static body geometry. UV/color updates occur only when completion/access state changes. No new media download, light or render target. Existing scene preparation warms the materials; disposal uses the existing world lifecycle.
- Hardware/software `verify-objective-cues.cjs`: check progression, completed states, access states, actual E activation of the Audit Bell, pause, Reduced Motion/density zero, read-only simulation state, no program/texture growth during transitions and no browser errors.
- Inspected rendered approaches at 2560×1600 and bell views at 1280×720 and 844×390. Initial test viewpoints intersected the practice bell/hedge; corrected those fixture positions to sample the authored approach paths. This is not a claim of human navigation success.
- All three junction-arrow views inspected. The normal presented-client run completes two iterations / 14 units, reaches ready first-hole state and produces no error artifacts; final screenshot inspected.
- Syntax/whitespace checks and release inventory pass (90 scenarios, 56 images / 20.8 MB). Existing software frame spikes are not declared resolved by this visual change.

Evidence: `output/objective-cues-20261108/`. Revision: `20261108-objective-cues` for the scene module.
