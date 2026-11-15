const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),out='output/under-green/frame-lifecycle';fs.mkdirSync(out,{recursive:true});
 try{
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],checks=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/under-green.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green.js','utf8').replace('if(test)window.__underGreen={','if(true)window.__underGreen={')}));
  await p.addInitScript(()=>{
   window.__gpuDelay=0;window.__fences={live:0,max:0,submitted:0};const started=new Map(),proto=WebGL2RenderingContext.prototype;
   const create=proto.fenceSync,remove=proto.deleteSync,wait=proto.clientWaitSync;
   proto.fenceSync=function(...args){const f=create.apply(this,args);if(f){started.set(f,performance.now());__fences.live=started.size;__fences.max=Math.max(__fences.max,started.size);__fences.submitted++;}return f;};
   proto.deleteSync=function(f){started.delete(f);__fences.live=started.size;return remove.call(this,f);};
   proto.clientWaitSync=function(f,...args){if(started.has(f)&&performance.now()-started.get(f)<__gpuDelay)return this.TIMEOUT_EXPIRED;return wait.call(this,f,...args);};
  });
  await p.goto('http://127.0.0.1:4187/under-green.html');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));assert((await read()).graphics.software);assert.equal((await read()).graphics.captureBuffer,false);
  await p.click('#primary');await p.evaluate(()=>{window.__gpuDelay=120;});
  const before=await read();await p.keyboard.down('w');await p.waitForTimeout(1000);await p.keyboard.up('w');const moving=await read();
  const distance=moving.player.y-before.player.y,expected=(moving.seconds-before.seconds)*3.84;
  assert(Math.abs(distance-expected)<.25,JSON.stringify({distance,expected}));assert(moving.graphics.frames-before.graphics.frames<14);
  assert.equal(await p.evaluate(()=>__fences.max),1);checks.push('Under a synthetic 120ms GPU delay, ordinary W movement keeps the fixed-step speed and only one software frame is in flight');
  await p.keyboard.press('Escape');await p.waitForTimeout(300);const paused=await read();await p.waitForTimeout(200);const still=await read();
  assert.equal(still.seconds,paused.seconds);assert.equal(still.graphics.frames,paused.graphics.frames);assert.equal(still.mode,'under_green_paused');
  checks.push('Pause stops simulation and repeated scenery submissions after the pending image settles');
  await p.click('#primary');await p.evaluate(()=>{__gpuDelay=90;});await p.waitForTimeout(3200);const loaded=await read();
  assert(loaded.graphics.budget.scale<.75);assert(loaded.graphics.resolution[0]<960);assert.equal(await p.evaluate(()=>__fences.max),1);
  checks.push('Sustained synthetic GPU contention lowers the software budget through the existing shared controller without queue growth');
  await p.keyboard.down('w');await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await p.keyboard.up('w');await p.waitForTimeout(200);
  const lost=await read();assert.equal(lost.mode,'under_green_paused');await p.waitForTimeout(200);assert.equal((await read()).seconds,lost.seconds);
  await p.evaluate(()=>{__gpuDelay=0;window.dispatchEvent(new Event('focus'));});await p.locator('#comfort summary').click();await p.locator('#scene-resolution').fill('0.5');await p.waitForTimeout(150);assert.deepEqual((await read()).graphics.resolution,[480,270]);
  await p.click('#primary');await p.waitForTimeout(200);await p.screenshot({path:out+'/playing-1280.png'});await p.keyboard.press('Escape');await p.waitForTimeout(100);await p.screenshot({path:out+'/paused-1280.png'});
  checks.push('Blur pauses and clears movement; a user-selected lower scene resolution remains a ceiling for automatic quality');
  assert.deepEqual(errors,[]);const fences=await p.evaluate(()=>({...__fences}));fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks,movement:{distance,expected,elapsed:moving.seconds-before.seconds},loaded:loaded.graphics,fences,errors},null,2));console.log(JSON.stringify({passed:true,checks,fences,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
