/* Shared in-game presentation. Construction and mode changes only: no frame loop,
   polling, observers, image filters or extra rendering surfaces. */
(() => {
 const categories=['Audio','Controls','Readability','Camera','Chapter'];
 function category(el,fallback='Chapter'){
  if(el.dataset.themeCategory)return el.dataset.themeCategory;
  const key=[el.id,...[...el.querySelectorAll('input,select')].map(e=>e.id+' '+Object.values(e.dataset).join(' ')),el.querySelector('legend,h3')?.textContent||(/^(H3|P)$/.test(el.tagName)?el.textContent:'')].join(' ').toLowerCase();
  if(/keyboard|binding|touch.run|movement|on-foot-settings|stickdeadzone|feel-controls|control-guide|comfort and hold/.test(key))return 'Controls';
  if(/caption|subtitle|navigation|readability|route-hints/.test(key))return 'Readability';
  if(/volume|muted|music|audio/.test(key))return 'Audio';
  if(/spatial|camera|resolution|reduced|shake|flash|perspective|response|visual-tier|picture quality/.test(key))return 'Camera';
  return fallback;
 }
 function settingRows(root){
  for(const label of root.querySelectorAll('label')){
   if(label.dataset.settingRow||label.closest('[data-keyboard-fields]')||!label.querySelector('input,select'))continue;
   const texts=[...label.childNodes].filter(n=>n.nodeType===3),name=document.createElement('span');
   name.className='rc-setting-name';name.textContent=texts.map(n=>n.textContent.trim()).filter(Boolean).join(' ');
   if(!name.textContent)continue;
   for(const text of texts)text.remove();label.prepend(name);label.dataset.settingRow='true';label.classList.add('rc-setting-row');
  }
 }
 function recordText(element,text){
  if(element.dataset.recordText===text)return;element.dataset.recordText=text;
  const articles=text.split(/\n\n+/).filter(Boolean).map(entry=>{const [title,...lines]=entry.split('\n'),article=document.createElement('article'),heading=document.createElement('h3'),body=document.createElement('p');heading.textContent=title;body.textContent=lines.join(' ');article.append(heading,body);return article;});
  element.replaceChildren(...articles);
 }
 function closing(panel,view){
  panel.dataset.closing=view;
  for(const actions of panel.querySelectorAll('.rc-closing-actions'))actions.hidden=actions.dataset.view!==view;
 }
 function settings(root){
  if(!root)return;
  if(root.dataset.themed){
   const body=root.querySelector(':scope>.rc-settings-body');if(!body)return;
   for(const child of [...body.children])root.append(child);
   root.querySelector(':scope>.rc-settings-tabs')?.remove();root.querySelector(':scope>.rc-settings-footer')?.remove();body.remove();
   for(const node of root.querySelectorAll('.rc-category-hidden'))node.classList.remove('rc-category-hidden');
  }
  root.dataset.themed='true';root.classList.add('rc-settings');settingRows(root);
  // Keep live help nodes and handlers, but let editable controls lead the form.
  const helpNodes=[...root.querySelectorAll(':scope>#control-guide,:scope>#comfort-controls,:scope>#replay-intro')];
  if(helpNodes.length){
   const help=document.createElement('details');help.className='rc-control-help';help.dataset.themeCategory='Controls';
   const heading=document.createElement('summary');heading.textContent='How to play · controls & story';help.append(heading,...helpNodes);root.append(help);
  }
  const isDetails=root.tagName==='DETAILS',summary=isDetails?root.querySelector(':scope>summary'):null;
  if(summary)summary.textContent='Settings & controls';
  const nav=document.createElement('nav');nav.className='rc-settings-tabs';nav.setAttribute('aria-label','Settings categories');
  const body=document.createElement('div');body.className='rc-settings-body';
  for(const child of [...root.children])if(child!==summary)body.append(child);
  const groups=[];
  let previousCategory='Controls';
  for(const child of body.children){
   if(child.matches('fieldset.campaign-settings')){
    let last='Audio';const rows=[];
    for(const row of child.children){if(row.tagName==='LEGEND')continue;
     last=category(row,last);row.dataset.themeCategory=last;rows.push(row);
    }groups.push({element:child,rows});
   }else {child.dataset.themeCategory=category(child,previousCategory);previousCategory=child.dataset.themeCategory;groups.push({element:child});}
  }
  let current='';
  function select(name){
   if(current===name)return;current=name;
   for(const {element,rows}of groups){if(rows){for(const row of rows)row.classList.toggle('rc-category-hidden',row.dataset.themeCategory!==name);element.classList.toggle('rc-category-hidden',!rows.some(row=>row.dataset.themeCategory===name));}
    else element.classList.toggle('rc-category-hidden',element.dataset.themeCategory!==name);}
   for(const b of nav.children)b.setAttribute('aria-pressed',String(b.textContent===name));body.scrollTop=0;
  }
  const available=categories.filter(name=>groups.some(g=>g.rows?g.rows.some(r=>r.dataset.themeCategory===name):g.element.dataset.themeCategory===name));
  for(const name of available){const b=document.createElement('button');b.type='button';b.textContent=name;b.onclick=()=>select(name);nav.append(b);}
  const footer=document.createElement('div');footer.className='rc-settings-footer';footer.textContent='Changes save automatically.';
  if(isDetails){const back=document.createElement('button');back.type='button';back.textContent='Back';back.onclick=()=>{root.open=false;summary.focus();};footer.append(back);}
  root.append(nav,body,footer);select(available[0]||'Chapter');
 }
 function report(parent,selector,label='Run details'){
  const nodes=[...parent.querySelectorAll(selector)];if(!nodes.length)return;
  const details=document.createElement('details');details.className='rc-report';details.innerHTML='<summary></summary>';details.querySelector('summary').textContent=label;
  nodes[0].before(details);for(const node of nodes)details.append(node);return details;
 }
 // Reparent existing content only on loss/exit transitions. Markers restore the
 // original victory, pause and launch layouts and preserve every input handler.
 function lossStage(root,parent,selectors){
  const stage=document.createElement('div');stage.className='rc-loss-stage';stage.hidden=true;
  stage.innerHTML='<div class="rc-loss-image"></div><section class="rc-loss-copy"><header></header><div class="rc-loss-voice"></div><div class="rc-loss-tip"></div><details class="rc-loss-details"><summary>Loss details & controls</summary></details></section>';
  parent.append(stage);const moved=[];let shown=false;
  return active=>{
   if(active===shown)return;shown=active;root.classList.toggle('rc-loss',active);stage.hidden=!active;
   if(active){
    stage.querySelector('details').open=false;
    for(const [slot,list]of Object.entries(selectors))for(const selector of list){
     const node=root.querySelector(selector);if(!node)continue;
     const marker=document.createComment('loss-content');node.before(marker);moved.push({node,marker});stage.querySelector(slot).append(node);
    }
   }else for(const {node,marker}of moved.splice(0)){marker.replaceWith(node);}
  };
 }
 let nightLoss=null;
 function resultLoss(active){nightLoss?.(active);}
 function mount(panel,id){
  panel.dataset.chapter=id;
  if(id==='back-nine'){const shell=document.getElementById('game-shell');const identity=document.createElement('div');identity.className='rc-drive-identity';identity.innerHTML='<small>02 / SHED ROUTE</small><strong>The Back Nine</strong>';const note=document.createElement('p');note.className='rc-drive-note';note.textContent='Steer across the grounds. Brake before tight turns. Rear checks the pursuit behind you.';shell.append(identity,note);}
  const comfort=panel.querySelector('#comfort,#chase-comfort');settings(comfort);
  const native=panel.querySelector('.rc-brief-native'),notes=panel.querySelector('.rc-brief-notes');
  // The folded guide follows the headline, rather than preceding it.
  if(notes&&native)native.append(notes);
  // Follow the button's state, not the click: chapters update aria-expanded on
  // their next render, after any microtask queued by the click has run.
  const reviewGuide=panel.querySelector('#review-guide');
  if(reviewGuide&&notes)new MutationObserver(()=>{const open=reviewGuide.getAttribute('aria-expanded')==='true';if(notes.open!==open){notes.open=open;if(open)notes.scrollIntoView({block:'nearest'});}}).observe(reviewGuide,{attributes:true,attributeFilter:['aria-expanded']});
  for(const nav of panel.querySelectorAll('.chapters'))for(const link of nav.children){
   if(link.textContent.includes('Back Nine'))link.textContent='02 · The Back Nine · Shed route';
   if(link.textContent.includes('Under the Green'))link.textContent='02 · Under the Green · Drain route';
  }
  // Move existing art into the same scroll region as its outcome. IDs and native
  // hide/show logic survive, with no duplicated downloads or presentation loop.
  const art=document.querySelector(id==='back-nine'?'#defeat-tableau':id==='under-green'?'#defeat-art':'#defeat-backdrop');
  if(art&&native){native.prepend(art);art.classList.add('rc-outcome-art');}
  if(id==='under-green'){const quote=document.createElement('blockquote');quote.id='joe-loss-quote';quote.hidden=true;native.append(quote);}
  if(id==='back-nine'){const tip=document.createElement('p');tip.id='defeat-tip';tip.hidden=true;native.append(tip);panel.querySelector('#defeat-dialogue small')?.replaceChildren(document.createTextNode('Joe'));}
  const quote=panel.querySelector(id==='back-nine'?'#defeat-dialogue':id==='under-green'?'#joe-loss-quote':'#loss-quote');quote?.classList.add('rc-loss-quote');
  const presentLoss=lossStage(panel,native,{
   '.rc-loss-image':['.rc-outcome-art'],
   '.rc-loss-copy>header':id==='back-nine'?['.bn-heading']:['.eyebrow','#title'],
   '.rc-loss-voice':[id==='back-nine'?'#defeat-dialogue':id==='under-green'?'#joe-loss-quote':'#loss-quote'],
   '.rc-loss-tip':[id==='back-nine'?'#defeat-tip':id==='under-green'?'#retry-advice':'#advice'],
   '.rc-loss-details':id==='back-nine'?['#story','#defeat-review']:id==='under-green'?['#result','#retry-progress','#comfort','#journal']:['#result','#tagline','#loss-story','#retained','#comfort']
  });
  if(id==='back-nine'){const logs=report(panel,'#field-log','Recovered crew logs');logs?.classList.add('rc-record');}
  const journal=panel.querySelector('#journal');if(journal){journal.classList.add('rc-record');if(id==='under-green'){const heading=document.createElement('h3');heading.textContent=journal.querySelector('summary').textContent;journal.querySelector('summary').textContent='Recovered records';journal.querySelector('summary').after(heading);}}
  if(id==='final-cut'){
   report(panel,'#completion-details','Round record');
   for(const [selector,view]of [['#final-credits','credits'],['#post-credits','notice']]){const actions=panel.querySelector(selector+' .actions');actions.classList.add('rc-closing-actions');actions.dataset.view=view;actions.hidden=true;panel.querySelector('.rc-brief-footer').prepend(actions);}
  }
  let previous='';
  return {update(mode){if(mode===previous)return;previous=mode;
   presentLoss(mode==='caught');
   panel.dataset.screen=mode;panel.classList.toggle('rc-runtime',['paused','caught','complete'].includes(mode));
   if(comfort)comfort.open=false;if(notes)notes.open=false;
   for(const detail of panel.querySelectorAll('.rc-report'))detail.open=false;
  }};
 }
 function night(){
  const result=document.getElementById('course-result');if(result)report(result,'article dl,.course-result-events,.course-result-next','Run details & next steps');
  if(result){
   const still=document.createElement('img');still.className='rc-loss-still';still.src='./assets/optimized/rough-cut-joe-capture-v1.webp';still.width=1672;still.height=941;still.alt='Joe drives his mower toward your fallen viewpoint on the moonlit course.';still.hidden=true;result.querySelector('.course-result-visual').append(still);
   result.querySelector('blockquote').classList.add('rc-loss-quote');
   nightLoss=lossStage(result,result.querySelector('.course-result-scroll'),{
    '.rc-loss-image':['.rc-loss-still'],'.rc-loss-copy>header':['[data-result=kicker]','[data-result=title]'],
    '.rc-loss-voice':['blockquote'],'.rc-loss-tip':['[data-result=advice]'],
    '.rc-loss-details':['[data-result=summary]','[data-result=headline]','[data-result=evidence]','[data-result=milestone]','article .rc-report','.course-result-journal']
   });
  }
  const journal=document.getElementById('study-launch');if(journal)journal.textContent='Field journal';
  const study=document.getElementById('study-dialog');if(study){
   study.querySelector('.study-heading h1').textContent='Field journal';
   study.querySelector(':scope>p').textContent='Discoveries and recovered records from your time on the course.';
   // Explicit opt-in retains the existing local research tools for developers.
   if(!new URLSearchParams(location.search).has('playtest'))study.classList.add('rc-journal-only');
  }
 }
 window.RCGameTheme={mount,night,settings,recordText,closing,resultLoss};
})();
