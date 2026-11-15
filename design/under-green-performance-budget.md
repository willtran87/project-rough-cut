# Under the Green — local performance acceptance

These are scenario-specific engineering targets for the existing renderer, not a claim that every device is qualified. Measure actual production context (`preserveDrawingBuffer:false`) and ordinary real-time simulation/render/audio/HUD work. Keep deterministic stepping separate from frame-rate evidence.

| Environment / workload | Target | Regression threshold |
| --- | --- | --- |
| Local RTX 3090 / ANGLE D3D11, 1280×720 at default FOV or 2560×1600 at FOV 85, full requested resolution | 60 rendered frames/s | Each warmed 30-second route window averages at least 55 submissions/s; RAF p95 at most 17.5 ms |
| Local SwiftShader fallback, the same viewport/FOV scenarios, automatic quality beneath the user's maximum | Near 30 rendered frames/s | Each warmed route window averages at least 24 submissions/s; RAF p95 at most 33.4 ms; at most one GPU frame outstanding |
| Repeated complete routes and checkpoint starts | Stable resources and bounded retained state | After a complete route has uploaded district resources, geometry/texture/program counts remain unchanged; 16 fixed audio voices (eight channel sources plus eight other voices); post-GC JS heap growth under 5 MiB; gameplay events at most 50, local telemetry events at most 256 |
| Repeated attempts | Same gameplay outcomes under real-time scheduling | Walking, wet, sprint and checkpoint tapes finish with the same outcome and position (within 1 mm) as their verified fixed-step simulation; no context loss or page errors |

Use `tools/profile-under-green-soak.cjs --seconds=300`, then the same command with `--software`, sequentially. The tool records ordinary movement/use/look input from the existing map-aware QA pilot and replays it through the production update loop. It does not teleport actors inside an attempt or replace live AI with recorded enemy positions. Local telemetry is enabled to exercise its bounded storage. The script verifies the input tapes against the simulation before launching the browser.

Use `tools/analyze-under-green-soak.cjs` and its `--software` variant to evaluate raw samples. Reports separate stability checks from frame-rate targets. Failing a performance target must remain visible even if resource checks pass. First-time uploads are warmup, not evidence of leaks: begin resource comparisons after a complete district traversal, while retaining all initial samples in the raw report.

Both tools accept `--output=PATH` to retain a separate candidate's evidence. The per-channel water audio candidate uses `output/under-green/water-audio/soak`. Historical reports without `audioVoiceCapacity` describe the earlier nine-voice graph; do not reinterpret them as measurements of the current 16-voice graph. The new voice budget requires fresh sustained measurements.

The runner also accepts `--viewport=2560x1600 --fov=85 --resolution=1`. This high-resolution scenario retains the same thresholds above, set before its measurement. The actual viewport, preferences, camera FOV, renderer scale and scene dimensions are sampled and checked by the analyzer. The current hardware width cap makes this scenario render at 1600x1000; software has a 960x600 ceiling and may adapt below it. It is not a native 2560x1600 scene or a guarantee for arbitrarily large displays. Keep its reports in `output/under-green/high-resolution-soak`.

Heap samples follow explicit garbage collection; those intervals are excluded from the RAF samples. Renderer counts measure object resources, not VRAM bytes. RAF and render submission rates do not establish display latency. A five-minute repeat is stronger than a short smoke test but does not prove hour-long or thermal stability.

The 2560×1600/FOV85 hardware run passes the five-minute budget. The original software baseline failed with a slowest warmed window of 15.75 submissions/s; the finite-light-cutoff candidate also failed and was removed from runtime. These historical reports remain intact. The current software path adds exact off-screen piece culling and an adaptive step matching the existing 50% software resolution (480×300 at this aspect). Its fresh five-minute run passes: warmed average 32.95 submissions/s, minimum window 24.31, RAF p95 16.7 ms, unchanged four-route outcomes and stable resources. See `qa/under-green-piece-culling-2026-11-12.md` and `output/under-green/piece-culling/adaptive-soak/`. This lower scene resolution preserves native HUD/control rendering and the user's maximum preference; it is not native 2560×1600 scene rendering.

