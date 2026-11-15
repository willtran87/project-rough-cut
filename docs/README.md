# Documentation index

Current entry points, reviewed November 15, 2026. Start with the [project overview](../README.md), [browser/player guide](../web/README.md), and [development guide](development.md).

## Which documents describe the current build?

The READMEs describe the local working tree. Dated QA reports qualify only the source, scenarios and hardware they actually tested. Design proposals and review findings are not proof of implementation. JSON ledgers track individual work items; inspect their evidence and unresolved entries before treating a whole plan as complete.

| Area | References |
| --- | --- |
| Runtime art and presentation | [Pixel 3D direction](../design/pixel-3d-art-direction.md), [world/presentation contract](../design/world-and-presentation-contract.md), [action/response contract](../design/action-response-contract.md) |
| Night Order | [Single playable chapter](../qa/level-one-single-chapter-2026-11-14.md), [chapter picker](../qa/chapter-picker-2026-11-14.md), [visual upgrade plan](../design/level-one-comprehensive-visual-upgrade.md) |
| The Back Nine | [Experience implementation](../design/back-nine-experience-implementation.md), [visual ledger](../design/back-nine-visual-implementation-ledger.json), [Windows software launcher/evidence](../qa/back-nine-windows-software-2026-11-14.md) |
| Under the Green | [Encounter authoring](../design/under-green-encounter-authoring.md), [water authoring](../design/under-green-water-authoring.md), [implementation ledger](../design/under-green-implementation-ledger.json), [visual ledger](../design/under-green-visual-upgrade-ledger.json) |
| Under the Green performance | [Budget and qualification history](../design/under-green-performance-budget.md), [native entrance fix](../qa/under-green-entrance-fix-2026-11-15.md), [subsequent software entrance fix](../qa/under-green-software-stall-2026-11-15.md) |
| The Final Cut | [Encounter build list](../design/final-cut-build-list-2026-11-12.md), [visual plan](../design/final-cut-visual-upgrade-plan-2026-11-13.md), [visual ledger](../design/final-cut-visual-implementation-ledger.json) |
| Shared UI | [Nine refinements](../qa/theme-nine-followup-2026-11-15.md), [seven refinements](../qa/theme-seven-followup-2026-11-15.md), [five subsequent refinements](../qa/theme-five-followup-2026-11-15.md) |
| Further defeat-screen work | [Loss-screen review](../design/loss-screen-review-2026-11-15.md), a review/proposal rather than completed implementation |
| Source art | [Directional masters](../art-source/README.md), [Joe model and Blender rebuild](../assets/enemies/joe-hd/model/README.md) |
| Separate Godot prototype | [Opening/menu README](../game/README.md) |

The software entrance report supersedes the earlier native-fix report's unresolved entrance-stall result. It does **not** qualify sustained software FPS across Under the Green. Likewise, the five-theme implementation report closes findings in the [preceding review](../design/theme-review-next-2026-11-15.md); reading the review alone would give an outdated task list.

## Validation and remaining acceptance

- [Documentation audit](../qa/documentation-audit-2026-11-15.md): checks rerun for this update, including the failing static release verifier.
- [Under the Green human-playtest guide](../qa/under-green-human-playtest.md), [Back Nine human-playtest guide](../qa/back-nine-human-playtest.md), and [engagement study guide](../qa/engagement-playtest-guide.md): prepared protocols, not completed participant results.
- [September 27 public release](../qa/release-2026-09-27.md): historical deployment evidence, not a claim of publication of the current local build.

Performance numbers, browser screenshots, scripted completions and physical-device or human acceptance are distinct evidence. Keep each result attached to its dated report and test conditions.

## Historical material

- [Original game blueprint](Rough_Cut_Game_Blueprint.docx): original vision and production planning; consult current guides and source for implementation status.
- [Quality checklist](rough-cut-game-quality-checklist.md): July 29 baseline plus full-game targets, retained without re-certifying its checked items.
- [Previous root README](history/root-readme-before-2026-11-15.md) and [previous browser README](history/web-readme-before-2026-11-15.md): accumulated feature notes archived during this cleanup.
- [Root work log](../progress.md) and [browser work log](../web/progress.md): dated activity records. Later entries may supersede earlier claims, and entries are not consistently sorted newest-first.

## Keeping the guides current

Update the root/browser guides when launch instructions, chapter flow, controls, save behavior or supported tooling change. Put detailed implementation evidence in a dated QA report and link it here. Record commands actually run, failures, renderer/device context and remaining limits; do not carry forward an old passing result as current acceptance. Preserve past reviews and test reports as historical evidence instead of silently changing their outcomes.
