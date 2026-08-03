# Listening Search Read focus polish — 2026-08-02

## Outcome

Listening Search Read now owns a compact, tactical presentation lane while Joe investigates an off-screen trace. The player can read the search locus, Joe bearing, distance, movement trend, attention state, course map, and nearby cover without competing dossier or field copy.

## Presentation hierarchy

- Keeps the authored `LAST TRACE` / `TRAIL CHECK` world read and Joe direction, distance, and closing/receding/crossing trend.
- Keeps the Joe Attention panel, course map, terrain, cover, and physical obstacle grounding visible.
- Compacts the main objective HUD while the search read is active.
- Defers the rear-route card, generic Joe world label, unrelated authored messages and interaction prompts, Joe state/banner dialogue, threat captions, duplicate concealment copy, and non-urgent ambient plaques.
- Preserves the eight-meter noise-hazard safety override, including its grounded prop tether and warning label.
- Restores the ordinary field hierarchy immediately when Listen is released.
- Lets pursuit override Search Read and present the established contact-break survival hierarchy.

## Accessibility contract

`render_game_to_text` now reports `listening_search` as the active presentation focus, `listening_search` as the compact-HUD reason, and explicit deferral ownership for rear navigation, authored messages, and interaction prompts. Hidden source copy remains available to assistive clients instead of being discarded.

## Exact replay

`output/validate-listening-search-read.mjs` passed all fourteen assertions:

1. Closing search mechanics remain intact.
2. Search Read owns focus.
3. Search Read uses the compact HUD.
4. Competing signal lanes are isolated.
5. Non-urgent ambient cues defer.
6. The imminent hazard warning remains visible.
7. Rear navigation defers.
8. Receding reads remain intact.
9. Crossing reads remain intact.
10. Paused Trail Check remains intact.
11. Releasing Listen restores the field UI.
12. Pursuit overrides Search Read.
13. Reduced Camera Motion retains identical hierarchy.
14. Browser and page logs remain error-free.

Visual evidence:

- `output/listening-search-read/01-standard-closing.png`
- `output/listening-search-read/01b-standard-imminent.png`
- `output/listening-search-read/02-standard-trail.png`
- `output/listening-search-read/02b-standard-released.png`
- `output/listening-search-read/02c-standard-pursuit.png`
- `output/listening-search-read/03-reduced-closing.png`

Machine-readable result: `output/listening-search-focus-validation-result.json`.

## Required official-client route

The official web-game client completed its opening route with no browser-error artifact. Across 241 rendered frames it sampled 1.83 ms average and 1.60 ms final-frame canvas work. The normal opening hierarchy and generated world obstacle read remained intact.

All focused browser contexts were closed. The user-requested local server remains healthy at `http://127.0.0.1:4173/`.
