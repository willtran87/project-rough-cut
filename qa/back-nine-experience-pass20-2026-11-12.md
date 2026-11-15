# Back Nine pass 20 — survival audio and geometry experiment disposition

The preceding goal turn restated the list and made no implementation progress. This pass resumed the full 38-item objective, recovered the completed geometry experiments, rejected them as a standalone performance fix, and implemented sound/caption consistency improvements. The goal remains active. Human tests remain prepared for later.

## Retained game changes

- New `chase-machine-sound.js` supplies one camera-relative placement/range calculation to the mower audio and optional sound descriptions. Looking back reverses the indicated side for both cart and runner. A wide central band intentionally names neither front/back nor a precise bearing: ordinary stereo does not convey those distinctions reliably.
- Removed captions that inferred left/right from Joe's planned world-space detour. Descriptions now follow the actual source and rendered engine state. Hidden search phases cannot disclose intentions: the same physical speed/position produces the same caption while approaching, listening, sweeping or departing.
- Added optional descriptions of the continuing mower sound, including coarse distance and muffling beyond cover. Hush/rev/commit descriptions remain, and the reveal correctly describes a low rumble followed by rising engine sound rather than claiming complete silence. Normal gameplay banners remain quiet; sound descriptions stay independently optional and remain available when sound is muted.
- Fixed blade gain bypassing distance attenuation during surge/recent-impact emphasis. Close emphasis remains exact within35m, fades smoothly beyond35m, and reaches zero at the existing70m engine range. No new sound source, light, shader, geometry or audio graph node. Placement reuses the existing audio state object; caption calculation is skipped when descriptions are disabled.
- Updated Back Nine audio/message import aliases so returning browsers receive this change. Movement, attack timing, health, pathing, collisions and render geometry are untouched.

## Verification

Artifacts: `output/back-nine-experience/survival-audio/`.

- `node tools/verify-chase-machine-sound.mjs`:32 direction combinations across cart/foot, four headings, left/right and rear glance. Verified quiet defaults, no front/back or hidden-search disclosure, windup/reveal descriptions, range, objective/impact/bell priority and inactive modes.
- `node tools/verify-chase-machine-audio.cjs`:32 real OfflineAudioContext render cases. Stereo channel energy agrees with caption side; sound attenuates with distance; cover lowers level and upper harmonics without erasing the source; windup energy increases; pause/mute are silent. Repeated update/retry calls retain12voices and the startup allocation counts.
- At12m under identical surge/impact state, old/new RMS is exactly0.010934605465305258. At50m it changes0.00627033→0.00453283. At70m and90m the previous erroneous blade RMS0.00377465 becomes0. This is actual rendered sample energy, not a prediction from gain values. `previous-range-audio.js` records the old range formula for reproduction.
- `node tools/verify-chase-machine-browser.cjs` and `--software`: actual Q input reverses stereo/caption direction while leaving steering unchanged. Hardware/software cover, windup, pause, reduced motion, mute, settings and caption layouts pass at2560×1600,1280×720,844×390,390×844. Inspected high-resolution and compact screenshots. Hardware20/software25programs,40textures,1114buffer uploads,12voices; no late resource growth or browser errors.
- Existing `verify-quiet-messages.mjs`, `verify-chase-search-audio.cjs`, `verify-chase-search-browser.cjs`, `verify-chase-districts-browser.cjs`, `verify-runover-audio.cjs` and `verify-vehicle-impact-audio.cjs` pass. Actual hiding/relocation/reacquisition, a collision-free close pass, warning score ducking, run-over impact/landing, impact direction and pause/mute remain verified.
- Updated the old `verify-chase-audio-mix.cjs` fixture to present a foot contact in its measurement window; it previously expected footstep output from speed alone, which became obsolete with pass8's contact-driven footsteps. Its44mix cases and four direction cases pass without weakening the output assertions. The first browser run also exposed a test-only selector typo (`chase-mute` versus `chase-muted`); corrected and both renderer runs pass.
- Installed standard client ran through `verify-presented-client.mjs --back-nine --beacon-cover`, two driving/turning/braking bursts. Inspected both text states and page1: driving,100health, advancing along the wet range, default banner/sound rails empty,960×540canvas,25programs,40textures,12voices. No error artifacts.

These are technical and visual checks. They do not establish headphone/speaker recognition, dramatic impact, comfort or human balance; those remain prepared playtest questions.

## Geometry experiments: not shipped

Authoritative process inventory showed no remaining rider-geometry build/benchmark process. Four-view reports had finished in `output/back-nine-experience/actor-geometry/`. No generated model/index asset is referenced by the live game.

The offline meshoptimizer experiment preserves source vertex attributes and skinning and changes index buffers only. Source model18,970triangles, nine materials,17bones. The final cache-only variant leaves Face/Hair/Skin/Seam index order intact. Its32 captures still total three changed pixels in the foliage view; strict exact-image acceptance fails. Median original→candidate: close82.1→80.6ms,wet70.9→69.9ms,foliage82.9→82.0ms,clubhouse72→72ms; p95mixed. This is not a demonstrated frame-spike fix.

The earlier distant candidate reduced triangles18,970→14,976 while retaining original face/hair/skin geometry, but reordered their index order in that earlier build. Paired96-frame medians: close68→67ms,wet46.3→45ms,foliage62.1→60.1ms,clubhouse55→53.3ms. Clubhouse p95regressed74.9→80ms and wet75.5→76ms. Close/foliage captures changed416/1434pixels summed over eight frames. There was no deployed distance switch, projected-size acceptance or startup validation. The current indices manifest is the later protected-order build; do not mislabel it as the exact earlier distant candidate. `cache-proof.json` also predates protected-order changes.

Both experiments are rejected as standalone improvements and remain offline diagnostics. Absolute timing differs substantially between runs; use paired comparisons, not cross-run claims. No GPU or startup improvement is claimed. Do not repeatedly rerun these transformations without new evidence or a different hypothesis.

## Remaining scope

Survival audio/caption integration (#29) has substantially stronger technical coverage; broader natural full-run recognition and environmental-source acceptance remain. Performance (#1), beacon/shadow cost (#26–27), cold startup/retries (#35), full-course route/lighting/motion acceptance and optional-omen variety/frequency remain open with the rest of the ledger. Preserve the original38requirements. Next work should include broader route/landmark/darkness composition and omen/retry acceptance, alongside a new evidence-based rendering investigation. All owned test handles were observed terminal; the local server is retained.
