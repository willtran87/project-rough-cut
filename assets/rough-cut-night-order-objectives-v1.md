# Rough Cut Night Order objectives v1

This three-station production atlas was created with OpenAI image generation on 2026-08-04 to give every mandatory Night Order field check its own authored world object.

## Files

- `rough-cut-night-order-objectives-v1-chroma.png` — preserved generated source on a flat magenta chroma field.
- `rough-cut-night-order-objectives-v1.png` — transparent runtime atlas.

## Runtime cells

| ID | Source rectangle | Use |
| --- | --- | --- |
| `audit_bell` | `x 62, y 65, w 466, h 752` | Heavy brass bell and pull rope for Check 1 |
| `field_log` | `x 636, y 101, w 486, h 716` | Lit ledger-stamping kiosk for Check 2 |
| `release_review` | `x 1227, y 55, w 495, h 762` | Review gong, clipboard, and approval lever for Check 3 |

The exact alpha bounds isolate each station from its neighbors, while each authored turf base meets the world-projected ground plane. Interaction rings, focus labels, completion state, noise response, navigation, and collision remain runtime-owned.

## Generation prompt

> Use case: stylized-concept. Asset type: production sprite atlas for a high-resolution 2.5D first-person pixel-horror golf-course game. Primary request: Create one wide three-cell atlas containing three completely separate, full-body outdoor Night Order objective stations, matching the reference image's high-detail pixel-art rendering, perspective, material richness, scale, and dark horror-comedy tone. These are new designs, not edits or copies of the reference. Cell 1 subject: an unmistakable heavy brass audit bell on a crooked rain-dark timber post, with a thick pull rope, small golf-ball finial, oxidized bolts, and a planted mossy turf base. Cell 2 subject: a weatherproof black-iron field-log stamping kiosk with an open cream ledger, an oversized mechanical stamp lever, brass paper guides, dim caged task lamp, and planted muddy turf base. Cell 3 subject: a dramatic release-review approval station with a large blackened-brass circular review gong, a signature clipboard, one heavy acceptance lever, amber caged lamp, and planted dead-grass turf base. Composition/framing: 2048x1024 landscape; three equal vertical cells left-to-right; one centered object per cell; identical baseline and comparable visual mass; generous clear gutter between cells; every object fully visible with padding; three-quarter front view suited to grounding on a perspective course plane. Style/medium: extremely detailed high-resolution pixel art, crisp intentional pixel clusters, dark gothic golf-course hardware, weathered brass, iron, timber, moss, rain beads, restrained moonlit rim lighting; visually consistent with the supplied reference atlas. Lighting/mood: haunted executive golf course at night, cold blue-green moonlight with restrained warm practical lights; readable silhouette and material separation. Scene/backdrop: perfectly flat, uniform solid #ff00ff chroma-key background across the entire canvas. Constraints: the background must be one uniform #ff00ff color with no shadows, gradients, texture, floor plane, fog, reflections, or lighting variation; keep all three subjects fully separated from the background with crisp edges; do not use #ff00ff anywhere in the objects; no overlap across cells; no cast shadow beyond the small authored turf bases; no text, letters, numbers, logos, watermark, border, grid lines, UI, character, person, mower, or loose floating pieces.

The existing `rough-cut-course-mechanics-atlas-v1.png` was supplied as a visual-style reference only.

## Transparency pass

The runtime alpha image was produced with `remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`. The detected key was `#fa02f9`; 956,719 pixels became fully transparent and 33,637 received partial alpha. Direct inspection confirmed transparent corners, clean station silhouettes, and no neighboring-cell fragments.
