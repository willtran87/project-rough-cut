const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/station-mechanisms';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__mechanisms={state,resetFirstHole,render,NIGHT_ORDER_ACTIONS};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__mechanismGpu=()=>({programs:renderer.info.programs.length,textures:renderer.info.memory.textures});'}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
 const render=async()=>{await p.evaluate(()=>__mechanisms.render());await p.evaluate(async()=>RCScene3D.whenPresented());};
 const shot=async name=>{await render();await p.waitForTimeout(120);const caption=p.locator('.q-caption'),context=p.locator('.q-context');if(await caption.isVisible()&&await context.isVisible()){const a=await caption.boundingBox(),b=await context.boundingBox();assert(a.y+a.height<=b.y-3,'Caption and instruction must not overlap: '+name);}await p.screenshot({path:out+'/'+name+'.png'});};
 const read=id=>p.evaluate(id=>({visual:RCScene3D.stats().stationVisuals.find(v=>v.id===id),completed:__mechanisms.state.hole.nightOrderActionsCompleted,signal:__mechanisms.state.hole.distractionTimer,quiet:__mechanisms.state.hole.quietLog}),id);
 const reset=async index=>{
  await p.evaluate(i=>{const t=__mechanisms,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:false});s.keys.clear();const h=s.hole;Object.assign(h,{tutorialVisible:false,elapsed:100,controlHintTimer:0,zoneBannerTimer:0});h.practiceDrill.active=false;Object.assign(h.joe,{x:100,y:30,patrolPause:9999});const a=t.NIGHT_ORDER_ACTIONS[i];Object.assign(s.player,{x:a.x,y:a.y-9,yaw:0,pitch:-.15});},index);await tick(17);await render();
 };
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__mechanisms);await reset(1);await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  const prepared=await p.evaluate(()=>__mechanismGpu());
  await shot('log-ready-2560');const ready=await read('field-log');assert.equal(ready.visual.height,1.32);assert(!ready.visual.ink);
  await p.keyboard.press('1');await tick(800);await render();const half=await read('field-log');assert(half.quiet.progress>.7);assert(half.visual.height<1.32&&half.visual.height>1.184);assert(!half.visual.ink);await shot('log-quiet-half-2560');
  await p.keyboard.press('Escape');await tick(1300);await render();assert.deepEqual((await read('field-log')).visual,half.visual);await p.keyboard.press('Escape');
  await p.keyboard.down('w');await tick(17);await p.keyboard.up('w');await render();let s=await read('field-log');assert.equal(s.quiet,null);assert.equal(s.visual.height,1.32);assert.equal(s.completed.length,0);assert(!s.visual.ink);
  await reset(1);await p.keyboard.press('1');await tick(1634);await render();s=await read('field-log');assert(s.completed.includes('field-log'));assert.equal(s.signal,0);assert(s.visual.ink);assert(s.visual.height>=1.184&&s.visual.height<1.25);await shot('log-contact-2560');
  await tick(1600);await render();assert.equal((await read('field-log')).visual.height,1.32);await tick(3000);await shot('log-filed-2560');
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('log-filed-'+width);}
  checks.push('Actual quiet filing presses onto the form, freezes on Pause, cancels cleanly on movement and leaves ink only after completion');
  await p.setViewportSize({width:2560,height:1600});await reset(1);await p.keyboard.press('2');await render();s=await read('field-log');assert(s.signal>5);assert(Math.abs(s.visual.height-1.184)<1e-8);assert(s.visual.ink);await shot('log-loud-contact');await tick(500);await render();assert.equal((await read('field-log')).visual.height,1.32);
  await reset(2);await shot('release-ready-2560');s=await read('release-review');assert(!s.visual.receipt.visible);assert(Math.abs(s.visual.rotation)<1e-8);
  await p.keyboard.press('e');await tick(240);await render();s=await read('release-review');assert(s.completed.includes('release-review'));assert(s.signal>4);assert(s.visual.rotation<0&&s.visual.rotation>-.9);assert(s.visual.receipt.visible);assert(s.visual.receipt.height<1.15);await shot('release-pulling-2560');
  await p.keyboard.press('Escape');const paused=(await read('release-review')).visual;await tick(1100);await render();assert.deepEqual((await read('release-review')).visual,paused);await p.keyboard.press('Escape');
  await tick(1600);await render();s=await read('release-review');assert.equal(s.visual.rotation,-.9);assert.equal(s.visual.receipt.height,1.15);assert(s.visual.ink);await shot('release-filed-2560');
  await p.keyboard.press('e');await render();assert.equal((await read('release-review')).completed.length,1);assert.match(await p.evaluate(()=>__mechanisms.state.hole.message),/RELEASE REVIEW ALREADY FILED/);
  await p.evaluate(()=>__mechanisms.state.player.yaw=Math.PI);await p.keyboard.press('e');assert.doesNotMatch(await p.evaluate(()=>__mechanisms.state.hole.message),/ALREADY FILED/);await p.evaluate(()=>__mechanisms.state.player.yaw=0);await p.keyboard.press('e');await tick(3000);await render();assert((await read('release-review')).visual.receipt.visible);await shot('release-persistent-2560');
  for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('release-filed-'+width);}
  checks.push('Release lever pulls, a stamped receipt persists after messages expire, Pause freezes it, repeated Use confirms completion only when visible and cannot repeat it');
  await reset(2);await p.evaluate(()=>{__mechanisms.state.reducedMotion=true;__mechanisms.state.effectsDensity=0;});await p.keyboard.press('e');await render();s=await read('release-review');assert.equal(s.visual.rotation,-.9);assert.equal(s.visual.receipt.height,1.15);assert(s.visual.receipt.visible);await shot('release-reduced');
  await reset(1);await p.evaluate(()=>__mechanisms.state.reducedMotion=true);await p.keyboard.press('2');await render();s=await read('field-log');assert.equal(s.visual.height,1.32);assert(s.visual.ink);
  assert.deepEqual(await p.evaluate(()=>__mechanismGpu()),prepared);assert.deepEqual(errors,[]);checks.push('Reduced Motion shows durable results immediately; no new shaders/textures are allocated during the actions');
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,prepared,errors},null,2));console.log(JSON.stringify({passed:true,checks,prepared,errors}));
 }catch(e){await shot('failure');fs.writeFileSync(out+'/failure.json',JSON.stringify({log:await read('field-log'),release:await read('release-review')},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

