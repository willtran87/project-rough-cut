# Current state — November 19, 2026

What changed between the [November 17 report](current-state-2026-11-17.md) and the build published on November 19, how each change was checked, and what remains open. Every change below is merged to `main` and deployed to [GitHub Pages](https://willtran87.github.io/project-rough-cut/).

## Published changes

| PR | Change |
| --- | --- |
| [#18](https://github.com/willtran87/project-rough-cut/pull/18) | Lossless WebP for 17 large textures (pixel-identical); the tree bake hash ignores line endings. |
| [#19](https://github.com/willtran87/project-rough-cut/pull/19) | `.gitattributes` line-ending rules, a PR check workflow, updated deploy actions, merged branches auto-delete. |
| [#20](https://github.com/willtran87/project-rough-cut/pull/20) | Tool dependencies pinned in `tools/package.json`; tools no longer need a workstation-specific Playwright path. |
| [#21](https://github.com/willtran87/project-rough-cut/pull/21) | E is Use in every chapter (Space only brakes in The Back Nine); narration banners for things the player can already see or hear moved behind Sound descriptions. |
| [#22](https://github.com/willtran87/project-rough-cut/pull/22) | Back Nine briefing says to hold Use at the garage; the Final Cut opening objective names the ROUND posts; faster Back Nine terrain building. |
| [#23](https://github.com/willtran87/project-rough-cut/pull/23) | Stale checks repaired; Back Nine navigation bake refreshed (the game had been recomputing it at load). |
| [#24](https://github.com/willtran87/project-rough-cut/pull/24) | Joe no longer freezes beside cover in Under the Green; a cart wrecked at the jammed garage shutter no longer traps the player inside. |
| [#25](https://github.com/willtran87/project-rough-cut/pull/25) | Back Nine: a control box no longer blocks the dry-range lane; opening a gate triggers Joe's reaction; the run-over no longer freezes on a crushed wreck. |
| [#26](https://github.com/willtran87/project-rough-cut/pull/26) | Optional frame-rate counter: add `?fps` to any page address. |
| This update | Story screens advance with the bound Use key; Start is the only controller pause; Brightness setting; Back Nine terrain bake; helpers moved out of `game.js`; documentation refresh. |

## Controls

- **Use** is E (controller A) in all four chapters, including The Back Nine, where Space only brakes. Illustrated story screens advance with the player's Use key, so a rebound Use key works there too; Enter and Space still advance.
- **Start pauses** in every chapter. Controller B no longer pauses Night Order during play (B brakes in The Back Nine); it still cancels an aimed ball, closes the map and backs out of menus.
- **Q** is rear glance and **R** is Listen on foot.

## Brightness

A shared Brightness setting (80–160%, default 100%) lightens the 3D view without touching menus, HUD or captions, for dark scenes such as the Final Cut opening. It is under Settings → Atmosphere in Night Order and Settings & controls → Camera in the other chapters. At 100% rendering is unchanged. Night Order's fallback copy presentation (`?presentation=copy`) ignores it. Checked by `tools/verify-brightness-setting.cjs`.

## Fixed gameplay bugs

All five were present since the first published version and were found while repairing checks.

| Chapter | Bug | Check |
| --- | --- | --- |
| Under the Green | Standing beside a pillar or the pump froze Joe indefinitely. He now steps to a clear stance, guards the opening ("watching for an opening") or re-plans within 0.6 s. | `verify-under-green-obstacle-pursuit.mjs` |
| The Back Nine | A cart broken against the jammed garage shutter threw the runner inside, where the run could be neither won nor lost. | `verify-chase-garage-ejection.mjs` |
| The Back Nine | The flood station's control box stood 0.4 m from the dry-range lane and stopped carts dead. | `verify-back-nine-choices.mjs` |
| The Back Nine | Opening a latched gate never triggered Joe's shortcut reaction or defeat line. | `verify-back-nine-reactions.mjs` |
| The Back Nine | The run-over froze on a fully crushed wreck. | `verify-chase-runover.mjs` |

## Performance

Measured on the development PC (RTX 3090, served locally). "4× slower CPU" uses Chrome's CPU throttling, which probably overstates a real laptop because it also slows the browser's own drawing work.

| Chapter | Ready (this PC) | Ready (4× slower CPU) | Gameplay (this PC) | Gameplay (4× slower CPU) |
| --- | --- | --- | --- | --- |
| The Back Nine | about 10 s | about 38 s (was 51 s) | 60 fps | about 17–22 fps |
| Under the Green | about 12–14 s | about 27 s | 60 fps | about 8–11 fps |
| The Final Cut | about 6 s | about 20 s | 60 fps | about 27 fps |

- Most of the wait before a chapter starts is a deliberate graphics warm-up that prevents stutter during play, and it overlaps the chapter story. Repeat visits are faster because the browser keeps compiled shaders.
- Slow-CPU frame rate is limited by drawing hundreds of separately textured scenery pieces (about 520 visible in Under the Green, using about 290 distinct materials). Shadows and resolution make no difference; a shorter view distance gains about 25%. A real improvement needs art rework so scenery shares texture sheets and can be merged. It has not been started; measure on real devices first with `?fps`.

## Checks

- Of 330 `tools/verify-*.mjs` scripts, **320 pass** when run on their own. The 10 that fail, plus one that only fails under load, all have known causes, and none is a game bug:
  - three need test data re-recorded since the scythe changes: Under the Green `attack-reposition`, `keeper-counterplay` and `reactive-counterplay`; the last depends on untracked files in `output/`.
  - five long scripted-player runs have failed the same way since the first published version: `range-arrivals`, `range-sequence`, `mixed-routes`, `range-balance` and `adaptive-pace`. Whether the scripted player should still win those routes is a balance decision.
  - two are helper clients that need `--url`: `verify-idle-screen-client` and `verify-presented-client`.
  - `verify-final-cut-replays` passes on its own but can exceed four minutes when many checks run at once.
- The PR workflow runs 14 suites on every pull request; all pass.
- Several Back Nine browser checks (`beacon-distance`, `headlight-lighting`, `player-gear`, `player-motion`, `route-cameras`) time out on `main` and have not been investigated.

## Not yet established

- No person has played any of the November 17–19 changes. Pacing (the Final Cut's 14 s water window, the longer Night Order checks) is untested.
- Frame rate on real low-end devices is unmeasured.
- Joe's whispered lines come from the ElevenLabs free plan, which requires crediting ElevenLabs and does not include a commercial licence. The game does not yet carry that credit. The remaining lines use Windows speech synthesis, so two voices can be heard in one session.
