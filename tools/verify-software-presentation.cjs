const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=true,out='output/software-wet-performance-20261108/verification';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__ir={state,resetFirstHole,render,valve:activeSprinklerPoint,wetStateAt,zones:SPRINKLER_SOAK_ZONES,escapeFilingPreview};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('const schedule=document.hidden?requestAnimationFrame:fn=>setTimeout(fn,8);','const schedule=(window.__baselinePresentation||document.hidden)?requestAnimationFrame:fn=>setTimeout(fn,8);').replace('const nativePixels=softwareRenderer&&pixelStyle&&worldDrawn&&useDomHud;', 'const nativePixels=!window.__baselinePresentation&&softwareRenderer&&pixelStyle&&worldDrawn&&useDomHud;')+`\nObject.defineProperty(window,'__presentRenderer',{get:()=>renderer});window.__irGpu=()=>{const m=world.getObjectByName('IrrigationSpray');return {programs:renderer.info.programs.length,textures:renderer.info.memory.textures,sprinklers:sprinklerSpray.stats(),wet:wetGround.stats(),needle:pickups.valve.pressureNeedle.rotation.z,matrices:Array.from(m.instanceMatrix.array.slice(0,m.count*16))};};`}));
 const render=async()=>{await page.evaluate(()=>__ir.render());await page.evaluate(async()=>RCScene3D.whenPresented());};
 const position=async(x,y,tx,ty,pitch=0)=>{await page.evaluate(({x,y,tx,ty,pitch})=>{const s=__ir.state;Object.assign(s.player,{x,y,yaw:Math.atan2((tx-x)*.72,ty-y),pitch});s.hole.interactionPromptOwner=null;s.hole.messageTimer=s.hole.zoneBannerTimer=0;s.hole.prompt='';},{x,y,tx,ty,pitch});await render();};
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>window.__ir&&JSON.parse(render_game_to_text()).assets.course.ready);
  await page.evaluate(()=>{const t=__ir,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,detection:0,hasLineOfSight:false});s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:110,y:700,mode:'patrol',patrolPause:9999});t.render();});await page.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});


  const checks=[],pixelChecks=[];
  await page.evaluate(()=>{RCSpatialControls.set('resolution',.5);__ir.state.hole.sprinklerSoakTimer=18;__ir.state.hole.elapsed=100;});
  const snapshot=()=>page.evaluate(()=>({canvas:[__presentRenderer.domElement.width,__presentRenderer.domElement.height],scene:RCScene3D.stats().resolution,programs:__presentRenderer.info.programs.length,textures:__presentRenderer.info.memory.textures,rect:document.getElementById('game').getBoundingClientRect().toJSON(),wet:RCScene3D.stats().wetGround.active}));
  await render();const before=await snapshot();
  for(const [name,x,y,yaw,pitch] of [['wet-pond',6.2,219.9,0,-.18],['pond',-63,187,0,-.33],['opening',0,65,0,0],['border',100,340,1.57,0]]){
   await page.evaluate(v=>Object.assign(__ir.state.player,v),{x,y,yaw,pitch});
   for(const baseline of [true,false]){
    await page.evaluate(v=>window.__baselinePresentation=v,baseline);await render();
    const difference=await page.evaluate(baseline=>{const c=__presentRenderer.domElement,gl=__presentRenderer.getContext(),pixels=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);if(baseline){window.__referencePixels=pixels;return null;}let changed=0,max=0,sum=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)for(let k=0;k<4;k++){const d=Math.abs(pixels[(y*c.width+x)*4+k]-__referencePixels[((y*2)*1280+x*2)*4+k]);changed+=Number(d>0);max=Math.max(max,d);sum+=d;}return {changed,max,mean:sum/pixels.length};},baseline);
    await page.screenshot({path:out+'/'+name+(baseline?'-reference':'-native')+'.png'});
    if(difference){pixelChecks.push({name,...difference});assert(difference.mean<.1&&difference.max<=5,JSON.stringify(pixelChecks));}
   }
  }
  checks.push('Native pixel presentation preserves scene colors and details in four views');
  const native=await snapshot();assert.deepEqual(native.canvas,native.scene);assert.equal(native.rect.width,before.rect.width);assert.equal(native.rect.height,before.rect.height);assert(native.wet);
  for(const resolution of [.5,.625,.67,.75]){await page.evaluate(r=>RCSpatialControls.set('resolution',r),resolution);await render();const s=await snapshot();assert.deepEqual(s.canvas,s.scene);}
  checks.push('Adaptive and custom scene sizes match output without changing CSS dimensions');
  await page.keyboard.press('Escape');await render();assert.equal(await page.evaluate(()=>__ir.state.mode),'paused');assert.deepEqual((await snapshot()).canvas,[1280,720]);await page.screenshot({path:out+'/pause.png'});
  await page.keyboard.press('Escape');await render();assert.equal(await page.evaluate(()=>__ir.state.mode),'first_hole');assert.deepEqual((await snapshot()).canvas,(await snapshot()).scene);
  await page.locator('.q-map').click();await render();assert(await page.evaluate(()=>__ir.state.hole.mapOpen));assert.deepEqual((await snapshot()).canvas,[1280,720]);await page.screenshot({path:out+'/map.png'});
  await page.evaluate(()=>roughCutRebuild.toggleMap());await render();assert.deepEqual((await snapshot()).canvas,(await snapshot()).scene);
  checks.push('Pause and Map restore full-resolution canvas UI; resume returns to native pixels');
  const initial=await page.evaluate(()=>({...__ir.state.player}));await page.keyboard.down('w');await page.evaluate(()=>advanceTime(250));await page.keyboard.up('w');const moved=await page.evaluate(()=>({...__ir.state.player}));assert(Math.hypot(initial.x-moved.x,initial.y-moved.y)>0);
  checks.push('Ordinary movement still works after output-size and UI transitions');
  for(const [width,height]of [[1280,720],[844,390]]){await page.setViewportSize({width,height});await render();await page.screenshot({path:out+'/game-'+width+'.png'});}
  const after=await snapshot();assert.equal(after.programs,before.programs);assert(after.textures<=before.textures+1,'Only the existing custom-resolution target may initialize');for(const r of [.5,.625,.67,.75]){await page.evaluate(v=>RCSpatialControls.set('resolution',v),r);await render();}assert.equal((await snapshot()).textures,after.textures,'Repeated resizing must not grow GPU textures');assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,pixelChecks,before,after,errors},null,2));console.log(JSON.stringify({passed:true,checks,pixelChecks,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
