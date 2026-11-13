# Final Cut — middle cover loss and route fork

This pass advances FC09/11/13/14/15/28/34/36/61/66/69. The full 72-item goal remains active and incomplete. No deployment, unfamiliar-player session, physical-controller session or human listening review is claimed.

## Playable changes

- The middle-strip announcement warns nearby players while its rough remains standing. A crouched player can retreat to the dry bank before the actual reels erase that concealment. The warning is driven by the real selected strip and announce phase, not a separate scripted attack. Already cut cover does not produce the warning. Immediate contact danger takes precedence.
- The final crossing has two marked paths. The bank walk approaches behind a real 2.2 m masonry parapet and crosses at its west end. The shorter open crossing cuts diagonally across the final fairway. Both reconnect at the pavilion approach and work without standing rough. Shared layout data drives rendered walls, collision and route checks; neither parapet intrudes into a scheduled cutting strip or blocks the flooded trap approach.
- A fourth practice-ball basket sits at the fork. From the open route's dry edge, a short shot back toward the middle strip can call Joe's next eligible pass away from the final crossing. The reusable pavilion bell still provides the ending lure; balls remain optional.
- Committed-pass warnings now account for stance speed, remaining lateral distance to the strip edge, player radius, 0.2 m clearance and a 550 ms reaction allowance. They never assume sprint. From the center, this gives about 2.09 seconds for walking or 3.01 seconds for crouch/listen, with a two-second minimum near the edge. The warning does not alter pursuit or contact.
- Current-position objectives distinguish the middle crossing, route fork and bell approach. Announcement/cut/fork history round-trips through the existing checkpoint save and appears in diagnostics. The general simulation pilot now predicts the actual target vector and rejects blocked routes instead of assuming every crossing goes straight north.

## Evidence

`node tools/verify-final-cut-crossings.mjs` passes:

- 18 physical escapes: walk/crouch/listen × 30/60/120 Hz × two rig headings, with a 550 ms reaction delay and no sprint.
- Crouched middle-cover retreat, actual subsequent cutting/concealment loss, save round-trip, warning priority and stale/paused warning exclusions.
- Body clearance along both marked paths, masonry sight blocking and deployed-strip clearance.
- 14 final-pass phase samples on fully cut ground. The open route travels **32.89 m** and spends **4.75 s** inside the final cutting strip; the bank route travels **46.19 m** and spends **2.97 s** inside it. Bank travel takes about **12.03 s** in these samples; open-route arrival varies from **8.57–13.37 s** with predictive waits. Bank arrives first in two eastbound approach samples, open in the other twelve. This establishes a situational tradeoff in these samples, not universal balance or human mastery.
- Five complete ordinary-control simulation finales: both paths with standing or fully cut rough and zero balls, plus a fork distraction/open-route clear. All finish without capture. Equal overall 125.71 s results reflect the later shared trap timing; they do not erase the measured local route differences or prove dramatic pacing.

`node tools/verify-final-cut-arrival-browser.cjs --crossings` passes three uninterrupted Final Cut runs from real direct/garage/drain spawns through normal Gamepad API input handlers. Direct takes the bank path, garage the open path, and drain sends a ball back to the middle strip before the open path. All three enter familiar rough, heed the real middle announcement, retreat, watch that rough get cut, use the pump/bell, physically bog the rig and finish at the road without capture. These are map-aware automated pilots using read-only prediction for crossing waits, not novice playtests. The 65 screenshots and exact timings are in `output/final-cut/crossings/routes/browser.json`.

`node tools/verify-final-cut-crossings-ui.cjs` passes eight warning layouts at **2560×1600, 1280×720, 844×390 and 390×844**, with caption scale 1.4, sound muted and optional threat captions disabled. Both essential warnings remain visible. Metrics check viewport bounds and no overlap with the objective or actual touch buttons; landscape captions deliberately occupy the gap between the two touch clusters.

`node tools/verify-final-cut-balls-browser.cjs` passes actual keyboard/mouse, remapping, injected gamepad and CDP multitouch checks, including refill through Use at all four baskets. Existing main, arrival, ending, outcome, message and ball rule suites also pass. Release verifier reports 70 referenced images, 34.16 MB, 90 scenarios and no warnings/failures.

The installed develop-web-game client was run after implementation, with screenshot/state inspection. Final artifact directory: `output/final-cut/crossings/client-final`. Its submission-time number is not a GPU or sustained-FPS claim.

## Visual corrections and limits

Inspection found a diagonal route grazing the north parapet; the marked route now rejoins at its physically clear east end. The initial fork board was too close and large. It was reduced and moved beside the masonry end. Its body/ball collision now uses shared fixture dimensions, and it sits clear of the backward distraction shot. A redundant instruction sign that obscured the local basket was removed. Ground markings distinguish the exposed crossing from the paved bank approach.

The course still needs its complete dogleg composition, finished materials/vegetation, rig and Joe acting, authored sound and dramatic rhythm. The new cover-loss opportunity can be bypassed by an informed player; first-time discovery and warning comprehension need observation. Both paths remain exposed during their actual crossing. Software-renderer performance remains unresolved from the earlier arrival pass. These tests do not certify full campaign runs, physical devices, human terror/fun or release readiness.
