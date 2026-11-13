const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),tag=software?'software':'hardware',out='output/back-nine-experience/wreck-routes',errors=[],rows=[];
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.testPad={connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[testPad];});
  await p.route('**/back-nine-scene.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','window.__landingRunner=runner;window.__landingCamera=camera;return {scene,camera,update,draw()')}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(17));
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);const initial=await read();
  async function setup(yaw){await p.evaluate(async yaw=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(2,0,12345);r.mode='driving';r.time=20;r.grace=0;Object.assign(r.cart,{x:-27,y:798,yaw,health:1});Object.assign(r.joe,{x:-27,y:791,yaw:0,speed:20});r.joe.ram.armed=true;__backNine.run=r;testPad.axes.fill(0);for(const b of testPad.buttons){b.value=0;b.pressed=false;}await advanceTime(17);},yaw);for(let i=0;i<60&&!(await read()).player?.ejection;i++)await tick(17);assert((await read()).player.ejection);}
  for(const yaw of [Math.PI*.75,Math.PI,Math.PI*1.5]){
   await setup(yaw);const start=await read(),root=[];
   for(let i=0;i<44;i++){await tick(20);root.push(await p.evaluate(async()=>{const{blocked}=await import('./back-nine-course.js'),{runnerCameraFraction}=await import('./runner-camera.js'),v=__landingRunner.root.position,c=__landingCamera.position,from={x:v.x,y:-v.z};return {x:v.x,y:-v.z,blocked:blocked(from,.32),camera:c.toArray(),clearance:runnerCameraFraction(from,{x:c.x,y:-c.z})};}));if(i===19)await p.screenshot({path:`${out}/${tag}-garage-flight-${yaw.toFixed(2)}.png`});}
   assert(root.every(p=>!p.blocked),'Actual rendered root corridor must not cross a post');assert(root.every(p=>p.clearance>.999),'Camera must see the current falling body, not only its eventual landing');
   const result=await p.evaluate(async()=>{
    const r=__backNine.run,targets=r.foot.x<-29?[{x:-31.5,y:795},{x:-23,y:795},{x:-23,y:807}]:[{x:-23,y:807}];let at=0;const trail=[];
    for(let i=0;i<1200&&r.mode==='driving';i++){
     const p=r.foot,t=targets[at],d=Math.hypot(t.x-p.x,t.y-p.y);if(d<.4&&at<targets.length-1){at++;continue;}
     const delta=Math.atan2(Math.sin(Math.atan2(t.x-p.x,t.y-p.y)-p.yaw),Math.cos(Math.atan2(t.x-p.x,t.y-p.y)-p.yaw)),near=at===targets.length-1&&d<1;
     testPad.axes[0]=near?0:Math.max(-1,Math.min(1,delta*2));testPad.buttons[7]={pressed:!near&&Math.abs(delta)<.35,value:!near&&Math.abs(delta)<.35?1:0};testPad.buttons[1]={pressed:near,value:near?1:0};await advanceTime(50);
     if(i%20===0)trail.push({time:r.time,x:p.x,y:p.y,mode:r.mode});
    }
    for(let i=0;i<120&&r.mode==='sealing';i++)await advanceTime(50);
    testPad.axes.fill(0);for(const b of testPad.buttons){b.value=0;b.pressed=false;}
    return {state:JSON.parse(render_game_to_text()),trail};
   });rows.push({yaw,start,root,...result});fs.writeFileSync(`${out}/${tag}-garage-browser.json`,JSON.stringify({rows,errors},null,2));assert.equal(result.state.mode,'back_nine_complete',JSON.stringify(result.trail));assert.equal(result.state.travel,'on_foot');await p.screenshot({path:`${out}/${tag}-garage-success-${yaw.toFixed(2)}.png`});
  }
  for(const[width,height]of [[1280,720],[844,390]]){await p.setViewportSize({width,height});await setup(Math.PI*.75);await tick(400);await p.screenshot({path:`${out}/${tag}-garage-flight-${width}.png`});}
  await p.locator('#chase-reduced').evaluate(e=>{e.checked=true;e.dispatchEvent(new Event('change'));});await setup(Math.PI*.75);await tick(400);const comfort=await read();assert(comfort.campaign.reducedMotion);assert.equal(comfort.graphics.ejection.phase,'none');await p.screenshot({path:`${out}/${tag}-garage-reduced-844.png`});
  assert.equal(comfort.graphics.programs,initial.graphics.programs);assert.equal(comfort.graphics.textures,initial.graphics.textures);assert.equal(comfort.audio.voices,initial.audio.voices);assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/${tag}-garage-browser.json`,JSON.stringify({passed:true,rows,comfort,errors},null,2));console.log(JSON.stringify({passed:true,tag,finishes:rows.map(r=>({yaw:r.yaw,seconds:r.state.seconds})),errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
