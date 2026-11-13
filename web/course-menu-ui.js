(() => {
  const shell=document.getElementById('game-shell'),panel=document.createElement('section');
  panel.id='course-menu';panel.hidden=true;panel.setAttribute('aria-label','Clubhouse');
  panel.innerHTML='<canvas class="course-menu-art" width="1280" height="720" aria-hidden="true"></canvas><div class="course-menu-card"><header><small data-clubhouse="kicker"></small><h1 data-clubhouse="title"></h1><p data-clubhouse="tagline"></p></header><div class="course-menu-scroll"><div class="course-menu-main"><nav aria-label="Main menu"></nav><aside><section class="course-menu-invitation"><h2>One last action item.</h2><p>The south gate is locked. Joe is still here.</p><ol><li><strong>Follow the lanterns</strong><span>Three field checks lead to your escape.</span></li><li><strong>Make him look elsewhere</strong><span>Chip a ball. Move while Joe investigates.</span></li><li><strong>Break his sightline</strong><span>Use solid cover. Let attention fall.</span></li></ol><p>Get out alive. Learn the course as you go.</p></section><section class="course-menu-portfolio"><h2>Night Order portfolio</h2><p data-clubhouse="authorization"></p><p data-clubhouse="progress"></p><div class="course-order-cards"></div><details class="course-shot-book"><summary>Shot book</summary><ul></ul></details><section class="course-menu-overtime"><h3>Overtime Audit</h3><p data-clubhouse="overtimeHelp"></p><button type="button" data-clubhouse-command="overtime"></button><p data-clubhouse="overtimeRecord"></p></section></section><p class="course-menu-record" data-clubhouse="record"></p><p data-clubhouse="career"></p><p data-clubhouse="next"></p><section class="course-chapters"><h2>Continue a chapter</h2></section></aside></div><section class="course-clocked-out" hidden><h2>The release window reopens at dawn.</h2><p>Night Order: <strong>left unsigned.</strong></p><p>Joe’s calendar remains fully committed.</p><small>No overtime was authorized.</small></section></div><footer><div class="course-menu-notice" role="status"><strong data-clubhouse="noticeTitle"></strong><p data-clubhouse="notice"></p></div><div class="course-menu-extras"><button type="button" data-clubhouse-command="return" hidden>Return to clubhouse</button></div><small data-clubhouse="controls"></small></footer></div>';
  shell.append(panel);const art=panel.querySelector('canvas').getContext('2d'),nav=panel.querySelector('.course-menu-main>nav'),scroll=panel.querySelector('.course-menu-scroll'),extras=panel.querySelector('.course-menu-extras');
  let api=null,wasOpen=false,lastSelection=-1,lastVariant='',lastMode='',contentKey='';
  const button=(text,callback)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=callback;return b;};
  const text=(key,value)=>{const el=panel.querySelector('[data-clubhouse="'+key+'"]');if(el.textContent!==value)el.textContent=value;};
  panel.querySelector('[data-clubhouse-command="return"]').onclick=()=>api.back();
  panel.querySelector('[data-clubhouse-command="overtime"]').onclick=()=>api.overtime();
  function restore(){for(const id of ['controls-launch','study-launch']){const b=document.getElementById(id);if(b&&panel.contains(b))shell.append(b);}const chapters=document.getElementById('chapter-links');if(chapters&&panel.contains(chapters)){chapters.hidden=true;document.body.append(chapters);}}
  function hide(){if(!wasOpen)return;panel.hidden=true;wasOpen=false;restore();}
  function render(data,controls){
    api=controls;panel.hidden=false;panel.dataset.screen=data.mode;panel.style.setProperty('--menu-scale',data.scale);
    art.clearRect(0,0,1280,720);art.drawImage(data.art,0,0,1280,720);
    const clock=data.mode==='clocked_out',changedMode=data.mode!==lastMode;
    text('kicker',clock?'Personnel action · Out of office':'A Joe horror game');text('title',clock?'Shift ended':'Rough Cut');text('tagline',clock?'Release night':'The course closes at dusk. Joe does not.');
    panel.querySelector('.course-menu-main').hidden=clock;panel.querySelector('.course-clocked-out').hidden=!clock;
    panel.querySelector('.course-menu-invitation').hidden=!data.firstRound;panel.querySelector('.course-menu-portfolio').hidden=data.firstRound;
    if(!nav.children.length)data.actions.forEach((action,i)=>{const b=button('',()=>api.activate(i));b.dataset.menuAction=i;b.innerHTML='<strong></strong><small></small>';b.onfocus=()=>api.select(i);nav.append(b);});
    for(const [i,b]of [...nav.children].entries()){b.querySelector('strong').textContent=data.actions[i].label;b.querySelector('small').textContent=data.actions[i].description;b.dataset.selected=String(data.selected===i);}
    const key=JSON.stringify([data.orders,data.shots]);
    if(key!==contentKey){
      contentKey=key;const cards=panel.querySelector('.course-order-cards');cards.replaceChildren();
      for(const order of data.orders){
        const card=document.createElement('article');card.dataset.order=order.id;
        const choose=button(`${String(order.number).padStart(2,'0')} · ${order.name}`,()=>api.order(order.index));choose.dataset.variantIndex=order.index;choose.setAttribute('aria-disabled',String(!data.unlocked));card.append(choose);
        for(const line of [order.status,order.change,order.keyHint,order.record]){const p=document.createElement('p');p.textContent=line;card.append(p);}
        const details=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('ul');summary.textContent=`Performance stamps · ${order.stamps.filter(s=>s.earned).length}/${order.stamps.length}`;details.append(summary,list);
        for(const stamp of order.stamps){const li=document.createElement('li');li.textContent=`${stamp.earned?'✓':'○'} ${stamp.name} · ${stamp.hint}`;list.append(li);}card.append(details);cards.append(card);
      }
      panel.querySelector('.course-shot-book ul').replaceChildren(...data.shots.map(shot=>{const li=document.createElement('li');li.textContent=`${shot.earned?'✓':'○'} ${shot.label} · ${shot.hint}`;return li;}));
    }
    for(const card of panel.querySelectorAll('[data-order]')){const active=card.dataset.order===data.variant;card.dataset.selected=String(active);card.querySelector('button').setAttribute('aria-pressed',String(active));card.querySelector('button').setAttribute('aria-disabled',String(!data.unlocked));card.querySelector('button').disabled=!data.unlocked;}
    for(const key of ['authorization','progress','record','career','next','overtimeHelp','overtimeRecord','noticeTitle','notice','controls'])text(key,data[key]);
    const overtime=panel.querySelector('[data-clubhouse-command="overtime"]');overtime.textContent=data.overtimeLabel;overtime.setAttribute('aria-pressed',String(data.overtime));overtime.setAttribute('aria-disabled',String(!data.overtimeUnlocked));overtime.disabled=!data.overtimeUnlocked;
    const back=panel.querySelector('[data-clubhouse-command="return"]');back.hidden=!clock&&data.mode!=='claim';back.textContent=clock?'Return to clubhouse':'Dismiss rejection';
    for(const id of ['controls-launch','study-launch']){const b=document.getElementById(id);if(b&&!extras.contains(b))extras.append(b);if(b&&id==='study-launch')b.hidden=!window.roughCutStudy?.available();}
    const chapters=document.getElementById('chapter-links');if(chapters){if(clock){chapters.hidden=true;}else{const host=panel.querySelector('.course-chapters');if(!host.contains(chapters))host.append(chapters);chapters.hidden=false;}}
    if(changedMode&&!document.querySelector('dialog[open]'))scroll.scrollTop=0;
    if(!document.querySelector('dialog[open]')){
      if(clock&&(!wasOpen||changedMode))back.focus({preventScroll:true});
      else if(!clock&&(!wasOpen||lastSelection!==data.selected||lastMode==='clocked_out')){const b=nav.children[data.selected];b.focus({preventScroll:true});b.scrollIntoView({block:'nearest'});}
      else if(!clock&&lastVariant!==data.variant&&document.activeElement?.matches('[data-variant-index]')){const b=panel.querySelector('[data-order="'+data.variant+'"] button');b?.focus({preventScroll:true});b?.scrollIntoView({block:'nearest'});}
    }
    wasOpen=true;lastSelection=data.selected;lastVariant=data.variant;lastMode=data.mode;
  }
  function toggleDetails(){
    if(panel.hidden||panel.querySelector('.course-menu-portfolio').hidden)return;
    const details=[...panel.querySelectorAll('.course-menu-portfolio details')];
    const open=details.some(detail=>!detail.open);
    for(const detail of details)detail.open=open;
    panel.querySelector('[data-order][data-selected="true"] summary')?.scrollIntoView({block:'nearest'});
  }
  window.RCCourseMenu={render,hide,toggleDetails,scroll:amount=>{scroll.scrollTop+=amount;}};
})();