The piece-culling pass above is historical qualification for that build. A fresh current-build measurement after subsequent scenery/actor changes fails the software budget: 25.72 warmed submissions/s with a 17.28 minimum window. The integrated off-screen actor optimization improves measured paired views without changing their pixels; its five-minute run averages 28.73 but still has a 23.18 window, below the unchanged 24 floor. Software qualification is therefore open again. The sequential current hardware baseline passes at 59.98 submissions/s. See `qa/under-green-actor-culling-2026-11-12.md` for source chronology, exact contracts, retained failures and limitations.

The profiler now records each independently verified tape's expected water-hit count and completion time as well as mode/position. A recovery route may intentionally contain a water hit; real-time replay must reproduce it exactly. The analyzer retains the zero-hit rule for historical records lacking a contract. Eight mutation tests verify rejection of outcome/time/contact mismatches and slow rendering. First-use windows are reported separately; they do not establish cold OS/driver caches or slow storage.

The subsequent bounded opaque-wall pass qualifies the defined current warmed software workload again: five minutes at 2560×1600/FOV85/requested resolution 1, warmed average 31.11 submissions/s and minimum window 26.29 against the unchanged 24 floor; RAF p95 16.8 ms. All four route contracts match, resources/16 voices remain stable, queue stays at one and no errors occur. Actual software scene settles at 480×300. Integrated 230-view comparisons preserve exact pixels. The first-use window minimum is 22.56 and remains an unresolved performance concern; it is reported separately, not excluded from the raw evidence. See `qa/under-green-solid-culling-2026-11-12.md` and `output/under-green/solid-culling/soak/`. Earlier failed builds and rejected candidates remain retained.

Remaining qualification: first-traversal rendering cost; other sustained display/aspect scenarios; slower storage/cold-start conditions; physical integrated-GPU and mobile devices; longer thermal/memory sessions; and actual controller/touch responsiveness. Keep unknown devices unqualified rather than inferring their performance from SwiftShader or the local desktop GPU. Any lower-quality adjustment must preserve native HUD/control readability, the player's resolution ceiling and unchanged simulation rules.

Follow-up: the first/repeated walking-lap diagnostic does not support a cache-only explanation for later slow windows; opening adaptation still takes several seconds. Its startup-calibration candidate is not shipped (`qa/under-green-first-use-2026-11-12.md`). The subsequent observed-approach attack changes simulation and responsive input tapes. Retain the renderer measurements above as evidence for their recorded build; refresh sustained acceptance before claiming the final pursuit build meets the full budget.

Current pursuit-build requalification (November12): approach-strike/service-grate/gallery-placement build passes sequential five-minute local warmed acceptance at2560x1600/FOV85/requestedresolution1. Hardware59.98 average/59.93 minimum; software28.51 average/24.33 minimum; bothRAF p9516.7ms. Allfour route contracts, stable290/56/21 resources,16voices, boundedheap/queue andzeroerrors. Software first-traversal minimum19.32 remains unresolved. Source graph and hashes show no UG/harness changes duringmeasurement. See `qa/under-green-current-build-performance-2026-11-12.md` and `output/under-green/current-build-soak/`; priorreports remain historical evidence. No cold/physical-device/thermal/human qualification is inferred.

Current steering/search/close-cover/bunker build requalified November12: sequential five-minute production hardware/software runs at2560x1600/FOV85 pass unchanged budgets. Hardware59.98avg/59.92minimum; software30.88avg/28.38minimum; bothRAF95 16.7ms. Stable290geometries/56textures/21programs/16voices, exactfourroutes, boundedheap/queue, noerrors. Softwareinitialwindowminimum29.45; this is one local run, not resolution of prior first-use variability. Content snapshots show no measured dependency,asset or harness changes. See qa/under-green-pursuit-build-performance-2026-11-12.md.


