# Wet-ground and sprinkler atmosphere — 2026-11-08

## Presentation

- The existing terrain draw now darkens inside the eight real sprinkler zones, preserving the original turf/path texture. Irregular feathered edges and scattered, slowly shifting pixel sheen keep wet areas readable without outlining the gameplay boundary.
- The old floodlight ground overlays masked the turf response, especially at the pond. Those existing overlays now share the wet mask, reducing their amber wash locally so soaked ground remains visible. Fixture power/color logic is unchanged.
- Spray has slightly clearer cool droplets, a small sweeping arc, expanding broken landing ripples and a few low drifting impact beads. All remain depth tested and opaque; no transparent mist stack, bloom, reflection buffer or extra light.
- Wet state follows the authoritative soak timer. Dry/expired water removes the effect immediately, without relocking the drain. Reduced Motion holds the water/sheens steady; Pause freezes simulation time. Effects density zero hides spray and sheen but retains the dark wet-ground gameplay cue.
- No collision, movement, navigation, Joe perception/pathfinding, scoring, objective or wet-turf rule changes.

## Budget

One 256×512 RGBA mask (512 KiB) is built/uploaded during preparation and disposed with the world. Shared by ground and existing floodlight pools; no per-frame texture updates, additional ground draws, downloaded assets or zone loops in fragment shaders. Radius uses the gameplay distance metric: x positions scale by .72, but wet-zone world radii use the ordinary course scale.

The previous spray limits remain: one draw, 144 hardware / 64 software instances, nearest three/two heads and distance/frustum culling. Animation samples at 20/12 Hz. Camera aspect now participates in culling invalidation, including stationary Reduced Motion views after resizing.

## Verification

`node tools/verify-wet-atmosphere.cjs` and `--software`: actual E activation, wet/dry gauge and ground lifecycle, three sprinkler views, fixed instance limits, no gameplay writes during rendering, Pause, Reduced Motion, density zero, expiry with drain still unlocked, unchanged exit requirements and stable program/texture counts. Screenshots at 2560×1600, 1280×720 and 844×390. Includes alternating dry/wet presentation timings at a fixed scene resolution; these include browser presentation overhead and are not a full-game FPS benchmark.

Release audit: 90 scenarios pass, 56 downloaded images / 20.8 MB unchanged. Evidence: `output/wet-atmosphere-20261108/`. Final browser/client results recorded in progress.md. Human visual/playtesting remains prepared for later.

Final hardware/software lifecycle checks pass with 60/61 programs and 96 textures stable between dry startup, first activation and expiry. The one added texture is the 512 KiB mask. Inspected final gameplay at all three viewport sizes. Fixed 640×360 scene timing samples (eight per state after warmup) showed dry/wet medians 7.25/6.95 ms on hardware and 96.85/97.05 ms in software; software maxima were 98.4/114.7 ms. Samples include presentation scheduling, and software rendering remains slow overall; these results support a small activation cost in this view, not a general FPS or frame-spike improvement claim.

Installed standard gameplay client: two iterations, ready first-hole state, 14 units moved, no error artifacts; full-page screenshot inspected. Test browsers closed; server remains on 4187.
