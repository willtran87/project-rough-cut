# Final Cut — refuge interiors

FV31 is locally complete. This does not establish whole-level Level 1 parity; the full 72-item objective remains active.

The bunker has a fitted grit chest. The pump room has a service drawer bench, spare flanged valve, tray and parts tin, hanging tools, supported hoses and localized damp. The pavilion has starter drawers, scorecard storage, a tarnished cup and two torn pennants attached to an existing tie beam. These join the previously finished roof undersides, tied joists, mounted lamps and shuttered service recesses. All 209 new pieces share the static material batches. No new texture or light is allocated.

Furniture uses shared collision, sight and ball bounds. The lower cabinets and their raised objects have separate volumes: empty air above a cabinet stays clear. The valve's lower bound includes its 5mm embed in the tabletop. All three door throats remain clear.

## Evidence

- `output/final-cut/refuge-interiors/geometry.json`: final production geometry audit, 195 furniture pieces inside their individual bounds, six surface damp patches and eight overhead pennant/support pieces. Actual movement, low ball previews, doorway traversal and raised-object sight checks pass.
- `hardware/report.json` and `software/report.json`: 16 views each at 2560x1600, 1920x1080, 1280x720, 844x390 and 390x844 viewports. Actual native 2560x1600 and fallback 960x600 at the largest viewport. Real W/S collision/back-out, exact pause and allocation stability pass, with no browser errors. Pump, storage, damp, pennants, bunker chest and compact views were visually inspected.
- `routes-final/browser.json`: three uninterrupted input-driven direct/garage/drain routes through ball distraction, crossings, pump, bell, physical collapse and road completion. Four heard redirects, zero captures, 77 screenshots and zero browser errors. The run preceded only the final 1cm lower-bound allowance for the spare valve; the final geometry test covers that correction.
- `disposal/report.json`: 315 static batches; all 251 uploaded instance buffers deleted on disposal.
- Installed web-game client `client`: terminal exit 0; fresh image/state inspected, intro completed and ordinary movement to (-1.8880, 4.7372), ready/playing at 960x540. `client-final` is a final-source 12-frame startup pass, terminal exit 0, ready/briefing at 960x540; inspected with no error artifact.
- `source/manifest.json` retains six source/test snapshots and SHA-256 hashes before the subsequent roof-identity work. `comparison.html` pairs before/after interiors.

The matched pump-room view changes from 134 to 141 draws and 1,483,633 to 1,490,191 submitted triangles; four additional unique geometries, no additional textures. Warmed native allocation is 136 geometries/57 textures; software 115/54. These are workload counts, not measured frame-time acceptance. FV71 remains open.

Remaining architecture work includes exterior identity/composition, foundation integration, close material scale and final matched Level 1 views. FV27 and FV33 remain in progress.
