# Under the Green visual upgrade — machinery pass

The full 53-item goal remains active. This pass advances V02/V03/V28/V35–V38/V52; it does not establish final Level 1 parity or close the seven release gates. Requirements remain intact in `design/under-green-visual-upgrade-ledger.json`.

## Implemented

- Replaced the pump box with a centrifugal casting, finned motor, exposed joined coupling, bolted face, service strainer, junction box, separate corroded feet and skids. All low parts remain within the existing 2×3m solid footprint.
- A continuous curved delivery pipe reaches the existing overhead diverter. Added two flanges, bolts and a roof hanger. Existing circuit and simulation remain authoritative.
- New chapter-local machinery materials reuse the illustrated industrial master, with physical UV scale, corrected circular-cap UVs, separate wetness and no albedo-as-bump. Red enamel and rubber preserve the actuator's readable color/material separation.
- Pressure faces use a 1024×512 shared canvas atlas with two 512px dials, ticks, numbers, restrained rim corrosion and a fine crack. Needles still use real return/range water levels. Zero pressure is at the low-angle stop; full pressure at the high-angle stop. Added fitted bezels, supports, grip ribs and exposed worn edges. Rigid lever parts are merged by material.
- Repositioned the existing pump work lamp from the side wall to a roof-supported position in front of the machine; no extra point lights.
- Sluice has four worn guide tracks/seals, 16 enclosed roller-bearing housings, external bearing caps, corroded bases and recessed panel bolts. Panel remains two material draws and retains its original swept envelope. Existing cables, control and travel path remain synchronized.
- Release cabinet has a gasket, hinges, corroded edges, a rounded red actuator and a 256×512 worn enamel travel label that responds to scene light. Button, witness and latch retain authoritative state-driven movement.

No new gameplay obstacle, checkpoint, control mapping or pursuit rule. E remains Use, Q remains rear glance. No action/noise banners added.

## Verification

Final mechanism verification passed on both rendering paths: 41 captures per path, zero browser/shader errors. Hardware uses actual 2560×1600 on the RTX 3090/D3D11; SwiftShader uses actual 960×600 at that viewport. The hardware run checked 41 full gate travel positions and 924 camera placements with zero contacts. The full dry route passed 1,379 rendered frames and 106 actor/tool geometry audits with no scenery intersections (maximum foot error 2.42e-7m).

Final verification is recorded in the accompanying report JSON files:

- `tools/verify-under-green-machinery.cjs`: close/front/rear and approach compositions; real E pump diversion and sluice closure; gauge/water agreement; pause; open/moving/secured states; 41 gate travel positions; actual mesh/box contact audits; wide-FOV camera placements around controls and wall-adjacent guides.
- Viewports: 2560×1600, 1280×720, 390×844 and 844×390. Native D3D11 rendering and SwiftShader fallback are tested separately. A high-resolution viewport is not claimed to imply a native software render target.
- `tools/verify-under-green-moving-clearance.cjs --dry --output=output/under-green/visual-upgrade/pass2-clearance`: ordinary full-route simulation replay and rendered actor/camera/tool geometry checks.
- Installed develop-web-game client: intro progression and ordinary movement, with actual state and screenshot inspection under `output/under-green/visual-upgrade/pass2-client-final`.
- Evidence under `output/under-green/visual-upgrade/machinery` and `machinery-software` includes console/page errors and actual render dimensions.

Visual review caught and corrected stretched cylinder-cap UVs, reversed dial labels, actuator colors lost in the old material tint, and bearing covers buried in masonry. The first harness attempt lacked the pump-diverted precondition for sluice interaction; the fixture now sets the actual required state, without changing gameplay rules.

Native representative costs: pump approach 89 draws/417,346 triangles; close pump 50/413,650; operator looking back across the junction 257/585,372; keeper release 63/327,480. Programs remain 28 across these views; texture uploads rise from 52 to 65 as additional scene materials become visible. These are renderer counters, not measured frame-rate or memory acceptance. The full performance gate remains open. The software close pump uses 49 draws/36,474 triangles through existing culling/detail fallback.

## Remaining scope

Whole-level architecture/enclosure, authored root tangles and embedded contacts, surface variation, floors, water/flood effects, lighting/shadows/humidity, keeper story props, Joe/ghost material and motion polish, sign/HUD consistency and final matched Level 1 review remain open. This pass does not claim sustained frame-time targets, startup/memory acceptance, all accessibility combinations or final district identity. Static detail is batched and the existing two-light pool is retained, but total rendering cost still needs the planned measured comparison.
