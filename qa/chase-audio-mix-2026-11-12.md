# Shared audio categories — November 12, 2026

Back Nine consumed master/mute/music preferences during gameplay, but its effects, mower, ambience and danger voices bypassed the corresponding campaign sliders. Opening audio applied three category values directly, creating inconsistent behavior between the opening and play. Both later chapter menus also omitted these four inherited controls.

## Delivered

- Four persistent category gains now sit between Back Nine's authored voice envelopes/panners and the master. Cart and physical impacts use effects; mower/blade use Joe machinery; drone/wind use ambience; pulse/alarm harmonic use danger. The score keeps its existing independent music control. Shared voices retain these categories during defeat.
- The same category gains apply during opening, cart play, runner play, sealing and defeat. Intro envelopes no longer multiply categories separately. Existing envelopes, stereo direction, master limiter and local dramatic pacing remain authored by their existing modules.
- Under the Green and Back Nine expose course ambience, Joe machinery, gameplay effects and danger cues in their All chapters settings. The existing shared adapter validates/persists edits. Level 1 retains its canvas settings and the same preference keys.
- Diagnostic `audio.mix` exposes actual category gains. Four gain nodes are added once at startup; there remain twelve sound sources, including the existing three score voices.

## Evidence

- `tools/verify-chase-audio-mix.cjs` → `output/chase-audio-mix/audio.json`: 44 isolated output cases across opening, cart, runner and defeat, plus four cart/runner rear-glance cases. Zeroed categories, mute and inactive playback produce silence in sampled windows. Live half-volume changes produce half amplitude within tolerance, including opening, without applying the preference twice. Death includes the authored landing transient. These are rendered PCM measurements, not a listening assessment or an exhaustive peak guarantee.
- `tools/verify-audio-settings-ui.cjs` → `output/chase-audio-mix/ui.json`: actual sliders in Under the Green persist into Back Nine, reach live mixer buses and survive reload. Back Nine's Joe slider silences that bus after audio starts. Level 1 receives all four values; a real keyboard edit to its canvas slider carries back to Under the Green. Test fixtures only expose diagnostics/open the Level 1 settings screen.
- Settings screenshots inspected in both chapters at **2560×1600, 1280×720, 844×390 and 390×844**. New controls stay within labels and remain reachable in scrolling menus; the Back Nine fixed action footer does not cover them in the inspected views.
- Existing `verify-cart-damage-audio.cjs` and `verify-runner-audio.cjs` pass. They contained stale nine-source assertions predating the three-voice score; updated to twelve and explicitly disabled score output to isolate the intended effects/stereo checks. Damage test preserves three crunches/four collapse cues, pause/mute/retry behavior and no allocation growth after startup (17 gains, 12 filters, 12 sources). Sampled damage peak: 0.4300.
- Existing `verify-under-green-audio-aftermath.cjs` passes: actual Focus input ducks water/emphasizes Joe, spatial water attenuation, entrance cues, paused time/audio, secured gate/free movement/rear glance, applause and saved completion.
- Existing chapter gamepad-menu and campaign-settings browser regressions pass, including four viewport sizes, input interruption, live master/mute, captions, preference round trips and unavailable storage.
- Standard web-game client completed two iterations in Back Nine. Latest `output/chase-audio-mix/standard-client/shot-1.png` and `state-1.json` inspected: playing/ready, 1.7 seconds, twelve voices, default category gains, no error artifacts. Syntax checks pass.

## Limits and follow-up

This closes a concrete category-control integration gap, not the full 44-item review. Human headphone/speaker intelligibility, physical-device ergonomics, sustained hardware performance and unfamiliar-player acceptance remain unverified. Under the Green's Focus regression is current; a complete first-person semantic comparison with Level 1 remains open. Source inspection confirms Level 1's mower pan already uses rear-glance camera orientation, so no redundant pan refactor was made.
