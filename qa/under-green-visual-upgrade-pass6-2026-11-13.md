# Under the Green visual upgrade — wet ground and traces

The full 53-item objective and all seven release gates remain active. This pass advances V18, V20–V22, V24, V26–V27 and V48. It does not establish final Level 1 parity.

## Implementation

- Six distinct shallow pools at the gallery leak, first crossing approach, bunker maintenance walk, pump spill, range perimeter and keeper room. Hand-authored lobes are softened and quantized on a 128-pixel-per-metre grid. The same finished polygons drive rendering, sediment margins and water contact queries.
- Two continuous narrow runoff grooves connect gallery and pump wet areas toward real drainage channels. No new slowdown, collision, checkpoint or route change. Water is 0.012 m above the existing floor and uses a dark transparent material with broken, practical-light highlights, distinct from opaque moving channels and the deeper whole-level flood.
- Added drying margins, wet mud, sandy sediment and four collars around the real pump support feet to the existing world-space ground control map. No additional ground obstacle geometry.
- Nine incomplete, washed boot impressions near Joe's maintenance entrance, the record stand and the keeper room; two thin old scythe scores. These are historical traces, not instructions or a safe-path marking. They remain beneath floodwater.
- Thirteen differently distributed shallow-pool leaf clumps and sixteen outlet clumps: 29 clumps / 132 folded leaves, in one instanced batch. Small native pixel vein artwork, varied size/rotation/color and bounded drift. Channel clumps sit inward of actual jet impact zones so the full leaf envelope stays over water.
- Sixteen subtle suspended-silt patches near the same outlets. Drift direction derives from the authored jet directions; surge energy increases the local movement. Motion integrates time so channel state changes do not snap positions.
- Leaf elevation follows the greater of local water height and whole-level flood depth, including recession. Decorative motion freezes in Reduced Motion; physical elevation continues to match the hazard. Pause cannot advance motion. Retry/time discontinuities reset the arrangement. Owned meshes, materials and textures are disposed.
- Actual player and Joe contact queries now recognize the shallow pools and grooves. Cosmetic water does not modify the simulation's hazard or movement state.

## Verification

- Pure wet-ground checks: 10,912 occupied samples across all eight wet polygons, supporting floors, no solid overlap, shallow/flood contact precedence, wet-to-dry footstep transitions and placement of all nine boot marks/two scythe scores.
- Existing water contact suite passes actual Joe sole coordinates, blade-water intersection, dry/raised suppression, pause deduplication, bounded capacity, retry reset and drip arrival.
- Existing water contract: 173,304 state parity samples, 23,120 Joe wait decisions and 23 malformed-authoring rejections pass.
- Hardware visual run: 12 captures at 2560×1600, 1280×720, 390×844 and 844×390; actual first render resolution 2560×1600. All six pool districts, service traces, outlet debris and high flood represented. Zero browser errors.
- Final SwiftShader visual run: six fixture captures across the same viewport sizes plus a 1280×720 shallow-footstep view; actual high-viewport render target 960×600. Ordinary forward movement through the gallery puddle produces four contact events. Pause, retry and Reduced Motion checks pass. Zero browser errors.
- Both browser runs also exercise the isolated effect over 132 seconds: 15,341 clump samples validate continuous drift and correct water elevation through two flood cycles; 41,184 transformed leaf vertices remain over real floor and outside solids. Outlet envelopes stay inside their water beds. Disposal leaves zero objects in the isolated scene.
- Rendered dry-route regression: 1,379 frames, 106 body/tool scenery audits, no intersections and maximum foot error 2.415e-7 m. Camera samples and hand checks pass. This scenery audit excludes cosmetic leaves and films; those are covered by the dedicated placement/elevation checks. The later outline/highlight polish changes no actor or structural geometry.
- Installed game-client final input smoke test is recorded in progress.md after its terminal result and screenshot inspection.

## Visual review and remaining work

Inspected native hardware gallery, pump, bunker, range, keeper, service-door, outlet and flood views, plus portrait software output. Fixed an initially overbroad bunker specular highlight and angular pool outline after screenshot review, despite functional tests already passing. Leaf and footprint contrast was raised after the first captures; debris density now differs by district.

These details remain restrained. Whole-level lighting composition, contact shade, material parity with Level 1, actor detail, keeper storytelling and later presentation passes are still required. Water/spray and distant texture stability retain their final art acceptance work. The existing keeper footprint still participates in the whole-floor flood; V26's dry-refuge wording is unresolved and has not been faked with a visual exclusion.

The new presentation is bounded to six draw batches and three small native masks (128×256 boot, 64×128 leaf, 64×64 silt). Hardware fixture totals range from 38 to 241 draw calls in the final fixture run; these counts do not prove frame-time or memory-budget acceptance. Full startup, presentation timing and gameplay frame pacing remain open.

Artifacts: output/under-green/visual-upgrade/wet-ground, wet-ground-software, pass6-clearance, pass6-client and pass6-source. All source changes are local to Under the Green. No commit, deployment or other chapter edits.

Final installed client exited successfully and reached under_green_playing at (0, 8.84), actual render960×540. Final screenshot and shallow-contact screenshot inspected. The current run reports six pools, two runnels,29clumps and132leaves; no error artifact. All owned test processes are terminal; existing local server retained.
