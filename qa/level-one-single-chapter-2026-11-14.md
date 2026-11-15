# Level 1: one Night Order chapter

User request: remove the three versions of Level 1 and use a menu consistent with the other chapters.

- The original layout (`standard_review`, now presented as Night Order) is the only playable Level 1. New starts, retry, replay, round rotation, and explicit legacy overrides all resolve to it. Overtime cannot be enabled.
- Menu uses Night Order / Chapter 01, Start Chapter, Settings, existing story/flavor actions, named chapter links, and a collapsed Course record. Variant cards, mode toggles, and unlock instructions are gone.
- Victory offers Replay Chapter. Current completion requires four performance stamps. Legacy layout definitions remain for save validation; existing completed layouts, records, and saved preferences are retained without selecting retired modes.
- Removed the obsolete route-guidance settings category entry, which referred to a setting already removed in the exploration change.

Validation: `node tools/verify-single-night-order.cjs` passes fresh and legacy save scenarios, menu actions, story skip, settings categories, chapter link responses, retry/replay/override behavior, and save-history checks. No browser errors. Screenshots inspected at 2560×1600, 1280×720, and 390×844, including scrolling to records.

Installed gameplay client via `tools/verify-presented-client.mjs`: two high-resolution native-renderer input bursts; artifacts in `output/level-one-single-chapter/client-final`. Menu screenshots and behavior report are in `output/level-one-single-chapter`.

This completes the single-chapter menu request; it does not close the broader Level 1 visual-upgrade checklist.
