/* Level 1 DOM adapter. Preference validation/persistence is shared with chapters. */
(() => {
 const {defaults,limits,format}=RCSpatialPreferences,store=RCSpatialPreferences.create();
 window.RCSpatialControls=store;
 const host=document.getElementById('study-setup');if(!host)return;
 const section=document.createElement('section');section.id='spatial-settings';
 section.innerHTML='<h2>Perspective and response</h2><p>Field of view and device sensitivities carry to Under the Green. Scene resolution applies across chapters. Immediate movement is the default; the optional 80 ms start ramp still stops immediately when released.</p><div class="study-grid"></div><p data-spatial-status role="status"></p>';
 const names={resolution:'Scene resolution (HUD stays sharp)',fov:'Vertical field of view',mouse:'Mouse sensitivity',controller:'Controller sensitivity',touch:'Touch sensitivity',invertVertical:'Invert vertical look (Level 1 only)',acceleration:'Compare short start ramp (on-foot chapters)'};
 const controls=[];
 function sync(values){for(const {name,input,output}of controls){if(input.type==='checkbox')input.checked=values[name];else{input.value=values[name];output.textContent=format(name,values[name]);}}}
 for(const name in defaults){
  const label=document.createElement('label'),input=document.createElement('input'),output=document.createElement('output');label.textContent=names[name];input.dataset.spatial=name;
  if(typeof defaults[name]==='boolean')input.type='checkbox';
  else{input.type='range';input.min=limits[name][0];input.max=limits[name][1];input.step=name==='fov'?1:.05;}
  input.addEventListener('input',()=>store.set(name,input.type==='checkbox'?input.checked:Number(input.value)));
  label.append(input,output);section.querySelector('.study-grid').append(label);controls.push({name,input,output});
 }
 store.subscribe((values,name,saved)=>{sync(values);section.querySelector('[data-spatial-status]').textContent=saved?'':'Settings apply for this session. Browser storage is unavailable.';});
 sync(store.get());host.append(section);
})();
