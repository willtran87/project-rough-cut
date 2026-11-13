# Final Cut defeat presentation

Implemented a frozen in-engine cutaway of the actual capture scene. No new still-image asset, alternate rig, simulated continuation, camera animation, forced delay or flash is used. The rig, Joe, cut grass and surrounding course retain the capture state. Camera framing differs for the deployed cutting bank and the central chassis; its side follows the contact location. The retry card leaves the machine visible on desktop and above the card on portrait.

`final-cut-defeat.js` records the existing authoritative contact category, rig pose, player location/stance and phase. The existing contact envelope still determines defeat; this pass does not claim to finish FC23's per-part swept shape/animation audit. Copy distinguishes a deployed pass from central-vehicle contact between passes. Crouched failures explain that concealment cannot stop the cutters.

The existing fourteen-voice audio graph reuses crack/scrape voices for a short category-dependent impact, cancels prior sound envelopes, and reaches zero within 0.4 seconds. One impact is scheduled per capture. Retry cancels its tail and restores normal event filters. Hidden-document updates mute the master. No audible-quality or human listening approval is claimed.

## Evidence

- `node tools/verify-final-cut-defeat.cjs`: PASS. Eight category/viewport fixtures cause actual simulation contact. All preserve frozen player/rig/time, show an enabled/focused retry above the fold, keep fourteen audio voices and schedule only one capture impact during repeated updates. Crouching uses the actual current binding. Reduced motion is enabled in portrait fixtures; advice uses maximum caption scale.
- Viewports: 2560×1600, 1280×720, 844×390 and 390×844. Desktop, ordinary desktop, landscape and portrait screenshots inspected. No text overlap or retry clipping observed. Largest advice text remains readable. Expanded comfort controls remain scrollable from the top.
- Actual Enter, mouse click, touch tap and injected Gamepad API A button retry succeed. The controller fixture initially pressed A on connection, correctly triggering the shared neutral-input guard; it now connects neutral before testing the fresh press.
- An immediate first-frame click retry succeeds. Reload directly from defeat restores pump-prepared checkpoint with no stale cutaway. Presentation/retry has no timer gate.
- `node tools/verify-final-cut.mjs`: PASS, 13 groups and seven complete simulation pilots. Current seed-2 pilot 126.375 seconds; default walk 125.708 seconds. These are scripted routes, not human pacing evidence.
- `node tools/verify-final-cut-controls.cjs`: PASS, existing remapping, gamepad, physical capture/retry and simultaneous touch controls; zero page errors.
- `node tools/verify-final-cut-ending-browser.cjs`: PASS, twelve ending screenshots and assertions; zero page errors.
- `node tools/verify-release.mjs`: PASS, 70 referenced runtime images / 34.16 MB, 90 action scenarios, no warnings/failures.
- Installed web-game client: final two-burst run completed, `output/final-cut/defeat/client-final/shot-1.png` and `state-1.json` inspected. Playing at 6.52 seconds; no error artifact. This canvas-only screenshot verifies ordinary play still renders, while the dedicated browser fixtures verify the defeat DOM and cutaway.

Reports/screenshots: `output/final-cut/defeat/`. No full uninterrupted browser route was rerun in this pass; the focused capture fixtures are explicit test entry. Physical-device acceptance, detailed FC23 contact geometry and human comprehension/fear/listening tests remain open. The full 72-item objective is incomplete.
