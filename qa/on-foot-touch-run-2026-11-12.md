# Shared on-foot touch running

November 12, 2026. The previous goal turn was progress: presentation, scenery and controller-menu implementation. This pass implements review item 36's optional two-thumb input method in both applicable on-foot chapters, with related preference and interruption fixes. The all-44 goal is still active.

## Behavior

“Tap Run to toggle (on-foot chapters)” is available in Level 1's Controls & comfort screen and Under the Green's comfort section. It is off by default, preserving hold-to-run for existing users. The choice is stored in `rough-cut.feel.v1` and carries between the chapters. Back Nine retains its vehicle/runner steering controls.

When enabled, a Run tap selects sprint speed; the player can then move with one thumb and look with the other. Run on is visibly highlighted. The next tap returns to walking. Selecting Run supplies no movement on its own. Ordinary touch release retains the selection; owned cancellation, unexpected capture loss, pause and focus loss clear it. Switching to keyboard/controller also clears touch input. Movement speeds, stance rules, collision and non-inverted look remain unchanged.

`touch-run-control.js` supplies the same pointer-owned hold/toggle behavior to both chapters. Under the Green's movement/action buttons now also retain their owning pointer, so an unrelated finger cannot release another finger's action. Look ownership is preserved when another pointer is released. Level 1 handles lost capture through the same interruption path as touch cancellation.

Comfort persistence now writes only fields changed since the page's last successful read/save, preserving newer settings from another chapter/tab and unknown fields. A failed write retains the change for a subsequent retry. This fixes an integration risk introduced by sharing another comfort preference; it is not a replacement for every campaign settings adapter.

Under the Green's action targets are at least 44×44 CSS pixels at the tested sizes, and the portrait caption sits above the taller controls. Level 1 retains its existing landscape-oriented phone layout and rotate-device guidance in portrait. Its portrait controls remain small; this pass does not certify that layout as comfortable on a physical phone.

## Evidence

- `node tools/verify-touch-run.mjs`: pass. Owned hold/toggle presses, ignored unrelated releases, normal release followed by implicit capture loss, cancellation/reset, stale preference preservation, unknown fields, malformed storage and retry after failed writes. Report: `output/touch-run/rules.json`.
- `node tools/verify-touch-run-browser.cjs`: pass. Uses Chrome DevTools `Input.dispatchTouchEvent` to send actual simultaneous browser touch contacts, rather than directly setting movement state. One Run tap followed by two contacts moves and looks in both chapters. Measured sprint displacement is 3.04 m over 0.5 s in each chapter. Touch vertical look remains normal. Normal release, cancellation, pause and blur are checked. Actual UI settings carry UG → Level 1 → UG, including return to hold mode. Report: `output/touch-run/browser.json`.
- The same browser suite captures 2560×1600, 1280×720, 844×390 and 390×844. Under the Green target dimensions are asserted at each size. High-resolution, landscape and portrait captures were inspected. The first CSS sizing rule lost to an existing more-specific portrait selector; the corrected rule and dimension assertion now pass.
- `node tools/verify-under-green-controls.cjs`: pass. Existing movement, real mouse up/down, rear glance, remaps, controller and touch hold behavior remain correct.
- `node tools/verify-interact-controls.cjs`: pass. Actual Level 1 interaction input, displayed bindings, menus, migration and preferences remain correct.
- `node tools/verify-campaign-preferences.mjs`: pass. Existing campaign preference and sibling-save guarantees retained.
- `node tools/verify-chapter-gamepad-menus.cjs`: pass. New option remains compatible with the shared DOM menu navigation; both chapter menus and reconnect handling pass.
- Required develop-web-game client: two gameplay input bursts, with screenshot/text artifacts in `output/touch-run/standard-client`. Latest screenshot and state inspected. No recorded browser errors in the passing suites.

No human thumb-reach, grip-fatigue, physical-phone or physical-controller session has occurred. Browser contact support is evidence for input behavior, not a claim of ergonomic acceptance.

## Remaining objective

Continue late-range/CP1 pursuit tuning and pump payoff sightlines, fuller district art and camera clearance, remaining campaign comfort/caption/menu integration, representative-device performance budgets, and unfamiliar-player/listening/device evaluation. All 44 review items remain tracked; this pass does not mark the full goal complete.
