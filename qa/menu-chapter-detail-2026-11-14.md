# Ten chapter-menu detail refinements — 2026-11-14

All ten approved refinements are implemented. Intro reveal and lead-in remain unchanged, as do the menu entrance and chapter-change animation functions.

| Requested refinement | Implementation |
| --- | --- |
| Chapter-specific heading plaques | Inset heading plate with the selected gate/cart/drain/mower emblem. |
| Better panorama framing | Separate desktop and mobile crop anchors, reviewed against the original chapter paintings; cart roof, drain aperture and mower cab remain the focal points. |
| Clearer chapter journey | Quieter progression chevrons, a stronger centered route fork, and a vertical branch beside the two stacked mobile routes. |
| Selected-card marker | Small brass edge pointer replaces the check mark; existing pressed state and focus brackets remain. |
| Illustrated left rail | Four cached SVG equipment diagrams: gate elevation, cart side elevation, drain cross section and cutting-deck plan. Compact desktop version; hidden where space is constrained. |
| Completion stamps | Small restrained ink-style Escaped stamp lives in the text area, preserving the artwork. |
| Chapter-specific Start Game emblem | Selected chapter's existing emblem replaces the shared blade. |
| Consistent spacing | Shared artwork/card content inset and equal desktop card/header geometry; corrected a4px route-card offset. |
| Consistent mobile cards | All four use horizontal artwork/text panels, including the two alternate routes, with matching104px minimum image height. |
| Mounted artwork | Narrow dark recess, single highlight and inner shadow surround the panorama. |

## Implementation and preservation

Runtime changes are limited to course-menu-materials.css, course-menu-ui.js, chapter-links.js and their index.html cache keys. New decoration uses static CSS or cached SVG strings; emblem and diagram updates occur only on chapter selection. No new RAF, timer, media, animated filter or continuous DOM update. Continuous border edges and chipped corners remain.

Protected SHA256 checks: intro-presentation.js, game.js, both menu atmosphere scripts and original course-menu.css unchanged. Byte comparison of the existing feature-change/entrance animation block also passes. No gameplay/launch behavior change.

## Verification

- High-resolution2560x1600 screenshots inspected first, then1280x720,844x390,390x844 and320x568 at1.0/1.3 text scale. Existing layout suite passes10 configurations, with no horizontal overflow, usable scrolling,44px targets, visible Start Game/footer and unclipped titles.
- Extended existing assertions verify heading/card/Start emblems match and equipment diagrams follow all four selections. All four mobile cards place their images to the left of labels with minimum104px image height.
- Captured every chapter at390x844 and320x568 maximum text scale. Corrected the smallest header's logo column to leave room for long chapter names. Mobile card list and small Under the Green header inspected.
- Gallery suite passes equal card geometry, rapid switching/cleanup, real completion records, malformed/blocked storage handling, reduced motion, scroll cues and no entrance replay. Settings, Controls, selected-chapter behavior and actual Start navigation passed; downstream targetHTML is intercepted for the navigation assertion.
- Installed standard client reaches mode menu with no error artifact; latest state/page inspected. Its fast-forward capture showed partial text rasterization; a separate natural-input native capture without virtual stepping displays complete titles and zero unfinished animations. Natural-input screenshot inspected; no production animation change made to accommodate the harness.
- Initial diagram data-chapter attribute collided with chapter-button selectors; changed it to data-equipment. The4px card offset was caused by specificity on short-screen heading margins; fixed and existing strict geometry assertion passes.
- Syntax/targeted whitespace checks pass. Server4187 retained; no commit/deploy.

## Performance

Sequential native Chromium checks, no overlapping performance jobs:

- Before:63.7/54.0/50.9ms task time per3sec.
- Final smoothness run:62.2/59.9/72.5ms per3sec; zero idle layout, background-art copies or observed layer paints. Particle motion on59/59 intervals; blur pauses it with zero paints.
- Separate chapter-by-chapter run:88/132/95/98ms per3sec on this shared host. Every selection had zero game-renderer frames/presents, art copies and layout work. Unfocused48ms/hidden69ms also produced zero game presents/copies/layout.
- Task timings vary between runs and do not establish a speedup. Static changes retain the stopped game renderer and smooth existing atmosphere; browser task time is not a GPU measurement or guarantee for another browser's video playback.

Evidence: output/menu-chapter-detail, including baseline, protected hashes, final-source, layout, features, client/client-settled, before/after and runtime. All ten items complete; no remaining work in this pass.
