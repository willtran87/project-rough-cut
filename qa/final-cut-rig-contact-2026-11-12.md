# Final Cut rig contact and rendered reach

The old hit area used a 10.8 m wide, 5.4 m long rectangle during every committed pass. This could capture a player standing in empty space behind an outer reel. Outside a pass it shrank to a 3 m wide rectangle, missing parts of the outer wheels and boarding steps.

`web/final-cut-rig.js` now owns dimensions for the body, four wheels, boarding steps and reel banks. Contact uses their oriented footprints with a circular 0.3 m player, rather than a square-expanded whole-vehicle box. Relative translation is swept continuously between fixed simulation steps. Yaw/steering changes subdivide the sweep into increments no larger than 0.002 radians. A newly activated cutter is tested at its new pose rather than retroactively along the preceding interval. A returned hit identifies the responsible part and class: chassis, wheel or cutting bank.

Masonry checks use oriented parts before applying the proposed pass or turning movement. The existing wall-facing stop regression previously asserted x > 17, a bound derived from the old padded box. Actual wheel contact now stops at x = 16.82; the updated test asserts that the current geometry is clear and the next 0.06 m step intersects masonry. Main routes remain unchanged.

The rendered wing reels were rotating about Y, swinging their long axes across the course as their distance counter advanced. They now rotate about their X shafts. A central 2.7 m reel fills the previously unmodeled central cutting band. The two outer reels are each 3.9 m long. Grass removal now uses their shared 5.25 m half-width and actual 1.08–1.72 m forward extent, rather than the old 0.2–1.8 m interval. Existing saved cut intervals remain readable.

Defeat presentation consumes the responsible hit instead of inferring it from phase. Wheel contact receives its own title/cause. Cutting-bank fixtures now advance 200 ms rather than 100 ms because the old earlier capture was in empty space ahead of the actual bank.

## Verification

- `node tools/verify-final-cut-rig.mjs`: PASS seven groups: five headings, empty wake, bank edge, outer wheel, raised-reel clearance, rounded player corners, continuous moving-player/moving-machine sweeps, activation boundary, masonry overlap and a real turning stop. Actual bank capture occurs at 0.550 seconds at 30/60/120 Hz and 0.548611 at 144 Hz, with the same responsible comb.
- `node tools/verify-final-cut-rig-browser.cjs`: PASS eight cutting/turning poses and four reel-roll distances. Reads actual mesh geometry, including 66 body/wheel/reel/comb meshes and their current parent transforms after batching. Mesh vertices remain within corresponding part envelopes (maximum numerical excess 1.24e-14 m). Reel shaft width stays exactly 2.7/3.9/3.9 m through rotation. This is a containment check, not proof that every point within an envelope is occupied geometry.
- Screenshots inspected at 2560×1600, 1280×720, 844×390 and 390×844. Initial visual fixture put the camera behind the bank wall; that screenshot was rejected and the fixture moved to a clear front approach. Final images show the rig/reels/Joe. Portrait naturally crops the long wings at this close view; UI remains readable. Wheel-defeat portrait also inspected.
- `verify-final-cut-defeat.cjs`: PASS twelve class/size cases, including wheel contact, immediate input retries, frozen scene and checkpoint restoration. Zero page errors.
- Main rule suite: PASS thirteen groups/seven complete pilots. Arrival rules: PASS six full direct/branch walking/sprinting pilots. Crossing rules: PASS eighteen warning escapes and five full fork/fully-cut routes.
- `node tools/verify-final-cut-arrival-browser.cjs --crossings`: PASS three uninterrupted actual-input routes, with read-only predictive crossing waits and no live placement. Direct bank 126.767 s, garage open 126.107 s, drain fork-distraction open 127.314 s; all zero captures. 65 screenshots, zero errors. These are scripted comprehension-aware pilots, not unfamiliar-player tests.
- Existing controls and ending browser regressions PASS; ending has twelve captures and zero errors. Release checks PASS 70 runtime images/34.16 MB, 90 action scenarios, no warnings.
- Installed web-game client final two-burst run completed. `output/final-cut/rig-contact/client-final/shot-1.png` and `state-1.json` inspected; ordinary playing state, no error artifacts.

## Remaining limits

Wheel contact uses the rotating tread/hub envelope: outer radius `hypot(.72,.075)`, total width .54 m. It encloses all sampled tire, tread and hub vertices; the envelope includes small gaps between tread blocks (up to approximately .074 m beyond the rubber cylinder, .02 m beyond a tread's side). This is intentionally documented rather than called exact mesh contact. Detailed folded-wing/deck clearance through all transitions and stress cases remains open. Raised reels themselves remain nonlethal as promised by the encounter's recovery rules.

The changes add one rendered reel, bounded contact work and test-only geometry inspection access. Sustained device performance is not established by these checks. Human fairness, horror, listening and physical-device acceptance remain unverified. FC23 and the full 72-item implementation goal remain incomplete.
