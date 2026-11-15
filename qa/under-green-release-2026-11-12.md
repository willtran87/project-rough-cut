# Under the Green: keeper release construction and feedback

Scope: review 8, 14, 23, 24, 29, 35, 41 and 44. This is a local presentation improvement; the complete 44-item goal remains open.

## Verified problem and implementation

The previous cabinet was a 0.75 m box centered at 1.1 m, leaving its bottom 0.725 m above the floor. Its separate top actuator did not move during closure. The high-resolution captured reactive-route approach shows the unsupported control before this change. Existing gate and interaction rules remain authoritative.

`under-green-release-scene.js` now builds a bolted floor plate, continuous pedestal, cabinet, face fasteners and a labelled OPEN/SHUT travel gauge. The button depresses over the first portion of real gate travel; the indicator follows the same fraction; a physical catch swings over the button at the end of closure. The indicator becomes green only after authoritative secured success. Colour is supplementary to position and lettering. No additional closure clock, action, prompt eligibility or enemy rule is introduced.

The conduit now meets the cabinet at its corner and connects continuously to the overhead run. The first visual pass exposed the central conduit obscuring the button; it was moved before final verification. Static cabinet parts are merged into three material meshes; three moving parts and one label remain independent. One small label texture/material is explicitly disposed with the chapter. No lights or render targets were added. The release group participates in camera and Joe/tool clearance inspection.

Compact screens collapse the redundant objective/checkpoint card while the release is available, retaining the district, actionable prompt and urgent caption. The same compact card applies during the short safe aftermath. Leaving the release restores the normal navigation objective. This followed an actual portrait capture where the objective obscured the actuator. Shared campaign HUD behavior is unchanged.

## Verification

- Original broad camera sweep after adding the release: 23,424 static poses and 696 dynamic poses, zero intersections; session 23961 exited 0. The subsequent conduit-corner position is covered by the targeted final release sweep below.
- Gate-housing regression after the conduit change: 20 views, 46,746 moving-point samples, 630 moving-box tests and four ordinary closure stages; no roof, point or volume contacts. Includes pause/resume, secure aftermath and completion reload, and the intentionally intersecting-conduit negative control. Session 34622 exited 0.
- Rules regression: durable bypass, timing contracts, interaction reach, unsafe-side cancellation, reopening, occupied gate and binding profiles pass.
- Release browser test covers desktop keyboard Use and compact browser-touch Use; cancelled retreat and pause use keyboard. Open, closing, secured, cancelled/reopened, blocked and reduced-motion views at 2560×1600, 1280×720, 844×390 and 390×844. Final session 83966 exited 0: 24 views, zero browser errors, and 8,760 targeted near-control camera samples over five gate fractions with no contacts. Projection checks confirm the actuator remains outside the compact objective card. Portrait and landscape touch captures were inspected after the HUD correction; cancelled retreat restores the normal objective.
- Initial harness assertions incorrectly read serialized Three.js vector bounds as objects instead of arrays; the geometry already reached y=0. A later exact-zero terminal latch check exposed floating-point residue; the terminal mechanical pose now lands exactly at its authored stop. These were separate from the observed conduit and HUD framing issues.
- Installed gameplay client session 35818 exited 0 after the mechanical/conduit changes: lesson crossed, playing at 11.2167 s, zero water hits, no error artifacts. Shot/state inspected. Final installed-client session 33614 also exited 0 after the compact HUD change: playing at 11.2 s, lesson crossed, zero water hits, no error artifacts; final shot/state inspected.

- Targeted actor replay session 71987 exited 0: 845 rendered frames, 207 skinned body/tool geometry samples, zero intersections and no page errors. Replays both previously verified occupied-room escapes and the retained standard cautious capture, with ordinary recorded movement through simulation. Tests the current control against the actual moving actor, not only static camera rays. Report: `output/under-green/release/actor-clearance.json`.

## Limits and remaining work

Visual checks and simulation replays are not unfamiliar-player, listening or physical-device tests. The gauge supplements the actual gate and existing instructions; it does not report hidden occupancy or guarantee that a late arrival will survive. Sustained performance of the complete updated scene and broader chapter acceptance remain open. Retain the original balance/capture reports; do not reinterpret six captured cautious policies as either unavoidable losses or a completed fairness review.
