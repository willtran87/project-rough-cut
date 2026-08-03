# Status Request Focus Polish — 2026-08-02

## Scope

- Audited the existing mid-course Status Request through issue, partial response, movement cancellation, restart, acknowledgment, and deliberate escalation.
- Refined presentation ownership only; timing, input, Joe AI, location precision, Delivery scoring, and consequences are unchanged.

## Changes

- The Status Request card now exclusively owns actionable center-screen feedback while it is active.
- Unrelated Joe-state banners, generic bottom messages, duplicated interaction prompts, and locomotion labels yield during the request.
- Movement cancellation is folded into the card as `DRAFT CANCELLED // SR-01` with an explicit binding-aware `RESTART UPDATE` instruction and the remaining deadline.
- The text-state contract reports hidden message/prompt sources plus `status_request` as their deferral reason while visible `message` and `prompt` remain null.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed.
- The required official browser client remained in `first_hole`, produced no error artifact, and sampled 2.49ms average canvas render work.
- An input-only route opened the Drain Valve, reached the live request at approximately 305 meters, and used ordinary keyboard events plus the existing deterministic clock. It did not teleport, freeze Joe, or mutate state.
- Issued: one card showed Joe's request, deadline, interaction, stillness requirement, and both consequences with no duplicate banner or bottom prompt.
- Responding: the card displayed live submission progress and `MOVEMENT CANCELS` with no competing feedback.
- Cancelled: moving reset progress, incremented `responseCancels` to one, and rendered one clean restart instruction. Interact restarted the same request.
- Acknowledged: the response completed at 100%, awarded the Delivery beat, created the coarse status ping, and sent Joe to investigate it.
- Ignored: the deadline reached zero, recorded `outcome: escalated`, created the more precise sector location, and sent Joe into the longer sector search.
- All browser/page error arrays were empty.

## Evidence

- `output/status-request-issued-audit-2026-08-02.png`
- `output/status-request-responding-audit-2026-08-02.png`
- `output/status-request-cancelled-audit-2026-08-02.png`
- `output/status-request-resolved-audit-2026-08-02.png`
- `output/status-request-escalated-audit-2026-08-02.png`

## Process hygiene

- The environment-specific audit navigator was removed after validation.
- All Playwright/headless browser processes were closed; the user-requested server on port 4173 remained active.
