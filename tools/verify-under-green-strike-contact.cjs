const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass26-contact/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],errors=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));await p.screenshot({path:`${out}/${name}-${p.viewportSize().width}.png`});views.push({name,viewport:p.viewportSize(),state});return state;}
  async function prepare(fixture='sweep'){
   return p.evaluate(async fixture=>{
    const {createRun}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js');const r=createRun();r.mode='playing';r.time=20;r.messageTime=0;
    const root=fixture.startsWith('root'),rear=fixture==='root-sweep';
    Object.assign(r.player,root?{x:.2,y:rear?16.3:13.5,yaw:Math.atan2(-1.79,rear?-1:1.55),pitch:-.46,grace:100}:{x:1.2,y:52.2,yaw:Math.atan2(1.69,-1.43),pitch:-.43,grace:100});
    Object.assign(r.joe,root?{x:-1.8,y:rear?16.4:13.6,yaw:rear?Math.PI:0}:{x:fixture==='windup'?2:1.5,y:50,yaw:fixture==='windup'?Math.PI/2:.8},{phase:'walk',age:0});settleWeapon(r,1/60);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);
    const audits=[];
    for(const [phase,duration]of [['windup',.95],['sweep',.22]]){
     if(r.sceneryContactSerial)break;r.joe.phase=phase;
     for(let i=0;i<=Math.ceil(duration*60);i++){
      r.time+=1/60;r.joe.age=Math.min(duration,i/60);settleWeapon(r,1/60);advanceTime(0);
      if(i%10===0||r.sceneryContactSerial)audits.push({phase,age:r.joe.age,geometry:__underGreen.inspectJoeGeometry(),actor:JSON.parse(render_game_to_text()).graphics.actor});
      if(r.sceneryContactSerial)break;
     }
    }
    await __underGreen.whenPresented();return audits;
   },fixture);
  }
  const audits=[];
  for(const fixture of ['sweep','windup','root-windup','root-sweep']){
   audits.push(...await prepare(fixture));const hit=await shot(fixture+'-contact');assert.equal(hit.graphics.strikeDebris.active,6);assert.equal(hit.graphics.strikeDebris.last.part,'blade');assert.equal(hit.graphics.strikeDebris.last.material,fixture.startsWith('root')?'root':'masonry');
   for(const [name,dt]of [['flecks',.1],['falling',.16],['expired',.5],['retracted',.65]]){
    await p.evaluate(async dt=>{const {settleWeapon}=await import('./under-green-clearance.js'),r=__underGreen.run;for(let n=0;n<Math.round(dt*60);n++){r.time+=1/60;r.joe.age+=1/60;settleWeapon(r,1/60);advanceTime(0);}await __underGreen.whenPresented();},dt);
    const s=await shot(fixture+'-'+name);if(name==='expired')assert.equal(s.graphics.strikeDebris.active,0);
    audits.push(await p.evaluate(()=>({phase:__underGreen.run.joe.phase,age:__underGreen.run.joe.age,geometry:__underGreen.inspectJoeGeometry(),actor:JSON.parse(render_game_to_text()).graphics.actor})));
    if(name==='falling'&&fixture.startsWith('root')){
     await p.evaluate(()=>{window.savedContacts=__underGreen.run.sceneryContacts;__underGreen.run.sceneryContacts=[];advanceTime(0);});await shot(fixture+'-without-debris');
     await p.evaluate(()=>{__underGreen.run.sceneryContacts=window.savedContacts;advanceTime(0);});
    }
   }
  }
  for(const size of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width:size[0],height:size[1]});await prepare();await p.evaluate(()=>{__underGreen.run.time+=.1;advanceTime(0);});await shot('responsive-flecks');}
  await p.setViewportSize({width:2560,height:1600});await prepare();await p.evaluate(()=>{__underGreen.run.time+=.1;advanceTime(0);});await p.keyboard.press('Escape');const pause=await shot('paused');await p.evaluate(()=>advanceTime(3000));const paused=await shot('paused-after-wait');assert.deepEqual(paused.graphics.strikeDebris,pause.graphics.strikeDebris);
  await p.evaluate(()=>{document.querySelector('#reduced').checked=true;document.querySelector('#reduced').dispatchEvent(new Event('change',{bubbles:true}));advanceTime(0);});const reduced=await shot('reduced');assert.equal(reduced.graphics.strikeDebris.active,0);
  await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');__underGreen.run=createRun();__underGreen.run.mode='playing';advanceTime(0);});const reset=await shot('fresh-run');assert.equal(reset.graphics.strikeDebris.active,0);
  const outcomes=[];
  for(const flee of process.argv.includes('--appearance-only')?[]:[false,true]){
   const result=await p.evaluate(async flee=>{
    const {createRun,step}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js'),{trimmerContact}=await import('./under-green-trimmer.js');
    const r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:50,grace:0,yaw:Math.PI/2});Object.assign(r.joe,{x:2,y:50,yaw:Math.PI/2,phase:'search',age:0});settleWeapon(r,1/60);r.joe.phase='windup';__underGreen.run=r;__underGreen.clearInput();const samples=[];
    for(let i=0;i<(flee?240:720)&&r.mode==='playing';i++){
     // Sideways input retreats south while keeping the wall encounter visible.
     step(r,flee?{strafe:1}:{});if(i%20===0||r.mode==='caught'){advanceTime(0);samples.push({phase:r.joe.phase,age:r.joe.age,geometry:__underGreen.inspectJoeGeometry(),actor:JSON.parse(render_game_to_text()).graphics.actor});}
    }
    advanceTime(0);await __underGreen.whenPresented();return {flee,mode:r.mode,hits:r.waterHits,contact:trimmerContact(r.joe,r.player),samples};
   },flee);
   assert.equal(result.mode,flee?'playing':'caught');assert.equal(result.contact,!flee);assert.equal(result.hits,0);audits.push(...result.samples);delete result.samples;outcomes.push(result);await shot(flee?'live-escape':'live-capture');
  }
  const intersections=audits.flatMap(a=>a.geometry.hits);const handErrors=audits.filter(a=>a.actor.handError>.015);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:!errors.length&&!intersections.length&&!handErrors.length,views,audits,outcomes,intersections,handErrors,errors},null,2));assert.deepEqual(errors,[]);assert.deepEqual(intersections,[]);assert.deepEqual(handErrors,[]);
  console.log(JSON.stringify({passed:true,views:views.length,audits:audits.length,out}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
