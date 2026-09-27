# A-grade implementation and qualification status

Historical first-pass report. See [the subsequent closure pass](a-grade-closure-2026-09-26.md) for compressed assets, completed route strategies, oriented arches, state poses, readable compact menus and later verification. Measurements and open engineering items below describe the earlier build.

This pass improves the local vertical slice; it does **not** award every area an A. Some engineering work and the human/device acceptance gates remain open. Existing uncommitted work was preserved. No public deployment has been made by this pass.

## Player-visible changes in this pass

- Practical movement, look, distraction and cover coaching retires after demonstrated mastery. Mastery is saved; lessons can be replayed. Early movement/look owns the main instruction rather than competing with a practice-chip prompt.
- Standard, Calm and Fixed View presets support pointer, keyboard and controller. The look preview stays paused; fixed view disables preview rotation. Window focus loss releases input and pauses.
- Route Thread can be hidden. Listen, map, collision recovery, footing recovery and active check breakaways reveal the needed route again.
- Clear Scenery lifts ground separation and reduces fog opacity. Compact world labels use short names and omit duplicate distance/cover/route captions. The clipped chase label and outdated map instruction are corrected.
- Joe's view selection uses hysteresis. Small bearing changes no longer alternate direction frames; bob follows travel and stops when movement stops. Threat feedback distinguishes tracks, movement wake and sound.
- Local playtest export records exclusive phases, first actions, detection transitions, checks, access and outcome without uploading anything. Rehearsal does not alter saved mastery.
- Asset requests retry transient failures twice with bounded backoff. Permanent failures settle into existing art fallbacks and expose a reload notice on the menu.

## Every backlog item

“Implemented” below describes code or a delivered document, not completion of the area's human acceptance criteria. “Retained” describes existing functionality reviewed/tested during this work, not a newly added feature.

| ID | Implementation / remaining work |
| --- | --- |
| ART-01 | Visual specification delivered in `design/visual-direction-2026-09-26.md`, including four annotated reference views and hierarchy. Human art approval pending. |
| ART-02 | Eight zones × four headings captured at clear positions; alpha/anchors retain the previous processed atlases. Near side-facing hedge billboards remain visually heavy. Exhaustive prop approval remains open. |
| ART-03 | Existing zone landmarks and both exit silhouettes retained and reviewed. No new collider obstructs the exits. Human zone recognition remains unmeasured. |
| VIS-01 | Ground value separation, focused HUD, explicit threat causes and subordinate bonus treatment implemented/retained. Five-second object/lane recognition test pending. |
| VIS-02 | Ground lift and reduced fog in Clear Scenery implemented; prior foreground suppression retained. Physical cover footprints preserved. Hedge silhouette refinement remains open. |
| VIS-03 | Compact label shortening and caption suppression implemented; four viewports plus grayscale/protan/deutan opening checks reviewed. All-scene physical accessibility acceptance pending. |
| UI-01 | Ownership matrix documented; early movement/look instructions now own the primary line. Existing aim/chase/check/cover/filing priority retained. |
| UI-02 | Concrete control verbs and short threat/map labels improved. Broader first-exposure workplace terminology still needs the uncoached language study. |
| UI-03 | Four-size HUD, settings and enemy captures; controller presets, pointer page toggle and previous touch/filing tests pass. Physical input/menu and long-remapping review pending. |
| ANIM-01 | Directional walking and bob follow distance; stopped Joe holds a frame. Existing travel-driven effects/audio retained. Wheel rotation and complete all-view locomotion recording remain open. |
| ANIM-02 | View-selection hysteresis implemented and boundary oscillation tested. No new intermediate turn artwork claimed. |
| ANIM-03 | Existing front animation states and explicit threat labels retained. Side/rear state-specific posture artwork and blind recognition test remain open. |
| CTRL-01 | Device protocol delivered; no physical controller/phone/modest-laptop comfort study performed. |
| CTRL-02 | Focus loss fixed; cardinal movement, pointer lock, rear glance, synthetic stick disconnect and touch cancellation regressions available. Physical orientation/device matrix pending. |
| CTRL-03 | Three presets, keyboard 1/2/3, controller bumpers and paused preview implemented and tested; category reset retained. |
| LOOP-01 | Three permanent checks, one exit access and filing remain the required loop. HUD states progress and saved checks; uncoached comprehension still pending. |
| LOOP-02 | Retained and tested: Audit Bell retreat planning, quiet Field Log, remote-diversion Release Review. Prepared signals match advertised durations. |
| LOOP-03 | Run phase/transition evidence now available. Matrix failures and route backtracking are recorded; human travel/wait audit and tuning remain open. |
| LEARN-01 | Contextual practical lessons implemented. No mandatory extra tutorial gate; first-three-minute human test pending. |
| LEARN-02 | Successful actions retire and persist; replay via settings; previous missed-chip recovery retained. Rehearsal isolated from mastery. |
| LEARN-03 | Familiar control language improved; existing optional-practice/reward marking retained. Terminology comprehension pending. |
| NAV-01 | 63 collision-driven mandatory approaches and 36 shed completion cases pass. Full adversarial route matrix is a separate unresolved gate. |
| NAV-02 | Existing landmarks, short route direction and collision-specific recovery retained. Human landmark navigation pending. |
| NAV-03 | Recoverable Route Thread toggle implemented and tested through Listen and map inputs. |
| AI-01 | Detection causes exported and track/wake/sound feedback checked. Full causal encounter review remains open; export is a diagnostic, not proof of fair detection. |
| AI-02 | No global difficulty reduction. Failed encounters retained and test tactics corrected; all reviewed captures have not yet been qualified as fair. |
| AI-03 | Existing decisive-cause review and isolated rehearsal retained; career isolation tests pass. Human explanation/counterplay test pending. |
| PACE-01 | Exclusive exploring/threatened/chased/hidden/waiting/learning time and bounded transition events implemented. Ordinary-input route evidence recorded. |
| PACE-02 | Existing clean-break relief and prepared signal durations retained and tested. Further tuning awaits encounter/human evidence. |
| PACE-03 | Variants and station priority retained. Complete pacing review of every route remains open. |
| REWARD-01 | Existing risk/benefit previews, once-only reward application and filing discounts retained and tested. Human cost/benefit comprehension pending. |
| REWARD-02 | Existing check, clean-break, mastery and escape feedback retained. No new bespoke reward art/audio added in this pass. |
| REWARD-03 | Duplicate/retry reward regressions pass. Whether choices are worth the risk is unmeasured. |
| REPLAY-01 | Existing variant briefings/pickups/patrols retained. Alternate access/retreat tactics exercised; human tactical differentiation pending. |
| REPLAY-02 | Existing mastery stamps and alternate exits retained; no currency grind introduced. Human goal-selection study pending. |
| REPLAY-03 | Existing next challenge, quick retry, full-run option and compatible record comparisons retained; automated lifecycle tests pass. |
| QA-01 | 18-case ordinary-input matrix implemented and run; initial result 11/18. Follow-up successes and unresolved failures are preserved separately. Full exact-candidate pass remains required. |
| QA-02 | New mastery/presets/focus/malformed-storage tests and 20 retry/rehearsal sessions pass, alongside existing career/record/input/reward tests. Physical lifecycle matrix pending. |
| QA-03 | Local source/asset/readiness checks run. Public deployment identity and public-build smoke are pending release qualification. |
| PERF-01 | Named device categories and recording fields documented; actual target hardware and physical measurements pending. |
| PERF-02 | Existing render/cache optimization retained. Isolated free-look budget gate is run separately from concurrent browser tests; physical presentation/GC profiling pending. |
| PERF-03 | Cold loading at simulated 10 Mbps / 150 ms and bounded failure recovery pass; 20-session JS heap check passes its regression budget. Heap rises after warmup, so leak-free/resource-stability acceptance is not claimed. |
| FUN-01 | Anonymous uncoached study protocol and local diagnostics delivered; no actual participants tested. |
| FUN-02 | Fresh-cohort retest and frequency/severity triage template delivered; requires baseline observations. |
| FUN-03 | Returning-player protocol delivered; requires later real-player sessions. |

