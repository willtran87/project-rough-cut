# Campaign progression and focused outcomes

New saves can enter only Night Order. Completing it records the actual shed/drain exit. Continuing into that route records entry and makes it selectable thereafter; winning alone does not unlock both routes. The finale follows the same completion-plus-entry rule after either Chapter 2 route. Direct chapter URLs use the same guard, including QA URLs. Browser-local progression survives retries and replay, with session-storage fallback and conservative migration from existing records.

Win screens have no level replay action. Night Order and Chapter 2 offer their narrative continuation and Main menu. The finale offers return to the menu, with outcome records/credits retained. Loss retries remain available. The main menu selects the most recently entered chapter, offers Continue story after a win, and retains explicit replay of earned chapters. Settings preserves the selected chapter. In-chapter links to unrelated chapters were removed.

Validation:

- `node tools/verify-campaign-progress.cjs`: route qualification, entry, finale, persistence, earned replay, legacy saves, malformed storage and storage fallback pass.
- `node tools/verify-campaign-flow.cjs`: fresh locks, direct-link rejection, actual shed/drain transitions, finale entry, no-replay win screens and working loss retries in all later chapters pass. Fixture completion is used to inspect outcomes; this is not a new full campaign playthrough. No page errors.
- `node tools/verify-chapter-picker.cjs`: earned chapter previews, keyboard/controller selection, Settings return, touch navigation, launch/replay paths and idle rendering pass. Destination loading is stubbed in its navigation subcheck; campaign-flow separately loads the real chapters.
- Visual captures reviewed at 2560×1600, 1280×720 and 390×844; chapter-picker also checks action visibility at 844×390. Art is awaited before capture.

- Installed develop-web-game client: unskippable opening, timed menu arrival and attempted locked chapter navigation pass; state remains menu with Night Order selected, no error artifacts. Screenshot inspected.

Evidence: `output/campaign-flow/` and `output/menu-visual-refresh/layout/`. No deployment or physical-controller qualification was performed. Progress remains local to a browser profile and origin. Existing QA scripts that assumed unrestricted direct chapter entry need qualified progression fixtures; `?test` does not bypass progression.
