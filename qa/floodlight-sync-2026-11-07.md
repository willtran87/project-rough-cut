# Floodlight response synchronization — 2026-11-07

The floodlight lenses shared one cached glass material. Updating a later light overwrote the color of earlier lights, while ground pools retained independent power. The lenses also lacked their own emission.

Each 3D lens now has its own emissive material, retaining the existing pixel shading. A single power sample drives that fixture's emission, color, pool opacity and haze tint. Full power is warm white, dim power is amber, and no power leaves dark glass. Ground pools use a neutral mask with the same tint, avoiding double tinting. Haze responds immediately to power changes even when the simulation timestamp is unchanged.

The fix changes material uniforms and ownership. It adds no geometry, draw calls, point lights or shadow passes. Gameplay light exposure, detection, timers, movement, Joe pathing, mist and ghost motion are unchanged.

Targeted verification covers independent lens materials, on/dim/off/restored states using real review-light timers, independent lamps swapping power, horror light failure, Pause, synchronized shaft colors and no shader compilation during power transitions. Software-rendered lens luminance measures 229.6 at full power, 188.7 dimmed and 25.3 off (see the report for exact captured values). High-resolution 2560×1600 screenshots were inspected.

All seven targeted checks pass on hardware and SwiftShader. The 17-group software atmosphere regression passes, including mist, animated ghost Joe, first-use preparation, scene replacement and desktop/touch layouts. Syntax and whitespace checks pass. The installed normal-play client passed three iterations (28 units travelled, 586 scene submissions), with no renderer errors/error artifacts; final screenshot and state inspected.

Evidence: `output/floodlight-sync-20261107`. Local revision: `20261107-floodlight-sync`. No commit or deployment.
