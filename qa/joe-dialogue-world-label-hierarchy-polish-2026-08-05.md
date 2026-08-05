# Joe Dialogue / World-Label Hierarchy Polish — 2026-08-05

## Problem

During a close Audit Bell investigation, Joe's centered dialogue subtitle and the grounded `JOE: DISTRACTED` status panel occupied the same vertical region. Both identified Joe, while the attention panel separately exposed his tactical state. The overlap reduced legibility without adding useful information.

## Resolution

- `joeWorldLabelState()` now distinguishes physical/tactical visibility from label presentation.
- `tacticalVisible` retains the established projection, screen bounds, cover, Listening Focus, distance, and mode conditions.
- `visible` additionally yields while `joeBarkVisible()` owns Joe's identity through the centered subtitle.
- `suppressedBy` reports `joe_dialogue` for diagnostics and accessibility validation.
- `footingHazardPlaqueThreatState()` consumes `tacticalVisible`, preserving all proximity pressure even while the decorative grounded panel yields.

This is a presentation-only hierarchy change. Joe's render, animation, AI, sight/sound detection, pathing, speed, investigation target, distance, cover interaction, and map behavior are unchanged.

## Fallback Behavior

Suppression depends on an actually visible Joe bark. If subtitles are disabled, the bark is deferred by a stronger presentation, collision owns the dialogue lane, or the bark expires, the grounded label remains eligible under its existing visibility rules.

## Verification

- `node --check web/game.js`: passed.
- `git diff --check`: passed.
- Official web-game client completed the obstacle-aware Audit Bell route and held the live investigation state.
- Direct screenshot inspection confirmed:
  - Joe's sprite and investigation glow remain visible.
  - The centered Joe subtitle is unobstructed.
  - The redundant grounded status panel is absent.
  - Objective HUD, Field Log route ribbon, persistent map, course props, and Pause control remain readable.
- Live text state confirmed:
  - Joe mode: `investigate`
  - Joe distance: `18m`
  - Joe bark visible: `true`
  - grounded-label tactical visibility: `true`
  - grounded-label presentation visibility: `false`
  - suppression owner: `joe_dialogue`
  - browser error artifact: absent
- The run completed 836 rendered frames with a 3.09 ms average and 2.6 ms final canvas render sample.

## Regression Contract

When a Joe subtitle is visible, it owns Joe's textual identity. Physical Joe visibility and tactical calculations remain independent. When the subtitle retires or is disabled, the grounded status label may return normally.
