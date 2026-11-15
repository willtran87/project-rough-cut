const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const {actionBindings,CONTROL_PROFILES}=await import('../web/control-profiles.js');
 const fresh=actionBindings('onFoot'),old={...fresh,focus:'KeyQ',look_back:'KeyR'};
 assert.equal(fresh.interact,'KeyE');assert.equal(fresh.look_back,'KeyQ');assert.equal(fresh.focus,'KeyR');
 for(const version of [0,1,2])assert.deepEqual(actionBindings('onFoot',old,version),fresh);
 assert.deepEqual(actionBindings('onFoot',{...old,interact:'Enter'},1),fresh);
 assert.deepEqual(actionBindings('onFoot',{move_up:'KeyI',sprint:'KeyT'},0),{...fresh,move_up:'KeyI',sprint:'KeyT'});
 const custom={...fresh,look_back:'KeyV',focus:'KeyN',interact:'Enter'};
 assert.deepEqual(actionBindings('onFoot',custom,3),custom);
 assert.deepEqual(actionBindings('onFoot',custom,2),custom);
 assert.deepEqual(actionBindings('chase'),CONTROL_PROFILES.chase);
 const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/damp-atmosphere',errors=[],views=[];fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:process.argv.includes('--software')?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  // Exercise a real saved v2 profile, not only new-install defaults.
  await p.addInitScript(old=>localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindings:old,keyboardBindingsVersion:2})),old);
  await p.goto('http://127.0.0.1:4187/under-green.html?test');
  await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  await p.click('#primary');
  const flicker=await p.evaluate(async()=>{
   const {dampLampLevel}=await import('./under-green-atmosphere.js');
   const values=Array.from({length:1800},(_,i)=>dampLampLevel(i/60,0));
   return {min:Math.min(...values),max:Math.max(...values),largestStep:Math.max(...values.slice(1).map((v,i)=>Math.abs(v-values[i]))),reduced:[0,5,7,100].map(t=>dampLampLevel(t,2,true))};
  });
  assert(flicker.min>=.16&&flicker.max<.96&&flicker.max-flicker.min>.5);assert(flicker.largestStep<.035);
  assert(flicker.reduced.every(v=>v===.72));
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const [name,x,y,yaw,pitch]of width===2560?[['arrival',0,5,0,0],['gallery',0,17,0,.05],['junction',0,31.5,0,0],['bunker',-20,70,Math.PI,0],['pump',-25.4,40,Math.PI/2,0],['range',12,36,Math.PI,0],['keeper',12,2,0,0]]:[['gallery',0,17,0,.05]]){
    const state=await p.evaluate(async({x,y,yaw,pitch})=>{
     const {createRun}=await import('./under-green-sim.js'),{rangeY}=await import('./under-green-layout.js');
     const r=createRun();r.mode='playing';r.time=27;r.messageTime=0;r.joe.phase='absent';
     Object.assign(r.player,{x,y:x>6?rangeY(y):y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);
     return JSON.parse(render_game_to_text());
    },{x,y,yaw,pitch});
    assert(state.graphics.atmosphere.wallRoots>0&&state.graphics.atmosphere.hangingRoots>0&&state.graphics.atmosphere.mudBanks>0);
    assert((await p.locator('#hint').textContent()).includes('Q rear'));
    views.push({name,width,height,graphics:state.graphics});await p.screenshot({path:`${out}/${name}-${width}.png`});
   }
  }
  await p.setViewportSize({width:2560,height:1600});
  await p.evaluate(()=>{Object.assign(__underGreen.run.player,{x:0,y:17,yaw:0,pitch:.05});__underGreen.run.time=38.8;advanceTime(0);});
  const dim=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.atmosphere.lightLevels);
  assert(dim[2]<.3);await p.screenshot({path:out+'/gallery-dim-2560.png'});
  await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(2000));
  assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.atmosphere.lightLevels),dim);
  await p.click('#primary');
  await p.keyboard.down('q');await p.evaluate(()=>advanceTime(500));assert(Math.abs(await p.evaluate(()=>__underGreen.run.player.rearAngle))>3);await p.keyboard.up('q');
  await p.evaluate(()=>advanceTime(600));assert(Math.abs(await p.evaluate(()=>__underGreen.run.player.rearAngle))<.001);
  await p.keyboard.press('Escape');await p.locator('#comfort summary').click();
  await p.locator('#reduced').check();await p.evaluate(()=>advanceTime(0));
  assert((await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.atmosphere.lightLevels)).every(v=>v===.72));
  for(const [id,key]of [['interact','KeyE'],['look_back','KeyQ'],['focus','KeyR']])assert.equal(await p.locator(`[data-binding=${id}]`).inputValue(),key);
  // Save a movement edit and verify the new version marker preserves the pair.
  await p.locator('[data-binding=move_up]').selectOption('KeyI');
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')));
  assert.equal(saved.keyboardBindingsVersion,3);assert.equal(saved.keyboardBindings.look_back,'KeyQ');assert.equal(saved.keyboardBindings.focus,'KeyR');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,bindings:{fresh,legacyMigrated:true,customPreserved:true,saved},flicker,views,errors},null,2));
  console.log(JSON.stringify({passed:true,views:views.length,atmosphere:views[0].graphics.atmosphere,flicker,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
