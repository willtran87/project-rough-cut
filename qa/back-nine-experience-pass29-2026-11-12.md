# Back Nine experience pass 29 — caption parity and dialogue priority

Previous goal turn: progress (route junction presentation and verification). Full 38-item scope remains active. This pass advances shared encounter priority, survival-cue accessibility and sparse/readable Joe dialogue (#2/#10/#29/#33).

## Problems reproduced and changes

1. Sound descriptions suppressed every otherwise eligible Joe line while the mower had an ambient caption. `before.json` reproduces both story and shortcut reactions: subtitles work with descriptions off, but disappear with descriptions on. The ordinary caption and sound rail are already separate, so this was a scheduling error rather than a layout requirement.
2. `chaseMessages` now reports whether a sound represents an urgent event. Ambient engine/location descriptions can coexist with sparse Joe subtitles. Nearby timber/contact sounds, windup, release, active foot charges and reveal cues still interrupt optional lines. Urgency is independent of whether descriptions are enabled. Objective/interaction/ejection/finale banners and the existing encounter restrictions retain priority. No ram/HP narration was added to ordinary banners.
3. Removed the repeated second-relay navigation sentence appended to every range taunt. Objective guidance remains in its existing HUD/optional guidance channels; Joe's line is now just the character's dialogue.
4. Full-run inspection found extremely brief readable slots: one baseline line lasted1.05s and another only0.05s. The director now requires0.8s of settled cruise before allowing optional dialogue, and refuses dialogue during Joe's tactical-choice interval. This changes only the `dialogue` channel; attack selection, speeds, warnings, movement and escape windows are unchanged. High-priority interruptions still cancel rather than resume stale lines.

Runtime changes: `web/back-nine-messages.js`, `web/back-nine.js`, `web/back-nine-dialogue.js`, `web/chase-encounter.js`, and their HTML cache tags. No new art, geometry, textures, shaders, audio nodes, timers or per-frame history containers.

## Verification

- New hardware/software browser check: eight combinations of subtitle/description settings and story/reactive lines;18 urgent/quiet-owner interruption cases with descriptions on/off; interrupted lines do not resume.
- Eight layouts per renderer:2560x1600,1280x720,844x390,390x844 at default and1.4x caption scale. Longest authored Joe line plus sound rail remains within the stage and clear of objective/dashboard bounds. Screenshots inspected. Very small portrait play still devotes substantial space to explicitly enlarged captions; this is not a claim that the player's entire model stays unobscured.
-14 direct urgency cases verify ambient, ram, charge, release, nearby/distant timber and impact with descriptions on/off, paused silence and no simulation mutation.
- Existing dialogue-budget unit/browser checks pass: lazy selection,35s common cooldown, per-kind cooldowns, readable duration, witnessed partial repair, optional subtitles and pause behavior. Updated the browser fixture to finish the introduction and present the staged scene before asserting dialogue, because the old opening staff sighting could suppress its first stale UI frame.
-100-line dialogue deck/reload checks, quiet messages and240 persisted defeat selections pass. The old quiet-message fixture now places the engine within audible range; its former distant working-mower spawn correctly produced silence and was not a runtime regression.
- Existing encounter, drama and district suites pass: physical warning contracts, locked foot charge travels35.53m, useful escape window, complete cart and on-foot routes. These checks do not prove human attack recognition.
-32 actual offline audio renders pass stereo direction, range, cover filtering, windup progression, pause/mute and zero update/retry node allocations.12 voices unchanged.
- Final installed standard client exercises ordinary on-foot keyboard steering with sound descriptions enabled; page/state captures inspected. Hardware20/software25 programs and40 textures unchanged. No frame-time or cold-start improvement is claimed by this presentation pass.

## Full-route evidence and limits

The first descriptions-enabled branch3 run completed in90.05 simulation seconds, with a natural cart failure at69.48s and normal on-foot garage completion. Two contextual lines occurred36.75s apart and only during cruise, alongside the independent sound rail. Inspection exposed short display durations, prompting the settling change rather than treating mere line presence as completion.

The follow-up seed2040914899 route before settling completed with25HP in82.63s and showed the1.05s/0.05s lines. With settling/tactical-choice suppression, a fresh route completed on foot in87.52s, with cart failure73.05s and no optional Joe lines during that continuous-pressure run. Both used normal Gamepad API input with no health/grace/actor overrides after starting. They are not a bit-identical A/B simulation comparison: browser startup admitted a different first tick, and final outcomes differ. The source change affects only dialogue admission. Zero optional lines in one intense run avoids flashing unreadable taunts, but does not close the broader variety/frequency requirement. Quiet-route readability and later human listening remain open.

Artifacts: `output/back-nine-experience/caption-priority/`, including pre-change sources, caption matrices, views, `route/`, `window-before/`, `window-after/`, and installed-client captures. Route audit now optionally records sound/score state and complete message display intervals, accepts a saved seed and an explicit baseline dialogue-window module for reproduction.

Full goal remains active. Next prioritize measured software frame stability/cold GPU stalls, then broader course/attack/audio/optional-dialogue acceptance. Human tests remain prepared for later, not conducted.

Final verification: final cache-tag software matrix passes8settings/18priorities/8layouts. The installed standard client was rerun after the settling/tactical-choice change (final-client), both page/state captures inspected, normal on-foot steering and contextual instructions preserved with descriptions on. Final syntax, dialogue/deck and physical encounter checks pass. All owned test handles are terminal; the local server remains available. No goal completion claimed.
