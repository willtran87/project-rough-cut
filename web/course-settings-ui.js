/* Responsive presentation; game.js owns preferences, capture and navigation. */
(() => {
  const shell=document.getElementById('game-shell'),panel=document.createElement('section');
  panel.id='course-settings';panel.hidden=true;panel.setAttribute('aria-label','Settings');
  panel.innerHTML='<div class="course-settings-card"><header><div><small data-settings-context></small><h1>Settings</h1></div><button type="button" data-settings-command="return">Return</button></header><nav aria-label="Settings categories"></nav><div class="course-settings-scroll"><div class="course-settings-rows"></div><section class="course-settings-presets" hidden><h2>Camera presets</h2><div></div><div class="course-look-preview" aria-label="Drag to test horizontal look"><span>Drag here to test look</span><i></i></div></section><p class="course-settings-help"></p></div><footer><p role="status" data-settings-status></p><div class="course-settings-actions"></div><small data-settings-hint></small></footer></div>';
  shell.append(panel);let api=null,layout='',selected='',wasOpen=false;
  const rows=panel.querySelector('.course-settings-rows'),nav=panel.querySelector('nav'),actions=panel.querySelector('.course-settings-actions'),scroller=panel.querySelector('.course-settings-scroll'),presets=panel.querySelector('.course-settings-presets');
  const command=(label,name,run)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.settingsCommand=name;b.onclick=run;return b;};
  panel.querySelector('[data-settings-command="return"]').onclick=()=>api?.back();
  for(const [i,label]of ['Standard','Calm','Fixed view'].entries())presets.querySelector('div').append(command(label,'preset-'+i,()=>api.preset(i)));
  const preview=panel.querySelector('.course-look-preview');let pointer=null,lastX=0;
  preview.onpointerdown=e=>{pointer=e.pointerId;lastX=e.clientX;preview.setPointerCapture(pointer);};
  preview.onpointermove=e=>{if(pointer!==e.pointerId)return;api.preview((e.clientX-lastX)*1120/Math.max(1,preview.clientWidth));lastX=e.clientX;};
  preview.onpointerup=preview.onpointercancel=preview.onlostpointercapture=()=>{pointer=null;};
  function hide(){
    panel.hidden=true;wasOpen=false;pointer=null;
    const comfort=document.getElementById('controls-launch');if(comfort&&panel.contains(comfort))shell.append(comfort);
  }
  function render(data,controls){
    api=controls;panel.hidden=false;panel.style.setProperty('--settings-scale',data.scale);panel.dataset.page=data.page;
    panel.querySelector('h1').textContent=data.page==='bindings'?'Key bindings':'Settings';
    panel.querySelector('[data-settings-context]').textContent=data.context;
    panel.querySelector('[data-settings-command="return"]').textContent=data.page==='bindings'?'Back to settings':'Return';
    const key=data.page+':'+data.category;
    if(layout!==key){
      const comfort=document.getElementById('controls-launch');if(comfort&&actions.contains(comfort))shell.append(comfort);
      layout=key;rows.replaceChildren();nav.replaceChildren();actions.replaceChildren();scroller.scrollTop=0;
      if(data.page!=='bindings')data.categories.forEach((label,i)=>{const b=command(label,'category-'+i,()=>api.category(i));b.setAttribute('aria-current',String(i===data.category));nav.append(b);});
      nav.hidden=data.page==='bindings';
      const categoryButton=nav.querySelector('[aria-current="true"]');if(categoryButton)nav.scrollLeft=Math.max(0,categoryButton.offsetLeft-nav.offsetLeft-(nav.clientWidth-categoryButton.offsetWidth)/2);
      for(const row of data.rows){
        const label=document.createElement('label');label.className='course-settings-row';label.dataset.setting=row.id;
        const title=document.createElement('span');title.textContent=row.label;label.append(title);
        let control;
        if(row.type==='slider'){
          // Saved defaults/presets can lie between adjustment steps (72% mix,
          // 65% look). Display their exact value; the game quantizes edits.
          control=document.createElement('input');control.type='range';control.min=row.min;control.max=row.max;control.step='any';
          control.oninput=()=>api.change(row.index,Number(control.value));control.onchange=()=>api.previewSound(row.index);
          const output=document.createElement('output');output.id='course-setting-value-'+row.id;label.append(output);control.setAttribute('aria-describedby',output.id);
        }else{
          control=document.createElement('button');control.type='button';control.onclick=()=>row.type==='binding'?api.capture(row.index):api.change(row.index);
          if(row.type!=='binding')control.setAttribute('role','switch');
        }
        control.id='course-setting-'+row.id;control.dataset.settingIndex=row.index;control.setAttribute('aria-label',row.label);
        control.onfocus=()=>api.select(row.index);label.htmlFor=control.id;label.append(control);rows.append(label);
      }
      actions.append(command(data.page==='bindings'?'Reset keys':'Reset category','reset',()=>api.reset()));
      if(data.page!=='bindings')actions.append(command('Key bindings','bindings',()=>api.bindings()));
      if(data.category===2&&data.page!=='bindings')actions.append(command('Replay lessons','lessons',()=>api.lessons()));
    }
    for(const row of data.rows){
      const label=rows.querySelector('[data-setting="'+row.id+'"]'),control=label.querySelector('[data-setting-index]');label.dataset.selected=String(row.index===data.selected);
      if(row.type==='slider'){if(Number(control.value)!==row.value)control.value=row.value;label.querySelector('output').textContent=row.display;control.setAttribute('aria-valuetext',row.display);}
      else{control.textContent=row.display;if(row.type==='binding')control.setAttribute('aria-pressed',String(row.capturing));else control.setAttribute('aria-checked',String(row.value));}
    }
    presets.hidden=data.page==='bindings'||data.category!==1;
    [...presets.querySelectorAll('button')].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===data.preset)));
    preview.querySelector('i').style.left=(50+Math.sin(data.previewYaw)*45)+'%';
    panel.querySelector('.course-settings-help').textContent=data.help;
    panel.querySelector('[data-settings-status]').textContent=data.status;
    panel.querySelector('[data-settings-hint]').textContent=data.hint;
    const comfort=document.getElementById('controls-launch');if(comfort&&!actions.contains(comfort)){actions.append(comfort);comfort.hidden=false;}
    const selection=data.page+':'+data.selected;
    if((!wasOpen||selected!==selection)&&!document.querySelector('dialog[open]')){
      const control=rows.querySelector('[data-setting-index="'+data.selected+'"]');control?.focus({preventScroll:true});control?.closest('label').scrollIntoView({block:'nearest'});
    }
    selected=selection;wasOpen=true;
  }
  window.RCCourseSettings={render,hide,scroll:amount=>{scroller.scrollTop+=amount;}};
})();
