# Under the Green visual pass 25: physical water contact response

V24 locally accepted after final cross-district verification. V46 advances to in_progress: its water-contact response is implemented, while masonry and root impacts remain unfinished. All 53 requirements and seven full-level release gates remain in scope.

## Implementation

Actual blade-water contacts now throw a brief low fan of lit silty droplets. The fan follows measured horizontal blade travel, or spreads radially for almost-stationary/vertical entry. It uses real contact height and analytic gravity, rises less than10cm, and ends when droplets return to the surface. Player/Joe feet and pipe-drip arrivals use smaller radial bursts. No added glow, foam sheet, mist blanket, new light or sound announcement.

The contact tracker now interpolates a descending blade crossing between rendered frames. It records the actual crossing position and time, rather than missing a fast entry whose next endpoint is already below the surface band. Continuous-motion bounds reject large jumps. Stationary submerged blades do not repeatedly emit; lifting and re-entering at the same location can produce a fresh impact. Shared puddle/channel/flood queries remain authoritative. Droplets outside actual water or inside solid boundaries are suppressed. Existing depth-tested particle materials retain opaque scenery occlusion.

The existing droplet batch gains480 reserved slots (40contacts x12maximum droplets), with no new mesh/material/texture. Existing ripples remain beneath each response. Reduced Motion suppresses the new droplets and retains subdued contact ripples. Pause/same-time renders freeze effects; fresh-run/time-discontinuity reset clears history. No pursuit, collision, slowdown, control, banner or checkpoint changes.

## Verification and visual evidence

- verify-under-green-contact-splash.mjs: PASS,819ballistic samples across30/60/120Hz scenarios; subframe entry position/time, direction, less-than10cm height, deterministic sampling, bounded count/lifetime, stationary suppression, re-entry and new-run reset.
- verify-under-green-water-contacts.mjs: PASS, physical boundaries, player stride, actual Joe soles, blade contact, dry/raised suppression, bounded pool, same-time freeze, reset and pipe-drip arrival.
- verify-under-green-actor-wetness.mjs: PASS; shared water contact still drives actor dampness correctly.
- verify-under-green-contact-splash.cjs: final18native/responsive and15software views, zero errors. Actual2560x1600 plus1280x720,390x844,844x390; software actual960x600. A rendered recovering scythe physically enters .38m floodwater, then the test follows entry/fan/fall/settling. Also actual simulated player and Joe steps, dry miss suppression, actual pause/resume and Reduced Motion controls, fresh-run reset. Inspection cameras are repositioned after physical contacts for visibility; these are controlled fixtures, not a human full-route playthrough. Final artifacts: output/under-green/visual-upgrade/pass25-complete/{hardware,software}/report.json.
- verify-under-green-district-contacts.cjs: final11views per renderer, zero errors. Actual forward input generates a shallow-water foot contact in each of allsix puddles across gallery,bunker,pump,range andkeeper. Gallery ripple ages through .66sec and expires by1.26sec; each of the three real pipe-drip source coordinates produces its own arrival event. A test-only route exposes the bounded event list for exact source/expiry assertions; it does not alter simulation/rendering. Final artifacts: pass25-districts-final/{hardware,software}/report.json.
- Installed develop-web-game client: terminalexit0,five screenshot/state pairs,no error artifact. Initial Preparing button click exceeded5sec timeout; later Enter bursts reached gameplay. Final shot4 inspected at(0,8.84),actual960x540. Artifacts: pass25-client.

Visually inspected native blade before/after,close fan,portrait framing,Joe foot response,all six shallow-pool locations,all three drip sites andgallery fade/expiry; inspected software close fan andfinal client gameplay. The response is intentionally small and dim, with recognizable droplets at close range. Intermediate pass25-contact,pass25-final andpass25-districts are superseded by final directories above; no production visual change occurred between the two district runs, only stronger test assertions.

## Cost and scope limits

Matched native blade-fan view:212draws before/after;174944 to174968triangles (+24 for12droplet quads);79textures and131programs unchanged. The480additional matrix/color/alpha slots represent38400bytes of attribute storage (about37.5KiB), with corresponding CPU/GPU backing as uploaded. The already-existing droplet batch can become visible in a quiet scene that previously drew no droplets; no universal zero-draw-cost or frame-time claim is made. Full-level profiling remains open.

V24 is accepted using original implementations plus current physical, lifecycle,all-six-pool,three-drip,actor/blade andresponsive evidence. V46 remains partial. Current conservative weapon clearance stops the blade short of solid scenery; emitting masonry sparks at that gap would be false contact. Remaining work needs a physically credible contact pose and actual surface positions for stone/root response, with collision,handIK,clearance andblocked-recovery regression checks. Do not replace this scope with generic miss particles.

Production files: web/under-green-water.js,web/under-green-water-contacts.js,web/under-green-contact-splash.js. Final runtime/tests snapshots and SHA256: pass25-source/final-hashes.json. Ledger20implemented/30in_progress/3pending;allsevenreleasegatesopen. Remaining environment,Joe shadows,dark grading,camera finishing,fullLevel1 comparison andperformance remain in scope. No goal-completion claim.
