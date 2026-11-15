const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),out=(process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/wet-atmosphere-20261108')+'/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__ir={state,resetFirstHole,render,valve:activeSprinklerPoint,wetStateAt,zones:SPRINKLER_SOAK_ZONES,escapeFilingPreview};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+`\nwindow.__irGpu=()=>{const m=world.getObjectByName('IrrigationSpray');return {programs:renderer.info.programs.length,textures:renderer.info.memory.textures,sprinklers:sprinklerSpray.stats(),wet:wetGround.stats(),needle:pickups.valve.pressureNeedle.rotation.z,matrices:Array.from(m.instanceMatrix.array.slice(0,m.count*16))};};`}));
 const render=async()=>{await page.evaluate(()=>__ir.render());await page.evaluate(async()=>RCScene3D.whenPresented());};
 const position=async(x,y,tx,ty,pitch=0)=>{await page.evaluate(({x,y,tx,ty,pitch})=>{const s=__ir.state;Object.assign(s.player,{x,y,yaw:Math.atan2((tx-x)*.72,ty-y),pitch});s.hole.interactionPromptOwner=null;s.hole.messageTimer=s.hole.zoneBannerTimer=0;s.hole.prompt='';},{x,y,tx,ty,pitch});await render();};
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>window.__ir&&JSON.parse(render_game_to_text()).assets.course.ready);
  await page.evaluate(()=>{const t=__ir,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,detection:0,hasLineOfSight:false});s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:110,y:700,mode:'patrol',patrolPause:9999});t.render();});await page.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const v=await page.evaluate(()=>__ir.valve());await position(v.x+25,v.y-8,v.x,v.y,-.06);await page.screenshot({path:out+'/valve-dry.png'});
  const before=await page.evaluate(()=>__irGpu());assert.equal(before.sprinklers.instances,0);assert.equal(before.sprinklers.heads.length,8);assert.equal(before.needle,1.1);assert.equal(before.wet.active,false);assert.equal(before.wet.zones,8);assert.equal(before.wet.maskBytes,524288);assert.equal(before.wet.extraDraws,0);
  await position(v.x+8,v.y,v.x,v.y);await page.evaluate(()=>advanceTime(17));await page.keyboard.press('e');await page.evaluate(()=>advanceTime(17));await render();
  const action=await page.evaluate(()=>({used:__ir.state.hole.sprinklerUsed,seconds:__ir.state.hole.sprinklerSoakTimer,drain:__ir.state.hole.drainUnlocked,joe:__ir.state.hole.joe.mode,wet:__ir.wetStateAt(__ir.zones[1]),shed:__ir.escapeFilingPreview('shed').holdSeconds,drainHold:__ir.escapeFilingPreview('drain').holdSeconds}));assert(action.used&&action.drain&&action.seconds>23);assert(action.wet.active);assert.equal(action.shed,1.35);assert.equal(action.drainHold,1.7);
  await position(v.x+25,v.y-8,v.x,v.y,-.06);await page.screenshot({path:out+'/valve-running.png'});assert.equal((await page.evaluate(()=>__irGpu())).needle,-.8);
  await page.evaluate(()=>advanceTime(3500));
  const heads=before.sprinklers.heads;
  for(const id of ['east-relief','pond-fringe','night-range']){
   const h=heads.find(h=>h.id===id);await position(h.x/.1152+(id==='night-range'?25:0), -h.z/.16-(id==='night-range'?8:24),h.x/.1152,-h.z/.16,-.18);await page.screenshot({path:out+'/'+id+'.png'});const snap=await page.evaluate(()=>__irGpu());assert(snap.sprinklers.instances>0);assert(snap.wet.active);assert(snap.sprinklers.instances<=snap.sprinklers.capacity);assert.equal(snap.sprinklers.drawCalls,1);assert(snap.sprinklers.depthTest&&!snap.sprinklers.transparent);
  }
  const view=heads.find(h=>h.id==='pond-fringe');await position(view.x/.1152,-view.z/.16-24,view.x/.1152,-view.z/.16,-.18);
  let a=await page.evaluate(()=>__irGpu());await page.evaluate(()=>__ir.state.hole.elapsed+=.3);await render();let b=await page.evaluate(()=>__irGpu());assert.notDeepEqual(a.matrices,b.matrices);
  const invariant=await page.evaluate(()=>{const s=__ir.state,before=JSON.stringify({player:s.player,joe:s.hole.joe,seconds:s.hole.sprinklerSoakTimer,checks:s.hole.nightOrderActionsCompleted});for(let i=0;i<5;i++)__ir.render();return before===JSON.stringify({player:s.player,joe:s.hole.joe,seconds:s.hole.sprinklerSoakTimer,checks:s.hole.nightOrderActionsCompleted});});assert(invariant);
  await page.evaluate(()=>{__ir.state.mode='paused';});await render();a=await page.evaluate(()=>__irGpu());await page.evaluate(()=>advanceTime(1000));await render();b=await page.evaluate(()=>__irGpu());assert.deepEqual(a.matrices,b.matrices);assert.equal(a.wet.clock,b.wet.clock);
  await page.evaluate(()=>{__ir.state.mode='first_hole';__ir.state.reducedMotion=true;});await render();a=await page.evaluate(()=>__irGpu());await page.evaluate(()=>__ir.state.hole.elapsed+=2);await render();b=await page.evaluate(()=>__irGpu());assert.deepEqual(a.matrices,b.matrices);assert.equal(a.wet.clock,b.wet.clock);
  for(const [width,height]of [[1280,720],[844,390]]){await page.setViewportSize({width,height});await render();await page.screenshot({path:out+'/spray-'+width+'.png'});}
  await page.evaluate(()=>__ir.state.effectsDensity=0);await render();const quiet=await page.evaluate(()=>__irGpu());assert.equal(quiet.sprinklers.drawCalls,0);assert(quiet.wet.active);assert.equal(quiet.wet.detail,0);
  await page.evaluate(()=>{__ir.state.effectsDensity=1;__ir.state.hole.sprinklerSoakTimer=0;});await render();const after=await page.evaluate(()=>__irGpu());assert.equal(after.sprinklers.instances,0);assert.equal(after.needle,1.1);assert.equal(after.wet.active,false);await page.screenshot({path:out+'/ground-dry-844.png'});assert(await page.evaluate(()=>__ir.state.hole.drainUnlocked));assert.equal(after.programs,before.programs);assert.equal(after.textures,before.textures);assert.deepEqual(errors,[]);
  // Fixed camera and resolution, alternating dry/wet presented frames. This is
  // a local submission-to-presentation smoke check, not a whole-game FPS claim.
  await page.setViewportSize({width:1280,height:720});
  await page.evaluate(()=>{__ir.state.reducedMotion=false;__ir.state.effectsDensity=1;RCSpatialControls.set('resolution',.5);});
  const timings={dry:[],wet:[]};
  for(let i=0;i<20;i++){
   const enabled=i%2===1;
   const sample=await page.evaluate(async enabled=>{__ir.state.hole.sprinklerSoakTimer=enabled?12:0;__ir.state.hole.elapsed+=.13;const started=performance.now();__ir.render();await RCScene3D.whenPresented();return {ms:performance.now()-started,resolution:RCScene3D.stats().resolution};},enabled);
   if(i>=4)timings[enabled?'wet':'dry'].push(sample);
  }
  await page.evaluate(()=>{__ir.state.hole.sprinklerSoakTimer=0;__ir.render();});
  delete before.matrices;delete after.matrices;fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,before,action,after,timings,errors},null,2));console.log(JSON.stringify({passed:true,software,heads:heads.length,programs:after.programs,textures:after.textures,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
