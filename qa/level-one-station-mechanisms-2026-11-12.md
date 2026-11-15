# Level 1 physical station actions and completion

Part of the complete Level 1 experience goal. Remaining scope stays in design/level-one-experience-plan-2026-11-12.md.

## Delivered behavior

- The Field Log is a mounted stamping press with a fixed guide frame, supported paper, ruled form and persistent ink. Before this pass the floating stamp could descend through the counter; paper heights were inconsistent with its top. Quiet filing now physically presses over the existing 1.6-second hold. Movement cancellation returns the press without ink or credit. Successful loud filing begins in contact at the existing sound/action instant and rebounds; successful quiet filing rises more gently. No extra waiting or altered perception/reward rules.
- The Release Review now pulls its side-mounted lever over .48 seconds and feeds a small stamped receipt out of a housing. The receipt and lowered lever persist for the run. The handle was moved forward/outward after screenshots showed it hidden behind the form. The existing paper seal and completion lantern remain.
- Reduced Motion presents final results immediately and keeps the stamp still. Effects density does not remove meaningful completion. All animation derives from gameplay clocks, so Pause and repeated rendering cannot advance actions.
- Reusing a completed nearby, visible field station now confirms ALREADY FILED and the completed count. Legitimate interactions retain priority. Looking away does not disclose the completed station through generic Use feedback.
- Small-screen review exposed overlapping wrapped sound captions and instructions. The DOM HUD now places them in a content-sized vertical stack with a gap, with compact sizing based on the actual canvas container. Empty instructions collapse. This is a specific overlap fix, not completion of the entire HUD/device audit.

## Verification

- tools/verify-station-mechanisms.mjs passes clock bounds, quiet/loud contact/rebound, deterministic rendering, cancellation/rest, durable completion and Reduced Motion.
- tools/verify-station-mechanisms.cjs uses actual choice/Use/movement/Pause inputs in the real level. Checks quiet progress/cancel/success/no signal; loud contact/normal signal; lever travel/receipt/no repeated reward; completed Use feedback and visibility; persistent results after messages expire; reset and comfort. Checks rendered caption/context rectangles do not overlap whenever both appear. Final report: output/station-mechanisms/report.json, zero browser errors.
- Initial fixture sampled exactly 1.6 seconds and hit floating-point progress 1.5999999999999992; sample now crosses the completion frame at 1.634 seconds. Negative zero rotation and inexact decimal contact comparisons corrected in test assertions, not gameplay behavior.
- Inspected 2560x1600, 1280x720, 844x390 and 390x844. Close approach, partial quiet press, contact, filed log, ready/pulling/filed release, and portrait caption stack reviewed. Existing portrait letterboxing still makes world detail small; no claim that the complete mobile presentation is finished.
- tools/verify-encounter-refinement.cjs passes on final product source: actual bell action, quiet/loud log, valid/invalid lure-covered release, close escape/rearm/capture, urgent HUD, Joe poses, boundary motion and both exit filing/sealing wins.
- Prepared scene counts (67 shader programs, 97 textures in the controlled late-run fixture) do not increase through actions. Receipt uses five dynamic meshes and existing surface materials; support geometry joins existing static batches. No new lights, textures, audio files, frame-driven geometry, timers or gameplay blockers. This is lifecycle evidence, not a frame-rate improvement claim.
- Release verifier passes 90 scenario definitions and 68 image references, no warnings/failures. Its asset scan now includes all root HTML entry pages as well as JavaScript. It previously falsely reported the real Final Cut ending image as unused because that image is referenced directly by final-cut.html. No unrelated art was deleted or modified.
- Standard installed client via verify-presented-client completed two final post-UI iterations in output/station-mechanisms/standard-client-final. Latest page/state inspected: first_hole, renderer ready, 26 course units traveled, no error artifacts. SwiftShader adapted to 800x450; no performance improvement claim. All test handles terminal.

Remaining: full zone/pacing pass, other HUD/prompt/touch audits, sustained hardware/software performance, first-time comprehension and actual human fear/fun/listening acceptance. No publication or goal completion.
