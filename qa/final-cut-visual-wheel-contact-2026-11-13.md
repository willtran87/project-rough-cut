# Final Cut wheel contact, terrain deposits and curved fenders

The full 72-item visual objective remains active. This follows the first hero-material pass; its old radius mismatch and one-tire-material description are superseded here.

## Changes

- Wheel axle height, loaded rolling radius, visible tread radius and contact depth now share 0.85 m. The separate 0.785 m carcass radius excludes the chevron lugs. This removes the old 0.84 m roll versus approximately 0.913 m tread discrepancy.
- Simulation accumulates the signed world travel of each wheel center, including the inner/outer difference through a turn and reverse movement. The four rendered wheels use those independent distances. Analytic arc correction avoids chord loss; no renderer clock accumulates motion.
- Circular tread support follows the actual ground slabs, including rotated path pieces. Eight lateral tread bands account for shoulder taper. Tires start climbing a raised paving edge before their axle crosses it, rather than popping up when the center changes surfaces. Tire support is visual suspension travel; chassis route/speed remains unchanged.
- Dirt derives from actual wheel-center surface and travel: gravel dust, turf residue, wet soil and water darkening. Standing dry wheels acquire nothing. During the trap, actual wheel-spin distance produces mud accumulation; paused simulation freezes it. Four small material instances share the atlas, geometry and shader program while retaining independent film uniforms.
- Four curved fenders replace the previous flat covers. They are built as sheet metal with inner faces, rolled lips, fixings and support blocks. Each is registered under its own authoritative chassis envelope. The first rendered test caught 23 mm of overlap on raised paving; increasing clearance fixes it without changing the test threshold.
- The expanded hub audit caught a bolt tip 1 mm beyond the existing wheel width. Its axial depth is now 10 mm. Hub, lug and tire geometry fit the existing width envelope.
- Collapse snapshots preserve four wheel phases and their deposits. Legacy saves with one wheel phase receive finite defaults. Restoration, reduced motion and pause retain geometry and phase.

## Evidence

- `tools/verify-final-cut-wheels.mjs`: independent circular-path distances for all four wheels at 30/60/120/144 Hz; reverse unwinds exactly; continuous approach to a 12 cm curb; actual gravel/turf/wet-soil versus dry-paving selection; no stationary dirt generation; distinct wheel phases/deposits survive live collapse, serialized restoration and pause. `output/final-cut/visual-hero/wheel-rules.json`.
- `tools/verify-final-cut-wheel-contact.cjs`: actual production geometry at 24 combinations of ground level, steering and rotation. Triangle clipping against a conservative wheel cylinder proves fender separation rather than checking vertices alone. Minimum tested clearance 0.0217789 m; maximum discrete-tread gap 0.0030875 m. All hub vertices fit 0.340001 m half-width and the tire radius. Actual simulation travel produces dust; live bogging produces mud/wetness; pause freezes the material state. Hardware and software both pass after the bolt correction; maximum hub half-width is 0.340000004 m and radius 0.570000002 m. Reports: accepted/wheel-contact.json and software/wheel-contact.json under output/final-cut/visual-hero.
- `tools/verify-final-cut-bodywork.cjs`: eight authored body meshes, 1,604 triangles and one shared material. Actual skin/seat triangles, five actions, collapse, reload and reduced motion pass. Maximum envelope excess below 1.4e-8 m; minimum tested leg/housing separation 0.384 m; restored geometry error zero.
- `tools/verify-final-cut-rig-browser.cjs`: eight pass/turn/distance poses, 116 actual contact meshes, unchanged 2.7/3.9 m reel widths and swept-planar bound excess below 4.8e-8 m. Pure rig suite also passes 2,000 independent seeded comparisons, continuous contact and four update frequencies. Contact fixture now explicitly distinguishes the new fixed fender from tread projecting ahead of it.
- `tools/verify-final-cut-machinery.mjs`: repaired stale historical hardcodes (0.65 m wheel and 0.32 m reel) to use the actual shared specifications, while retaining physical rotation, phase preservation and vertex-bound assertions. New wheel tests separately assert radius equals axle height and actual tread reach.
- `tools/verify-final-cut-rolling-boss-browser.cjs --compact`: 14 rolling samples on east/north paths now check independent wheel travel, actual steering, chassis motion, hand/foot contact and pause. Boss count is 503 parts/11,090 triangles after removal of duplicated flat fenders.
- Three uninterrupted input-driven direct/garage/drain routes pass after the simulation and collision changes: four heard ball redirects, bank/open crossings, pump, bell, physical collapse and road, zero captures/errors. Subsequent renderer-only curb support and 1 mm hub correction are covered by the dedicated geometry checks. Reused `output/final-cut/visual-timber/routes-final/browser.json`.

## Visual review and remaining scope

Inspected 2560×1600 dust and bogging captures. Rounded tires, tread separation and curved fenders read as industrial construction. Dust/residue are restrained; the near tire in the bogging view remains greener while the wheel over saturated turf is visibly muddier, reflecting different contact histories. Existing hub paint/metal remains distinct from rubber deposits.

The rest of the machine still needs further panel/engine/hydraulic construction, detailed lamp housings, refined Joe artwork/acting and matched Level 1 review. Full lighting, terrain, refuge, effect, story, UI and final performance gates remain open. No overall parity or frame-rate claim is made. The wheel geometry remains 7,072 triangles per tire; four material instances add no new textures. Suspension over ground edges is not full chassis pitch/weight simulation (FV42 remains separate).

Disk space reached zero during testing. One software capture timed out; the installed client then lost its browser before capture. Both handles were confirmed terminal before retry. Automatic safety review rejected removal of the owned temporary browser profile, so it was not deleted. Lossless compression attempts also failed for lack of working space. External space became available (about 490 MB); final retries use the same output paths. Existing project artifacts and server 4187 are retained.


## Final receipts

- FV38 is complete against its tire/wheel requirement. FV36/FV43 remain partial; full72-item goal stays active.
- Hardware/software hero checks cover six views, actual movement and five viewport sizes. Hardware native2560x1600/1920x1080/1280x720/844x390/390x844; software initial960x600, desktop960x540, native small sizes. No page/console errors or horizontal overflow; warmed geometry/texture counts stable. Inspected final software quarter, dust, mud and installed-client images.
- Installed client retry75378 exits0, ready/playing y4.737 at960x540 with new0.85m tire stats and four materials. No error artifact.
- Software wheel-contact retry56659 timed out despite recovered space. Ran subsequent software checks separately from the input client, allowing up to120seconds for capture; no geometry/material assertion relaxed. Final3318 passes24poses and dust/mud/pause; final7884 passes six hero views/five sizes. Exact cause of earlier capture timeouts is unproven; contention is a plausible contributor, not a performance result.
- All32cardinal ambush contact/escape cases pass. Rolling stress:288runs/247000poses, maxacceleration12m/s2, minimumcorner speed6.13m/s. Mowing/save regressions pass.
- All owned test processes are terminal. No project or temporary files were deleted. About746MB free after final checks; existing4187server retained.

