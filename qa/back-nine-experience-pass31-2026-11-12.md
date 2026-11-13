# Back Nine pass31 — shared repair/alarm reserve

Previous goal turn: no progress (status count only). This pass resumed the unfinished implementation, recovered the authoritative software test result and the terminal full-route report, fixed a natural-play eligibility defect, and finished technical acceptance for item13. The full38-item goal remains active. Human tests remain prepared for later.

## Gameplay and presentation

Both shelters offer a mutually exclusive reserve: the existing central bay transfers up to25HP over3.5s; the left bell pad spends the same reserve on a seven-second service alarm. Partial actual repair commits the choice; holding at full health does not. Bell selection requires speed below0.7, a release and a fresh0.85s hold. Merely braking into the shelter cannot consume it. Choices persist across checkpoint retry and reload, without replaying an alarm; fresh rounds reset them. Both cart and runner can operate the pad.

The pad is at(-1.9,298) or(-1.9,578), toward the shelter entrance. Matching battery/bell floor symbols, selector feed lights, wired perimeter bells and charger meters use existing pixel materials/static batches. Joe approaches physically reachable points(30,310) or(-30,570); no walls, collision hulls, navigation edges or actor teleports were added. Reduced motion stops the new bell swing. The existing audio alarm voice provides real camera-relative stereo, range, mute/pause behavior and optional sound descriptions. No additional audio voices, shaders, textures or point lights.

The alarm waits out checkpoint/ejection protection and existing committed maneuvers/earned relief before spending its useful duration. Selection rejects an attack/retreat/interception in progress and another active alarm. Joe must be within90m of the physical bell. Immediate danger within6m rejects selection and ends a running diversion if the player approaches. No health damage, healing, speed boost, invulnerability or shortened retreat is added by the alarm itself.

## Defect found with a full ordinary approach

The initial minimum gap18m, then12m, conflicted with normal checkpoint following at approximately11m. Staged tests with Joe56m behind passed, but full normal-input runs could never choose the alarm. The second failed run completed on foot with neither choice used; it is retained in `output/back-nine-experience/utility-choice/full-route-usable/` rather than hidden.

The accepted6m immediate-danger threshold matches the existing attack approach boundary and leaves the normal protected stop usable. Dedicated30/60Hz tests reproduce the11m follower at both shelters. Committed attacks still reject selection. The route audit also now abandons an unavailable pad after a brief attempt instead of waiting indefinitely to be destroyed; this changes only the test driver, not the game.

A second issue hid the repair cost under a four-second checkpoint banner. The objective receives its first full second, then the local choice is shown while on the pad. Other mandatory warnings retain priority. Optional startup guidance explains the tradeoff without revealing the on-foot transition. The final import-map versions are `20261112-utility-choice-4`; duplicate service alias removed.

## Verified behavior

- `tools/verify-chase-utility.mjs`: nine grouped checks covering both mutually exclusive outcomes, cancellation, held approach brake, committed attacks, immediate danger, off-axis acoustic range, competing alarm, protected timing/pause, normal11m follower, cart/foot30/60Hz physical investigations, finite expiry, approach cancellation, stationary-runner death, restore/reset and remapped/priority captions.
- `tools/verify-chase-utility-browser.cjs` on hardware and SwiftShader: six views each at2560x1600,1280x720,844x390; real keyboard hold/partial selection, both stations, physical departure, repair alternative, on-foot use, actual reduced-motion setting, real Enter retry, persisted reload and fresh reset. Zero errors. Selected high-resolution, compact, on-foot and reduced-motion screenshots opened and reviewed.
- `tools/verify-chase-utility-audio.cjs`:12 real offline renders covering both bell positions, rear stereo reversal, foot, pause, mute and distance. No update allocations;12 voices.
- Full fresh normal-input route with first alarm:79.183s, both relays and garage completed,100% cart health, one alarm selected/expired. Second reserve was not consumed while Joe was outside range. Artifact `full-route-distance/hardware-0.json`.
- Full fresh normal-input route with first repair and second alarm:80.133s, both relays and garage completed,42% cart health. The second alarm selected at55.817s and activated at56.467s after checkpoint protection. Local tradeoff visible from54.967s. Artifact `full-route-second/hardware-0.json`. Same seeded course, but different driving decisions; these are not human balance results.
- Final full simulation regression:8 groups,12 full/checkpoint/branch drives complete with live Joe. Existing service, quiet message, dialogue-budget, encounter and seven route-choice checks also pass. Long on-foot charge and post-miss relief remain intact; navigation signature2693326411,4410 nodes.
- Installed standard client via `verify-presented-client.mjs --back-nine --service-choice`:two action bursts, final page/state inspected. Cart drives out at18mph with50% health, remaining repair[0,25], active alarm5.5s,12 voices. No error artifact. Evidence `client-final/`.

## Performance evidence and limits

The new dynamic art is four small meshes (two bells and two feed indicators); clappers batch with bells. Total prepared buffer uploads1114→1130. Hardware20/software25 programs,40 textures and12 voices remain unchanged through selection, departure and retry. No runtime upload growth.

Final alternating48-pair SwiftShader art comparison at960x540, forced physical beacon update, same four moving views:

| View | Median without / with new art(ms) | p95 without / with(ms) | First-frame draw calls |
|---|---|---|---|
| First approach |28.8 /27.8|32.1 /30.8|107 /108|
| First pad |32.7 /34.7|38.9 /49.3|108 /109|
| Range control |44.4 /44.2|48.1 /49.4|136 /136|
| Second pad |32.7 /32.7|37.4 /37.3|105 /107|

New visible geometry is312–324 triangles in shelter views,12 at the distant control. These are mixed costs, including a first-pad regression, not an optimization or proof that frame spikes are solved. Earlier comparisons also varied. Preserve this workload in item1; do not claim no added GPU cost or improved startup. The feature meets the bounded resource design, but whole-course performance acceptance remains open.

## Remaining work

Item13 has technical evidence for real choices, physical consequences, legible cost, both outcomes, retries and resource bounds. Its human tradeoff/readability/balance questions are added to the deferred playtest guide. Ledger now20 implemented,17 in progress,1 human-test package prepared. All38 requirements remain represented; software/cold spikes, whole-course pacing/route/lighting/audio acceptance and other listed partial items remain unfinished. No completion of the broad goal, deployment or commit is claimed. All owned test handles are terminal; server4187 retained.
