# Pass 69 — keeper root and damaged tile courses

The previous goal turn made runtime progress with pixel-preserving contact-shade culling. This pass returns to the art review's keeper-room integration priority. All 53 requirements, 48 refinements and seven acceptance gates remain in scope; no item status is promoted.

## Implemented

The keeper root now displaces 22 selected quarter-metre tile faces along its descending fork and upper entry. Missing portions expose textured masonry; surviving pieces have closed thin bodies, beveled edges, small individual settlement and irregular chipped fracture contours. The glazed faces retain coordinates from their original illustrated tile, so moving a fragment does not introduce a smaller tiled pattern or stretch its pixel density. Initial straight fracture edges were reviewed and replaced with small uneven chips before final verification.

Three bounded, world-anchored pigment fields connect dampness to the root's upper entry, descending fork and foot. They run in the existing keeperStone shader, quantized at313.5samples/metre, with its physical lighting and independent wet mask. No overlay mesh or additional material remains. The unchanged wall remains behind every piece. Broad intact tile areas, the existing desk/repair, plan, light, counter and root geometry are preserved.

Sources: new `web/under-green-keeper-tile-damage.js`; integration/disposal in `web/under-green-scene.js`; `web/under-green-damp-finish.js` is restored to its pre-pass content. No new image, texture, light, collider or simulation rule. Added geometry is 2,963 triangles and no new material; this is a real rendering cost, not a zero-cost effect.

## Verification

Evidence: `output/under-green/visual-pass69/`. `preview/` records the initial straight-edged candidate; final evidence is `final-hardware/`, `final-software/`, `final-client/` and `geometry.json`; the earlier hardware/software folders document the superseded overlay version.

- Unit verifier checks all 8,299 authored vertices for finite attributes, actual opaque wall backing and bounded projection. All 22 fragment bodies are closed and outward-facing. Every visible glaze vertex samples inside its original quarter-metre tile and follows the exact settlement transform. Disposal restores the original material hooks. The backing is .00020017m behind the actual contact-shade surface, avoiding coplanarity.
- Geometry bounds: x 7.7520–9.7480, height 1.2520–3.9980, world z −11.4827 to −11.4595. Maximum outward projection from the original wall face is about 2.27cm. Existing enclosed wall and desk recess are unchanged.
- Browser suites capture 34 views per renderer: 12 matched before/after fixtures plus 10 current compact/input/interaction views. Includes overview, root wall, close fork, foot, upper entry, oblique, return, desk, map, flood, gallery/bunker controls, crouch, Q, reduced motion and real E sluice release. The gate moves and secures successfully.
- 1,440 camera poses per renderer cover the approach at standing/crouch heights, three pitches, FOV45/85, portrait/landscape and three headings. No geometry intersections. Camera return is pixel-stable; pause freezes elapsed time. The map remains visible and its backing occludes the space behind it.
- Exact outside-region structural triangle fingerprints match: 284,727 native / 210,523 software. The audit restores full software batches first. No missing color attributes; the keeper material is opaque, nonemissive and retains its original tile/wetness maps and masonry damp profile. Player state, fixed lights, texture counts and resolution match the paired fixtures. No console/page errors.
- Actual native scene sizes: 2560x1600, 1280x720, 390x844 and 844x390. Software: 960x600, 960x540, 390x844 and 844x390 respectively. Final native root/oblique and software root views were inspected alongside the prior keeper composition; responsive captures are included in both suites. This is local artistic improvement, not a new whole-level Level1 parity claim.
- Existing keeper-layout unit passes 61 approach samples with unchanged recess area. Local camera/interaction coverage is not presented as a fresh full pursuit traversal.
- Installed web-game client completes seven bursts and reaches ready/playing, checkpoint0, elapsed1s, player(0,8.072), actual960x540. Final client process is terminal; seven state/image pairs exist. Final screenshot and state inspected; no error artifact. Startup remains a separate performance concern.

## Cost and remaining scope

Native root view: 67→68 draws, 123,818→126,781 triangles. Software root view: 61→63 draws, 16,798→18,930 triangles after culling. Native oblique view: 85→86 draws; software 82→83. Texture counts remain equal, programs 213→214. Gallery control draw/triangle counts are unchanged; the extra material program remains cached.

Final sequential GPU-fenced timing (24 alternating warm samples per view): native root8.4→7.5ms, desk8.7→8.4ms, flood8.8→8.2ms; software root70.5→77.2ms, desk66.8→73.1ms, flood67.2→74.0ms. Both jobs terminal0 with no errors. Evidence: final-budget-hardware/report.json and final-budget-software/report.json. All owned visual/client jobs were terminal before timing; the process inventories record a concurrent BackNine browser job, so these local samples do not prove a general speed improvement. Absolute software performance remains inadequate.

The initial overlay candidate added480 more triangles and a separate lit surface pass; its software samples cost roughly8–16ms more than its own baseline. The final candidate removes that pass and fixes backing/contact-shade coplanarity. Cross-run absolute times are not comparable because host contention changed. Historical overlay source snapshots and their own hashes are preserved in source/overlays/. The six final source/verifier snapshots in source/manifest.json were refreshed and byte/hash checked.

This improves the localized keeper root/tile relationship. Wider room composition, material separation, gallery lighting/mud/water integration, range framing, actor/water motion, Level1 parity and full production performance remain open. Ledger counts remain 32 implemented / 20 in progress / 1 pending, with all seven gates pending.
