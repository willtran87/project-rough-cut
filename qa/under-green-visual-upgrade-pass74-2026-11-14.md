# Pass 74 - contoured bunker soil banks

Previous goal turn: progress. Pass73 completed channel shores and matching impact heights. This pass advances the bunker bank composition while retaining all53requirements,48refinements and seven pending whole-level gates.

## Implementation and visual decision

The bunker now has closed, shallow contoured faces along22existing retaining edges. Each face contains three strata with shared uneven boundaries: a lighter sand seam between darker root-bearing soil. Broad swells sit between existing supports, with flattened pockets at posts and shoring seats. The new face spans1.88to4.90m high and intrudes at most0.231m from the original edge, above the ordinary walking envelope. The old opaque bank boxes, retaining foundations, coping, eight mud spills, two repairs, varied supports and inspection well remain intact.

The first preview used the existing mud material across the upper face. It passed functional checks but visually buried too much detailed soil artwork under a broad clay surface. That treatment was rejected. The final version retains the illustrated root/gravel soil and sand maps, using contour and actual stratum boundaries to interrupt the long planar bands. There are no new textures, lights, material types, collision objects or gameplay changes. UVs remain anchored at the existing two-metre material scale. Individual closed volumes overlap the original backing, so the shape change cannot open a view outside.

Runtime files: web/under-green-bunker-bank-face.js and web/under-green-bunker-retaining.js. The new helper emits66parts/8864vertices/17464triangles into existing material/cell batching. This is a bank composition refinement, not acceptance of the entire bunker or full Level1 parity.

## Verification

Artifacts: output/under-green/visual-pass74/. The baseline routes only the saved pre-pass under-green-bunker-retaining.js; all other sources match the current build. The candidate uses current runtime sources.

- Geometry unit check verifies finite positions/normals, bounded intrusion/height, ordered layer seams, outward front orientation, consistent winding and every indexed edge used exactly twice in each closed volume. All22edges/66parts pass. Browser stats match66parts/17464triangles.
- Preview25685 passed28views but its broad upper mud material was rejected visually. Revised soil preview4081 passed28views with outside triangle fingerprints unchanged.
- Final native65903 and software20894 both end successfully with37captured views/states each:14paired fixtures plus responsive corridor/close-bank views, crouch, Q rear and reduced motion. Fixtures include both travel directions, main route, close spills/repair, upper seam, high flood and gallery/keeper controls. Camera-return screenshots remain exact; pause elapsed time is frozen.
- Each renderer checks4536legal camera poses along the real retaining edges, including close wall positions, standing/crouched heights, pitch/FOV extremes and portrait/landscape aspects. Zero scenery hits.
- Each renderer checks six bright exterior sentinel positions at two wall heights and three distances. A visible positive control is required first; all exterior placements produce zero magenta pixels. Opaque enclosure is preserved.
- Triangle fingerprints outside the sand/soil bank dressing envelope match exactly:288295native and213563software triangles. Existing coping/spills/repairs/shoring stats remain unchanged. All paired player, physical light, texture count and resolution states match. Gallery and keeper control JPEGs are byte-identical within both renderers. Zero recorded errors.
- Actual native resolutions:2560x1600,1280x720,390x844,844x390. Actual software:960x600,960x540,390x844,844x390. Software captures at2560viewport are upscaled960x600 scenes, not native2560detail.
- Dry full-route clearance job38160 passes1379sampled frames/106actual actor geometry audits, with no intersections. Maximum foot error2.415e-7m; no page errors.
- Installed web-game client79797 completes eight bursts with ready/playing, checkpoint0, elapsed1.533s, position(0,10.12), actual960x540. Initial disabled Preparing click times out, then Enter bursts recover. Finalimage/state inspected; no error artifact. Route geometry and bunker fixtures provide coverage beyond this entrance input check.

Before/after corridor, revised main route, close bank/spills, reverse direction, upper seam/inspection well, native portrait and software corridor/landscape images were opened and inspected. Fine root/gravel detail is retained; brighter seam boundaries remain local to actual soil layers. The framing remains dark and the supports/route stay visible.

## Cost and limits

The total added geometry is17464triangles, with no new textures, light sources or shader programs. Most checked native views retain their draw count; the repair view rises348to349because changed bounds expose one existing material batch. Gallery-control pixels remain identical even though its submitted triangle count increases, so this pass does not claim perfect offscreen submission efficiency.

After all owned visual/route/client jobs ended, sequential GPU-fenced timing began. Native16820 ends successfully: corridor16.7to17.5ms, close bank11.1to11.3ms, main route22.9to21.8ms (baseline to candidate medians). Three otherchapterjobs were live in the saved process inventory. These paired local diagnostics are not production pacing acceptance or evidence of a speedup.

Software42837 ends successfully after the hardware job: corridor127.6to143.7ms, close bank75.2to87.4ms, main168.5to189.5ms. This is a material local regression (12.2to21.0ms); keep it visible. The existing opaque backing plus new faces may introduce extra overdraw, an inference requiring a component profile. Whole-level software performance was already below target and remains unqualified; this pass does not waive that requirement. All owned jobs are terminal, and all five runtime/tool snapshots match the retained SHA-256 manifest. All full-level gates remain pending.

Remaining: full bunker approach/lighting/story integration, range and keeper compositions, complete gallery art acceptance, matched current Level1 review, actor/motion/accessibility and ordinary-frame performance. No requirement status is promoted solely by this local refinement.
