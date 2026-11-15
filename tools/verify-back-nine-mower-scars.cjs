const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2],software=process.argv.includes('--software');if(!out)throw Error('Provide evidence directory');fs.mkdirSync(out,{recursive:true});fs.rmSync(out+'/report.json',{force:true});
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('const tracks=createBackNineMowerScars','const tracks=window.__scarTracks=createBackNineMowerScars')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 const present=()=>p.evaluate(async()=>{await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();});
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const shot=async name=>{await present();await p.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:94});samples.push({name,state:await read()});console.log(name,JSON.stringify(samples.at(-1).state.graphics.mowerTracks));};
 async function stage(wet=false){await p.evaluate(async wet=>{
  const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;
  Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x:wet?-5:20,y:wet?231:43,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};
  if(wet)r.tactics.floodUntil[0]=100;
  Object.assign(r.joe,{x:wet?-5:20,y:wet?233:43,yaw:0,speed:10,mode:'pursuing'});r.joe.ram.phase='none';__backNine.run=r;__scarTracks.update(r);
  for(let i=1;i<=(wet?20:96);i++){
   r.time+=.05;r.joe.y=(wet?233:43)+i*.5;r.joe.x=wet?-5:20+3*Math.sin(i*.025);r.joe.yaw=wet?0:Math.atan2(.075*Math.cos(i*.025),.5);__scarTracks.update(r);
  }
  r.joe.speed=0;
 },wet);await present();}
 await stage();assert((await read()).graphics.mowerTracks.segments>30);await shot('dry-curved-slope-2560');
 const resources=(await read()).graphics;
 if(process.argv.includes('--soil')){
  const art=await p.evaluate(async()=>{const THREE=await import('./vendor/three/three.module.js'),mesh=__scarTracks.batches[0].mesh,s={uniforms:{},vertexShader:THREE.ShaderLib.lambert.vertexShader,fragmentShader:THREE.ShaderLib.lambert.fragmentShader};mesh.material.onBeforeCompile(s);const map=s.uniforms.scarSoilMap.value;return {width:map.image.naturalWidth,height:map.image.naturalHeight,colorSpace:map.colorSpace,nearest:map.magFilter===THREE.NearestFilter,mipmaps:map.generateMipmaps,soilAttribute:!!mesh.geometry.attributes.scarSoil,shader:s.fragmentShader.includes('texture2D(scarSoilMap,vTurfMeters/4.0)')};});
  assert.deepEqual(art,{width:1254,height:1254,colorSpace:'srgb',nearest:true,mipmaps:true,soilAttribute:true,shader:true});fs.writeFileSync(out+'/soil-art.json',JSON.stringify(art,null,2));
  await p.evaluate(()=>{const r=__backNine.run;r.foot.x=22;r.foot.y=62;r.foot.viewPitch=.38;r.foot.yaw=r.foot.viewYaw=.18;__backNine.run=r;});await shot('ground-inspection-2560');
  await p.evaluate(()=>{__backNine.run.foot.viewPitch=0;});
 }
 // Real on-foot camera moves across the scar, revealing ground contact from
 // both sides. It is not a detached diagnostic camera.
 await p.evaluate(()=>{const r=__backNine.run;r.foot.x=27;r.foot.y=61;r.foot.yaw=r.foot.viewYaw=-1.2;__backNine.run=r;});await shot('dry-side-2560');
 await stage(true);assert((await read()).graphics.mowerTracks.wetStamped>0);await shot('wet-ruts-2560');
 // Observe the same soil after the authoritative sprinkler cycle is off.
 await p.evaluate(async()=>{const {irrigationPhase}=await import('./chase-irrigation.js'),r=__backNine.run;r.tactics.floodUntil[0]=0;for(let time=50;time<95;time++){r.time=time;if(!irrigationPhase(r,0).active)break;}});await shot('drained-ruts-2560');assert.equal((await read()).graphics.irrigation[0].active,false);
 await stage();
 const before=(await read()).graphics.mowerTracks;await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(1000));assert.equal((await read()).graphics.mowerTracks.stamped,before.stamped);await p.locator('#primary').click();
 await p.evaluate(()=>{const c=document.getElementById('chase-reduced');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));});await present();assert.equal((await read()).graphics.mowerTracks.stamped,before.stamped);
 for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot('scars-'+width);}
 const end=(await read()).graphics;assert.equal(end.programs,resources.programs,'no late shader');assert.equal(end.textures,resources.textures);
 await p.keyboard.press('Escape');await p.locator('#restart').click();await p.evaluate(()=>advanceTime(17));assert.equal((await read()).graphics.mowerTracks.segments,0);assert.deepEqual(await p.evaluate(()=>({mode:__backNine.run.mode,checkpoint:__backNine.run.checkpoint,x:__backNine.run.cart.x,y:__backNine.run.cart.y})),{mode:'briefing',checkpoint:0,x:0,y:14});
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,errors,samples},null,2));console.log('PASS');
 }finally{await browser.close();}})().catch(error=>{fs.writeFileSync(out+'/report.json',JSON.stringify({passed:false,error:error.stack},null,2));console.error(error);process.exitCode=1;});
