(() => {
 const shell=document.getElementById('game-shell'),panel=document.createElement('section');panel.id='course-menu';panel.hidden=true;panel.setAttribute('aria-label','Chapter menu');
 panel.innerHTML=`<canvas class="course-menu-art" width="1280" height="720" aria-hidden="true"></canvas><img class="course-menu-scene" alt="" decoding="async"><div class="course-menu-card"><header><div class="course-menu-plaque"><img class="course-menu-logo" src="./assets/menu/rough-cut-weathered.svg" alt="Rough Cut" width="510" height="110"></div><div class="course-menu-heading"><span class="chapter-heading-mark" aria-hidden="true"></span><small data-clubhouse="kicker"></small><h1 data-clubhouse="title"></h1><p data-clubhouse="tagline"></p></div></header><div class="course-menu-scroll"><div class="course-menu-main"><nav aria-label="Chapter actions"></nav><aside><section class="course-menu-invitation"><h2>One last action item.</h2><p>The south gate is locked. Joe is still here.</p><ul class="course-highlights"><li><svg viewBox="0 0 24 24" aria-hidden="true"><path></path></svg><span></span></li><li><svg viewBox="0 0 24 24" aria-hidden="true"><path></path></svg><span></span></li><li><svg viewBox="0 0 24 24" aria-hidden="true"><path></path></svg><span></span></li></ul><p>Get out alive. Learn the course as you go.</p></section><section class="course-chapters"><h2>Chapters</h2></section><details class="course-menu-records"><summary>Course record</summary><p data-clubhouse="record"></p><p data-clubhouse="career"></p><p data-clubhouse="progress"></p><ul class="course-stamps"></ul><details class="course-shot-book"><summary>Shot book</summary><ul></ul></details></details></aside></div><section class="course-clocked-out" hidden><h2>The release window reopens at dawn.</h2><p>Night Order: <strong>left unsigned.</strong></p><p>Joe’s calendar remains fully committed.</p></section></div><footer><div class="course-menu-notice" role="status"><strong data-clubhouse="noticeTitle"></strong><p data-clubhouse="notice"></p></div><div class="course-menu-utility"><div class="course-menu-extras"><button type="button" data-clubhouse-command="return" hidden>Return to main menu</button></div><small data-clubhouse="controls"></small></div></footer></div>`;
 shell.append(panel);const art=panel.querySelector('canvas').getContext('2d'),nav=panel.querySelector('.course-menu-main>nav'),scroll=panel.querySelector('.course-menu-scroll'),extras=panel.querySelector('.course-menu-extras');
 const atmosphere=window.RCMenuAtmosphere.create(panel);
 let api=null,wasOpen=false,lastSelection=-1,lastMode='',contentKey='',focusChapters=false;
 const start=document.createElement('button');start.type='button';start.className='course-menu-start';start.dataset.menuAction='2';start.innerHTML='<span class="start-emblem" aria-hidden="true"></span><strong></strong><small></small>';start.onclick=()=>api.activate(2);start.onfocus=()=>api.select(2);panel.querySelector('footer').append(start);
 const replay=document.createElement('button');replay.type='button';replay.dataset.clubhouseCommand='replay';replay.hidden=true;replay.onclick=()=>api.replay();extras.append(replay);
 const invitation=panel.querySelector('.course-menu-invitation'),chaptersHost=panel.querySelector('.course-chapters'),scene=panel.querySelector('.course-menu-scene');
 const rail=document.createElement('div');rail.className='course-menu-rail';nav.before(rail);rail.append(nav,invitation);
 // Small equipment drawings are cached markup, swapped only with chapter selection.
 const diagramSpecs={
  'night-order':['GATE ASSEMBLY','<path d="M22 94V20h156v74M28 26h144v61H28zM28 58h144M46 26v61M67 26v61M88 26v61M110 26v61M131 26v61M152 26v61M14 94h172M18 13h164M18 10v6M182 10v6"/><rect x="92" y="51" width="16" height="13"/>'],
  'back-nine':['CART / SIDE ELEVATION','<path d="M25 75h14l8-26h19l9-23h87l10 49h7v13h-16M61 88h77M41 48h114M75 26l-9 49M153 26l8 49M91 56h24v17h29V54h11M106 50l13-8M116 38l7 9M20 103h162M20 100v6M182 100v6"/><circle cx="51" cy="85" r="13"/><circle cx="151" cy="85" r="13"/><circle cx="51" cy="85" r="5"/><circle cx="151" cy="85" r="5"/>'],
  'under-green':['DRAIN / CROSS SECTION','<path d="M29 96V45l12-20 20-12h78l20 12 12 20v51M42 96V48l10-16 14-7h68l14 7 10 16v48M42 74h116M71 34v40M88 34v40M105 34v40M122 34v40M139 34v40M57 87h21m8 0h22m8 0h25M20 103h160M20 100v6M180 100v6"/><path d="M23 47h17M160 47h17M23 64h17M160 64h17"/>'],
  'final-cut':['CUTTING DECK / PLAN','<path d="M68 16h64v64H68zM78 25h44v24H78zM89 49v18h22V49M22 71h45v27H22zM68 81h64v17H68zM133 71h45v27h-45zM15 104h170M15 101v6M185 101v6M22 85h156M30 72v25M42 72v25M54 72v25M78 82v15M90 82v15M102 82v15M114 82v15M142 72v25M154 72v25M166 72v25"/><rect x="56" y="23" width="9" height="30"/><rect x="135" y="23" width="9" height="30"/>']
 };
 const diagrams=Object.fromEntries(Object.entries(diagramSpecs).map(([id,[label,paths]])=>[id,'<span>GROUNDS DEPARTMENT</span><svg viewBox="0 0 200 116" aria-hidden="true">'+paths+'</svg><small>'+label+'</small>']));
 const seal=document.createElement('div');seal.className='course-menu-seal course-menu-diagram';seal.setAttribute('aria-hidden','true');rail.append(seal);
 const feature=document.createElement('figure');feature.className='course-menu-feature';feature.innerHTML='<img alt="" decoding="async"><figcaption><span class="feature-emblem" aria-hidden="true"></span><span><small>AFTER HOURS</small><strong></strong></span></figcaption>';chaptersHost.before(feature);
 const trim=document.createElement('span');trim.className='feature-trim';trim.setAttribute('aria-hidden','true');feature.append(trim);
 const scrollFrame=document.createElement('div');scrollFrame.className='course-menu-scroll-frame';scroll.before(scrollFrame);scrollFrame.append(scroll);
 const cue=document.createElement('span');cue.className='course-scroll-cue';cue.textContent='More below ↓';cue.setAttribute('aria-hidden','true');cue.hidden=true;scrollFrame.append(cue);
 function updateScrollCues(){if(panel.hidden)return;const above=scroll.scrollTop>3,below=scroll.scrollHeight-scroll.clientHeight-scroll.scrollTop>3;for(const [key,value]of [['above',above],['below',below]])if(scrollFrame.dataset[key]!==String(value))scrollFrame.dataset[key]=String(value);cue.hidden=!below;}
 scroll.addEventListener('scroll',updateScrollCues,{passive:true});scroll.addEventListener('toggle',updateScrollCues,true);const scrollResize=new ResizeObserver(updateScrollCues);scrollResize.observe(scroll);scrollResize.observe(panel.querySelector('.course-menu-main'));document.fonts.ready.then(updateScrollCues);
 let featureGeneration=0,featureFade=null,oldFeature=null,gameReduced=false;
 function cancelFeature(){featureGeneration++;featureFade?.cancel();featureFade=null;oldFeature?.remove();oldFeature=null;}
 function showFeature(chapter){
  const img=feature.querySelector('img'),hadImage=!!img.getAttribute('src');cancelFeature();const generation=featureGeneration;
  const animate=hadImage&&!gameReduced&&!motion.matches&&!document.hidden&&document.hasFocus();
  if(animate){oldFeature=img.cloneNode();oldFeature.className='feature-outgoing';oldFeature.style.objectPosition=getComputedStyle(img).objectPosition;img.after(oldFeature);}
  img.src=chapter.art;feature.querySelector('strong').textContent=chapter.location;feature.querySelector('.feature-emblem').innerHTML=window.RCChapterSelect.emblem(chapter.id);
  if(!animate)return;
  img.decode().then(()=>{if(generation!==featureGeneration)return;if(panel.hidden||gameReduced||motion.matches||document.hidden||!document.hasFocus()){cancelFeature();return;}
   featureFade=oldFeature.animate([{opacity:1},{opacity:0}],{duration:180,easing:'ease-out'});featureFade.finished.then(()=>{if(generation===featureGeneration)cancelFeature();},()=>{});
  },()=>{if(generation===featureGeneration)cancelFeature();});
 }
 const motion=matchMedia('(prefers-reduced-motion: reduce)');let entrancePlayed=false,entrance=[];
 function cancelEntrance(){for(const a of entrance)a.cancel();entrance=[];}
 function enterOnce(data){if(entrancePlayed)return;entrancePlayed=true;if(data.reducedMotion||motion.matches)return;for(const [el,delay]of [[panel.querySelector('.course-menu-card'),0],[rail,50],[panel.querySelector('aside'),90]]){const a=el.animate([{opacity:0},{opacity:1}],{duration:240,delay,fill:'backwards',easing:'ease-out'});entrance.push(a);a.finished.then(()=>a.cancel(),()=>{});}}
 motion.addEventListener('change',()=>{if(motion.matches){cancelEntrance();cancelFeature();}});window.addEventListener('blur',()=>{cancelEntrance();cancelFeature();});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelEntrance();cancelFeature();}});
 let chapterKey='';
 chaptersHost.querySelector('h2').textContent='Select a chapter';
 window.RCChapterSelect.subscribe(()=>api?.refresh());
 const text=(key,value)=>{const el=panel.querySelector('[data-clubhouse="'+key+'"]');if(el.textContent!==value)el.textContent=value;};
 panel.querySelector('[data-clubhouse-command="return"]').onclick=()=>api.back();
 function restore(){for(const id of ['controls-launch','study-launch']){const b=document.getElementById(id);if(b&&panel.contains(b))shell.append(b);}const chapters=document.getElementById('chapter-links');if(chapters&&panel.contains(chapters)){chapters.hidden=true;document.body.append(chapters);}}
 function hide(){if(!wasOpen)return;atmosphere.stop();cancelEntrance();cancelFeature();panel.hidden=true;wasOpen=false;restore();}
 function render(data,controls){
  gameReduced=!!data.reducedMotion;api=controls;panel.hidden=false;panel.dataset.screen=data.mode;panel.style.setProperty('--menu-scale',data.scale);art.clearRect(0,0,1280,720);art.drawImage(data.art,0,0,1280,720);
  const clock=data.mode==='clocked_out',changedMode=data.mode!==lastMode;
  const chapter=window.RCChapterSelect.selected();
  text('kicker',clock?'Out of office':chapter.chapter);text('title',clock?'Shift ended':chapter.title);text('tagline',clock?'Release night':chapter.tagline);
  // Change image sources and preview DOM only on chapter selection, never on idle ticks.
  if(chapterKey!==chapter.id){
   chapterKey=chapter.id;showFeature(chapter);panel.dataset.selectedChapter=chapter.id;scene.src=chapter.art;
   const emblem=window.RCChapterSelect.emblem(chapter.id);panel.querySelector('.chapter-heading-mark').innerHTML=emblem;start.querySelector('.start-emblem').innerHTML=emblem;seal.innerHTML=diagrams[chapter.id];seal.dataset.equipment=chapter.id;
   invitation.querySelector('h2').textContent=chapter.heading;invitation.querySelector('p').textContent=chapter.description;
   invitation.querySelector('p:last-child').hidden=true;
   [...invitation.querySelectorAll('li')].forEach((li,i)=>{const [icon,label]=chapter.highlights[i];li.querySelector('svg').outerHTML=window.RCChapterSelect.emblem(icon);li.querySelector('span').textContent=label;});
  }
  panel.querySelector('.course-menu-records').hidden=!!chapter.href;
  panel.querySelector('.course-menu-main').hidden=clock;panel.querySelector('.course-clocked-out').hidden=!clock;
  if(!nav.children.length)data.actions.slice(0,2).forEach((action,i)=>{const b=document.createElement('button');b.type='button';b.onclick=()=>api.activate(i);b.dataset.menuAction=i;b.innerHTML='<strong></strong><small></small>';b.onfocus=()=>api.select(i);nav.append(b);});
  for(const b of panel.querySelectorAll('[data-menu-action]')){const i=Number(b.dataset.menuAction);b.querySelector('strong').textContent=data.actions[i].label;b.querySelector('small').textContent=i===2?chapter.title:data.actions[i].description;b.dataset.selected=String(data.selected===i);}
  const progress=RCProgression.state(),next=(RCProgression.continuation||RCProgression.next)(chapter.id,progress);
  start.hidden=clock;start.disabled=!RCProgression.available(chapter.id,progress);start.querySelector('strong').textContent=next?'Continue story':progress.completed[chapter.id]?'Replay chapter':data.actions[2].label;start.querySelector('small').textContent=next?RCChapterSelect.chapter(next.id).title:chapter.title;start.setAttribute('aria-label',start.textContent.trim());
  replay.hidden=clock||!next;replay.textContent='Replay chapter · R / RB';replay.setAttribute('aria-label','Replay '+chapter.title+' from the start');
  nav.children[0].setAttribute('aria-controls','chapter-links');
  const key=JSON.stringify([data.stamps,data.shots]);if(key!==contentKey){contentKey=key;const list=items=>items.map(item=>{const li=document.createElement('li');li.textContent=`${item.earned?'✓':'○'} ${item.name||item.label} · ${item.hint}`;return li;});panel.querySelector('.course-stamps').replaceChildren(...list(data.stamps));panel.querySelector('.course-shot-book ul').replaceChildren(...list(data.shots));}
  for(const key of ['progress','record','career','noticeTitle','notice','controls'])text(key,data[key]);
  if(chapter.href&&data.mode==='menu'&&!data.noticeTitle)text('notice','Chapters open as you reach them in the story.');
  // Chapter 02 has two routes, one behind each Night Order exit. Once the
  // first is earned, name the exit that leads to the other.
  if(data.mode==='menu'&&!data.noticeTitle&&progress.completed['night-order']){
   const other=!progress.exits.drain?['drain','Under the Green']:!progress.exits.shed?['shed','The Back Nine']:null;
   if(other)text('notice',`Unexplored route: leave Night Order by the ${other[0]} exit to reach ${other[1]}.`);
  }
  const back=panel.querySelector('[data-clubhouse-command="return"]');back.hidden=!clock&&data.mode!=='claim';back.textContent=clock?'Return to main menu':'Dismiss rejection';
  for(const id of ['controls-launch','study-launch']){const b=document.getElementById(id);if(b&&!extras.contains(b))extras.append(b);if(b&&id==='study-launch')b.hidden=!window.roughCutStudy?.available();}
  const chapters=document.getElementById('chapter-links');if(chapters){if(clock)chapters.hidden=true;else{const host=panel.querySelector('.course-chapters');if(!host.contains(chapters))host.append(chapters);chapters.hidden=false;}}
  if(changedMode&&!document.querySelector('dialog[open]'))scroll.scrollTop=0;
  if(!document.querySelector('dialog[open]')){if(clock&&(!wasOpen||changedMode))back.focus({preventScroll:true});else if(!clock&&(!wasOpen||lastSelection!==data.selected||lastMode==='clocked_out')){const b=panel.querySelector('[data-menu-action="'+data.selected+'"]');b.focus({preventScroll:true});b.scrollIntoView({block:'nearest'});}
   if(focusChapters&&!clock){focusChapters=false;const b=panel.querySelector('#chapter-links [aria-pressed="true"]');b?.focus({preventScroll:true});chaptersHost.scrollIntoView({block:'nearest'});}
  }
  window.RCChapterSelect.refreshProgress();if(data.reducedMotion){cancelEntrance();cancelFeature();}if(data.mode==='menu')enterOnce(data);
  wasOpen=true;lastSelection=data.selected;lastMode=data.mode;atmosphere.sync(data);updateScrollCues();
 }
 function toggleDetails(){if(panel.hidden)return;const d=panel.querySelector('.course-menu-records');d.open=!d.open;d.querySelector('summary').scrollIntoView({block:'nearest'});}
 window.RCCourseMenu={continueIntro:time=>atmosphere.seedTime?.(time),render,hide,toggleDetails,atmosphereStats:atmosphere.stats,openChapters:()=>{focusChapters=lastSelection!==0;panel.querySelector('#chapter-links [aria-pressed="true"]')?.focus({preventScroll:true});chaptersHost.scrollIntoView({block:'nearest'});},scroll:amount=>{scroll.scrollTop+=amount;}};
})();
