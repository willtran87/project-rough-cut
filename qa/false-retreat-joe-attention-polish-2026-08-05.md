# False Retreat Joe Attention Polish QA

Date: 2026-08-05

## Goal

Replace the generic Joe Attention investigation label during False Retreat's snapback with a truthful, compact phase countdown.

## Change

- Active snapback displays `SNAPBACK COMMITTED // <time>s` in the Joe Attention status lane.
- The countdown uses the authoritative predator-tactic timer.
- The status uses danger-orange `#f07441` and the panel's established bounded 11-to-8-pixel fitting.
- Pursuit lock retains higher priority; unrelated investigation, search, field-signal, cadence, wind, and navigation states are unchanged.
- The active predator-tactic text state exposes the same label, color, remaining seconds, and presentation contract.
- Joe's mode, AI, tactic timing, target, movement, audio, collision, and capture are unchanged.

## Automated route

Ran the official web-game Playwright client against `http://127.0.0.1:4173/` with `web/test-actions/false-retreat-snapback-handoff.json` and a 100 ms inter-step pause.

The deterministic route captured the Joe Attention panel inside False Retreat's established snapback window.

## Observed state

- Mode: `first_hole`
- Rendered frames: `1,107`
- Predator tactic: `false_retreat`
- Predator phase: `snapback`
- Tactic remaining: `0.98s`
- Attention label: `SNAPBACK COMMITTED // 1.0s`
- Attention remaining: `0.98s`
- Attention color: `#f07441`
- Attention presentation: `joe_attention_phase_countdown`
- Visible bearing: `MOWER SNAPS BACK INTO YOUR ROUTE — RIGHT`
- Bottom action: `JOE RECOMMITS — A / D SIDEWAYS NOW; cross the mower's returning line.`
- Average render time: `2.57ms`
- Final render time: `1.9ms`
- Browser-error artifact: none

## Visual inspection

The new status fits at the panel's full 11-pixel target size and remains clearly separated from the projection, composure, and Delivery lines. The top recommit banner, center danger bearing, bottom action rail, hedge opening, reticle, Field Log route, and course map remain unobstructed.

## Static validation

- `node --check web/game.js`
- `git diff --check -- web/game.js web/README.md progress.md qa/false-retreat-joe-attention-polish-2026-08-05.md`

Both completed without code errors; Git reported only the repository's existing line-ending conversion warnings.
