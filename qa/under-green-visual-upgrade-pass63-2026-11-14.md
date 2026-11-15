# Under the Green pass 63 — optional crossing coaching

The complete 53 requirements, 48 refinements and seven acceptance gates remain active. This pass addresses the persistent CROSS/WAIT/RUN water panel identified in the latest visual review and the user's preference for sound-led tension without action-announcing banners.

## Result

Normal play now uses the physical pressure symbols, bank markings, spray and pipe sounds without the numerical crossing overlay. Controls & comfort contains **Crossing assistance (this chapter) → Show crossing timing and advice**, off by default. Explicit opt-in restores the existing timing, stance-aware advice and responsive layout. Sound descriptions remain independently optional; E object prompts and the destination objective remain available.

The boolean is stored in the existing chapter comfort record, accepts only explicit `true`, survives reload/retry and uses a patch write that preserves unrelated fields. If storage fails, the choice works for the session and the existing status region explains that it was not saved. The setting is local because this numerical water-crossing aid is specific to Under the Green. Shared movement, input bindings and campaign accessibility preferences are unchanged.

Runtime edits: `web/under-green.js` and `web/under-green.html`. The water-advice search and panel-layout classes are skipped when assistance is off. No scene materials, geometry, lights, animation, audio, hazards or simulation changed.

## Evidence

Root: `output/under-green/visual-pass63/`.

- `tools/verify-under-green-crossing-assist.cjs`: `hardware-accepted` and `software-accepted` each pass 20 views, with zero page/console errors. Native actual buffer 2560x1600; software actual buffer 960x600 beneath desktop screenshots. Additional viewports 1280x720, 390x844 and 844x390.
- Paired low/warning/surge/receding views preserve exact player/water/flood state, draw/triangle/texture/program counts and raw scene-buffer PNG hashes. At each of the four viewports, toggling assistance also preserves scene pixels and state. A sampled color-diversity assertion rejects empty buffers; the raw native image was inspected.
- Visible HUD panels stay within the viewport with no pairwise overlap or horizontal text overflow in the checked compositions. Native warning/phone off/on, first-bank/cleared crossing, sound descriptions and software landscape images were inspected.
- Ordinary W movement from the entrance clears the first crossing with no overlay, no water hit and checkpoint zero. This verifies that the existing opening remains playable; it does not establish first-time human comprehension or full-route pacing.
- Keyboard Space toggles the setting while paused without advancing simulation. Reload preserves opt-in. Caught → Retry returns to y=5 with bypass false/checkpoint zero, while retaining the assistance preference.
- Sound descriptions still report irrigation knocking with assistance off. E operates the pump and Q turns back/returns; the normal action-caption slot stays empty. A denied comfort-record write leaves the session setting usable, reports storage unavailability, and correctly returns to the last persisted value after reload.
- `settings-preview.cjs` additionally verifies controller A and actual touch input on the checkbox. Full desktop and 390px settings screenshots were inspected; the fieldset fits the phone without horizontal overflow.
- Installed standard web-game client: seven bursts, final ready/playing at (0,8.84), elapsed 1.15 seconds, assistance false, no error artifact. Final screenshot/state inspected. Initial disabled Preparing-button click timeout recovered through later input.
- `node --check` passes for the runtime module and new verifier. Before/verified sources and SHA256 manifest retained under `source/`.

The initial native/software harness used an element screenshot for scene parity; that includes DOM overlays above the canvas and therefore correctly differed when the panel disappeared. Corrected the test to read the preserved canvas buffer directly, added a nonempty-image assertion, and reran both renderers. This was a fixture error, not a runtime regression.

## Limits and next work

No new GPU budget run was needed for this DOM-only edit: checked scene pixels and resource counts are unchanged. This does not close the existing performance gate or claim a CPU/frame-rate improvement. Older historical HUD verifiers that assume always-on coaching require explicit opt-in before reuse; some also retain superseded checkpoint/banner expectations and are not current acceptance evidence.

V51 gains additional local evidence; the item/status counts and all seven whole-level gates remain unchanged. Continue the substantive art work: broad water/depth composition, gallery floor/ceiling integration, irregular district framing, material consistency and whole-route motion/performance acceptance.
