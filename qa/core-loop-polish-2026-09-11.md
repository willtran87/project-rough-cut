# Core loop clarity and interaction polish

The primary HUD now states the immediate action: practice a chip, use a station,
reach its breakaway cover, hold in cover, escape a footing hazard, break Joe's
sightline, or finish filing. It shares the existing objective resolver so tactical
instructions take priority over the longer course objective.

Check progress remains visible alongside explicit access state (KEY HELD, VALVE
OPEN, or EXIT LOCKED). Completing a station briefly displays CHECK N/3 COMPLETE
before returning to persistent progress. Existing sound, world stamps, Clean Break
rewards, and station consequences remain connected to the same completion event.
Detection copy names what Joe saw, heard, or found when those states own attention.

Committing an exit consumes the movement direction already held while approaching.
The player stays still while filing; Joe continues moving. Releasing movement
clears the input latch, so a subsequent movement cancels. Changing direction also
cancels. This avoids accidental immediate cancellation from keyboard, stick, or
touch pad input without removing deliberate cancellation.

The filing panel uses larger text and a progress percentage on small screens.
Its touch layout clears the movement and Use controls. Desktop terrain and
inventory now occupy separate rows after screenshot review caught an overflowing
combined row. The script version URL is updated for the next deployment.

## Validation

- `node tools/verify-core-loop.cjs`: six groups pass, with no browser errors.
  Covers practice guidance, check completion and persistent progress, cover/hold
  guidance, both exits through victory with held approach input, deliberate
  cancellation, synthetic controller/touch input, and explicit chase copy.
- `node tools/verify-shed-clearance.cjs`: all 36 approach-to-victory cases pass
  across the three variants, including straight movement through the former gate.
- `node tools/verify-gameplay-polish.cjs`: existing 12 regression groups pass.
- `node tools/verify-release.mjs`: syntax/static validation and all 48 runtime
  assets pass; 89 action fixtures parse. This does not execute all 89 fixtures.
- Official skill client deep route replay: 57/57 runtime readiness checks pass,
  no error artifact. Final HUD adjustment also receives an opening gameplay replay.
- Actual screenshots inspected at 2560x1600, 1280x720, 800x600, and 844x390.
  Captures and JSON reports are in ignored `output/core-loop-2026-09-11/`.

The focused tests inject prerequisite state through test-only source interception;
they do not demonstrate a complete natural-input playthrough from a new save.
Controller and touch checks are synthetic, not physical device qualification.
Automated correctness and screenshot checks cannot establish how enjoyable or
replayable the game feels to new players. Next useful validation is first-time
playtesting: unaided objective comprehension, first check completion, reasons for
failed runs, and voluntary replay.

## Branch reconciliation and publication

Fetched all remote branches before publication. Only main and the legacy gh-pages
branch exist, and there are no open pull requests. The gh-pages tree at bb6a8a1
exactly matches main's historical web tree at bfd3ead (tree
a0fb5f036a606a249979dc71873d36482b99a829). It contains no independent source changes
to merge. Preserve that historical deployment branch; publish the tested source
from main through the existing GitHub Actions Pages workflow.
