# Back Nine camera clearance — 2026-11-14

Partial implementation of BV46. The 48-item goal remains active.

The baseline cart camera entered the clubhouse and garage walls. Nine matched poses reproduced the problem at the clubhouse west/front and garage side, with unchanged open shelter, low basin and hill reference views. The original 360-degree cart turn produced 137 wall intersections per 361 frames, both with and without reduced motion.

Implemented height-aware obstacle sweeps for carts, while retaining the existing on-foot horizontal sweep contract. Heights distinguish low basins from the range awning and stores, follow displaced destructibles, and release destroyed fixtures. A sweep starting inside a circular obstacle now returns zero clearance. The actual smoothed eye is constrained each frame; a terrain floor prevents burying the lens. Cart views seek a clear shoulder angle, adjust look-ahead to retain the vehicle, and track along a collision-checked arc instead of interpolating through the canopy. Essential cart tracking remains smoothed with reduced motion; decorative shake remains disabled. Existing death and finale presentation remains separate.

Production files: back-nine-scene.js, runner-camera.js, chase-camera.js and their import versions in back-nine.html (20261114-camera-clearance-7). No artwork, shaders, new scene resources, controls or simulation rules changed.

Several intermediate camera versions were rejected: straight retraction exposed too much canopy; a downward aim magnified that obstruction; nearest-angle shoulder selection switched sides; linear interpolation crossed the cart. Only verified-native/software, verified-client-native/software, verified-foot-native and motion-accepted-native/software are accepted current evidence. The older after-*, final-*, orbit-*, accepted-*, client-*, foot-native and motion debugging folders preserve intermediate results, not final acceptance.

Verification:
- Ten sweep contracts and 864 obstacle-angle samples pass. Existing runner-controls, course-destruction and shelter/garage ceiling tests pass.
- Nine baseline/native/software pose comparisons preserve player, cart, Joe, objective, relay, navigation and destruction states. Shelter, low-basin and hill camera transforms match the baseline within 1e-8.
- Native/software each exercise cart and foot turns with reduced motion on/off: 541 frames including settling per case, zero wall intersections. Cart boom stays 6.5 m; maximum step 0.260 m/frame. It returns behind the actor within 0.000001 m after three seconds. Foot maximum steps remain 0.644 m normally and 0.265 m reduced, matching the prior behavior in this fixture.
- Visual inspection at 2560×1600, 1280×720 and 390×844 confirms clear vehicle/route framing beside the garage/clubhouse. Both actual cart input runs and the native foot relay traversal were inspected. Pause and restart checks pass in pose harnesses.
- Installed skill client runs two movement/turn bursts. Native/software cart outcomes exactly match: drive away from the clubhouse to the course boundary at (-39.14706181523399,791.0881073354702), health 100. Native foot traversal matches the accepted shelter pass and activates relay 1.
- Final cart client native 2560×1440 averages 11.09 ms, P95 12.20 ms; software adaptive 640×360 averages 63.74 ms, P95 85.10 ms. Native foot averages 11.63 ms, P95 12.80 ms. Different quality levels/host load prohibit speedup claims; software quality/performance remains open.
- audit-chase-clearance.mjs verifies physical comparisons, motion results, actual inputs, served source bytes, unique imports, and archives current sources/tests/evidence hashes.

The prior tool sessions disappeared after the tool-environment update. Process inspection confirmed no active verifier processes and all final artifacts were present. Port 4187 was also absent; its read-only source audit first failed ECONNREFUSED. A local static server was restarted on 127.0.0.1:4187, and the complete audit then passed.

Still required for full BV46 acceptance: wider route/corner playtesting, close Joe passes, ejection/death/finale transitions under combined load, obstruction from scenery outside the physical obstacle map, and sustained camera comfort. This pass does not establish whole-level Level 1 parity or complete BV48.
