# Development and verification

Checked against the local source on November 15, 2026. All commands below run from the repository root unless explicitly stated otherwise.

## Local runtime and dependencies

The browser game is static HTML/CSS/JavaScript with a vendored [Three.js tree](../web/vendor/three/). It has no root npm manifest or required bundling step. Python 3 can serve it:

```powershell
python -m http.server 4187 --bind 127.0.0.1 --directory web
```

Open [the local menu](http://127.0.0.1:4187/). Reuse an existing server only if it serves this checkout's `web/` directory. Most browser verifiers expect this exact origin and port. Serving the repository root instead changes chapter URLs and does not match those tools.

Node.js runs `.mjs` simulation/contract checks and `.cjs` browser tools. This documentation audit used Node v20.20.2 and Python 3.11.4; these are observed versions, not declared minimum support versions.

Many browser tools import Playwright from `C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright`. Some also set temporary/evidence paths under `F:/CodexArtifacts/`. They are currently workstation-specific. On another machine, inspect the selected script's imports, paths and browser flags and provide equivalent Playwright/browser dependencies before running it. The Windows D3D11 flags are not a portable browser-test setup. Installing a package in the repository alone does not resolve an absolute import.

## Source ownership

| Area | Main files |
| --- | --- |
| Night Order | `web/index.html`, `web/game.js`, `web/scene-3d.js`, `web/course-*.js` |
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

The release verifier checks static contracts, selected script syntax, discovered runtime images and action fixtures. It does not execute every chapter or qualify gameplay/performance. **It fails in the current documentation-audit snapshot**: the literal `web/assets/menu/${id}-scene.webp` is treated as a missing asset, and 54 images are reported as unreferenced. Its static collector does not resolve all dynamic image references. The reported images need classification before deletion; this documentation task did not alter assets or the verifier. Details: [audit report](../qa/documentation-audit-2026-11-15.md).

Simulation suites (no browser server required):

```powershell
node tools/verify-back-nine.mjs
node tools/verify-under-green.mjs
node tools/verify-final-cut.mjs
```

These exercise rules and scripted routes, not human input or perceived difficulty. They were catalogued but not rerun during this documentation-only audit.

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

- `python tools/optimize-runtime-art.py` prepares optimized runtime artwork; inspect its Pillow dependency and input/output mapping before rebuilding.
- `node tools/bake-course-navigation.mjs` rebuilds baked course navigation after relevant course/clearance edits.
- `python tools/build-joe-rider.py` rebuilds the Back Nine rider from its source assets; see the [Joe model guide](../assets/enemies/joe-hd/model/README.md) for the underlying model workflow.
- Under the Green has dedicated [encounter](../design/under-green-encounter-authoring.md) and [water](../design/under-green-water-authoring.md) authoring contracts.

## Publishing

The checked-in [Pages workflow](../.github/workflows/deploy-pages.yml) runs on a push to `main` affecting `web/**` or the workflow, and supports manual dispatch. It checks out source, runs `node tools/verify-release.mjs`, uploads `web/` as the Pages artifact and deploys it. There is no separate build command in this workflow.

The old `gh-pages` branch was archived and removed in the [September 27 release](../qa/release-2026-09-27.md). Local source changes are not automatically the published build. The current static-verifier failure must be resolved before this workflow can pass its gate; documentation changes do not certify or initiate a release.

For an explicitly requested deployed-site comparison, the verifier also supports:

```powershell
node tools/verify-release.mjs --url https://willtran87.github.io/project-rough-cut/
```

That command performs network checks and compares against the local candidate. It was not run during this documentation audit.
