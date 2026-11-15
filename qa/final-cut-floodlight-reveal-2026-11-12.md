# Final Cut — tournament floodlight reveal

The previous goal turn made production progress on the visual lure. This pass returns to the outstanding FC06 staging requirement. FC06 remains **Partial**: the lamps have stronger contrast and the unfolding machine now receives a deliberate lighting reveal, but the initial impression of two separate vehicles has not been established by unfamiliar-player observation. The folded V silhouette remains discernible.

## Implemented presentation

- Tournament illumination starts dim during the protected observation interval. Hemisphere intensity is 0.12 and directional fill is 0.04, with darker sky/fog colors; the four physical floodlight faces are off. Refuge/direction signs and existing local lamp faces remain visible.
- After the player requests the round, the existing two isolated-marker seconds are retained. During reveal seconds 2–4, the floodlight faces, broad ground illumination and sky/fog light spill rise smoothly with the rig's existing main-beam buildup. At full illumination the previous hemisphere 2.0 / directional 1.7 and sky/fog colors are restored.
- A permanent warm safety light over the west parapet illuminates the overlook and descending ramp. Its post is within the existing wall footprint and its cap above reachable player height. This one bounded, non-shadow-casting point light remains independent of the tournament cue.
- `courseLightState` derives from the existing simulation/reveal state. Pause freezes it; completed-reveal and prepared checkpoints restore full illumination. Unlike the rig's own lamps, tournament lights remain on after machine shutdown, preserving the road walk.
- Added `graphics.courseLighting` to the text diagnostics. No forced view, independent presentation timer, new interaction, hazard/perception change, texture, or extra shadow map was introduced.

The first dimmed version left the observation foreground too dark. The permanent deck light was added after inspecting the actual high-resolution view. Both branch corridors were subsequently inspected: their paving and luminous directional signs remain visible, though their surrounding architecture is substantially darker. Boarding remains physically present but less conspicuous before the floodlights rise. First-time route recognition and Joe-relocation comprehension in this lighting remain human acceptance work.

## Verification

- `verify-final-cut-reveal.mjs`: five groups pass, including 30/60/120 Hz, three-minute unhurried waiting, actual Use, smooth light/wing timing, gate opening behind the real pass, startup pause/restore, completed-reveal skip, both controls and independently lit aftermath.
- `verify-final-cut-reveal-browser.cjs`, D3D11 and SwiftShader: three groups and twelve captures per renderer. Actual keyboard Use/gamepad look reaches the reveal; both physical markers are in view and unoccluded. They separate from 5.2108 m to 10.5 m. Tests inspect actual light intensities/material colors, freeze the complete view state during pause and reload the earned reveal skip. Compact folded views are separate presentation fixtures using an already earned state.
- Images inspected at 2560 × 1600, 1280 × 720, 844 × 390 and 390 × 844: initial observation, marker contrast, deck/ramp illumination and deployed rig. Garage/drain high-resolution arrival views and a boarding close view were also inspected. This is visual inspection, not a human horror or readability study.
- `verify-final-cut-arrival-browser.cjs --overlook-start --out=output/final-cut/floodlight-reveal/routes`: three uninterrupted finales from direct/garage/drain chapter spawns using ordinary Gamepad API input. Completion times 131.5616 / 138.6683 / 139.7099 simulated seconds; zero captures, throws and browser errors. Actual pump, bell, physical trap and road completion are included. These are chapter-entry routes, not full preceding-campaign runs. Later actor/sign fixtures are separate.
- Hardware `verify-final-cut-lighting.cjs`: five groups pass. Actual floor pixels in all three refuges reject direct headlight contribution through masonry; exterior light moves with the rig; pause/reduced-motion, exact collapse reload pixels and shutdown behavior remain correct. The safety light does not replace or weaken these shadow checks.

- Installed develop-web-game client: two movement bursts complete, final screenshot/state inspected at 6.50 seconds with waiting rig, wash 0, ambient 0.12, directional 0.04 and safety light 40. Geometry/texture counts remain 48/20; no error artifacts. All owned processes are terminal.

## Render-cost evidence

`profile-final-cut-floodlights.cjs` compares the saved pre-change scene and current scene sequentially in ABBA order. Four warmup plus twelve frozen draws per view use complete RGBA readback. No other owned browser verification was run concurrently with this measurement. It measures sampled draw/readback cost, not sustained gameplay FPS, input latency or target-device qualification.

- Hardware per-run arrival medians: baseline 4.6–7.3 ms; current 5.2–5.8 ms. Fork: 4.2–4.3 vs 4.2–4.8; green: 3.3–3.6 vs 3.7–3.8; collapse: 4.9–7.4 vs 4.7–5.4. Variation precludes a broad speed claim.
- Software per-run arrival medians: baseline 170.7–171.2 ms; current 163.8–167.5. Fork: 105.2–108 vs 105.8–107.5; green: 42.8–44.1 vs 40.9–42.4; collapse: 101.4–111.6 vs 97.7–101.4. These remain poor sustained-performance evidence; the small differences are not treated as an optimization.
- One extra submitted draw and 60–72 additional submitted triangles depending on the view. Existing geometry primitives/textures are reused. The extra point light adds shader work even where its finite range contributes no light; software performance remains an open chapter requirement.

Artifacts: `output/final-cut/floodlight-reveal/{baseline,routes,profile-hardware.json,profile-software.json,client}` and refreshed `output/final-cut/reveal/{hardware,software,rules.json}`. The original 72-item goal remains active. Next acceptance work includes human recognition of the reveal and landmarks, stronger acting/audio, whole-campaign and physical-device runs, and sustained performance.
