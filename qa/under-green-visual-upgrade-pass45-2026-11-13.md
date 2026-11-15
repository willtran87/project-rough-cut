# Under the Green pass 45 — shallow shorelines and flood light movement

Status: verified geometry, native/software visual-state checks, focused reflection review, installed gameplay and local rendering diagnostics. All owned jobs terminal. Previous goal turn pass44 was verified progress. Full53 requirements and seven whole-level gates retained.

## Implementation

`under-green-puddle-geometry.js` subdivides the original ShapeGeometry triangles twice, reuses edge midpoints and stores distance to the actual authored boundary. The shallow film thins across a nominal6cm pool margin and1.8cm runnel margin. The interpolated distance is an approximation between samples; the exact polygon footprint and1.2cm surface height are retained. No extra transparent layers, colliders, textures or lights.

`under-green-wet-ground-scene.js` applies the shoreline field to opacity and highlight strength, keeps the bed visible, quiets pigment variation and gives shallow water a restrained sharper practical-light response. Color0x323726/specular0x68755c/shininess86, center opacity.46, shoreline20percent of that opacity, existing slow fine wave motion retained. Channel surface and hazard spray are unchanged.

`under-green-flood-scene.js` uses the previously verified normal-matrix helper for two broader, slower analytic waves. The lighting slopes derive from a6mm plus4mm wave-height field; this is microscopic optical relief, not a displacement of the physical flood surface. Existing depth, wall waterline, wet residual band, opacity curve, rise/recession timing and movement penalty remain unchanged. Flood animationTime is exposed for real pause/reduced checks.

## Findings and corrections

The first centroid-shrunk shoreline folded a triangle in the concave crossing-runoff outline. The pure verifier caught it; the candidate was replaced by original-triangle subdivision. `pass45-water/hardware` and the saved inset helper are intermediate evidence, not final geometry acceptance.

Ordinary overhead views still make shallow pools look subdued. Additional views align the actual camera with existing lamp highlights, using collision-valid floor poses. The first focused review selected a keeper pose with a wall between camera and target. The final fixture now also requires lineClear; `pass45-reflections` and the extra reflected views in the software main run are not used for visibility acceptance. The focused corrected set is `pass45-visible-reflections`.

## Verification

- Pure geometry:8 patches,33,768 interior/exterior samples, exact authored boundaries and total footprint area within floating-point tolerance, positive winding/up normals and fixed height. No sampled overlap or coverage gap. New7,168triangles total versus448 originally, an increase of6,720 distributed among local light/culling partitions. Attributes are finite. Report:pass45-geometry.
- Final main native96views /75deterministic camera-turn steps; software104views /75steps includes8early reflected views excluded as noted above. All8channels in low/surge states,6pools,2runnels and each shallow site's flood phases41/49/60/70seconds, responsive1280x720/390x844/844x390, exact frozen-camera return, real pause and Reduced Motion pass. Native2560x1600; software960x600 target in desktop viewport. Waterline equals gameplay depth; finite flood clock freezes during pause and becomes0underReduced Motion. Zero page/console errors. Main artifacts:pass45-final.
- Actual flood GPU normal readback:18before/18after samples per renderer at41/49/60seconds, six camera orientations including roll/high angle, nonuniform mesh scale. Expected slope obtained by numerical differentiation of the height field. Maximum error.005546before(flat) and.004168after on both renderers, within8-bit readback tolerance. Artifact:pass45-flood-normals. Jobs75299/45241 terminal0.
- Installed client:five bursts, finalshot4/state4 inspected, ready/playing(0,8.84), no error artifacts. Initial Preparing timeout recovered in later actions. Job17712 terminal0. Artifact:pass45-client.
- Native gallery/pump/keeper shallow views, gallery high flood and final gameplay inspected. Pump reflection view shows a restrained warm sheen and visible submerged paving. Gallery ordinary-angle pool remains subtle; no claim of complete all-angle water-art acceptance.
- No solid geometry was added or moved. Exact flat footprint/height coverage plus unchanged collision sources replaces an unnecessary full scythe-clearance rerun for this pass; the whole-level clearance gate remains open.

## Remaining acceptance

V22/V25 remain in progress. Review full-height flood edges and material transitions in all districts, including roots, machine feet and keeper walls. Shallow/channel/flood visual differentiation and all-light reflection quality still need a coherent final art review. No checkpoints, gameplay input, Joe behavior or banner changes. Full Level1 comparison, ordinary full-route play, accessibility and performance gates remain open.

## Final focused review and cost

Corrected line-clear reflection fixtures cover crossing runoff, bunker seep and pump spill:6before/after views per renderer. Native bunker/crossing/pump and software pump screenshots inspected; warm sheen stays within the wet footprint and paving is visible through the film. Gallery, range and keeper do not have a collision/line-valid exact lamp-mirror camera in this fixture search; ordinary angle/flood captures cover them, but no special reflection acceptance is inferred. Jobs42173/15571 terminal0.

Six warm plus24alternating GPU-fenced samples per view, sequential native/software runs in pass45-budget:

| Renderer/view | Before median/P95 ms | After median/P95 ms |
|---|---:|---:|
| Native puddle,2560x1600 |8.9/11.8|9.1/10.9|
| Native flood,2560x1600 |10.1/11.8|9.3/10.9|
| Software puddle,960x600 |46.6/51.2|49.4/65.5|
| Software flood,960x600 |60.6/75.2|62.5/71.3|

Each sampled view submits3,240more triangles, with unchanged draw counts(native126puddle/153flood;software40/67),59textures and140programs. Software puddle median andP95 worsen; absolute software cost remains poor. These diagnostics record the cost rather than accepting full-level performance. No other verifier was present in the observed software timing process inventory; shared-machine timing remains variable. Jobs45300/59057 terminal0.

The8shallow meshes contain4,520vertices/7,168triangles in total. Their9float attributes plus16-bit indices occupy205,728bytes before partition overhead, versus17,536bytes for the old geometry, a188,192byte increase. No new images or material batches. All7final runtime/verifier sources are snapshotted and hashed in pass45-source/final-hashes.json. Server4187 preserved.

Ledger remains28implemented/24in_progress/1pending; V22/V25 advance but remain partial, allseven release gates pending. Next: full-height flood-to-wall/root/machine contact review and coherent whole-route water art, then remaining material/architecture/presentation requirements.
