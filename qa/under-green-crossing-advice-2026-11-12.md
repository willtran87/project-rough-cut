# Under the Green — executable crossing advice

Review 5 and part of review 41 now have a wider simulation check in `tools/verify-under-green-crossing-advice.mjs`.

The test samples every periodic channel at quarter-second cycle intervals, all event-controlled channel states, both banks, approach clearances of 0.6/1.8/3.2 metres, and walk/sprint/crouch speeds. It asks the production advice function whether a crossing is available, waits 250 ms of the declared 350 ms reaction reserve, then commits through the actual fixed-step simulation at the advertised speed. There is no teleport, invulnerability, forced water phase, hidden sprint or path solver during the crossing.

Of 5,274 enumerated combinations, 4,698 are valid isolated approaches. Of these, 1,158 advertise CROSS or APPROACH; all reach far-bank body clearance without water hits or solid overlap. Every one of the eight channel definitions has exercised usable states. The report includes WAIT cases without pretending they prove a safe wait under pursuit.

The remaining 576 combinations cross another outlet in the approach segment. They are recorded as excluded multi-channel scenarios, not counted as passing tests. Range A/B and keeper combinations need sequence-level testing. No obstructed centered segment was silently accepted.

Joe is deliberately held before his entrance to isolate the advice/movement contract. This does **not** close review 41's phase × speed × legitimate Joe-distance requirement, prove first-mistake recovery near a blade, or establish human comprehension. Lateral approaches, stance changes after commitment, multi-channel paths and live pursuit envelopes remain separate work.

Evidence: `output/under-green/crossing-advice/verified.json`. Reproduce with `node tools/verify-under-green-crossing-advice.mjs`.
