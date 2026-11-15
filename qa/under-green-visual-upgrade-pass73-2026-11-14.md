# Pass 73 - water shores and physical impact height

Previous goal turn: no implementation progress. It supplied the requested comprehensive list. This turn revalidated the current worktree and completed the unfinished shore candidate, retaining all 53 requirements, 48 refinements and seven acceptance gates.

## Implemented

The eight channel surfaces now slope down to the floor at both catch banks. Shore widths vary continuously from approximately 0.16 to 0.38 m across the channel. The central sheet retains its existing height and motion. The 1.8 mm toe, smooth profile and matching reflection slopes expose the grates and seat the water in its existing mud/retaining context. The shader uses the same sediment map and opaque lighting path; no transparent sorting, added glow or additional textures are introduced. The water footprint and simulation remain unchanged.

A shared course-space height model now places player, Joe, blade and drip contact effects at the sloping water surface, retaining higher shallow-puddle/flood surfaces where they overlap. Main jet landing heights are also sampled individually, so their rings, splash fans and spray clouds follow the shore. Dispersed droplets respect the local water surface. Cached landing coordinates/height arrays avoid new per-frame array allocation; interior height queries skip shore trigonometry. Existing movement, hazards, collision, timing, E/Q bindings and entrance-only retry policy are unchanged.

Runtime files: web/under-green-channel-shore.js, web/under-green-water.js and web/under-green-water-contacts.js. This is local water/contact progress; broad water composition and full Level 1 parity remain open.

## Verification

Artifacts: output/under-green/visual-pass73/. Baseline routes the retained water and water-contact source snapshots. The final candidate uses current runtime sources.

- Analytic/mesh check: eight channels, 5,016 vertices and 9,216 triangles. 36,864 interior triangle samples show at most 1.230 mm difference between the analytic contact surface and mesh interpolation, excluding the existing 8 mm maximum wave motion. Upward winding, finite attributes, unchanged rectangular footprint, floor-safe height, center height, gradient derivatives and flood dominance pass. Maximum derivative error is 4.87e-8.
- Existing contact tests pass: physical boundaries, player stride, actual Joe sole coordinates, blade crossing, pause deduplication, dry/raised suppression, bounded pools, retry clearing and drip arrival.
- Final hardware and software suites each pass 51 captured views/states: 16 baseline/candidate pairs across all channels, low/warning/surge/recession, reverse and close banks, plus six responsive views, 12 cycle captures and reduced motion. The cycle is sampled 48 times at 250 ms, covers all four phases and retains timing/jet agreement. Camera-return images are exact; pause/reduced water clock checks pass.
- All 645 nonwater scene meshes retain identical attribute/index/transform fingerprints. Draw, texture and program counts and paired player/water/flood state match. The measured triangle difference is an integer multiple of 960 per rendered channel, no more than the total 7,680 added triangles.
- Actual ripple instance positions are checked against physical water contact height in every capture. The maximum final offset is 5.101 mm, comprising the existing 4 mm anti-z-fighting lift and per-ring layering. Geometry waves remain the pre-existing separate small motion.
- An isolated real-material test renders only channel water with fog/environment disabled and a black background. With every physical/practical source off, RGB sum is exactly zero, alpha is valid and GL error is zero. Relighting the same visible water produces positive color. Native relit RGB sums: 68,610,843 baseline and 66,030,261 candidate; software: 9,679,144 and 9,314,079. Six water draws in each check establish a positive draw control.
- Hardware actual scene sizes: 2560x1600, 1280x720, 390x844 and 844x390. Software: 960x600, 960x540, 390x844 and 844x390. Zero recorded page/console errors.
- Separate ordinary-keyboard test walks into the first channel, verifies player ripple event height, Q lookback, crouch, pause/contact freeze and actual E pump operation. Fourteen sampled states pass. One observed foot event at (-0.14,23.872) has height 0.0282 m, exactly matching the shared physical contact calculation.
- Final installed web-game client completes eight bursts: ready/playing, checkpoint 0, elapsed 1.533 s, player (0,10.12), actual 960x540. Preparing-button timeout recovers through subsequent Enter input. Final image/state inspected; no error artifact. This startup/movement check complements the separate near-water input fixture.

Before/after close-bank, low-water, rotated bypass, warning/surge cycle, flood, portrait, software close-bank, actual walking/lookback and final client captures were opened and inspected. The grates now remain visible along the sloped bank; no new bright rim is introduced.

## Retained test corrections and process results

Initial preview 87232 ended with a whole-scene lights-out equality failure. Geometry changes alter fog/depth coverage, so whole-scene byte equality is not a valid water-emission test. It was replaced by the isolated unlit/relit positive-control test above; no runtime emission workaround was made. A strict floating-point center-height test was replaced with a 1e-12 tolerance. An earlier contact expectation was corrected to account for higher pre-existing puddles.

Initial full hardware 86259/software 67320 passed. Subsequent source review found the main jets still using the flat center height; those were corrected and final suites 32840/17159 both ended successfully. Installed clients 61807/79912 ended successfully; final evidence is client-final. Initial keyboard fixture 37016 overshot its intended in-water stopping position and failed its position assertion. Reducing the input burst from 1.2 to 0.9 seconds keeps the same physical input test within the crossing; corrected 79414 passes. No gameplay speed change was made.

## Cost and remaining scope

The total water geometry grows by 7,680 triangles across eight channels, with no new draws, textures, lights or material programs. The largest tested rendered increase is 5,760 triangles. This is not whole-level performance qualification.

After all owned rendering/client jobs ended, sequential GPU-fenced cost measurements used six warm pairs and 24 alternating samples per view. Hardware job39772 ended successfully: near-bank 14.2 to 15.4 ms, crossing 15.2 to 16.3 ms, flood 14.5 to 14.4 ms (baseline to candidate medians). Two other chapter jobs were live in the saved process inventory; shared-host contention limits interpretation. The observed increases remain recorded.

Software job2423 ended successfully after the hardware run: near-bank 130.6 to 134.5 ms, crossing 170.2 to 174.9 ms, flood 153.3 to 157.5 ms. These paired diagnostic medians show added local cost and remain far outside the production software target. No performance gate is closed. All owned visual, input, client and timing jobs are terminal. Seven final runtime/tool snapshots match their SHA-256 manifest.

The complete gallery composition, larger district framing, water-motion/art acceptance, matched current Level 1 comparison, actor/presentation motion and ordinary-frame performance remain open. All seven gates retain pending status. Source/tool snapshot manifest is in output/under-green/visual-pass73/source/manifest.json.
