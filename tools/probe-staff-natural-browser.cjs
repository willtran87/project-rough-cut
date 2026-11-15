const fs=require('node:fs'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/staff-natural',b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],rows=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route(/\/back-nine-scene\.js(?:\?.*)?$/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__staffWorld={scene,camera,renderer,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');
 for(const route of ['straight','west-glance','west-approach']){
  await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun();r.mode='driving';__backNine.run=r;await advanceTime(0);});
  await p.keyboard.down('KeyW');let previous='',samples=[],bestPixels=0;
  for(let i=0;i<180;i++){
   const t=i*.05,turn=route==='west-glance'?t>=2.5&&t<3.1:route==='west-approach'?t>=1.5&&t<2.25:false;
   if(turn)await p.keyboard.down('KeyA');else await p.keyboard.up('KeyA');
   const s=await p.evaluate(async()=>{await advanceTime(50);const s=JSON.parse(render_game_to_text());return{time:s.seconds,cart:s.cart,joe:s.joe,departure:s.departure,owner:s.encounter.owner,sighting:s.graphics.staffSighting};});
   const key=s.sighting.phase+':'+s.sighting.site+':'+s.sighting.visible;
   if(key!==previous){await p.screenshot({path:`${out}/${route}-${i}-${s.sighting.phase}.png`});previous=key;}
   if(i%20===0&&s.sighting.visible){s.pixels=await p.evaluate(()=>{const w=__staffWorld,f=w.scene.getObjectByName('UnaccountedGroundskeeper'),gl=w.renderer.getContext(),width=gl.drawingBufferWidth,height=gl.drawingBufferHeight,a=new Uint8Array(width*height*4),b=new Uint8Array(a.length);w.draw();gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,a);f.visible=false;w.draw();gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,b);f.visible=true;w.draw();let count=0;for(let n=0;n<a.length;n+=4)if(a[n]!==b[n]||a[n+1]!==b[n+1]||a[n+2]!==b[n+2])count++;return count;});if(s.pixels>bestPixels){bestPixels=s.pixels;await p.screenshot({path:`${out}/${route}-best-pixels.png`});}}
   samples.push(s);
  }
  await p.keyboard.up('KeyW');await p.keyboard.up('KeyA');rows.push({route,bestPixels,samples});
 }
 fs.writeFileSync(out+'/natural-browser-probe.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({errors,rows:rows.map(r=>({route:r.route,bestPixels:r.bestPixels,staged:r.samples.filter(s=>s.sighting.site>=0).length,visible:r.samples.filter(s=>s.sighting.visible).length,last:r.samples.at(-1).sighting}))}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
