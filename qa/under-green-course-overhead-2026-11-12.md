# Under the Green — visible course connection

The root gallery now has a real maintenance-grate opening through its roof. From below, the player can see the night sky and a golf flag planted on the turf shelf above. The shaft has masonry, exposed sand/soil layers, a turf lip, connected curved roots, a supported grate and a trapped ball. It gives the underground space a physical connection to the course without another sign or required action.

Previously the gallery's decorative sprinkler collars ended against a solid ceiling. The new opening is separate from those pipe fixtures. `under-green-overhead.js` subtracts its 2.2 × 2.4 m aperture from the actual covered floor tiles before roof meshes are built. The framing and scenery then enter the existing static material batches and camera-clearance audit. All details remain at least 4.13 m above the walking plane. The floor, movement, water phases, navigation, interaction and capture rules are unchanged.

Visual iteration exposed two presentation weaknesses: the first full-height masonry wall hid the soil/turf layers, and straight root cylinders resembled brackets. The final shaft exposes its layers and uses connected curved roots. A supported flag beyond the far rim makes the course connection visible through the grate; its base lies on the outer turf shelf, not inside the aperture. This remains an optional environmental glimpse rather than a forced camera beat.

## Verified evidence

- `tools/verify-under-green-overhead.mjs`: original covered area 1234.315 m²; final roof area 1229.035 m²; exactly 5.28 m² removed. No overlapping resulting roof strips or roof across the aperture. Split-tile, edge and outside-hole cases preserve unaffected area.
- `tools/verify-under-green-overhead.cjs --baseline`: a test-only route replacement restores the old solid roof and omits the new assembly. The same sky sightline is blocked. It captures three matched 2560×1600 views; production files are not rewritten by the baseline test.
- `tools/verify-under-green-overhead.cjs`: 12 final approach/upward/return views at 2560×1600, 1280×720, 844×390 and 390×844. The rendered geometry audit confirms sky and flag visibility through the grate and retained obstruction through an uncut roof section. Ordinary W input travels 5.376 m in 1.4 seconds under the opening with no water hit. All final viewport views were inspected; no page or console errors.
- Final `tools/verify-under-green-camera.cjs`: 23,424 environment and 696 dynamic camera poses, zero failures. Existing keyboard bank, doorway and control approaches remain clear.
- Final `tools/verify-under-green-structure.cjs`: 802 standing/crouched floor samples, 22 views, no structural clearance hits; existing 48 retaining edges, six roof transitions, range-net sightline and sky pause/reduced-motion checks pass.
- Installed standard web-game client: actual normal movement through the lesson; final screenshot/state inspected, ready/playing at 5.7833 seconds, lesson crossed, zero water hits. Evidence in `output/under-green/overhead/standard-client-final/`.

Matched 2560×1600 approach/upward/return views changed draw counts from 244/64/70 to 247/67/74. Texture counts remain 40/40/43 and programs remain 21 in those matched sequences. There are no new texture assets or per-frame assembly updates. These counts are not a new sustained frame-time guarantee; the earlier long-session measurements describe their tested build.

## Scope and remaining acceptance

This advances review items 23, 24 and 30 with a functional aperture and current visual/clearance evidence. It does not establish exhaustive dynamic clipping freedom, unfamiliar-player discovery, district recognition or physical-device performance. Other district composition, encounter balancing, shared-consumer acceptance and human/listening requirements remain open. The complete 44-item goal is not finished.

Evidence root: `output/under-green/overhead/`, plus refreshed `output/under-green/camera/browser.json` and `output/under-green/structure/browser.json`.
