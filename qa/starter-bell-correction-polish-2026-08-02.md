# Starter-bell correction polish — 2026-08-02

## Scope

Make a missed optional starter-bell shot teach the player how to correct the next attempt. This pass does not alter golf-ball physics, the amber target, Joe's investigation, scoring, resources, or route progression.

## Finding

The existing miss response confirmed that Joe heard the landing but offered no directional or power correction. Once that message expired at the tee, the ordinary practice prompt was still gated by distance to the bell, so the player could also lose the retry instruction from the location where the first shot was taken.

## Implementation

- Compared the authoritative first-impact point with the center and radius of the amber target.
- Derived a correction from meaningful axis error:
  - `AIM LEFT` or `AIM RIGHT`;
  - `ADD POWER` or `REDUCE POWER`;
  - a combined aim-and-power correction when both errors matter.
- Reported the rounded distance outside the valid ring rather than the less useful center-to-center distance.
- Replaced the miss response with `BELL MISSED`, the correction, the miss distance, and the explicit choice to recover/retry or continue.
- Preserved the correction in the existing action rail after the consequence message finishes, including from the tee beyond the ordinary nearby-practice prompt range.
- Reused the correction in the aim card and cleared it on success.
- Added correction, miss distance, and correction stage to `render_game_to_text`.

## Validation

- `output/validate-practice-correction.mjs`: 11/11 assertions passed.
  - real miss and stage transition;
  - compound aim-and-power correction;
  - measured miss distance;
  - actionable miss consequence;
  - correction persistence into retry;
  - successful second attempt;
  - correction cleanup on success;
  - controller wording;
  - compact layout;
  - Reduced Camera Motion parity;
  - no browser or page errors.
- `output/validate-golf-terrain.mjs`: 15/15 established terrain and ball-physics assertions passed after updating its stale local URL from `/web/` to `/`.
- `node --check web/game.js`, validator syntax, and `git diff --check` passed.

## Visual review

- 2560x1600: miss consequence, persistent retry action, and successful second shot.
- 1280x720: uninstrumented miss and Reduced Camera Motion miss.
- 844x390: compact miss consequence.
- The longest combined correction fits the existing bottom rail at every viewport and never obscures the attention panel, map, crosshair, or recoverable-ball marker.

## Uninstrumented gameplay client

- Missed the amber ring through the normal golf input sequence.
- Reported `AIM RIGHT + ADD POWER // 21m OUT` and retained one recoverable ball.
- No error artifact was produced.
- Average canvas work: 1.79ms.
- Final canvas sample: 2.20ms.
- Rendered frames: 319; adaptive skips: 2.

## Outcome

The optional golf lesson now turns failure into specific, persistent coaching while preserving the threat consequence and the freedom to ignore the drill.
