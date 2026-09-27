# Rough Cut visual direction

Revision: September 26, 2026. Preserve the nighttime course, weathered equipment and workplace-horror character. This is the implementation reference; player recognition and accessibility acceptance remain separate tests.

## Palette and hierarchy

| Role | Treatment | Non-color cue |
| --- | --- | --- |
| Required action | Pale mint edge, cream text, dark panel | Action verb, check number and route geometry |
| Immediate danger | Warm amber escalating toward orange | Explicit Joe state, counteraction and detection bar |
| Traversable ground | Muted olive, quiet texture, slight value lift | Continuous ground plane and directional reflectors |
| Solid cover | Darker mass with a readable ground contact | Physical silhouette, contact boundary and cover state |
| Optional reward | Restrained gold | BONUS / OPTIONAL text; never counted as a required check |
| Background | Blue-black trees and low-contrast fog | Distant silhouettes, no interaction treatment |

Representative UI colors: panel `#030f0b`, primary text `#eef3df`, route `#b6dfd1`, reward `#eacb88`, warning `#edc783`, immediate threat `#ffad89`. Do not communicate an essential state through color alone. Preserve dark surroundings rather than lifting the entire scene to daylight.

## Light, materials and scale

Moonlight defines cool exterior edges. Lamps, the floodlight and the shed doorway supply localized warm light. Rough grass, weathered timber, oxidized metal and damp stone share restrained highlights. Avoid white transparency fringes, opaque atlas gutters, polished plastic highlights or detached ground shadows.

Keep sprite ground anchors at feet, tires or foundation. Walk cycles advance through actual movement distance. Stopped actors do not continue a walking bob. Direction selection uses hysteresis to prevent rapid front/side switching at a boundary. Reduced motion preserves state labels and threat color while removing unnecessary movement.

Runtime atlas cells must exclude neighboring frames and source gutters. Source masters stay in `art-source/`; the shipping page loads only the processed assets. Inspect all four supported headings before replacing a directional asset. Do not make a passage look traversable if its collider is closed.

## Text and information ownership

The reference canvas is 1280 × 720; CSS scaling and letterboxing determine the actual size on screen. Check 2560 × 1600, 1280 × 720, 800 × 600 and 844 × 390 browser viewports. Large text is tested at 130%.

Target essential gameplay instructions at approximately 16 CSS pixels or above in the smallest landscape viewport. Compact HUD uses a larger canvas font; short primary labels must fit without clipping. Settings secondary copy should remain at least approximately 12 CSS pixels. These are project targets, not an accessibility certification. Do not count tiny optional world captions as replacements for an essential HUD instruction.

| State | Primary instruction | Deferred information |
| --- | --- | --- |
| Quiet exploration | Next required check or exit-access item | Optional reward details until approached |
| Aiming | Hold, aim, release and landing feedback | Generic control lesson |
| Chase | Break sight or change route | Basic onboarding |
| Check activation | Check saved, then escape signal | Optional reward claims |
| Cover hold | Hold position for the optional clean break | Distant objective description |
| Collision | Viable clearance direction | General route caption |
| Locked exit | Exact missing check/access condition | Filing prompt |
| Filing | Hold still; new movement cancels | Other interactions |

Focused HUD has two shallow cards and a map opened on demand. Compact presentation suppresses duplicate route/cover ground captions; ground geometry remains. H / controller Y says MAP everywhere.

## View review and landmarks

Latest reference captures are under `output/a-grade-closure/acceptance/`. The two `zone-review-*.png` contact sheets cover eight zones × four headings. Individual images retain full resolution. Capture positions are chosen outside collision footprints, with at least ten world units of obstacle clearance. Menus, bindings, pause and results are additionally captured under `output/a-grade-closure/ui/` at four sizes, with controller/touch variants and long remapped keys.

| Anchor | Preserve and emphasize | Review notes |
| --- | --- | --- |
| Opening (`tee-north.png`) | Hedge tunnel, cart, route and clear movement lane | Route and HUD remain readable in grayscale; do not add foreground text |
| Water (`water-north.png`) | Pond edge and tall floodlight | Light marks a place and a risk; preserve an unlit alternative |
| Maintenance (`maintenance-north.png`) | Narrow hedge passages and machinery | Arches now use fixed course-facing planes and side thickness; hedge width expansion no longer increases its height. Physical wings and passage colliders are preserved. |
| Exit (`exits-north.png`) | Warm shed doorway and low drain silhouette | Both approach lanes must stay physically clear; no decorative final gate |

The remaining zones use the audit rows, exposed clubhouse crossing, old green and abandoned range carts. Human recognition of these landmarks has not been measured. A four-heading screenshot audit is useful evidence, but is not equivalent to approval of every prop or to a first-time-player study.

Grayscale and approximate protan/deutan diagnostic transforms are generated by `tools/visual-contact-sheet.py`. The expanded audit includes chase, station, cover hold, filing, menu, settings, defeat and victory, under `output/a-grade-closure/diagnostics/`. Obtain direct feedback from players with color-vision differences before declaring the full accessibility gate complete.
