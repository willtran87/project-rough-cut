# Final Cut — refuge roof identity

Progress on FV27/FV28. The pavilion now has a 2.65m roof rise (previously 1.35m), a framed ceremonial gable, diagonal timber braces, paired recessed louvred shutters, bargeboards and small ridge finials. The pump shelter has a squat louvred ridge monitor with an embedded curb, folded weather cap, posts and fasteners. The bunker retains its low protective profile. These are physical geometry using the existing pixel materials and static batches; no new texture, light, or unique geometry is introduced by the detail builder.

Close review caught the wider king post covering the XVIII plaque. Its plate now sits on a short metal mount in front of the timber; all 441 actual sign-letter clearance rays pass. Roof shadows, materials and back faces remain part of the physical scene. A taller roof alone does not complete architectural or whole-level Level 1 acceptance.

Airborne ball collision now clips against the pitched roof volume rather than only the former 2.75–3.05m flat ceiling. The roof profile is shared with architecture settings. Both slopes reject intersecting shots; air above the eaves stays open. The pump vent has its own upper volume. Existing ground movement, routes, E interaction, saves and encounter timing are unchanged.

## Verification

- `tools/verify-final-cut-roofs.mjs`: actual production segment clipper checks all three pitched roofs from both sides, clear air above ridge/eaves, and blocked attic/eave space. All 136 added detail pieces have finite transformed vertices, stay above 3m and within their host roof footprint. A real playable ball preview that formerly passed through the bunker roof edge is now rejected at height 3.1367m.
- `tools/verify-final-cut-balls.mjs`: nine groups pass, including 30/60/120Hz ball flight, preview/obstacles, recovery, save/reload, baskets and two complete simulation routes.
- `hardware/report.json`, `software/report.json`, `before/report.json`: 18 views each, fixed before/after cameras, exact pause, real strafe and warmed resource stability. Viewports 2560x1600, 1920x1080, 1280x720, 844x390 and 390x844; actual largest hardware framebuffer 2560x1600, fallback 960x600. No browser errors.
- Visually inspected final overlook, pavilion approach/gable/side, corrected plaque, pump diagonal/side and compact portrait, plus software gable. The initial pump close camera was wall/reed-occluded and was replaced by a clear diagonal view; those older unused files are not acceptance evidence.
- `mounts/report.json`: 441 sign-letter rays, zero structural obstructions.
- `sightlines/report.json`: 48 concealment comparisons pass with no failures or browser errors.
- `routes/browser.json`: three uninterrupted ordinary-input direct/garage/drain routes through crossings, ball distractions, pump, bell, physical collapse and road completion. Four heard redirects, zero captures, 77 screenshots and no browser errors.
- Seven final source/test snapshots and SHA-256 hashes are retained in `source/manifest.json`. Paired visual gallery: `output/final-cut/roof-identity/comparison.html`.

Matched native overview: 419 draws unchanged, triangles 3,678,287 → 3,685,963. Pavilion approach: 96 draws unchanged, triangles 1,378,646 → 1,381,690. Pump diagonal: 233 draws unchanged, triangles 1,565,687 → 1,568,851. Warmed resource totals remain 144 geometries/61 textures on hardware and 144/58 on software for this sweep. Submitted triangles include shadow passes. No isolated frame-time or sustained-performance acceptance is claimed.

FV27/FV28 remain in progress: foundation planting, broader facade composition, close material scale/variation, selective weathering and a properly matched Level 1 comparison are still outstanding. All other unfinished checklist requirements remain active.

Installed web-game client: job57768 terminal exit0. Fresh client/shot-0.png and state-0.json inspected: ready=true, final_cut_playing, intro lastOutcome=completed, actual movement to(-1.8880467,4.7372006), 960x540 software framebuffer. No error artifact. All owned verification jobs are terminal.
