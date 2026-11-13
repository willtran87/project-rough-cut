# Under the Green: keeper gate travel and structure

Scope: review 2, 14, 23, 24, 29, 41 and 44. This is a bounded structural/escape verification, not completion of the full 44-item brief or a claim of human experience validation.

## Findings and changes

The raised gate passed through an intact roof. The retained baseline reports 764 bar/crossbar-to-roof contacts across 41 closure fractions. An additional solid district header also crossed its travel path. These were separate from the already removed generic portal and roof-edge reveal.

The gate now has a cut roof slot, tall side guides, split headers, enclosed receiving pocket, cap and two lifting cables. Gate travel still follows `gateClearance`; cables remain attached to the moving crossbar and fixed overhead anchor. The original rigid panel pieces are merged into two material meshes. Housing pieces join the existing static material batches. No movement, enemy speed, gate timing, capture or completion rules changed.

The keeper's far-bank signal is supported from the room side of the hoist. An initial range-side placement failed crouched framing and a raised-trimmer clearance pose. Moving it behind the gate retained the established 2.5 m signal height and restored readability without a post in the walking route. The console conduit terminates in the pocket face, clear of the panel's travel volume.

The geometry audit now also checks occupied boxes against actual fixture triangles. A browser-only negative control reinstates the old conduit endpoint: regular point samples miss it, while the volume check detects the upper crossbar intersection. Production geometry is restored on disk throughout this negative test.

## Verification

- `node tools/verify-under-green-gate-housing.cjs`: final pass; 20 close views at 2560×1600, 1280×720, 844×390 and 390×844, plus a distant approach and four actual closure captures. Zero roof contacts; 46,746 point samples and 630 panel-volume checks across 21 fractions pass. Cable anchor/travel and two panel material draws asserted.
- The same browser test uses actual E and R inputs with live checkpoint Joe. Closure advances through quarter, half and three-quarter states; Escape freezes simulation and geometry, Resume continues, secured aftermath allows movement, then completion survives reload. Existing wrong-side, occupied-threshold, reopening, save and input-profile regressions pass in `verify-under-green-rules.mjs`.
- `verify-under-green-signal-framing.cjs`: 4,176 phase/stance/FOV/approach cases pass at all four sizes with actual browser touch layout enabled. 576 support-adjacent camera poses pass. The bracket is classified as housing-supported, not as a nonexistent floor post.
- `verify-under-green-camera.cjs`: 23,424 environment and 696 dynamic camera poses pass, zero errors. This run includes the final signal placement; the later conduit shortening only removes travel-slot geometry above the camera envelope.
- `verify-under-green-clearance-browser.cjs`: 12 Joe/tool poses, each inspecting 14,697 rendered vertices, pass including raised, half, low and closed gate poses. Hands remain within the established grip tolerance.
- `verify-under-green-overhead.mjs`: roof area decreases by exactly the covered portion of both openings, 9.88 m² total. The existing course shaft remains 5.28 m²; the gate adds 4.6 m². No overlapping roof panels or unintentional area removal.
- Installed `web_game_playwright_client.js`: two input iterations pass; final state is playing at 11.2 seconds, protected lesson crossed, zero water hits, no error artifact. Final screenshot and state inspected.

- `verify-under-green-structure.cjs`: 802 samples and 22 views pass; 48 retaining edges, five ordinary roof edges and one gate-owned edge. The opening dimensions live in layout data, shared by roof, signal and hoist consumers without a rendering dependency in signal-placement logic.
- `verify-under-green-moving-clearance.cjs`: terminal pass on three continuous routes. Dry: 1,378 frames / 103 mesh checks; wet: 1,408 / 109; checkpoint 3: 405 / 33. Total: 3,191 actor frames and 245 full geometry checks, zero intersections or browser errors. Maximum planted-foot reach error is below 0.000001 m; hand grip checks pass. This covers recorded continuous simulation routes rendered in the browser, not human play.

Final gate test session 38668 and installed client session 10370 both exited 0 after moving the unchanged aperture dimensions into layout data. Moving-route session 69672 exited 0; no verification process remains pending for this pass.

## Evidence and limits

Evidence lives in `output/under-green/gate-housing/`, with signal results in `output/under-green/signal-framing/after/` and actor results in `output/under-green/clearance/`. Retain `travel-before-fixture-fix.json`, `signal-outside-framing-failure.json`, `baseline.json` and `conduit-negative-control.json` as distinct diagnostic evidence. The final gate report is `verified.json`.

Inspected high-resolution approach/closure views, compact landscape and portrait gate views, the touch portrait crouched signal view, and the installed client's final gameplay frame. Close upward views deliberately fill the screen with nearby machinery; the framing matrix checks useful crossing approaches independently.

Panel-volume checks exclude intentional insertion into side guides/walls and the floor contact plane. They sample 21 travel fractions; they are not proof of arbitrary actor poses or all possible intersections. No new textures or lights were added by the hoist, but no new sustained-performance qualification is claimed. Human fear/fun, headphone/speaker intelligibility and physical-device comfort remain unvalidated. The full goal stays active.
