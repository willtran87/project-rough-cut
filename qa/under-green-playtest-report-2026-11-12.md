# Under the Green — local playtest reports

The optional session recorder now retains attempts across retry/restart and exports a bounded local JSON report from the existing pause/result panel. It uses the shared local-telemetry utility; water, trimmer and checkpoint event interpretation stays chapter-specific. Normal chapter entry does not instantiate the recorder or its UI. See `qa/under-green-human-playtest.md` for the actual session procedure.

## Implemented behavior

- `?playtest` enables up to 12 retained attempts, each with up to 256 authoritative events, dropped counts, active duration, durable progress, actual failure, checkpoint replay time and observed input methods. Reports contain optional self-classification and player/observer explanations. Nothing is uploaded or written to localStorage; leaving/reloading discards the page-local recording.
- Crossings begin undecided and become wet, dry or mixed from observed geometry. They record each relevant outlet's arrival phase and mark partial/incomplete encounters explicitly. Exporting a partial encounter reports its current duration and hit delta rather than pretending it is finished.
- Attack state entries are separate from actual captures and blocked blades. Secured aftermath cannot add pressure-exposure time. Exported and archived objects are detached from mutable simulation state.
- The report is hidden during gameplay. Text fields participate in keyboard focus and shared DOM controller navigation; typing movement, Use, Enter or fullscreen keys does not operate the game. Existing menus without textareas retain their behavior.

## Verification

`tools/verify-under-green-playtest.mjs` passes attempt lifecycle, pause timing, checkpoint timing, bounded history/events, immutable archived failures, crossing classification, attack state entries and safe-aftermath exposure checks. A 500-step matched-input comparison confirms identical physical outcomes with/without recording; telemetry remains outside gameplay saves.

`tools/verify-under-green-playtest-browser.cjs` passes normal-entry opt-out, actual Blob downloads, multiline keyboard editing, paused-time exclusion, an actual trimmer capture and ordinary checkpoint retry with retained bypass progress. Staged physical approaches then use ordinary keyboard input to complete a wet spillway crossing, experience a partial surge recovery, and activate the keeper release through secured closure and completion. The downloaded JSON preserves those distinct outcomes. The controller reaches the report fields and activates export. Reload produces an empty report without erasing gameplay progress. No page errors were observed.

These encounter fixtures verify reports against real simulation outcomes; they are not uninterrupted first-time runs. All exported browser sessions are explicitly labelled automated.

The original browser duration assertion rejected `5.399999999999986` for a requested 5.4 seconds. It now checks a 1e-6 tolerance around the expected duration. No simulation time was changed to satisfy that assertion.

Existing threat-observation, encounter comparisons and shared gamepad-session rules pass. `tools/verify-chapter-gamepad-menus.cjs` passes Under the Green and Back Nine settings, focus, journal where applicable, start/pause/retry/exit and disconnect/neutral-reconnect behavior after the shared textarea selector change.

The other current shared-menu consumers were also checked: `tools/verify-level-one-gamepad-menus.cjs` passes all 26 canvas settings rows, DOM comfort/journal navigation, focus recovery, start/pause/retry/exit and disconnect handling. `tools/verify-final-cut-controls.cjs` passes remapped/persisted Use, gamepad movement and pause/resume, real defeat/retry and simultaneous emulated touch movement/focus/run with cancellation. Neither suite proves physical-device comfort; Final Cut's suite is a control regression, not an exhaustive menu audit.

The installed standard web-game client ran ordinary movement with `?playtest`: latest state is ready/playing, elapsed 5.8 seconds, protected lesson crossed, zero water hits. The latest screenshot and state were inspected, as were the spillway gameplay view and report/export views at 2560×1600, 1280×720, 844×390 and 390×844. The form scrolls vertically at compact sizes; text and export remain within viewport width and the export is reachable. These are desktop browser viewport checks, not physical phone qualification.

## Evidence and limits

Evidence: `output/under-green/playtest/rules.json`, `browser.json`, actual downloaded `first.json`, `caught.json`, `retried.json`, `crossed.json`, `surged.json`, `escaped.json`, `reloaded.json`, four-size form/download PNGs, `crossing-2560.png`, and `standard-client/shot-0.png` with `state-0.json`. Existing menu results are in `output/chapter-gamepad-menus/browser.json`; encounter comparison output is retained in `output/under-green/playtest/encounters.log`.

This completes the local session/export workflow for item 43, with automated technical and visual evidence. Unfamiliar-player sessions (item 42), physical input comfort and human listening/experience acceptance remain pending. There is no claim that instrumentation establishes fun, fear or an exhaustive campaign-wide input audit. Full 44-item implementation remains active.
