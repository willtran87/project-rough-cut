const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),baseline=process.argv.includes('--baseline'),label=(software?'software':'hardware')+(baseline?'-before':''),out='output/back-nine-experience/foot-clearance';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__buffers++;return f.apply(this,a);};});
 if(baseline)await p.route('**/vehicle-contact.js*',r=>r.fulfill({contentType:'application/javascript',path:out+'/baseline-source/vehicle-contact.js'}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),before=await read(),buffers=await p.evaluate(()=>__buffers);
 // Real keyboard input at the previous irrecoverable grazing contact.
 await p.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(2);r.mode='driving';r.time=20;r.grace=0;r.foot={x:-33.76177146504766,y:769.4424650775176,yaw:.0578817,viewYaw:.0578817,speed:0,invulnerable:0,onFoot:true};Object.assign(r.cart,{x:0,y:10,health:0});Object.assign(r.joe,{x:-28,y:750,speed:6,yaw:0});__backNine.run=r;await advanceTime(0);});
 const start=await read();await p.keyboard.down('w');await tick(1000);await p.keyboard.up('w');const clear=await read();samples.push({name:'old-snag-keyboard',start,after:clear});
 if(baseline)assert(clear.player.y-start.player.y<.01);else {assert(clear.player.y>774);assert.equal(clear.mode,'back_nine_driving');}
 await p.screenshot({path:`${out}/${label}-keyboard-2560.png`});
 if(!baseline){
 const heading=clear.player.yaw;await p.mouse.move(10,10);await p.mouse.move(2400,1400);await tick(17);assert.equal((await read()).player.yaw,heading,'Mouse does not steer the runner');
 await p.keyboard.down('q');await tick(250);assert((await read()).player.rearBlend>.9);assert.equal((await read()).player.yaw,heading);await p.keyboard.up('q');await tick(250);
 await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.stringify(__backNine.run));await tick(1000);assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),frozen);await p.keyboard.press('Escape');
 for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){
  await p.setViewportSize({width,height});
  for(let id=0;id<3;id++){
   await p.evaluate(async id=>{
    const {createRun,updateRun}=await import('./back-nine-sim.js'),{COURSE,distance,angleDelta,clamp}=await import('./back-nine-course.js');const path=COURSE.footPaths[id].map(([x,y])=>({x,y})),r=createRun(id===0?1:id===1?2:0,0,42);r.mode='driving';r.time=20;r.grace=0;r.tension.phase='stalk';r.panic.serial=1;
    const yaw=Math.atan2(path[1].x-path[0].x,path[1].y-path[0].y);r.foot={...path[0],yaw,viewYaw:yaw,speed:0,invulnerable:0,onFoot:true};Object.assign(r.cart,{x:0,y:10,health:0});Object.assign(r.joe,{x:path[0].x,y:path[0].y-20,speed:8,yaw:0});__backNine.run=r;
    let cursor=1;window.__passageReached=false;window.__pilotPassage=frames=>{for(let n=0;n<frames&&r.mode==='driving'&&!__passageReached;n++){
     let t=path[cursor],p=r.foot;if(distance(p,t)<.6){if(cursor===path.length-1){__passageReached=true;break;}t=path[++cursor];}const delta=angleDelta(Math.atan2(t.x-p.x,t.y-p.y),p.yaw);updateRun(r,{throttle:Math.abs(delta)>1.1?0:1,steer:clamp(delta*2,-1,1)},1/60);
    }};
   },id);
   await p.evaluate(async()=>{__pilotPassage(205);await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});
   await p.screenshot({path:`${out}/${label}-passage-${id}-${width}.png`});samples.push({name:`passage-${id}-${width}`,during:await read()});
   await p.evaluate(async()=>{__pilotPassage(600);await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});assert(await p.evaluate(()=>__passageReached));assert.equal((await read()).mode,'back_nine_driving');
  }
 }
 await p.locator('#chase-reduced').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change'));});await tick(17);assert((await read()).comfort.reducedMotion??(await read()).campaign.reducedMotion);await p.screenshot({path:`${out}/${label}-reduced-844.png`});
 }
 const after=await read();assert.equal(after.graphics.programs,before.graphics.programs);assert.equal(after.graphics.textures,before.graphics.textures);assert.equal(after.audio.voices,12);assert.equal(await p.evaluate(()=>__buffers),buffers);assert.equal(after.navigation.edgeChecks,0);assert.deepEqual(errors,[]);
 fs.writeFileSync(`${out}/${label}-browser.json`,JSON.stringify({passed:true,baseline,software,samples,before:before.graphics,after:after.graphics,buffers,errors},null,2));console.log(JSON.stringify({passed:true,label,keyboardMeters:clear.player.y-start.player.y,samples:samples.length,programs:after.graphics.programs,textures:after.graphics.textures,buffers,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
