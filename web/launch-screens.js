/* Shared chapter presentation. Built once; updates only on launch-state changes.
   No timers, animation loops, observers, or additional WebGL presentation. */
(() => {
 const chapters={
  'night-order':{title:'Night Order',chapter:'Chapter 01 · South gate',tagline:'The course closes at dusk. Joe does not.',goal:'Complete three field checks. Find your way out.',symbol:'M2 3h12v2H2zM3 5h2v9H3zM7 5h2v9H7zM11 5h2v9h-2zM2 8h12v2H2z',tips:[['Explore the grounds','Find the Audit Bell, Field Log, and Release Review.'],['Create a distraction','Chip a ball to draw Joe away, then move.'],['Break his sightline','Solid cover buys time. Find the shed or the drain.']]},
  'back-nine':{title:'The Back Nine',chapter:'Chapter 02 · Shed route',tagline:'The shift is not over. The machine is bigger.',goal:'Restore two relays. Reach the service garage.',symbol:'M2 3h12v2H2zM4 5h2v4H4zM11 5h2v4h-2zM2 9h12v3H2zM3 12h3v2H3zM10 12h3v2h-3z',tips:[['Keep the cart moving','Steer through cover and keep ahead of the mower.'],['Find the relays','Pass through both amber-lit shelters to restore power.'],['Secure your escape','Hold Use at the garage release. Park inside and hold Use again.']]},
  'under-green':{title:'Under the Green',chapter:'Chapter 02 · Drain route',tagline:'Read the signals. Beat the surge.',goal:'Find the bypass. Reach the keeper’s sluice.',symbol:'M2 2h3v5h4V3h5v3h-2v5H5v3H2zM8 13h6v2H8z',tips:[['Read the water','Stop at the stop symbol. Cross on the green chevrons.'],['Choose your moment','Reach the far striped bank before the surge returns.'],['Keep your distance','Dry paths and well-timed crossings put water between you and Joe.']]},
  'final-cut':{title:'The Final Cut',chapter:'Chapter 03 · Championship grounds',tagline:'One final round. One way off the course.',goal:'Use the grounds. Find a way to the public road.',symbol:'M3 3h8v3h3v6H2V7h4V5H3zM3 12h3v3H3zM10 12h3v3h-3zM7 7h2v2H7z',tips:[['Read the next pass','Watch the machine. Cross behind its committed cutting path.'],['Trust solid shelter','Stone holds. Grass conceals you, but the mower cuts it away.'],['Explore the equipment','The pump and pavilion hold clues to stopping the machine.']]}
 };
 const emblem=id=>`<svg class="rc-emblem" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path d="${chapters[id].symbol}"/></svg>`;
 function mount(panel,id){
  const data=chapters[id],night=id==='night-order',back=id==='back-nine';
  const shell=back?panel:panel.querySelector(night?'.night-order-card':'.panel-body');
  const scroll=document.createElement('div');scroll.className='rc-brief-scroll';
  const footer=back?panel.querySelector('#panel-footer'):document.createElement('footer');footer.classList.add('rc-brief-footer');
  const originalLabel=panel.getAttribute('aria-labelledby');
  try{const scale=JSON.parse(localStorage.getItem('rough-cut.settings.v1')||'{}').uiScale;panel.style.setProperty('--rc-text-scale',String(Math.max(1,Math.min(1.3,Number(scale)||1))));}catch{}
  const summary=document.createElement('section');summary.className='rc-brief-summary';
  summary.innerHTML=`<header class="rc-brief-heading"><div><small>${emblem(id)} ROUGH CUT / ${data.chapter}</small><h1 id="${id}-brief-title">${data.title}</h1><p>${data.tagline}</p></div><figure><img src="./assets/menu/${id}-scene.webp" width="1280" height="720" alt="" decoding="async"><figcaption>${data.chapter}</figcaption></figure></header><p class="rc-brief-goal"><span>YOUR GOAL</span>${data.goal}</p><div class="rc-brief-tips">${data.tips.map(([title,copy],i)=>`<article><small>0${i+1}</small><h2>${title}</h2><p>${copy}</p></article>`).join('')}</div>`;
  const native=document.createElement('div');native.className='rc-brief-native';
  const actions=night?shell.querySelector('footer > div'):shell.querySelector('#primary').closest('.actions');
  const status=panel.querySelector('#loading'),save=panel.querySelector('#save-note, #checkpoint-note, [data-brief-safe]');
  // Keep existing elements and their handlers; other game states use the same IDs.
  while(shell.firstChild)native.append(shell.firstChild);
  scroll.append(summary,native);shell.append(scroll,footer);shell.classList.add('rc-brief-shell');
  if(back)for(const element of footer.querySelectorAll('#guide-controls,.controller-menu-help'))native.append(element);
  const notes=document.createElement('details');notes.className='rc-brief-notes';notes.innerHTML='<summary>Field notes · more detail</summary>';
  const guides=night?[native.querySelector('.night-order-story'),native.querySelector('.night-order-plan')]:[native.querySelector(back?'#back-nine-guide':'#guide')];
  for(const guide of guides)if(guide)notes.append(guide);
  native.prepend(notes);
  if(status)footer.append(status);
  if(save)footer.append(save);
  if(actions){actions.classList.add('rc-brief-actions');footer.append(actions);}
  const primary=panel.querySelector(night?'[data-brief-start]':'#primary');primary.classList.add('rc-begin');primary.style.setProperty('--rc-emblem',`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='#344230' d='${data.symbol}'/></svg>`)}")`);
  if(night){const a=document.createElement('a');a.href='./index.html';a.textContent='Main menu';actions.prepend(a);}
  // Native settings remain scrollable; their existing controller and keyboard bindings survive.
  const runtime=night?null:window.RCGameTheme?.mount(panel,id);
  let state='';
  function update(mode,ready){
   const next=mode+':'+ready;if(next===state)return;state=next;
   const launch=mode==='briefing'||mode==='intro';panel.classList.toggle('rc-launch',launch);panel.dataset.preparing=String(!ready);
   panel.setAttribute('aria-labelledby',launch?`${id}-brief-title`:originalLabel);
   notes.open=false;runtime?.update(mode);
  }
  update('briefing',false);
  panel.addEventListener('keydown',event=>{
   if(!panel.classList.contains('rc-launch')||event.key!=='Tab')return;
   const targets=[...panel.querySelectorAll('button:not(:disabled),a[href],summary,input,select')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]'));
   const index=targets.indexOf(document.activeElement);
   if(event.shiftKey&&index<=0||!event.shiftKey&&index===targets.length-1){event.preventDefault();targets[event.shiftKey?targets.length-1:0]?.focus();}
  });
  return {update};
 }
 function story(dialog,id){
  const heading=dialog.querySelector('header>span');if(!heading)return;
  heading.insertAdjacentHTML('afterbegin',emblem(id));heading.classList.add('rc-story-identity');
 }
 window.RCLaunchScreens={mount,emblem,story};
})();