## Visual upgrade qualification (November 13)

The later visual-upgrade build is **not currently qualified** against the targets above. The historical November12passes apply to their recorded source snapshots. In pass8, the actual ordinary-frame run59693 at480x300 produced22frames/3069ms in the gallery and35frames/3060ms in the keeper fixture, with completion p95243.5ms/97.7ms; performanceAccepted remained false. Later per-feature GPU-completed comparisons at960x600 are cost diagnostics, not replacement production pacing acceptance. See qa/under-green-visual-upgrade-pass8-2026-11-13.md through pass13 and design/under-green-visual-upgrade-ledger.json.

Keep all17fixed practical sources and physical wall occlusion while investigating geometry submission, surface lighting and effect cost. Profile actual components before choosing reductions. Preserve high-resolution native art and deliberate fallback behavior; do not recover speed by returning to viewer-selected lights or exposing scenery through distant walls. Re-run ordinary-input production qualification after the completed visual build meets the functional/art gates. The no-checkpoint entrance retry policy remains authoritative; checkpoint references in historical workload records describe those earlier test builds.


November14 pass68 removes off-screen contact-shadow pieces on software while preserving the complete visible image.43comparisons perrenderer, all original attributes/indices and transparency order verified. Fixed-camera software median gains are modest (0.3–5.4ms in fourviews), with mixed P95 under other chapter jobs; native is unchanged. This is not production pacing acceptance. See `qa/under-green-visual-upgrade-pass68-2026-11-14.md`; ordinary-frame high-resolution/software qualification and allseven visual gates remain open.

Pass68 moving-camera follow-up includes per-frame bounds traversal and index-upload cost: paired software medians decrease5.1/3.8/7.5/15.0ms in crossing/pump/range/bunker. Shared-host contention remains recorded; these GPU-fenced diagnostics do not qualify ordinary gameplay pacing.

Pass71 extends existing conservative light selection to 69 stationary channel/control housing meshes. All 31 tested states per renderer retain exact framebuffer pixels. Stationary timings are mixed on software, while the five fixed-position turning-camera medians improve by 4.6-50.2 ms. Native stationary medians are similar or modestly better. There are five additional cached shader programs and 60 additional owned material variants. These local measurements retain the visual art and do not qualify startup or production pacing. See `qa/under-green-visual-upgrade-pass71-2026-11-14.md`; absolute software cost and the full performance gate remain unresolved.


Pass73 channel-shore geometry and matching impacts add7,680triangles total, no draws/textures/lights/programs. Sequential GPU-fenced diagnostic medians baseline to candidate: native near14.2to15.4ms/crossing15.2to16.3ms/flood14.5to14.4ms; software130.6to134.5/170.2to174.9/153.3to157.5ms. Otherchapterjobs inventoried; no production pacing or speedup claim. Absolute software quality/performance remains unqualified. All owned runs terminal and source snapshots verified; see qa/under-green-visual-upgrade-pass73-2026-11-14.md.


Pass74 contoured bunker faces add17464triangles and retain opaque backing. No textures/lights/programs added; one checkedrepairview gainsoneexistingbatchdraw. Sequential GPU-fenced native baseline/candidate medians: corridor16.7/17.5ms, bank11.1/11.3ms, main22.9/21.8ms. Software127.6/143.7,75.2/87.4,168.5/189.5ms: recorded12.2-21.0ms localregression. Threeotherchapterjobs inventoried. Investigate duplicate bank/backing overdraw with a componentprofile; no speedup or productionqualification claim. Allownedjobsended/sourcesverified. See qa/under-green-visual-upgrade-pass74-2026-11-14.md.


