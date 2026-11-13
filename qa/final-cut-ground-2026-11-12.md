# Final Cut — planted ground footwork and raised surfaces

November 12, 2026. Implementation and sampled automated/visual evidence for FC08, FC50, FC58 and FC66. These requirements remain Partial; this is not release or human horror acceptance.

## Behavior delivered

- Simulation owns both fixed stance contacts and each swing's endpoints, age, duration, lift and order. Arrival and the nonlethal road coda use the same planner. Rendering, pause and reload do not advance it.
- Arrival accelerates and brakes over 0.5 seconds. The authoritative walk is 4.088006754 seconds; boarding begins after its existing turn. Saved arrival motionVersion 3 migrates older walk/climb/startup progress once. Ending motionVersion remains 2.
- Joe alternates feet, bounds planned travel at corners, waits for the weight transfer before accelerating, brakes at waypoints and turns gradually at the final fence. Raw mixer samples are retained before neutral-pose blending and IK, preserving fresh-reload determinism.
- Rendered ground slabs and actor surface queries share one layout while retaining static instancing. Boots account for the bay, turf, raised nursery paving and route slabs. The curved sole profile is extracted from the actual weighted neutral boot geometry by `tools/extract-final-cut-sole.cjs`; regenerate it when the Joe asset changes.
- At a height transition, the swing lifts before translating and lowers after clearing the edge. The maximum terrain height is sampled along the planned step. Flat-ground steps retain their normal arc.
- An eastbound wreck leaves Joe south of its wing. He now walks behind the power unit before joining the existing road route. The new egress index persists with current snapshots. Legacy recorded on-foot positions remain preserved; missing egress defaults to the existing road route.

## Evidence

| Check | Result |
| --- | --- |
| `verify-final-cut-ground.mjs` | Pass: 15 scenarios at 30/60/120Hz, covering arrival, early/late gate and low/high opposite wreck positions. Zero simulated planted drift, at least one support, bounded reach/lift, exact swing/speed/egress round trips, malformed record fallback and arrival migration. |
| `verify-final-cut-ground.cjs` | Pass: 1,586 rendered poses on D3D11 and another 1,586 on SwiftShader. Actual skin vertices are checked against independently read rendered slab transforms, with sampled full actor/rig intersections. |
| `verify-final-cut-ground.cjs --opposite-wreck` | Pass: 2,096 rendered poses, including the low-x opposite-heading detour. No sampled mechanical intersections; this check was expanded to the first 25 seconds near the wreck. |
| Ground lifecycle checks | Actual Escape pause, browser reload/resume, reduced-motion setting and screenshots at 2560×1600, 1280×720, 844×390 and 390×844 pass. A separate final lifecycle run restores the normal coda at 6.6 seconds, during the raised-edge step. |
| `verify-final-cut-transfer.cjs` | Pass: 322 boarding/dismount poses, zero sampled actor/mechanical intersections or support failures; maximum ankle target error 2.70e-7 m. |
| `verify-final-cut-transfer.mjs` | Pass: migration and 2,402 deterministic exit-support samples across both headings, plus exact shared ground handoff. |
| Transfer lifecycle | Pass: five all-bone phase boundaries below 5 mm, actual pause/reload/reduced-motion UI, four sizes and clock completion. Largest boundary change 3.259 mm. |
| `verify-final-cut-ending.mjs` | Pass: physical trap, protected victory, gate, late departure, checkpoint restoration and explicit finish. |
| Ordinary-input route | Pass after a completed-result fixture unlocks Replay: uninterrupted Gamepad API run earns crossings, pump, bell, physical trap and road finish in 137.249 simulated seconds, with zero captures, throws or page errors. |
| Installed web-game client | Two ordinary-input bursts pass; latest screenshot and state inspected. SwiftShader, playing at about 6.5 seconds, boarding underway, zero captures. |

Across the three full ground geometry runs, maximum ankle error is below 3.44e-7 m and planted rendered drift below 3.96e-7 m. Minimum sampled boot-to-surface clearance is 5.7695 mm; maximum planted gap is 5.7706 mm. Peak sampled foot speed is 6.867 m/s and knee speed 5.233 m/s. No console/page errors were recorded in the passing browser reports. These are correctness measurements, not frame-rate qualification.

Artifacts: `output/final-cut/ground/rules.json`, `hardware`, `software`, `hardware/opposite-wreck`, `hardware/lifecycle-only`, `route`, and `client-final`; transfer evidence remains under `output/final-cut/transfer`. Desktop, compact landscape and portrait screenshots were opened and inspected. The opposite-wreck diagnostic camera passes through foreground rough in some captures; geometry checks and unobstructed normal-route views provide the contact evidence.

## Failures found and corrected

1. The root could outrun a trailing foot, producing a deep crouch. Alternating supports, capped travel/heading, early acceleration steps and corner weight transfer fixed the reach failure.
2. Different neutral poses caused an elbow jump at boarding. An immutable shared standing pose and smaller idle adjustment lifts removed the discontinuity.
3. Three's unchanged-property optimization exposed a reload mismatch after removing the raw mixer cache. Restoring that cache made the same saved pose deterministic.
4. Final visual review exposed the raised bay and nursery paving. A rectangular footprint then falsely supported a toe just before its actual geometry reached an edge. The extracted curved profile fixed floating; staged lift/translation fixed the subsequent swing-edge intersection.
5. Opposite-heading ground checks exposed Joe walking through the disabled wing. A saved detour behind the power unit clears the sampled geometry.
6. The ordinary-input pilot still assumed per-axis deadzone compensation after a concurrent shared radial-input change. It now supplies unit direction vectors; production shared input changes were preserved.

## Remaining limits and next work

- Vertex/triangle samples and sampled step planning are not continuous collision or biomechanical proofs. Arbitrary wreck positions, old mid-walk saves and all possible frame intervals are not exhaustively covered.
- Ground geometry reuse does not change the player's existing surface/collision contract. Water-surface foot effects, foot roll, suspension, fingers, tread attachment detail and expressive upper-body acting still need polish.
- Full earlier-chapter ordinary-input playthroughs, physical devices, target-device frame budgets, human listening and unfamiliar-player fun/fear/comprehension are not certified here.
- Continue the 72-item goal with dramatic staging, landmark composition, machinery detail, audio/lifecycle/performance and the prepared human acceptance work. Do not mark the whole goal complete from this motion pass.
