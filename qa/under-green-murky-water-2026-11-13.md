# Under the Green — murky water and Level 1 material detail

The user requested darker natural water, splashes and spray instead of solid blue streams, and detailed dark pixel art consistent with Level 1.

## Implementation

- Removed all opaque tube-stream geometry and the unlit blue surface shader. Water is now an opaque olive/brown silty bed with slow eddies, broken highlights and subtle surface-normal changes. Standard scene lighting and fog affect the water.
- Eight authored nozzle paths per channel now emit separate tapered droplets. Impact droplets bounce outward, partial rings spread across the bed, and small locally lit spray plumes sit at the impacts. There are no solid stream meshes. Spray only flows when authoritative water danger is active; reduced motion freezes particle travel while actual water phases still update.
- The surface, droplets, rings and impact mist respond to the same dimming lamps as the masonry. No screen-wide fog/spray overlay or bright foam sheet was added.
- Uses Level 1's existing illustrated 512-pixel atlas for irregular stone, cracked concrete, corroded metal walls and damp ground. Fixtures share Level 1's metal/wood/rust palette. Bespoke mud, tile and bark textures now have native 256-pixel detail, pits and grain, with shallow bump response on hardware. Software rendering retains the illustrated textures and ordinary lighting but skips derivative bump shading on scene batches. Wet floor highlights are broken into grit instead of uniform bright discs. Signboards have subdued paint and grain while retaining readable instructions.
- Hardware scene width cap increased from 1600 to 2560 at the user's existing resolution setting. A 2560×1600 desktop can now render the actual scene at 2560×1600; the software fallback retains its existing adaptive cap. Texture magnification remains nearest-neighbor, with mipmaps for distance.

## Verification

- `verify-under-green-water-contract-browser.cjs`: 120 cases across all outlets and four viewport sizes; visual flow, signal materials, audio, damage-state diagnostics and bank instructions agree. No browser errors.
- `verify-under-green-presentation.cjs`: low, warning, surge and receding phases; zero solid streams; splash/mist presence; reduced-motion state transitions; touch/HUD layout, readable prompts, record interaction and result flow. No browser errors.
- `verify-under-green-damp-atmosphere.cjs --output=output/under-green/murky-water`: final material views at 2560×1600, 1280×720, 844×390 and 390×844, including a deep lamp dip. Actual pause/reduced-motion behavior and E/Q/R binding checks pass.

- Installed gameplay client on the final material build: opening crossing completed, Joe entered from the service passage, zero solid streams reported; screenshot/text state inspected.
- A 30-second production hardware smoke at 2560×1600/FOV85 confirmed a native 2560×1600 scene, RAF p95 16.7 ms, fixed 16 audio voices and no errors/context loss. This short sample does not complete a lap or establish sustained resource stability.

The initial software smoke exposed a regression: 13.46 rendered frames/s (GPU completion p95 76.6 ms). Disabling batch bump shading reached 18.72 FPS. A simplified water-lighting experiment regressed to 16.51 FPS and was removed. The accepted software fallback retains ordinary Phong water lighting, halves droplet counts, and reduces root tube subdivisions while preserving their placement and thickness. It reached 22.11 rendered FPS with GPU completion p95 37.1 ms (`performance-software-lod/software.json`). This remains below the 24 FPS software target and the previous 24.13 FPS smoke; software performance is a remaining limitation. Hardware retained all detail at 59.45 rendered FPS. These are 30-second smoke samples, not sustained or physical-device qualification; resource-check passes do not imply frame-rate acceptance.

- Final software visual suite: ten views plus the dim-lamp view across the same four viewport sizes; E/Q/R bindings, pause and reduced-motion checks pass, with no browser errors. Inspected the dim high-resolution capture: muddy water, fragmented spray, roots and warning signals remain visible.

Visuals and runtime evidence are under `output/under-green/murky-water/`. This is a visual/material pass; geometry collision, Joe AI, hazard timings and movement are not redesigned. The old broad implementation goal remains paused.
