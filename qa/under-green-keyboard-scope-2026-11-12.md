# Under the Green — shared keyboard controls

Review items 6, 37, 38 and 44. This pass completes and verifies the keyboard-editor work present in the worktree; it does not close the full 44-item implementation or the complete campaign prompt audit.

## Changes and reproduced failures

- Under the Green exposes nine applicable on-foot actions in Controls & comfort. Labels, the control guide, movement hint and interaction action use the live binding object. Reset explicitly restores the whole on-foot profile, including ball/guide actions used elsewhere. Back Nine retains its independent chase profile.
- The shared editor writes the on-foot binding version in the same storage transaction as the bindings. Previously Final Cut could store an intentional Enter binding, fail the separate version write, and still report success. Under the Green subsequently migrated that binding back to E. Retained evidence: `output/on-foot-keyboard-scope/baseline.json` and `baseline-inherited-2560.png`.
- Reproduced another migration failure through Under the Green's actual editor: a legacy full-default save correctly displayed E, but changing Forward to I silently restored Enter. The editor now resolves the latest stored profile with its stored version before merging an edit. Retained failing-state evidence: `output/on-foot-keyboard-scope/legacy-baseline.json`.
- Failed writes apply for the session and report that limitation. A subsequent successful edit persists pending actions and version together, while retaining unrelated newer settings and unedited bindings from another tab.
- Under the Green and Final Cut format custom movement keys with separators. The Level 1 legacy calibration footer uses its existing device/binding-aware copy helper. No movement speeds, vertical-look behavior, water timing or pursuit rules changed in this pass.

## Verification

`tools/verify-on-foot-keyboard-scope.cjs` passes seven groups, with no page errors. It covers:

1. Legacy full-default migration followed by an unrelated edit.
2. Rejected versioned writes, unchanged durable storage, session feedback, recovery, interleaved peer changes, duplicate conflict rejection and separate chase state.
3. Nine editor actions, custom movement labels, four viewport layouts and scroll-reachable reset controls.
4. An intentional Enter binding carried from Under the Green into Final Cut and Level 1. Actual keyboard input operates both pumps and Level 1's bell; the replaced E key does not. Fixtures position the player at valid targets; this is interaction verification, not a full chapter traversal.
5. Explicit full on-foot reset preserving chase bindings and unrelated preferences.
6. Emulated controller adjustment/reset without starting gameplay, followed by keyboard Enter activating the focused menu button.
7. Separate browser touch contexts at 844×390 and 390×844, with editor changes and reset through the compact UI. Physical phone/controller comfort remains untested.

Passing affected-consumer regressions:

- `tools/verify-under-green-controls.cjs`: established walk/run/crouch/listen speeds, diagonals, stopping, non-inverted pointer-lock look, rear glance, controller movement and touch movement.
- `tools/verify-final-cut-controls.cjs`: persisted remapping and actual actions, controller movement/pause, defeat/retry and simultaneous browser-touch controls.
- `tools/verify-chase-bindings.cjs`: independent chase remapping, steering/follow camera, actual garage sealing, failure recovery, controller editor and reset. Its banner assertion now accepts sentence capitalization; it still requires the mapped keys and the physical sealing result.
- `tools/verify-campaign-settings-recovery.cjs`: failed preference writes, pending recovery, peer-field preservation, reload and transitions in Under the Green, Back Nine and Final Cut.
- `tools/verify-on-foot-view-interactions.cjs --remapped`: rear-view target eligibility and actual Use in Level 1/Under the Green, plus I/J/K/L movement coaching and B chip/aim/release. The lesson fixture now clears the opening message before checking tutorial text and expects the current hold/release wording; it still verifies the mapped action and actual shot.

The installed web-game client ran two ordinary-input iterations. Final state: playing, lesson crossed, East Spillway, 11.20 simulation seconds, zero water hits; no error artifact. Screenshot and state inspected in `output/on-foot-keyboard-scope/client/`.

Visual inspection included 2560×1600, 1280×720, 844×390 and 390×844. The desktop editor has two columns; portrait has one. Selects and reset meet the tested 44-pixel minimum, stay within horizontal bounds and remain reachable by scrolling. Reviewed editor/top and reset/bottom captures plus the actual pump aftermath. The installed client's canvas image omits the DOM HUD; the full-page pump capture includes it.

An initial layout assertion caught fractional browser scrolling (reset bottom 390.266 at a 390-pixel viewport). Explicitly centering the reset for the reachability check demonstrates the available scroll range; no runtime geometry was changed to satisfy that fixture.

## Remaining acceptance

Keep broader prompt/coaching coverage, physical-device usability, unfamiliar-player sessions, listening assessment, encounter balance and cold-start performance open. A passing keyboard transaction does not prove every preference or every chapter instruction is integrated. Continue the existing ledger's range, recovery, architecture and presentation work without discarding historical failed balance evidence.
