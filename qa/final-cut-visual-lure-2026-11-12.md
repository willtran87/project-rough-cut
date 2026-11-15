# Final Cut — deliberate visual lure

## Player-facing change

The prepared-swale objective now offers both supported tactics: be visible from the west bank, or ring the pavilion bell. When actual perception selects the player for a swale approach, a bounded event caption confirms that Joe saw them and tells them to retreat toward the pavilion. The objective retains the selected approach after that short caption expires. The committed-pass caption identifies the flooded swale rather than calling it the ordinary final fairway.

This does not add a proximity-triggered victory or alter perception, attack selection, speed, geometry, saturation, or collision. The existing selection rule still requires clear sight, no crouch concealment, fully saturated ground and a position beyond the swale on its western side. It samples only between passes. Joe traverses the actual headland to the eastern approach, announces, then drives into the water. An already committed ordinary pass cannot change course to follow new bait.

## Evidence

- `node tools/verify-final-cut-visual-lure.mjs`: four groups pass. Six explicit perception/retreat fixtures cover both headlands at 30/60/120 Hz. The player walks into the pavilion and behind its upper east wall; losing sight does not change the selected destination. All reach physical bogging and a saved victory.
- Negative fixtures cover masonry, uncut crouch cover, the wrong side of the swale, dry ground, partial flooding and a currently committed ordinary pass. None grants a new visual trap approach. These fixtures are rule checks, not full playthroughs.
- Nine complete ordinary-control simulation routes pass without captures, bells or balls: direct/garage/drain, bank/open paths, walk/sprint/crouch, both alternate plans, fully cut terrain and a prepared checkpoint with depleted inventory. Times range from 57.14 seconds for prepared entry to 138.09 seconds for a full drain entry. The automated pilot knows the map and predicts crossing windows; these are not first-time player times.
- `node tools/verify-final-cut-arrival-browser.cjs --visual-lure --overlook-start --out=output/final-cut/visual-lure/hardware`: three uninterrupted browser finales from actual chapter-entry spawns using ordinary Gamepad API movement, look and Use. Direct/garage/drain complete in 131.8561 / 138.9628 / 140.0045 simulated seconds, with zero captures, bell uses, ball throws or browser errors. No live-state placement is used in these three runs. The report separately identifies later boarding/sign fixtures.
- The same browser command with `--software --out=output/final-cut/visual-lure/software` also passes all three routes, with identical simulated completion times, zero captures/bells/balls/errors and 45 captures. Hardware produced 41 captures; software additionally includes four selected-guidance viewport captures. Both owned browser processes exited successfully.
- `node tools/verify-final-cut.mjs`: all thirteen existing rule groups and seven bell-route simulations pass.
- `node tools/verify-final-cut-messages.mjs`: four groups / twelve cases pass, including essential-warning priority, optional-caption preferences, both heading/rate escapes and aftermath subtitles.
- Installed develop-web-game client: two movement bursts complete; final screenshot and text inspected at 6.52 seconds, waiting rig, dry swale, 48 geometries / 20 textures and no error artifacts.

High-resolution hardware exposure and selection views were inspected at 2560 × 1600. Software selected-guidance views were inspected at 2560 × 1600, 1280 × 720, 844 × 390 and 390 × 844: objective, event caption and threat remain readable and fit their containers. These use standard caption size and gamepad hints; this pass does not claim a new largest-caption/touch audit.

The first retreat fixture incorrectly assumed the center of the pavilion always blocks sight. Its east doorway legitimately allows a view through the center from some rig positions. The pilot now continues through ordinary movement to (-12, 89), behind the actual upper east wall, before asserting occlusion. Production walls/perception were not changed to satisfy that assertion.

## Limits and remaining work

The observed-player tactic now has direct complete-route evidence and player-facing guidance. Unfamiliar-player discovery, perceived danger, satisfaction, listening and physical-controller acceptance remain untested. These chapter-entry runs do not play the preceding campaign chapters. No sustained rendering-performance claim is made. The complete 72-item goal remains active.

Artifacts: `output/final-cut/visual-lure/{rules.json,hardware,software,client}`.
