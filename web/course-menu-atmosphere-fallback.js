(() => {
  window.RCMenuAtmosphereFallback = {
    create(panel) {
      const layer = document.createElement('div');
      layer.className = 'menu-grass-speckles';
      layer.setAttribute('aria-hidden', 'true');
      panel.append(layer);
      // A fixed, small pool of grass fragments; no full-screen canvas or effects.
      const particles = Array.from({ length: 80 }, (_, i) => {
        const el = document.createElement('i');
        const depth = i % 9 === 0 ? 1 : i % 3 === 0 ? .35 : .7;
        const length = depth === 1 ? 12 + i % 3 : depth < .5 ? 3 + i % 2 : 6 + i % 3;
        el.style.width = (i % 10 === 9 ? length * .55 : length) + 'px';
        if(i%10===9)el.style.clipPath='ellipse(48% 42% at 50% 50%)';
        else if(i%10>=6)el.style.clipPath='polygon(0 70%,20% 20%,50% 0,80% 20%,100% 65%,75% 45%,48% 28%,23% 45%,5% 100%)';
        el.style.height = (depth === 1 ? 3.5 : depth < .5 ? 2 : 2.5) + 'px';
        el.className = 'grass-fragment grass-fragment-' + (i % 4);
        el.style.backgroundImage = [
          'linear-gradient(155deg,#e5dfad 0%,#b2c78b 35%,#758e5d 75%,#475e40 100%)',
          'linear-gradient(160deg,#c7d6b0 0%,#9bb985 42%,#56754f 100%)',
          'linear-gradient(150deg,#e6d49a 0%,#c5b878 38%,#75855b 100%)',
          'linear-gradient(155deg,#d6deb4 0%,#a2bb81 38%,#5d7a50 100%)'
        ][i % 4];
        if(i%4===0)el.style.backgroundBlendMode="screen";
        layer.append(el);
        return { el, depth, seed: (i * .61803398875) % 1, height: (i * .41421356237 + .17) % 1, speed: (13 + i % 7 * 2) * (.45 + depth * .75) * 1.65, opacity: depth === 1 ? .83 : depth < .5 ? .51 : .69 };

      });
      let width = 1, height = 1, count = 0, quietRects = [];
      const measureQuiet=()=>{quietRects=window.RCMenuGrassLayout.measure(panel);};
      panel.addEventListener("scroll",measureQuiet,true);document.fonts.ready.then(measureQuiet);
      function resize() {
        width = panel.clientWidth; height = panel.clientHeight;
        count = Math.max(24, Math.min(80, Math.round(width * height / 16000)));
        particles.forEach((p, i) => { p.el.hidden = i >= count; });
        measureQuiet();paint();
      }
      function paint() {
        for (let i = 0; i < count; i++) {
          const p = particles[i];
          const gustPhase=phase*.52-p.height*5, gust=Math.sin(gustPhase);
          const x = (p.seed * (width + 80) + phase * p.speed + gust*22*p.depth + Math.sin(phase*.23)*10*p.depth) % (width + 80) - 40;
          const margin=Math.min(70,height*.12);
          const wrappedY=margin+p.height*(height-margin*2)-Math.cos(gustPhase)*14*p.depth+Math.sin(phase*.38+i*.8)*(6+8*p.depth)+Math.sin(phase*.83+i)*2.5-Math.sin(phase*.12+i)*16*p.depth;
          const fade = Math.max(0, Math.min(1, (x + 20) / 60, (width + 20 - x) / 60, (wrappedY + 20) / 50, (height + 20 - wrappedY) / 50));
          // Three depths share a breeze; each tapered fragment flexes without spinning like confetti.
          const flutter = Math.sin(phase * (.62 + p.depth * .2) + i * 1.7);
          const angle = -26 + gust * 12 + flutter * (12 + 14 * p.depth);
          const tilt = .76 + .24 * Math.cos(phase * .7 + i);
          p.el.style.transform = `translate(${x.toFixed(1)}px,${wrappedY.toFixed(1)}px) rotate(${angle.toFixed(1)}deg) scaleY(${tilt.toFixed(2)})`;
          if(i%4===0)p.el.style.backgroundColor=`rgba(245,222,161,${(.65*Math.pow(Math.max(0,Math.cos(phase*.72+i*1.7)),8)).toFixed(2)})`;
          p.el.style.opacity = (p.opacity * fade * (.94 + .06 * flutter) * window.RCMenuGrassLayout.quiet(x,wrappedY,quietRects)).toFixed(3);
        }
      }
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      let timer = null, active = false, focused = document.hasFocus(), enabled = false;
      let chapter = '', phase = 0, ticks = 0, last = 0;
      new ResizeObserver(resize).observe(panel);
      const stop = () => { active = false; clearTimeout(timer); timer = null; };
      function tick() {
        if (!active) return;
        const now = performance.now(); phase += Math.min(150, now - last) / 1000; last = now;
        ticks++;
        paint();
        // Move only tiny fragments; the game and full-screen artwork remain idle.
        timer = setTimeout(tick, 100);
      }
      function reconcile() {
        const shouldRun = enabled && !panel.hidden && panel.dataset.screen === 'menu' && focused && document.hasFocus() && !document.hidden && !reduced.matches && !document.querySelector('dialog[open]');
        panel.dataset.atmosphere = shouldRun ? 'moving' : 'still';
        // Freeze visible speckles on blur; only reduced motion removes them.
        layer.hidden = !enabled || reduced.matches;
        if (!shouldRun) { stop(); return; }
        if (!active) { active = true; last = performance.now(); timer = setTimeout(tick, 100); }
      }
      window.addEventListener('blur', () => { focused = false; reconcile(); });
      window.addEventListener('focus', () => { focused = true; reconcile(); });
      panel.addEventListener('pointerdown', () => { focused = document.hasFocus(); reconcile(); });
      panel.addEventListener('keydown', () => { focused = document.hasFocus(); reconcile(); });
      document.addEventListener('visibilitychange', reconcile);
      window.addEventListener('pagehide', stop);
      window.addEventListener('pageshow', reconcile);
      reduced.addEventListener('change', reconcile);
      new MutationObserver(reconcile).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
      return {
        seedTime(seconds){if(Number.isFinite(seconds))phase=Math.max(0,seconds);},
        sync(data) {
          enabled = !data.reducedMotion;
          const selected = window.RCChapterSelect.selected().id;
          chapter = selected;
          measureQuiet();reconcile();
        },
        stop,
        stats: () => ({ active, ticks, driver: 'lightweight-fallback', scheduled: timer !== null, maxUpdatesPerSecond: 10, particles: count, chapter })
      };
    }
  };
})();
