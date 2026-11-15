# Back Nine: course-edge compounds

Partial progress toward the full 48-item objective, principally BV17–19, BV21, BV23 and BV25. This does not establish whole-level parity with Level 1. The preceding goal turn produced a requested list rather than implementation; this pass revalidated the unfinished compound source and completed its integration and local verification.

## Visible change

- Irrigation tank yard at (-51,250): braced elevated tank, bands and rivets, roof cap, ladder, overflow and valve, low masonry enclosure, open pump shed, equipment bench and removed pipe sections on a pallet.
- Abandoned practice shelter at (49,536): five bays, weathered structural frames, mats, benches, ball baskets, one missing roof bay and a sagging catch net with a torn lower section.
- Ruined members' pavilion at (-49,668): masonry foundation, columns and capitals, timber framing, a partially missing east roof, exposed rafters, benches, fallen boards and empty planted containers.
- Three irregular sediment margins blend the slab edges into the existing rough apron. They reuse the illustrated soil material with vertex alpha and are positioned just above the rough surface. These are local foundation-edge details, not full contact-shadow implementation.
- The district builder now contains seven sites. It relocates 17 existing boundary trees, compared with six in the four-site baseline, to open views and place groves behind the structures. Tree count is preserved. All new structural vertices remain outside x=±40.8, behind the existing fence; these are scenery compounds, not new playable interiors.

Production lives in `web/back-nine-course-compounds.js`, integrated through `back-nine-district-scenery.js`. HTML import-map versions are `20261114-compounds-2`. Existing maps/material batches are reused. No added light, texture or animation loop. Collision, routes, Joe behavior and restart rules are unchanged.

Also removed an older duplicate `course-features.js` import-map entry that overrode the maintenance-bay cache version. The map now has unique keys and honors `20261114-maintenance-2`; HTTP reads prove both query URLs currently serve identical module bytes (`cache-correction.json`). This corrects cache invalidation without a runtime source change.

## Verification

Evidence root: `output/back-nine-visual-upgrade/compounds`.

- `node tools/verify-back-nine-district-rules.mjs` passes: 1,115 pieces across seven sites; finite vertices and unit normals; all geometry outside the playable boundary; grounded foundations; tree count/interior-tree preservation; structure and reservoir clearance. Added rays verify outward-facing pavilion roof/underside and actual missing roof sections in both pavilion and practice shelter. Sediment checks cover upward normals, apron clearance, bounded alpha and a fully transparent outer edge. `geometry.json` contains the result.
- `tools/verify-back-nine-compounds.cjs` passes on native D3D11 and SwiftShader. Nine normal gameplay-camera views cover driving approaches, nearby foot views and reverse views. Additional checks cover pause/resume, both relay states, full restart to the beginning, stable program/texture counts, and 1280×720/390×844 layouts. Initial viewport is 2560×1600; native scene is 2560×1440, software scene 960×540. Both reports contain empty console/page-error arrays.
- Accepted captures are `grounded-native` and `grounded-software`. `before-final-native` uses the saved pre-compound district module at the network boundary. Earlier `before-native`, `after-native` and `final-native` are intermediate captures. The first pump-near fixture intersected the existing cistern; final fixtures use legal positions and assert collision clearance before every capture. This was a test placement issue, not changed gameplay collision.
- In nine matched native views, all player/cart/Joe/time/progression states are identical. Programs remain 32 and textures 53. Draws increase by 1–2; visible triangles by 1,088–3,832, including tree relocation and sediment. `resource-comparison.json` records each view. These are resource counts, not a full frame-time budget or a claim of no performance cost.
- The installed standard web-game client ran through `tools/verify-presented-client.mjs --back-nine --compound-art --high-resolution`, with and without `--native-renderer`, using `tools/fixtures/back-nine-compounds.json`, two 60-frame forward bursts. Both reach exactly (37.99184200420425,528.5127542188814), on foot at 6.6 m/s, with all page/canvas/state artifacts and no error artifacts. Actual final screenshots and state were inspected. Native retains 2560×1440; software drops to 640×360. `client-checks.json` records final state and scoped timing: native average 11.17/P95 12.10 ms; software average 114.13/P95 150.90 ms. These short runs do not prove combined-load performance.
- The existing district suite also passes with all seven expected site IDs, checking the original nursery, range-board and terrace views plus its interaction/layout/restart checks. Report: `existing-districts-native/report.json`. Range and clubhouse-approach screenshots were inspected; no new browser errors.

Images inspected include native pump approach/near, pavilion near, practice near/approach, software practice/pavilion reverse, ordinary desktop, portrait and both standard-client final pages. The existing Level 1 service-building reference was inspected earlier in this chat. The new silhouettes improve district recognition; fine equipment remains subdued under night lighting.

## Still open

- Broader middle-distance composition inside the playable course, more varied ground/planting, stronger distant layers, and purposeful lighting of existing landmarks.
- Full close-detail/material parity, richer prop stories and more natural integration across the whole course. These three sites do not finish the district requirements.
- Software fidelity and performance remain inadequate. Thin catch-net wires visibly alias at the reduced software resolution; foreground foliage also retains previously observed shading differences. Do not accept BV01/BV02/BV48 from these captures.
- Player/Joe motion, broader static grounding, encounter framing, camera quality, and the remainder of all 48 requirements remain active.

No agents, commit, deployment or CUA. Existing server 4187 and unrelated chapter work are preserved.
