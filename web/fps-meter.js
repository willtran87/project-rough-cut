// Optional frame-rate readout for measuring real devices. Off unless the page
// address contains ?fps (for example back-nine.html?fps). It only observes
// animation-frame timing and never touches the game, its canvas or its input.
(() => {
  let enabled = false;
  try { enabled = new URLSearchParams(location.search).has('fps'); } catch {}
  if (!enabled) return;
  const box = document.createElement('div');
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2147483647;pointer-events:none;' +
    'font:12px/1.35 ui-monospace,Consolas,monospace;color:#e8f0d8;background:rgba(8,14,10,.78);' +
    'padding:4px 7px;border-radius:3px;white-space:pre';
  const mount = () => document.body.append(box);
  if (document.body) mount(); else addEventListener('DOMContentLoaded', mount, { once: true });
  // Rolling one-second window: average fps, plus the slowest 5% of frames,
  // which is what a player feels as stutter.
  const frames = [];
  let last = performance.now(), shown = 0;
  function tick(now) {
    frames.push([now, now - last]); last = now;
    while (frames.length && now - frames[0][0] > 1000) frames.shift();
    if (now - shown > 250 && frames.length > 1) {
      shown = now;
      const times = frames.map(f => f[1]).sort((a, b) => a - b);
      const average = times.reduce((a, b) => a + b, 0) / times.length;
      const slow = times[Math.min(times.length - 1, Math.floor(times.length * .95))];
      box.textContent = `${(1000 / average).toFixed(0)} fps\n95% under ${slow.toFixed(0)} ms`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
