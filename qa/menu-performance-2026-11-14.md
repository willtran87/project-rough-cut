# Level 1 menu idle rendering

The menu previously rebuilt animated canvas artwork, copied it to its DOM canvas, and submitted the GPU compositor on every game frame, including while another window had focus.

Changes in game.js:
- Cache the opening/grass artwork as a still canvas; regenerate when its source images become ready.
- Repaint only when menu state, records, assets, dialog state or viewport changes. Returning from another screen invalidates the presentation key.
- Poll menu controls at 20 Hz while focused; mouse/keyboard handlers still act immediately. Skip the menu update/render loop when hidden or unfocused.
- Exclude intentional menu polling intervals from gameplay frame-rate telemetry. Gameplay retains its existing frame rate.

Measurement: native D3D11 Playwright Chromium, 2560×1600, settled three-second samples. Baseline source snapshots and reports live in output/menu-performance. This counts actual application compositor calls and canvas copies; it is not a measurement of total system GPU usage. Unfocused/hidden conditions are simulated document properties and focus events in the regression test, not the user's browser session.

| Condition | Before GPU submissions / canvas copies | After | Before main-thread task ms | After main-thread task ms |
|---|---:|---:|---:|---:|
| Focused idle | 131 / 131 | 0 / 0 | 270.77 | 43.71 |
| Unfocused visible | 135 / 135 | 0 / 0 | 271.01 | 32.78 |
| Hidden | Not sampled | 0 / 0 | Not sampled | 28.56 |

Zero layout time in all final idle samples. The focused/unfocused main-thread reductions are approximately 84%/88%; timing varies with other work on the machine.

Verification:
- tools/verify-menu-performance.cjs: idle counts, hidden/unfocused behavior, keyboard focus return, changing notice, resize, settings round trip, clock-out return, synthetic controller navigation. No page errors.
- tools/verify-single-night-order.cjs: fresh/legacy save scenarios, remaining menu actions, records and replay behavior pass.
- Installed gameplay client through tools/verify-presented-client.mjs: high-resolution native run passes, scene error null, no error artifacts. Screenshot inspected.
- Menu screenshots inspected at 2560×1600, 1280×720, and 390×844.

The user's actual YouTube playback was not observed or measured. These changes remove the continuous rendering workload identified in the menu; they do not establish that every possible browser/video stall is resolved.
