const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2]||'output/back-nine-visual-upgrade/turf-condition/current';
// Fixed playable viewpoints keep captures comparable between runs; simulation
// is frozen only after entering through the real menu and presentation fence.
const software=process.argv.includes('--software');
const views=[['nursery-thin',8,104,.15,true],['range-dry',-29,385,.1,true],['range-thin',-3,476,.1,true],['range-bank',22,505,.18,true],['club-dry',21,712,.1,true],['fairway',20,65,.12,true],['green',25,134,.12,true],['bunker',14,225,.3,true],['maintenance',-10,220,0,false],['beacon',20,65,.1,true,{x:20,y:72,yaw:Math.PI}],['rough',-32,410,.12,true],['flood',-12,220,.1,true]];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/'+'back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()',"return window.__turfWorld={scene,camera,renderer,dryMap:typeof dryTurfMap==='undefined'?null:dryTurfMap,conditionField:typeof turfConditionField==='undefined'?null:turfConditionField,update,draw()") }));
 await p.route('**/course-render-preparation.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/course-render-preparation.js','utf8').replace('renderer.initTexture(map);','(window.__turfTextureUploads??=[]).push(map.uuid);renderer.initTexture(map);')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
 await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 for(const [name,x,y,yaw,foot,joe]of views){
  await p.evaluate(async({x,y,yaw,foot,joe})=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;r.panic.armed=false;Object.assign(r.cart,{x,y,yaw,speed:0});Object.assign(r.joe,{x:0,y:10,speed:0,...joe});if(foot){r.cart.health=0;r.cart.failedAt=0;r.cart.x=35;r.cart.y=10;r.foot={x,y,yaw,viewYaw:yaw,speed:0,onFoot:true,invulnerable:0};}__backNine.run=r;await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();},{x,y,yaw,foot,joe});
  if(name==='flood'){await p.evaluate(async()=>{__backNine.run.tactics.floodUntil[0]=100;__backNine.render();await __backNine.whenPresented();});}
  await p.screenshot({path:path.join(out,name+'-2560.jpg'),type:'jpeg',quality:95});samples.push({name,state:await p.evaluate(()=>JSON.parse(render_game_to_text()))});console.log('captured',name);
 }
 await p.evaluate(async()=>{const {irrigationPhase}=await import('./chase-irrigation.js');const r=__backNine.run;r.tactics.floodUntil[0]=0;while(irrigationPhase(r,0).active)r.time+=.1;__backNine.render();await __backNine.whenPresented();});
 const dry=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(dry.graphics.irrigationArt.waterVisible[0],false);
 await p.screenshot({path:path.join(out,'flood-dry-2560.jpg'),type:'jpeg',quality:95});samples.push({name:'flood-dry',state:dry});
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});await p.screenshot({path:path.join(out,`dry-${width}.jpg`),type:'jpeg',quality:95});}
 {const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(state.graphics.turfCondition.areas,17);}
 const texture=await p.evaluate(async()=>{const Art=await import('./pixel-art.js');return Art.stats();});assert.deepEqual(texture.errors,[]);
 let fieldProbe=null,preparation=null;
 {
  await p.keyboard.press('Escape');const time=await p.evaluate(()=>__backNine.run.time);await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>__backNine.run.time),time);await p.locator('#primary').click();
  fieldProbe=await verifyField(p);assert(fieldProbe.maxError<=2/255,JSON.stringify(fieldProbe));
  preparation=await p.evaluate(()=>({fieldPrepared:__turfTextureUploads.includes(__turfWorld.conditionField.uuid),dryPrepared:__turfTextureUploads.includes(__turfWorld.dryMap.uuid),fieldVersion:__turfWorld.conditionField.version}));
  assert.deepEqual(preparation,{fieldPrepared:true,dryPrepared:true,fieldVersion:1});
  await p.keyboard.press('Escape');await p.locator('#restart').click();await p.evaluate(()=>advanceTime(17));const r=await p.evaluate(()=>__backNine.run);assert.equal(r.checkpoint,0);assert(r.cart.y<20);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,software,texture,errors,samples,fieldProbe,preparation},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

async function verifyField(page){return page.evaluate(async()=>{
 const THREE=await import('./vendor/three/three.module.js'),{finishTurfCondition,TURF_CONDITION_AREAS,TURF_CONDITION_FIELD}=await import('./back-nine-turf-condition.js'),{COURSE_GREENS}=await import('./back-nine-landscape.js');
 const {renderer,conditionField:field}=__turfWorld,{width,height,xMin,yMin,texelsPerMeter}=TURF_CONDITION_FIELD,data=field.image.data;
 const texture=rgba=>{const t=new THREE.DataTexture(new Uint8Array(rgba),1,1);t.needsUpdate=true;return t;},black=texture([0,0,0,255]),red=texture([255,0,0,255]),green=texture([0,255,0,255]);
 const material=new THREE.ShaderMaterial({uniforms:{map:{value:black}},depthTest:false,depthWrite:false,toneMapped:false,vertexShader:'varying vec2 vMapUv;void main(){\n#include <begin_vertex>\nvMapUv=vec2(.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(transformed,1.0);}',fragmentShader:'uniform sampler2D map;varying vec2 vMapUv;void main(){gl_FragColor=vec4(texture2D(map,vMapUv).rgb,1.0);}'});
 finishTurfCondition(material,red,green,field);
 const scene=new THREE.Scene(),mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10),target=new THREE.WebGLRenderTarget(1,1);scene.add(mesh);
 const old=renderer.getRenderTarget(),viewport=renderer.getViewport(new THREE.Vector4()),pixel=new Uint8Array(4);let maxError=0;
 const points=[...TURF_CONDITION_AREAS.map(p=>[p.x,p.y]),...COURSE_GREENS.map(p=>[p.x,p.y]),[-100,100],[100,100],[0,-100],[0,900]];
 const value=(x,y,k)=>data[(Math.max(0,Math.min(height-1,y))*width+Math.max(0,Math.min(width-1,x)))*2+k]/255;
 try{for(const [x,y]of points){
  mesh.position.set(x,0,-y);camera.position.set(x,0,-y+1);renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,1,1,pixel);
  const u=(x-xMin)*texelsPerMeter-.5,v=(y-yMin)*texelsPerMeter-.5,ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy;
  for(let k=0;k<2;k++){const expected=value(ix,iy,k)*(1-fx)*(1-fy)+value(ix+1,iy,k)*fx*(1-fy)+value(ix,iy+1,k)*(1-fx)*fy+value(ix+1,iy+1,k)*fx*fy;maxError=Math.max(maxError,Math.abs(pixel[k]/255-expected));}
 }}finally{renderer.setRenderTarget(old);renderer.setViewport(viewport);target.dispose();mesh.geometry.dispose();material.dispose();black.dispose();red.dispose();green.dispose();}
 return {points:points.length,maxError,bytes:data.byteLength,worldAnchored:true};
});}
