# Objective interaction prompt polish — 2026-08-02

## Outcome

An actionable in-reach prompt now owns the bottom signal rail instead of being hidden behind a lingering zone, terrain, or route message. The dedicated mint `ACTION` treatment keeps the input binding and exact interaction visible over complex ground art without obscuring the authored objective, attention panel, world interaction footprint, or persistent map.

The priority applies to ordinary field interactions while leaving Survival Briefing, Emergency Appeal, Status Request, golf-ball flight/roll/aim, and Final Filing presentations unchanged. The displaced message is not discarded: `render_game_to_text` exposes it as `messageSource`, reports no visible `message`, and identifies `interaction_prompt` as the deferral owner.

## Validation

- `node --check web/game.js`
- `git diff --check`
- Required official browser-client route remained in live gameplay with no error artifact and sampled 1.99 ms average canvas render work.
- Dedicated shed approach reached the authored filing footprint and visibly rendered `ACTION // ENTER — FILE SHED RELEASE` over the formerly competing Release Corridor cue.
- Dedicated drain approach visibly rendered `ACTION // ENTER — FILE DRAIN RELEASE` while preserving the world culvert plaque, route ring, map, and Delivery card.
- Both text states reported the correct visible prompt, `message: null`, retained source copy, and `messageDeferredBy: interaction_prompt`.
- Enter completed both Final Filing chains and produced the authored shed and culvert victory tableaux.
- Assertions: `shedPrompt: true`, `drainPrompt: true`, `shedEscape: true`, `drainEscape: true`, `noErrors: true`.

## Evidence

- `output/objective-access-validation/shed-01-approach.png`
- `output/objective-access-validation/shed-02-in-reach.png`
- `output/objective-access-validation/shed-03-filed.png`
- `output/objective-access-validation/drain-01-approach.png`
- `output/objective-access-validation/drain-02-in-reach.png`
- `output/objective-access-validation/drain-03-filed.png`
- `output/objective-access-validation/prompt-contract-log-2026-08-02.txt`
- `output/objective-prompt-polish-official-2026-08-02/shot-0.png`
- `output/objective-prompt-polish-official-2026-08-02/state-0.json`

Every Playwright browser context closed after validation. The existing local server on port 4173 was intentionally preserved for player testing.
