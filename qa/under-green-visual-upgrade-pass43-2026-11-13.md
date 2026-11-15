# Under the Green pass 43 — causal pipe corrosion and wetness

Status: verified visual/material progress after pass42 progress. Local native/software rendering diagnostics complete. V38 is now locally implemented. Full 53-item goal and seven whole-level gates remain active.

## Implementation

The pipe network now separates quiet aged metal between fittings from irregular corrosion at actual seams, and darker wet material around the three existing weep sources. The same finish covers the gallery cross-feeds, main service runs and collars, east elbow, pump delivery riser and three valve housings. Existing metal/rust pixel art is reused; no new image textures, lights, relief geometry or particle emitters.

`under-green-pipe-finish.js` supplies compact per-piece seam coordinates and a non-emissive Phong material. Its shader samples the two existing albedo maps at machinery scale; weathering edges stay fixed in world space at 1/128m quantization. Wetness derives independently from distance to the actual leak origins, darkens pigment and changes specular strength/shininess. Albedo brightness does not drive wetness or bump relief. Dry spans remain comparatively matte. Curved pump/cross-feed profiles follow their real fittings instead of applying the straight-header coordinate rule.

Three nearest seam coordinates per service piece avoid a whole-network fragment loop. Actual scene audit finds 11 rendered/batched meshes carrying 95,488 bytes of finish attributes, all seven profiles present and no missing attribute. The service network accounts for 59,536 bytes; remaining data belongs to cross-feeds, delivery pipe and valve housings. Spatial/material regrouping changes view-dependent draw and triangle submission counts even though physical geometry is unchanged.

## Evidence

- Pure verifier compares all 189 service-network pieces and all 113 pump pieces against pass42: exact vertex, normal, UV, index and transform parity. The pump includes legitimate non-indexed shapes; verifier corrected to compare null indices rather than assuming every mesh is indexed. Gallery cross-feeds and valve housings retain their shapes/transforms; their material sampling now uses the machinery physical scale rather than the old general iron/rust scale.
- 96,552 seam samples compare compact frames with the complete fitting lists, checking every nearby seam remains represented. Frame attributes are finite. Existing metal/rust texture references are reused; the former random specular map is removed from this material in favor of physical leak wetness.
- `pass43-final/{hardware,software}`: 35 views per renderer, including repair sleeves at both gallery leaks, all three insulation remnants, return valve, elbow, header, quiet span, branch, gallery approach/reverse and pump. Actual E-driven pump diversion, finite-clock pause while the lever is moving, exact frozen lever/valve/water clocks, resume, Q and Reduced Motion pass. Zero page/console errors.
- Native 2560x1600; software 960x600 in the same viewport; additional 1280x720, 390x844 and 844x390. Native repair/quiet span/return/gallery/delivery and final installed-client images inspected. Software repair64 and delivery-riser views were also inspected; complete remaining views are retained.
- `pass43-controls/{hardware,software}`: two focused views each, repeated meaningful in-transit pause/resume, actual material/attribute audit and a dedicated delivery-riser view. Final native and software checks passed; software job65963 terminal0.
- Installed client `pass43-final-client`: five bursts, final shot4/state4 inspected; ready/playing at (0,8.84), final pipe finish present. The initial five-second Preparing-button timeout recovered in later actions. No error artifact. Job1034 terminal0. Earlier `pass43-client` predates the extension to cross-feeds, riser and valves and is not final evidence.
- Geometry-only dry-route checks were not repeated: pass42's 1,379-frame/106-mesh audit remains relevant alongside exact component parity and unchanged transforms. This does not substitute for the full-level hazard/motion/clearance gates.

## Findings and corrections

The first quiet-span camera was on the corridor boundary; moved it 0.5m inward to collision-valid floor. Initial gallery-reverse and Q screenshots shared a filename; final fixtures use distinct `galleryRear` and `rear` names. Initial `pass43-pipes` captures cover only the first material candidate and are superseded by `pass43-final`. No game control, collision or simulation change was made to satisfy a fixture.

Native matched resource samples: repair 128→130 draws, 218,088→218,024 submitted triangles; elbow 86→85 draws, 153,836→154,352 triangles. Loaded texture count59 unchanged; program count133→140. These are view-dependent counts, not added geometry totals. Material construction owns/disposes its cloned material and reuses externally owned maps.

## Acceptance boundary

Combined with pass42's connected physical construction, repair sleeves, supported runs, torn insulation and real leak origins, this pass supplies the remaining causal corrosion/wetness portion of V38. Full matched Level1, ordinary route motion, combined hazard states, performance and accessibility acceptance remain separate. No new checkpoints, banner narration, input changes, Joe/pursuit changes or hydraulic-rule changes. V38 is locally accepted across passes20/42/43; all original requirements stay intact. Ledger28implemented/24in_progress/1pending, allseven gatespending.

## Next evidence-driven priority

Source review found a concrete water-lighting defect for V25: `under-green-water.js` and `under-green-wet-ground-scene.js` add locally/world-oriented wave offsets directly to the view-space fragment normal. Those offsets rotate relative to the world when the camera turns; the east-west channel also omits its group rotation. Next pass should transform wave-normal perturbations into view space consistently, then review shallow/channel/flood reflections and water edges in motion. This is a source/mathematical finding, not a claim of an already verified visual fix.

## Final local timing and handoff

Six warm frames and24alternating GPU-fenced samples per view, captured in `pass43-budget`. Native job94194 and software job94963 completed terminal0 with no page errors. Other chapter verification was observed after the timing sequence, so this remains a local diagnostic with possible shared-machine contention, not full-level performance acceptance.

| Renderer/view | Before median/P95 ms | After median/P95 ms |
|---|---:|---:|
| Native repair,2560x1600 |10.7/12.4|11.1/12.5|
| Native elbow,2560x1600 |9.7/11.3|10.1/11.0|
| Software repair,960x600 |95.3/151.1|95.0/137.5|
| Software elbow,960x600 |63.6/70.5|65.5/76.3|

Absolute software cost remains above the target; no global performance claim. All owned jobs terminal,server4187 retained. Final snapshots/hashes inpass43-source; final visual evidencepass43-final,pass43-controls,pass43-final-client,pass43-budget. Fullscope active.
