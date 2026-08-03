# Emergency Appeal focus polish — 2026-08-02

## Outcome

The Emergency Appeal is now the sole survival-critical presentation owner from the moment its 10–26 meter filing window opens until Joe's 3.6-second review ends. The chase card retains the input, CR code, +650 forfeiture, and review duration; after filing, the review card retains the live countdown and `MOVE NOW` instruction.

Generic Joe-state banners, the bottom message/prompt rail, locomotion labels, Joe barks, and threat captions yield during this window. Delivery awards earned while the review is active are held with their remaining display duration and resume after the appeal releases the signal lane, so scoring feedback is not lost.

The text-state contract matches the canvas: hidden message and prompt values are `null`, their source copy remains available, `emergency_appeal` identifies the deferral owner, and Delivery visibility reports the deferred state honestly.

## Validation

- `node --check web/game.js`
- `git diff --check`
- Required official browser-client pass using `web/test-actions/noise-hazard-approach.json`; it remained in live gameplay, produced no browser error artifact, and sampled 1.93 ms average canvas render work.
- Dedicated Emergency Appeal replay covered every blocker (`no_change_request`, `joe_not_chasing`, `too_close`, `too_far`, and `already_used`), keyboard/gamepad/touch copy, activation, duplicate-use rejection, moving recovery, review expiration, point-blank capture, Reduced Camera Motion, and the final scorecard. It completed with `errors: []`.
- Visual review covered the ready decision, initial review, running recovery, Reduced Camera Motion, capture, and scorecard frames. The running frame showed the review card alone; its simultaneously earned Delivery award was deferred rather than drawn over the countdown.

## Evidence

- `output/emergency-appeal-validation/01-appeal-window.png`
- `output/emergency-appeal-validation/02-review-active.png`
- `output/emergency-appeal-validation/03-running-recovery.png`
- `output/emergency-appeal-validation/04-stood-still-capture.png`
- `output/emergency-appeal-validation/05-reduced-window.png`
- `output/emergency-appeal-validation/06-reduced-active.png`
- `output/emergency-appeal-validation/07-appeal-scorecard.png`
- `output/emergency-appeal-validation/validation-log.txt`
- `output/emergency-appeal-polish-official-final-2026-08-02/shot-0.png`
- `output/emergency-appeal-polish-official-final-2026-08-02/state-0.json`

Every Playwright browser context closed after validation. The existing local server on port 4173 was intentionally preserved for player testing.
