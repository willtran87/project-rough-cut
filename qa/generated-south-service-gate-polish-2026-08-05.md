# Generated south service gate polish — 2026-08-05

## Outcome

The opening incident's locked south service gate is now a dedicated generated world object rather than only a gate painted into the distant rear panorama.

- A connected wrought-iron double gate, rain-dark stone pillars, caged amber lamps, taut chain, oversized padlock, bent card reader, ivy, dead fescue, and muddy threshold come from `rough-cut-south-service-gate-v1.png`.
- The authored sprite is anchored at `x = 0, y = 0`, exactly matching the existing south course collision boundary.
- It fades into the layered entity pass only after the rear camera crosses 50% commitment, so ordinary forward play remains unchanged.
- Iron openings retain the live rear environment; planted turf meets the ground plane and near foreground vegetation honestly occludes the base.
- Restrained runtime lamp glow keeps the generated practical lights alive. Reduced Camera Motion holds the light level steady.

## Art pipeline

- Built-in OpenAI image generation produced one chroma-key source at `1774 × 887`.
- The project preserves the chroma source, cleaned alpha runtime image, full prompt, cell bounds, and transparency details in `web/assets/rough-cut-south-service-gate-v1.md`.
- Chroma removal detected `#fb06fa`; 711,948 pixels became fully transparent and 73,870 received partial alpha.
- Direct alpha inspection confirmed transparent upper corners, connected pillars and gate leaves, preserved narrow ironwork, a readable chain and padlock, and no visible magenta field.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed for changed source and documentation.
- The official Playwright client reached live Hole 1 with the gate asset ready, the gate hidden at rear-view amount 0, and no browser-error artifact.
- Supplemental exact-key validation committed the existing remappable `R` rear view. The inspected canvas showed the complete authored gate behind the player with environmental visibility through its bars.
- Rear text state reported amount 1, `rearView = true`, gate visible and ready, world `y = 0`, collision boundary `y = 0`, and explicit coordinate parity.
- `customObjectArtAudit` now reports `complete`, 14/14 generated object families, one south-gate variant, and no missing custom-art IDs or families.
- The rear-view capture completed 136 rendered frames with a 3.60 ms final canvas sample. The normal forward smoke completed 132 frames with a 1.80 ms final sample.

## Preservation contract

Keep the gate tied to the existing rear-camera amount and exact south collision plane. Its sprite is the physical object; rear reveal, lamp light, collision feedback, fog, foreground occlusion, and input-aware copy remain runtime-owned state layers.
