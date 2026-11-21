# Rough Cut

**The course closes at dusk. Joe does not.**

A first-person golf-course horror game about Joe, a software Product Owner at an insurance company, whose final after-hours action item becomes a lethal course inspection. The browser game uses fixed 3D environments and animated characters with detailed pixel-art surfaces.

**Play it:** [willtran87.github.io/project-rough-cut](https://willtran87.github.io/project-rough-cut/). This guide describes the build published on **November 19, 2026**; see the [current state report](qa/current-state-2026-11-19.md) for what changed since November 17, how it was checked and what remains open (the [November 17 report](qa/current-state-2026-11-17.md) covers the changes before that).

## Play locally

From the repository root, with Python 3 installed:

```powershell
python -m http.server 4187 --bind 127.0.0.1 --directory web
```

Open [Rough Cut locally](http://127.0.0.1:4187/). The static browser build needs no package installation or bundling step. The animated Joe opening finishes automatically and cannot be skipped. The separate illustrated chapter stories retain their own skip controls.

Use the main menu's Chapters view to select an earned chapter. New players begin with Night Order; each later route unlocks only after completing its prerequisite and continuing into it. Wins lead forward, losses retain retry, and earned chapters can be replayed from the menu. Continuing into a chapter you have already cleared starts it fresh. Direct entry pages enforce the same progression rules:

| Chapter | Local page | Objective and continuation |
| --- | --- | --- |
| Night Order | [index.html](http://127.0.0.1:4187/index.html) | Work three field checks at their stations while Joe closes in, then escape through the shed or drain. |
| The Back Nine | [back-nine.html](http://127.0.0.1:4187/back-nine.html) | Shed branch: reconnect both relays and reach the service garage; continue to The Final Cut. |
| Under the Green | [under-green.html](http://127.0.0.1:4187/under-green.html) | Drain branch: cross the water channels, operate the pump bypass and close the keeper's sluice; continue to The Final Cut. |
| The Final Cut | [final-cut.html](http://127.0.0.1:4187/final-cut.html) | Prime the pump, flood the hollow on the strip Joe commits to, hold him twice, then bait him into the nursery swale and reach the public road. |

Night Order is one playable layout; the former rotating layouts and Overtime mode are retired and old records remain preserved. Playable implementation is separate from human acceptance and device qualification: none of the November 17–19 changes has been played by a person yet.

On foot, defaults are WASD/arrows to move, mouse/drag to look, Shift to run, C to crouch, **Q for rear glance, R to Listen**, E to Use (also in The Back Nine, where Space only brakes), Escape to pause and F for fullscreen. Controllers pause with Start in every chapter. Illustrated story screens advance with your Use key. Controls can be remapped. Settings include a Brightness slider for dark scenes, and adding `?fps` to any page address shows the frame rate. Driving and chapter-specific actions are described in the [browser guide](web/README.md).

For Windows software-rendered Back Nine, run `Play Back Nine (Software).cmd` with Node.js and Chrome or Edge installed. It uses a separate browser profile and port 4188. See the [launcher instructions and measured limits](qa/back-nine-windows-software-2026-11-14.md).

## Joe's voice

Many of Joe's lines are whispered takes generated with [ElevenLabs](https://elevenlabs.io/) (free plan); the rest still use Windows speech synthesis. The free plan requires crediting ElevenLabs and does not include a commercial licence; the game does not carry that credit yet. See the [development guide](docs/development.md#joes-recorded-voice) to rebuild them.

## Development and verification

Start with the [development guide](docs/development.md) for source ownership, test commands, tool dependencies and deployment. The [documentation index](docs/README.md) separates current references from dated designs, test reports and historical notes.

The static release verifier passes and gates every deploy, and a PR workflow runs 14 check suites on every pull request. Of 330 simulation and contract checks, 320 pass on their own; the rest are listed with their causes in the [current state report](qa/current-state-2026-11-19.md#checks).

## Repository map

| Location | Purpose |
| --- | --- |
| `web/` | Current static browser game, vendored Three.js, runtime art and chapter entry pages. |
| `game/` | Separate Godot 4.3 opening/menu prototype; see its [README](game/README.md). |
| `assets/`, `art-source/` | Source artwork, editable models, prompts and preparation inputs. |
| `design/` | Design contracts, authoring guides, reviews and implementation ledgers. |
| `docs/` | Current guides, original blueprint, historical checklist and README archives. |
| `tools/` | Asset generation, simulations, browser checks and profiling utilities. |
| `qa/` | Dated evidence and qualification limits. |
| `output/`, `builds/` | Local generated evidence and packaged builds; ignored by Git. |
| `progress.md`, `web/progress.md` | Historical work logs, not current setup instructions. |

Previous detailed README notes are preserved in the [root archive](docs/history/root-readme-before-2026-11-15.md) and [browser archive](docs/history/web-readme-before-2026-11-15.md).
