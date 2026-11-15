# Pass 72 - gallery moisture and material separation

Previous goal turn: progress. Pass71 completed the fixed-fixture lighting optimization and its native/software verification. This pass advances the gallery's visible art, retaining all 53 requirements, 48 refinements and seven full-level acceptance gates.

## Implemented

The first gallery canopy and its living pillar now have a localized moisture response. The existing fine wetness mask breaks the reflection into small streaks; a world-anchored field follows the east shoulder and supporting pillar instead of relying only on the unrelated repeating pigment stain. Wet sections gain a restrained reflection and slightly deeper diffuse value. Existing bark artwork, independent wetness texture and geometric normals remain unchanged. No glow or screen-space brightening is added.

The authored muddy runoff below the canopy gains a thin specular film, confined to the entrance gallery. Its irregular edges come from the existing floor deposit mask; dry slabs retain their old response. Both bark and floor use existing scene lights, so highlights vary with the actual viewing angle and lamp output. Existing mud shape and floor geometry are preserved.

Only web/under-green-damp-finish.js and web/under-green-ground-finish.js change at runtime. There are no new textures, samplers, geometry, lights, draw calls, collision or gameplay changes. This is a local material/composition refinement, not full gallery or Level 1 parity acceptance.

## Verification

Evidence: output/under-green/visual-pass72/. Baselines route the two retained *-before.js snapshots. Candidate uses the current runtime sources. Initial previews compare gallery entry, canopy, pillar, reverse, east shoulder and ground; the root and ground comparisons were opened and inspected.

The native final suite passes 31 paired views/states at actual 2560x1600, plus 1280x720, 390x844 and 844x390. Checks include camera return, six turning views, lamp dips, three flood states, Q, crouch, real E pump operation and reduced motion. Five outside-gallery views and the operated pump remain pixel-exact. Lights-out images match the original. All scene mesh attributes/transforms/indices and all crafted pigment/wetness texture bytes match. Native audit covers 653 mesh objects; draw/triangle/texture/program counts and lamp/player/flood state match in each pair. Zero recorded errors.

The first software run passed 30 comparisons, then the test rejected a valid nearly black lights-out image using a generic nonempty-RGB requirement. The test now requires valid GL readback and nonzero alpha for every frame, while allowing zero RGB only in the explicit blackout scenario. Final native and software reruns both pass all31 pairs. Software blackout RGB sum is854 in both versions, alpha sum146880000 and GL error0. No runtime change was made to satisfy that test correction.

Software also audits653mesh objects with identical geometry and pigment/wetness textures. Actual scene resolutions are960x600,960x540,390x844 and844x390. The non-gallery comparisons and operated pump remain exact; Q/crouch, reduced motion, six turning positions, return stability, flood and dim-light states pass. Both final suites record zero errors.

Final installed client: seven bursts, terminal exit 0, ready/playing, checkpoint 0, elapsed 0.75 s at (0,7.304), actual 960x540. Initial disabled Preparing click timed out, then Enter bursts recovered. Final image/state inspected, no error artifact. Earlier root-only client is superseded by client-final.

Native reverse, lamp dip, high flood and compact portrait images, software pillar/ground and final client image were inspected.

## Cost

No resource count increase: paired draw, triangle, texture and program counts match throughout. At the native entry there are529draws,399622triangles,55textures and220programs. The additional work is local material arithmetic, with no added texture lookup. This is not evidence that ordinary-frame performance is qualified.

After all owned visual/client jobs finished, sequential native GPU-fenced measurements used six warm pairs and24alternating samples per view. Baseline to candidate medians: entry17.5to17.5ms, root13.6to12.8ms, ground13.8to11.8ms. Two other Final Cut browser jobs were live in the process inventory; these values do not establish a speedup from additional shader arithmetic.

The following software timing is terminal with exit0: entry185.3to184.2ms, root116.6to117.2ms, ground96.7to95.9ms. The paired cost is similar in this run, with a small root-view increase. Absolute software rendering remains far below the required production budget. No full performance gate closes. All owned final verification, client and timing processes are terminal; five source/tool snapshots match their SHA-256 manifest.

## Remaining scope

The complete gallery composition, broader water shores/depth/motion, bunker banks, range framing, keeper room integration, actor/presentation motion and ordinary-frame performance remain open. Neither this local visual change nor its stable resource counts establishes full-route pacing, physical-device performance or whole-level artistic acceptance.
