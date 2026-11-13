# Under the Green: exposed bunker bank

The existing sand/soil/turf cross-section was hidden behind a taller duplicate retaining face along the outer west dry walkway. Three rendered sightline checks confirmed the layers were blocked. Baseline screenshots are retained in `output/under-green/bunker-bank/before/`.

The outer edge at x=-32, y=52–72 now retains its original 1.8 m boundary wall and shorter shoring, exposing the existing bank above. Other retaining edges, including those between playable routes, remain unchanged. Four small root fans, a grounded bunker rake and two lost balls connect the turf edge to course maintenance. The existing flags are now visible from the approach. Initial rake placement hid its head behind the rim; the final teeth rest on the turf with the head above it. Pure edge-selection data is separate from Three.js construction.

`tools/verify-under-green-bunker-bank.cjs` passes 16 views across 2560×1600, 1280×720, 844×390 and 390×844. The three actual layer rays are now clear and on-screen at every cutaway view. Selected final approach, rake, portrait cutaway, landscape return and ordinary-walk captures were opened and inspected. QA hides the HUD labels in these views; this supports visual inspection without claiming unfamiliar-player recognition.

The same tool passes 4,104 nearby camera volumes at standing/crouched eye heights, pitch extremes, both FOV limits and desktop/portrait aspects. Twenty-four actual mesh poses—six each walk, windup, sweep and recovery—pass body/tool and floor checks. An actual W-key walk travels from y70 to54.64 along the dry walkway, takes no water hits and stops on release. No navigation, collision, movement, water or attack logic changed in this scenery pass.

Matched high-resolution cutaway/approach/return views add one draw call and 1,972 triangles, with unchanged textures and programs. These counts do not establish sustained frame-rate performance. New geometry uses existing static batches and material resources.

Final browser session49194 exited0. Installed client56996 exited0; its latest screenshot/state were inspected: playing,6.567s,lesson crossed,y28.04,zero hits,speed0 after release. That standard-client view is the root gallery; the targeted ordinary-keyboard walkthrough supplies bunker evidence. No errors or owned pending processes remain.

Advances review items24/25/30, with scoped clearance evidence for23. Broader golf-course recognition and human acceptance remain open. The user's latest feedback prioritizes Joe's clunky pathing/seeking and insufficient aggression; resume behavioral work next.
