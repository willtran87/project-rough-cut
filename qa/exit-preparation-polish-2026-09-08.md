# Earlier exit preparation

The previous primary route excluded the key and drain valve until all three mandatory checks were complete. Both unlocks are near the opening course, so a player who missed them could finish Release Review at 624 meters and then have to return hundreds of meters before attempting an exit.

## Change

- The first check still introduces the station mechanic. Its active breakaway and hold retain tactical priority.
- After that check, guidance helps secure either exit branch, then resumes the remaining checks immediately after the pickup.
- Preparation estimates travel to each pickup plus its onward distance to the next station. This avoids automatically choosing a nearer valve behind the player when the key is along the forward route. This is a geometric estimate; the existing obstacle-aware navigator still computes the movement path.
- An item in interaction range takes priority. The existing eight-meter commitment margin limits switching between recommendations. Players may still choose either branch explicitly.
- The objective says `PREPARE EXIT`; compact inventory keeps `CHECKS 1/3` visible. The briefing explains that an exit should be secured on the way. No station is skipped, no item is collected automatically, and exit filing still requires all three checks.
- Navigation diagnostics identify whether selection uses direct distance or pickup-plus-onward distance.

## Evidence

- `node tools/verify-exit-preparation.cjs`: seven checks pass, covering the forward-route choice and both branches across all three actual variant indexes. Controlled setups verify the first station, tactical override, pickup interaction, check preservation, resumption, and final committed exit. Browser error list is empty.
- `node tools/verify-gameplay-polish.cjs`: the existing 12 browser regression groups pass, covering ordinary movement to Audit Bell and Water Hazard, compact hazard guidance, intentional review activation and rewards, keyboard/synthetic touch/controller input, pursuit recovery, both filing sequences, and retry/pause.
- `node tools/verify-release.mjs`: syntax, static contracts, 48 runtime images, and parsing of 89 action scenarios pass. Parsing does not mean all scenarios were played.
- The installed develop-web-game client executed the opening/collision replay: 57/57 readiness checks passed, with no browser-error artifact. Its screenshot was inspected.
- Exit-preparation and pickup captures were inspected at 2560x1600, 1280x720, 800x600, and 844x390. The larger compact text and check count fit the tested panels. Evidence is in ignored `output/exit-preparation/`.

## Playthrough limits

`tools/play-guided-route.cjs` is an exploratory ordinary-input probe, not a winning strategy or an acceptance gate. It uses exported navigation waypoints, actual key presses, and fixed simulation steps without injecting state or teleporting. Optional `--tactical` adds simple distraction and reactive sprint inputs; `--sprint` always sprints.

The initial implementation, which selected the nearest unlock, completed two full standard-course runs through all checks and the shed exit. Those runs opened the drain first and also collected the key. The final travel-aware selection sends this route toward the key ahead: the reactive probe reached 518 meters and two completed checks before capture; the all-sprint probe was captured near 253 meters. These probes establish traversal and reveal strategy sensitivity; they do not prove that the final route is balanced or universally completable by following lanterns alone. Earlier successful runs are retained under `output/guided-route-after/` and `output/guided-route-tactical/`; final-selection probes are under `output/guided-route-efficient/` and `output/guided-route-sprint/`.

Human observation of cover use, distraction timing, perceived fairness, and replay interest remains necessary. Existing physical-device performance and input acceptance gates also remain open; automated fixed-step render timing is not hardware frame-rate certification.
