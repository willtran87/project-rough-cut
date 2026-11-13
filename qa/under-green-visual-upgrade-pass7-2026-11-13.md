# Under the Green visual upgrade — keeper workspace and lamp glass

All 53 requirements and seven release gates remain active. This pass implements V39 and advances V08, V28, V31–V32 and V40–V41. It does not establish complete Level 1 parity or whole-level lighting acceptance.

## Implemented scene

- Two genuine, opaque-backed wall recesses house a damaged fitted desk and an empty six-pair boot rack. Original wall pieces are split around each opening; the software occlusion geometry uses the same split. Existing navigation and collision boundaries are retained. Recess sills remain above the maximum 0.38 m flood.
- Cabinet drawers, worn pulls, broken corner/splinters, timber grain/knots, layered damp pump records, curled loose paper, pencil and records tray. The existing course plan is replaced by a 1024×512 native pixel survey of the eighteenth green and its drainage, physically framed on the recess back wall.
- An empty scythe board has a protected dust silhouette, real hooks and a surviving rake beside it. The rake was moved after the initial wider screenshot revealed that the console hid its head. The desk and missing tool are the primary narrative arrangement; no new explanatory banner or interaction was added.
- Removed procedural roots from the actual furniture recesses after visual inspection found a root covering the boot rack. Replaced solid black sole shapes with faint incomplete tread marks and corrected the ledger orientation and coplanar drawer faces.
- A ceiling-supported amber task lamp shares the established fixture/light/flicker path, including its reversed lens facing and lower power. Existing practicals now use four dirty ribbed-glass panes with short corner cracks, socket, leads and a narrow filament. One 256×256 atlas and per-instance offsets retain one lens draw, with no extra lens draw calls or new geometry. Side faces are dark; grime does not glow. Actual lamp flicker and Reduced Motion remain unchanged.

## Verification

- `verify-under-green-keeper-layout.mjs`: removed wall opening area 11.051 m² equals authored openings; 334 resulting fragments; 61 approach samples preserve the collision boundary. No extra navigation colliders.
- Final hardware keeper run: 11 views across 2560×1600, 1280×720, 390×844 and 844×390, with native 2560×1600 first render. 3,072 camera poses around both niches and the full tool-wall corner have no intersections. Includes crouched/standing heights, pitch limits, FOV45/85, portrait/landscape and four directions. 21 sluice travel positions have no geometry intersections.
- Final software keeper run: the same 11 views at those viewport sizes; actual first render 960×600. Both paths confirm the course plan is unobstructed and the recess back blocks sight beyond it. E produces intermediate gate closure and then the secured outcome. Reduced Motion holds all practical levels at 0.72. Zero browser errors.
- Dedicated lamp checks inspect front-facing task and gallery lamps at 2560×1600. These are real reachable camera locations and compile the atlas shader through the production scene. Hardware draw counts are 57/93 for these two views. No extra lens batches; one extra small texture. Full presentation/performance acceptance remains open.
- Prior dry-route run at `pass7-clearance`: 1,379 frames, 106 actual body/tool scenery audits, zero intersections and maximum foot error 2.415e-7 m. This precedes the final rake relocation; the final dedicated camera audit includes the relocated tool corner. The later glass change adds no geometry.
- Existing water contract was run during this pass: 173,304 state parity samples, 23,120 Joe wait decisions and 23 rejected malformed authoring cases. Simulation, movement, attack, ghost and flood timing were not changed.

## Visual review and scope limits

Inspected the final hardware desk approach/close, tool rack with visible rake, and task/gallery lamp close-ups; earlier furniture iterations also covered oblique/distant views and empty boot shelves. The high-resolution images expose remaining differences in material density between small metal fittings, wood and masonry; those remain V02/V03 work. The old keeper sign still needs physical mounting/wear under V50.

The two-nearest-light budget still prevents some distant practicals from illuminating their surroundings. The lamp glass now reads physically, but broader light composition, contact shadows, haze and actor lighting remain unfinished. V28/V31/V32 are partial. No claim of a performance gate from draw counts alone.

V26's original dry-keeper-refuge phrase conflicted with the user's explicit whole-level rising water requirement and the existing simulation. The plan now requires the keeper floor to flood consistently while raised records and furniture shelves remain protected by their actual elevation. No visual water exclusion, checkpoint or safe-floor exception was introduced. Final flood edge/art acceptance remains open.

Artifacts: `output/under-green/visual-upgrade/keeper`, `keeper-software`, `pass7-clearance`, `pass7-client`, `pass7-source`. The final installed-client smoke and software lamp detail outcomes are appended after terminal results and visual inspection.

Next: world-consistent practical light coverage without abrupt selection changes; full district lighting/contact-shadow composition; Joe/ghost material and attack finishing; sign/HUD cohesion; final water polish and matched Level 1/performance/accessibility release gates.

Software lamp detail run also passes: task/gallery at actual960x600,40/51draws, zeroerrors. Inspected task glass and responsive390x844desk screenshot. Disk exhaustion interrupted the first final-client attempt; this is not recorded as a gameplay failure. All519pass artifacts were relocated with SHA256 verification to I:/CodexArtifacts/project-rough-cut/under-green-visual-upgrade. A directory junction retains the original output/under-green/visual-upgrade paths. No artifacts were deleted. Final client retry remains subject to terminal result and inspection below.

Final installed-client rerun33071 exited0. Regenerated shot2 and state2 inspected: under_green_playing at(0,8.84), actual960x540, all four new lamp variants present, no error artifact. Current gameplay view retains the dark root-gallery route and physical hazard fixtures. All owned test jobs are terminal.
