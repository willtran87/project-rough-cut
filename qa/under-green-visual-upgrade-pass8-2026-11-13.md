# Under the Green visual upgrade — fixed practical lighting

All 53 items and seven release gates remain in scope. This pass advances V25, V28 and V32. Hardware visual correctness is verified below; software frame pacing remains an explicit unfinished performance requirement.

## Implementation

Replaced the viewer-dependent two-nearest-lamp policy with all 17 fixed world practicals. Each lamp retains its authored location, color, power and independent slow flicker. Moving the player, looking behind or turning the camera no longer changes which fixtures illuminate a surface. The distant keeper workspace now has a real pool of warm illumination before the player enters it.

Static material variants receive only sources whose finite reach intersects the entire world-space mesh bound. Moving, skinned, instanced and morphing objects retain the complete source set, avoiding stale-bound errors. The inactive-signal and sluice-witness material bank is included even when its material is not assigned during construction. Existing texture/shading hooks are preserved; the reference test caught and resolved an initially omitted inactive signal material.

The shader uses Three's existing point-light equations and material response. It does not approximate the selected sources or turn them into emissive surfaces. Lamp uniforms are transformed into camera space each frame while their world positions and strengths remain independent of the viewer. Shared original material references preserve ghost opacity and other live effects. Static clones synchronize opacity/color before rendering so flood transparency follows the existing physical depth.

Scenery batches now use 12 m horizontal cells centered around the main corridor, with the existing 24 m longitudinal strips. An initial 12×12 grid raised gallery draw calls to over 560; the centered layout reduces unnecessary corridor splits. Wet floor patches, flood planes and wall films are partitioned locally without changing their authored vertices, UVs, physical depth or opacity. Flood bounds include 0.40 m of travel; channel bounds include 0.10 m for their rise and shader displacement. No colliders, navigation, input, pursuit, attack timing or water simulation were changed.

An attempted per-fragment distance branch was slower on SwiftShader and was removed. Earlier profiles and the rejected source remain in this pass's evidence; they are not production behavior.

## Verification

- Independent reference: the optimized practical shader is disabled and all 17 ordinary Three PointLights are installed at the same positions/colors/intensities. Gallery, bunker, pump, distant/close keeper and high flood are compared at the same camera/time. Final hardware comparison is pixel-exact across all six fixtures at 960×600. Software results are appended after its final run. This proves the local source exclusion in these views; it does not prove shadow occlusion or all-location art acceptance.
- Camera independence: all 17 world-source records remain identical when moving between districts and rotating the camera at a fixed time.
- Screenshots: native hardware2560×1600, plus1280×720,390×844 and844×390. Software high-viewport captures actually render at960×600. Gallery, keeper approach/flood and Joe/ghost screenshots were inspected. Broad material/light distinction is retained; signs remain too clean and spray can still read as bright blue streaks. Those existing art gaps remain open.
- Geometry partition check: all288 ordered test triangles retain identical position, normal and UV data across20groups. Actual flood/wall-film envelopes contain4,549,388 transformed vertex samples over1,201times spanning two flood cycles. Disposal returns the isolated scene to zero objects.
- Existing water contract passes173,304state comparisons,23,120Joe wait decisions and23invalid-authoring rejections.
- Actor/scythe browser regression passes7views, actual actor geometry clearance, attached hands, moving ghosts, scythe windup audio, panic bob, pause and Reduced Motion. The old harness initially left the new chapter intro active while forcing gameplay state, so W was consumed by the intro. It now explicitly skips the intro before gameplay checks; no game input change was made.

## Performance evidence and remaining limitation

Profiling waits for GPU fences, rather than treating JavaScript submission time as completed rendering. Each view has8warmup frames and32samples. The final hardware pass at native2560×1600 reports p95 values of13.0ms gallery,14.1ms bunker,11.0ms pump,9.0ms distant keeper,10.1ms close keeper and14.0ms keeper flood. These isolated stationary fixtures are not a full gameplay/device performance gate.

The previous two-light software policy measured roughly100/87/38/78/37ms median at a common960×600 target in gallery/bunker/pump/distant keeper/close keeper. New all-practical software profiles are slower. The first ordinary-frame check also failed the desired30fps pacing after adaptive resolution; its report explicitly separates functional frame advancement/pause from `performanceAccepted:false`. Final centered-grid/software/live results are appended below. This limitation must be resolved before the performance release gate is accepted; do not describe software pacing as complete.

Next performance work should profile moving instanced water/effect shaders with all17sources and renderer/material overhead, then reduce work while preserving the fixed light fields. Do not return to viewer-selected lamps merely to obtain a favorable timing. Additional static contact shade, selective Joe/scythe shadows, localized haze, district lighting/art polish, actor materials, sign/UI cohesion and matched Level1 acceptance remain unfinished.

Artifacts: `output/under-green/visual-upgrade/practicals` and `pass8-source`. They remain accessible through the project junction to I:. This pass does not move or remove additional artifacts. The final installed-client result and final software verification are recorded after completion below.

Final centered-batch software run: all six fixtures pass reference comparison (four exact; distant/close keeper each differ by one channel value of1 across2,304,000channels). All17source records are camera-independent. Reduced Motion checks5,004actual renderer light-uniform samples with zero color/position error and steady values across time. Zero browser errors.

Final software960x600 medians/p95 (ms): gallery 188/230.1, bunker 133.1/139, pump 51.1/55, keeper-distant 114/126, keeper-close 51/54, keeper-flood 123.9/126. These timings are provisional: another Final Cut Playwright process (PID56636) was authoritatively confirmed live at completion. Baseline/candidate software timing differences cannot be attributed solely to this lighting change without an isolated repeat. The earlier normal-frame live report still records below-target delivery and performanceAccepted:false; do not dismiss that evidence or accept the performance gate.

The live verifier now allows24seconds of warmup before its3second observation, rather than12, so the full adaptive cooldown can settle; that revised live check awaits an isolated rerun. Final functional client is pending at this entry.

Isolated follow-up after the other process exited: a uniform-count loop reduced gallery startup from4.8s to4.0s but increased median completed960x600 frame time from130.1ms to151.9ms (p95 137 versus155ms). Both matched reference pixels. Rejected that candidate and restored the exact fixed-count implementation used by the full six-view hardware/software reports. Candidate source/report retained separately. This confirms remaining software cost even without the overlapping workload.

First installed-client attempt exited0 but remained in the intro after its initial5second Preparing-button timeout; it was not accepted as gameplay evidence. The final retry uses five input bursts to cover both startup and all intro slides before checking movement.

Final installed client23973 exited0 and completed the intro into under_green_playing at(0,16.52), actual960x540, all17worldsources active. Final shot4/state4 inspected; no browser error artifact. Runtime snapshots match all six current files.

Recovered final ordinary-frame run59693: terminal report passes advancement/pause and zero browser errors, including actual high flood depth0.38. Gallery22frames/3069ms and keeper35frames/3060ms at480x300; completion p95 243.5ms and97.7ms. Performance acceptance remains false. No verifier process remained live on reinspection.
