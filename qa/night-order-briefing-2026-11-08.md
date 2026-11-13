# Opening Night Order briefing

Fresh 3D runs now show a narrative/objective screen after course preparation. The gate has been chained shut after Joe's last assignment; the player must complete the Audit Bell, Field Log and Release Review, then escape through either the key-accessed maintenance shed or valve-accessed drain. The first instruction is to follow the lantern path to the Audit Bell. The card reuses the existing opening artwork and names actual objectives and controls.

The existing tutorial state freezes simulation, Joe, player movement and the round clock while reading. Confirm with the remapped Use key, Enter, the visible button/touch or controller A. Movement, stick drift and incidental background clicks do not skip it. Pause/resume preserves the briefing; practice and quick rematches retain their bypass. The confirm button waits for course preparation. Focus is contained within the briefing and returned to the game afterward.

After confirmation, the initial objective stays “First: Ring the Audit Bell” while movement/look tips occupy the context line. Practice chipping is labelled optional. No changes to the required checks, escape conditions, movement model, ghosts or Joe's pathing.

## Verification

- `verify-night-order.cjs` exercises a real menu start, frozen simulation while reading, ignored movement, responsive layout, pause/resume, remapped Use, touch confirmation, controller drift/A, resumed movement and practice bypass. Hardware and software runs pass without browser errors.
- Screenshots inspected at 2560×1600, 1280×720 and 844×390. A small-screen overflow was corrected by tightening the exit copy and grid spacing. The confirm control remains at least 44px tall, visible without scrolling at those landscape sizes.
- First-objective screenshot exposed an old camera-lesson heading overriding the required objective; corrected and added an assertion for the Audit Bell heading.
- Final normal presented-client run passes two iterations / 14 units, ready first-hole state and no error artifacts; full-page screenshot confirms the Audit Bell objective after dismissal.
- Release validation: 90 scenarios, 56 images / 20.8 MB, no warnings. No new media downloads, rendering passes or lights. Human comprehension testing remains prepared for later.

Evidence: `output/night-order-20261108/`. Revision: `20261108-night-order` for game, HUD script and stylesheet.
