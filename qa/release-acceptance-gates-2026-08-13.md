# Rough Cut release-acceptance gates

Date: 2026-08-13
Scope: the published Rough Cut vertical slice; no level expansion.

## Software gate — passed

The automated release gate is complete only when all of the following are true:

- `node tools/verify-release.mjs --url https://willtran87.github.io/project-rough-cut/` passes.
- `window.audit_rough_cut_readiness()` reports `passed: true` in a settled gameplay state.
- All deterministic action fixtures parse successfully; they cover onboarding, settings, input, collision recovery, slow footing, interaction priority, loud-station breakaways, capture/retry, exits, and results.
- Runtime assets have valid image headers, no unreferenced shipped art, and no source atlas masters in the deployed bundle.
- Representative browser replays produce no page or console errors at desktop, compact, and high-resolution viewports.

Current baseline: 57/57 readiness checks, 89 deterministic fixtures, 48 runtime image assets, and a 60.75 MB deployed image payload.

### 2026-08-13 browser evidence

- Live Pages verification passed with no asset, metadata, accessibility, syntax, or deterministic-fixture failure.
- Ordinary-input opening and collision-recovery replays both settled in `first_hole` at 55/55 readiness, 60 estimated FPS, zero browser errors, and 5.2/5.8 ms p95 canvas render work respectively.
- Direct inspection of the collision capture confirmed that the generated grounds cart remains physically grounded and visually solid, while the first-person lantern route, local course-map bearing, moon, fog, and layered course background remain readable.

## Required physical acceptance sessions

These sessions are intentionally not marked complete by browser automation. Record the device, browser, build revision, duration, and any reproducible issue before approving a public release.

| Gate | Required route and observations | Pass condition | Evidence |
| --- | --- | --- | --- |
| Keyboard and mouse | Complete one full route, including a loud station, cover hold, slow-footing exit, rear glance, distraction, collision recovery, and final filing. | Movement, camera, remaps, pause, fullscreen, and route cues remain responsive; no soft lock or contradictory instruction. | Pending human session |
| Standard controller | Complete the same representative route with a standard controller. Test dead zones, simultaneous hold actions, prompt switching, disconnect/reconnect, and pause. | No lost input, accidental actions, or unreadable prompt; controller state recovers after reconnect. | Pending human session |
| Touch device | Complete the opening, movement tutorial, one station decision, rear view, pause, and retry on a physical touch device. | Touch targets, holds, portrait guidance, and safe-area layout remain clear; no browser-scroll conflict. | Pending human session |
| Mid-tier hardware soak | Play 10–15 minutes through an active pursuit and dense-atmosphere zone. Note frame pacing, heat, audio lifecycle, memory, restart, and resume. | No sustained stutter, runaway effect count, audio loss, crash, or degradation of Joe/navigation behavior. | Pending human session |

## Evidence-led tuning rule

Do not change Joe awareness, collision, objective timing, terrain costs, or horror cadence from a single anecdotal report. A tuning issue must include the device/session above, the route or action fixture that can reproduce it, expected versus actual behavior, and a screenshot or short recording where practical.

## Release decision

The build may be published as a software-qualified browser slice after the software gate passes. A final public-release sign-off additionally requires all four physical acceptance sessions above to be recorded as passed.
