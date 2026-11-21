# Development and verification

Checked against the local source on November 19, 2026. All commands below run from the repository root unless explicitly stated otherwise.

## Local runtime and dependencies

The browser game is static HTML/CSS/JavaScript with a vendored [Three.js tree](../web/vendor/three/). It has no root npm manifest or required bundling step. Python 3 can serve it:

```powershell
python -m http.server 4187 --bind 127.0.0.1 --directory web
```

Open [the local menu](http://127.0.0.1:4187/). Reuse an existing server only if it serves this checkout's `web/` directory. Most browser verifiers expect this exact origin and port. Serving the repository root instead changes chapter URLs and does not match those tools.

Node.js runs `.mjs` simulation/contract checks and `.cjs` browser tools. This documentation audit used Node v20.20.2 and Python 3.11.4; these are observed versions, not declared minimum support versions.

Tool dependencies (Playwright and sharp) are pinned in `tools/package.json`. Install them once with `cd tools && npm install`, then run tools from the repository root as shown below. Evidence goes to the folder named by `ROUGH_CUT_ARTIFACTS`, else `F:/CodexArtifacts/project-rough-cut` if it exists, else `output/artifacts` (see `tools/lib/artifacts.cjs`). Checks that open a later chapter directly use `tools/lib/campaign-fixture.cjs` to unlock chapters and skip stories. The Windows D3D11 browser flags some tools pass are not portable; inspect a tool's flags before running it elsewhere.

## Source ownership

| Area | Main files |
| --- | --- |
| Night Order | `web/index.html`, `web/game.js`, `web/night-order/` (pure helpers and atlas tables moved out of `game.js`), `web/scene-3d.js`, `web/course-*.js` |
| Chapter browsing | `web/chapter-links.js`, `web/course-menu-ui.js` |
| Back Nine | `web/back-nine.html`, `web/back-nine.js`, `web/chase-*.js` |
| Under the Green | `web/under-green.html`, `web/under-green.js`, `web/under-green-sim.js`, `web/under-green-scene.js` |
| Final Cut | `web/final-cut.html`, `web/final-cut.js`, `web/final-cut-sim.js`, `web/final-cut-scene.js` |
| Bindings and storage | `web/control-profiles.js`, `web/preference-store.js`, `web/keyboard-binding-settings.js` |
| Shared screen presentation | `web/game-theme.js`, `web/game-theme.css`, `web/launch-screens.js`, `web/launch-screens.css` |
| Opening versus chapter stories | `web/intro-presentation.js` / `web/game.js` versus `web/opening-story.js` / `web/final-cut-story.js` |
| Deployment | `.github/workflows/deploy-pages.yml` |

The browser guide documents current defaults. Avoid copying old key assignments from QA fixtures or work logs: those can describe a previous binding version.

## Verification commands

Start with the relevant check; the repository contains many focused tools, not one exhaustive test runner.

```powershell
node tools/verify-release.mjs
node tools/verify-campaign-preferences.mjs
```

The release verifier checks static contracts, selected script syntax, discovered runtime images and action fixtures. It does not execute every chapter or qualify gameplay/performance. The November 15 publication preparation fixed dynamic-image collection: recursive JS/HTML/CSS/JSON scanning is supplemented by `tools/runtime-dynamic-images.json` for computed URLs. All declared images must exist and pass image-header checks. Eight unused images are preserved under `assets/archive/runtime-20261115/` instead of shipped. The current gate passes with 137 referenced images and 90 validated action fixtures; see [publication notes](../qa/campaign-publication-2026-11-15.md).

Simulation suites (no browser server required):

```powershell
node tools/verify-back-nine.mjs
node tools/verify-under-green.mjs
node tools/verify-final-cut-hollows.mjs
node tools/verify-final-cut.mjs
```

These exercise rules and scripted routes, not human input or perceived difficulty. `verify-final-cut-hollows.mjs` covers the Final Cut's flood-and-bait rules. The PR workflow (`.github/workflows/checks.yml`) runs 14 suites on every pull request. The few checks that still fail, and why, are listed in the [current state report](../qa/current-state-2026-11-19.md#checks).

Representative browser checks, after starting the server and satisfying the dependencies above:

```powershell
node tools/verify-chapter-picker.cjs
node tools/verify-single-night-order.cjs
node tools/verify-intro-style.cjs --checks-only
node tools/verify-back-nine-browser.cjs
node tools/verify-under-green-browser.cjs
node tools/verify-final-cut-browser.cjs
node tools/verify-under-green-transition.cjs
node tools/verify-final-cut-transition.cjs
```

Run browser/performance checks sequentially so competing browser workloads do not distort results. The Back Nine and Under the Green browser scripts accept `--software` for forced SwiftShader; inspect each tool before assuming it supports a flag. `verify-intro-style.cjs` checks the unskippable animated opening separately from chapter-story skipping. Older focused scripts may contain stale assumptions; a failure requires investigation rather than automatic weakening of the check.

Tools generally write evidence under `output/`. Consult the relevant QA report for exact commands, image comparisons, measurements and limitations. Browser hooks such as `?test`, deterministic time stepping and placement fixtures are test instrumentation and must be identified when reporting results.

## Assets and authoring

Source art lives in `assets/` and `art-source/`; deployed runtime assets live in `web/assets/`, including optimized images, models, menu art and audio. Do not assume every current runtime asset is a WebP or that an old image count describes the current bundle.

### Joe's recorded voice

Joe's spoken lines are generated from the text the game already shows. `web/joe-voice.js` looks a clip up by the line's text, so a line with no clip is silent and captions cannot drift from audio. The Final Cut's scripted in-round lines live in `assets/audio/final-cut-joe/script.json`; PA announcements keep their own builder (`tools/build-final-cut-pa.ps1`).

```powershell
node tools/build-joe-voice.mjs           # build clips for lines that have none
node tools/build-joe-voice.mjs --check   # fail if any line has no clip
node tools/build-joe-voice.mjs --prune   # also delete clips whose line was removed
```

The build needs Windows (System.Speech, "Microsoft David Desktop") and `ffmpeg` on PATH. It reads `web/joe-dialogue.js`, `web/back-nine-dialogue.js`, `web/defeat-dialogue.js` and the base and dread lines in `web/game.js`, and writes `web/assets/audio/joe-voice/<id>.ogg` plus `index.txt`. Rerun it after adding or editing a line.

Many lines are instead whispered takes from ElevenLabs (built-in voice "Daniel", slowed and pitched down). The `--elevenlabs` mode revoices whole groups of lines within a credit budget and records what is done in `assets/audio/joe-voice/elevenlabs.txt`; `--final-cut` voices the Final Cut's scripted lines and rewrites `web/final-cut-dialogue-lines.js` with their lengths.

```powershell
$env:ELEVENLABS_API_KEY = "..."
node tools/build-joe-voice.mjs --elevenlabs --budget 9500              # next groups that fit
node tools/build-joe-voice.mjs --elevenlabs --groups dread --budget 200
node tools/build-joe-voice.mjs --elevenlabs --final-cut                # lines with no clip; --all redoes them
```

These clips come from ElevenLabs' free plan, which requires crediting ElevenLabs when published and does not include a commercial licence.

- `python tools/optimize-runtime-art.py` prepares optimized runtime artwork; inspect its Pillow dependency and input/output mapping before rebuilding.
- `node tools/bake-course-navigation.mjs` rebuilds baked course navigation after relevant course/clearance edits. Its fingerprint includes function source text, so a stale bake is silently ignored and Back Nine recomputes navigation at load; `navigationStats().baked` in `web/back-nine-course.js` tells you which.
- `node tools/bake-course-contours.cjs` (with the local server running) rebuilds `web/assets/baked/course-contours.bin.gz`, Back Nine's precomputed terrain. Run `node tools/verify-course-contours.cjs` after editing `web/course-terrain.js` or the course layout, and rebake or bump `CONTOUR_BAKE_VERSION` if it fails: a stale bake whose inputs still match would serve outdated geometry.
- `python tools/build-joe-rider.py` rebuilds the rider model shared by the Back Nine, Under the Green and the Final Cut (Under the Green adjusts Joe's arms and stance at runtime in `web/under-green-actor.js`); see the [Joe model guide](../assets/enemies/joe-hd/model/README.md) for the underlying model workflow.
- Under the Green has dedicated [encounter](../design/under-green-encounter-authoring.md) and [water](../design/under-green-water-authoring.md) authoring contracts.

## Publishing

The checked-in [Pages workflow](../.github/workflows/deploy-pages.yml) runs on a push to `main` affecting `web/**` or the workflow, and supports manual dispatch. It checks out source, runs `node tools/verify-release.mjs`, uploads `web/` as the Pages artifact and deploys it. There is no separate build command in this workflow.

The old `gh-pages` branch was archived and removed in the [September 27 release](../qa/release-2026-09-27.md). Every merge to `main` that touches `web/` redeploys the site; local uncommitted changes are not the published build. The static verifier must pass before deployment. Documentation changes alone do not certify or initiate a release.

For an explicitly requested deployed-site comparison, the verifier also supports:

```powershell
node tools/verify-release.mjs --url https://willtran87.github.io/project-rough-cut/
```

That command performs network checks and compares against the local candidate.
