# Under the Green — mixed routes and middle landing

Scope: review items 1, 9, 10, 13, 23, 24, 29, 41, 43 and 44. This is one implementation/evidence pass within the full 44-item goal, not chapter completion.

## Findings and changes

The continuous mixed-route pilot now supports crossing outlet A and bypassing B, or bypassing A and crossing B. Both policies use the actual middle connection and the mandatory keeper spillway, with live water and Joe throughout. There is no reset between outlets. Existing default route policies are preserved.

The middle connection existed physically but had no route stripe. The baseline east-facing screenshot shows an unmarked passage beside the stone island; the perimeter's brass stripe also blends into its sand-colored floor. Added the missing connection and a narrow dark border around the chapter's existing dry-route markings. The paint introduces no collision. Outlet B's detour text now names the dry walkway from the middle landing.

The same view exposed the unsupported middle lamp. Added a mast seated beyond the walkable north boundary and an overhead arm/stem connecting the lamp. The support does not change collision, walkable layout, timing, movement or Joe behavior.

Local diagnostic reports previously combined the two outlets into one `range` record. They now retain that aggregate and add `range-a` / `range-b` records with `parent: 'range'`, separate arrival phases, observed branch visits, waiting, gap and outcome. Dry visits only count alongside each outlet; walking along the middle connector does not falsely claim a dry bypass. Starting at the middle checkpoint does not invent a visit to A. Export definitions explain that parent/child metrics overlap and must not be summed. Recording remains opt-in and page-local.

## Continuous route evidence

`tools/verify-under-green-mixed-routes.mjs` finished 72 cases: 12 integer-second arrival offsets × walk/sprint/crouch × two mixed orders, from checkpoint 2 through escape.

| Stance | Wet A / dry B | Dry A / wet B | Water hits |
| --- | --- | --- | --- |
| Walk | 12 complete | 12 complete | 0 |
| Sprint | 12 complete | 12 complete | 0 |
| Crouch | 11 complete, 1 caught | 12 complete | 1, on a completed attempt |

No unfinished pilots or sampled player-body overlaps. The caught crouch policy at offset 4 failed before entering either outlet. The other mixed policy completes from that arrival. This does not establish that the failed policy was unavoidable. At crouch offset 6, dry/wet recovers from one water hit and completes.

Walking preferences change with phase: dry/wet is about 10.98 seconds faster at offset 0, while wet/dry is about 2.02 seconds faster at offset 8. Sprint dry/wet wins most sampled arrivals by roughly 1.18 seconds; the opposite policy's largest sampled advantage is only 0.37 seconds. These compare the two mixed policies, not every possible route or human decision. Do not infer balanced subjective difficulty from completion counts.

The 72-case matrix predates the presentation/report changes; those changes do not alter physics. Two retained continuous input tapes were replayed after the changes, both with and without recording, and retain exact physical outcomes and saved state. The original 144-case all-wet/all-dry balance report remains failed under its original criteria; this report does not supersede that result.

## Verification

- `verify-under-green-mixed-report.mjs`: both full tapes, aggregate and per-outlet classification, checkpoint partial entry, connector-only visits, report noninterference and painted-connector body clearance pass.
- `verify-under-green-playtest.mjs`: existing bounded recording, pause, retry, immutable archive and physical/save noninterference checks pass.
- `verify-under-green-mixed-routes-browser.cjs`: eight full replays, 48 rendered views and eight actual report downloads pass at 2560×1600, 1280×720, 844×390 and 390×844. Small contexts enable the actual touch interface. Zero page/console errors.
- The browser pass samples 1,248 actual camera-volume checks around the middle junction, at two eye heights, four headings, three pitches and two FOV values. Zero intersections; the lamp mast is outside walkable floor. This is static junction coverage, not all-space or all-pose actor clearance.
- `verify-under-green.mjs`: all 13 existing groups and seven live-Joe routes pass. Some legacy route policies still take a water hit; the test does not assert universal no-hit completion.
- Installed `web_game_playwright_client.js`: final opening traversal is ready, lesson crossed, 0 water hits, 11.22 seconds. Final screenshot and state inspected; no error artifact emitted.
- Visually inspected the baseline and final desktop middle connection, final portrait connection with touch UI, landscape outlet B view and installed-client capture. The paint is visible, connected, and the lamp has a physical support.

Artifacts: `output/under-green/mixed-routes/verified.json`, `tapes.json`, `report-verified.json`, `baseline-browser.json`, `browser.json`, per-route downloaded reports, screenshots, and `client-final/`. Scripts are under `tools/`.

## Remaining work

Keep the full implementation goal active. Next test changes of stance and route after an unfavorable arrival, including half-second/boundary arrivals and the earlier failed cautious cases; evaluate travel time together with observable threat exposure. Preserve the cadence candidate and earned escapes unless new evidence supports a change. Continue reverse/lateral/occupied recoveries, unfinished shared-consumer audits, structural/actor coverage and cold-start qualification. Unfamiliar-player understanding, fear/fun, listening and physical-device ergonomics remain unverified.
