# Documentation audit — November 15, 2026

Scope: reconcile entry-point documentation with the existing local working tree. The checkout already contained extensive modified/untracked implementation and documentation work. This task changed documentation only and did not commit, publish, rebuild assets or alter gameplay.

## Corrections

- Replaced accumulated root/browser README update streams with current setup, chapter flow, control and save guidance. Preserved the previous content in `docs/history/`, with relocated Markdown links and explicit historical notices.
- Documented all four local chapter entries and both second-act continuations into The Final Cut. Removed the obsolete claim that the finale is unimplemented.
- Documented one playable Night Order layout, retired alternate layouts/Overtime and preservation of historical records.
- Corrected Q/rear and R/Listen defaults from `web/control-profiles.js`, plus arrow movement and chapter-specific actions. Back Nine uses steering for driving and running, without independent mouse look. Both Back Nine and Under the Green now restart attempts from their entrances rather than restoring live checkpoints; The Final Cut retains checkpoint/preparation recovery.
- Distinguished the unskippable animated Joe opening from independently skippable illustrated chapter stories; corrected the Godot guide too.
- Replaced obsolete `gh-pages` deployment instructions with the checked-in Actions workflow from `main`.
- Added an index and development guide covering source ownership, test dependencies, authoring, deployment and evidence limits. Marked the July quality checklist and original blueprint as historical planning/baseline material.
- Linked recent UI and entrance-stall evidence without converting it into blanket device, performance or human acceptance.

## Verification performed

Environment: Node v20.20.2, Python 3.11.4, Windows checkout.

| Check | Result |
| --- | --- |
| Source review | Chapter links/continuations, control profiles and consumers, opening implementations, local launcher and Pages workflow inspected. |
| `node tools/verify-campaign-preferences.mjs` | PASS: shared-settings validation, malformed/unavailable storage, cross-tab field preservation, idempotent writes and independent chapter saves. |
| `node tools/verify-release.mjs` | FAIL: 92 discovered runtime references, 90 action fixtures, 54 reported unreferenced images; no warnings. |

The release check reports `Missing runtime asset: web/assets/menu/${id}-scene.webp`. Its regular-expression collector captures a template fragment as a literal filename rather than resolving chapter IDs. It also reports 54 images as unreferenced, including menu thumbnails and newer chapter/material art. Dynamic references explain at least part of the mismatch; this audit did not establish that every reported image is used or safe to remove. Asset discovery and bundle classification remain follow-up work. The failure was reproduced before the documentation edits, and neither runtime assets nor verifier code changed here.

Browser, route-simulation, performance and Godot runtime suites were not rerun for this documentation-only task. Existing dated reports remain evidence for their own tested snapshots. No deployed-site comparison was performed.

Documentation checks passed across 10 edited/added Markdown files: 155 relative file links resolve, all 17 referenced Node/Python tool paths exist, and both archived README bodies match their pre-edit snapshots after the documented link relocation. `git diff --check` passed for the tracked documentation edits. Local verification details and pre-edit snapshots are in `output/documentation-audit-2026-11-15/`.
