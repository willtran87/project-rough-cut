# Under the Green structural continuity — November 12, 2026

The open bunker and range now have upper retaining walls with turf rims instead of low masonry ending against an untextured background. Bunker sections use sand strata and timber shoring; range sections use masonry and painted ribs. Six roof transitions have deep framed reveals. Forty-eight merged retaining edges derive from the existing rendered floor union; no route, speed, collision footprint, water cycle or Joe rule was changed.

The chapter reuses `parallax-scene.js` and the existing night-sky, moon, cloud, ridge and distant-tree assets used elsewhere in Rough Cut. Sky movement follows simulation time and respects pause/reduced motion. Render statistics include both background and world passes. The five added image responses total 557,508 encoded bytes in the local browser probe; these are existing assets, not newly generated artwork. This is not a network or hardware performance guarantee.

The gallery's short root pieces now enter the roof instead of hanging below it. Pipe clamps have wall brackets. The range net and its posts were raised above the new turf rim; visual inspection caught the initial placement still hidden behind the wall, so the assembly was moved against the outside of the perimeter and a rendered sightline check was added.

Validation:

- `tools/verify-under-green-structure.cjs` checks upper retaining pieces against the actual floor boundary, standing/crouched eye clearance at 805 floor samples, and 22 views across 2560×1600, 1280×720, 844×390 and 390×844. Views include backward/upward galleries, both dry routes, the keeper threshold and maximum upward pitch in the open districts. It also checks sky pause/reduced-motion behavior and the raised net sightline.
- `tools/verify-under-green-clearance-browser.cjs` checks 12 rendered Joe/tool poses, each with 14,697 sampled vertices, including console approaches and partial gate closure. These poses passed after the roof/root/bracket changes and before the final exterior net relocation; the final structural eye-clearance and net sightline checks cover that adjustment.
- `tools/verify-under-green-presentation.cjs` passes phase changes, compact hazard HUD, danger priority, reduced-motion water and optional record/journal/results checks after the background integration.
- Required standard-client runs reach `under_green_playing`, with normal 3.84 m/s movement. Final `standard-client-net/shot-1.png` and `state-1.json` inspected: ready, playing, 3.84 m/s, no error artifacts.

Remaining scope: this is a structural and background pass. Broad material repetition, full dynamic-camera/FOV coverage, district recognition by unfamiliar players, final actor animation acceptance and representative-device frame/memory budgets remain open. The sampled views reached 295 draw calls in the final structural run; draw counts alone do not establish frame-rate suitability. Browser automation is not a first-time player study.
