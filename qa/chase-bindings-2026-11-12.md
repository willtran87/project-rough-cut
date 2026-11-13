# Shared control profiles — Back Nine integration

Back Nine now uses the existing chase action resolver for gameplay input, briefing, pause guidance, HUD hints and diagnostics. Its keyboard editor is available under Controls & comfort. The scope is explicit: these keys affect Back Nine; Level 1 and Under the Green retain their separate on-foot profile. Existing WASD/arrows, E/Space brake/use and Q rear-view defaults remain. Cart and runner still steer with a following camera.

`keyboard-binding-settings.js` supplies the DOM editor and persists `chaseKeyboardBindings` inside the existing campaign settings record. It merges individual edited actions into the latest saved profile, preserves unrelated fields, disables locally occupied keys and rejects a conflict introduced by another writer. Failed writes retain session controls and pending action changes for a later successful save. Reset affects this profile only.

Gameplay text no longer embeds E/Space in the garage, log, alarm, ejection and related foot-route instructions. Simulation/story text names the Use action; presentation resolves it to the current keyboard keys, controller B or touch Use. Ejection movement advice also follows the active device and selected keyboard controls. This closes a real cross-device guidance inconsistency as well as supporting remapping.

## Evidence

- `node tools/verify-chase-bindings.cjs` passes actual UI remapping, reload, conflict rejection, interleaved action writes, unrelated preference preservation, storage failure/recovery and profile reset. Real keyboard input drives and steers the cart, steers/runs the player after cart loss, performs a rear glance and completes the garage with remapped Use. Replaced W/Q/E keys no longer perform their old actions; arrow aliases remain. Visiting Under the Green still shows its independent T Use binding.
- The same browser test operates a key selector through injected Gamepad input without starting gameplay, verifies controller-specific garage instructions, and checks the first and last settings controls at 2560×1600, 1280×720, 844×390 and 390×844. The footer does not cover the reset control. Initial and scrolled-bottom captures were inspected, including both compact sizes.
- `node tools/verify-chase-control-labels.mjs` passes 15 instruction cases: garage, closure, log, alarm and ejection across keyboard/controller/touch. Defaults, independent on-foot overrides and conflicting saved chase bindings are checked as well.
- Existing `verify-runner-steering-browser.cjs` passes normal keyboard steering, reverse, rear glance, ignored mouse/touch/right-stick free look, guide behavior and garage completion. Existing `verify-chapter-gamepad-menus.cjs` passes both later chapters' settings, focus, scrolling, start/pause/retry/exit and disconnect/held-input handling after the new fields were added.
- Existing `verify-under-green-controls.cjs` passes Level 1 movement-speed parity, diagonal normalization, immediate stopping, stance height, actual non-inverted pointer-lock look, controller/touch behavior and inherited bindings/sensitivity/FOV. `verify-quiet-messages.mjs` and `verify-campaign-preferences.mjs` preserve message priority, optional-caption policy and storage isolation.

Artifacts: `output/chase-bindings/verified.json`, `labels.json`, eight settings captures, and the standard client's screenshots/state. The final required standard-client run completed two iterations after skipping the opening; its latest `shot-1.png` and `state-1.json` were inspected. The cart is driving, the build is ready, defaults resolve correctly and no error artifacts were produced. Syntax and scoped whitespace checks pass.

## Scope remaining

This advances review items 6, 22, 37, 38 and 44. The new DOM keyboard editor currently has one consumer, Back Nine; Level 1 retains its existing editor, and Under the Green inherits that on-foot profile. This is shared action validation and separate mode behavior, not a campaign-wide UI rewrite. The complete prompt/coaching audit, interaction/audio consumer work, physical-device ergonomics and other outstanding 44-item requirements remain open.
