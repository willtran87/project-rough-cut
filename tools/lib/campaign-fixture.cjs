// Chapters 02-04 are locked until earlier chapters are finished
// (web/campaign-progress.js: RCProgression.admit sends a locked chapter back to
// the menu). Browser checks that open a chapter page directly seed the progress
// that unlocks every chapter. The seed is written only when no progress is
// stored yet, so a check that earns progress through real play keeps its own.
const KEY = 'rough-cut.campaign-progress.v1';
const PROGRESS = {
  version: 1,
  revision: 1,
  entered: { 'night-order': true, 'back-nine': true, 'under-green': true, 'final-cut': true },
  completed: { 'night-order': true, 'back-nine': true },
  exits: { shed: true, drain: true },
  current: 'night-order',
  lastExit: 'shed',
  finalRoute: null,
};

async function unlockChapters(target) {
  await target.addInitScript(([key, value]) => {
    try { if (!localStorage.getItem(key)) localStorage.setItem(key, value); } catch {}
  }, [KEY, JSON.stringify(PROGRESS)]);
}

// Each chapter opens with an illustrated story before its briefing. Checks that
// exercise the chapter itself (not the story) mark every story as skipped, the
// same preference a player sets with the story's "skip" checkbox.
const STORY_SKIPS = {
  'rough-cut.opening-story.v1': { skip: true },
  'rough-cut.back-nine-opening.v1': { skip: true },
  'rough-cut.under-green-opening.v1': { skip: true },
  'rough-cut.final-cut-story.v1': { skipIntro: true },
};

async function skipStories(target) {
  await target.addInitScript((skips) => {
    try { for (const [key, value] of Object.entries(skips)) localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, STORY_SKIPS);
}

module.exports = { unlockChapters, skipStories, PROGRESS_KEY: KEY, STORY_SKIPS };
