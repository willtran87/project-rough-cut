# Rough Cut: experience grades

Review date: November 5, 2026. Overall editorial assessment: **B**.

These grades assess the current local vertical slice, not its feature count or future potential. A means a standout strength; B means effective with noticeable friction; C means a material weakness. Subjective enjoyment remains a hypothesis until observed in human sessions.

## Evidence

- Inspected the current source and existing implementation records, taking care not to repeat issues already fixed in September.
- Ran a capture-enabled copy of `tools/play-complete-route.cjs` at 2560x1600, Standard Review / Standard pressure / shed route, with cautious planning and side lures. It earned all three checks, the key, and victory through keyboard/pointer input, with no page errors. The read-only planner knows geometry and Joe's state; this is not a novice playtest.
- Inspected start, bell activation, key collection, release activation, and victory captures. Inspected the compact result screen at 800x600; also captured the result at 1280x720. Smaller gameplay layouts were not newly qualified.
- The route took approximately 56 simulated seconds: 14.8 exploring, 23.3 threatened, 11.6 hidden, 2.2 waiting, 4.6 learning, and zero chased. This demonstrates one successful stealth route, not that the game is too easy. At the third-check capture Joe was 246m away while track warnings remained prominent: a useful case for reviewing how strongly distant evidence should be presented.
- The installed skill client's separate deep-route replay was stopped after several minutes without producing its final artifacts. Do not count that run as passing. The successful complete-route capture used the project's existing runner.
- No listening test, physical controller/touch assessment, sustained frame-pacing qualification, or human enjoyment study was performed. No game source changed.
- Local evidence: `output/grades-2026-11-05/route/route.json`, event screenshots and state snapshots. Temporary capture runner and artifacts are under the ignored output directory.

## Grades and reasoning

| Area | Grade | Assessment and best opportunity |
| --- | --- | --- |
| Overall fun | B | Planning a noisy action, escaping to cover, and outsmarting Joe is a coherent hook. Repeated instruction-following can crowd out improvisation. Increase choices with visibly different consequences. |
| Premise and identity | A- | Corporate horror, golf, and Joe's management language form a memorable identity. Give the player more environmental jokes and discoveries that reward attention without requiring extra reading during danger. |
| Core gameplay | B+ | Balls, sight-blocking cover, terrain, tracks, access items, and two exits offer useful tactical relationships. Make successful tactics more visible in Joe's physical response. |
| Encounter variety | B | The bell teaches retreat planning, the log rewards an unseen crouched stamp, and the review rewards a remote lure. Those are real differences, but the major rhythm still repeats activation, signal, and retreat. Make one prepared interaction change the escape situation instead of only shortening a signal. |
| Tension and pacing | B- | Threat causes and recovery are thoughtfully supported. The optimized run avoided chase entirely, and distant tracking still received strong warnings. Review warning intensity and authored late-run encounters; preserve earned stealth victories. |
| Visual art and atmosphere | A- | Moonlit woods, amber lamps, weathered course props, and the shed refuge tableau establish a strong mood. Preserve this palette and identity. |
| Visual readability and spatial depth | B- | Dark turf, vegetation, prop textures, rings, and route graphics compete in similar areas. Close hedge faces read as flat textured panels. Simplify background detail around decisions and improve local silhouette/light separation. |
| Effects and feedback | B+ | Station waves, seals, fog, movement effects, and grounded consequences connect presentation to actions. Ring/exclamation/text treatments can dominate the physical object. Strengthen a few distinctive action responses and quiet the surrounding effects. |
| HUD and onboarding | B- | Objectives and threat causes are explicit, and lessons remember mastery. The two large upper panels consume substantial scenery; after the bell, saved-check information repeats across both upper cards and the lower confirmation. Consolidate repeated information while retaining accessible guidance. |
| Controls and comfort design | B+ provisional | Free look, rear glance, remapping, comfort presets, and reduced motion provide a strong option set. Automation establishes functioning input paths, not subjective mouse/controller feel. |
| Rewards and optional risks | B- | Clean Breaks, evidence, spare balls, reviews, and mastery create goals beyond escape. A review's 0.18-second filing discount is small in isolation, although its ball and score rewards also matter. Test a choice of immediately useful tactical benefits. |
| Replayability | B | Night Orders, alternate exits, evidence, mastery, compatible records, and an Echo provide reasons to return. Make variants change recognizable decisions and encounter arrangements, not primarily locations or metrics. |
| Failure and learning | B+ | Cause-based advice, quick retry, and isolated rehearsal support learning without erasing ranked stakes. Test whether players can explain their capture and apply the advice on the next attempt. |
| Audio design | B+ provisional | The source supports directional mower information, cover filtering, material cues, and deliberate silence. These are promising design choices; actual mix quality and emotional impact were not auditioned. |
| Performance | Ungraded | The observed route had no page errors. Neither manual stepping nor successful screenshots establish sustained device performance. |

## Highest-value experiments

1. **Consolidate the HUD.** Keep one immediate action and one threat read, with small progress/inventory indicators. Retire repeated saved-check statements once understood. Test whether players locate the next action faster and look at the world more often; retain expanded guidance as an option.
2. **Make outsmarting Joe the signature reward.** Give a successful lure or concealment break a clear physical reaction and brief, distinct confirmation. It should be obvious what the player caused. Build on existing investigation poses, mowing effects, and success lessons rather than stacking another banner.
3. **Deepen one station's decision.** Prototype a slower quiet log interaction versus the current fast loud option, or let a prepared final review open one of two escape lanes. Try one change first. Ask players to describe why they chose their approach.
4. **Make optional risk change the immediate situation.** Trial a review reward choice between a ball reserve and a short environmental advantage, such as temporary light control. Preserve predictable rules and clearly preview the cost. Compare intentional uptake and whether players describe the reward as worthwhile.
5. **Make each zone recognizable at a glance.** Distinguish silhouette, light direction, ground material, and landmark composition while retaining the night palette. Test landmark-based navigation with the existing Route Thread disabled, keeping Listen/map recovery available.
6. **Validate tension with new and returning players.** Observe five initial players through a full attempt and a voluntary retry. Record next-action confusion, unexplained captures, rewarding tactics, boring travel/waits, and the decision to play again. Include a later return session before claiming lasting replay value.

Prioritize HUD hierarchy, tactical payoff, and one differentiated encounter before adding more course length, objectives, or ambient effect layers.
