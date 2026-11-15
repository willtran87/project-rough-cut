# Level 1 environmental cue pacing

Part of the full Level 1 experience goal; this does not close the full scope. The preceding response restated ideas without implementation, so it was no progress. On resuming, inspected the current worktree, confirmed no zone verifier was running, recovered its failed artifact, and continued the unfinished implementation.

## Changes

- Environmental zone events use one pending slot. They require 1.25 continuous clear seconds, expire after 24 simulation seconds, drop when leaving their area, and cannot accumulate on return visits. Opening, actual danger, active/local interactions, important messages, observed scenes, ghosts, recovery and other accents defer them. Pause freezes their progress.
- Active events retire their own visual/caption/banner on danger, local interaction, an important message, recovery, or leaving the area. Ghost scheduling and incidental ambience respect the active zone event. Existing director accent spacing reserves the event duration plus six seconds. No new invulnerability, AI knowledge, detection or movement rule.
- Removed zone-triggered global fog/light events and reuse of Joe's search warning. Seven short environmental motifs use the ambience bus, existing spatial mixing and at most three transient voices per motif; each finishes within .6 seconds. An already-started sound decays naturally. Human listening/mix acceptance remains open.
- The event stores one world-space anchor at its start. Renderer, caption and audio share it, including the actual nearest pond/hedge and clubhouse location. Looking or moving does not relocate the source. Legacy direct-render fixtures retain the same fallback anchor calculation.
- Dead Green continues to use its observed old-finish scene instead of the boundary queue.
- Found and fixed a separate real conflict: a newly eligible remote status request could claim Use at the field log. Eligibility now consults the current local prompt and protected interaction state. It waits while a station/discovery is available; requests in clear space still issue and resolve normally.

## Verification

- `node tools/verify-zone-cue-queue.mjs`: deduplication, one-slot replacement, uninterrupted clear time, inactive/pause policy, expiry/leaving, priority reasons, ghost exclusion, shared anchor selection and bounded environmental motifs pass.
- `node tools/verify-zone-cue-queue.cjs`: actual game integration, six defer contexts without Joe/horror/caption mutation, real Escape pause, one start, chase/message/recovery retirement, expiry/leaving, actual quiet-filing input and actual status-request completion pass. Renderer anchor equals simulation source; event geometry is submitted. No page errors. Final report: `output/zone-cue-queue/report.json`.
- Inspected 2560x1600, 1280x720, 844x390 and 390x844 rendered water-area views, plus quiet filing. Pond effects are subtle and partially obscured by existing reeds; screenshots prove rendering, not discoverability or horror effectiveness. Portrait retains the existing landscape stage. No responsive redesign claim.
- Existing ghost scheduling unit suite, Dead Green browser suite, encounter refinement (including all three stations, close escape and both exit victories), and release verifier pass. Release: 90 scenario definitions, 68 referenced images, no warnings.
- Original-features browser passed 22 cases after updating an obsolete exit assertion: the old renderer no longer owns exit beacons. Current objective exit state is checked; direct legacy zone render fixtures still exercise all eight old effects. No runtime exit change was made for the test.
- Installed standard client through `verify-presented-client.mjs --level-one`, two iterations: terminal pass. Latest page1/state1 inspected, ready first_hole, 26 course units traveled, no failed assets/error artifacts, software 640x360. This is input/render smoke evidence, not performance acceptance.
- Syntax and scoped whitespace checks pass. All processes started for this pass reached terminal state; the existing local server on port 4187 remains running. No deployment or agents.

## Remaining full-scope work

D5/D6 and P1 remain partial: other scare/dialogue systems and whole-route pacing still require audit. Zone composition/discoverability, Dead Green ground/refuge dressing, broader movement/detection/retry/input polish, sustained performance and the ledger's remaining requirements are not implied complete. Human first-play, listening, tension and fun acceptance remain unverified.


## Boundary-path follow-up (2026-11-12)

The original queue tests did not cover a separate first-visit branch in the main
update. That branch still played threat cues, raised Joe alert and immediately
started Water Hazard dimming. This is now corrected: boundary visits preserve
current messages/AI, and the relay cycle is part of the paced water scene. Added
actual boundary/update tests pass. See level-one-playable-lessons QA for current
scope and limits; earlier wording about removal applied only to the queue path.
