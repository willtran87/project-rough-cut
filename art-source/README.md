# Directional art masters

Generated with the built-in image tool on 2026-09-13, using the existing Rough Cut art as references. The user explicitly authorized local image processing after shed generations repeatedly returned opaque backgrounds.

`tools/prepare-directional-art.py` uses Pillow to produce the runtime PNGs under `web/assets/`. It removes border-connected neutral checkerboard from the shed, removes neutral checkerboard inside the open cart cab, discards detached neighboring-frame remnants, and aligns Joe's four walking poses to a common ground baseline. Left poses mirror the complete right poses; the generated left mower was clipped. Original files remain preserved here and in the generator output directory.

- Shed source: `rough-cut-shed-directions-v1.png`; runtime: `rough-cut-shed-directions-v2.png` (four views).
- Joe source: `rough-cut-joe-walk-generated.png`; runtime: `rough-cut-joe-walk-directions-v2.png` (three directions × four poses). The older four-view source is retained for reference. The existing front animation remains in use.
- Cart source: `rough-cut-cart-directions-generated.png`; runtime: `rough-cut-cart-directions-v1.png` (four views).

These are source masters, excluded from the static `web/` deployment. Rebuild with `python tools/prepare-directional-art.py` in an environment with Pillow installed.
