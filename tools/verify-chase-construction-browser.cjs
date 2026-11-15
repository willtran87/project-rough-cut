const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),label=software?'software':'hardware',out='output/back-nine-experience/construction-yield',rows=[],errors=[];
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  for(const baseline of [true,false]){
   const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__uploads=0;const original=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){__uploads++;return original.apply(this,args);};});
   for(const name of ['back-nine-scene.js','course-render-preparation.js']){
    let source=fs.readFileSync((baseline?out+'/baseline-source':'web')+'/'+name,'utf8');
    if(name==='back-nine-scene.js')source=source.replace('return {scene,camera,update,draw()','return window.__constructionWorld={renderer,scene,camera,update,draw()');
    await p.route('**/'+name+'*',r=>r.fulfill({contentType:'application/javascript',body:source}));
   }
   await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(async()=>{await advanceTime(0);const{createRun}=await import('./back-nine-sim.js');__backNine.run=createRun(0,0,37161);await advanceTime(0);});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
   const geometry=await p.evaluate(async()=>{
    const digest=async a=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',a))].map(x=>x.toString(16).padStart(2,'0')).join('');
    const meshes=[];__constructionWorld.scene.traverse(o=>{if(o.geometry)meshes.push(o);});const records=[];
    for(const o of meshes){const g=o.geometry,attributes={};for(const[name,a]of Object.entries(g.attributes))attributes[name]={size:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,hash:await digest(a.array)};
     records.push({type:o.type,attributes,index:g.index&&await digest(g.index.array),groups:g.groups,range:g.drawRange,matrix:o.matrix.elements,instances:o.isInstancedMesh?{count:o.count,matrix:await digest(o.instanceMatrix.array),color:o.instanceColor&&await digest(o.instanceColor.array)}:null});}
    return {records,meshes:meshes.length,hash:await digest(new TextEncoder().encode(JSON.stringify(records)))};
   });
   const initial=await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return{uploads:__uploads,programs:s.graphics.programs,textures:s.graphics.textures,voices:s.audio.voices};}),views=[];
   for(const[width,height]of [[2560,1600],[1280,720],[844,390]]){
    await p.setViewportSize({width,height});
    for(const[name,x,y,rear,foot]of [['wet',24,235,false,false],['mower',-29,443,true,false],['foot',-33,765,false,true]]){
     const view=await p.evaluate(async({x,y,rear,foot})=>{
      const{createRun}=await import('./back-nine-sim.js');const r=createRun(1,0,37161);r.mode='driving';r.time=20;r.grace=2;r.departure.phase='finished';Object.assign(r.cart,{x,y,speed:0,health:38});Object.assign(r.joe,{x:x+2,y:y-12,speed:10,yaw:0});
      if(foot){r.cart.health=0;r.cart.y=y-16;r.cart.failedAt=0;r.foot={x,y,yaw:0,viewYaw:0,speed:0,invulnerable:0,onFoot:true};}__backNine.run=r;
      __constructionWorld.resetCamera();__constructionWorld.update(r,{rear});__constructionWorld.draw();
      const gl=__constructionWorld.renderer.getContext(),fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,2));gl.deleteSync(fence);
      const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');return{hash,width:gl.drawingBufferWidth,height:gl.drawingBufferHeight,graphics:__constructionWorld.stats()};
     },{x,y,rear,foot});views.push({name,viewportWidth:width,viewportHeight:height,...view});
     if(!baseline)await p.screenshot({path:`${out}/${label}-${name}-${width}.png`});
    }
   }
   await p.keyboard.down('KeyW');await p.evaluate(()=>advanceTime(500));await p.keyboard.up('KeyW');const moved=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(moved.player.y>765,'On-foot input must work after preparation');
   await p.keyboard.press('Escape');const paused=await p.evaluate(()=>JSON.stringify(__backNine.run));await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),paused);await p.keyboard.press('Escape');
   const final=await p.evaluate(()=>{const s=JSON.parse(render_game_to_text());return{uploads:__uploads,programs:s.graphics.programs,textures:s.graphics.textures,voices:s.audio.voices};});assert.deepEqual(final,initial);
   rows.push({baseline,geometry,initial,final,views});await p.close();console.log(JSON.stringify({label,baseline,geometry:{meshes:geometry.meshes,hash:geometry.hash},resources:final,views:views.length}));
  }
  fs.writeFileSync(`${out}/${label}-browser.json`,JSON.stringify({passed:false,rows,errors},null,2));
  assert.equal(rows[0].geometry.hash,rows[1].geometry.hash,'Construction scheduling must preserve all mesh buffers and transforms');
  assert.deepEqual(rows[0].initial,rows[1].initial);assert.deepEqual(rows[0].views.map(v=>v.hash),rows[1].views.map(v=>v.hash),'Every rendered view must match');assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/${label}-browser.json`,JSON.stringify({passed:true,rows,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
