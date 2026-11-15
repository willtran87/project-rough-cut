const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const {sceneModule,instrumentScene}=require('./under-green-soak-hooks.cjs');
const software=process.argv.includes('--software'),out='output/under-green/software-stall/visuals-'+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']}),pages=[],errors=[],rows=[];
 try{
  for(const optimized of [false,true]){
   const p=await browser.newPage({viewport:{width:2560,height:1600}});pages.push(p);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.addInitScript(()=>localStorage.setItem('rough-cut.spatial.v1',JSON.stringify({fov:85,resolution:1})));
   await p.route(sceneModule,route=>route.fulfill({contentType:'application/javascript',body:instrumentScene(fs.readFileSync((optimized?'web/':'output/under-green/software-stall/source/')+'under-green-scene.js','utf8'))}));
   if(!optimized)for(const name of ['under-green-practical-lighting.js'])await p.route(new RegExp('/'+name.replaceAll('.','\\.')+'$'),route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/software-stall/source/'+name,'utf8')}));
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__soakRenderer&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));if(await p.evaluate(()=>JSON.parse(render_game_to_text()).opening.active))await p.keyboard.press('Escape');await p.click('#primary');
  }
  const poses=[['gallery',0,8,0,.1],['puddle',-2,11,-.5,-.6],['crossing',0,19,0,-.05],['bunker',-29.5,65,Math.PI,.15],['pump',-25.7,40,Math.PI/2,-.27],['range',12,35,Math.PI,.05],['keeper',12,13.5,-2.4,.05],['joe-enter',0,12,Math.PI,0,'enter',1],['joe-walk',0,12,Math.PI,0,'walk',1],['joe-windup',0,10,Math.PI,0,'windup',.2],['joe-swing',0,10,Math.PI,0,'sweep',.1],['joe-behind',0,12,0,0,'sweep',.1],['ghost',0,18,0,0]];
  for(const [width,height]of [[2560,1600],[1280,720],[390,844]])for(const pose of width===2560?poses:[poses[2]]){
   const samples=[];
   for(const [i,p]of pages.entries()){
    await p.setViewportSize({width,height});
    samples.push(await p.evaluate(async pose=>{
     const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=26.3;r.joe.phase='absent';if(pose[0]==='ghost')r.elapsed=8;Object.assign(r.player,{x:pose[1],y:pose[2],yaw:pose[3],pitch:pose[4]});if(pose[5])Object.assign(r.joe,{x:0,y:8,yaw:0,phase:pose[5],age:pose[6],walk:1,speed:pose[5]==='walk'?2.1:0});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);if(pose[0]==='ghost'){r.elapsed+=3;r.time+=3;advanceTime(0);}await __underGreen.whenPresented();
     const gl=__soakRenderer.getContext(),bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);
     const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join(''),g=JSON.parse(render_game_to_text()).graphics;
     return {hash,draws:g.draws,triangles:g.triangles,resolution:g.resolution,actorCulled:g.actorCulled,ghost:g.ghost};
    },pose));
    if(i===1)await p.screenshot({path:`${out}/${pose[0]}-${width}.jpg`,quality:90});
   }
   rows.push({name:pose[0],width,height,samples,equal:samples[0].hash===samples[1].hash});fs.writeFileSync(out+'/report.json',JSON.stringify({rows,errors},null,2));
  }
  const debris=await pages[1].evaluate(()=>{
   const r=__underGreen.run;r.time+=.1;advanceTime(0);const before=__soakRenderer.info.memory.geometries;
   r.sceneryContacts=[{serial:1,time:r.time,material:'masonry',point:{x:r.player.x,y:r.player.y+1,height:1.2},normal:{x:0,y:-1,height:0}}];
   advanceTime(0);return {before,after:__soakRenderer.info.memory.geometries,active:JSON.parse(render_game_to_text()).graphics.strikeDebris.active};
  });
  assert(debris.active>0);assert.equal(debris.after,debris.before,'First masonry impact allocated geometry');
  assert.deepEqual(errors,[]);assert(rows.every(r=>r.equal),'Optimization changed framebuffer pixels');fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,rows,debris,errors},null,2));console.log(JSON.stringify({passed:true,views:rows.length,exactPixels:rows.every(r=>r.equal),debris,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
