# World-marker label-fit polish — 2026-08-04

## Outcome

Long directional interaction labels now remain inside their map-safe cards. Only the label type scales when required; card geometry, arrows, glyphs, world anchors, and gameplay remain stable.

## Confirmed issue

Chromium measurement with the game's bold 12px Courier type found:

- `MAINTENANCE SHED // 150m ▶`: 201.63px against a 180px safe text lane.
- `DRAIN EXIT — OPEN // 150m ▶`: 208.83px against the same lane.
- The existing 196px card therefore protected its border while some long text could consume the intended edge/map gutter.

## Implementation contract

- Build the final label from edge direction, authored name, and optional rounded-up distance.
- Keep the 196px interaction card and 16px total internal horizontal padding.
- Retain 12px bold type whenever it fits.
- Fit oversized labels to the 180px lane with a 10px minimum.
- Export the same text, font size, maximum width, measured width, and containment result used by rendering.
- Do not alter world projection, marker/card placement, interaction radii, objective state, movement, collision, map geometry, or Joe's behavior.

## Validation

- `node --check web/game.js`
- `node output/validate-route-pressure.mjs` — 18/18 checks passed.
- `node output/validate-route-pressure-visual.mjs` — 140/140 checks passed at:
  - 2560×1600
  - 1280×720
  - 844×390
  - 1280×720 with Reduced Camera Motion
- Inspected all four dedicated `long-right-edge-marker` captures. `MAINTENANCE SHED // 81m ▶` resolves to 10px and 164.64px within the protected 180px lane, remains fully clear of the map, and preserves the right arrow.
- The official uninstrumented smoke kept the shorter `◀ DRAIN VALVE // 81m` label at 12px and 161.56px. No `errors-0.json` artifact was produced; canvas work averaged 7.20ms and ended at 2.30ms across 95 rendered frames.

## Evidence

- Responsive captures: `output/route-pressure-visual-validation/*-long-right-edge-marker.png`
- Responsive state ledger: `output/route-pressure-visual-validation/latest-state.json`
- Official smoke: `output/world-marker-label-fit-official-2026-08-04/`

## Suggested human check

Hold Listening Focus near both final exits and compare the long shed label with ordinary target labels. Tune only the 10px minimum if it is uncomfortable to read; preserve fixed card geometry, the 180px safe lane, and full-size ordinary labels.
