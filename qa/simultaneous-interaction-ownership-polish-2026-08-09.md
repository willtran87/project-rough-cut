# Simultaneous interaction ownership polish — 2026-08-09

## Finding

East Shift places its drain valve close enough to Audit Bell for both true interaction radii to overlap. The interaction handler and bottom rail correctly prioritized Audit Bell, but the valve's local panel independently said `IN REACH` and received full ready emphasis. One Enter press therefore appeared to belong to two different actions.

## Resolution

- `courseInteractionPromptPresentation()` is now the authoritative bottom-rail selector and mirrors `interactWithCourse()` priority.
- Each prompt carries `targetId`, label, binding family, availability, local status, and exact prompt copy through `interactionPromptOwner`.
- `interactionPromptRelationship()` gives every world marker a deterministic owner match, conflict state, and one-binding/one-target rule.
- The owning in-reach marker retains `IN REACH`, full emphasis, and `bottom_action_rail` ownership.
- An overlapping non-owner remains spatially present but says `OWNER FIRST`, uses `other_interaction_priority`, drops to 48% panel emphasis, removes its ready rail, and identifies the owner's target ID.
- Blocked exits and active non-binding modes retain truthful local status without displaying an action binding.
- Active rejection rails also prevent unrelated markers from claiming the occupied consequence lane.
- Text diagnostics expose the rail owner and each marker's reach/guidance relationship.

## Automated acceptance

- `node --check web/game.js` passed.
- `node tools/verify-release.mjs` passed with 48 referenced runtime images, 60.75 MB total, zero source masters shipped, zero unreferenced images, 80 valid action scenarios, no warnings, and no failures.
- `simultaneous_interaction_prompt_ownership` brings the live audit to 26/26 and verifies owner, non-owner conflict, and blocked-owner semantics.
- `web/test-actions/release-hardening-interaction-owner.json` is a permanent native owner fixture.
- The official client replay ended at Audit Bell with `ENTER — RING AUDIT BELL`, target-matched owner diagnostics, 26/26 readiness, 60 estimated FPS, 4.3 ms render p95, 31 ms observed max, and no errors.

## Native overlap and outcome evidence

A fresh Standard run was started to advance persistent rotation, then the page was reloaded and East Shift was played normally without injecting state.

| Target | Distance / radius | Local presentation | Rail relationship |
| --- | --- | --- | --- |
| Audit Bell | 10.21m / 12m | `IN REACH` | owns `ENTER — RING AUDIT BELL` |
| Drain Valve | 8.06m / 18m | `AUDIT BELL FIRST` | yields through `bottom_other_action_rail` at 48% panel emphasis |

Pressing Enter completed only `audit-bell`, left `sprinklerUsed: false`, and changed the next prompt to `ENTER — OPEN DRAIN VALVE`. This proves the visible owner, actual outcome, and next-action transfer remain aligned.

## Visual acceptance

The genuine overlap was inspected at 2560×1600, 1280×720, and 800×600. Audit Bell retained dominant amber hierarchy, the valve stayed identifiable without competing for the action, all local copy remained inside its panel, the bottom rail cleared both cards, and document geometry exactly matched every viewport. No console or page errors occurred. The East Shift pass retained 60 estimated FPS with 5 ms render p95 and 12.6 ms observed max.

Temporary screenshots and the custom browser script were removed after inspection. The isolated port-4189 test server was stopped; the unrelated pre-existing process on port 4173 was not modified.
