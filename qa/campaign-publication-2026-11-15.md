# Campaign publication — November 15, 2026

User authorized committing all local changes, pushing, merging to main and publishing GitHub Pages. The initial snapshot is `e9f6118`; it includes all non-ignored local files. The newer November 13 published history was merged without changing the local runtime snapshot; its publication report was retained.

Release preparation resolves the stale dynamic-image asset scan using recursive runtime-source scanning and an explicit manifest of computed image paths. All 137 referenced images pass existence/header checks (131.55 MiB); no unused runtime images or source masters remain in the bundle. Eight obsolete images are preserved byte-for-byte in `assets/archive/runtime-20261115/`. A deliberately missing dynamic image still causes the gate to fail. All 90 action JSON fixtures validate; this is not a claim that every fixture was replayed.

The outdated Under the Green save test was updated to the existing version 4 completion-only persistence contract, including legacy-save compatibility. Gameplay save behavior was not changed for publication.

Completed checks before merge:

- Syntax: 540 non-vendor JavaScript files, no errors.
- Local module paths: 1,436 import references, none missing.
- Back Nine and Final Cut simulation suites: pass.
- Campaign progression unit checks: pass.
- Browser campaign flow: pass, with actual chapter loads, fixture outcomes, guarded entry, earned replay and loss retries; no page errors.
- Under the Green simulation suite: pass (live-Joe completion from all checkpoints and pressure settings; version 4 save contract).
- Release verifier: pass, no warnings or failures.
- Archive: all eight moved images are byte-identical to their former runtime copies.

The GitHub Pages deployment is triggered by the merge to `main`; its result is recorded in the merge pull request. This release does not certify physical-device support or resolve all documented software-renderer and visual-backlog limitations. Browser output and packaged builds remain ignored by Git.
