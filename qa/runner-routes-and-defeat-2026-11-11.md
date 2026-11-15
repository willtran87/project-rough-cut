# Runner alignment, extra Back Nine routes and illustrated defeat

Local implementation, 2026-11-11. Human difficulty/readability testing remains prepared for later; these results are automated browser and simulation checks.

## Player and Level 1 objectives

- Replaced segmented oval limbs with tapered sleeves/trousers, connected shoulder shapes, clothing details and a curved face patch. Existing pixel materials and textures are reused.
- Corrected knee/elbow bend and forward lean. Visual facing follows actual displacement, including wall slides, with at most 15 degrees of transient heading error. Physical collision heading remains unchanged to avoid rotating the collision hull into a fence.
- Ground support accounts for the transformed boot and sole. Across 288 moving samples, lowest geometry stayed 0.012–0.024 m above the ground. Ejection minimum was 0.0135 m; the fallen body spans 0.0022–0.5668 m vertically. Both animation regressions pass.
- Level 1 mechanisms, labels, lamps and clues now face the actual starting position, not a nearby path. Checked 24 fixtures across three variants, with front/side/reach captures. An existing hedge requires a three-quarter front approach to one valve; objectives are not camera-facing billboards.

## More route choices

Added reservoir service loop, dry range perimeter, west service lane and a flooded crossover connecting the range lanes. Longer sheltered routes offer alternatives to exposed direct travel; the crossover trades distance for slippery exposure. New connections rejoin before required objectives.

Eleven added solid features bring authored feature count to 33: maintenance trailers, cisterns, parked equipment, fences and fallen timber. Two more cart gates and a third foot passage exploit actor size. New strips use narrower widths and wider lantern spacing to bound added geometry. Existing material batches are reused; no new lights or shaders. Joe's fork evidence now supports right-side as well as left-side choices. Baked navigation rebuilt with signature 603428914 and 4,410 nodes, retaining bounded planning and avoiding runtime graph construction.

All seven tested branch drives (paths 4–10) pass controlled steering checks. All five cart gates reject the mower; all three foot gaps reject the cart. Twelve full simulated chase scenarios finish with active Joe, including intact-cart and on-foot endings. All three on-foot checkpoint starts also restore required relays and finish. Damage scaling and retreat windows were not changed.

## Back Nine defeat screen

A Level 2-specific illustrated tableau follows the existing 2.4-second run-over animation: Joe on the industrial mower, red beacon, ruined cart, wet fairway and distant service garage. Styled title, short advice, “One more pass.” line, relay progress and checkpoint retry replace the ordinary guide panel on defeat. Keyboard, mouse and existing gamepad actions remain available. Retry restores the saved checkpoint and repaired cart; restarting can replay the opening without retaining the defeat layout.

Generated using the built-in image generation tool, with Level 1 defeat artwork and the Back Nine mower illustration as references. Native master is 1672×941, with no upscaling:

- Master: `assets/cutscenes/defeat/back-nine-run-down-v1.png`
- Exact final prompt: `assets/cutscenes/defeat/back-nine-run-down-v1-prompt.txt`
- Runtime: `web/assets/optimized/back-nine-run-down-v1.webp`, 440,340 bytes

The image has no initial `src`: first request/decode occurs during run-over, not startup. Reused across retries. Static DOM presentation adds no game texture, shader or render pass. Reduced motion disables the reveal fade. Failed image loads retain a usable fallback and retry controls.

## Verification

- `verify-runner-refinement.cjs`: alignment, joint direction and ground bounds; 2560×1600 front/side/back and all four new route views inspected.
- `verify-station-facing.cjs`: 24 fixture cases and 72 screenshots; bell and valve fronts inspected.
- `verify-back-nine-choices.mjs`, `verify-back-nine.mjs`, `verify-cart-health.mjs`: branches, gates, pursuit, collision and completion checks pass.
- `verify-cart-ejection.cjs`, `verify-chase-runover-browser.cjs`: ejection, death, pause, retry and reduced motion pass. Fixtures now skip the added intro; death camera check explicitly uses full shake rather than assuming it is the default.
- `verify-back-nine-defeat.cjs`: real fatal collision, no early skip, frozen defeat state, retry/restart, opening replay, unavailable image and four layouts: 2560×1600, 1280×720, 844×390, 390×844. Desktop, short landscape and portrait inspected.
- `verify-back-nine-on-foot.cjs --software`: controls, look-back, beacon, comfort settings and resource stability pass. 22 software programs, 36 textures and nine audio voices remain unchanged; hardware has 17 programs and 36 textures. No claim of improved frame time from these changes; existing software frame-pacing limitations remain.
- Installed standard gameplay client: two on-foot input bursts completed, screenshot/state inspected, no error artifact.
- Release validation: 90 scenarios, 67 referenced runtime images / 26.00 MiB, no warnings/failures. Whitespace check passes.

Evidence: `output/runner-route-refinement`, `output/back-nine-defeat`, `output/back-nine-route-choices`, `output/cart-ejection`, `output/runover-drama`, `output/back-nine-on-foot`.

Later human tests should judge whether longer routes offer enough relief without trivializing Joe, whether the crossover is readable at speed, and how the revised runner feels during rapid direction changes. Automated wins demonstrate reachable objectives, not final balance.
