# Pass104: distinct bunker soil and sand

Previous goal turn: progress. Pass103's current Level1/district audit identified repeated diagonal soil artwork and continuous bank bands as a concrete next defect. This pass addresses that defect while retaining the complete53-requirement/48-refinement/seven-gate scope.

## Retained visual work

The bunker has a new pixel-art atlas with two887x887 fields: compacted root-bearing earth and quieter granular sand. Built-in image_gen produced `web/assets/under-green/bunker-earth-sand-v1.png`; its exact prompt and original generated path are saved in the adjacent prompt.txt. The atlas is unchanged from the generated image. Runtime slicing supports a two-column/one-row atlas and preserves313.5source texels/metre. Mirrored wrapping joins opposite source edges without a color discontinuity. Existing mud, bark, masonry, timber and the floor's sand field remain.

Sand lenses vary from4to68cm in depth, with unequal placement along each bank. An opaque material blend mixes soil into their granular edges; narrow sections visually disappear into the earth. Shared front normals prevent hidden closure caps from drawing a dark line at each material boundary. The underlying closed banks, conservative backing, collision, supports, mud spills, coping, roots, wells and gameplay remain.

The first preview's pale continuous stripe was rejected. A second preview exposed a shading seam, fixed with shared face normals. Control-image analysis then identified a small gallery change: the legacy sand material also covered pipe insulation. Actual raycasts hit that insulation at(-2.61,3.13,-30.72). The final `bankSand` material is restricted to bunker placements, preserving the original insulation/collar material. Final gallery and keeper control images are byte-identical to baseline on both renderers.

## Verified final evidence

- `final-hardware/report.json` and `final-software/report.json`:37views each, including forward/return, close banks/spills, main route, inspection well, flood, crouch,Q,reduced motion and four viewport sizes. No recorded browser errors. Native actual targets2560x1600,1280x720,390x844,844x390; software960x600,960x540,390x844,844x390. Software screenshots do not represent native2560detail.
- Each renderer:4,536legal camera poses covering near-wall positions, standing/crouched heights, pitch/FOV extremes and portrait/landscape aspects; zero hits. Six exterior sentinel placements at two heights/three distances remain fully occluded, with a visible positive control first. Camera return remains pixel-exact; pause freezes elapsed time.
- Geometry:22edges/66closed parts,10,526vertices/14,730triangles. Finite normals, consistent winding, every indexed edge used twice, ordered shared seams and bounded intrusion pass. Relative to the previous bank:1,662vertices/1,926triangles added; maximum intrusion remains0.231m and height1.88–4.90m.
- Backing:34,056rays across66cases verify the trimmed original bank plus closed dressing retains the original ray-hit surface/opacity. Exterior triangle fingerprints remain identical (302,511native/227,779software), normalizing only the renamed bankSand material label.
- Preserved133coping stones,eightdeposits,tworepairs andten shoring spans. Paired player state, physical lights and actual render sizes match. No new lights or collision objects. Bunker draw counts remain348corridor/44close/458main; final scene programs218 versus220baseline; uploaded textures increase byfour. Two887px albedos plus two256px wet masks add approximately8.67MiB mipmapped texture storage, not a measured process-memory figure.

Inspected full-resolution final corridor, reverse/inspection well and close bank; compact portrait and software corridor; prior iterations' control and seam views. The new broad earth field preserves smaller root groups and quieter soil rather than covering everything in the rejected pass74 clay treatment. Sand is distinct and its margins are interrupted. This does not establish complete bunker/Level1 artistic parity.

## Gallery criterion from the current audit

V07's construction criterion is accepted: pass103 entrance, oblique and reverse views show the gallery as old drainage construction, with closed masonry vaults, fitted ribs, recessed/damaged plaster and supported pipes. Earlier vault/repair geometry verification remains supporting evidence. Pass104's final gallery control is exact to baseline. This closes the specific construction requirement, not V11's full-route composition or the matched-Level1 release gate. Ledger becomes33implemented/19in_progress/1pending; allseven gates remain pending.

## Terminal final checks

Final serial session26721 exited0. Native paired warm frame medians were corridor13.3->10.9ms, close bank7.9->7.7ms and main16.1->15.0ms; P95 were14.6->13.6,9.5->8.8 and18.6->18.3ms. Software medians were146.1->146.0,107.8->109.0 and177.2->174.1ms; P95 were154.0->148.8,114.7->134.9 and183.0->182.8ms. These are three local, alternating GPU-fenced stationary comparisons, not whole-route frame-rate qualification. Absolute software performance remains unacceptable.

The installed gameplay client finished10bursts, ready/playing at(0,8.584),checkpoint0,with no error artifacts; finalshot9 was visually inspected. Its initial Preparing-click timeout recovered through subsequent menu input. The current dry simulation route completed1379frames with106actual actor-geometry samples, no intersections and maximum foot error2.4146861866040165e-7m. It is a seeded simulation/pose audit, not a real-time ordinary-input playthrough.

Fresh dark-hazards/report.json passed96staged views without browser errors, covering eight water channels, five actor contexts, darkest lamp phases, responsive views and reduced motion. The bunker cut image was inspected. This supersedes the pass103 ENOSPC failure for those checks; it does not prove full pursuit AI, ghost fades, 60/120Hz attacks or whole-level flood acceptance.

The source manifest matches the retained pass104 files, using the pre105 snapshots for the two files subsequently changed in pass105. All owned pass104 jobs are terminal. Pass105 edits are separate evidence and are not retroactively covered by these results.

## Remaining scope

Range bay/stain repetition, wider gallery/water/pump/keeper composition, material coherence in motion, whole-route performance/accessibility and allseven release gates remain open. No gameplay rule changes: Level1 movement, E interaction,Q lookback, entrance-only retries, sound-led tension, continuous ghost fades, unseen-fast/visible-slow Joe and whole-level flood remain in scope.

Storage recovery preserved all final evidence: native NTFS compression of own JSON evidence, then eleven obsolete partial reports removed only after deep equality with their completed passed final reports. Duplicate-removal manifest is `output/under-green/duplicate-interim-reports-pass104.json`;394,706,436logical bytes removed. No unrelated files or processes were removed.
