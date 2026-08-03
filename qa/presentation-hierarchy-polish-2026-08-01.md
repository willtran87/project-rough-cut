# Presentation Hierarchy Polish — 2026-08-01

## Outcome

This pass reduces competing overlays and removes remaining route-language inconsistencies without adding gameplay systems, objectives, course geometry, or art.

## Changes

- Major presentation states now own the center signal lane. Final Filing, Emergency Appeal, Status Request, Risk Premium, Delivery awards, pursuit, Blindside Transfer, Cadence Read, and zone arrival suppress ambient threat-caption cards while active.
- Zone-arrival cards defer while a higher-priority presentation is active. The timer remains authoritative, allowing the zone card to appear afterward when time remains; the bottom zone tip and Delivery label preserve the information during the handoff.
- `render_game_to_text` uses the same suppression helper as the renderer and now reports `zoneBannerVisible`, preventing text-state and visual-state drift.
- The Surroundings panel now matches the nearby world plate: sprinting reports `SLOW DOWN`, crouching or Listening Focus reports `MUFFLED, NOT SILENT`, and ordinary movement reports `WALK WIDE OR CHIP IT`.
- Player-facing route copy consistently uses `drain valve` and `culvert`. The internal sprinkler state remains unchanged because it still drives the released-water simulation and Joe's sprinkler-specific reactions.
- Shortened How to Survive copy so all three assignment rows remain inside the left column at the authored 1280×720 canvas size.

## Validation

- The official Delivery-chain route reached Audit Row at y `94` with `focus: delivery_award`, `deliveryVisible: true`, `zoneBannerVisible: false`, and `maximumThreatCaptionCards: 0`.
- Visual review confirmed one center Delivery card and one bottom zone tip, with no stacked zone card or ambient threat caption.
- The official settings route visually confirmed the revised exit, Review, and look-back copy remains left of the column divider.
- The official Survival Briefing route confirmed `KEY → SHED • DRAIN VALVE → CULVERT` fits inside the first assignment card and matches the in-game objective vocabulary.
- The final opening regression remained in `first_hole`, retained the zone and south-gate cues, reported zero permitted threat cards during zone arrival, and showed no duplicate bottom-center south-gate caption.
- All focused routes produced no browser error artifact. The Audit Row sample averaged `2.03ms` of canvas render work; the cold opening sample remained below the 16.7ms frame budget.
