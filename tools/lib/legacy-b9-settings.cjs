// The unified settings theme (web/game-theme.js settings()) files every
// setting row under a category tab (Audio, Controls, Readability, Camera,
// Chapter) and hides the other categories. Older checks fill settings by
// element id; this opens the settings panel holding the control if needed and
// selects the tab that holds it, then returns the control's locator.
async function showSettingControl(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel), row = el?.closest('[data-theme-category]'), root = el?.closest('.rc-settings');
    if (!row || !root) return;
    if (root.tagName === 'DETAILS' && !root.open) root.querySelector(':scope>summary').click();
    [...root.querySelectorAll('.rc-settings-tabs button')].find((b) => b.textContent === row.dataset.themeCategory)?.click();
  }, selector);
  return page.locator(selector);
}

module.exports = { showSettingControl };
