const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/pass25-contact/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),views=[],errors=[];
 try{for(const before of [true,false]){
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(before)for(const f of ['under-green-water.js','under-green-water-contacts.js'])await p.route('**/'+f,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade/pass25-source/'+f,'utf8')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  async function prepare(flood=true){return p.evaluate(async flood=>{
   const {createRun}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js');
   const r=createRun();r.mode='playing';r.time=20;r.elapsed=flood?49:0;r.messageTime=0;
   Object.assign(r.player,innerWidth<1000?{x:3,y:51.2,yaw:Math.atan2(.25-3,53-51.2),pitch:-.35}:{x:2.1,y:52.4,yaw:Math.atan2(-2.1,1.6),pitch:-.46});
   Object.assign(r.joe,{x:0,y:54,yaw:Math.PI,phase:'recover',age:.55,speed:0,walk:0});settleWeapon(r,1/60);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);
   for(let i=0;i<65;i++){r.time+=1/60;r.joe.age+=1/60;settleWeapon(r,1/60);advanceTime(0);if(JSON.parse(render_game_to_text()).graphics.water.contacts.totals.blade>0)break;}
   await __underGreen.whenPresented();return JSON.parse(render_game_to_text());
  },flood);}
  async function age(dt){await p.evaluate(async dt=>{__underGreen.run.time+=dt;advanceTime(0);await __underGreen.whenPresented();},dt);}
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(state.graphics.water.activeDrops<=state.graphics.water.capacity.drops);assert(state.graphics.actor.handError<.015);await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.png`});views.push({before,name,viewport:p.viewportSize(),state});return state;}
  const entry=await prepare();assert(entry.graphics.water.contacts.totals.blade>0,'Real rendered recovering blade enters actual floodwater');await shot('entry');
  for(const [name,dt]of [['fan',.06],['falling',.08],['settled',.3]]){await age(dt);await shot(name);if(name==='fan'){await p.evaluate(async()=>{window.__splashCamera={...__underGreen.run.player};Object.assign(__underGreen.run.player,{x:1.7,y:51.8,yaw:Math.atan2(.373-1.7,52.578-51.8),pitch:-.675});advanceTime(0);await __underGreen.whenPresented();});await shot('fan-close');await p.evaluate(async()=>{Object.assign(__underGreen.run.player,window.__splashCamera);advanceTime(0);await __underGreen.whenPresented();});}}
  if(!before){
   const fan=views.find(v=>!v.before&&v.name==='fan').state.graphics.water;assert(fan.activeContactDrops>0);assert.equal(fan.lastContactDrop.kind,'blade');assert(fan.lastContactDrop.position.height>fan.lastContactDrop.origin.height);
   assert.equal(views.at(-1).state.graphics.water.activeContactDrops,0);
   for(const kind of ['player','joe']){
    await p.evaluate(async kind=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=49;r.elapsed=49;Object.assign(r.player,{x:0,y:8,yaw:0,pitch:-.65,grace:100});if(kind==='joe')Object.assign(r.joe,{x:0,y:12,yaw:Math.PI,phase:'walk',last:{x:0,y:8}});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);if(kind==='player')__underGreen.setInput(['KeyW']);for(let i=0;i<100;i++){advanceTime(1000/60);if(JSON.parse(render_game_to_text()).graphics.water.contacts.totals[kind]>0)break;}__underGreen.clearInput();const hit=JSON.parse(render_game_to_text()).graphics.water.contacts.last;Object.assign(r.player,{x:hit.x+1,y:hit.y-1.5,yaw:Math.atan2(-1,1.5),pitch:-.65});r.time+=.05;advanceTime(0);await __underGreen.whenPresented();},kind);
    const feet=await shot(kind+'-foot');assert(feet.graphics.water.contacts.totals[kind]>0);assert(feet.graphics.water.activeContactDrops>0);assert.equal(feet.graphics.water.lastContactDrop.kind,kind);
   }
   await prepare(false);const dry=await shot('dry-miss');assert.equal(dry.graphics.water.contacts.totals.blade,0);assert.equal(dry.graphics.water.activeContactDrops,0);
   await prepare();await age(.06);await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.water);await p.evaluate(()=>advanceTime(1000));assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.water),frozen);
   await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await prepare();await age(.06);const reduced=await shot('reduced');assert.equal(reduced.graphics.water.activeContactDrops,0);assert(reduced.graphics.water.activeRipples>0);
   await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').uncheck();await p.click('#primary');
   if(!software)for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await prepare();await age(.06);await shot('fan');}
   await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');__underGreen.run=createRun();__underGreen.run.mode='playing';advanceTime(0);await __underGreen.whenPresented();});const reset=await shot('new-run');assert.equal(reset.graphics.water.contacts.active,0);assert.equal(reset.graphics.water.activeContactDrops,0);
  }
  await p.close();console.log(JSON.stringify({before,software,views:views.filter(v=>v.before===before).length}));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,views,errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
