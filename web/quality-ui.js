/* Lightweight DOM overlay: no full-canvas texture upload during ordinary gameplay. */
(() => {
  const shell=document.getElementById('game-shell'),canvas=document.getElementById('game'),root=document.createElement('div');
  root.id='quality-hud';root.hidden=true;root.innerHTML='<div class="q-objective"><small data-q="zone"></small><strong data-q="goal"></strong></div><div class="q-threat" data-q="threat"></div><button class="q-map" type="button">Map</button><div class="q-reticle">·</div><div class="q-target" hidden></div><div class="q-messages" tabindex="0" aria-label="Messages and captions"><div class="q-caption" data-q="caption"></div><div class="q-danger-action" hidden><strong data-q="action"></strong><span data-q="consequence"></span></div><div class="q-context"><span data-q="context"></span><small class="q-progress-label" data-q="progressLabel" hidden></small><progress max="1" value="0" aria-label="Action progress" hidden></progress></div></div><div class="q-resources" data-q="resources"></div><svg class="q-touch" viewBox="0 0 1280 720" aria-hidden="true"></svg>';
  shell.append(root);const fields=Object.fromEntries([...root.querySelectorAll('[data-q]')].map(e=>[e.dataset.q,e]));
  const messageStack=root.querySelector('.q-messages');
  messageStack.append(root.querySelector('.q-danger-action'));
  const listeningHeader=document.createElement('div');listeningHeader.className='q-listening-header';listeningHeader.hidden=true;
  listeningHeader.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="39"/><g data-listening-arrow><path d="M50 8 L42 25 L58 25 Z"/><path d="M50 24 V62"/></g><circle cx="50" cy="50" r="3"/></svg><div><small>LISTENING FOCUS</small><strong></strong><span></span></div>';
  const cadence=document.createElement('div');cadence.className='q-listening-cadence';cadence.hidden=true;cadence.innerHTML='<span></span><progress max="1"></progress>';
  const clues=document.createElement('details');clues.className='q-listening-clues';clues.hidden=true;clues.innerHTML='<summary></summary><ul></ul>';
  messageStack.prepend(listeningHeader,cadence);messageStack.append(clues);const clueRows=new Map();let wasListening=false;
  function renderListening(data){
    const active=!!data;root.dataset.listening=String(active);listeningHeader.hidden=cadence.hidden=clues.hidden=!active;
    if(!active){clues.open=false;wasListening=false;return;}
    if(!wasListening){messageStack.scrollTop=0;clues.open=true;}wasListening=true;
    listeningHeader.querySelector('strong').textContent=`Joe ${data.joe.bearing.toLowerCase()} · ${data.joe.metres}m`;
    listeningHeader.querySelector('span').textContent=data.joe.trend?`Search ${data.joe.trend}`:'';
    listeningHeader.querySelector('[data-listening-arrow]').setAttribute('transform',`rotate(${data.joe.angle*180/Math.PI} 50 50)`);
    cadence.querySelector('span').textContent=data.cadence.text;const bar=cadence.querySelector('progress');bar.hidden=data.cadence.progress===null;bar.value=data.cadence.progress||0;
    clues.querySelector('summary').textContent=`Nearby clues (${data.entries.length})`;
    const ids=new Set(data.entries.map(e=>e.id));for(const [id,row]of clueRows)if(!ids.has(id)){row.remove();clueRows.delete(id);}
    for(const entry of data.entries){let row=clueRows.get(entry.id);if(!row){row=document.createElement('li');row.dataset.clue=entry.id;clues.querySelector('ul').append(row);clueRows.set(entry.id,row);}const text=`${entry.label} · ${entry.bearing.toLowerCase()} · ${entry.metres}m${entry.detail?' · '+entry.detail:''}`;if(row.textContent!==text)row.textContent=text;}
  }
  const resize=()=>{root.style.left=canvas.offsetLeft+'px';root.style.top=canvas.offsetTop+'px';root.style.width=canvas.clientWidth+'px';root.style.height=canvas.clientHeight+'px';root.style.setProperty('--q-font',Math.max(shell.dataset.coursePortrait==='true'?17:14,Math.min(30,canvas.clientWidth/1280*23))+'px');if(!wasListening)messageStack.scrollTop=messageStack.scrollHeight;};new ResizeObserver(resize).observe(canvas);resize();
  root.querySelector('.q-map').addEventListener('click',()=>{canvas.focus();window.roughCutRebuild?.toggleMap();});
  const mapPanel=document.createElement('section');mapPanel.id='course-map';mapPanel.hidden=true;mapPanel.setAttribute('aria-label','Course map');
  mapPanel.innerHTML='<header><div><strong>COURSE MAP</strong><small data-map="controls"></small></div><button type="button" data-map-pause>Pause</button><button type="button" data-map-close>Close map</button></header><div class="course-map-status"><strong data-map="route"></strong><span data-map="readiness"></span><span data-map="warning"></span><span data-map="caption"></span><small>Course stays live · Scroll for exit plans and tools.</small></div><div class="course-map-scroll" tabindex="0" aria-label="Map and route plans"><figure><canvas width="468" height="680" aria-label="Live course map with your position, objectives, terrain and known signals"></canvas><figcaption>White arrow: you · Gold: objectives · Orange/red: Joe or a known signal</figcaption></figure><div class="course-map-info"><div data-map-routes></div><div data-map-tools></div></div></div>';
  root.append(mapPanel);const mapContext=mapPanel.querySelector('canvas').getContext('2d');
  mapPanel.querySelector('[data-map-close]').onclick=()=>{window.roughCutRebuild?.toggleMap();canvas.focus();};
  mapPanel.querySelector('[data-map-pause]').onclick=()=>window.roughCutRebuild?.pauseMap();
  let wasMap=false;
  function map(data){
    const appearing=!wasMap;wasMap=true;mapPanel.hidden=false;root.dataset.map='true';
    for(const [key,value]of Object.entries({route:data.route,readiness:data.readiness,warning:data.warning,caption:fields.caption.textContent,controls:data.close})){const el=mapPanel.querySelector('[data-map="'+key+'"]');if(el.textContent!==value)el.textContent=value;}
    mapContext.clearRect(0,0,468,680);data.paint(mapContext);
    if(appearing&&document.activeElement===canvas)mapPanel.querySelector('[data-map-close]').focus({preventScroll:true});
  }
  const pausePanel=document.createElement('section');pausePanel.id='course-pause';pausePanel.hidden=true;pausePanel.setAttribute('aria-label','Pause menu');
  pausePanel.innerHTML='<div class="course-pause-card"><header><small data-pause="zone"></small><h1 data-pause="title"></h1><p>Time is paused.</p></header><div class="course-pause-body"><section class="course-pause-summary"><h2>Current assignment</h2><strong data-pause="objective"></strong><p data-pause="next"></p><p data-pause="status"></p><p data-pause="threat"></p></section><nav aria-label="Round actions"></nav></div><footer><p data-pause="controls"></p><div class="course-pause-extras"></div></footer></div>';
  root.append(pausePanel);let wasPaused=false,lastPauseSelection=-1,pauseLayout='';
  for(let i=0;i<4;i++){const b=document.createElement('button');b.type='button';b.dataset.pauseAction=i;b.innerHTML='<strong></strong><small></small>';b.onclick=()=>window.roughCutRebuild?.activatePause(i);b.onfocus=()=>window.roughCutRebuild?.selectPause(i);pausePanel.querySelector('nav').append(b);}
  function pause(data){
    root.hidden=false;root.dataset.pause='true';root.dataset.map='false';root.style.setProperty('--q-user-scale',data.scale||1);mapPanel.hidden=true;pausePanel.hidden=false;
    for(const key of ['zone','title','objective','next','status','threat','controls']){const el=pausePanel.querySelector('[data-pause="'+key+'"]');if(el.textContent!==data[key])el.textContent=data[key];}
    const buttons=[...pausePanel.querySelectorAll('[data-pause-action]')];buttons.forEach((b,i)=>{b.dataset.selected=String(i===data.selected);const title=b.querySelector('strong'),description=b.querySelector('small');if(title.textContent!==data.actions[i].label)title.textContent=data.actions[i].label;if(description.textContent!==data.actions[i].description)description.textContent=data.actions[i].description;});
    const extras=pausePanel.querySelector('.course-pause-extras');for(const id of ['controls-launch','study-launch']){const button=document.getElementById(id);if(button){if(button.parentElement!==extras)extras.append(button);if(id==='study-launch')button.hidden=!window.roughCutStudy?.available();}}
    const layout=canvas.clientWidth+':'+canvas.clientHeight+':'+data.scale;
    if((!wasPaused||lastPauseSelection!==data.selected||layout!==pauseLayout&&document.activeElement?.matches('[data-pause-action]'))&&!document.querySelector('dialog[open]')){buttons[data.selected].focus({preventScroll:true});buttons[data.selected].scrollIntoView({block:'nearest'});}
    wasPaused=true;lastPauseSelection=data.selected;pauseLayout=layout;
  }
  const resultPanel=document.createElement('section');resultPanel.id='course-result';resultPanel.hidden=true;resultPanel.setAttribute('aria-label','Round result');
  resultPanel.innerHTML='<div class="course-result-card"><header><small data-result="kicker"></small><h1 data-result="title"></h1><p data-result="summary"></p></header><div class="course-result-scroll" tabindex="0" aria-label="Round review"><div class="course-result-visual"><canvas class="course-result-art" width="1280" height="720" aria-label="Round outcome artwork"></canvas><blockquote><p data-result="dialogue"></p></blockquote><p data-result="milestone"></p></div><article><h2 data-result="headline"></h2><p data-result="evidence"></p><p data-result="advice"></p><dl></dl><ul class="course-result-events"></ul><section class="course-result-next"><h2>Next steps</h2><div></div></section><div class="course-result-journal"></div></article></div><footer><nav aria-label="Result actions"></nav><p data-result="controls"></p></footer></div>';
  root.append(resultPanel);const resultArt=resultPanel.querySelector('.course-result-art').getContext('2d');let wasResult=false,lastResultSelection=-1,resultContentKey='';
  for(let i=0;i<3;i++){const b=document.createElement('button');b.type='button';b.dataset.resultAction=i;b.onclick=()=>window.roughCutRebuild?.activateResult(i);b.onfocus=()=>window.roughCutRebuild?.selectResult(i);resultPanel.querySelector('nav').append(b);}
  function result(data){
    root.hidden=false;root.dataset.result='true';root.dataset.pause='false';root.dataset.map='false';root.style.setProperty('--q-user-scale',data.scale||1);pausePanel.hidden=mapPanel.hidden=true;resultPanel.hidden=false;resultPanel.dataset.outcome=data.outcome;
    for(const key of ['title','kicker','summary','headline','evidence','advice','dialogue','milestone','controls']){const el=resultPanel.querySelector('[data-result="'+key+'"]');if(el.textContent!==data[key])el.textContent=data[key];}
    resultArt.clearRect(0,0,1280,720);resultArt.drawImage(data.art,0,0,1280,720);resultPanel.querySelector('blockquote').hidden=!data.dialogue;
    const key=JSON.stringify([data.stats,data.events,data.actions]);if(key!==resultContentKey){
      const stats=resultPanel.querySelector('dl');stats.replaceChildren();for(const [label,value]of data.stats){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;stats.append(dt,dd);}
      resultPanel.querySelector('.course-result-events').replaceChildren(...data.events.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
      resultPanel.querySelector('.course-result-next>div').replaceChildren(...data.actions.map(action=>{const section=document.createElement('section'),heading=document.createElement('h3'),detail=document.createElement('small'),description=document.createElement('p');heading.textContent=action.label;detail.textContent=action.detail;description.textContent=action.description;section.append(heading,detail,description);return section;}));resultContentKey=key;
    }
    const buttons=[...resultPanel.querySelectorAll('[data-result-action]')];buttons.forEach((b,i)=>{if(b.textContent!==data.actions[i].label)b.textContent=data.actions[i].label;b.dataset.selected=String(i===data.selected);});
    const journal=document.getElementById('study-launch');if(journal){const slot=resultPanel.querySelector('.course-result-journal');if(journal.parentElement!==slot)slot.append(journal);journal.hidden=!window.roughCutStudy?.available();}
    if((!wasResult||lastResultSelection!==data.selected)&&!document.querySelector('dialog[open]'))buttons[data.selected].focus({preventScroll:true});
    if(!wasResult)resultPanel.querySelector('.course-result-scroll').scrollTop=0;wasResult=true;lastResultSelection=data.selected;
  }
  let touchKey='',messageKey='';const svg=root.querySelector('.q-touch');
  function render(data){
    mapPanel.hidden=true;root.dataset.map='false';pausePanel.hidden=true;root.dataset.pause='false';
    renderListening(data.listening);
    const threat=fields.threat,messages=root.querySelector('.q-messages');
    if(shell.dataset.coursePortrait==='true'){if(threat.parentElement!==messages)messages.prepend(threat);}else if(threat.parentElement!==root)root.insertBefore(threat,root.querySelector('.q-map'));
    root.hidden=false;root.dataset.touch=Boolean(data.touch);root.style.setProperty('--q-user-scale',data.scale||1);root.style.fontSize='calc(var(--q-font) * '+(data.scale||1)+')';const marker=root.querySelector('.q-target');marker.hidden=!data.target;if(data.target){marker.style.left=(data.target.x/1280*100)+'%';marker.style.top=(data.target.y/720*100)+'%';}for(const [key,element]of Object.entries(fields)){const text=data[key]||'';if(element.textContent!==text)element.textContent=text;element.hidden=!text;}
    const progress=root.querySelector('.q-context progress');progress.parentElement.hidden=!data.context&&data.progress==null;progress.hidden=data.progress==null;if(!progress.hidden){progress.value=data.progress;progress.setAttribute('aria-label',data.progressLabel||'Action progress');}
    root.querySelector('.q-danger-action').hidden=!data.action;
    const nextMessageKey=[data.context,data.caption,data.action,data.consequence,canvas.clientWidth,canvas.clientHeight,data.scale,Boolean(data.touch)].join('|');
    if(nextMessageKey!==messageKey){const messages=root.querySelector('.q-messages');if(!data.listening)messages.scrollTop=messages.scrollHeight;messageKey=nextMessageKey;}
    root.dataset.danger=data.danger?'true':'false';svg.hidden=!data.touch;svg.style.display=data.touch?'block':'none';
    if(data.touch){
      const w=canvas.clientWidth,h=canvas.clientHeight,sx=w/1280,sy=h/720;
      const key=w+':'+h+':'+JSON.stringify(data.touch);
      if(key!==touchKey){
        svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
        const names={move:'MOVE',lookBack:'REAR',interact:'USE',aim:'CHIP',crouch:'CROUCH',focus:'LISTEN',sprint:'RUN',pause:'PAUSE'};
        for(const [id,b]of Object.entries(data.touch)){
          const shape=document.createElementNS('http://www.w3.org/2000/svg',b.radius?'ellipse':'rect');
          const attrs=b.radius?{cx:b.x*sx,cy:b.y*sy,rx:b.radius*sx,ry:(b.radiusY||b.radius)*sy}:{x:b.x*sx,y:b.y*sy,width:b.width*sx,height:b.height*sy};
          for(const [name,value]of Object.entries(attrs))shape.setAttribute(name,value);
          shape.dataset.touchControl=id;svg.append(shape);
          const label=document.createElementNS('http://www.w3.org/2000/svg','text');
          label.setAttribute('x',(b.radius?b.x:b.x+b.width/2)*sx);label.setAttribute('y',(b.radius?b.y:b.y+b.height/2)*sy+4);
          label.style.fontSize=(b.radiusY||shell.dataset.coursePortrait==='true'?12:Math.max(9,15*sx))+'px';label.dataset.touchLabel=id;label.textContent=names[id];svg.append(label);
        }
        const knob=document.createElementNS('http://www.w3.org/2000/svg','ellipse');knob.dataset.knob='true';svg.append(knob);touchKey=key;
      }
      const run=svg.querySelector('[data-touch-control=sprint]'),label=svg.querySelector('[data-touch-label=sprint]');run?.classList.toggle('active',!!data.touchRunActive);if(label)label.textContent=data.touchRunActive?'RUN ON':data.touchRunToggle?'TAP RUN':'RUN';
      const move=data.touch.move,knob=svg.querySelector('[data-knob]'),ratio=(move.radiusY||move.radius)/move.radius;
      knob.setAttribute('rx',move.radiusY?14:22*sx);knob.setAttribute('ry',move.radiusY?14:22*sy);
      knob.setAttribute('cx',(move.x+(data.moveX||0)*(move.radius-20))*sx);knob.setAttribute('cy',(move.y-(data.moveY||0)*(move.radius-20)*ratio)*sy);
    }
  }
  const settings=document.createElement('button');settings.id='controls-launch';settings.textContent='Controls & comfort';settings.hidden=true;shell.append(settings);
  const dialog=document.createElement('dialog');dialog.id='controls-dialog';dialog.setAttribute('aria-label','Controls and comfort');dialog.innerHTML='<div class="study-heading"><h2>Controls & comfort</h2><button type="button">Close</button></div><div id="quality-settings"></div>';document.body.append(dialog);dialog.querySelector('button').onclick=()=>{dialog.close();canvas.focus();};
  const guidance=document.createElement('section');guidance.className='navigation-settings';guidance.innerHTML='<h3>Finding your way</h3><label><input type="checkbox" id="clear-navigation"> Clear navigation</label><p id="clear-navigation-help">Adds large objective boards, direction signs and explicit exit status. Off by default: follow lanterns, paperwork and worn approaches. Nearby Use prompts and the map remain available.</p>';dialog.querySelector('#quality-settings').append(guidance);
  const navigationInput=guidance.querySelector('input');navigationInput.setAttribute('aria-describedby','clear-navigation-help');navigationInput.onchange=()=>window.roughCutRebuild?.setClearNavigation(navigationInput.checked);
  const captionSettings=document.createElement('section');captionSettings.className='navigation-settings';captionSettings.innerHTML='<h3>Dialogue &amp; sound captions</h3><label><input type="checkbox" data-caption="subtitles"> Joe’s dialogue subtitles</label><label><input type="checkbox" data-caption="soundCaptions"> Descriptive sound captions</label><p>Optional descriptions of engines and environmental sounds. Objective prompts and tactical warnings remain available.</p>';dialog.querySelector('#quality-settings').append(captionSettings);
  for(const input of captionSettings.querySelectorAll('input'))input.onchange=()=>window.roughCutRebuild?.setCaptionPreference(input.dataset.caption,input.checked);
  settings.onclick=()=>{for(const input of captionSettings.querySelectorAll('input'))input.checked=window.roughCutRebuild?.captions()[input.dataset.caption]===true;navigationInput.checked=window.roughCutRebuild?.navigation().clearNavigation===true;window.roughCutStudy?.prepare();const section=document.getElementById('spatial-settings');if(section)dialog.querySelector('#quality-settings').append(section);const feel=document.getElementById('feel-controls');if(feel&&!dialog.contains(feel)){const heading=document.createElement('h3');heading.textContent='Comfort and hold / toggle';dialog.querySelector('#quality-settings').append(heading,feel);}for(const input of dialog.querySelectorAll('[data-spatial]')){const value=RCSpatialControls.get()[input.dataset.spatial];if(input.type==='checkbox')input.checked=value;else{input.value=value;input.nextElementSibling.textContent=RCSpatialPreferences.format(input.dataset.spatial,value);}}for(const input of dialog.querySelectorAll('[data-feel]')){const value=window.roughCutRebuild.comfort()[input.dataset.feel];if(input.type==='checkbox')input.checked=value;else input.value=value;}dialog.showModal();};
  const brief=document.createElement('section');brief.id='night-order';brief.hidden=true;brief.setAttribute('role','dialog');brief.setAttribute('aria-modal','true');brief.setAttribute('aria-labelledby','night-order-title');
  brief.innerHTML='<div class="night-order-card"><div class="night-order-story"><small>5:47 PM · SOUTH GATE LOCKED</small><h1 id="night-order-title">One last<br>night order.</h1><p>Joe sent you across the course with one final assignment. Now the gate is chained shut, the office lights are out, and his mower is still running.</p><p>The exit release needs three field checks. Finish the paperwork. Find another way out. Keep clear of Joe.</p><strong class="night-order-goal">YOUR GOAL: COMPLETE 3 CHECKS + ESCAPE</strong></div><div class="night-order-plan"><h2>Your way out</h2><ol><li><b>Ring the Audit Bell</b><span>Follow the lantern path to the hanging brass bell.</span></li><li><b>Stamp the Field Log</b><span>Look for pale paperwork beneath a hooded lamp.</span></li><li><b>Sign the Release Review</b><span>Find the covered service desk near the far end.</span></li></ol><p class="night-order-exit"><b>Then choose ONE exit.</b><br>Key → maintenance shed. Valve → drain. Use the prompt at your exit and stay still until it opens.</p><p class="night-order-tip">Use cover and chipped balls to evade Joe. Need directions? Enable Clear navigation in Controls & comfort while paused.</p></div><footer><p data-brief-controls></p><div><small data-brief-safe>Time waits until you begin.</small><button type="button" data-brief-start>Step onto the course</button></div></footer></div>';
  shell.append(brief);const start=brief.querySelector('button'),briefControls=brief.querySelector('[data-brief-controls]'),briefSafe=brief.querySelector('[data-brief-safe]');start.onclick=event=>window.roughCutRebuild?.startBriefing(event.pointerType==='touch'?'touch':null);
  brief.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();start.focus();}});
  function briefing(data){
    const appearing=brief.hidden||start.disabled;brief.hidden=false;root.hidden=true;
    const safe=data.overtime?'OVERTIME: 2 balls · faster Joe. Time waits until you begin.':'Time waits until you begin.',label=data.ready?data.start:'Preparing the course…';
    if(briefControls.textContent!==data.controls)briefControls.textContent=data.controls;
    if(briefSafe.textContent!==safe)briefSafe.textContent=safe;
    if(start.textContent!==label)start.textContent=label;start.disabled=!data.ready;
    if(appearing&&data.ready)start.focus({preventScroll:true});
  }
  window.RCQualityUI={render,map,pause,result,scrollResult:amount=>{resultPanel.querySelector('.course-result-scroll').scrollTop+=amount;},scrollMap:amount=>{mapPanel.querySelector('.course-map-scroll').scrollTop+=amount;},briefing,hide:()=>{root.hidden=true;},mode:(mode,briefingVisible=false)=>{if(!['victory','defeat'].includes(mode)){wasResult=false;resultPanel.hidden=true;root.dataset.result='false';const journal=document.getElementById('study-launch');if(journal&&resultPanel.contains(journal))shell.append(journal);}if(mode!=='paused'){wasPaused=false;pausePanel.hidden=true;root.dataset.pause='false';for(const id of ['controls-launch','study-launch']){const button=document.getElementById(id);if(button&&pausePanel.contains(button))shell.append(button);}}if(mode!=='first_hole'||root.dataset.map!=='true')wasMap=false;if(mode!=='first_hole'||!briefingVisible)brief.hidden=true;settings.hidden=!['menu','paused','settings'].includes(mode);if(mode==='first_hole'&&dialog.open)dialog.close();},isDialogOpen:()=>dialog.open};
})();
