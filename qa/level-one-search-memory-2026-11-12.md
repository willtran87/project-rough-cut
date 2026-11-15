# Level 1: evidence searches and recovery

Status: verified progress on J2/J3/J6/J8/S8/P4. The whole Level 1 goal remains open.

## Reproduced issue and change

The baseline browser fixture supplied a completed prior search at a location,
then triggered the real ball-landing/hearing path there. Joe heard the ball and
investigated, but the follow-up reused the old completed cursor and immediately
returned to patrol. Old sight memory and player velocity remained afterward.
Evidence is `output/search-memory/baseline/repeated-source.json`.

Every new search now snapshots its evidence position, kind and time and starts
with fresh points/inspection progress. Sight loss retains the last actually
observed movement direction. Sound, balls, equipment, tracks, station follow-up
and cover audits do not inherit unrelated player velocity. The active search
uses its own point rather than the shared legacy lastSeenPlayer field. Fresh
confirmed contact replaces the sweep. Returning to patrol clears sight/search
memory, prediction velocity and the old route, while preserving the patrol seed.

Search points inside blocking geometry are excluded. Existing collision-aware
movement and finite search timers remain in use. Arriving at a point selects the
existing ground-inspection pose; the mower grip remains attached. No added
geometry, animation asset, shader or audio voice is required.

Losing an audible player now identifies LAST SOUND and says CONTACT LOST, rather
than claiming a broken sightline. The generic ATTENTION LOST message no longer
immediately overwrites this more useful search feedback.

## Evidence

- `node tools/verify-search-memory.cjs --baseline`: reproduced immediate patrol
  after a repeated source, with stale seen/velocity still present.
- `node tools/verify-search-memory.mjs`: 30/60/144 Hz cases pass for source and
  velocity snapshots, repeated sources, four-point finite checks, blocked points,
  reacquisition, forgetting and patrol-seed preservation.
- `node tools/verify-search-memory.cjs`: final report in
  `output/search-memory/final/report.json`. Real ball landing and reception,
  fresh repeated-source sweep, two different hidden-player positions with equal
  physical search paths, actual sight confirmation/loss, Pause, finite return to
  patrol, sound-loss context, and reacquisition pass with no page errors.
  Source setup, observer placement and short expiry timer are controlled fixtures,
  not uninterrupted novice play. An actual search-arrival inspection pose is
  rendered and its hand error is checked below0.005.
- `node tools/verify-patrol-variety.cjs`: 64 seeds/5120 decisions pass; bounded
  clearance checks, pauses, speed and all patrol styles retained.
- `node tools/verify-ball-hearing.cjs`: passed (20370), including normal Space
  throw/W approach/E quiet Release Review combination and protected chase/appeal.
- `node tools/verify-equipment-hearing.cjs`: passed (69998), including real
  obstruction reception, memory preservation and source-relative voice layers.
- `node tools/verify-encounter-refinement.cjs`: passed (22722), including real
  station actions, evasion, HUD/poses, boundaries and both shed/drain victories.
  This and ball regression preceded only the final generic-message priority and
  inspection-pose additions, directly covered by the final focused browser run.
- Installed standard client final18040 passed after the inspection integration.
  Latest full-page screenshot and text inspected: first_hole, ready, travel26,
  no error artifact. Index also invalidates the previously old joe-navigation
  script URL, so returning clients load the new API with game.js.
- JavaScript syntax and scoped whitespace checks pass.

Inspected the actual inspection pose at2560x1600 and contact-loss text at
2560x1600,1280x720,844x390,390x844. Initial observer fixtures at the far boundary
and range cart intersected geometry; the final observer uses the previously
walked approach at(0,100), with explicit navigation-clearance validation.
Portrait still has the existing heavy letterboxing and substantial text coverage;
these captures do not certify final mobile layout or human comprehension.

## Remaining work

The legacy lastSeenPlayer field is still used by authored signals and some
tactics; this pass isolates active search evidence rather than claiming all AI
knowledge is audited. Direct footstep hearing still uses a simple radius without
material transmission. Other alarm reception, tactics using live player state,
and global distant search announcements need review. Whole-route fairness,
near-pass tension, human fear/fun/understanding, mobile polish and performance
remain open. The prior weather pass's legacy atmosphere-test gaps remain open.
