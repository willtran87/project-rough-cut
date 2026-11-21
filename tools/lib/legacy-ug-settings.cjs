// Chapter settings are tabbed (web/game-theme.js): only the selected category's
// rows are shown, the "How to play" help is folded, and the open settings panel
// covers the pause actions. Older Under the Green checks drive settings
// controls directly, so they reveal a control's tab first and close the panel
// before using the pause/briefing buttons.
async function reveal(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw Error('No settings control ' + sel);
    for (const d of document.querySelectorAll('details')) if (d.contains(el)) d.open = true;
    const root = el.closest('details.rc-settings');
    const category = el.closest('[data-theme-category]')?.dataset.themeCategory;
    if (root && category) [...root.querySelectorAll(':scope>.rc-settings-tabs>button')].find((b) => b.textContent === category)?.click();
  }, selector);
}

async function closeSettings(page) {
  await page.evaluate(() => { for (const d of document.querySelectorAll('details.rc-settings')) d.open = false; });
}

module.exports = { reveal, closeSettings };
