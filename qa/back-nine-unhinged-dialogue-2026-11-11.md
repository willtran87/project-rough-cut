# Expanded Joe dialogue

Added 40 lines (five per pool), bringing the contextual bank to 92. They combine Joe's software Product Owner role, insurance-platform work, golf etiquette and irrational beliefs about turf, roots and clippings. Hiding lines remain uncertain about the player's location; shortcut, damage and on-foot lines remain appropriate to their triggers. Short finale lines fit the shutter-closing window.

Existing saved decks now carry their pool size. A changed-size or legacy deck reshuffles immediately so additions are available, while retaining the last-line exclusion. Normal same-size deck persistence and exhaustion remain unchanged. The upgrade does not touch checkpoints or settings.

Verification: selector tests pass all 92 unique lines, repeated full cycles/reloads, legacy/expanded-deck migration, corrupt storage, stable captions and no simulation mutation. Reaction tests and browser checks pass all four triggers, priority and pause/resume with no page errors. Inspected actual dialogue at 2560x1600 and 390x844; renderer remains at 17 programs / 36 textures. Release verification passes 90 action scenarios with unchanged 67 runtime images / 26 MiB. Standard gameplay client evidence is in `output/back-nine-unhinged/standard-client/`; reactive captures in `output/back-nine-reactions/`.

No changes to trigger frequency, cooldowns, pursuit, art, audio or GPU effects. Human assessment of the darker comic tone remains subjective.
