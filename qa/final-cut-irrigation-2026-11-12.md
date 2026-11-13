# Final Cut — flooding and physical collapse effects

FC43/FC44/FC47 implementation progress. This does not complete the chapter or certify its dramatic impact.

## Runtime changes

`web/final-cut-irrigation.js` replaces the flat rectangular flood and scattered box debris with shallow compressed sod, an irregular advancing wet front and a separate water surface rising from 2.2 to 8.7 cm. Existing solid ground remains underneath; collision, movement, save and trap rules are unchanged. The elevated service path remains dry and visible.

The pump has a physical pressure dial and ready lamp, placed clear of the lever's full sweep. Their state follows the existing six-second preparation. Prepared water persists without a new timer. The manifold cap opens during the existing rupture; three pressure-dependent jets reach actual grandstand seats. Shared dimensions in `web/final-cut-irrigation-layout.js` also construct the rendered stand, so trajectories terminate on its real seat, step or ground height. Three wet marks correspond to the three full-pressure impacts.

All four authoritative wheel positions produce local ruts and sixteen lifted turf clods with grass tops and soil undersides. Flow is capped at 72 pipe segments and 90 hardware / 48 software droplets. Shared scratch vectors avoid per-segment allocation. Pressure falls to a residual bypass flow after shutdown. All motion derives from saved elapsed/ending time, and owned resources are disposed with the scene.

Reduced motion retains terrain, water level, pressure dial, open manifold, settled clods, seat wetness and static low sprinkler arcs. It suppresses high rupture arcs, airborne droplets, bounce and ripple movement. Pause freezes the effect; reload reconstructs the same earned aftermath.

## Verification

- `tools/verify-final-cut-irrigation.cjs`: hardware and software each pass five groups, 22 screenshots and zero browser errors. Explicit scene fixtures exercise actual pump Use, preparation without victory, both live physical trap approaches, actual wheel positions, reduced motion through settings, pixel-identical pause, reload and stable geometry/textures over thirty animated updates. These fixtures are not complete player routes.
- `tools/verify-final-cut-irrigation-layout.mjs`: 24,543 trajectory samples across pressure 0.2–1 clear the physical roof, minimum sampled clearance 0.186 m. All three full-pressure endpoints meet real seat tops; falling-pressure endpoints meet steps, seats or ground. This is sampled geometric evidence, not a general continuous collision solver.
- `tools/verify-final-cut-ending.mjs`: four groups pass, including physical trap/save/pause/gate/exit at 30/60/120 Hz. `tools/verify-final-cut.mjs`: thirteen groups and seven full simulation routes pass with previous timings.
- `tools/verify-final-cut-ending-browser.cjs`: final run passes twelve captures and zero errors after the completed effect changes.
- `tools/verify-final-cut-arrival-browser.cjs --replay=0 --out=output/final-cut/irrigation/route`: a completed-result fixture unlocks the selector, then actual Gamepad API inputs complete the original-plan bank route without live gameplay placement. 134.861 simulated seconds, zero captures/throws/browser errors, nine screenshots. This is one chapter route, not a full campaign or human playtest.
- Installed web-game client: two input iterations, exit 0. Latest `client/shot-1.png` and `state-1.json` inspected: playing at 6.52 seconds, original plan, waiting rig, dry swale, 91 draws / 68,452 submitted triangles, 38 geometries / 17 textures in that software view. No error artifacts.

Inspected final captures at 2560×1600, 1280×720, 844×390 and 390×844. Pump needle and ready lamp remain visible after lever movement; pooled water has an irregular bank; the service path stays readable; high jets pass below the roof and land at different stand heights. Reduced-motion portrait retains the submerged rig and escape path without suspended high spray. The narrow field of view crops part of the rig, which remains inspectable with the free camera. The uninterrupted route's pavilion/lure view shows reachable bell, solid shelter and prepared water.

During iteration, the first dial placement overlapped the lever and the first jet curves crossed the roof. Both were corrected and rechecked. A missing shader-helper newline produced a compile failure in an intermediate run; final hardware/software runs are error-free. A layout assertion initially compared floating-point ground heights exactly and was corrected to a 1e-9 tolerance. No failed intermediate run is counted as final evidence.

Artifacts: `output/final-cut/irrigation/{hardware,software,route,client}/`, `layout.json`, `profile.json`; ending regression captures remain in `output/final-cut/ending/`.

## Performance limits

`tools/profile-final-cut-irrigation.cjs` runs omitted/enabled/enabled/omitted sequentially in one SwiftShader browser. Omission removes the entire new irrigation module; it does not reconstruct the former water effect. Each phase uses four warmups and twelve frozen draws with full-buffer RGBA readback at 960×540 in a 1280×720 viewport.

| Phase | Module omitted median range | Module enabled median range |
| --- | ---: | ---: |
| Arrival | 140.5–152.2 ms | 141.8–142.4 ms |
| Pump | 103.2–116.0 ms | 102.1–103.9 ms |
| Prepared water | 128.2–134.9 ms | 132.8–133.6 ms |
| Collapse | 131.9–137.9 ms | 135.3–136.9 ms |

Readback overhead and baseline drift prevent a reliable cost-delta or old-versus-new regression claim. These are not sustained gameplay frame rates. Overall software scene cost remains high and performance qualification stays open. Resource counts may differ across reloads and newly visible geometry; the stability assertion applies within one warmed context, not across separate contexts. `graphics.frameMs` is CPU submission only.

## Remaining work

Human recognition of the trap's ready state, route readability during surprise, fear/fun, collapse pacing and listening acceptance remain open. The rig still needs material/mechanical/acting polish, the wider grounds need finished composition and props, and complete supported-device/campaign/lifecycle and sustained performance qualification remain. The 72-item goal remains active.
