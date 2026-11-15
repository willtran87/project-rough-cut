# Campaign publication — November 13, 2026

This release captures all non-ignored local files from the project workspace, including Level 1, Back Nine, Under the Green and Final Cut. The source snapshot contains 2,646 files (502,995,259 bytes), individually SHA-256 verified before release edits. Ignored browser output and packaged builds are not committed.

## Release fixes

- Recursively inspect runtime JavaScript/HTML, including the baked material manifest, for image references.
- Use explicit URLs for Final Cut atlases, story frames, Joe expressions/garments and Under the Green surfaces. The resolved URLs and gameplay behavior are unchanged.
- Omit three obsolete runtime images: the two earlier Final Cut road endings and Under the Green masonry v2. Each is byte-identical to its retained source under `assets/`.
- Update the stale Under the Green save assertion to verify version 4 completion-only persistence, discarded partial attempts, and compatibility with completed version 1–3 saves. No save behavior changed.

## Validation

- Release gate: PASS; 103 referenced images, 74.13 MiB, zero missing/unreferenced images, 90 action scenario files validated. This does not mean all 90 scenarios were replayed.
- Syntax: 407 checks across non-vendor runtime JavaScript and the release verifier, without errors.
- Local import resolution: 1,089 references, zero missing modules.
- Final Cut simulation and expression rules: PASS.
- Back Nine simulation: PASS.
- Under the Green simulation: PASS after correcting the outdated save expectation; includes live-Joe route completion checks.
- Chromium software-renderer smoke: Level 1 reaches its gate/menu; Back Nine, Under the Green and Final Cut reach active gameplay with no page/console errors or failed HTTP responses. Screenshots use a 1920×1080 viewport; renderer fallback resolution remains in effect.
- Final Cut's first live screenshot exceeded the 30-second capture timeout. The isolated retry reached gameplay, paused through Escape, and captured successfully with a longer screenshot timeout. This is a startup/load check, not frame-rate acceptance.
- The first browser harness waited for Back Nine readiness before dismissing its opening, which intentionally defers preparation. The corrected harness dismisses the story using its normal button before waiting.

Logs and screenshots are retained in `output/publish-validation/` in the release checkout, and are ignored by Git.

## Scope and storage limitations

The Final Cut 72-item visual plan remains incomplete: canonical ledger counts are 19 complete, 28 in progress, 25 pending. Software rendering performance and physical-device qualification remain open. The separate high-detail Joe head candidate staged on I: is not installed or included. This release does not imply those remaining requirements are complete.

C: had no free space. Release preparation used `G:/CodexArtifacts/project-rough-cut/publish-20261113`, cloned from the same origin and populated from the verified workspace snapshot. The user approved relocating two archived test-output folders, but automatic approval review still rejected both the combined and narrowed relocation commands. Neither original was removed or replaced with a link. The original C: checkout's Git metadata remains unchanged; use the G: checkout for the published branch until storage is available to synchronize C:.

The existing GitHub Pages workflow verifies the release and deploys `web/` when this change is merged into main. Deployment success and live-content parity must be confirmed after the merge.
