# More Ghost Joe sightings

Revision: `20261107-more-ghosts`.

- Fourteen ambient locations, up from five, distributed across early woodland, pond approaches, service areas and the final stretch.
- An eligible location must be in the camera frustum, 30–110 authored distance units away, and outside padded solid/pond footprints. World depth testing still occludes the model normally.
- Sightings hold their anchor, walk into idle using the existing safe lane, fade in/out over 5.5–6.7 seconds, then leave 7–11 seconds between ambient appearances. Selection rotates through eligible locations. Higher-priority manifestations retain precedence.
- Opening grace, chase, warning/approach, recovery and protected interactions continue to suppress sightings, as do the apparition/Reduced Motion settings. No changes to real Joe or player simulation.
- Reuses one animated 5,648-triangle model, one draw call and the existing atlas. No new asset download, shader, render target or model instance. Candidate scans run only on selection or at most twice per second when no site qualifies.

`tools/verify-more-ghosts.cjs` passes timing, rotation, fixed-anchor, duplicate-frame, interruption, reset and comfort checks; all 14 authored sites activate from safe test vantages. Screenshots inspected at 2560×1600. Existing ghost motion tests and all 17 atmosphere checks pass, including actual ghost pixels/depth occlusion, mist, shader preparation and four viewport sizes. Release validation passes 90 action fixtures and 56 image references. Artifacts: `output/more-ghosts-20261107/`.

More opportunities do not guarantee a sighting at every location during a run: camera direction, cover and the tension director still govern visibility. Sustained software-renderer FPS was not re-benchmarked in this placement pass.

Normal installed gameplay client: two iterations, first-hole gameplay, 14 units travelled; screenshot/state inspected and no error artifacts.
