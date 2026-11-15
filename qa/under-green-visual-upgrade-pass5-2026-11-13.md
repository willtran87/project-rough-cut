# Under the Green visual upgrade — water and contact

Full 53-item scope remains active. This pass advances V22–V26 and V48. The complete water-art acceptance, matched Level 1 comparison and all seven release gates remain open.

## Changes

- Replaced large octahedral droplets with small camera-facing, travel-aligned pixel masks. Droplets have individual fades and variable length, remain lit by actual scene lights, and break up along the shared physical nozzle/jet paths. Increased their density while reducing primitive complexity. No solid blue stream or faceted diamond sheet remains.
- Impacts now use low ballistic splash fans, smaller mist footprints and narrow, fragmented ripple crests with individual fade. Spray endpoints follow the higher of the channel surface and whole-level flood. Particle centers remain inside the actual channel footprint.
- Reworked regularly spaced surface glints with warped, broken crests and lower diffuse brightness. Channel water remains opaque and silty. Flood opacity increases with physical depth so the bed becomes less visible at the high-water state.
- New bounded presentation contact history produces ripples from the player's existing 0.72 m footstep cadence, Joe's actual animated sole contacts, and physical scythe/water intersections. It reads actor state without consuming the audio event queue or changing gameplay. Stationary blades, dry footsteps, raised swings, repeated render calls and pause do not invent contacts. Retry and discontinuities clear the pool.
- Three sparse drips fall beneath existing gallery/pump-return pipes, with ripple arrival at the calculated water contact time. Reduced Motion suppresses the falling drips and their incidental ripples; the existing steady hazard presentation is preserved.
- Ripple elevation follows current water depth through both rise and recession. Explicit effect layering prevents the transparent flood plane from painting over contact ripples; opaque walls and actors still depth-test. Flat effect instances use a single transparent pass.
- A single batched damp film follows all 326 actual boundary wall segments. Its waterline follows simulation depth; a fading higher band remains after recession. No flood extent, hazard timing, movement slowdown, player collider or checkpoint rule changed.

## Verification

- `verify-under-green-water-contract.mjs`: 173,304 state parity samples, 23,120 Joe wait decisions and 23 malformed-authoring rejections pass.
- Existing browser contract updated only to skip the now-present intro before fixtures. All 120 cases pass actual signal materials, audio targets, rendered flow state, diagnostic phase, advice and responsive HUD agreement.
- New pure contact checks cover physical water/solid boundaries, dry suppression, player stride, Joe sole coordinates, real blade intersection, stationary/pause deduplication, bounded capacity, reset and pipe-drip arrival.
- New `verify-under-green-water-art.cjs` captures low/warning/surge/receding states, front/side/rear jet views, the rotated pump outflow, and flood rise/high/fall/residual dampness at 2560×1600, 1280×720, 390×844 and 844×390. Both hardware and SwiftShader runs cover player movement, pause, retry and Reduced Motion, plus actual animated Joe contact. Reports and images are in `output/under-green/visual-upgrade/water` and `water-software`; retained pre-pass images are in `water-baseline`.
- Actual Joe fixture produces five foot contacts and ten blade contacts while walking through the 0.38 m flood. This is a controlled fixture, not a claim of a full human playtest.
- Three rendered route regressions pass: dry 1,379 frames/106 body-tool mesh audits; wet 1,408/90; final-route fixture 405/32. Total 3,192 rendered frames and 228 mesh audits, zero scenery intersections, maximum foot error 2.415e-7 m. Geometry results precede the final effect-only transparency layering adjustment, which changes no physical meshes.
- Installed game client traverses intro and ordinary movement; latest final artifacts are under `pass5-client-final`. Final job status and image inspection are recorded in progress.md.

## Limits and follow-up

The water is more natural, but it still needs final motion/art acceptance in every lighting district. Keep explicit shallow puddles, floating leaf clumps, silt plumes, outlet eddies and deeper reflection work in scope. The flood remains the existing whole-floor simulation, including the keeper-room footprint; the plan's dry-refuge wording requires a consistent geometry/simulation resolution before V26 can be accepted. No dry refuge was faked through a visual-only exclusion.

The new film follows actual outer wall faces; mud and roots can correctly occlude parts of it. More authored debris/contact detail belongs to the remaining ground and atmosphere work. Whole-level startup, memory and frame-pacing acceptance is still pending; relative fixed-fixture timing is evidence only for this pass.

No source image generation, global chapter changes, commits or deployment. Further lossless NTFS compression of this chapter's generated output recovered about 108 MB without deleting artifacts.

## Rendering budget notes

Off-screen plumes are culled against an explicit conservative 3D channel envelope. Phase remains analytic, so returning/rear-glance views do not restart particles. Fine spray density fades gradually beyond12m; close crossings retain full detail. The contact pool is40events; total ripple capacity136; maximum droplet capacity7683hardware /3843software. Two64-square masks are the only new textures; a single extra batched wall film handles the flood margin.

At the matched1280x720 draw-submission hardware cost probe, current crossing medians3.5–3.7ms versus baseline2.7–2.9ms; current flood-wall view1.2–1.3ms versus1.9–2.2ms; current range3.0–3.1ms versus2.5–2.7ms. Crossing p95 spans4.0–5.4ms current versus2.9–4.0ms baseline. Denser close spray therefore has a measurable CPU/render cost despite fewer triangles; do not claim a blanket performance improvement. Full frame pacing, device budgets and startup/memory acceptance remain open. Probe method:40warmup+100measured JS draw/gl.finish calls, three static fixtures, baseline/current/current/baseline ordering. It is not a gameplay FPS measurement.

Measurement clarification: these relative probes time the JavaScript draw and gl.finish call but exclude the asynchronous presentation-fence wait at the start of each iteration. They therefore do not prove completed GPU frame cost; later full performance acceptance must measure actual presentation completion and live frame pacing. Existing numerical samples remain unchanged.

Software submission probe completed at960x540 with zero errors. Current crossing medians3.5–3.6ms, flood-wall1.2–1.8ms, range3.5–4.1ms. Baseline medians shifted substantially between the first and last rounds (crossing3.0→5.9ms); another project browser client was observed running concurrently. Treat this comparison as noisy/inconclusive, not evidence of a software speedup. Full performance acceptance remains open.

Final verification after frustum/density and layering changes: both art verifiers passed17fixture captures plus player/Joe contact views, actual initial resolution2560x1600hardware /960x600software, zero errors. Native side view, residual dampness, portrait software crossing and final client image inspected. Installed client initially exceeded its fixed5-second click timeout while the start button was still Preparing; subsequent keyboard actions progressed through the intro and into play. Final state ready/under_green_playing at y8.84,960x540, no app error artifact. All owned test/benchmark processes are terminal.
