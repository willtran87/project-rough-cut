# Level 1 danger interaction and route audit — November 12, 2026

Scope: F6/P1/P2/P4 and latest brief item18. This is a partial delivery within the
full Level 1 overhaul, not completion of its art, pacing, performance or human
playtest requirements.

## Runtime changes

- General danger keeps the primary threat headline and escape advice, with the
  authoritative nearby ready interaction below it. The same owner supplies the
  keyboard/controller/touch binding and actual noise/quiet consequence.
- Loud field checks name their signal duration and retreat cover. Immediate mower
  warning, push and recovery retain exclusive evasion priority. Busy actions,
  aiming/filing, pause, absent targets and non-interact bindings do not advertise
  another available action.
- Field Log quiet advice now requires losing Joe first when he sees or pursues
  the player. Crouching during chase still performs the existing loud stamp; no
  mechanics, AI, threat distances, noise timing or station reach were weakened.
- The responsive message stack includes the action/consequence in its change key.
  Viewport, text scale and touch-mode changes refresh scrolling. The canvas resize
  observer also scrolls after applying the actual overlay dimensions, correcting
  a reproducible four-pixel bottom clip at320x568. Listening keeps its own scroll.
- Sources: web/course-danger-action.js, web/game.js, web/quality-ui.js/css,
  web/index.html. Cache versions updated.

## Route evidence

`tools/play-complete-route.cjs` now selects #game explicitly, waits for the actual
briefing button, and advances a frame after opening the map before choosing a
route. Its optional --visual-audit captures a presented2560x1600 frame on each new
zone/check-count/owner combination. Routes use ordinary keyboard/mouse controls;
the planner reads state to choose waypoints, so this is not novice comprehension.

- output/course-route-drama/shed: victory,3/3checks,shedkey,retained station receipt,
  no browser errors. This pre-HUD-fix audit exposed Field Log E being hidden by the
  pursuit warning despite remaining usable.
- output/course-route-drama/drain: victory,3/3checks,drain access,retained receipt,
  no browser errors. Captured after initial HUD fix, before final copy/resize fix.
- output/course-route-drama/shed-final: final copy, victory,3/3checks,shedkey,
  retained receipt,no errors; terminal session41698. It finished before the later
  overlay resize correction. No simulation change followed it. Joe investigated
  at its Field Log visit, so the focused fixture supplies final chase evidence.
- Reviewed the actual Dead Green approach and drain release images at2560x1600,
  plus the Field Log chase layout. The Field Log nameplate is partly occluded by
  its top housing from the interaction view; keep physical sign composition open.

## Focused verification

- node tools/test-course-danger-action.mjs: pass. Actual owner/binding/consequence,
  busy and non-interact suppression, immediate evasion/commitment priority.
- node tools/verify-course-danger-action.cjs: final hardware session89093 passed
  six groups, no console/page errors. Reports/screens in
  output/course-danger-action/hardware. Focused state setup recreates the observed
  Field Log pursuit, then actual E/C, Escape, sustained mouse drag and touchscreen
  USE verify the transition chain. Controller label is checked; no physical
  controller acceptance is claimed.
- Layouts2560x1600,1280x720,844x390,390x844,320x568; ordinary/compact sizes use1.3
  text scale. Actual touch390 activation and320 action geometry checked. Inspected
  hardware2560/1280/320keyboard/390touch/320touch screenshots.
- node --check web/game.js and web/quality-ui.js passed.

Final software and installed-client results are appended below after completion.

## Failures investigated

- Initial route harness selected multiple canvases; then map-route selection was
  attempted before its next render. Corrected harness sequencing/selectors.
- Rounded serialized player position408 lay just outside the existing Field Log
  radius; the focused fixture uses409, inside the real range. No reach rule changed.
- Single1100px mouse event cannot turn away because accumulated input is bounded.
  The test now performs45 ordinary20px drag events over45simulation frames.
- The added smallest-touch geometry assertion found a real four-pixel clip on
  hardware while software happened to pass. Including viewport in the render key
  alone did not resolve it; scrolling after ResizeObserver applies dimensions did.
- Earlier failure artifacts remain diagnostic history; dated final report.json
  files and terminal process results identify passing versions.

## Remaining acceptance

Human fun/fear/first-play comprehension/listening and physical input devices remain
unverified. Whole-course frame-budget qualification remains open. Route completion
and local HUD geometry cannot substitute for these. No performance gain is claimed.
The original scope and all later crosswalks remain intact, now including the latest
40-item brief. Continue full-course composition, interaction art and pacing work.

## Final results

- Final software session31055 terminal0: six groups, zero console/page errors.
  Same320x568 geometry as hardware: action top239.96875,bottom316.765625 within
  stack178.84375..316.84375, resources start324.25; scrollWidth/clientWidth283.
  Software smallest-touch screenshot inspected.
- Final installed client64029 terminal0, two arrival movement bursts:
  node tools/verify-presented-client.mjs --level-one --url http://127.0.0.1:4187 --actions-file tools/fixtures/course-arrival-input.json --iterations 2 --pause-ms 250 --screenshot-dir output/course-danger-action/final-client
  Latest presented screenshot/state inspected: first_hole,tee,Joe patrol, clear
  Audit Bell objective, no error artifacts. Readiness56/57; only
  gameplay_frame_budget fails. This is not whole-route performance qualification.
- All owned test handles are terminal; local server4187 retained. No commit or
  deployment. Shared later-chapter work preserved.
