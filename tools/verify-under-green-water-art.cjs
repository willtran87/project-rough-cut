const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const software=process.argv.includes('--software'),baseline=process.argv.includes('--baseline');
 const out='output/under-green/visual-upgrade/water'+(baseline?'-baseline':'')+(software?'-software':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});
 const errors=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(baseline)for(const name of ['under-green-water.js','under-green-flood-scene.js','under-green-scene.js','under-green-actor.js'])await p.route('**/'+name,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade/pass5-baseline/'+name,'utf8')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');await p.keyboard.press('Escape');
  const fixtures=[...['low','warning','surge','receding'].map((phase,i)=>({name:phase,channel:'lesson',cycle:[.5,5.5,8,11][i]})),{name:'side',channel:'lesson',cycle:8,side:true},{name:'rear',channel:'lesson',cycle:8,rear:true},{name:'outflow',channel:'bypass',cycle:8},{name:'flood-rising',elapsed:41},{name:'flood-high',elapsed:49},{name:'flood-falling',elapsed:60},{name:'flood-damp',elapsed:70}];
  async function fixture(f){await p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),{WATERS,waterPoint}=await import('./under-green-course.js');const r=createRun();r.mode='playing';r.joe.phase='absent';r.elapsed=f.elapsed||0;
   if(f.channel){const w=WATERS.find(w=>w.id===f.channel);r.time=24+f.cycle-(w.offset||0);let pos=waterPoint(w,0,-w.depth/2-.9),yaw=w.axis==='x'?Math.PI/2:0;if(f.side){pos=waterPoint(w,2.3,0);yaw=-Math.PI/2;}if(f.rear){pos=waterPoint(w,0,w.depth/2+.9);yaw=Math.PI;}Object.assign(r.player,pos,{yaw,pitch:-.2});}
   else{r.time=f.elapsed;Object.assign(r.player,{x:3.8,y:8,yaw:Math.PI/2,pitch:-.62});}
   __underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  for(const [width,height]of [[2560,1600],[1280,720],[390,844],[844,390]]){
   await p.setViewportSize({width,height});
   for(const f of width===2560?fixtures:fixtures.filter(f=>['surge','flood-high'].includes(f.name))){
    await fixture(f);const state=await read();assert.equal(state.graphics.water.solidStreams,0);
    if(!baseline){assert(state.graphics.water.activeDrops<=state.graphics.water.capacity.drops);assert(state.graphics.water.activeRipples<=state.graphics.water.capacity.ripples);assert.equal(state.graphics.flood.wallFilm.waterline,state.flood.depth);if(f.name==='flood-damp'){assert(!state.graphics.flood.visible);assert(state.graphics.flood.wallFilm.visible);}}
    views.push({name:f.name,width,height,state});await p.screenshot({path:`${out}/${f.name}-${width}.png`});
   }
  }
  let behavior=null;
  if(!baseline){
   await p.setViewportSize({width:1280,height:720});
   behavior=await p.evaluate(async()=>{
    const {createRun}=await import('./under-green-sim.js');let r=createRun();r.mode='playing';r.elapsed=49;r.time=49;r.joe.phase='absent';__underGreen.run=r;advanceTime(0);__underGreen.setInput(['KeyW']);
    for(let i=0;i<30;i++){advanceTime(1000/60);await __underGreen.whenPresented();}__underGreen.clearInput();
    const moving=JSON.parse(render_game_to_text()),before=JSON.stringify(moving.graphics.water.contacts);advanceTime(0);await __underGreen.whenPresented();const unchanged=JSON.stringify(JSON.parse(render_game_to_text()).graphics.water.contacts);
    return {moving,stable:before===unchanged};
   });
   assert(behavior.moving.graphics.water.contacts.totals.player>0);assert(behavior.stable);await p.screenshot({path:out+'/foot-contact-1280.png'});
   await p.keyboard.press('Escape');const paused=await read();await p.evaluate(()=>advanceTime(500));assert.equal((await read()).seconds,paused.seconds);assert.deepEqual((await read()).graphics.water.contacts,paused.graphics.water.contacts);
   await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').setChecked(true);await p.click('#primary');await fixture(fixtures[2]);assert.equal((await read()).graphics.water.animationTime,0);await p.evaluate(()=>advanceTime(100));assert.equal((await read()).graphics.water.animationTime,0);
   await fixture(fixtures[0]);assert.equal((await read()).graphics.water.contacts.active,0);assert.equal((await read()).graphics.flood.wallFilm.visible,false);
   await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').setChecked(false);await p.click('#primary');
   const joeContacts=await p.evaluate(async()=>{
    const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.elapsed=49;r.time=49;Object.assign(r.player,{x:0,y:14,yaw:Math.PI,pitch:-.18,grace:100});Object.assign(r.joe,{x:0,y:8,phase:'walk',last:{x:0,y:14}});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();
    for(let i=0;i<90;i++){advanceTime(1000/60);await __underGreen.whenPresented();}
    return JSON.parse(render_game_to_text());
   });
   assert(joeContacts.graphics.water.contacts.totals.joe>0,'Animated Joe feet must produce actual water contacts');behavior.joe=joeContacts;await p.screenshot({path:out+'/joe-water-1280.png'});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,baseline,views,behavior,errors},null,2));console.log(JSON.stringify({passed:true,views:views.length,resolution:views[0].state.graphics.resolution,playerContacts:behavior?.moving.graphics.water.contacts.totals.player,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
