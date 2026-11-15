# Final Cut — player-operated terrace reveal

The complete 72-item goal remains active. This pass advances FC02/06/07/18/21/26/57/66. FC06 remains **Partial**: the lighting and playable staging now exist, but the current ambient silhouette still reads as a machine. The intended initial impression of two separate vehicles needs further authored lighting/background work and unfamiliar-player observation.

## Implemented

- Added a physical final-round control on the overlook, left of the ramp opening. The original ground-level control remains. Both request the same single encounter; neither starts a hidden countdown before Use.
- The two enlarged wing marker lamps light during Joe's final startup interval. Main headlights and cab task illumination stay off while the player observes. The markers are 5.21 metres apart on the folded wings.
- After Use and readiness, the first two reveal seconds retain isolated markers. Main beams build smoothly over the following two seconds while the actual wings lower. The deployed marker separation is 10.5 metres. Camera look remains entirely player-controlled.
- Marker brightness, main-beam intensity and lamp-face color derive from simulation state. Pause freezes them; startup reload preserves the boarding-clock state; a completed reveal reload skips its repetition. Both light sets fade over the existing eight-second collapse shutdown. An unfinished reveal still restarts safely from the overlook under the existing checkpoint contract.
- Enlarged lamp dimensions are in shared rig geometry, so wing/masonry clearance includes their actual bounds. No additional shadow-casting lights, particles, billboards or screen-space glow were added. The existing two local spotlights retain shelter occlusion.
- Moved the near east floodlight pole outward, away from the actual marker sightline. Reduced the terrace control's sign and pedestal so they do not crowd the forward view. The optional PA yields when a usable control is being inspected and remains available after looking away.

## Evidence

- `verify-final-cut-reveal.mjs`: 30/60/120 Hz, three-minute safe waiting, actual Use, two-second isolated markers, smooth beam/deployment timing, gate opening behind the real pass, startup pause/reload, completed-reveal skip, original control and collapse fade.
- `verify-final-cut-reveal-browser.cjs`: D3D11 hardware and SwiftShader, normal keyboard Use and Gamepad API look, startup/waiting/reveal, actual pause and completed-reveal reload. Four viewports (2560×1600, 1280×720, 844×390, 390×844), twelve captures per renderer. The compact folded views use explicitly documented presentation fixtures; the main reveal is an uninterrupted ordinary-input sequence.
- Browser audit checks both marker centres are inside the view and have unobstructed scene rays. Physical marker separation changes from 5.2107567 to 10.5 metres. Screenshots were also inspected; projected coordinates alone were insufficient.
- Existing folding rules pass eight recovery scenarios at four rates. Folding browser verifies ten actual mesh poses against shared clearance, including the larger lamps. Existing rig contact tests pass 2,000 independent seeded comparisons and contact at 30/60/120/144 Hz.
- Existing hardware lighting suite passes real shelter-floor rejection, visible exterior illumination, moving emitter/shadow matrices, pause/reduced-motion consistency and collapse reload/fade. This is functional evidence, not a new performance qualification.
- Main rule suite passes 13 groups/seven complete simulation routes. Arrival rules pass six walking/sprint routes. Three uninterrupted browser finales using the original control pass with zero captures/throws/errors: direct 136.11 seconds, garage 138.98, drain 140.02. Those runs precede only the final smaller terrace label/pedestal.
- Announcement rules/browser pass receipt variants, interaction priority, looking away to hear the PA, pause/reload, cancellation, fallback and replay. The missing-audio fixture now looks away from the new control before testing optional speech.
- Three additional uninterrupted browser finales using the new terrace control pass on the final layout: direct 131.56 seconds, garage 138.67, drain 139.71; zero captures/throws/errors, all crossings, pump, bell, trap and road completion. Thirty-five captures include the elevated deployment views. These map-aware pilots establish reachability, not first-time pacing or enjoyment.
- Final installed web-game client completed two movement bursts. Latest screenshot/state inspected: playing at6.50s, descending toward the rail, zero captures, no error artifacts; both lamp sets correctly remain off before Joe reaches startup. This client sample is a movement smoke check; the separate reveal browser test exercises the new control.

## Issues caught

The first control placement and large sign obscured the rig. Moved the control left and reduced its size. A subsequent actual-geometry ray check found the near east floodlight pole directly in front of one folded lamp; the pole now stands farther outside the course. Initial state-only checks had passed despite those visual defects, so they are not accepted as final reveal proof.

## Remaining scope

The two-separate-vehicles misreading is not achieved by these technical checks. Refine the visible silhouette, competing signs/background and dramatic light contrast while preserving useful terrain/shelter readability. The low swale is still hidden by the bank that protects the longer route; no protective wall was removed to force a screenshot. Continue full environment/acting/audio/pacing work, physical-device/lifecycle checks, unresolved software performance and human fun/fear/listening acceptance.

Artifacts: `output/final-cut/reveal/`, refreshed `folding`, `lighting/hardware`, and `announcement` reports. No deployment or commit was made.
