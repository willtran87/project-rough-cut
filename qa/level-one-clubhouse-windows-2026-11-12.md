# Level 1 Clubhouse empty rooms — 2026-11-12

Advances Z4/V9 and current list items 26/33/34/44. Full crossing composition,
encounter pacing and human horror acceptance remain open.

The Clubhouse's lit windows now show empty furnished interiors: paneled walls,
checker flooring, ceiling fixtures, framed landscapes, tables, empty chairs,
abandoned paper and narrow curtains. Interior ray intersections respond to the
viewing position, while curtains and mullions stay fixed to the window. The
rooms are scenery behind apertures, not navigable rooms or reflected geometry.
No time animation or flashing is introduced.

Wing centers moved from +/-4.35 to +/-4.50 world units so their outer windows
sit beyond the central body's wall rather than being buried in it. The building
remains beyond the course boundary. Gameplay collision and AI are unchanged.
All 51 lit apertures share one 102-triangle batch and one shader, with no new
textures, lights or render targets. Unlit windows and other buildings retain
their existing materials.

Interrupted building construction clears the collection mode and disposes the
window module. Repeated finish/dispose calls and calls after disposal are safe.
World cleanup removes the owned mesh before generic world traversal.

## Evidence

- `node tools/verify-clubhouse-windows.cjs`: final session 35648 exit 0, five
  check groups and zero browser errors. Earlier 6988 also passed.
- Inspected approach, crossing and departing viewpoints at 2560x1600, plus
  crossing at 1280x720, 844x390 and 390x844. The rooms are legible as illuminated
  depth at desktop sizes; fine furniture detail naturally diminishes at small
  sizes. Existing portrait letterboxing remains.
- Actual D input moves the player from (70,325) to (70,312.47). Room apertures
  stay anchored across movement, actual pause and reduced motion.
- Same-camera room-on/flat-pane comparison changes 108,309 pixels by more than
  three luminance levels, bounded to (949,648)-(1832,1209). This isolates the
  visible room treatment, not a frame-rate or emotional-quality measurement.
- Twenty warmed presentations retain 935 geometries, 106 textures and 73
  programs. Original baseline had 935/106/72; no sustained FPS claim.
- Actual scene rebuild disposes the old aperture geometry and material exactly
  once, detaches the old batch and creates one replacement containing 51 panes.
- Installed gameplay client session 6895 exit 0, two arrival input iterations:
  final page-1 and state-1 inspected, first_hole, no browser-error artifacts.
  Existing readiness failures remain hidden_collision_owned_by_parent_art and
  gameplay_frame_budget.
- JavaScript syntax checks pass for clubhouse-windows.js and pixel-buildings.js.

Artifacts: `output/clubhouse-windows/current/` and
`output/clubhouse-windows/standard-client/`. The legacy baseline screenshots
remain under `output/clubhouse-windows/baseline/`.

Remaining: natural-route crossing composition, beacon/window interaction,
night-display readability, device performance and human recognition/terror
acceptance. This pass does not complete the broader Level 1 objective.
