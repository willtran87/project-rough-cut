# Encounter experience pass — 2026-11-08

Follow-up: [timing and feedback refinements](encounter-followup-2026-11-08.md) replace the timer's silent waiting/jam behavior with a fixed fuse and ringing window, and refine aftermath scheduling.

The approved ideas are implemented as additions to the existing objective, perception, pacing and escape systems. No new mandatory checklist, teleported pursuer, control binding or collision gate was added.

## Player changes

- **Objective identity:** the bell still summons an inspection, the log retains quiet/fast filing, and release can exploit a distant distraction. Each completed check now queues its own delayed environmental reply: a second bell, turning paper/repeated stamp, or closing release desk. Replies wait for safe distance, free presentation and the shared accent budget; they expire rather than interrupt a pursuit or committed interaction.
- **Contrast and false alarms:** these replies do not manufacture Joe radar contacts, move him or escalate detection. Each is followed by a short cosmetic recovery window. Existing warning/approach/confrontation/recovery pacing remains authoritative.
- **Counterplay:** optional winding timers beside the maze service cart and release cart. Use the normal interaction control, then leave during the four-second fuse. Joe investigates the six-second bell through his existing navigation and inspection logic. Each mechanism is one-use; it waits for conflicting pursuit, lures or protected actions to clear, and refunds itself after eight seconds of conflict. A sufficiently distant active cart timer can also enable quiet release signing.
- **Ghost readability:** watchers tilt their heads, stalkers stoop and rushers lower their chins during notice. Existing varied rhythms, fixed rush destinations, sidestep/cover counterplay, gaze responses, safe clearance and comfort gates remain. A field note explains these observations.
- **Environmental memory:** leaving completed checks reveals persistent black impressions, discarded stamped paperwork and disturbed ground at the original station. Objective locations and routes remain fixed.
- **Shelter:** crouching still behind hard cover with no nearby contact earns a seven-second breathing window and an expiry warning. Limited to three distinct shelters per run, once per shelter; ordinary perception and pursuit keep working. Existing repeated-cover audits remain.
- **Finale:** track breakaway, approach and filing; show the prepared route when presentation permits. The physical exit beacon follows a prepared drain choice instead of always marking the shed. Existing filing duration, movement cancellation, seal protection and retry behavior remain.
- **Feedback:** successful close escapes receive one confirmation after safe disengagement. A capture beside a ringing timer explains that the player should use the fuse to leave. Quiet timer-assisted runs receive a distinct result description. Existing specific capture reviews and immediate retry flow remain.

## Implementation limits

The aftermath is deliberately optional. Fast runs or continuous danger may finish before an audio reply is safe; the physical traces still appear after leaving. Safe shelter does not grant invulnerability. These are additions to the existing finale, not an unavoidable scripted last chase.

The two mechanisms and three traces reuse the original-features instanced draw and its 112/176 software/hardware instance caps. A single generated 64×64 nearest-filtered finish adds 16 KiB of base texture pixels, with no mipmaps or external asset download. Face shading uses vertex colors. No new point lights, navigation searches, postprocessing passes or continuous audio voices. Timer geometry is outside existing cart hulls; winding approaches are checked for clearance.

## Verification

- `verify-encounter-experience.cjs`: hardware and software pass actual E winding for both timers, delayed ringing, ordinary inspection, existing-lure/chase priority, refund, objective deduplication, protected aftermaths, persistent traces, shelter expiry/reuse, prepared-drain finale, quiet release, filing retry, pause/resume, one-shot close-call feedback and specific capture review. No browser errors.
- New prop and paperwork screenshots inspected at 2560×1600; ordinary desktop 1280×720 and landscape mobile 844×390 also captured. An initial fixture view inside a hedge was corrected before final verification.
- `verify-win-objectives.cjs`: all three variants × both exits pass, with zero balls, quiet/loud log alternatives and filing cancellation/retry. These tests reposition actors to isolate gates.
- `play-complete-route.cjs`: successful Standard Review shed and drain runs using ordinary movement/actions, normal pursuit intensity and live Joe; no lures or bonus requirements. The runner now waits for real asynchronous preparation before opening route help. These are automated runs, not human playtests.
- Existing tension-director checks, 22 original-feature scenarios, ghost behavior/rhythm/gaze tests and release validation pass. Release inventory remains 56 runtime images / 20.8 MB with 90 action scenarios.
- Installed normal input client reaches gameplay and travels 14 units without an error artifact; screenshot/state inspected.

Outputs: `output/encounter-experience-20261108/`; existing director/original-feature scripts retain their own dated output directories. The new renderer fixture reports 63/176 hardware and 32/112 software visible marks, both with two original-feature draw calls. These snapshots establish bounded rendering, not a frame-rate improvement. Existing software foliage/pond slowdowns and cold-start limits are not declared resolved.

Human testing remains prepared for later at the user's request. Suspense, usefulness of the timers, ghost recognition and voluntary replay still need player feedback.
