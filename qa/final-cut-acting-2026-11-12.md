# Final Cut — Joe's cab performance and continuous exit

This pass advances FC24/50/58. The full 72-item implementation remains incomplete. It does not certify human dramatic reception or finished animation throughout the chapter.

## Changes

The prior imported actor kept a standing leg pose and held his hands about 0.6 m behind the visible steering wheel. The cab now has a reachable wheel, a column, spokes and a wing-control lever. `final-cut-cab.js` supplies the same control/floor coordinates to the meshes and actor. Two-bone IK keeps both hands on the wheel, moves the right hand to the lever while setting the pass, and keeps the feet on the cab floor with bent knees. Wrists follow wheel rotation.

Joe's behavior follows actual encounter state:

- During announce, he reaches for the wing lever, glances down and returns his right hand before the pass begins.
- During the committed pass, he holds course.
- During disengagement, he checks the cut over his shoulder.
- During headland turn/alignment, hands, head and front wheels follow the actual heading correction. A bounded presentation steering value advances in fixed simulation time; it never changes the rig path, speed, target or contact rule. The scene's negative-z forward axis is accounted for in wheel/head rotation.
- During the early bog, he works the wheel and leans into the controls before the machine dies. Reduced motion removes the optional rapid strain movement while retaining the readable action.

The single actor blends into this seated pose at boarding. At dismount, he releases the controls before translating out, carries the body's actual rolled transform into the first frame, and ends at the simulation's exact walking position and facing. This fixes both the initial seated-to-exit snap and the former facing/position mismatch at the end. No second Joe, forced camera or new pursuit was introduced.

## Verification

`node tools/verify-final-cut-acting.cjs`:

- Eight close-view poses covering course holding, pass setup, checking the cut, both steering directions, early bog, struggle and reduced motion.
- Actual 24-second simulation/render cycle through announce, pass, disengage, turn and align. Both hand and foot target errors stay below 0.001 m; observed maxima are approximately 0.00000009/0.00000007 m. These are skeletal endpoint measurements, not a guarantee about every finger or clothing surface.
- Full four-second dismount sampled at 60 Hz. Reach errors stay below 0.001 m. The initial 2 ms boundary has a head displacement of about 0.000074 m, and hands/feet remain within the 0.025 m boundary tolerance. The final 20 ms dismount-to-walk boundary moves the head about 0.004 m.
- Same-state rerender and pause are exact; a saved mid-bog pose restores with zero measured head displacement and matching hand/foot endpoints.
- Screenshots inspected at 2560×1600, 1280×720, 844×390 and 390×844. Close inspection fixtures use already-cut terrain to expose the actor and controls; they are not full playthroughs. The front view was moved away from a cab post that obscured the first inspection angle.

`verify-final-cut-boarding.cjs` still measures about 0.000784 m head displacement across the single-actor boarding/reparenting boundary. `verify-final-cut-ending-browser.cjs` passes actual collapse, exit, road, gate, pause/reload and completion checks with twelve screenshots. Its explicit trap placement remains a fixture.

Main, arrival, ending and crossing rule suites pass, including the existing full ordinary-control simulation finales. Their route times remain unchanged. The release verifier reports 70 runtime images, 34.16 MB, 90 scenarios and no warnings/failures. The installed standard game client was rerun; final screenshot/state artifacts are in `output/final-cut/acting/client-final`. No sustained FPS claim is made.

## Remaining work

Running-board foot plants, ground-contact gait, individual finger contact, facial acting and close mechanical/intersection polish remain. The dismount path is continuous and reachable, but it is not yet a finished climbing performance. The chapter-specific defeat cutaway, remaining restrained dialogue/voice work, environmental dread, authored sound and full visual treatment are still open. Human recognition of Joe's intent and composure change needs playtesting. The existing software-renderer performance problem remains unresolved.
