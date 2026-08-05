# False Retreat Live-Input Rail Polish QA

Date: 2026-08-05

## Goal

Keep False Retreat's snapback action aligned with the player's current input method throughout its short response window, including unusually long keyboard bindings.

## Change

- The snapback rail now resolves its copy on every presentation frame rather than only when the phase begins.
- Keyboard uses the current remapped left/right labels.
- Gamepad uses `LEFT STICK`; touch uses `LEFT PAD`.
- Remapped key pairs longer than 18 characters retain the control labels and `SIDEWAYS NOW`, while only the secondary tactical explanation is omitted.
- The active predator-tactic text state exposes the rail text, input method, live-copy flag, and long-binding fallback policy.
- Tactic duration, target, AI, movement, input handling, audio, collision, and capture remain unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/false-retreat-snapback-handoff.json` and a 100 ms inter-step pause.

The deterministic route captured the default keyboard presentation during the active snapback and compared the global input state with the active tactic's live action-rail contract.

## Observed state

- Mode: `first_hole`
- Rendered frames: `1,122`
- Active input method: `keyboard`
- Predator tactic: `false_retreat`
- Predator phase: `snapback`
- Snapback remaining: `0.98s`
- Exported move-left binding: `A`
- Exported move-right binding: `D`
- Visible rail: `JOE RECOMMITS — A / D SIDEWAYS NOW; cross the mower's returning line.`
- Action-rail input method: `keyboard`
- Live input copy: `true`
- Long-binding fallback: `retain_controls_and_immediate_action_drop_secondary_explanation`
- Visible bearing: `MOWER SNAPS BACK INTO YOUR ROUTE — RIGHT`
- Average render time: `2.27ms`
- Final render time: `1.8ms`
- Browser-error artifact: none

## Visual inspection

The default full instruction remains centered and readable inside the protected rail. It stays separate from the pause control and authored danger bearing, while the reversal banner, hedge opening, reticle, Field Log route, Joe Attention panel, and course map remain unobstructed.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md qa/false-retreat-live-input-rail-polish-2026-08-05.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
