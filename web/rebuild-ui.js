/* Optional practice/comfort controls and direct touch choices. */
(() => {
  if(!window.roughCutRebuild)return;
  const api=()=>window.roughCutRebuild,host=document.getElementById('study-setup');
  const section=document.createElement('section');
  section.innerHTML='<h2>Practise the fundamentals</h2><p>Practice starts a separate run without records. Finish or leave through Pause → Return to menu.</p><div class="study-actions"><button type="button" data-lab="calibration">Movement practice</button><button type="button" data-lab="encounter">Bell encounter</button></div><h2>Camera and controls</h2><p>The default camera stays steady. These preferences are saved on this device.</p><div id="feel-controls" class="study-grid"></div>';
  host.prepend(section);
  const labels={cameraBob:'Camera bob',cameraRoll:'Camera lean',cameraShake:'Impact shake',flashes:'Scare flashes',apparitions:'Ghost sightings',ghostInterference:'Ghost screen interference',crouchToggle:'Toggle crouch',sprintToggle:'Toggle sprint (keyboard / controller)',touchSprintToggle:'Tap Run to toggle (on-foot chapters)'};
  for(const [key,value]of Object.entries(api().comfort())){
    const label=document.createElement('label'),input=document.createElement('input');label.textContent=labels[key];input.dataset.feel=key;
    if(typeof value==='boolean'){input.type='checkbox';input.checked=value;}else{input.type='range';input.min='0';input.max='.6';input.step='.1';input.value=String(value);}
    input.addEventListener('input',()=>api().setComfort(key,input.type==='checkbox'?input.checked:Number(input.value)));label.append(input);if(key==='touchSprintToggle'){const help=document.createElement('small');help.textContent='Tap Run once, then move and look with two thumbs. Tap again to walk. Pause or an interrupted touch clears it.';label.append(help);}section.querySelector('#feel-controls').append(label);
  }
  section.querySelectorAll('[data-lab]').forEach(b=>b.addEventListener('click',()=>api().startLab(b.dataset.lab)));
  const choices=document.createElement('div');choices.id='direct-choices';choices.hidden=true;choices.setAttribute('aria-label','Choose an approach');document.getElementById('game-shell').append(choices);
  const choiceSignature=choice=>choice.targetId+':'+choice.labels.join('|');
  for(let i=0;i<2;i++){const b=document.createElement('button');b.type='button';b.addEventListener('click',event=>{
    event.stopPropagation();const current=api().choices();
    // A displayed choice belongs to one station. If its owner changed between
    // presentation and click, refresh instead of committing a different action.
    if(!current||choiceSignature(current)!==previous){renderChoices();return;}
    api().choose(i);renderChoices();
  });choices.append(b);}
  let previous='';
  function renderChoices(input=api().route().input){
    const choice=api().choices();choices.hidden=!choice||Boolean(document.pointerLockElement)||input==='gamepad';
    if(choice){const signature=choiceSignature(choice);if(signature!==previous){[...choices.children].forEach((b,i)=>b.textContent=(i+1)+': '+choice.labels[i]);previous=signature;}}
  }
  window.RCRebuildUI={renderChoices};
  const routes=document.createElement('div');routes.id='route-choices';routes.hidden=true;routes.setAttribute('aria-label','Preferred exit route');document.getElementById('game-shell').append(routes);
  for(const [id,label]of [['shed','Plan shed · find key'],['drain','Plan drain · open valve']]){const b=document.createElement('button');b.type='button';b.dataset.route=id;b.textContent=label;b.addEventListener('click',()=>{api().selectRoute(id);document.getElementById('game').focus();});routes.append(b);}
  const tools=document.createElement('section');tools.id='course-tools';tools.hidden=true;tools.setAttribute('aria-label','Optional course tools');
  tools.innerHTML='<h2>COURSE TOOLS <small>Optional · use at the marked location</small></h2><div class="course-tool-list"></div><p class="course-tool-rules">Switch: 16s dark + noise · Timer: 4s fuse</p><p>The course keeps moving while the map is open.</p>';
  document.getElementById('game-shell').append(tools);
  let toolsSignature='';
  setInterval(()=>{
    const toolState=api().tools();tools.hidden=!toolState.visible;
    if(toolState.visible){
      const signature=JSON.stringify(toolState.items);
      if(signature!==toolsSignature){
        toolsSignature=signature;
        tools.querySelector('.course-tool-list').replaceChildren(...toolState.items.map(item=>{
          const row=document.createElement('div');row.className='course-tool'+(item.spent?' spent':'');row.dataset.tool=item.id;
          const marker=document.createElement('b');marker.className='course-tool-marker';marker.textContent=item.marker;
          const copy=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('small'),status=document.createElement('span');
          name.textContent=item.label;detail.textContent=item.detail;status.className='course-tool-status';status.textContent=item.status;
          copy.append(name,detail);row.append(marker,copy,status);return row;
        }));
      }
    }
    const route=api().route();routes.hidden=!route.visible;
    const map=document.getElementById('course-map'),responsive=route.visible&&route.dom&&map;
    for(const [node,slot]of [[routes,'[data-map-routes]'],[tools,'[data-map-tools]']]){const parent=responsive?map.querySelector(slot):document.getElementById('game-shell');if(node.parentElement!==parent)parent.append(node);}
    for(const b of routes.children){
      b.setAttribute('aria-pressed',String(b.dataset.route===route.selected));
      const plan=route.plans?.find(p=>p.id===b.dataset.route);
      if(plan){const copy=plan.title+'\n'+plan.access+'\n'+plan.tradeoff;
        if(b.textContent!==copy)b.textContent=copy;
        b.setAttribute('aria-label',copy.replaceAll('\n','. '));
      }
    }
    renderChoices(route.input);
  },100);
})();
