# Under the Green pass78: gallery runoff and shallow reflections

Local refinement of V18/V20/V22/V24/V25/V48, preserving the complete 53-item plan and 48-item review. No whole-level acceptance gate or completion status is promoted.

## Retained art and behavior

- Broadened the existing entrance pipe-leak pool into unequal lobes and added two separate shallow pools beneath the damaged west vault and central root shoulder. Their areas are 5.2551, 2.0690 and 8.2893 square metres. Quiet dry paving remains between them. All are 12 mm shallow presentation surfaces, separate from timed channels and flood slowdown.
- Existing ground masks derive sediment and wet margins from those same outlines. No extra texture assets, lights, colliders or UI were added. Original leaf-clump counts remain unchanged; the three existing entrance clumps follow the revised pool.
- Three independent drip sources land in these pools and produce actual water-contact rings. A short socket belongs only to the pipe source. Roof/root drips do not generate pipe fittings or modify pipe wetness. The pipe shader's old hard-coded three-leak uniform/loop is now sized from the real pipe sources; the fourth leak receives its own dark wet finish.
- Gallery shallow water uses physical pixel-scale sampling and two small crossing wave slopes. Reflections use existing lights, with narrow broken crests and dark intervals. An overly broad soft sheen preview was reduced before the final candidate. Other districts retain their original puddle treatment.
- Ray checks exclude sockets and find the actual supporting pipe, exposed vault brick and root underside: the socket spans the pipe's 24 mm offset; roof/root origins are 3.58/7.43 mm below native surfaces. Geometry checks caught a pool extending into the narrowing wall and it was pulled back. Source checks also caught an initially detached root drip and it was seated.

## Verification

Artifacts: `output/under-green/visual-pass78/`. Earlier preview/final folders precede the final reflection and dynamic pipe-shader refinements; authoritative final render folders use the `accepted-` prefix.

- Geometry unit: all 4,275 vertices of the three affected pools lie over walkable floor, with finite attributes and upward triangles at the actual shallow-water height. Triangulated areas match authored outlines. All three drip origins are inside their pool; contacts respect shallow and flood height. A continuous 25-second contact sample observes all three sources, bounded storage and pause stability.
- Final native session11659 exited0: 38 captured states covering approach, close/oblique/reverse views, other-district controls, rising/high/falling flood, 1280x720, 390x844, 844x390, rear glance, crouch, walking, drip motion and reduced motion. Native2560x1600 images, reflective close-up, portrait and receding flood were inspected. No browser errors.
- Identical ordinary input ends at (0.35,15.408) in both builds with exact player and Joe state. New pools add five player contact events; the continuous eight-second sample increases drip contacts from six to ten. Pause freezes animation/time, Reduced Motion fixes water animation time at zero, and camera-return images are exact.
- Compiled native pipe programs report three leak uniforms in the baseline and four in the candidate. Pump and keeper screenshots remain byte-identical; paired player/flood/light/texture data match.
- Final installed client session68313 exited0 after eight bursts. Initial Preparing click timed out; later Enter input recovered. Ready/playing, checkpoint0, elapsed1s, player(0,8.072), actual960x540; final state/image inspected and no error artifact.
- Native approach/floor draws remain530/482, textures55 and programs221. Approach submitted triangles427924 to433524 (+5600). The close pool view gains one existing material/cell draw. These counts are not a frame-pacing qualification.

Final software session86938 exited0 with the same38 captured states and no errors. Actual buffers960x600/960x540 and compact390x844/844x390; final reflective view inspected. Native timing report is terminal and no owned timing process remains; sequential software session55550 exited0. Six warm pairs and24 alternating GPU-fenced samples per view measure local cost, not sustained play. Other chapter software work was live during sampling. Native baseline/current medians: approach21.8/19.5ms, floor17.7/17.6ms, pool14.5/13.6ms. Software:269.5/271.8ms,220.5/230.6ms,79.2/88.3ms. Software cost and the floor/pool regressions remain unresolved; no performance acceptance. Nine runtime/tool source copies are byte/SHA256 verified in final-source-manifest.json. Broad floor/water composition, channel/flood art, other districts, matched current Level1 and sustained performance remain open.
