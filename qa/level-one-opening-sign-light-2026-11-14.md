# Opening sign: physical reading light

Partial V08/V10/V11/V19 progress. The full V01–V21 goal and latest30-item checklist remain active.

## Implementation

The original opening sign remains at game(-22,40), height1.55m. Its face and frame now use actual Lambert lighting. A shielded reading fixture adds a metal hood, overhead mounting arm, fasteners, guarded underside lens and one warm spotlight. Twelve fixed parts add432vertices/144triangles to the existing body geometry; the lens is one additional two-triangle mesh. The960×672 text atlas, wording, arrows and state changes remain.

This is one sign-mounted light, not another path lantern. The28 symmetric path lanterns, ambient0.005 and all existing source locations/powers remain. The spotlight has power1.2, range1.85m, and a512×512 shadow map. Its sphere stops0.157m above the level floor, retaining dark ground between path sources. The panel has zero emissive contribution.

Only the opening board receives the new materials. The other14 optional navigation boards retain their existing readability treatment pending their own lighting/placement review. Default forward batches rise2→3; full navigation uses7 because the opening material groups split the two existing batches. This pass does not accept whole-family lighting consistency.

The first bracket candidate cast a large triangular shadow over the lettering. Moving its arm above the source removed that obstruction. Previous material-only and in-path relocation candidates remain rejected in the separate sign-lighting study.

## Shadows and bounded lighting

The static reading-light shadow is reused while Joe is away. It refreshes for nearby Joe movement/gait, arrival/departure, navigation visibility changes and time resets; pause retains it. The6m horizontal guard includes the1.85m light volume and actor extent. Existing verge/first-person effects do not cast into this volume. Rebuild cleanup explicitly disposes the shared atlas once despite two materials referencing it.

The first timing pass exposed excessive shadow redraws and spotlight calculations on surfaces outside its range. `course-bounded-spotlights.js` skips cone/shadow/BRDF work only when Three's existing finite attenuation is exactly zero. It preserves unlimited lights and every in-range source. Both fixed lantern materials and the specialized ground shader use it; vendor code is unchanged.

## Verified evidence

- `verify-course-sign-lamp.mjs`: static reuse, arrival, movement at the same timestamp, gait, departure, pause, navigation changes, reset, fixture width and bounded range pass.
- Native/software sign fixtures:490 sampled lettering rays have zero mounting obstructions. On/off/on panel RGB totals are native1,187,192 /11,757 /1,187,192 and software1,159,935 /16,594 /1,159,935.
- Four Joe poses produce three distinct shadow hashes; each cached map equals a freshly rendered reference, and departure exactly restores the original static map on both renderers.
- Ordered objective completion, optional navigation, key/valve and exit states, actual keyboard Use, pause, warm resource stability and exact-once atlas/face/shadow-target disposal pass.
- The full1,836-vertex opening assembly stays at least1.6444m from every path center, beyond the1.08m walking-lane margin. Source inspection confirms all run variants share `RCQuality.paths` through `spatialCourseData`.
- Native and software `--spot-oracle` compare the bounded shader against Three's original spotlight block in opening/front/reverse/range views at960×540. All eight comparisons have zero changed channels. This checks whole rendered world samples, not just source statistics.
- Final native2560×1600, ordinary1280×720 and phone390×844 sign captures inspected, plus software front and native lamp-off. The aimed narrow view crops a little outer frame; lettering and lamp remain visible without HUD overlap.
- Installed client completed8bursts and reached actual first_hole at x13/progress24/travel34 with no error artifact. Shot/state7 inspected. This adaptive software capture verifies input/startup, not high-resolution art quality.
- Existing fixed-light grid unit verification still passes28,644 membership samples and exact-once field disposal.

Artifacts: `output/level-one-sign-lighting/after-native`, `after-software`, `client`, and baseline source snapshots. Final source hashes are recorded alongside them.

## Performance limits

The initial `budget.json` only used `gl.finish()` and primarily measured command submission; do not use it as completed GPU cost. `budget-readback*.json` uses synchronous pixel readback and alternates source disabled/enabled/enabled/disabled,24warm samples per round,960×540. It excludes backdrop/composition and retains the changed panel materials in both cases, so it measures source overhead rather than the entire feature against the old scene.

Caching removes the repeated57–128 extra shadow draws while Joe is away. Final steady counts add only the lens draw near the sign and no draw at the range. Nearby Joe still incurs required shadow refresh work. Software timing remains poor and variable: final paired mean-of-round-medians source off/on is78.75/119.4ms opening,79.1/100.55ms sign,62.55/69ms range. These results do not prove a speedup or acceptable overall performance. The whole-level V21 gate remains open.

Final native paired source off/on medians are7.0/6.45ms opening,6.15/6.45ms sign and6.6/6.9ms range; the reversed opening result is ordinary host/timing variation, not a speedup claim. The installed client reports completed software scene average87.28ms/P95104.3ms across120samples. Its9.54ms average CPU submit value must not be presented as full rendered-frame cost.

## Workspace and remaining work

C: filled during this continuation. Automatic approval review rejected deletion of an abandoned Playwright profile with “blocked by policy”; it was left in place. Browser temporary storage moved to task-specific F: storage. Generated wind and pennant evidence was moved to F: with workspace junctions preserving all original paths; all71wind and52pennant files matched their pre-move hashes. No source/art asset was deleted. Text artifact compression also ran; source content was preserved.

The67files of this sign-lighting pass were subsequently moved and hash-verified the same way. Actual storage is `F:/CodexArtifacts/project-rough-cut/{level-one-wind,level-one-range-pennant,level-one-sign-lighting}`; all existing workspace artifact paths remain usable through junctions. Runtime source stays in the project.

Next work retains all categories: broader sign/source integration, material density and construction parity, terrain/vegetation composition, character transitions, atmosphere and whole-route visual/performance acceptance. This local reading-light improvement is not completion of the full upgrade.
