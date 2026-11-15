# Under the Green visual upgrade — pass28

Local V34 lighting/material separation implemented and verified. Full53 requirements and seven release gates remain open.

## Changes
New under-green-fill-light.js balances neutralized fill colors to prior linear luminance. Same three fill sources and17world practicals. New under-green-tonal-grade.js applies bounded hue-preserving lift to opaque shaded surfaces before fog/color conversion. Gain1–1.42, identity at black and highlights; no new passes/geometry/textures. Water tagged and excluded; Basic/transparent materials excluded. Scene installs/disposes hooks in dependency order.

## Evidence
pass28-grade/hardware and software:26 general before/after views each. pass28-threats/hardware and software:6 corrected attack/flank/Q views each. Both reports PASS, no errors. Original pass28-final attack captures retained cached carry pose and are superseded by corrected threats suite (delete weaponPose and settleWeapon); do not use those three original attack shots as evidence. Actual attack poses reviewed visually. Native2560x1600, ordinary1280x720, portrait390x844, landscape844x390. Software desktop internal960x600/960x540. Pause/Reduced Motion and water phases included.

Pure tonal test passes12001 samples: monotonic bounded curve, hook restoration, material exclusion. Actual eight channel-water materials remain ungraded. Clear400x200 water patch RGB unchanged against fill-only; floating opaque leaves intentionally receive grade. All paired resource counts and simulation states unchanged.

GPU fence timing,24alternating paired frames after warmup, isolated jobs; values include CPU/poll/context overhead. Native RTX3090 gallery off median14.4/p9516.7ms,on14.8/16.7; pump8.2/9.9,on8.2/10.5. SwiftShader gallery250.8/261.1,on253.1/263.7; pump115.4/119.9,on115.8/117.9. Software performance gate remains unmet.

Installed skill client28704 exited0. Five bursts complete; shot4 visually inspected and state4 ready/playing at(0,12.68),internal960x540. No error files. Initial5second Preparing click timeout means no startup acceptance claim. Four runtime source hashes match final-hashes.json. All owned pass28 processes terminal.

## Remaining art work
Root texture density probe finds approximately388–678texels/m at bases rising to2282–4010 at tapered tips, versus architectural313.5. Representative probe only; root geometry code unchanged. Next V02 work should use actual deformed circumference, preserve physical vertices and verify bark seams visually. Repeated masonry chips and large dark upper composition areas remain broader art concerns. Full matched Level1 parity and seven gates remain unaccepted.

## Storage interruption
C: full caused qa/under-green-visual-upgrade-pass28-2026-11-13.md to remain empty and prevented ledger/plan/progress finalization. Saved this report and a pending ledger on I:. On-disk source ledger still22implemented29in_progress2pending; pending ledger23implemented29in_progress1pending reflects locally acceptedV34. Do not mark entire goal complete.
A storage-recovery attempt preserved output/under-green/mouse-up-2560.png byte-for-byte at pass28-preserved-mouse-up-2560.png on I:. SHA256 verified before attempting original-location symbolic link; symlink failed for missing administrator privilege. Copy-back failed because C: filled again. Restore that original artifact path when space is available. No artifact contents deleted; no recursive deletion. NTFS compression attempts failed. No further C: writes attempted.


Storage recovery: full report restored to the project after space became available. Historical storage notes above describe the interruption; the screenshot at output/under-green/mouse-up-2560.png has also been restored and hash-verified.