Pass75 retains simpler closed bank backs and removal of original box face area strictly inside those banks, with2cm perimeter overlap. Net4,344fewertriangles;23paired native and23paired software frames preserve exact pixels, with no draw/texture/program additions. Rejected depth-prepass and fragment-light-guard experiments are absent from production. Final sequential GPU-fenced medians: native corridor12.5/12.3ms, bank9.4/8.4, main15.4/15.4; software146.9/141.5,88.4/88.9,190.8/181.4 (baseline/final). This recovers5.4-9.4ms in two software fixtures; the close bank is effectively unchanged. Allownedjobsended beforetiming; explicit software inventory shows only that owned verifier. Local diagnostics do not qualify ordinary-input pacing or the full visual build. See qa/under-green-visual-upgrade-pass75-2026-11-14.md. Allseven gates remainpending.


Pass76 adds 4152 gallery render/seep triangles, reusing existing maps and lamps; paired views add up to2draws and1program. Sequentialnative baseline/candidate medians approach21.3/21.1ms, west8.5/8.5,crossing17.2/16.7; software274/266.2,61.2/73.3,277.2/285.9. Sharedhost chapterjobs recorded; close-wall increase remains a concern, no precise attribution or productionqualification. Early opaque-plaster ordering preserved18raw-framebufferpairs perrenderer but software normal/early171/171.7,60.9/61.3,189.5/191.4ms showed no benefit, so the experiment was removed. Finalscene exact to fullsuite/client build,8snapshots verified,allownedjobs terminal. See qa/under-green-visual-upgrade-pass76-2026-11-14.md.

Pass77 closed entrance vault: same draws/textures/programs/lights in paired views; canopy +5270 submitted triangles. Sequential GPU-fenced baseline/current native18.6/18.8ms approach,7.8/7.9 westroof,15.1/15.7 crossing; software185/185.7,61.4/72.4,191.8/181.9. Close software roof +11ms remains a concern; final inventory includes other chapter jobs. No production pacing qualification. See qa/under-green-visual-upgrade-pass77-2026-11-14.md.


Pass78 local runoff: native medians baseline/current21.8/19.5,17.7/17.6,14.5/13.6ms; software269.5/271.8,220.5/230.6,79.2/88.3ms. Sequential owned runs, other chapter software load present. Software regressions remain unresolved; no whole-level qualification. See qa/under-green-visual-upgrade-pass78-2026-11-14.md.


Pass79 pump casting/supports/work light: sequential GPU-fenced baseline/current native medians pump9.2/8.0ms, operator14.3/12.1ms, gallery19.7/17.8ms; software101.5/101.1,165.8/162.7,200.7/199.4ms. Six warm pairs and24 alternating samples per fixture. Shared-host diagnostics, no production pacing qualification. Front/base +464 submitted triangles; no maps or lamps added. Absolute software performance remains unacceptable. Both owned timing runs terminal. See qa/under-green-visual-upgrade-pass79-2026-11-14.md.


Pass80 retains original-part finite-light bounds and software-only12m longitudinal groups. Native remains24m after a regression with12m. Final31 native framebuffers exact;30/31 software exact with17 bounded bunker timber-edge pixels differing by at most16/255. All original static triangle attributes retained. Final alternating turning-camera GPU-fenced medians baseline/current: native21.2/21.2,17.9/17.2,9.9/9.0ms; software231.3/219.9,185.2/184.3,110.0/95.4ms for gallery/crossing/keeper. Shared-host diagnostics, not production pacing acceptance. Software remains unacceptable. The back-facing-light branch was slower and discarded. See qa/under-green-visual-upgrade-pass80-2026-11-14.md.

Pass80 timing caveat: software gallery turning P95 worsens291.3 to467.1ms despite the lower median. Crossing P95273.6 to258.7ms and keeper142 to121ms improve. Shared-host contention prevents firm attribution; the gallery tail regression remains an explicit concern and no overall frame-pacing improvement is claimed.


## Under the Green pass81 closeout — PROGRESS

