# Responsive course settings — November 12, 2026

Level 1 settings and key bindings now use readable native controls in a responsive
panel. Portrait settings fill the stage. Return stays at the top, reset/bindings/
comfort actions stay at the bottom, and long categories scroll between them.
Small screens scroll the category buttons horizontally to preserve room for
options. All 26 existing settings and 11 keyboard actions retain their source
data and existing application/persistence functions.

## Behavior

- Sliders use the same game-side clamping/steps, audio preview and persistence.
  Their native display accepts exact saved values between adjustment steps, such
  as the default 72% mix and Calm's 65% look sensitivity.
- Native switches, labels, focus outlines and 44px targets support mouse/touch.
  Gameplay text size also scales this panel. Readability shows all ten options
  in one scrollable category rather than hiding four behind More.
- Keyboard/controller selection follows the displayed category order. Keyboard
  Tab reaches category/footer buttons and every binding; arrows select/adjust.
  Home/End retain native range behavior; page keys scroll the content.
- Key capture keeps conflict swapping, reserved-key rejection, cancellation and
  default reset. Rapid selection followed by adjustment uses the selected game
  state, without relying on a delayed browser focus update.
- Camera presets and drag preview remain; preview dragging does not select text.
  The original Controls & comfort dialog is reused and returned to its normal
  location on leaving settings. Its brightness/FOV/hold-toggle options remain
  available alongside the main settings categories.
- Settings opened from Pause keep the round frozen and return to Pause. Changing
  Joe pressure during a round still marks that round unranked. Menu settings
  return to the menu. The legacy canvas renderer remains a fallback.

## Verification

`node tools/verify-course-settings.cjs` and the `--software` variant pass eight
groups with no page/console errors. Coverage includes:

- 2560x1600, 1280x720, 844x390, 390x844 and 320x568 with maximum text scale;
  bounded content, all ten Readability rows, a visible footer and 44px controls.
- Actual touch swipe scrolling, native taps, sliders and category-only reset.
- Mouse drag preview, presets and the existing comfort dialog.
- Binding conflict swap, reserved arrows, Escape cancellation, reset and Tab.
- Injected controller D-pad adjustment/selection, Y bindings, A capture, B return.
- Rapid keyboard selection/adjustment, real reload persistence, menu return,
  paused-round time preservation, pressure/unranked behavior and resume.

Final hardware verification includes the exact 72%/65% range assertions and
compact Controls/Bindings screenshots. Software verification includes the same
behavior and exact-value assertions; its run preceded only screenshot additions,
moving the stylesheet link into the document head and disabling preview text
selection. The latter was visually checked in the final hardware pass.

The existing `verify-course-pause.cjs` also passes all six groups (session 79356),
including fast keyboard confirmation, frozen simulation, map return, dialogs,
controller input, restart and menu return. Syntax checks pass.

Installed presented client session 72913 exits 0 after two normal arrival input
iterations. Latest screenshot/state inspected; no error artifacts. Readiness is
still 56/57, with only `gameplay_frame_budget` failing; this is not a performance
qualification run.

Evidence: `output/course-settings/hardware/`, `software/`, `standard-client/`.
High-resolution settings, ordinary arrival, compact portrait Readability,
Controls and Bindings screenshots were inspected.

## Issues resolved during verification

A horizontally scrolling category bar initially expanded the grid at 320px.
Constrained grid sizing fixes it. A fast synthetic touch fling also swallowed the
next test tap while native momentum scrolling was stopping; event logging showed
pointer down/up without a click. The touch test now performs a deliberate slow
drag and settles the gesture before tapping, preserving real native scrolling.

## Remaining scope

Main menu, claim and clock-out responsiveness remain. Full physical-device and
accessibility acceptance, whole-route pacing/art/playtests and frame-time work
remain in the full ledger. This pass does not complete the overhaul.
