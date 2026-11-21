// The shared settings panel (web/game-theme.js) groups campaign controls into
// category tabs and hides every category but the selected one. Older checks
// that drive a control directly first open the panel and select the tab
// that holds it. `key` is a data-campaign name or an attribute selector.
async function showSetting(page, key) {
  const state = await page.evaluate((key) => {
    const control = document.querySelector(key.startsWith('[') ? `#comfort ${key}` : `#comfort [data-campaign="${key}"]`);
    const category = control?.closest('[data-theme-category]')?.dataset.themeCategory || null;
    const tab = [...document.querySelectorAll('#comfort .rc-settings-tabs button')].find(b => b.textContent.trim() === category);
    return { category, selected: tab?.getAttribute('aria-pressed') === 'true', open: !!document.getElementById('comfort')?.open };
  }, key);
  if (!state.category) return;
  if (!state.open) await page.locator('#comfort>summary').click();
  if (state.selected) return;
  await page.locator('#comfort .rc-settings-tabs button', { hasText: state.category }).click();
}

// While the panel is open the briefing footer (and its primary button) is
// hidden, so checks close it before resuming.
async function closeSettings(page) {
  if (await page.locator('#comfort').evaluate(d => d.open)) await page.locator('#comfort>summary').click();
}

module.exports = { showSetting, closeSettings };
