# Back Nine suspense pass

The cart chase now alternates stalking, audible preparation, a short pursuit surge and recovery. Joe warns with a 2.2-second rising engine before a 3.4-second surge. The speed increase requires a straight paved route, moving cart, adequate separation and no damage invulnerability. Checkpoints and the garage cancel attack preparation. Lost sight cancels the windup; pursuit still uses existing remembered evidence and navigation. The cart's driving and steering are unchanged.

Three course stretches get slow, one-shot power sags. Road lamps retain visible light, and the player's headlight, shelters and garage light remain powered. Joe's amber fixtures match his local light; his face and cutting decks emerge from the dark as he approaches. Head/torso movement follows preparation and surge. A mild edge vignette follows proximity without covering the road or HUD. Reduced-motion mode disables the power dip and body movement and uses a steady edge tint. There is no new screen tearing, shake, strobe or postprocessing.

Seven fixed audio voices provide cart/diesel/deck sound, detuned low drones, pulse and generated wind. Omens reuse the harmonic voice. Spatial panning follows the actual mower, revs precede acceleration, and sheltered respite reduces the deck noise. Close danger remains audible. No additional audio/image downloads.

## Evidence

- `node tools/verify-back-nine-tension.mjs`: warning duration, recovery/cooldown, lost-sight cancellation, speed safety gates, shelter respite, bounded one-shot lighting, pause and final approach protection.
- `node tools/verify-back-nine.mjs`: six complete live-Joe drives (main route, three alternatives, both checkpoint starts). Full routes receive 1–3 warned surges; no teleporting. Shortest measured alternate-route separation ~4.9 m. Automated driving is not evidence of subjective fear or difficulty.
- `node tools/verify-back-nine-browser.cjs --software`: keyboard/pointer/gamepad polling, pause, fullscreen, saves, checkpoint retry, completed reload/replay, stable resources and no browser errors.
- `node tools/verify-back-nine-suspense.cjs` with and without `--software`: forced windup/power-dip views, repeated rear views, reduced-motion layout and offline rendering of the actual audio graph. Audio peak ~0.243, left RMS ~0.073 versus right ~0.051 for a mower on the left, paused tail RMS zero. Seven voices stay fixed.
- Screenshots inspected at 2560x1600, 1280x720 and 844x390, including normal and reduced-motion presentation. Installed standard gameplay client also passes movement/steering/braking and presented screenshot checks.

Resources remain at 10 shader programs and 13 textures; two local lights total. No geometries or audio nodes are created by recurring scare events. The existing single-frame GPU queue and software resolution budget remain active.

Software wet/rear diagnostic sample: 45.89 ms average / 56.20 ms p95 at 960x540. Previous recorded sample was 43.03 / 53.60, from a different run. Dedicated nearby-mower/power-dip stress view: 56.22 / 72.90. Hardware stress sample: 12.15 / 29.60 at 1280x720. These are local short samples, not causal before/after measurements or promises of 60 FPS. Software frame spikes remain a limitation. Reports and images: `output/back-nine-suspense/` and `output/back-nine/software-report.json`.

## Deferred human checks

Use the existing Back Nine playtest guide. Additionally record whether the engine warning is recognizable, whether looking back feels frightening but manageable, whether the quiet stretches build dread, whether paths remain readable during the power sag, and whether the sound mix is comfortable on speakers/headphones. Rate suspense and fairness separately; increased fear should not depend on confusing driving or arbitrary damage. Human feedback remains deferred as requested.