## Automated evidence and limits

Artifacts stay under `output/a-grade/`; they are local evidence, not committed production assets.

- `acceptance/verification.json`: eleven behavior/lifecycle/capture groups, no browser errors. Controller/touch checks use synthetic browser events. Touch look preview uses contact displacement and clears on cancellation; hidden-route prompts match the active device.
- `loading/verification.json`: transient retry and permanent fallback pass at a simulated 10 Mbps, 150 ms latency with cache disabled. First cold course readiness was approximately 58 seconds; this remains a meaningful startup cost, not an A-grade startup claim.
- `matrix/verification.json`: all 18 scenarios attempted, 11 initial successes. `rechecks/*/route.json` retains alternative tactics and failures rather than overwriting the baseline. Never merge different-source results into an “18/18 release candidate” claim.
- `route-evidence-summary.json`: 16 distinct scenarios have a successful input-driven escape across the pass. Eastern Exception / shed / Standard and Eastern Exception / drain / Relentless still lack successful runs. Earlier captures remain part of the evidence; these results do not establish that every capture is fair.
- The route player earns checks, pickups and filing through normal keyboard/mouse inputs. It uses read-only world/route diagnostics and accelerated simulation time, so its success does not prove newcomer comprehension or real-time player skill.
- Retained regressions: experience 11 groups including 63 approaches; next-experience 5; core loop 6; gameplay polish 12; exit preparation 7; shed clearance 36 victories.
- Official skill Playwright replay reached live gameplay and passed 57/57 readiness checks. Its screenshot was inspected. Readiness has a narrower scope than the new A-grade matrix.
- Static release verification: 51 runtime images, 65.54 MB, 90 action fixtures, no missing or unreferenced runtime images.

Final source SHA-256: `f34d3a3fcf2fb8aed99febd06ead6d6f2e53187944c5b7adf85942f7e3a2e189`. Per-run hashes are recorded by the route client. Earlier suite results predate the final input-prompt/menu-only corrections; the final feature, loading visual recheck, isolated render gate and official replay cover the respective changed behavior. The full 18-case matrix has not passed on this hash.

The final 20-session retained JS heap checkpoints were approximately 6.22, 6.71, 6.99 and 7.10 MB after forced GC. Backing storage stayed around 2.4 MB. This passes the conservative regression guard, but the increasing JS trend needs a longer warmed-up profile before claiming no sustained growth.

## Release decision

Keep the current work local until the ordinary-input matrix passes on one immutable candidate, remaining art/animation defects are addressed, and the required device/human evidence exists. Do not turn an implementation checklist into an A rating or publish the branch as fully qualified based only on the 57 readiness checks. The local test URL is `http://127.0.0.1:4187/`.
