const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error(m.text());}});
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('camera.updateMatrixWorld();vehicleFrustum',"if(window.__overview){camera.position.set(10,56,-c.y+25);camera.lookAt(0,0,-c.y-16);camera.far=220;camera.updateProjectionMatrix();scene.fog.near=170;scene.fog.far=220;}camera.updateMatrixWorld();vehicleFrustum")}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.__backNine&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 for(const[name,x,y,yaw,overview]of [['fork',-8,75,.3,false],['cut-turf',18,110,0,false],['new-green',23,630,.7,false],['overview-nursery',0,95,0,true],['overview-final-hole',0,625,0,true]]){
  await p.evaluate(async({x,y,yaw,overview})=>{const{createRun}=await import('./back-nine-sim.js'),r=createRun(y>580?2:0);r.mode='driving';r.grace=999;r.time=12;Object.assign(r.cart,{x,y,yaw});Object.assign(r.joe,{x:0,y:y-35});__overview=overview;__backNine.run=r;await advanceTime(0);},{x,y,yaw,overview});await p.screenshot({path:'output/fairway-design/'+name+'-2560.png'});
 }
 assert.deepEqual(errors,[]);console.log('Fairway driving and diagnostic overhead views captured; no browser errors.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
