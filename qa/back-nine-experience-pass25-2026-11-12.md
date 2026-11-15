# Back Nine pass 25 — a discoverable opening sighting

## Problem and retained behavior

The two staff-cart sightings had zero eligible time across sixteen ordinary complete runs (two seeds, two course branches, four driving paces). The new working-mower introduction occupied their first quiet window; subsequent distance, speed and attack gates excluded the rest. Merely allowing the working phase did not solve it: the seat was already in view, so the no-pop-in rule correctly refused to insert the figure.

The west staff cart now starts occupied as initial scene dressing on a fresh, undamaged run, before its first presentation frame. It shares the existing high-resolution Joe artwork, parked cart and lighting. It remains silent and stationary, then disappears only out of view. The figure cannot be introduced this way during an underway run, on-foot escape or checkpoint start. A watched figure never blinks away when the real Joe begins his reveal. Later optional staging retains every original safety condition and one-observed-sighting limit.

The shared encounter policy was restored byte-for-byte after the failed candidate. No movement, collisions, damage, pursuit, warning duration, recovery, audio or scene geometry was changed. Runtime edits are in chase-unease.js, its scene initializer in chase-staff-art.js and their two HTML module versions.

## Evidence

- `probe-staff-natural-opportunities.mjs`: sixteen full runs complete with exactly the same observed positions, speeds, phases and cart/foot outcomes as the pre-change baseline. The existing later-stage safety gates still yield zero time on those routes; the opening is now dressed before them, not made eligible by weakening them.
- `verify-staff-unease.mjs`:38 cases including initial dressing, pause, real reveal/no blink, off-screen disappearance, invalid/resumed starts, original suppression rules, one-use behavior and no simulation mutation.
- `verify-staff-opening-browser.cjs`: hardware and SwiftShader pass actual W/A/Q input approaches from fresh starts, look-away/return, pause, reduced motion and both checkpoint starts. No actor relocation or forced encounter state is used for the opening approaches.
- At 2560×1600,1280×720 and844×390, the inspected occupied/empty images show the figure seated in the west bay and gone after looking away. Pixel subtraction verifies actual rendered contribution, not merely a frustum flag. Hardware:40 pixels during forward departure and219–222 after approaching the west bay; software:14 and55–56 respectively. Comfort:216 hardware /56 software. Software adaptive resolution makes the distant figure very subtle; these counts are not human-recognition evidence.
- Existing later west/east sightings, records, pause/comfort and resource checks pass in the updated staff-story browser test. Its underway fixtures now explicitly finish the departure phase: time20 with an unfinished fresh introduction was an invalid assumption after pass23.
- Departure and shared-encounter regressions pass. Software resources remain1114 buffer uploads,25 programs,40 textures,12 voices; hardware20 programs. Presence/disappearance, pause, comfort and checkpoint changes add no resources or page errors.
- Installed standard client after final changes (20998, terminal0): two normal input bursts, fresh driving time2.083→3.800s, healthy cart, working Joe, quiet banners, sighting observed then outside the camera. Latest page/state inspected; no error artifacts. This is a normal input regression, not a complete novice playthrough.

## Software cost and limitations

The existing full-detail figure adds nine submissions while visible. A single-world moving AB/BA comparison,64 paired samples per view, gives these fenced render/completion medians and p95 values (ms):

| View | Empty median/p95 | Occupied median/p95 |
|---|---:|---:|
| Departure |50.9 /57.9|54.7 /61.9|
| West approach |43.0 /46.9|47.0 /51.9|
| After look-away |52.9 /56.5|52.9 /56.9|

No new startup assets are added, but visibility is not free: roughly4ms median software cost in these samples. This remains a concrete performance target under #1, alongside visible foliage and the real mower. Do not claim that resource stability proves frame stability. A prior profiler attempt measured63 rather than64 visible departure frames because the final sample legitimately left view; the corrected capture starts0.2s earlier. Absolute timings drifted substantially between runs, so these are local paired costs, not a machine-wide FPS guarantee.

The first software visibility assertion at a more distant six-second point found only8 pixels at adaptive low resolution. The final approach test continues normally to eight seconds and preserves the visibility threshold; no production visibility or safety rule was weakened to pass it.

Artifacts: `output/back-nine-experience/staff-natural/`; pre-change sources and baseline routes are preserved. The superseded working-policy experiment is saved separately. The full38-item goal remains active. #31 still needs additional restrained variety and later human recognition/fear assessment; #1 and broader course acceptance remain open. Human test instructions are prepared, not conducted.
