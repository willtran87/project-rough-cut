# Under the Green pass 93: restrained wet-stone reflections

Scope: V05/V20/V34 and review items 20/26. Full 53 requirements, 48 refinements and all seven whole-level gates remain active. No item or gate is promoted by this local material refinement.

## Change and artistic evidence

Compared three wet-floor finishes in twelve native 2560x1600 preview views: existing finish, removal of the gallery gloss boost, and removal plus a tighter restrained wet-stone response. The selected third version preserves stone and sediment beneath reflected lamps while retaining authored runoff and separate shallow-puddle highlights.

`web/under-green-ground-finish.js` removes the gallery-specific specular minimum. Saturated paving now uses a .65 specular-color multiplier and shininess 110; dry paving remains at .18 and 18. The existing independent runoff/specular masks, pigment textures, saturation tint, flood integration and water layers remain. No new maps, geometry, lights or render passes. The shader no longer evaluates the removed gallery-film mask. This is not a claim that the complete floor or water composition is finished.

## Verified

- Native and software scene suites each pass 53 before/after, district, flood, actor-still, responsive and control views. Native large target is actual 2560x1600; software is actual 960x600 in the large viewport. Additional viewports: 1280x720, 390x844 and 844x390.
- E pump operation, pause, reduced motion, crouch, Q lookback and exact camera-return rendering pass. Player/flood state, light definitions, textures, triangles and draw calls match baseline. Program counts were separately compared and are unchanged.
- Native entry: 531 draws, 434364 submitted triangles, 58 textures, 219 programs. Software entry: 820 draws, 275895 triangles, 58 textures, 222 programs. No fresh frame-time benchmark or speedup claim; the full performance gate remains open.
- Existing GPU saturation probe passes 84 readings per renderer across six dry/wet locations and seven flood times. Static wetness combines with flood wetness, residual water does not double-darken the material, and full drying restores the original values exactly. Diagnostic shininess normalization now uses 160 to avoid clipping the revised 110 maximum.
- Opened and inspected final native floor, receding flood, entry, portrait entry and short-landscape controls, plus software floor and short-landscape controls. Preview before/after floor, flood and side views were inspected before implementation.

Commands: `node tools/verify-under-green-ground-saturation.cjs --baseline=output/under-green/visual-pass93/source --output=output/under-green/visual-pass93/hardware` and the software variant; `node tools/verify-under-green-ground-saturation-probe.cjs --output=output/under-green/visual-pass93/probe-hardware` and the software variant. The scene suite now accepts a baseline path instead of duplicating it for each pass.

Installed gameplay client completes all twelve bursts, ending ready/playing at (0, 13.192), elapsed 2.533 seconds, checkpoint 0, actual 960x540. No browser-error artifact; final shot 11 opened and inspected. Its initial five-second click expires during Preparing, and subsequent menu input starts play successfully. All owned processes are terminal with exit 0, and all three runtime hashes were revalidated after testing. Final runtime hashes are recorded in `output/under-green/visual-pass93/final-source-manifest.json`.

## Remaining work

Continue the complete gallery composition, irregular water contact and district framing, then whole-route motion, art parity and performance acceptance. Existing seven gates remain pending. The lighter/narrower floor response must not be mistaken for completion of the broader high-resolution pixel-art target.
