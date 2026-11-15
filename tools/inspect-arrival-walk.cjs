const fs=require('node:fs');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
(async()=>{
 const out='output/level-one-arrival-composition/walk-inspection';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),frames=[];
 await p.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__arrivalRead=()=>({arrival:state.hole.engagement.experience.arrival,player:state.player,mode:state.mode});\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__arrivalScene=()=>({world,camera,renderer,sceneTarget});'}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__arrivalRead);await p.locator('#game').click();
  for(let i=0;i<5;i++){if((await p.evaluate(()=>__arrivalRead())).mode==='first_hole')break;await p.keyboard.press('Space');await p.evaluate(()=>advanceTime(400));}
  await p.waitForFunction(()=>{advanceTime(16);return RCScene3D.stats().ready&&!document.querySelector('[data-brief-start]')?.disabled;},null,{timeout:120000});await p.locator('[data-brief-start]').click();
  for(let i=0;i<5;i++){
   for(const [key,count]of [['ArrowUp',20],[null,30],['ArrowRight',12],[null,10]]){if(key)await p.keyboard.down(key);for(let j=0;j<count;j++)await p.evaluate(()=>advanceTime(1000/60));if(key)await p.keyboard.up(key);}
   await p.evaluate(async()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/'+i+'.png'});
   frames.push(await p.evaluate(async i=>{const THREE=await import('./vendor/three/three.module.js'),r=__arrivalScene(),root=r.world.getObjectByName('night-order-phone'),screen=root.children.find(o=>o.material?.map?.image?.width===512),meshes=[];r.world.updateMatrixWorld(true);r.world.traverse(o=>{if(!o.isMesh)return;for(let q=o;q;q=q.parent)if(!q.visible)return;meshes.push(o);});const samples=[];for(const [x,y]of [[0,0],[-.05,.08],[.05,.08],[0,-.08]]){const target=new THREE.Vector3(x,y,0).applyMatrix4(screen.matrixWorld),delta=target.clone().sub(r.camera.position),ray=new THREE.Raycaster(r.camera.position,delta.clone().normalize(),0,delta.length()+.01);samples.push({target:target.toArray(),distance:delta.length(),hits:ray.intersectObjects(meshes,false).slice(0,4).map(h=>({name:h.object.name,parent:h.object.parent?.name,id:h.object.id,distance:h.distance,material:h.object.material?.type,color:h.object.material?.color?.getHex(),screen:h.object===screen,geometry:h.object.geometry?.type}))});}return {i,...__arrivalRead(),camera:r.camera.position.toArray(),root:root.position.toArray(),visible:root.visible,screenId:screen.id,samples};},i));
  }fs.writeFileSync(out+'/report.json',JSON.stringify(frames,null,2));console.log(JSON.stringify(frames.map(f=>({i:f.i,arrival:f.arrival,visible:f.visible,samples:f.samples.map(s=>s.hits)}))));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
