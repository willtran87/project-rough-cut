// Older drain victories can enter their new continuation from chapter select.
const nav=document.createElement('nav');nav.setAttribute('aria-label','Continue a chapter');nav.hidden=true;nav.id='chapter-links';
nav.innerHTML='<a href="./back-nine.html">The Back Nine</a><a href="./under-green.html">Under the Green</a><a href="./final-cut.html">The Final Cut</a>';
const style=document.createElement('style');style.textContent='#chapter-links{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:18px;z-index:30;padding:9px 16px;background:#0b1b18ed;border:1px solid #657b6f;border-radius:4px;font:12px monospace}#chapter-links[hidden]{display:none}#chapter-links a{color:#e1c88e;text-underline-offset:3px}#chapter-links a:focus-visible{outline:2px solid #e1c88e;outline-offset:4px}';document.head.append(style);document.body.append(nav);
// The responsive clubhouse owns placement and visibility directly. Avoid
// building the large playtest/debug report every 350ms during an active round.
// Keep the old fallback for a page without that presenter.
if(!window.RCCourseMenu)setInterval(()=>{try{const state=JSON.parse(window.render_game_to_text?.()||'{}');nav.hidden=!['menu','claim'].includes(state.mode);}catch{nav.hidden=true;}},350);
