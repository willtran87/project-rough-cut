# Dead Green refuge staging

Part of the full Level 1 implementation goal. The previous goal turn was verified progress (zone scheduling and station input priority). This pass revalidated the scene: the old finish existed, but the ground and surrounding objects did not establish a maintained refuge.

## Delivered

- An elliptical, evenly striped putting green replaces the ordinary scattered turf detail in this clearing. Its texture has short grass grain and a clipped border; authored paths remain visible through it. Decorative understory is excluded from the green's interior. The region's existing lighting, hazards and movement rules remain authoritative.
- Two empty, worn slatted benches frame the onward route after the old-finish arch. Legs, feet, arm supports, slats and fastening detail share one static geometry. Matching box footprints stop walking bodies; open backs do not provide full-height sight cover. The wide middle route and access around each bench stay available.
- A flush brass cover marked `18 / CLOSED` replaces the expectation of an active final cup. It is scenery, not another required interaction. The arch's relocation notice, retained field checks and real exit requirements remain intact.
- Existing Dead Green nature/site audio suppression remains. A bird-scatter warning requested inside its silent core becomes directional ground fog with the same duration; Joe and the underlying encounter are unchanged. Outside the core, birds remain available.
- Three static meshes, three geometries, two prepared textures, no extra lights or animation update. Turf512x256 and cup128x128 amount to576KiB base RGBA before mipmaps/driver overhead. Resources participate in existing world disposal. Initial program/texture totals remain69/102 through these tests; this is resource evidence, not frame-rate acceptance.
- Updated the terrain bake for the new bench footprints. The bake tool now captures the current painter signature and fails immediately if that hook changes. Its existing lossless pixel comparison passes. New manifest entry: terrain-3f61a5581575724e.webp,3002486bytes. Prior manifest entries remain available.

## Evidence and corrections

- `verify-dead-green-refuge.cjs` passes hardware and software rendering. Actual W stops at y520.70 before each y525 bench; real lateral movement then W clears them. Ordinary W traverses the central clearing beyond y535. Pause freezes position/time; Reduced Motion/zero decoration preserve the scenery. New geometry/texture identities are unchanged across the sequence, and the terrain is loaded from its bake.
- Inspected2560x1600,1280x720,844x390,390x844 clearings; west bench, closed cup and software clearing. Benches were initially too far to the sides for the main approach; moved to x±45,y525. The cup camera was adjusted to show the inscription instead of clipping it. Portrait retains the existing landscape stage.
- Initial resource assertion incorrectly required all scene geometry uploads to be complete before any movement. First movement uploads four existing course geometries; a capture without a presentation fence also varied by one. Test now verifies unchanged identities for the added resources and records the whole-scene counts without claiming stable global memory. No memory/performance bug was concealed with a renderer change.
- Hardware final report: `output/dead-green-refuge/report.json`; software scenery/collision report: `output/dead-green-refuge/software/report.json`. The final hardware test also verifies silent-core fog replacement, birds outside it, unchanged warning duration and unchanged Joe state. No browser errors.
- Existing Dead Green observed-reveal/pause/retained-progress/traversal checks, zone-priority browser checks, encounter refinement including both exit victories, and release validation pass. Release observed70referenced images,90scenario definitions,no warnings. Syntax/scoped whitespace checks pass.

Full goal remains active. This closes the implemented Dead Green staging requirement, not human recognition, terror, relief or route-comprehension acceptance. Other zones, full-route pacing, the remaining gameplay/input/visual requirements, sustained performance and human listening/device sessions still require work.


Final installed-client check (87593): two iterations completed, latest page1/state1 inspected. Ready first_hole, terrainBaked true,26courseunits traveled, no failed assets or error artifacts, software640x360. All handles started this turn are terminal; existing4187server remains running. No agents or deployment.
