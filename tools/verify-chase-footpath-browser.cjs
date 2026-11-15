const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const software=process.argv.includes('--software'),baseline=process.argv.includes('--baseline'),label=(software?'software':'hardware')+(baseline?'-before':''),out='output/back-nine-experience/footpath-surfaces';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__uploads=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__uploads++;return f.apply(this,a);};});
 if(baseline)await p.route('**/chase-route-art.js*',r=>r.fulfill({contentType:'application/javascript',path:out+'/baseline-source/chase-route-art.js'}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),before=await read(),uploads=await p.evaluate(()=>__uploads);
 for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){
  await p.setViewportSize({width,height});
  for(let id=0;id<3;id++){
   await p.evaluate(async id=>{
    const {createRun}=await import('./back-nine-sim.js'),{COURSE}=await import('./back-nine-course.js'),r=createRun(id===0?1:id===1?2:0,0,42),s=COURSE.footways[id].segments.find(s=>Math.abs(s.dx)<.01&&s.dy>10);
    r.mode='driving';r.time=20;r.grace=5;r.foot={x:s.x,y:s.y+3,yaw:0,viewYaw:0,speed:0,invulnerable:0,onFoot:true};Object.assign(r.cart,{x:0,y:10,health:0});Object.assign(r.joe,{x:s.x+(id===2?-12:12),y:s.y-20,speed:0});__backNine.run=r;await advanceTime(0);
   },id);
   const start=await read();await p.keyboard.down('w');for(let n=0;n<13;n++)await p.evaluate(()=>advanceTime(50));await p.keyboard.up('w');const run=await read();assert.equal(run.player.surface,'path');assert(run.player.y-start.player.y>4.2);assert.equal(run.mode,'back_nine_driving');
   assert(run.audio.footsteps.played>start.audio.footsteps.played,'Presented motion plays actual contacts');assert.equal(run.audio.footsteps.last.surface,'path','Presented slabs sound hard');
   await p.screenshot({path:`${out}/${label}-route-${id}-${width}.png`});samples.push({id,width,start:{x:start.player.x,y:start.player.y},player:run.player,footsteps:run.audio.footsteps,graphics:run.graphics});
  }
 }
 await p.locator('#chase-reduced').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change'));});await p.evaluate(()=>advanceTime(17));assert((await read()).campaign.reducedMotion);
 await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.stringify(__backNine.run));await p.evaluate(()=>advanceTime(1000));assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),frozen);await p.keyboard.press('Escape');
 const after=await read();assert.equal(after.graphics.programs,before.graphics.programs);assert.equal(after.graphics.textures,before.graphics.textures);assert.equal(await p.evaluate(()=>__uploads),uploads);assert.equal(after.audio.voices,12);assert.equal(after.navigation.signature,2693326411);assert.deepEqual(errors,[]);
 fs.writeFileSync(`${out}/${label}-browser.json`,JSON.stringify({passed:true,label,before:before.graphics,after:after.graphics,uploads,samples,errors},null,2));console.log(JSON.stringify({passed:true,label,samples:samples.length,programs:after.graphics.programs,textures:after.graphics.textures,uploads,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
