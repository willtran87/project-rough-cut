# Rear glance and device interruption — November 12, 2026

The preceding goal turn was progress: the analog consumer fix changed runtime behavior and retained a reproduced baseline plus final integration evidence. This pass continues all 44 review requirements and their applicable shared consumers.

## Reproduced behavior

`tools/verify-on-foot-rear-input.cjs --baseline` recorded eight real-input scenarios across Under the Green and Final Cut, with fixture placement on unobstructed ground. Controller input is emulated through `navigator.getGamepads`; mouse uses actual pointer lock, and compact touch uses a `hasTouch`/`isMobile` context with concurrent CDP contacts.

- Under the Green preserves heading and pitch while Rear is held with look input.
- Final Cut rotates heading by 1.1 radians and pitch by -.8 radians during half a second of forward movement + Rear + full right/up stick. This also bends the travel route.
- Final Cut's touch drag during Rear changes heading by .363981 radians and pitch by -.181991 radians. Its mouse already discards look during Rear, so the behavior is device-dependent.
- A held touch-forward input survives controller takeover in Final Cut, causing unintended continued travel. Under the Green clears it. The baseline combined sequence records 1.313623 metres of unintended forward change after takeover, with the previously changed heading also affecting the result; this is not an isolated forward-speed measurement.

Original evidence remains in `output/on-foot-rear-input/baseline.json` and its screenshots.

## Change

`web/final-cut-sim.js` now ignores look deltas while Rear is held. The rendered rear view still animates, while travel uses the preserved heading. Its existing camera convention, pitch limits and rear animation remain unchanged. Release does not replay discarded look input.

`web/final-cut.js` now clears old touch input when meaningful controller input takes over, matching Under the Green. Pending mouse motion is discarded while another device owns input. Chapter mechanics, interaction reach, ball aiming rules, speeds and Back Nine steering are unchanged.

## Verification

- Final `node tools/verify-on-foot-rear-input.cjs`: ten scenarios pass, no page errors. Includes controller movement + Rear + look, ordinary look after release, pointer-lock Rear, queued mouse-to-controller switch, actual concurrent touch movement/Rear/drag, touch cancellation, controller takeover while the finger remains down, blur and stopped resume. Under the Green is the existing-behavior comparison; it is not modified in this pass.
- During half a second of controller forward + Rear + look, Final Cut travels 1.92 metres forward with zero heading/pitch change. Controller takeover after held touch produces zero unintended forward displacement. These are clear-ground input checks, not threat-avoidance playtests.
- `node tools/verify-final-cut-controls.cjs`: passes real remapped pump action, settings persistence, sprint/listen precedence, pause/resume, blade defeat/retry and real multi-touch/release/cancel. Existing settings captures cover 2560×1600, 1280×720, 844×390 and 390×844.
- `node tools/verify-final-cut.mjs`: all checks pass, including seven complete ordinary-input simulation routes, contact at 30/60/120 Hz, shelter safety, coherent checkpoints and permanent victory.
- `node tools/verify-final-cut-balls.mjs`: all checks pass, including charge/release, look-sensitive plan invalidation, blocked shots, save/reload and two complete routes.
- Inspected Final Cut's 2560×1600 rear capture and both chapters' 844×390 actual-touch rear captures. Rear views remain level and compact controls visible. This is not acceptance of the full environment art.
- Installed gameplay client completed one movement/release burst, exit 0. Inspected `output/on-foot-rear-input/client-final/shot-0.png` and `state-0.json`: ready, playing at 2.55 seconds, stopped after release, no error files. The client capture is canvas-only.

Full implementation remains incomplete. Physical-controller/phone ergonomics and unfamiliar-player acceptance remain untested. Source inspection identifies the optional 80 ms movement-start preference as another concrete integration gap: Level 1 and Under the Green apply it, while Final Cut currently does not pass or consume it. Reproduce and address that next without changing default immediate movement or release stopping. Continue the remaining environment, encounter, device and human-validation requirements; do not treat these input checks as broad completion evidence.
