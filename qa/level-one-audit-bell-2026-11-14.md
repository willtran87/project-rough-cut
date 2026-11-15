# Level 1 Audit Bell craft

Partial V01/V08/V09 progress in the full35-item/V01–V21 visual upgrade. This is one hero-prop pass, not whole-level artistic acceptance.

## Change and evidence

The previous lathe profile ran downward around the exterior, producing inward radial normals there and outward normals on the cavity. A close view could therefore show the rear cavity rather than the near exterior, with a visibly broken lip silhouette. `web/course-audit-bell.js` reverses the traversal, closes the narrow crown wall and retains the original radius.34/height.55 envelope. The exterior now faces outward and hides the rear cavity. The mouth stays open from below.

The new384×256nearest-filtered bronze atlas has separate outer/inner bands, height-aligned texels, connected casting variation, shoulder/bow lines, patina concentrated near the crown and lip, abrasion along the striking edge, and two small041cast stamps. A quarter-turn in cylindrical UVs presents those stamps to the western approach and its reverse. Strokes use integer texels; pixel detail stays attached to the moving bell. The Lambert material has zero emissive and retains48-step light quantization under actual course lighting. Initial low-contrast artwork was revised after inspecting live images; final-native/final-software are the accepted captures.

`pixel-world-props.js` uses this body in the existing moving group. A suspension eye joins the crown to the timber beam; the clapper shaft extends into that eye and overlaps its striker. The middle rim radius now follows the shell instead of floating outside it. Original station anchor, facing, pivot, scale, use radius, interaction/response and gameplay state remain. The existing station lantern supplies light. No additional source or ambient increase.

## Verification

- `tools/verify-course-audit-bell.mjs`:132exterior and66cavity normals checked;32radial rays hit the near exterior before the rear cavity; a ray from below reaches the inner wall; finite geometry/UVs and original footprint. New shell640triangles/363vertices.
- `tools/verify-course-audit-bell.cjs`:nine views each for before-final-native/final-native/final-software. Approach/front/side/near/rear,1280×720,390×844, actual ringing and reduced motion. High desktop viewport2560×1600 renders2492×1402; ordinary native1193×671, portrait379×833. Software frozen views960×540, portrait486×1067, actual motion reduces800×450→640×360.
- Actual E input completes Audit Bell, updates the next objective and animates the original moving group through24frames. Escape pause freezes the pose; reduced motion settles it. Repeated frozen renders retain warm texture/program counts. Scene rebuild releases the new geometry/material/map exactly once on both renderers. No page/console errors.
- Existing `verify-audit-response.mjs` passes deferred one-shot source, hush, pause, answer pose, reduced motion, restoration and interruption.
- `comparison.json` checks unchanged station anchor/facing/pivot/scale and all lantern positions/practical source data in nine matched native views. New resources:+1geometry,+1texture,+1program. Recorded rendered additions are1–2draws/352–704triangles depending on the view/pass. Static mesh addition is352triangles:64for the closed crown strip and288for the eye. No whole-level performance claim follows from these counts.
- Installed standard web-game client, through existing `verify-presented-client.mjs` with new optional `--audit-bell`, uses real E/left input for two bursts on both renderers. Both finish first_hole,x77/progress153,1/3checks complete, first action completed, no error files. Actual screenshot/state inspected. Native2492×1402; software640×360 remains an unresolved quality/performance limitation. The short software run includes startup/warm-up and is not a paired performance comparison.

The first fixture revision mistakenly read the compositor's draw count. It was corrected to `RCScene3D.stats()` before final-native/final-software/before-final-native comparison. Earlier after-native/after-software and before-native captures are intermediate, not final resource evidence.

Inspected actual baseline/current side, close, front, ringing, ordinary desktop, software phone and both client views. The main approach now shows an intact bronze shell and readable local pixel wear/stamp. Broader machinery/prop materials, world shadow composition, first-person art, route composition and software fidelity remain open.

Artifacts: `output/level-one-audit-bell`. Source snapshots and hashes accompany the reports. The client wrapper change only activates with `--audit-bell`; other chapter fixtures are preserved.
