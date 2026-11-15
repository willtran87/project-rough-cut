# Irrigation visuals and exit tradeoffs — 2026-11-08

## Visual change

The drain control now has a cast-iron riser, threaded unions, bolted brass flanges, bypass pipe and a physical pressure dial. Its existing wheel, pixel materials and local lantern remain. Needle follows the actual soak timer: high while water runs, low after expiry. Drain access remains unlocked. Completion ink is on the lower pipe so it cannot cover the dial.

Eight low irrigation heads are placed inside the existing wet zones, outside blocking props and ponds. They use the existing brass/iron pixel surface materials, with a stem, nozzle opening, impact arm and return spring. No collision was added and wet-zone boundaries did not move.

Curved jets have three narrow strands of pixel droplets with small landing splashes. They derive exclusively from the authoritative 24-second soak timer. The nozzle direction points into its wet zone. Opaque, depth-tested instances avoid transparent mist overdraw; no light, new texture/download or postprocessing pass. Hardware draws at most three nearby heads in one spray draw (144-instance pool); software two heads (64). Updates are quantized to 20/12 Hz, offscreen/far heads are omitted, dry/density-zero draws none, Reduced Motion holds a steady arc and Pause freezes it. Static head detail joins the normal culling/batching pipeline.

Movement, Joe navigation/perception, water gameplay, exit conditions, scoring and controls are unchanged.

## Existing exit rules (verified in game.js)

- Both require all three field checks. Shed requires key; drain requires valve. Both can be unlocked and preference can change.
- Base filing hold: shed 1.35s, drain 1.70s. Earned filing reductions apply to both; floors .72s/1s. Both add .48s sealing afterward. Drain filing is slightly noisier (.52 vs .44).
- Valve creates an east-side distraction (5.5-second timer) and 24 seconds of active wet zones. On wet turf footsteps are muffled and Joe runs at .68 speed, but player tracks gain .2 strength and last 1.55 times as long. Wet turf also weakens ball lures.
- Valve benefits do not require committing to the drain: the player may activate water and ultimately use the shed. After the water expires, drain access stays open.
- Same 250-point route bonus for both; route-specific finish artwork/records. Choose based on access, Joe's position and the approach; shed offers a shorter final exposure when both are otherwise equally viable.

## Verification

`tools/verify-irrigation.cjs` (hardware and `--software`) checks eight valid heads, real E valve activation, unchanged timers/exit holds, wet-state activation, active/dry pressure gauge, bounded depth-tested spray, changing trajectory, read-only player/Joe/gameplay state, Pause, Reduced Motion, density zero, expiry while drain remains unlocked, and stable program/texture counts from dry startup to first spray. Captures at 2560×1600, 1280×720, 844×390. Inspect actual screenshots; a first test camera was inside a night-range sign, so that fixture was moved to the side.

Final hardware/software checks pass: 60/61 programs and 95 textures remain stable. All six course-variant/exit combinations complete actual interactions and reach victory, including zero optional balls and cancel/retry filing. Installed standard client passes two iterations with ready first-hole state, 14 units moved, Clear navigation off and no error artifacts. Presented client and all three capture sizes visually inspected.

Release 90 scenarios / 56 images / 20.8 MB. Evidence `output/irrigation-20261108/`. No general software-FPS claim; final human visual/discovery testing remains for later. Test browsers closed; server remains on port 4187.
