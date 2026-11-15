# Pass105: range coating and surface variation

Previous goal turn: progress. Six current native district captures and the Level1/opening-art comparison identified range panel/stain repetition as a concrete next improvement. The complete53requirements,48refinements and seven full-level gates remain the objective.

## Retained candidate

The old627px repeating panel tile is replaced with a1254px square painted-steel field. Three unequal coating-failure areas sit among quieter paint, fine chipped boundaries and short coating fractures. Built-in image_gen produced v1; its green, smooth preview was rejected, and an edit produced the retained grey-green v2. Both exact prompts and source provenance are saved adjacent to the project assets. The generated v2 PNG is copied unchanged into the workspace.

Physical sampling remains313.5source texels/metre: the full field spans4m versus2m for the old tile. Mirrored wrapping avoids opposite-edge color steps. Separate wall planes receive fixed-coordinate UV offsets so opposing walls do not show identical damage; coplanar surfaces retain continuous coordinates and the same physical scale. The folded lining keeps its authored physical UVs. Independent wet masks, source lighting, material opacity and no-albedo-bump treatment remain.

No geometry, light, collision, signal, route, simulation or control changes. The scene hook only changes rangeStone UVs; the material-loader hook replaces its albedo. New runtime helper: web/under-green-range-panel-uv.js. The1254x1254 RGB source is2,088,213bytes; replacing a627x627 RGBA GPU map adds approximately6.00MiB including mipmaps. This is an estimated texture allocation delta, not measured process memory. Texture count and fragment sample count remain unchanged.

## Verified local evidence

- Native and software paired verification both passed35captures each. Native actual2560x1600 plus1280x720,390x844 and844x390; see report rows for software's smaller actual render target. Approaches, return, folded lining, both wall close-ups, side/detour, flood, Q, crouch, reduced motion and camera return covered. No recorded browser errors.
- Native318structure meshes have exact before/after hashes for positions,normals,indices and transforms; software checks its own structure set. Both renderers preserve96signal sightline samples and1,920legal camera-clearance poses. Opaque material and existing closed lining topology remain verified.
- Gallery, bunker and keeper control JPEGs are byte-identical on each renderer. Paired player state, physical light records, render resolution and texture counts match.
- Native approach remains245draws/249,100triangles; side378/371,941; wall close271/305,335. Programs remain218. No extra draw calls or geometry introduced by the UV offsets.
- Inspected refined native approach, side and wall close-up plus compact portrait. The new broad field separates coating failure from quieter paint; wide bay arrangement, construction history and full district artistic acceptance still need work.

The verifier's initial close fixture was inside the collision boundary and was corrected to a legal point. A second verifier failure came from reusing the geometry property for both scene hashes and the existing lining unit report; separate sceneGeometry now preserves the actual comparison. Neither issue required a runtime geometry change. Only terminal passed reports establish the final result.

## Terminal final checks

Serial session67055 exited0 after both timing runs, the installed client and targeted range low-light verification. Native medians approach23.1->22.0ms, wall17.8->16.7ms, side22.7->22.3ms; P95 25.0->24.2/19.6->18.1/24.6->24.6. Software medians187.1->187.2/128.7->128.1/184.5->183.3; P95 198.5->202.4/133.1->131.9/193.0->190.8. Six warm pairs and24alternating GPU-fenced samples per view; this is local cost evidence, not a whole-route frame-rate claim. Absolute software performance remains unacceptable.

The installed client completed10bursts, ready/playing at(0,8.584),checkpoint0,with no error artifacts. Finalshot9 inspected. The initial Preparing-click timeout recovered through subsequent menu input, as in the preceding pass; no gameplay-client script was modified.

The existing dark-readability verifier now accepts an optional --district=range filter; default full-level behavior remains. Targeted native verification passed27captures: eight actual water-phase fixtures across range A/B, five attack poses, seven sequence images, responsive crossing/attack views and reduced motion. The complete windup/sweep/recovery sequence contains76sampled frames at30Hz with changing actual lamp clocks and hand/foot/blade alignment assertions. The range cut and surge images were visually inspected. This staged check does not establish real pursuit AI, ghost motion,60/120Hz motion or full-level hazard acceptance.

Software actual targets were960x600/960x540 plus390x844 and844x390; the2560 screenshot is an upscale, not native detail. Software652structure meshes preserve exact hashes and transforms. Software approach was visually inspected as well as native and compact views. All owned jobs are terminal; the runtime/asset hashes in output/under-green/visual-pass105/source-manifest.json still match after testing.

## Remaining scope

No requirement status promotion for this material pass.33implemented/19in_progress/1pending; all seven full-level gates remain pending. This is progress on V02–V04 and V09/V11's broader range composition, not full Level1 parity. The remaining work includes authored bay/construction variation, complete gallery/crossing composition, root/soil/water integration, pump/keeper composition, actors in motion, illustration continuity and whole-route performance/accessibility. Software absolute cost remains an open problem.

Full user invariants remain: Level1 movement, noninverted vertical mouse, E interact/Q lookback, entrance-only retries, sound-led tension, visible-slow/unseen-fast Joe with grass scythe, continuous moving ghost fades, periodic whole-level flood and opaque walls.
