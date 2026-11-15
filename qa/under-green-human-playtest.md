# Under the Green — unfamiliar-player session guide

This is a procedure, not a record of completed human sessions. Review items 42 and 43 require observations from people who have not learned the route from the source or automated pilots.

## Run a session

1. With the local web server running, open `http://127.0.0.1:4187/under-green.html?playtest`. The query enables a page-local recorder. Normal chapter entry has neither this report UI nor automatic telemetry.
2. Use a fresh browser profile for an unfamiliar player's first attempt so prior saves, learned coaching and remaps do not contaminate the session. Let the player choose comfortable settings. Record the real input hardware, viewport and audio output in the optional observations field; a small desktop window does not count as a phone test.
3. Give only the objective: reach the keeper's room and seal the sluice. Let the existing briefing and protected crossing teach the rules. Do not explain the optimal route, phase timing or Joe's shortcuts beforehand.
4. Observe play through mistakes and retries. In Pause or the result panel, open **Local playtest report** and choose **Unfamiliar player**. Ask the questions below without supplying an answer. Fields are optional, accept multiline text and do not control the game while typing. The game remains paused while the player or observer writes.
5. Select **Download local report** before leaving, reloading or continuing to another chapter. Save separate files for separate people. Only the latest 12 attempts remain in memory, with discarded counts reported. Reload clears the recording and notes; it does not erase the chapter save. No report is uploaded or automatically saved to browser storage.

Keyboard, pointer and the shared controller menu can navigate the report and activate export. Written observations require a text-input method; they are not required to export. Use **Returning player** for someone familiar with the route and **Automated check** for scripts or staged debug fixtures. The selected classification is self-reported, not independently verified.

## Observe and ask

| Moment | Observation to record | Neutral follow-up |
| --- | --- | --- |
| Protected crossing | Notice of outlet signal, first chosen action, understanding after a mistake | “How would you describe the water rule?” |
| Joe's entrance | Whether arrival is noticed; which visual or sound caused the reaction | “What changed here?” |
| Spillway / bunker | Whether both routes are noticed; the selected route and its consequence | “What made you choose that route?” |
| Joe's attack | Notice of preparation, attempted evasion and perceived cause of defeat | “What happened, and what would you try next?” |
| Pump | Understanding before activation and recognition of the resulting change | “What did that control do?” |
| Alternating range | Reassessment on the landing, readable next destination, useful recovery after a missed window | “What were you watching while deciding when to go?” |
| Keeper room / aftermath | Whether closure requirements are understood and safety feels established | “When did you feel safe?” |

Let the player describe uncertainty before helping. If assistance is necessary, record exactly what was supplied and when. Keep first attempts separate from assisted/repeat attempts. Ask about comfort, text readability and sound intelligibility after play rather than interrupting every encounter.

## Interpret the export

- `attempts` retain independent retry/restart histories, starting and ending durable progress, actual failure context, active elapsed time, observed input methods and authoritative events. Archived attempts do not change when a subsequent run changes.
- `crossings` contain arrival phases, observed wet/dry/mixed/undecided travel, duration, stationary time, minimum geometric separation and water hits. `partial` means recording began within an encounter or away from its entrance; `finished: false` is an incomplete encounter, not a completed route time. Wet/dry visits describe where the player traveled, not what they intended.
- `secondsSinceCheckpoint` measures active recorded play since the latest observed checkpoint. Use it on a caught attempt to estimate replay cost. It excludes paused time and is not total wall-clock session length.
- Attack `stateEntries` count observed preparation/sweep/recovery transitions. `outcomes` and events identify actual capture, solid-cover blade blocks and secured escape. Recovery counts alone do not prove deliberate evasion.
- The telemetry and event lists are bounded; consult dropped counts. The final export context describes settings and viewport at download, not a complete history of every setting change. Input methods include observed device modes and do not certify physical hardware use.
- Proximity does not establish perceived fear; stationary time does not establish confusion; successful completion does not establish fun. Pair the measured record with the player's explanation and the observer's notes.

## Use the results

Start with a small set of unfamiliar players across the input methods actually available. Keep mouse, physical controller and physical touch observations distinguishable. Do not invent a required completion time or force equal wet/dry choices. Look for repeated missed cues, misunderstood failures, dominant routes, unnecessary replay and places where Joe stops influencing decisions.

For each proposed revision, retain the observed problem, relevant attempt/crossing, intended player benefit and a follow-up check. Resolve repeated comprehension/fairness failures before adding route length or spectacle. Track unavailable listening, device and unfamiliar-player evidence as pending. This guide and automated export tests do not close item 42.
