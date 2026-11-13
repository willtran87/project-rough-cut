# Campaign settings integration — November 12, 2026

Implemented and verified a shared settings pass for review items 22, 35, 37, 38 and 44. This is not completion of the full 44-item brief.

## Player-visible changes

- Under the Green and Back Nine expose an explicitly labeled All chapters group: master volume, mute, reduced motion, dialogue subtitles, sound descriptions, pursuit captions, caption size and background. Each option uses the existing campaign preference store. Under the Green explains that it has no spoken dialogue; Back Nine explains that optional pursuit captions apply to the on-foot escape chapters.
- Level 1 has a MUTE ALL CHAPTERS toggle in its existing canvas Audio settings. Its live master mixer, startup state and save writer consume the same mute preference. Back Nine's Sound button and Under the Green's Sound button now change that campaign preference.
- Back Nine's master volume reads current settings instead of retaining the value captured when its AudioContext was created. Its separate chase music, shake and light-pulse controls remain under Back Nine only. No steering, vehicle or runner movement change.
- Under the Green's water-hit flash respects reduced motion. Maximum local light-pulse intensity cannot restore Back Nine's impact flash while reduced motion is enabled.
- Under the Green provides optional trimmer/pressure sound descriptions through its existing priority selector. Imminent strike and recovery instructions remain independent of optional sound, dialogue and pursuit captions.
- Caption size and background now affect the two DOM chapter caption rails. In Back Nine's compact portrait stage, an instruction temporarily replaces routine objective detail, retaining the district marker; large captions no longer overlap that detail. The instruction and optional sound description remain separate above the dashboard.
- Checkbox labels sit beside their controls. Settings remain scrollable at compact sizes and accessible through the existing gamepad adapter.

## Persistence and migration

`rough-cut.settings.v1` remains the authoritative campaign record; only the changed field is patched, preserving other values. Muted values require an actual boolean. Defaults remain unmuted, subtitles enabled, sound descriptions disabled and pursuit captions enabled.

An old Under the Green-only mute or reduced-motion choice stays local until an explicit campaign choice supersedes it. It no longer silently writes a local reduced-motion choice into campaign storage. The chapter explains retained overrides and offers Use campaign settings here to clear them. An explicit global false value takes precedence over an older local true value. Current campaign values are not copied into legacy override fields when other settings are changed.

Unavailable storage applies the selected option for the current session and displays a persistence notice. Existing chapter checkpoint namespaces remain independent. Settings apply on chapter load/navigation; this pass does not implement live refresh of already-open sibling tabs.

## Current verification

- `node tools/verify-campaign-settings-browser.cjs`: pass. Uses real DOM controls and a real canvas toggle for the UG → Back Nine → Level 1 → UG round trip. Level 1's settings screen is initialized by a test fixture; this is not proof of full menu navigation through Level 1. Audio startup uses actual keyboard input. Tests explicit global unmute over legacy local mute, local override clearing, reload, storage exceptions, caption policy and reduced-motion overrides. No page/console errors in the exercised scenarios.
- Measured Back Nine master gain after live volume changes: approximately .048 at volume .2 and .192 at volume .8. Level 1 unmute at volume .8 produces .44. Muting silences each tested master. These are AudioParam measurements, not headphone/speaker listening judgments.
- Settings and maximum-size gameplay captions captured at 2560×1600, 1280×720, 844×390 and 390×844. DOM checks establish horizontal containment, instruction/sound separation and clearance from the dashboard/objective marker. Screenshots inspected. Back Nine retains its compact letterboxed portrait gameplay layout; actual phone comfort and overall portrait composition remain open.
- `node tools/verify-chapter-gamepad-menus.cjs`: pass for both DOM chapters, including settings, sliders, checkboxes, details, pause/retry/exit and disconnect/reconnect. Injected Gamepad API; not a physical controller test.
- `node tools/verify-under-green-controls.cjs`: pass, including normal mouse look, Level 1 movement speeds, controller/touch movement and inherited bindings.
- `node tools/verify-quiet-messages-browser.cjs` and `node tools/verify-quiet-messages.mjs`: pass. The browser test had an obsolete RAM INCOMING expectation. Updated it to match the later documented chase-drama contract and current pure test; optional engine descriptions and required objective/death/interaction messages remain tested. No gameplay warning policy was changed to satisfy this test.
- `node tools/verify-under-green-audio-aftermath.cjs`: pass. Updated the historical gate-coordinate fixture to use authored SLUICE/GATE positions after range compaction. Actual Use, secure closure, movement, rear glance, pause, applause, results and reload still execute. No simulation acceptance condition was weakened.
- `node tools/verify-chase-drama.mjs` and `node tools/verify-campaign-preferences.mjs`: pass.
- Installed standard gameplay client run for both chapters; final captures show ready/playing Under the Green and ready/driving Back Nine. The initial Back Nine run was still preparing; repeated with 10-second inter-burst waits, then verified ordinary driving input in the subsequent bursts. Artifacts under `output/campaign-settings/standard-client` and `output/campaign-settings/back-nine-client`.

Main evidence: `output/campaign-settings/browser.json` and screenshots in the same directory. Existing regression reports are in their usual output directories.

## Remaining work

The full goal stays active. Remaining work includes Level 1's complete canvas/controller menu audit, further profile/settings integration, pump before/after composition, CP1 pacing, district architecture/material composition and dynamic camera clearance, representative hardware performance, and unfamiliar-player/listening/physical-device sessions. This pass does not claim those validations occurred.
