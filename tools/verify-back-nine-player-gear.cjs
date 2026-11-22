const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out=process.argv[2],software=process.argv.includes('--software');if(!out)throw Error('Output directory required');
const cases=[
 ['chase',null,null],['front',[.8,1.1,-2],1],['rear',[.8,1.1,2],1],['side',[2,1.1,.2],1],
 ['boots-front',[.28,.26,-.65],.14],['boots-rear',[.26,.25,.62],.14],['boots-moon',[.28,.26,-.65],.14,'moon'],['boots-red',[.28,.26,-.65],.14,'red'],['boots-headlight',[.28,.26,-.65],.14,'headlight'],
 ['glove-back',[-.68,.95,.46],.73],['glove-front',[-.68,.95,-.46],.73],['glove-red',[-.68,.95,.46],.73,'red'],['driver',[-2,2,-2.8],1.3,'normal',true],['running',null,null,'run']
];
const lightsOnly=process.argv.includes('--lights-only');
const selectedCase=process.argv.find(a=>a.startsWith('--case='))?.slice(7);
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const file of ['back-nine-scene.js','chase-runner.js','runner-materials.js','runner-gait.js'])await p.route('**/'+file+'*',r=>{
  let source=fs.readFileSync('web/'+file,'utf8');
  if(file==='back-nine-scene.js')source=source.replace('return {scene,camera,update,draw()','return window.__gearWorld={scene,camera,renderer,runner,headlights,mowerLight,update,draw()');
  return r.fulfill({contentType:'application/javascript',body:source});
 });
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const geometry=await p.evaluate(()=>{let meshes=0,triangles=0,gearMeshes=0,gearTriangles=0;const textures=[];__gearWorld.runner.root.traverse(m=>{if(!m.isMesh)return;meshes++;triangles+=m.geometry.index.count/3;for(const a of Object.values(m.geometry.attributes))for(const v of a.array)if(!Number.isFinite(v))throw Error('Nonfinite rig');if(m.material.name==='RunnerWorkGear'){gearMeshes++;gearTriangles+=m.geometry.index.count/3;textures.push({width:m.material.map.image.width,height:m.material.map.image.height,source:m.material.map.image.src});}});return{meshes,triangles,gearMeshes,gearTriangles,textures};});assert.equal(geometry.meshes,27);{assert.equal(geometry.gearMeshes,4);assert(geometry.textures.every(t=>t.width===1254&&t.height===1254));}
 const shot=async spec=>{
  const state=await p.evaluate(async spec=>{
   const [name,offset,target,light,seated]=spec,{createRun}=await import('./back-nine-sim.js'),{terrainHeight}=await import('./course-terrain.js'),r=createRun(0,0,713),w=__gearWorld,x=20,y=65,h=terrainHeight(x,y);
   r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.joe,{x:0,y:10,speed:0});Object.assign(r.cart,{x:seated?x:35,y:seated?y:10,health:seated?100:0,failedAt:0});
   if(light==='red'||light==='headlight')Object.assign(r.joe,{x:x-2,y:y+4,yaw:Math.PI,speed:8,mode:'pursuing'});
   if(light==='headlight')Object.assign(r.joe,{x,y:y+7});
   if(!seated)r.foot={x,y,yaw:0,viewYaw:0,moveYaw:0,speed:0,onFoot:true,invulnerable:0,travelSign:1};__backNine.run=r;await advanceTime(0);
   if(light==='run')for(let i=0;i<60;i++){r.time+=1/60;r.foot.speed=6.6;r.foot.y+=.11;w.update(r,{});}
   if(offset){w.camera.position.set(x+offset[0],h+offset[1],-y+offset[2]);w.camera.lookAt(x+(name.startsWith('glove')?-.224:0),h+target,-y);w.camera.updateMatrixWorld();if(r.foot)w.runner.root.visible=true;}
   if(light==='moon')w.headlights.player.intensity=0;
   // Move the actual vehicle before scene.update so shadow matrices and
   // source selection agree with the real light. Moving only the light after
   // update left a stale shadow cube in the first diagnostic captures.
   if(light==='red')w.headlights.player.intensity=0;
   if(light==='headlight'){w.headlights.player.intensity=0;w.mowerLight.intensity=0;}
   w.draw();w.renderer.getContext().finish();return JSON.parse(render_game_to_text());
  },spec);views.push({name:spec[0],state});await p.screenshot({path:path.join(out,spec[0]+'-2560.jpg'),type:'jpeg',quality:96});console.log('captured',spec[0]);
 };
 for(const spec of cases.filter(s=>(!selectedCase||s[0]===selectedCase)&&(!lightsOnly||['boots-front','boots-moon','boots-red','boots-headlight','glove-red'].includes(s[0]))))await shot(spec);
 if(!lightsOnly&&!selectedCase)for(const [width,height]of [[1280,720],[390,844]]){await p.setViewportSize({width,height});await shot(['chase-'+width,null,null]);}
 await p.keyboard.press('Escape');const paused=await p.evaluate(()=>JSON.stringify(__backNine.run));await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.stringify(__backNine.run)),paused);await p.click('#primary');await p.keyboard.press('Escape');await p.click('#restart');await p.evaluate(()=>advanceTime(17));assert.equal(await p.evaluate(()=>__backNine.run.checkpoint),0);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,software,geometry,views,errors},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
