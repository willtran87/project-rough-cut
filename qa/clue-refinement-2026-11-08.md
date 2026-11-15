# Environmental clue refinement — 2026-11-08

## Changes

- Audit Bell faces its western approach; a slightly larger bell hangs higher on its timber frame, with the existing lantern raised beside it. Visible from the path junction without a directional board. Its optional large board is lifted to avoid overlapping the new frame.
- Key and valve face their eastern approaches. A worn paper tag behind the actual key gives it contrast, the valve wheel tilts toward the player, and their existing lamps sit at mechanism height. Picking up the key leaves an empty tagged hook.
- Field Log and Release Review have broader physical paper surfaces. Seven small folded/ruled discarded forms sit on the four authored approaches, including alternate paths. Shared branches deduplicate placement; no new route through obstacles and no arrows.
- Fixed shared lamp color: each station owns its tint while retaining the shared flicker shader/uniforms. Closed practice/completed stations no longer recolor every lantern. Valve tint resets when its authoritative state resets.
- Optional Clear navigation, map, prompts and default dark pixel presentation remain available. Movement, collision, pathfinding, Joe perception, ghost scheduling and interaction rules are untouched.

## Budget

The environmental batch remains one opaque depth-tested draw, now 1,662 triangles (357 added). Paper clues use vertex colors, no new texture/light/particle/animation pass. Existing pixel surfaces support the key tag. Lamp clones reuse the same shader program; renderer allocations remain stable through toggles/completions (hardware 60 programs, software 61, both 95 textures). Existing 56 image downloads total 20.8 MB. This work does not claim to solve general software-rendering stalls.

## Verification

`tools/verify-clue-refinement.cjs` checks default/explicit guidance, real settings UI and saved/reset preferences, correct station orientation, independently colored lamps, unchanged warm path lamps, seven bounded/deduplicated paper locations, real E bell use, resource stability, reduced motion, density zero and pause. Captures include actual junctions and bends plus nearby prop views at 2560×1600, 1280×720 and 844×390. Hardware and SwiftShader passes; screenshots inspected.

`tools/verify-release.mjs`: 90 action scenarios pass; unchanged downloads. `tools/verify-win-objectives.cjs`: all three variants × both exits pass real E checks, key/valve access, filing cancellation/retry and victory with zero optional balls. Installed gameplay client passes two iterations, normal startup and 14 units of movement; inspected final gameplay screenshot, ready first-hole state and no errors.

Evidence: `output/clue-refinement-20261108/`. Cache revision: `20261108-clue-refinement`.

## Prepared human discovery test

Not conducted. From a fresh run with Clear navigation off, record whether players notice the bell silhouette before reading its label, associate discarded forms with the log/release desk, and recognize the key and valve without the map. Record wrong turns and time lost; compare with Clear navigation enabled afterwards. Check both alternate paperwork approaches and a small display. Do not coach until a player requests help.
