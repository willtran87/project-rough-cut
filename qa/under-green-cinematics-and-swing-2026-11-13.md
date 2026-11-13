# Under the Green: scythe and illustrated story pass

## Delivered

- Sweep widened from about 74 to 126 degrees; cutting phase shortened from .45 to .22 seconds. Smooth acceleration/deceleration, existing body turn and two-hand IK, .16-second follow-through hold, and sharper synchronized swish. Existing warning time and recovery opportunity retained.
- Clearance solver follows the faster authored motion. Player contact is sampled along the actual clear swept path, avoiding frame-to-frame tunneling. Attack-position selection samples the full new duration.
- Three original high-detail pixel-art intro panels and one defeat illustration generated with built-in image_gen using existing chapter art as references. Native size 1672x941, matching existing chapter source dimensions. PNG masters retained; WebP runtime copies preserve dimensions. Full prompts and manifest: assets/cutscenes/under-green-opening/.
- Shared opening component accepts a mount, advance-key list and final button label. Existing defaults retained. Under the Green uses E to continue, Esc to skip, persisted future-skip option and Controls & comfort replay. Intro pauses simulation; replay restores the previous mode. Existing pooled audio supplies a quiet water/pipe/breathing bed.
- Defeat art preserves full composition across desktop and phone. Actual cause, contextual advice and immediate retry remain. Retry resets to entrance with pump, record and pursuit reset, and bypasses the intro.

## Verification

- verify-under-green-fast-swing.mjs: 30/60/120Hz angle tracking; full 126-degree arc in .22 seconds; stationary capture after warning; moving sideways escapes; held follow-through continuity.
- verify-under-green-trimmer.mjs: pose transitions and 112 contact cases pass.
- verify-under-green-clearance.mjs: 1,288 placements and 11,093 route frames pass; dry/wet and later-route scenarios complete.
- verify-under-green-trimmer.cjs: 72 rendered poses, maximum hand error 1.4e-7m; rendered contact endpoints match simulation within 7.2e-15m. Ninety duplicate renders do not accumulate rotations. Windup, midpoint, follow-through and recovery screenshots inspected.
- verify-under-green-moving-clearance.cjs --dry: 1,379 rendered frames, 106 actual geometry audits, zero scenery intersections; maximum foot error 2.5e-7m. Hand and camera assertions pass.
- verify-under-green-cinematics.cjs: three slides load; E advances through gameplay; genuine scythe contact produces illustrated defeat; E retry resets live state; replay freezes clock and Esc returns to pause; skip preference survives reload. Desktop 2560x1600 and 1280x720, portrait 390x844 and landscape 844x390 captures inspected. No browser/console errors. Intro screenshot timing waits for the reveal fade to finish.
- Installed web_game_playwright_client.js: four input bursts through intro into movement. Final mode playing, player y12.68 from entrance y5, intro completed, no error artifacts. Actual final gameplay screenshot inspected.
- Syntax checks passed for the edited gameplay, audio and shared opening modules.

Evidence: output/under-green/cinematics/ and output/under-green/trimmer/. Original art and runtime copies are separate; no resolution-upscaling claim. This verifies mechanics and presentation, not a human suspense/playability study. Proposed next work is in design/under-green-next-improvements-2026-11-13.md.

No commit or deployment. Development server on 4187 retained. Unrelated working changes preserved.