Varied coherent droplet launches, analytic flight tangents, tapered four-band pixel masks and independently rotated impact mist retained. Pure bounded/tangent suites, ten paired visual fixtures per renderer, motion/pause/rear/reduced checks and installed client passed; final native/software images inspected. Native medians17.3→17.4/13.4→13.5/16.3→16.5ms, P9520.3→23.7/16.1→15.2/18.4→18.4ms. Software front439.7→479.6ms,P95538.1→665.2;side207→219.2,P95290.7→297.5;flood312.4→337,P95364.7→377. Software regression remains open. Handle28555 now missing, final complete report present. All53requirements/48refinements/seven gates retained, goalactive. QA81 and source manifest recorded.


## Pass82 gallery source placement

hardware: entry median 20.3→20.3ms, P95 22→22.4ms; root median 14.5→15ms, P95 16.4→16.4ms; reverse median 7.6→7.4ms, P95 9.4→9.6ms

software: entry median 387.9→388.7ms, P95 442→453.1ms; root median 334.7→352.1ms, P95 386.5→373.5ms; reverse median 153→148.1ms, P95 170.5→162.2ms

Native2560x1600/software960x600, sequential local runs, six warm pairs and24alternating GPU-fenced samples. Other chapter jobs active; no broad performance claim. See QA82.


## Pass83 gallery sediment

Native initial: entry median 22.2 → 33.4ms, P95 23.0 → 41.2ms; root median 16.0 → 21.1ms, P95 18.3 → 24.6ms; reverse median 8.4 → 9.6ms, P95 9.5 → 11.5ms.

Native repeat: entry median 20.9 → 22.4ms, P95 24.0 → 29.1ms; root median 17.0 → 18.2ms, P95 22.3 → 26.0ms; reverse median 8.4 → 7.7ms, P95 9.8 → 9.6ms.

Software: entry median 348.6 → 346.6ms, P95 387.2 → 392.0ms; root median 244.4 → 242.9ms, P95 284.0 → 299.7ms; reverse median 109.8 → 114.9ms, P95 133.6 → 136.8ms.

Six warm pairs and 24 alternating GPU-fenced samples per view, native 2560x1600 and software 960x600. Owned visual/client jobs had finished before timing; the two renderers and native repeat ran sequentially. Other Final Cut, Back Nine and Bird Squad jobs were observed on the shared host. The native repeat was justified by the first large slowdown; it does not erase that result. Forward-view native cost still rises modestly in the repeat, and software P95 remains worse. No performance improvement or whole-level frame-pacing acceptance is claimed. Software performance remains unacceptable.

See `qa/under-green-visual-upgrade-pass83-2026-11-14.md`.

## Pass84 flood material
| Renderer / view | Median before → after (ms) | P95 before → after (ms) |
|---|---:|---:|
| hardware / flood-gallery | 17.0 → 17.2 | 19.4 → 19.4 |
| hardware / flood-floor | 11.8 → 12.0 | 13.3 → 13.6 |
| hardware / dry-gallery | 18.3 → 19.5 | 19.8 → 22.5 |
| software / flood-gallery | 274.4 → 273.0 | 302.2 → 312.2 |
| software / flood-floor | 106.1 → 109.7 | 129.4 → 144.8 |
| software / dry-gallery | 209.9 → 213.2 | 277.0 → 296.7 |

Native flooded-gallery rendering remains 550 draws / 434,808 triangles / 211 programs; textures increase from 55 to 56. Native flood-floor is 217 draws / 358,359 triangles, unchanged. Actual rendering resolutions: native 2560x1600, software 960x600. No added vertex-color mismatch.

The small native flood median increases do not prove zero cost. Software remains far too slow, including the baseline; the floor view regresses locally. The dry-gallery pair also changes despite identical images and hidden flood, so these samples include host/runtime variation. Other Bird Squad test processes were observed during the software run. No performance gate is closed.

See `qa/under-green-visual-upgrade-pass84-2026-11-14.md`.

## Pass85 compatible surface lighting groups

Software moving-camera medians: gallery302.5→280.9ms, crossing274.8→259.1ms, keeper140.0→129.6ms. P95:397.1→370.2,312.3→323.1,168.3→149.0ms respectively. Six warm pairs/24alternating fenced samples,actual960x600. Programs213→227; triangles/textures unchanged; draws increase658→797,527→646,108→121. Native batching unchanged. All31paired images exact on each renderer; all geometry attributes retained.

