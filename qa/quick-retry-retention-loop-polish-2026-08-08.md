# Quick-retry retention-loop polish

Date: 2026-08-08

## Goal

Reduce the time and visual friction between a learned failure and the player's next meaningful attempt without weakening Joe, skipping the captured lesson, or changing first-run onboarding.

## Finding

`Retry File` already restarted gameplay on the confirm action, skipped Survival Briefing, skipped the optional practice drill, preserved the capture-specific Incident Counterplan, and reset the course correctly. However, it also set a 4.2-second rematch control hint, expanding the complete onboarding HUD over the reopened course while a dedicated counterplan rail was already teaching the relevant next move.

The held-sightline lesson also referred to waiting for a `contact-break meter` even though that meter was reset when the new run began.

## Resolution

- Quick retry now starts with `controlHintTimer: 0` and no onboarding control-hint owner.
- The compact tactical HUD is authoritative from the first reopened frame.
- The top course signal, Joe Attention panel, course map, route thread, interactable bearing, and capture-specific bottom counterplan remain visible.
- The held-sightline lesson now reads: `Break sight behind solid cover, then stay quiet until Joe loses the trail.`
- `render_game_to_text` exports `controlRestoredImmediately: true` and `hudMode: compact_counterplan` for quick retries.
- `tools/verify-release.mjs` rejects removal of this contract.
- Added `web/test-actions/release-hardening-deep-retry.json`, which performs the staged load, Audit Bell interaction, Water Hazard capture, Retry File activation, and immediate movement.

## Behavioral evidence

- Result action: Retry File.
- Reopened mode: `first_hole` on the same Night Order.
- Survival Briefing: skipped.
- Optional practice drill: `skipped_rematch`.
- Captures recorded: 1.
- Rounds started: 2.
- Counterplan source: `capture_review`.
- Counterplan target: `counter_held_sightline / BREAK SIGHT`.
- HUD: compact; `hudExpanded: false`; `controlHintSeconds: 0`.
- Control: player moved 12 meters during the first 30-frame post-retry input burst.
- Current readiness: 18/18 after adding adaptive repeated-failure coaching.
- Canvas p95: 3.3 ms.
- Browser errors: none.

## Responsive evidence

- `2560x1600`: canvas `2508x1403.75`, zero overflow.
- `1280x720`: canvas `1209.375x673.265625`, zero overflow.
- `390x844`: canvas `375.21875x208.671875`, zero overflow.
- Direct inspection confirmed the compact status card, route, course map, Joe Attention, objective bearing, and counterplan rail remain anchored and readable.

## Preserved behavior

- First-run Survival Briefing and onboarding HUD.
- Manual controls recall.
- Listening Focus expansion.
- Result-action selection and Next Order/Clubhouse descriptions.
- Joe speed, detection, pressure, collision, and capture rules.
- Course objectives, scoring, records, and Course Echo behavior.
