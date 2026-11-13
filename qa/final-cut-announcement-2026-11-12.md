# Final Cut — filed-station championship announcement

Local implementation for FC05, with related arrival, speech and save coverage. Full chapter and human acceptance remain incomplete.

## Authoritative source and handoff

`night-order-receipt.js` stores a small, route-specific record under `rough-cut.night-order-receipts.v1`. The source chapter calls it only from `completeHole`, after actual escape filing and seal completion. It stores the completed Audit Bell, Field Log and Release Review IDs. It stores no quiet/loud strategy, coordinates, player account information or inferred perception. Rehearsals cannot write it. A later escape replaces only its own branch's receipt; the other branch is preserved.

Garage imports the shed receipt; drain imports the drain receipt. Direct entry and unknown/legacy data receive a neutral welcome. Finale snapshots retain their original validated receipt across reload, retry, restart and replay. Missing storage does not interrupt play. Existing career, branch completions and evidence records remain separate.

## Presentation

The distant scoreboard and a readable repeat board on the existing overlook parapet acknowledge the received stations under the protagonist's fictional role. The repeat board is left of the forward destination/ramp view and adds no walkable-space collider. Both signs update their existing canvas textures only when the text changes. They are excluded from the static sign atlas. The final ruined-course scoreboard still switches to COURSE CONDITION: EXCELLENT.

The protected overlook offers one optional PA reading after the initial arrival guidance and a short settled interval. The player remains in control. Starting the final round, leaving the overlook, aiming, listening or new interaction guidance cancels the PA; there is no queued late replay or delay to the reveal. Pause freezes the source clock, and heard state survives reload. Ceremony sounds duck while the PA speaks. The existing one-source speech player prevents overlap with Joe.

Eight local synthetic variants cover all subsets of filed stations, but only the matching recording loads per visit. See `assets/audio/final-cut-pa/README.md` for authorship, build and provenance. This is Microsoft David Desktop synthesis, not completed human voice acting. Dialogue/PA subtitles are optional and independent of mute; the physical board remains available.

## Corrections found during verification

- The first near-board width clipped its last word in the narrow portrait view. Reduced it from 4.4 to 3.2 metres and moved the supports to match; inspected the final complete text at all four sizes.
- Ogg container durations exceeded decoded playback by 22–98 ms. Confirmed that FFmpeg decoded sample output agrees with Web Audio; changed the generator to sum decoded frame sample counts. Kept the original duration assertion and reran all eight variants successfully instead of loosening it.
- The existing ordinary-route pilot stalled in the illustrated opening because it sent Enter before image readiness. It now uses the actual Skip intro button, preserving ordinary UI control. The first source route was then caught after two stations and correctly produced no completed receipt. The successful cautious/side-lure route is distinct evidence; the failed route is not counted as a pass.
- Moved the pilot's receipt assertion after report writing and restricted it to actual victory, so a defeat is reported as a defeat and its evidence is retained.

## Evidence

- `verify-final-cut-announcement.mjs`: six groups; all eight receipt subsets on both branch entries, whitelist filtering, route isolation, save round trips, rehearsal exclusion, neutral fallback, pause, cancellation, early start, later checkpoints and unavailable storage.
- `verify-final-cut-receipt-source.cjs`: four source integration groups. Actual bell/release Use and completed quiet-log input produce no premature receipt; interrupted filing remains unpublished; simulated filing/seal completion writes the earned station list; rehearsal cannot overwrite it; actual navigation carries it into the finale. Station positions, key access and filing start are fixtures. This test is not a full ordinary-input campaign route.
- `play-complete-route.cjs output/final-cut/announcement/source-route --shed --hardware --receipt --cautious --side-lure`: full ordinary keyboard/mouse Night Order escape, three stations, key pickup and shed completion; actual receipt retained; zero page errors. Read-only route planning is used, with no player placement or gameplay-state mutation. This covers the first chapter through its receipt, not the complete multichapter campaign.
- `verify-final-cut-announcement-browser.cjs`: seven groups. Matching PA only, actual playback/pause/resume, final-round Use interruption, actual save/reload/restart/replay, neutral/missing-asset fallback and all eight decoded assets. Runtime clips have RMS .062–.066, peaks .721–.726, durations 8.039–12.208 seconds. Corrected duration differences are below one microsecond. No page errors.
- Maximum subtitle size and touch UI captured and inspected at 2560×1600, 1280×720, 844×390 and 390×844. The portrait board and full PA caption remain legible, with separation from objectives and controls.
- Main simulation: thirteen groups/seven complete pilots passed, with unchanged default/sprint/seed-2 times. Outcome: eight groups including 96 combinations passed. Existing drama browser: eight groups, six assets loaded, one speech source maximum, all-six-missing fallback passed. Both real legacy branch continuation links passed and preserved completions. Ending browser passed twelve captures after the board change.
- Installed develop-web-game client completed two ordinary movement bursts after final changes. Latest screenshot/state inspected at about 6.5 seconds: waiting rig, six decoded speech assets, no error artifacts. The sample had 69 draws, 23 geometries and 16 textures; no frame-rate claim is made from those counts. Final high-resolution and portrait views also confirm a solid board back and a speaker post anchored to the parapet.

Artifacts: `output/final-cut/announcement/`, including `source-route/route.json`, `source-integration.json`, `rules.json`, `browser.json` and `clip-audit.json`. The initial defeated pilot screenshot is retained as `source-failed-first.png`; its early assertion prevented a full JSON report, so only its terminal log and screenshot support that failed attempt.

## Remaining scope

Unfamiliar-player recognition, voice intelligibility, dramatic effect and listening acceptance remain open. The announcement is optional and does not certify the full arrival composition or the whole campaign's continuity. Environment/rig/animation finishing, curated replay variation, broader lifecycle/device/performance work and other original requirements remain in the implementation ledger.
