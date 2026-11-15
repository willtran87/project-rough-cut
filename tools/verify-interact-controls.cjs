const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/interact-controls-20261107';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__keys={state,resetFirstHole,render,NIGHT_ORDER_ACTIONS,defaultKeyboardBindings,readSavedPreferences,rebindKeyboardAction,resetKeyboardBindings,savePreferences};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__keys);
  const migration=await p.evaluate(()=>{
   const t=__keys,defaults=t.defaultKeyboardBindings(),old={...defaults,interact:'Enter'},custom={...old,focus:'KeyE'};
   const read=(bindings,version)=>{localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:bindings,keyboardBindingsVersion:version}));return t.readSavedPreferences().keyboardBindings;};
   const result={defaults,migrated:read(old),custom:read(custom),explicit:read(old,2),fresh:read(undefined),modern:read(defaults,2)};localStorage.removeItem('rough-cut.settings.v1');return result;
  });
  assert.equal(migration.defaults.interact,'KeyE');assert.deepEqual(migration.migrated,migration.defaults);assert.deepEqual(migration.fresh,migration.defaults);assert.deepEqual(migration.modern,migration.defaults);assert.equal(migration.custom.interact,'Enter');assert.equal(migration.custom.focus,'KeyE');assert.equal(migration.explicit.interact,'Enter');
  const persisted=await p.evaluate(()=>{
   localStorage.setItem('rough-cut.settings.v1',JSON.stringify({volume:.17,extension:'keep',reducedMotion:true}));
   __keys.savePreferences();const untouched=JSON.parse(localStorage.getItem('rough-cut.settings.v1'));
   __keys.state.volume=.29;__keys.savePreferences();return {untouched,edited:JSON.parse(localStorage.getItem('rough-cut.settings.v1'))};
  });
  assert.equal(persisted.untouched.volume,.17);assert.equal(persisted.untouched.reducedMotion,true);assert.equal(persisted.edited.volume,.29);assert.equal(persisted.edited.extension,'keep');
  await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>__keys.state.mode),'intro');await p.keyboard.press('Space');assert.equal(await p.evaluate(()=>__keys.state.mode),'menu');
  await p.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready);await p.keyboard.press('Enter');await p.locator('#opening-story [data-opening=skip]').click();await p.waitForFunction(()=>__keys.state.mode==='first_hole');
  await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const atBell=async()=>{await p.evaluate(()=>{const t=__keys,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.keys.clear();s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});const a=t.NIGHT_ORDER_ACTIONS[0];Object.assign(s.player,{x:a.x,y:a.y-6,yaw:0,pitch:0});advanceTime(50);});await p.evaluate(()=>RCScene3D.whenPresented());};
  await atBell();assert.match(await p.locator('[data-q="context"]').innerText(),/E to ring/);
  await p.screenshot({path:out+'/e-interact-2560.png'});
  await p.keyboard.press('Enter');assert(!(await p.evaluate(()=>__keys.state.hole.nightOrderActionsCompleted.includes('audit-bell'))));
  await p.keyboard.press('e');assert(await p.evaluate(()=>__keys.state.hole.nightOrderActionsCompleted.includes('audit-bell')));
  const before=await p.evaluate(()=>JSON.stringify(__keys.state.hole.nightOrderActionsCompleted));await p.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyE',key:'e',repeat:true,bubbles:true})));assert.equal(await p.evaluate(()=>JSON.stringify(__keys.state.hole.nightOrderActionsCompleted)),before);
  await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>__keys.state.mode),'paused');await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>__keys.state.mode),'first_hole');
  await p.evaluate(()=>__keys.rebindKeyboardAction('interact','KeyG'));await atBell();assert.match(await p.locator('[data-q="context"]').innerText(),/G to ring/);
  await p.keyboard.press('e');assert(!(await p.evaluate(()=>__keys.state.hole.nightOrderActionsCompleted.includes('audit-bell'))));await p.keyboard.press('g');assert(await p.evaluate(()=>__keys.state.hole.nightOrderActionsCompleted.includes('audit-bell')));
  const conflict=await p.evaluate(()=>{const t=__keys;t.rebindKeyboardAction('focus','KeyE');t.rebindKeyboardAction('interact','KeyE');return {...t.state.keyboardBindings};});assert.equal(conflict.focus,'KeyG');assert.equal(conflict.interact,'KeyE');assert.equal(new Set(Object.values(conflict)).size,Object.keys(conflict).length);
  await p.evaluate(()=>__keys.rebindKeyboardAction('interact','Enter'));await p.reload();await p.waitForFunction(()=>window.__keys);assert.equal(await p.evaluate(()=>__keys.state.keyboardBindings.interact),'Enter');
  await p.evaluate(()=>__keys.resetKeyboardBindings());assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')).keyboardBindingsVersion),2);
  await p.reload();await p.waitForFunction(()=>window.__keys);assert.equal(await p.evaluate(()=>__keys.state.keyboardBindings.interact),'KeyE');
  await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready);await atBell();await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  for(const [w,h]of [[1280,720],[844,390]]){await p.setViewportSize({width:w,height:h});await p.evaluate(()=>__keys.render());await p.evaluate(()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/e-interact-'+w+'.png'});}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verification.json',JSON.stringify({passed:true,migration,checks:['Actual Level 1 save preserves newer campaign edits and unknown fields','Enter menu/start/pause confirmation','E rings actual bell; Enter does not activate gameplay','Remapped G works and prompts follow it','Conflict swaps stay unique','Saved explicit Enter survives reload; reset restores E'],errors},null,2));console.log('Interaction controls passed: migration, menus, live E/G input, prompts, conflict swaps, persistence and responsive views.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
