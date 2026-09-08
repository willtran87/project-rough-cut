# Shed approach clearance

## Follow-up: remove the remaining choke point

The first fix moved the gate but left its two blocking wings. A subsequent report was reproduced against the published build: forward movement from x=0, y=650 stopped before reaching the shed, and no interaction prompt appeared. Earlier straight-lane tests started beyond the relocated gate; navigation-driven tests threaded its center and missed this failure.

The final gate artwork and both collision wings are now removed. The test adds six straight approach lanes from y=650 across all three course variants, crossing the former gate location. Combined with the previous tests, 36 approach/file/completion sequences pass locally. The same added test fails on the previous published build. The test accepts `--url` to run using the actual published game source and assets, with only controlled test-state access injected.

The HTML references a versioned game script so reloading the page requests this correction instead of reusing the previous script URL. Evidence is under `output/shed-clearance/`; the original published failure is retained in `published/failure.json` and `published/failure.png`.

The sections below document the initial fix; this follow-up supersedes its gate relocation.

## Reproduction

With the key and all three checks completed, walking forward from x=-36 or x=0 at y=680 stopped at the final hedge gate around y=688. The player remained outside the shed's old 16-unit interaction radius, and Use could not begin filing. The center lanes were reachable, so the problem was a cramped and poorly communicated approach rather than universal exit failure.

The gate also concealed most of the shed door. Touching the shed itself could display a collision retreat instruction even while the filing action was available.

## Fix

- Moved the final release gate and both matching collision wings from y=694 to y=668, leaving an open forecourt before the shed at y=710. The visible gate and physical geometry remain aligned.
- Increased the shared shed interaction radius from 16 to 22. The prompt, route planning, filing start, and filing range checks use that same target.
- Updated the authored approach audit to pass through the relocated gate and across the clear forecourt. Its sampled route has no blockers and reports 4.6 units of minimum clearance beyond the player's radius.
- Kept the door and walls solid. Contact with the usable shed yields to the filing action instead of issuing a misleading retreat cue. The in-range route reads `FILE RELEASE`.
- Preserved the key requirement, all three field checks, filing duration, cancellation on movement, and Joe's gameplay behavior.

## Verification

`node tools/verify-shed-clearance.cjs` tests five forward approach lanes (x=-36, -27, -18, -9, 0) across all three course variants. All 15 walk/Use/file sequences reach victory. Three additional navigation-driven approaches starting at y=632 from x=-92, 24, and 92 also reach victory. These are controlled late-course setups: prerequisites are seeded and Joe starts far away to isolate physical access, while movement, collision, Use, filing, and completion run normally.

The test also verifies that missing keys or missing checks prevent filing, movement cancels filing, a subsequent stationary attempt succeeds, and the authored approach remains clear. No browser errors were recorded. The production build exposes no added test-state access.

The broader gameplay-polish browser suite passes, covering both exits and existing input/reward behavior. The official opening replay passes 57/57 readiness checks. Static release checks pass for syntax, contracts, 48 assets, and parsing of 89 fixtures; fixture parsing is not execution of all scenarios.

Before/after approach and door captures, four viewport captures, geometry, and test results are under ignored `output/shed-clearance/`. The final scene has a visible shed door and a clear interaction ring across the open forecourt. Changes are local; this task did not publish the hosted build.