Retained broad-surface groups combine identical lamp reach sets across cells; fine detail remains batched. Rejected full depth prepass, per-fragment range branch and all-batch split all have detailed evidence in qa/under-green-visual-upgrade-pass85-2026-11-14.md. Gallery/keeper tail improves, crossing tail regresses, absolute software cost remains unacceptable. Startup and memory qualification open; no whole-level performance acceptance.


## Pass86 range lining and practical relocation

Native moving-camera medians: approach18.2→18.7ms, close10.2→10.7ms, flood14.5→14.3ms. Software actual960x600: approach218.6→224.7ms, close60.2→72.2ms, flood222.1→218.4ms. Six warm-up pairs/24 alternating fenced samples. No texture increase; local close software regression is open. Full table and limitations in `../qa/under-green-visual-upgrade-pass86-2026-11-14.md`. Performance gate remains pending.


## Pass 87 — enclosure shadow cost

A single 768x2176 static depth atlas adds approximately 7.97 MiB and two render-target textures; no per-frame shadow rendering or additional gameplay geometry/draws. Native turning-view median/P95 timings (ms): gallery 19.8/23.4 to 20.5/23.8, crossing 18.1/21.5 to 17.9/21.5, flooded pump 15.5/17.2 to 14.8/16.9. Software at actual 960x600: 200.7/258.0 to 242.0/385.2, 161.8/260.7 to 193.8/223.5, 208.7/234.1 to 255.6/312.7. The roughly 20–22% software median regression remains open; this is not a fresh measurement at the live adaptive-resolution floor. A facing guard and larger nearest-filtered atlas were rejected. See `../qa/under-green-visual-upgrade-pass87-2026-11-14.md`; full performance acceptance remains pending.


## Pass 88 — blocked-light omission

Software-only wall-cone proofs reduce static surface/light pairs2698→2329 and measured shader programs240→225, preserving exact pixels in31paired views on each renderer and the installed-client final image. No texture/geometry/draw increase. Fixed960x600 turning-view median/P95 (ms): gallery254.1/285.7→224.6/273.0, crossing223.1/280.0→209.6/266.3, flooded pump215.0/315.2→210.0/379.6. Shared-machine timing is provisional; pump tail and absolute performance remain unresolved. Native application and further grouping were rejected; final native path is preserved. See `../qa/under-green-visual-upgrade-pass88-2026-11-14.md`.


## Pass 89 — merged physical wall occluders

Software-only exact wall unions reduce 334 fragments to125 fixed-light occluders and147 camera occluders. Keeper recesses and gaps are preserved. Static source pairs2329→2241, variants689→677, programs225→222. Draws/textures unchanged; submitted triangles decrease locally. Fixed960x600 turning median/P95(ms): gallery243.7/278.6→233.1/265.8, crossing215.6/286.1→215.2/285.6, flooded pump222.8/281.2→199.1/256.1. Six warm pairs/24 alternating fenced samples. All125 paired comparison frames and final installed-client image are exact. These are provisional local gains, not playable software or live adaptive-floor acceptance. See `../qa/under-green-visual-upgrade-pass89-2026-11-14.md`; all seven gates remain pending.


## Pass90 saturation and pass91 paving

Pass90 integrates static/flood saturation without double darkening and restores dry appearance. Native median timings increased in the first local sample; software results were mixed. See `../qa/under-green-visual-upgrade-pass90-2026-11-14.md` for the complete table and scope. Source hashes were checked before pass91.

Pass91 replaces wall-like floor pigment with a dedicated 1254-square stone field at313.5texels/metre. One additional resident texture, approximately8MiB with mips, 1.79MiB PNG transfer, no added geometry/draws/lights. Fixed960x600 software medians gallery213.2→215.1ms, crossing205.2→200.4ms, floodedpump191.1→192.2ms. Native2560x1600 medians23.5→22.7,18.7→17.9,16.6→13.5ms. Sixwarm pairs/24alternating fenced samples. This establishes no whole-level performance acceptance or optimization claim. Full tables: `../qa/under-green-visual-upgrade-pass91-2026-11-14.md`.


