# Distraction Signal-Lane Polish — 2026-08-02

## Scope

This pass began by auditing the existing ordinary-input success route. That route predates the expanded 720-meter course and now ends near the practice area instead of reaching victory, so the victory branch was not changed without current visual evidence. Its live landing frame exposed a supported gameplay issue: an active golf-ball Distraction, landing consequence, Joe dialogue, threat caption, and unrelated nearby-hazard plaque could compete in the same center-field lane.

## Changes

- Extended the existing ambient context arbitration to golf-ball distraction handoffs. While the localized Distraction marker and landing consequence are active, unrelated blocker, practice, and hazard plaques yield.
- Extended that deferral through an active Joe-dialogue or threat-caption lane. World art, hazard rings, reflective glints, the map, and the Surroundings model remain available while text plaques yield.
- Added an eight-meter safety exception. An imminent untriggered noise hazard always restores its warning even during dialogue or captions.
- When that imminent warning appears over an occupied subtitle lane, its plaque shifts laterally away from Joe and receives a restrained tether back to the hazard. Ordinary hazard labels retain their established position.
- Kept actual collision feedback outside this arbitration. The authored orange collision footprint and `BLOCKED BY` contact card remain visible during a Shot Craft impact or subtitle sequence.
- Updated the context-cue text-state contract with the deferral reasons `active_distraction_handoff`, `joe_dialogue_lane`, and `threat_caption_lane`.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed with only the repository's existing line-ending notices.
- The official Shot Craft impact route stayed in `first_hole`, retained the hedge art, collision footprint, `BLOCKED BY HEDGE HIDE` card, impact caption, and Fairway Run message, and produced no browser error artifact.
- The official standard hazard approach remained unchanged: `SPILLED RANGE BALLS / WALK WIDE / 23m` rendered in its normal position with no subtitles competing for the lane.
- A bounded direct-browser landing replay reported `contextCue.kind: none` with `deferredBy: active_distraction_handoff` while the landing message was active.
- Four seconds later, the same replay reported `deferredBy: joe_dialogue_lane`; the unrelated hazard plaque remained absent underneath Joe's search line.
- Moving to 6.24 meters from the hazard restored `contextCue.kind: noise` during pursuit. Visual review confirmed the side-shifted plaque and tether remained clear of Joe, the contact-break card, the map, and the bottom consequence rail.
- Every direct browser closed in a `finally` block. Final process cleanup found no remaining Playwright browser.

## Evidence

- `output/polish-distraction-caption-lane-regression-2026-08-02/shot-0.png`
- `output/polish-distraction-active-final-2026-08-02.png`
- `output/polish-distraction-dialogue-final-2026-08-02.png`
- `output/polish-distraction-final-standard-regression-2026-08-02/shot-0.png`
- `output/polish-distraction-imminent-noise-final-offset-2026-08-02.png`

## Follow-up

- Author a new repeatable ordinary-input success route for the current 720-meter course before making evidence-based changes to the victory screen. The existing `mature_escape_linger.json` route stops at approximately 50 meters and should not be treated as victory coverage.
