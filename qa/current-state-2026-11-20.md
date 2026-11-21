# Current state — November 20, 2026

What the polish pass added on top of the [November 19 report](current-state-2026-11-19.md), how each part was checked, and what is still unconfirmed. This work was developed on the branch `feat/polish-pass` and published with it.

## What changed

Every chapter now shares five small modules in `web/`:

| Module | What it does |
| --- | --- |
| `screen-finish.js` | Redraws the finished frame with lamp bloom, a per-chapter colour grade, vignette and film grain. It works on the finished frame, so the authored image underneath is unchanged and the game is not darker. |
| `graphics-quality.js` | One Graphics quality setting (Auto, Low, Medium, High). Auto starts at High and steps down when frames run slowly; it never steps back up in a session. |
| `pad-rumble.js` | Controller rumble, scaled by a shared Rumble setting. |
| `run-records.js` | End-of-run summary, best-run records and discoveries. |
| `photo-mode.js` | Photo mode: press P while paused, drag to look, wheel to zoom, save a picture. |

Shared settings gained **Graphics quality**, **Film grain**, **Rumble** and **Difficulty** (Standard, Relaxed, Hard). Standard plays exactly as before in every chapter.

### By chapter

| | Night Order | The Back Nine | Under the Green | The Final Cut |
| --- | --- | --- | --- | --- |
| Picture | Finish, lantern glow | Finish, lighter vignette | Finish, slightly brighter | Tuned grade, stronger bloom |
| Motion | Sprint field of view | Sprung cart, steering wheels, speed field of view, landing dip | Joe's poses for search, spot, commit, lose and guard; scythe wind-back and trail; door rebound | Club arm and chip swing; gates settle; sprint field of view |
| World | Moths, fireflies, flushed birds, frogs | Tyre marks, tyre dust, moths, frogs, rain sound | Moths at lamps | Moths, flushed birds, frogs, crickets, mist, floodlights that stutter before an ambush |
| Feedback | Near-miss slow-down and rumble, heartbeat pulse | Hit-stop, flash, breathing, heartbeat pulse, hold ring | Near-miss flash, heartbeat and breathing, interaction ring, music layers | Near-miss slow-down, heartbeat, interaction and charge rings, contact particles |
| Systems | Loading bar, photo mode, quality | Summary, 8 discoveries, loading bar, photo mode, quality | Summary, 3 optional goals, loading bar, photo mode, quality | Summary, 15 discoveries, 4 horn reactions, loading bar, photo mode, quality |
| Difficulty | Joe Pressure follows the shared setting | Joe speed and ram damage | Maps to the existing pressure levels | Four timings; water window about 20 s relaxed, 14 s standard, 11 s hard |
| Retry point | Unchanged | Relaxed: last relay. Standard and Hard: the shed, as before | Relaxed: last area reached. Standard and Hard: the entrance, as before | Unchanged (three checkpoints on every difficulty) |

The Final Cut's credits now name ElevenLabs for Joe's whispered voice.

Already present before this pass, and left alone: the title screen and menu art, animated story screens, fog and mist, night sky, contact shadows, wet surfaces, wind, sprinklers, failing lights, the cart wreck sequence, reactive music, positional ambience and surface footsteps.

## Frame cost

Draw calls per frame, before and after, on the development PC. Frame rate under CPU throttling was **not** re-measured.

| Chapter | Before | After | How |
| --- | --- | --- | --- |
| Under the Green, entrance | 544 | 454 | The 96 crossing-signal lenses draw as two pieces; grille bars merged. |
| Under the Green, range | 244 | 196 | Same. |
| The Back Nine, along the route | 108–202 | 104–174 | Unbroken destructible fixtures draw merged by material. |
| The Final Cut, machine far away | 188 | about 105 average | The moon shadow is redrawn only when something in it moves or it recentres. |
| The Final Cut, opening or machine near | 380 / 346 | unchanged | The moving machine is inside the shadow, so it redraws every frame. |
| Night Order, Low quality | 535 | 318 | Low preset. At High the new effects add one or two calls. |

More than half of The Final Cut's draw calls are shadow passes, not scenery.

## Checks

- The 14 pull-request suites pass, as do the chapter browser checks for all four chapters.
- New checks: `verify-back-nine-polish.mjs`, `verify-under-green-relaxed-checkpoints-browser.cjs`. The latter also asserts that Standard and Hard never restore a checkpoint.
- `verify-back-nine-browser.cjs` gained a Relaxed block; its Standard expectations are unchanged.
- Repaired: `verify-under-green-restart-browser.cjs` (it could not load the chapter and had two stale steps), and Back Nine `player-gear`, `player-motion` and `route-cameras` (they pass when given an output folder).
- Still failing, cause not isolated: Back Nine `headlight-lighting` (2–4 brightness levels of difference behind a hedge) and `beacon-distance` (never reports ready).

### Older browser checks cannot load locked chapters

About 570 older browser checks open a chapter 2–4 page directly without first unlocking it, so the page returns to the menu and the check times out. They predate chapter locking. `tools/lib/campaign-fixture.cjs` has the unlock step; adding it gets a check past loading, but each of the ones tried then needed its own repair. On The Final Cut, 28 of them were run against both the old and new code with a temporary unlock: none passed before and fails now. The rest have not been run.

### Scripted-player checks

The five long Under the Green scripted-player checks (`range-arrivals`, `range-sequence`, `mixed-routes`, `range-balance`, `adaptive-pace`) still fail as before. In `range-arrivals` a scripted player with perfect knowledge finishes 18 of 22 sampled runs; the four it loses are spread across easy and hard pressure, and the same route is won at other settings. That points at a script that does not adapt, not at an unfair level. The assertions have not been changed.

## Not confirmed

- **Sound.** None of the new audio (breathing, heartbeat, frogs, crickets, rain, tyre noise, music layers, occlusion) has been listened to. Levels were read from the audio graph only.
- **Rumble.** Tested against a simulated controller only.
- **Seen in state, not by eye:** the near-miss slow-down in real play, Back Nine boot prints and landing dust, Under the Green's door rebound and lamp dip, The Final Cut's light stutter, gate settle, chip swing motion, bird sprite and water glints.
- **Automatic quality step-down** was never triggered in testing.
- **Plant shadows in The Final Cut** update at a quarter rate when nothing else moves; whether that is visible was not compared frame by frame.
- **No person has played any of this.**

## Not done

- Blurry close-up textures were not audited in any chapter.
- Visible player hands exist only as The Final Cut's club arm; elsewhere a camera lean or dip stands in.
- No rain was added outside The Back Nine, which already had it.
- No new spoken lines for Joe: new reactions are horn and caption only. The remaining Windows-speech lines are unchanged, so two voices can still be heard, and the ElevenLabs free plan still carries no commercial licence.
- Phone and touch support was not addressed.
- Scenery was not moved to shared texture sheets.
