# Back Nine pass 24 — conservative rider visibility

The preceding roadmap reply did not implement changes. This continuation recovered the unfinished rendering pass, inspected its authoritative results and completed standard-client verification. The full 38-item scope remains active.

## Retained change

`chase-rider-culling.js` bounds the nine seated Joe meshes independently of the mower's much larger visibility sphere. It uses the current posed rig's world transform and a padded 1.15 m sphere. Geometry, textures, materials, lighting, animation, controls and pursuit rules are unchanged. The separate staff sighting is cloned before these callbacks are installed.

81 chest/head poses and 1,153,764 actual weighted vertex observations stay within 0.894106 m of the local center [0,1.3,0], leaving 0.255894 m padding. The probe asserts at least 0.2 m padding. Future rig/animation expansion must rerun this audit.

## Verified evidence

- Hardware and SwiftShader each compare 216 paired views at 2560×1600, 1280×720 and 844×390: zero changed framebuffer channels. Identical beacon shadow work is forced in each pair.
- Real Q look-back cycles restore all nine meshes when visible, preserve driving heading and work with pause/reduced motion. The actual rider contributes 264 hardware / 147 software pixels in each rear view. Both look-back screenshots were opened and inspected.
- Buffer uploads remain 1114, textures 40, programs 20 hardware / 25 software. No page errors.
- Six moving views, 64 alternating paired frames each, 48 captured comparisons: zero changed channels. Fully visible Joe has the same submissions and mixed/no meaningful timing gain.
- Off-screen rider / still-eligible mower-bound views remove nine draws. Software median/p95 milliseconds: foliage edge 55.7/61.9 → 52.1/56.9; clubhouse edge 38.3/62.1 → 37.0/56.6; turning edge 32.4/40.9 → 30.4/37.1. These are fenced draw/completion timings, not whole-frame or startup measurements. An eligible mower bound does not prove part of the mower is visible.
- Recovered software retry report passes six checkpoint/button/keyboard combinations with no new scene, asset requests, uploads, decodes or audio context. Prior handle 59510 is now missing; terminal reports were inspected rather than restarting the job.
- Installed standard gameplay client (handle 44711, terminal 0) exercised the beacon-cover fixture. Both captures/state files exist, no error artifacts, latest full-page screenshot inspected. Player moved through the range, Joe searched physically, quiet banner, health 100. This is a fixture/control regression, not a full-course playtest.

Artifacts: `output/back-nine-experience/rider-culling/` and `output/back-nine-experience/loading/software-warm-retries.json`. Pre-change scene/HTML source remains in rider-culling/baseline-source.

## Rejected experiments / remaining work

Pine near-light partitioning preserved pixels but added batches and did not consistently improve spikes. Live course-pines.js remains byte-identical to its recorded baseline. Single-sided rider materials were also rejected: some face/clothing meshes changed edge pixels; the restricted pixel-exact subset gave mixed timings. Their candidate sources, comparisons and rejection records remain under pine-light-partition and rider-face-culling.

This closes the local optimization verification, not requirement #1. Fully visible foliage/mower/lighting software load and whole-route frame budgets remain open. No human comfort/fear/listening claim or general 60 FPS claim is made.

Next evidence: natural-route supernatural scheduling audit. Sixteen full route/pace/seed simulations found zero safe time at either existing staff-cart site. The current quiet-cruise restriction conflicts with the new departure and aggressive pursuit. Do not weaken real attack, recovery or search protections just to manufacture a sighting.
