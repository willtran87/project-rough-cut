# The Final Cut — aftermath, result and replay verification

Scope: FC40, FC52–55, FC72 and the run-history portion of FC66. The full 72-item implementation goal remains active and incomplete. No deployment, human horror playtest, listening review or physical controller acceptance is claimed.

## Implemented behavior

Every ending confirms that the player reached the public road and left Joe’s team. The insurer suspends the turf-telemetry pilot and withdraws Joe’s course-control access. Evidence changes the incident report and ending illustration without becoming a condition of survival.

Evidence has separate durable fields for the two Back Nine crew-log bits, Under the Green drainage record, Final Cut load-limit record and the count of filed Change Requests. The selected branch supplies its own records. An imported drainage record no longer hides the local load-limit collectible. Legacy branch records without a title stay generically identified rather than inventing a particular log. The result names what each source actually establishes.

The result includes route, evidence, replay, credits and a collapsed optional mastery section. It says Final Cut complete, not that unplayed campaign chapters are complete. An opaque result background fixes large world-sign lettering showing through narrative text. There is one replay action; restart remains available only from pause.

Optional challenges are Unbroken round, Borrowed attention and Read the wake. Only runs tracked from arrival qualify. Captures, throws, actual ball-driven strip selections, unique crossings, run identity and elapsed time survive retry/reload. Throwing alone earns no successful-distraction credit. Relevant events persist immediately; page exit also saves. Best times exclude untracked legacy/prepared-checkpoint completions. This is local progress accounting, not an anti-cheat system or a guarantee against loss during an abrupt browser/process crash.

Credits lead to an optional automated review notice: delivery failed, account closed, the player already on the road. It has no forced delay or audio shock. Back/skip/Escape/controller B or Start return safely. Opening these screens never advances the encounter or reverses completion.

## Artwork

Built-in image generation edited the existing inspected road ending into a sibling evidence variant. Source: `assets/cutscenes/final-cut-ending/road-evidence-ending-v1.png`; runtime: `web/assets/optimized/final-cut-road-evidence-ending-v1.png`. The copies are byte-identical, 1672×941. Exact prompt and inspection: `assets/cutscenes/final-cut-ending/prompt-evidence-v1.md`.

The new wallet, notebook and diagram pages sit beside the lanyard on the public-road side. The full fence, empty stands, flooded course, disabled rig and small nonthreatening Joe remain. The image contains no readable captions; all narrative text is native HTML.

## Evidence

- `node tools/verify-final-cut-outcome.mjs` passes eight rule groups. Includes 96 route/evidence combinations and save round trips; distinct crew-log bits; legacy migration; coexistence of imported/local records; actual capture/throw/next-pass selection; uninterrupted ordinary-input pilot mastery; checkpoint exclusion; idempotent career merges; malformed records and denied storage.
- `node tools/verify-final-cut-outcome-browser.cjs` passes. Uses explicit won-machine fixtures, then actual E at the road interaction to enter the result. Tests survival-only/crew/drain variants, decoding the right image, real HTML controls, keyboard Tab/Enter/Escape, injected controller A/D-pad/B/Start, real portrait touch taps, completed reload, fresh replay, immediate post-throw reload, malformed mastery and denied storage. This is result integration coverage, not a full campaign playthrough.
- Screenshots and DOM geometry inspected at **2560×1600, 1280×720, 844×390 and 390×844**. Art keeps its aspect ratio; text has no horizontal overflow. Short screens scroll vertically. Reviewed result top, record/action region, credits, notice and expanded mastery. Both initial background problem and final opaque-background correction are documented by the rerun artifacts.
- Installed standard web-game client rerun after final presentation changes: `output/final-cut/outcome/client-final/shot-0.png` and `state-0.json`. Inspected the actual screenshot and playing-state output; no error artifact. This short input burst confirms normal entry/movement, not dramatic pacing.
- Regressions pass: `verify-final-cut.mjs` (13 groups, seven ordinary-input simulation pilots), `verify-final-cut-ending.mjs` (30/60/120 Hz catastrophe/boundary rules), `verify-final-cut-controls.cjs`, `verify-final-cut-browser.cjs`, `verify-final-cut-transition.cjs`.
- `node tools/verify-release.mjs` passes: 70 referenced runtime images, 34.16 MB, no missing/unreferenced images, no source masters shipped, 90 action scenarios, no warnings/failures at this check.

Artifacts: `output/final-cut/outcome/rules.json`, `browser.json`, named screenshots and client directories. Controller tests inject the Gamepad API; touch tests use Chromium touch dispatch. Neither proves comfort on physical devices.

## Remaining chapter work

The outcome is now implemented and technically verified, but the encounter still needs distinct physical entrances, full overview/dogleg composition, authored crossing decisions, Joe’s relocation and animation polish, golf-ball aiming/supply, finished art/audio, meaningful replay schedules and full lifecycle/device campaign runs. Software-renderer performance remains unresolved; see the ending QA. Unfamiliar-player comprehension, suspense, terror, relief and replay appeal remain untested. Do not replace those requirements with these automated checks.
