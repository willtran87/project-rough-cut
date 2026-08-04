# Footing consequence signal-ownership polish — 2026-08-04

## Intent

Make an accidental slow-footing crossing immediately understandable without removing the physical route information the player still needs to escape it.

## Change

- Active `SLOW FOOTING` entry feedback now defers non-imminent ambient world-context plaques.
- The objective ribbon keeps its projected thread and reflectors but temporarily hides its `FOLLOW LANTERNS` caption.
- The target bearing, persistent map, slow-terrain art, physical obstacles, collision response, footing state banner, movement feedback, and eight-meter noise-hazard safety override remain visible.
- The existing entry-feedback lifetime owns the handoff; no additional timers or gameplay values were introduced.
- Text state reports route-caption visibility, deferral owner, and whether the route geometry remains present.

## Validation

- `node --check web/game.js` — pass.
- `node output/validate-route-pressure.mjs` — 18/18 pass.
- `node output/validate-route-pressure-visual.mjs` — 72/72 pass.
- Responsive active-crossing and recovery captures inspected at 2560×1600, 1280×720, 844×390, and 1280×720 Reduced Camera Motion.
- Every active-crossing state reported `footing_entry_feedback` as the context and route-caption deferral owner while keeping world route geometry visible.
- Every recovery state restored ordinary caption ownership.
- Official web-game client completed the uninstrumented Audit Row route with no browser-error artifact; the existing Sightline Held capture remained authoritative.
- Local test page returned HTTP 200 at `http://127.0.0.1:4173/`.

## Guardrails retained

- No hazard geometry, movement multiplier, noise floor, Joe behavior, pathfinding, objective selection, collision rule, map behavior, or timing changed.
- Imminent noise warnings remain the safety override.
- The objective ribbon and amber footing bypass remain visually and semantically distinct.
