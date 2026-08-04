# Collision-dialogue resume polish — 2026-08-04

## Goal

Prevent optional Joe dialogue from flashing briefly after a collision correction ends while retaining personality when a line still has enough time to be read.

## Implementation

- Collision contact continues to own the local correction lane and hides optional Joe subtitles.
- The bark timer continues counting down during that deferral; collision never grants extra dialogue time.
- When contact ends, a line with at least 0.72 seconds remaining becomes visible through a 160-millisecond opacity handoff.
- A line below that threshold is retired without replay, replacement, or timer extension.
- Reduced Camera Motion skips the opacity handoff and restores relevant dialogue immediately.
- A fresh Joe bark clears any pending collision handoff so state cannot leak between lines.
- Text-state diagnostics report the deferral flag, resume activity, progress, relevance threshold, and `resume_if_relevant_without_extending_timer` policy.

## Preserved behavior

Collision duration, blocker selection, grounded contact card, viable escape calculation, wake and pursuit warnings, bark selection, Joe behavior, movement, stealth and detection, scoring, audio, map, subtitle settings, and course art are unchanged.

## Validation

- `node --check web/game.js`
- `node --check output/validate-route-pressure-visual.mjs`
- `node output/validate-route-pressure.mjs` — 18/18 checks passed with no browser errors.
- `node output/validate-route-pressure-visual.mjs` — 336/336 checks passed across:
  - 2560x1600 high resolution
  - 1280x720 standard
  - 844x390 compact
  - 1280x720 Reduced Camera Motion
- The visual matrix explicitly stages and captures the first relevant frame after collision, the fade midpoint, the settled subtitle, and stale-line retirement.
- Direct inspection confirmed that the high-resolution and compact subtitle remains subordinate to the course, map, objectives, and cover cues throughout the handoff. Reduced Camera Motion returns the card without animation.
- Official uninstrumented browser smoke:
  - screenshot/state: `output/collision-bark-resume-official-2026-08-04`
  - average canvas render: 5.70ms
  - final canvas render: 2.10ms
  - rendered frames: 113
  - browser-error artifact: none

## Human follow-up

Play repeated glancing impacts during a natural chase. If the resumed copy feels too brief or too eager, tune only the 0.72-second relevance threshold; keep the countdown uninterrupted and collision correction authoritative.
