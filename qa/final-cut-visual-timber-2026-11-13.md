# Final Cut timber and roof finish

This pass finishes the close timber construction work in FV29 and progresses FV28/FV34. Overall Level 1 parity and the full 72-item goal remain open.

## Implementation

- Timber uses the member's longest local axis for lengthwise grain. Cut ends use the two transverse axes, with offset pith, small irregular rings and a narrow check. The pattern is quantized to 3mm and fades with screen footprint to avoid distant high-frequency rings. The existing authored wood atlas supplies the color and grain; no new raster or texture allocation was introduced.
- The three shelters retain their individual roof profiles, 1,070 overlapping slates, 22 corrugated sheets, ridge sections, 91 bowed ceiling boards and 84 bolted brace plates. Added 84 selectively chipped slate outlines, millimetre seating variation, 48 timber pegs, finished fascia lengths and fasteners, six open half-round gutters, and connected downpipe outlets. Removed inappropriate repeated metal bars over slate; pump sheet fasteners remain specific to its construction.
- Moved the pavilion XVIII plaque in front of its king-post trim after a close view revealed the lettering was obscured.
- Close inspection found two pre-existing floating corner posts at low walls. `REFUGE_TIMBER_POSTS` now derives each bearing height from actual wall geometry; the two east posts extend to the low bunker/pavilion masonry. Visual posts, ball bounds and sight occlusion share their dimensions. All post footprints are within existing wall footprints. No new traversable-floor obstruction, input binding or attack timing was introduced.

## Evidence

Artifacts are under `output/final-cut/visual-timber/`.

- `accepted/report.json`: seven final-source hardware views at native2560x1600, including close eave/end grain, bunker and pump joints, roof, gutter and pavilion gable/support. Real keyboard strafe; actual1920x1080,1280x720,844x390,390x844 targets, no errors or overflow. Close screenshots and portrait inspected.
- `software/report.json`: same seven final-source views and responsive checks, no errors. Initial2560x1600 viewport renders960x600; ordinary desktop960x540; small landscape/portrait native. Bunker eave inspected at the software tier.
- `bounds.json`: actual production builder compared with pre-pass source. 1,418 changed pieces remain overhead or within a wall/shared timber envelope including thin hardware. Twelve post feet are supported by real walls; the two long posts share sight bounds, while the adjacent low-wall opening remains visible. An actual chip plan clears the low masonry and strikes the visible pavilion timber.
- Existing masonry-envelope, ball,32-case cardinal ambush, and crossing/complete simulation-route tests pass after shared post bounds changed. Ball tests include30/60/120Hz, wall/roof rejection, real Use recovery, bounded inventory and full routes. Crossing tests retain both route choices and cover behavior.
- `routes/browser.json`: preliminary compact three-entry route pass,17 images originally captured, no captures/errors. This predates the supported-post correction; only the preliminary report is retained after the final run superseded those images.
- `client/state-0.json`: initial installed client passes intro and keyboard movement at960x540, ready/playing y9.531; it predates the last fascia/post corrections. Final client result is recorded below when terminal.

## Browser route harness repair

The combined `--balls --crossings` run exposed an assumption in the harness. `route-diagnostic/garage-ball-timeout.json` records a released ball at(16,67.12) while Joe was at(-29.006,50), with zero redirects after landing. The bank can reduce hearing range to24m. Releasing during an announcement at the far headland does not establish an audible shot.

The harness now waits for a nearby committed middle pass before charging, verifies an actual heard landing, then requires the next ball-selected strip. It retains real Gamepad API input, all interaction assertions and no live-state placement. The drain fork uses counter deltas so a second shot is verified when both options are enabled. Its camera turn now finishes before waiting for the nearby pass, so turning does not consume the hearing window. `--route` allows isolated diagnostic reproduction; reports describe the number of routes actually run. No gameplay hearing rule was relaxed.

The isolated repaired drain run passes both heard diversions, open crossing, bell, collapse and completion with zero captures/errors. `client-final/state-0.json` and inspected `shot-0.png` confirm the installed client completes intro and actual movement on final source: ready/playing, y4.737,960x540, no error artifact. The shorter choreography preserves all three intro advances and a movement burst.

`routes-final/browser.json`: final-source combined run passes all three real direct/garage/drain entries. Bank/open crossings, actual crouched retreats, four heard/selected balls (one direct, one garage, two drain), pump, bell, physical collapse, road and completion all pass. Zero captures and browser errors. Twenty representative screenshots retained. Completion screenshot inspected. The seated-Joe fixture screenshot is obstructed by the intentional reed screen: its actor-parent/contact assertions remain functional evidence, not visual proof of Joe's appearance. Move the inspection camera inside the bay before the forthcoming hero-machine/actor art review.

## Remaining scope

FV28 still needs the garage/bay roof and final ridge/material comparison against Level1. Refuge identity/equipment, wider material repetition, lighting, hero mower/Joe, physical terrain/water/effects, story/UI, matched references and complete performance/acceptance remain open. These static fixtures and a short strafe do not prove all-angle motion stability or the complete performance budget.

The11 initial ground-view PNGs and30 superseded preliminary/diagnostic route PNGs from this pass were discarded after confirming their absolute directories; reports and diagnostic state remain. Final close hardware/software images,20 final route captures and source snapshots are retained. All launched verification processes are terminal; server4187 stays running.
