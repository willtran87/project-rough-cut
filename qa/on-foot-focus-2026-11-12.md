# On-foot Listening Focus — controls and presentation

Under the Green's input adapter and audio mixer supported Focus, but its touch UI had no way to hold it. The chapter now exposes a **Listen** button with held-state feedback. A small **LISTENING** label also reports the active state for keyboard and controller players. The controls guide explains the slow movement and reduced masking noise, and continues to resolve the actual keyboard binding.

Touch actions use two compact columns in portrait and five buttons in a row in landscape. Use spans the bottom row in portrait. All actions retain at least 44 CSS-pixel targets. Essential water feedback and the central route view remain available; Focus does not replace danger guidance.

## Shared semantics and local ownership

- Level 1 and Under the Green both use the on-foot Focus action, hold/release behavior, 2.4 m/s listening pace, and Focus precedence over sprint. The same saved remap is consumed in both chapters. Under the Green uses LT for controller Focus, matching its documented on-foot profile; touch now exposes the supported action.
- Both mixers reduce masking ambience and emphasize Joe. Level 1's existing authored ambience level changes from .032 to .018 and its motor gains a listening contribution. Under the Green retains its authored water multiplier .32, player-step multiplier .35, engine multiplier 1.2 and Joe-contact multiplier 1.35. Sharing the expectation does not require identical sound gains for a mower outdoors and a trimmer beside irrigation.
- Existing source positioning, occlusion, category preferences and water warning cues remain in place. No wall-vision indicator, new enemy knowledge, perception tuning, or Back Nine action was added. Enemy hearing remains chapter-authored; this pass does not claim identical stealth ranges.

## Verification

`tools/verify-on-foot-focus.cjs` → `output/on-foot-focus/browser.json` passes:

- Actual Level 1 gameplay and Under the Green consume a saved Z Focus remap. Holding Focus + forward + sprint travels 1.2 metres in half a second; release restores ordinary input. The old Q binding no longer activates Under the Green Focus. Its guide displays Z.
- Injected LT + RT uses listening pace, then releases. This proves the input path, not physical-controller ergonomics.
- CDP touch input holds Listen and movement simultaneously. Releasing Listen while retaining movement restores walking; touch cancellation clears the action. The button and active-state label match the state.
- Blur pauses, hides the active indicator, and clears the held input before resume.
- Four viewport captures inspected: **2560×1600, 1280×720, 844×390 and 390×844**. Touch controls remain in bounds with minimum targets; the objective/Focus label and water panel do not overlap. Screenshots show the actual touch-mode UI.

The initial Level 1 test accidentally used its calibration lab, which deliberately sets Focus false. The fixture now exits that lab mode and runs actual course simulation. No gameplay code was changed to accommodate the fixture.

The partial multi-touch release helper also originally sent the remaining contact to Chromium, which lifted the movement finger instead of Listen. Recorded pointer events identified the mismatch. The helper now releases the intended contact, with all-contact end sent empty. The same correction was applied to `tools/verify-touch-run-browser.cjs`; its actual multi-touch movement/look, cancellation, pause/blur and shared-option tests pass in both chapters. Product input handlers were unchanged.

Existing `verify-under-green-controls.cjs` and `verify-under-green-audio-aftermath.cjs` pass: normal mouse look, stance speeds, remapping, touch Run, actual Q-driven water ducking/Joe emphasis, spatial attenuation, audio pause and secured ending remain intact. The standard game client completes a normal first crossing; latest canvas screenshot/state inspected, ready/playing at 5.78 seconds, zero water hits, lesson completed, no error artifact. Full-page captures provide separate HUD evidence.

## Remaining acceptance

This closes the missing touch Focus control and verifies the shared movement/action semantics. Human headphone/speaker listening, physical-device usability and unfamiliar-player comprehension remain pending. The wider encounter, presentation and performance requirements in the 44-item goal remain active.

Protected-lesson browser regression also passes after the touch-layout change, including save/retry/reload, coaching retirement and four-size touch-mode composition.
