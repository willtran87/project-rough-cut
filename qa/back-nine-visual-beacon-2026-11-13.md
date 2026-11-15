# Back Nine beacon finish — partial visual upgrade

The complete 48-item objective remains open. This pass advances BV35 and BV48.

The roof beacon now spreads its near-field contribution over a 12 m radius, tapering smoothly to the original response at 28 m. Pulse timing, red hue, 40 m reach and comfort controls are retained. An earlier 18 m trial was rejected because it weakened the warning too much. Native close-camera saturated red pixels fall from 66,088 to 1,610; software from 9,435 to 212. These are frame-specific clipping measurements, not a claim about every encounter.

Actual sculpted windbreak cores now participate in beacon shadows. The collector previously rejected their segmented box geometry. Keeping the real silhouette adds three cores / 828 shadow triangles, without expanding transparent foliage into oversized cover. Blocked road pixels match ambient exactly; disabling occlusion restores a positive red contribution, and driving Joe around the hedge restores visible illumination. The moving garage shutter and stationary shadow cache pass too.

Software preparation now includes both lit and unlit representatives for Back Nine. This removes the late sand-material compilation found during the cover test. Other scenes retain the old default. Final native resource counts stay at 27 programs / 51 textures; software at 33 / 51, with no new buffer allocations during the tested warm sequence.

Evidence inspected:

- `output/back-nine-visual-upgrade/beacon-finish/native/report.json` and `software/report.json`: paired close, gameplay, near-player, wet-ground, pulse, reduced-motion, no-flash and pause checks pass. Native viewport 2560×1600, actual scene 2560×1440; 1280×720 and 390×844 also captured. Glare captures precede the cover/preparation fixes; the falloff code is unchanged.
- `cover-final/hardware-browser.json` and `software-browser.json`: final-code cover/emergence/garage/foot checks pass at 2560×1600, 1280×720 and 844×390 without browser errors.
- `distance-budget/report.json`: six 28.5–32 m samples retain identical before/after pixels. A test-only steel calibration cube at 30.57 m establishes positive distant contribution (on [14,5,4], off [3,5,4]); grass samples alone were inconclusive because of their existing moonlight floor. Draws and triangles match. Sequential software timings vary and do not establish a frame-rate improvement.
- `client/state-0.json` through `state-2.json`, corresponding screenshots and absence of error artifacts: installed gameplay client completed three retreat/turn/stop bursts. Player finishes near (-3.58,72.46), Joe continues tracking and enters a charge. Software presentation falls from 800×450 to 640×360; combined-load fidelity is still unresolved.
- `verify-chase-beacon.mjs` and `--crafted`: both pass 306 silhouette/raycast comparisons plus cache/retry/disposal checks. `verify-local-light-culling.mjs` and current `verify-back-nine.mjs` pass, including all 12 routes.

The historical `verify-red-night-pursuit.mjs` comparison fails its old Joe-speed threshold before reaching beacon assertions. No simulation or pursuit code changed in this pass; this legacy failure is not reported as a pass. Portrait HUD coverage, full Level 1 parity, directional headlights and the other ledger requirements remain open.
