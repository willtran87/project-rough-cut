# Level 1 ordinary ball impact and useful distractions

Full experience goal remains active. This pass advances J4/J8/S2/S3/P4; it does not certify the whole AI, pacing, visual or human experience scope.

## Reproduced defect

`tools/verify-ball-hearing.cjs --baseline` launched a real Space throw with Joe at the far end of the course. Joe stayed in patrol at impact, then switched to investigation when the ball stopped, with a false changed-course message. Evidence: `output/ball-hearing/baseline/far.json`.

## Implementation

- Ordinary balls now use the common world-sound reception calculation at impact. Initial surface and an actual initial bank determine loudness; later predicted contacts cannot retroactively amplify that impact. Distance and existing authored obstruction/material transmission gate the response. The impact position remains the investigation source while the ball rolls to a recoverable resting position.
- An audible approach plus short inspection gives a finite diversion window, reduced by repeated throws and overtime. Rolling/resting do not refresh it. A louder equipment contact can take over through the existing physical contact path.
- Balls and equipment do not replace chase, direct sight or protected appeal commitments. Confirmed sight cancels an active ball/equipment investigation rather than allowing Joe to ignore an exposed player beyond immediate capture range. Neither event adds the impact to the player's ongoing movement noise.
- The practice bell moves, rings and captions at impact. It uses a spatial effects destination with enough lifetime for its last tone. Accurate hits complete the optional lesson even when Joe cannot hear; no false diversion claim, fabricated timer or second ring at rest. Rest messages distinguish ongoing investigation, pursuit and an unconfirmed response.
- Ball telemetry includes the impact reception/response alongside the recoverable ball. Existing inventory, aim, travel/roll physics, station requirements and ordinary movement remain intact.

## Verification

- `node tools/verify-ball-hearing.cjs`: six checks. Real Space flight/impact/rest for nearby and distant Joe; pause; no renewed timer/source; chase/sight/appeal preservation through actual landing function; confirmed sight cancels a real live lure; real practice hits near/far; real Space throw, W approach and E Release Review signing without injecting the lure or its timer. No page errors. Current report: `output/ball-hearing/final/report.json`.
- `node tools/verify-visible-hazards.cjs`: actual equipment landing/rolling triggers and source takeover, contact, pause, resource stability and terrain coaching pass after the impact change.
- `node tools/verify-equipment-hearing.cjs`: distance, material blocker, chase/appeal/memory and all voice pan/attenuation checks pass after sharing reception.
- `node tools/verify-encounter-refinement.cjs`: final sight-priority version passes all three field actions, quiet/loud release, recovery, four-size urgent HUD, Joe poses, boundaries and both actual shed/drain victories.
- `node tools/verify-station-identity.cjs`: final bell caption version passes. Its old assertion expected a newly swinging bell after the ball stopped and correctly failed after moving the event earlier. Updated the instrumented function marker with an assertion, then checked swing and exactly one ring immediately after impact, pause freeze, completed pose, and existing station/access behavior.
- Installed standard web-game client through `verify-presented-client.mjs --level-one`, two iterations with ordinary movement. Final screenshot/text inspected in `output/ball-hearing/standard-client-final/`: first_hole, ready course, 26 travel units, zero failed assets/error artifacts.
- Release verifier passes 70 referenced images/34.16 MB/90 scenarios/no warnings or failures. JavaScript syntax and scoped whitespace checks pass.
- Inspected actual 2560x1600 near-investigation and quiet-release screenshots, 1280x720, 844x390 and 390x844 feedback, and the bell impact. No caption/instruction overlap in these captures. Portrait remains heavily letterboxed with substantial message coverage; it is not accepted as final mobile presentation.

## Remaining work

Direct footstep hearing and other authored alarms/station signals still need the broader perception audit. Expired distractions share the legacy lastSeenPlayer field for search-source navigation, so a complete player-memory/search separation is not proven. Later rolling collisions beyond equipment currently retain the initial impact investigation; investigate whether an additional audible contact event is warranted. Full-route lure balance and novice understanding require wider playtesting. Caption bearing after turning during a lingering sound deserves audit. No subjective fear/fun/listening, physical-device, maximum-resolution or sustained-performance acceptance claimed.
