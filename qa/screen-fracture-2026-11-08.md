# Live-scene interference polish

Replaced the 3D feedback canvas's strips of a fixed course illustration and bright mint/white lines with localized displacement of the scene currently on screen. Nearest-neighbor texture sampling and whole texture-pixel offsets preserve the pixel-art treatment. A faint seam echo runs only on hardware; software uses the cheaper single displaced sample. The primary slip follows the apparition's projected height, avoids the aiming lane, and eases into a reverse slip for feints/lookbacks. Staring and looking away use peripheral disturbances. Existing event/audio timing remains authoritative.

The effect uses the existing presentation compositor, with no extra scene render, target, texture allocation or runtime GPU readback. The explicit copy fallback self-blits two narrow strips from its already copied canvas. HUD and camera remain stable. Reduced Motion, disabled interference, protected actions/maps, pursuit and recovery guards remain in force. Movement, collisions and Joe navigation were not changed.

## Verification

- `node tools/verify-screen-fracture.mjs`: pulse/recoil continuity, displacement bounds, ghost-relative placement, comfort gates and non-stacking course events pass.
- `node tools/verify-screen-fracture.cjs --motion`, `--software`, `--copy`: all pass with zero browser errors, at 2560×1600, 1280×720 and 844×390. Screenshots and the 28-frame feint sequence inspected.
- Hardware/software static-scene pixel probes: 6.88% / 7.38% of pixels change; zero changes in the protected center or outside the two bands; zero residue after clearing. Both retain one presentation draw call and 96 textures. Shader counts stay at their prepared baselines (hardware 58, software 59), with no first-use compilation. QA-only pixel readbacks do not ship in runtime code.
- Alternating compositor-only GPU-fence samples remain noisy (approximately 4–10ms hardware, 9–20ms software). These are not whole-game frame timings and do not establish an FPS gain or solve existing software-renderer long frames.
- Existing ghost-feedback/mouse-limit test and release check pass: 90 action scenarios, 56 runtime images, no warnings. Whitespace checks pass.
- Installed standard web-game client passed two iterations, traveled 14 units and reached ready first-hole gameplay with no error artifacts; final screenshot and state inspected.

Evidence: `output/screen-fracture-20261108/`. The previous feedback image remains available to the legacy 2D presentation; the current 3D compositor no longer loads or draws it. Cache revision: `20261108-screen-fracture`.

Deferred human review: play a fresh run and compare notice/rush/feint/read-away moments for readability and unease; confirm the gentler disturbance still communicates the threat at the chosen resolution. Automated captures cannot establish player preference.
