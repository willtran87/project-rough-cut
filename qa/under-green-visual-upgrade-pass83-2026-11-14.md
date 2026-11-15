# Pass83 — gallery mud shoulders and connected sediment

Scope: V17/V18/V20 refinement. The complete 53-item plan, 48-item refinement review and seven whole-level gates remain authoritative. This is local progress, not Level 1 parity or release acceptance.

## Retained artwork

Two authored deposits sit beneath the east gallery root fissure and west seep. Unequal overlapping lobes rise to roughly 0.78m, with two narrow washout cuts per site. The same profile widens the existing floor sediment/wetness mask. Quiet wall intervals remain; this does not raise the entire level's mud skirting.

The existing sediment artwork, geometry topology, material, lamps, texture count, floor collider and controls remain. The deposit foot stays within 0.197m of the wall boundary. Existing organic weapon-contact queries consume the same geometry. Profile orientation is explicit so horizontal walls at matching coordinates do not acquire gallery deposits.

The first preview's crests were too smooth; the final version adds washout cuts. Final native close east/west, floor and portrait images and software west, flood and landscape images were inspected, along with the installed client's final gameplay capture. Wider district composition, water shore/depth treatment and full actor motion remain unfinished.

## Verification

- `node tools/verify-under-green-gallery-mud.mjs`: 37,924 profile samples, 486 changed samples confined to the two sites; maximum height 0.782121m, maximum foot 0.197m, 52.55% quiet samples. Three bank chunks change. All 683 root calls and non-bank geometry match the saved baseline. Bank topology/vertex counts remain unchanged.
- `node tools/verify-under-green-gallery-mud.cjs --output=output/under-green/visual-pass83/hardware`: passed, 39 captures, 4,992 clear camera poses, no browser errors. Native scene rendering is 2560x1600 at the large viewport.
- Same command with `--software --output=output/under-green/visual-pass83/software`: passed, 39 captures, 4,992 clear camera poses, no browser errors. Large viewport is 2560x1600; actual software scene is 960x600.
- Both suites cover paired entry/root/reverse/close-wall/floor/other-room/actor/flood views; final 1280x720, 390x844 and 844x390 layouts; E pump operation, Q rear, crouch, pause, reduced motion, minimum lamp phase and deterministic camera return.
- Installed `web_game_playwright_client.js`: terminal success, 12 bursts. Final ready/playing, player `(0,15.24)`, checkpoint 0, elapsed 3.0667s; no error artifact. Initial click timed out while Preparing; the action sequence subsequently entered gameplay. `client/shot-11.png` inspected at actual 960x540.
- `node tools/probe-under-green-ground-registration.cjs`: nine actual GPU texture samples match the expected world-coordinate deposit bytes. The suspected texture-orientation error was disproven; no orientation change was made. The diagnostic now asserts equality before reporting success.

Evidence: `output/under-green/visual-pass83/geometry.json`, `hardware/report.json`, `software/report.json`, `probe-hardware/report.json`, `client/` and paired screenshots. Baseline files are in `source/`.

## Cost and limits

Paired native entry remains 530 draws, 433,988 triangles, 55 textures and 211 programs. Close east/west and reverse rendering counts also match their baselines. This does not prove unchanged frame time: taller deposits cover more pixels and local timings need separate review.

Native initial: entry median 22.2 → 33.4ms, P95 23.0 → 41.2ms; root median 16.0 → 21.1ms, P95 18.3 → 24.6ms; reverse median 8.4 → 9.6ms, P95 9.5 → 11.5ms.

Native repeat: entry median 20.9 → 22.4ms, P95 24.0 → 29.1ms; root median 17.0 → 18.2ms, P95 22.3 → 26.0ms; reverse median 8.4 → 7.7ms, P95 9.8 → 9.6ms.

Software: entry median 348.6 → 346.6ms, P95 387.2 → 392.0ms; root median 244.4 → 242.9ms, P95 284.0 → 299.7ms; reverse median 109.8 → 114.9ms, P95 133.6 → 136.8ms.

Six warm pairs and 24 alternating GPU-fenced samples per view, native 2560x1600 and software 960x600. Owned visual/client jobs had finished before timing; the two renderers and native repeat ran sequentially. Other Final Cut, Back Nine and Bird Squad jobs were observed on the shared host. The native repeat was justified by the first large slowdown; it does not erase that result. Forward-view native cost still rises modestly in the repeat, and software P95 remains worse. No performance improvement or whole-level frame-pacing acceptance is claimed. Software performance remains unacceptable.

All owned jobs reached terminal success. Final runtime SHA256 snapshots are recorded in `output/under-green/visual-pass83/final-source-manifest.json`. No whole-level gate or item status was promoted.
