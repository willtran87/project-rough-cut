const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out='output/under-green/haunting-flood/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>localStorage.setItem('rough-cut.settings.v1',JSON.stringify({keyboardBindingsVersion:3,keyboardBindings:{interact:'Enter',chip:'KeyE'},soundCaptions:false})));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));
  assert.equal(await p.locator('[data-binding=interact]').inputValue(),'KeyE');
  const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')).keyboardBindings);assert.equal(saved.interact,'KeyE');assert.equal(saved.chip,'Enter');
  await p.keyboard.press('e');await p.evaluate(()=>advanceTime(0));
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal((await read()).mode,'under_green_playing');
  async function place({x=0,y=19,yaw=0,elapsed=10,time=0}={}){await p.evaluate(async v=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';Object.assign(r.player,{x:v.x,y:v.y,yaw:v.yaw});r.elapsed=v.elapsed;r.time=v.time;r.messageTime=0;__underGreen.run=r;__underGreen.clearInput();advanceTime(0);}, {x,y,yaw,elapsed,time});}
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const state=await read();await p.screenshot({path:`${out}/${name}.png`});views.push({name,ghost:state.graphics.ghost,flood:state.graphics.flood,camera:state.graphics.camera,resolution:state.graphics.resolution});return state;}
  for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){
   await p.setViewportSize({width,height});await place();await p.evaluate(()=>advanceTime(1800));const ghost=await shot('ghost-'+width);assert(ghost.graphics.ghost.visible);assert.equal(ghost.graphics.ghost.error,null);assert.equal(await p.locator('#caption').textContent(),'');
   await place({y:15,elapsed:48,time:3});await p.evaluate(()=>advanceTime(17));const flood=await shot('flood-'+width);assert.equal(flood.flood.depth,.38);assert.equal(flood.graphics.flood.depth,flood.flood.depth);assert(flood.audio.targets.flood>0);assert.equal(flood.audio.voices,16);
   assert.equal(flood.graphics.backdrop.outdoorTrees,false);assert.equal(flood.graphics.camera.far,200);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await p.setViewportSize({width:2560,height:1600});await place({y:5,elapsed:0});
  const walls=await p.evaluate(()=>__underGreen.inspectView([{id:'north beyond old far clip',x:0,y:100,height:1.65},{id:'east exterior',x:40,y:8,height:1.65},{id:'west exterior',x:-40,y:8,height:1.65}]));
  assert(walls.every(w=>!w.clear));assert(walls[0].obstructionDistance>65);await shot('solid-distant-wall-2560');
  await place({elapsed:35});await p.evaluate(()=>advanceTime(17));assert((await read()).audio.targets.flood>0);assert.equal((await read()).flood.phase,'warning');
  await place({elapsed:48});await p.evaluate(()=>advanceTime(17));await p.keyboard.press('Escape');const paused=await read();await p.evaluate(()=>advanceTime(2000));assert.deepEqual((await read()).flood,paused.flood);
  await p.locator('#comfort summary').click();await p.locator('#reduced').check();await p.click('#primary');await p.evaluate(()=>advanceTime(17));assert.equal((await read()).graphics.flood.depth,.38);
  await p.evaluate(async()=>{const {LEVER}=await import('./under-green-course.js');const r=__underGreen.run;Object.assign(r.player,{x:LEVER.x+1,y:LEVER.y,yaw:-Math.PI/2});r.elapsed=0;advanceTime(0);});
  assert.match(await p.locator('#use').textContent(),/^E ·/);await p.keyboard.press('Enter');await p.evaluate(()=>advanceTime(17));assert(!(await read()).bypass);await p.keyboard.press('e');await p.evaluate(()=>advanceTime(17));assert((await read()).bypass);
  await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(0));assert.equal((await read()).flood.depth,0);assert.equal((await read()).graphics.ghost.serial,0);
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,walls,views,errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,walls,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