Pass98 channel reflection refinement reuses existing resources, with unchanged paired draws/triangles/maps/programs. Sequential GPU-fenced baseline/current native medians crossing20.5/20.2ms, outflow13.9/14.5, flood16.4/15.1; software214.2/217.3,155.5/146.0,184.2/184.4. Native outflow and software crossing worsen, other local samples are similar or lower; no speedup/parity or production pacing qualification. The absolute software cost remains unacceptable. Full gates remain open. See qa/under-green-visual-upgrade-pass98-2026-11-14.md for source, view and normal-probe evidence.


Pass99: irregular channel reflections retain all draw/triangle/texture/program counts. Native before/after median ms: crossing19.5/19.5, outflow13.9/13.7, flood14.8/15.6. Software:222.8/224.7,196.5/195.3,177.5/176.5. Software overlaps another browser suite; provisional, no speedup or playability claim. The earlier zero-radiance branch candidate was rejected after no local benefit on either renderer; original practical lighting restored exactly. Full table and limits: `../qa/under-green-visual-upgrade-pass99-2026-11-14.md`.

## Pass104 final local bank cost

Native2560x1600 medians corridor13.3->10.9ms, close7.9->7.7ms, main16.1->15.0ms; P95 14.6->13.6/9.5->8.8/18.6->18.3. Software960x600 medians146.1->146.0/107.8->109.0/177.2->174.1; P95 154.0->148.8/114.7->134.9/183.0->182.8. Six warm pairs and24alternating GPU-fenced samples per view. +4uploaded textures, approximately8.67MiB mipmapped storage, +1926bank triangles, no new lamps/colliders. Source and cost evidence: output/under-green/visual-pass104/final-budget-{hardware,software}/report.json. Local results do not establish full-route performance; absolute software cost remains unacceptable.

## Pass105 range material cost

The1254px range coating replaces the627px map at the same313.5source texels/metre. Texture count, draw calls, triangles, shader programs and fragment sample count are unchanged. Estimated additional mipmapped GPU texture storage is6.00MiB, plus the2,088,213-byte PNG download/decode; process memory and cold-start latency are not qualified.

Paired local warm native2560x1600 medians: approach23.1->22.0ms, wall17.8->16.7ms, side22.7->22.3ms; P95 25.0->24.2/19.6->18.1/24.6->24.6. Software960x600 medians187.1->187.2/128.7->128.1/184.5->183.3; P95 198.5->202.4/133.1->131.9/193.0->190.8. Six warm pairs and24alternating GPU-fenced samples per view. These local results show no material timing regression, not a whole-level performance pass; software absolute cost remains poor. Evidence: output/under-green/visual-pass105/budget-hardware/report.json and budget-software/report.json.


Pass106 gallery mud coverage is a one-time bake into the existing mask: no added rendering resources or shader samples. Native GPU-fenced medians before/after: 29.0/28.4, 26.3/25.3, 21.1/20.2ms; software: 295.3/286.4, 240.4/239.3, 296.2/293.6ms. Four warm pairs and 24 alternating samples for approach/floor/crossing. Absolute software performance remains unacceptable. See qa/under-green-visual-upgrade-pass106-2026-11-14.md; full-level gates remain open.


Pass107 paving albedo replacement has unchanged1254-square texture allocation, shader work and paired resources. PNG increases by252,993bytes. Native approach/floor/crossing medians before/after26.9/26.2,26.4/26.7,20.8/20.7ms. Software200.5/196.9,165.3/165.3,208.9/204.9ms overlaps report compression under disk pressure: provisional only. No optimization or full-route qualification claimed. See qa/under-green-visual-upgrade-pass107-2026-11-14.md.
