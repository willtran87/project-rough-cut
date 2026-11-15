# Under the Green: damp atmosphere and controls

The reference is `web/assets/optimized/rough-cut-drain-escape-tableau-v1.webp`, the “Beyond his reach” artwork. This pass brings its wet surfaces, deep shadows, roots and sparse amber/cyan lighting into gameplay.

- Procedural muddy ground with puddle sheen; mineral streaks, cracks and damp discoloration on each district's masonry. Wet materials respond to local lights.
- Reduced ambient/moon lighting, shorter dark fog, isolated practical light pools and faint lens halos. Water fog matches the scene; water signals keep their readable colors and shapes.
- Wall roots branch and taper; hanging tendrils remain overhead. Geometry is included in existing static batches, spatial culling and clearance audits.
- Practical lights have smooth, independently phased voltage dips. No light switches off completely. Reduced motion holds a constant light level; animation uses simulation time and therefore pauses.
- Shared on-foot defaults: **E Use, Q Look Back, R Listen**. Legacy default Q/R profiles migrate together, including the older Enter-default profile. Intentional custom bindings survive. Saves use binding version 3. Level 1's default rows agree with the shared profile; Back Nine already uses Q/E.

Verification:

- `verify-under-green-damp-atmosphere.cjs`: ten views at 2560×1600, 1280×720, 844×390 and 390×844; saved v2 migration, Q hold/release, settings save/version, custom binding preservation and reduced-motion light stability. No browser errors.
- `verify-on-foot-keyboard-scope.cjs`: legacy migration survives saving, failed writes remain honest, custom Enter works in Under the Green/Final Cut/Level 1, peer settings survive, reset/controller editor interactions pass. Updated legacy fixture to explicitly use the historical Q/R pair and its selector to the actual game canvas.
- `verify-under-green-controls.cjs`: Level 1 movement speeds, immediate stop, diagonal movement, non-inverted pointer-lock look, Q rear glance without changing travel heading, controller and touch inputs, inherited movement settings.
- `verify-under-green-pump-lighting.cjs`: actual E pump interaction, handle animation/pause, three pipe knocks, valve state and continuous lamp-source selection.
- `verify-under-green-structure.cjs`: final 802-point clearance sweep and 22 structural views pass, including pause/reduced-motion checks.
- `verify-under-green-moving-clearance.cjs --dry`: complete route, 1,379 rendered frames and 109 Joe mesh samples; no scenery or sampled camera intersections.
- A 60-second production-renderer smoke at 2560×1600/default FOV: 16.7 ms RAF p95 in both 30-second windows, 16 fixed audio voices, no browser errors/context loss. This short run did not finish a lap and does not establish full-route resource stability or replace the prior five-minute hardware/software qualification.
- Installed web-game Playwright client: walked through the introductory crossing, inspected gameplay screenshot and text state, no client error report.

Visual evidence is in `output/under-green/damp-atmosphere/`. The desktop display is 2560×1600; the existing renderer caps its scene buffer at 1600×1000. Compact HUD remains native resolution. These are local browser checks, not a claim of physical mobile/controller qualification or a human assessment of fear/tension.

The previous broad implementation goal remains paused; this pass addresses the new atmosphere/control request only.
