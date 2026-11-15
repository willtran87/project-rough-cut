# Under the Green — observed threat information

The previous threat caption read Joe's internal phase whenever he was within 28 metres. It reported searching, water delay, recovery and raised blades even when he was behind the player's view. The mixer supplied only an ordinary engine sound for several of those states. `output/under-green/threat-observation/before.json` records that information leak.

`under-green-senses.js` now supplies a physical source calculation shared by this chapter's audio mixer and captions, using the existing campaign spatial helper. Observation also checks the current camera yaw/rear glance, pitch, vertical FOV, aspect ratio, sampled body heights and structural line of sight. Joe seeing the player is not treated as proof that the player sees Joe.

Visible Joe can still receive distinct search, water-delay and recovery descriptions. Unseen ordinary engine states share one heard-only cue; unseen windup and sweep share an engine-rev cue. Close unseen attacks retain actionable counterplay. Solid cover that prevents the physical strike suppresses the imminent-contact warning. These changes affect presentation, not perception, navigation, attack timing or hit geometry.

Sound descriptions separate the entrance door from the later starter. A nearby warning pipe takes precedence over ordinary motor description. Entrance wording no longer asserts “ahead” regardless of camera direction. Water recovery and briefing text no longer claim Joe is always moving while the player waits.

Accessible captions describe world cues independently of user mute and category volume. Optional threat and dialogue settings do not disable the essential close-attack warning. Existing danger/event/interaction priorities remain; this pass does not declare the other chapters' message audit complete.

## Verification

- `tools/verify-under-green-threat-observation.mjs`: unseen walk, turn, search, water-wait, water-recovery and recovery all provide the same information. Rear-visible search and water behavior remain distinct. Tests cover hidden and visible close attacks, solid cover, actual opaque walls, vertical look, desktop/portrait FOV, door/starter timing, pressure-warning priority and absent Joe.
- `tools/verify-under-green-threat-observation-browser.cjs`: actual R hold/release switches between heard-only and visible-state guidance. UI settings disable optional threat/dialogue captions and mute sound while preserving essential attack counterplay. Four-size screenshots were inspected at **2560×1600, 1280×720, 844×390 and 390×844**. The same Joe position is visible in the landscape views and outside the portrait view; the respective captions match those rendered views. Tests also cover the service wall and priority over checkpoint text.
- Existing 24 live-Joe wet/dry route scenarios pass. Their visible-caption fixture now explicitly faces Joe instead of depending on the checkpoint's initial camera heading. Navigation, recovery, perception and route-choice outcomes remain intact.
- Existing audio/aftermath and foot-contact audio suites pass after sharing source placement. Nine walk/turn/stop trajectories across 60/30/15 Hz preserve contact/cue correspondence; duplicate delivery, pause, mute, retry and simultaneous feet remain covered. These verify the audio graph and lifecycle, not human intelligibility.
- Actual service-encounter input still produces defeat when the windup is ignored and evasion with lateral movement. Interaction and lesson browser regressions pass. The interaction priority fixture was moved from an out-of-floor Joe position to a legal nearby position because imminent warnings now use physical line clearance.
- Standard game client completed after the presentation changes. Latest screenshot/state inspected: ready/playing at 5.78 seconds, completed first crossing, no water hits and no console-error artifact. Syntax and scoped whitespace checks pass.

## Remaining acceptance

The source-gain threshold is a geometric presentation rule, not a calibrated human hearing threshold. Headphone/speaker listening, unfamiliar-player interpretation, physical-device usability and sustained performance remain pending. Global message/prompt review and the remaining encounter/presentation requirements in the 44-item goal remain active.
