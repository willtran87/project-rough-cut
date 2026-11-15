# Level 1 station paperwork and printed completion

Partial V01/V08/V18/V19 progress in the full 35-item/V01–V21 visual upgrade. This pass improves four physical documents and their completion marks; it does not accept the whole prop, typography, shadow or level presentation requirements.

## Authored change

`web/course-station-paper.js` draws integer-texel 5×7 capitals, ruled fields, checkboxes, document identifiers, restrained paper fibres, folded edges and receipt perforations. Field Log, Release Review, stamp copy and issued receipt now have distinct layouts. The four maps are 256×320, 192×256 and two 128×128 textures: 163,840 texels total, approximately 640 KiB RGBA before mipmaps. They are generated once, use nearest magnification/mipmapped minification and zero-emissive Lambert lighting. Each document is a thin solid sheet with blank edges/back and an authored front, rather than an extra plane over another receiver. Each owns its geometry, material and texture.

The Field Log is narrower and shifted between its left post and press so its title and table can be read. The release clipboard, press contact height, receipt animation and station anchors retain their existing physical roles. Existing loose papers and the response page are unchanged and still need the wider paperwork-family pass.

The old raised red completion blocks on these two stations are replaced with a bordered FILED impression made from merged, flat pixel-stroke quads. The release impression fits below SIGN OFF inside its box; the log impression fits the supported stamp copy. Ink sits 0.5 mm above the stock, receives light/shadow and casts no separate shadow. It uses the existing cached seal material family, with no new ink texture or per-pixel draw calls. The existing completion flag still controls visibility; incomplete/cancelled filing leaves no ink. Receipt lettering is part of its own authored map.

No lighting source, ambient value, path-lantern arrangement, Joe/mower, apparition or gameplay rule was changed. Cache versions in the Level 1 entry and module imports were advanced.

## Verification

- `tools/verify-station-mechanisms.mjs`: quiet/loud timing and contact, durable completion, cancellation, comfort, one-shot replies and reduced motion pass.
- `tools/verify-station-mechanisms.cjs --paper-audit`, native and software: 16 views each. Actual keyboard quiet filing, movement cancellation, loud filing, receipt ejection, lever motion, pause, repeated Use, looking-away rejection, persistent results and reduced motion pass. No page/console errors.
- Viewports: 2560×1600, 1280×720, 844×390 and 390×844. Native high view renders 2492×1402; ordinary 1193×671; portrait 379×833. Software frozen desktop is 960×540, with lower live-client resolution remaining a limitation.
- Native prepared/settled: 107 programs, 112 textures, one allocated presentation target. Software: 116 programs; 112→113 textures corresponds exactly to three→four allocated render-target textures after responsive resizing. Surface texture count remains constant. An earlier fixture incorrectly compared total textures without separating the new portrait target and failed; `final-software-verified` and final `ink-software` pass the corrected accounting.
- World rebuild disposes all four new paper geometries/materials/maps exactly once on both renderers. No per-frame paper uploads are required.
- `comparison.json` compares all 16 native views against the pre-paper baseline and verifies unchanged path-lantern data. Programs remain 107; four document textures are added. Rendered draw deltas range −3 to +5 and triangle deltas −598 to −96, depending on view/state. These counts include actual render/shadow work and do not establish a frame-rate improvement.
- Installed web-game client, via `verify-presented-client.mjs --level-one --station-paper`: current native Release Review uses real E input for two bursts; software Field Log uses real 1 input and held-still time for two bursts. Final client evidence is stored in `ink-client-native` and `ink-client-software`.

Final mechanism evidence: `output/level-one-station-paper/ink-native` and `ink-software`. Before-paper evidence: `before-native`. `physical-native` shows the authored documents before the flat-ink refinement. Earlier quantized overlays, face-shadow and receiver-bias experiments are not accepted production variants. The final paper material has no custom shadow bias or light quantization.

## Remaining acceptance issues

Faint faceted shadow patterns remain visible on the native Release Review sheet. A diagnostic that disabled only paper shadow reception removed the pattern, but disabling reception is not the production solution. The thin-sheet construction and a rejected receiver-bias experiment did not fully resolve it. V11 remains open.

Portrait framing can crop the sides of the close release assembly; contextual messages can cover the lower form. Wider narrow-screen framing, the loose-paper family, whole-route typography, composition and shadow quality remain unaccepted. Software live gameplay still reduces its render target substantially; this pass does not establish high-resolution software parity or whole-level performance.

Follow-up: the native shadow-edge pass isolated the pale-paper bands to timber/sign moon shadows and substantially reduced them with native PCF filtering. See `level-one-shadow-filter-2026-11-14.md` for current evidence and unchanged software limitations. The earlier observation above records the state at the paperwork pass.
