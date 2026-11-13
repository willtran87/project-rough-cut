# Environmental navigation — 2026-11-08

The normal 3D view hides all 14 large objective/direction/status boards and their conspicuous trim. Small physical maintenance labels, local Use prompts, briefing and map remain. Clear navigation is independent of High-contrast routes, Route thread and Clear path scenery.

## Presentation

- Existing station lanterns raised beside the bell and paperwork. Log and release counters carry loose textured forms; release has a small service canopy. Existing pixel paper/wood/iron materials join static batches.
- Short irregular earth scuffs follow the final approach to each objective/access mechanism and exit. They do not create a route through cover or change collisions.
- Shed: small service plaque, warm light through the sill, filing-box lens and sliding release catch. Drain: wet-stone highlights, small lens/catch and existing lifting grate. Indicators derive from the same three checks plus route-specific access as Use; readiness never implies safety from Joe. Catches live on fixed mechanisms, not the swinging door.
- Practice retains a muted chalk landing circle at its real radius; completing/skipping fades it. Supply lockers retain their opening drawers and get small physical labels.
- Pause → Controls & comfort → Clear navigation restores explicit boards live. Also available in Settings → Readability. Default off, saved independently, category reset restores off. Existing saved games without this preference start off.

## Cost and limits

Environmental detail is one opaque, depth-tested batch, 1,305 triangles, zero new lights, particles, postprocessing passes or downloaded images. Colors and catch positions upload only on objective/lesson state changes. The existing sign atlas is prepared once and hidden by default; toggling allocates no renderer resources and does not rebuild the level. Small physical labels add four canvas textures; verified stable 60 programs / 95 textures throughout toggle and state transitions. Existing runtime image downloads remain 56 / 20.8 MB. This is not a claim that all software-rendering frame spikes are solved.

No player movement, Joe navigation/perception, ghost scheduling, collision, interaction radius or objective rules changed. Render-only toggle tests compare player/Joe/check state for equality.

## Verification

- `node tools/verify-environment-guidance.cjs` and `--software`: fresh default, actual dialog toggle, persistence after reload, category reset, default/explicit views, real E interaction, completion/access state, no resource growth, reduced motion/density zero/pause, no page errors.
- `node tools/verify-exit-cues.cjs` and `--software`: default guidance, both routes reject missing requirements; real E begins filing, movement cancels, retry opens, both reach victory.
- High-resolution scene/settings images inspected at 2560×1600; additional 1280×720 and 844×390 layouts inspected. Iterated scuff geometry/contrast after the first screenshots looked too much like stepping tiles.
- `node tools/verify-station-identity.cjs`: actual landing/roll lesson success, supplies once per run, drawer and gong feedback remain functional with signs hidden.
- Installed gameplay client via `verify-presented-client.mjs`: two iterations, ready first-hole state, 14 units movement, inspected full-page gameplay screenshot, no error artifacts.
- `node tools/verify-release.mjs`: 90 action scenarios pass, unchanged runtime downloads.
- Evidence: `output/environment-guidance-20261108/`, `output/environment-exits-20261108/`.

## Later human playtest (prepared, not conducted)

Use a fresh profile with Clear navigation off. Read the briefing, locate each check without coaching, then choose and use an exit. Record which clue first drew attention, wrong turns, time lost, and whether the player could distinguish locked from ready without the map. Ask the player to find and toggle Clear navigation while paused, and compare confidence/atmosphere. Check with sound muted and on the smallest supported display. No participants recruited; automated positioning checks are not a substitute for testing discovery.
