# Level 1 first impressions and opening PA

Part of the full Level 1 experience goal; the full checklist remains incomplete.

## Delivered

- An actually observed distant Joe pauses once for 2.6 seconds to tend his patch. Existing perception continues; genuine sight, hearing or other actionable evidence interrupts the work. It requires a clear sustained view at an appropriate distance, never turns the camera, and never gives Joe player knowledge.
- An optional tee discovery lifts a golf ball above its planted shadow. It shares the suspense budget, avoids Joe's first sighting, yields permanently to aiming/interactions/danger, respects apparitions preference, and has a static fading Reduced Motion version. No inventory, collider, route or AI effects.
- The gate latch is followed by an actual packaged PA voice: “The course is now secured.” It is synthesized using the installed Microsoft David Desktop voice and filtered for a small speaker. Source/build provenance is in assets/audio/course-announcement/README.md. Runtime Opus is 13,745 bytes and decodes to 2.514 seconds.
- PA spatial mix uses the gate and current view; existing Effects volume applies. Pause/mute stop it; timely resume follows the simulation offset. A late load cannot start mid-sentence. Higher priority danger and actions cancel it. Opening phone stows when the first Joe sighting begins.

## Evidence

- tools/verify-first-impression.mjs: sustained view, one-shot work, true evidence interrupt, pause, eligibility, anomaly lifetime/yield/comfort, and ghost scheduling exclusions.
- tools/verify-first-impression.cjs, output/first-impression/report.json: real W approach causes work; approaching sprint interrupts via ordinary perception; pause freezes; no camera takeover. Anomaly fixture checks visible rise/shadow, unchanged inventory/AI/view, priority and resource reuse. 67 prepared programs and 98 textures, unchanged on first appearances.
- Anomaly captures at 2560x1600, 1280x720, 844x390 and 390x844. The small pale ball is discoverable, not a mandatory route signal. This does not establish human discovery rate.
- tools/verify-course-announcement.mjs: lifecycle, pause/mute/resume, priority, late/failed load and disposal. Browser audio check decodes actual Opus and renders stereo offline: nearer channel RMS .01628 vs .00391, peak .22824, silent tail. Real-time playback starts once with zero resumes/seeks. Accelerated manual-clock tests may seek to follow virtual time; those are not listening evidence.
- tools/verify-course-arrival.cjs: actual user-gesture audio initialization, decoded playback, mute/unmute/pause, existing gate/phone/retry checks. Manual harness services one paused frame before checking source shutdown.
- Existing encounter-refinement and ghost-scheduling checks pass. Release verifier passes 90 scenario definitions and 67 image references; not human runs.
- Standard installed client via verify-presented-client completed four iterations in output/first-impression/standard-client. Latest gameplay frame/state inspected, renderer ready and no error artifacts.

No human listening, fear/fun, first-time comprehension or sustained-device performance acceptance claimed. Remaining opening composition/lesson/retry audit, zone staging, dramatic pacing and every other unchecked ledger item remain in scope.
