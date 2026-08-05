# Night Order Next-Action Handoff Polish — 2026-08-05

## Goal

Make each loud Night Order station resolve into an immediately actionable next step without adding another competing HUD panel or changing gameplay.

## Implementation

- `completeNightOrderAction()` records a 3.2-second handoff after authoritative completion state has advanced.
- The handoff consumes `objectiveActionHudSummary()`, so keyboard remaps, controller/touch copy, field-check progression, prepared exits, dual exits, Final Filing, and release authorization share the same action source as the dossier and pause UI.
- The existing bottom consequence rail expands upward by 16 pixels during the handoff. Its first line preserves the station consequence and Joe response; its second line presents `NEXT // <BOUND ACTION>` in the next action's authored accent.
- The handoff records both the state banner and message that created it. If either owner changes, the handoff is invalidated on the next update and cannot appear beneath unrelated copy.
- The ordinary message remains available for its original 3.6 seconds; the next-action line retires at 3.2 seconds, returning the rail to its established single-line geometry before the consequence expires.

## Gameplay Preserved

- Station order, locations, interaction radii, and mandatory completion rule.
- Joe alert, investigation target, and sound duration.
- Objective navigation, route ribbon, map targets, and interaction prompts.
- Scoring, Delivery behavior, generated station art, activation effects, and acoustic signatures.
- Existing higher-priority bottom-rail arbitration.

## Verification

- `node --check web/game.js`: passed.
- `git diff --check`: passed.
- Official web-game client followed the real obstacle-aware path and filed Audit Bell.
- Direct screenshot inspection confirmed the two lines are fully contained, centered, visually separated, and clear of the footer and Pause control.
- Live state confirmed:
  - primary objective: `FIELD CHECKS 1/3 // FIELD LOG`
  - next action: `ENTER STAMP FIELD LOG`
  - handoff visible: `true`
  - next phase: `field_check`
  - next target: `field-log`
  - Joe mode: `investigate`
  - browser error artifact: absent
- The run completed 618 rendered frames with a 3.11 ms average and 3.0 ms final canvas render sample.
- A separate settle run held the completed interaction for 220 additional frames. The handoff, source message, and state banner all retired to `null`; Field Log remained the primary objective, Joe continued investigating, and the browser-error artifact remained absent. That run completed 829 rendered frames at a 3.2 ms average and 3.5 ms final canvas sample.

## Regression Scenario

`web/test-actions/night-order-handoff-settle.json` completes Audit Bell, holds the view through the handoff lifetime, and verifies that the temporary second line retires rather than becoming stale. This scenario passed. Future 3/3 validation should cover both prepared and unprepared exits and preserve this single-owner contract.
