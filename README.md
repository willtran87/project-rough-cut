# Rough Cut

**The course closes at dusk. Joe does not.**

A first-person golf-course horror game about Joe, a software Product Owner at an insurance company, whose final after-hours action item becomes a lethal course inspection. The current browser game uses fixed 3D environments and animated characters with detailed pixel-art surfaces.

This guide describes the **local working tree as of November 15, 2026**. The [last recorded public release](qa/release-2026-09-27.md) is from September 27; it does not establish that the later local chapters and visual changes are published. This documentation update did not deploy the game.

## Play locally

From the repository root, with Python 3 installed:

```powershell
python -m http.server 4187 --bind 127.0.0.1 --directory web
```

Open [Rough Cut locally](http://127.0.0.1:4187/). The static browser build needs no package installation or bundling step. The animated Joe opening finishes automatically and cannot be skipped. The separate illustrated chapter stories retain their own skip controls.

Use the main menu's Chapters view to select an earned chapter. New players begin with Night Order; each later route unlocks only after completing its prerequisite and continuing into it. Wins lead forward, losses retain retry, and earned chapters can be replayed from the menu. Direct entry pages enforce the same progression rules:

| Chapter | Local page | Objective and continuation |
| --- | --- | --- |
| Night Order | [index.html](http://127.0.0.1:4187/index.html) | Complete three field checks and escape through the shed or drain. |
| The Back Nine | [back-nine.html](http://127.0.0.1:4187/back-nine.html) | Shed branch: reconnect both relays and reach the service garage; continue to The Final Cut. |
| Under the Green | [under-green.html](http://127.0.0.1:4187/under-green.html) | Drain branch: cross the water channels, operate the pump bypass and close the keeper's sluice; continue to The Final Cut. |
| The Final Cut | [final-cut.html](http://127.0.0.1:4187/final-cut.html) | Survive the tournament mower, prepare the irrigation trap, lure the rig and reach the public road. |

Night Order is now one playable layout. The former rotating layouts and Overtime mode are retired; old records remain preserved. All four chapters above exist locally. Playable implementation is separate from human acceptance, visual-backlog completion and device qualification.

On foot, defaults are WASD/arrows to move, mouse/drag to look, Shift to run, C to crouch, **Q for rear glance, R to Listen**, E to Use, Escape to pause and F for fullscreen. Controls can be remapped. Driving and chapter-specific actions are described in the [browser guide](web/README.md).

For Windows software-rendered Back Nine, run `Play Back Nine (Software).cmd` with Node.js and Chrome or Edge installed. It uses a separate browser profile and port 4188. See the [launcher instructions and measured limits](qa/back-nine-windows-software-2026-11-14.md).

## Development and verification

Start with the [development guide](docs/development.md) for source ownership, test commands, tool dependencies and deployment. The [documentation index](docs/README.md) separates current references from dated designs, test reports and historical notes.

The November 15 documentation audit reran the static release verifier: **it currently fails** on dynamic asset discovery and reported unreferenced images. Shared-settings verification passes. See the [audit report](qa/documentation-audit-2026-11-15.md). Historical passing reports do not override this result.

Recent evidence includes [shared screen refinements](qa/theme-five-followup-2026-11-15.md), the [Under the Green software entrance fix](qa/under-green-software-stall-2026-11-15.md), and the [loss-screen review](design/loss-screen-review-2026-11-15.md). The entrance fix does not qualify whole-level software frame rates. Human playtests and physical-device qualification remain open in the relevant QA reports.

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
