# Secondary Menu Branches Polish — 2026-08-02

## Scope

This pass reviewed the two remaining main-menu branches that do not begin or replay the course: `SUBMIT CHANGE REQUEST` and `CLOCK OUT`.

## Changes

- Replaced the sparse black Clock Out card with an authored alternate-ending composition: a layered pre-dawn course silhouette, horizon glow, foreground grass, restrained motes, and a centered personnel-action dossier.
- Preserved the branch's quiet contrast with pursuit gameplay while carrying Rough Cut's green, amber, and off-white interface language into the screen.
- Added a concise story consequence: the Night Order remains unsigned while Joe's calendar remains committed.
- Added a framed, input-method-aware return action. Keyboard now advertises and accepts Click, Enter, Space, or Escape; controller advertises A or B; touch advertises Tap.
- Made Clock Out animation respect Reduced Camera Motion: grass sway and prompt pulsing become steady while the information remains visible.
- Removed the Change Request copy mismatch. The visible reason now comes from the authoritative status string instead of maintaining a second hard-coded phrase.
- Added Escape dismissal for the rejected Change Request state, matching the existing controller B behavior.

## Validation

- `node --check web/game.js` passed.
- `git diff --check` passed with only the repository's existing line-ending notices.
- The official web-game browser client rendered the refined Clock Out screen without console or page errors.
- The official return route entered Clock Out and returned to `menu` with Enter.
- The official Change Request route remained in `claim`, displayed `unauthorized scope in the rough.`, and produced no browser error artifact.
- A direct headless-browser input check confirmed Escape transitions `claim → menu` and `clocked_out → menu`; its browser closed in a `finally` block.
- Final visual review confirmed the Clock Out dossier, horizon, course silhouettes, foreground grass, and return control remain legible at the authored 1280×720 canvas size.

## Evidence

- `output/polish-clock-out-refined-2026-08-02/shot-0.png`
- `output/polish-clock-out-return-verified-2026-08-02/state-0.json`
- `output/polish-claim-refined-2026-08-02/shot-0.png`
- `output/polish-claim-refined-2026-08-02/state-0.json`
