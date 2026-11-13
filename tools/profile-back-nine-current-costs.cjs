const fs=require('node:fs'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/terrain-cost';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('const mesh=new THREE.Mesh(g,b.material);','const mesh=new THREE.Mesh(g,b.material);mesh.userData.profileBatch=key;').replace('return {scene,camera,update,draw()','return window.__cost={scene,camera,renderer,mower,rider,mowerLight,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));const rows=[];
 for(const a of [['wet-foliage',-29,443,-1.2,true],['close-mower',0,60,0,true],['range-foot',-12,371,-.4,false]]){
 const row=await p.evaluate(async a=>{
  const [name,x,y,yaw,rear]=a,{createRun}=await import('./back-nine-sim.js'),r=createRun(1),w=__cost,gl=w.renderer.getContext();r.mode='driving';r.grace=0;r.time=20;r.cart.health=15;
  if(name==='range-foot')r.foot={x,y,yaw,viewYaw:yaw,speed:6.6,onFoot:true,invulnerable:0};
  w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();
  const subsets={ground:[],verge:[],trees:[]};w.scene.traverse(o=>{if(!o.isMesh)return;const key=o.userData.profileBatch||'';if(/^(grass|rough|road|pathEdge|track|sand|wet):/.test(key))subsets.ground.push(o);if(key.startsWith('plantCourse:'))subsets.verge.push(o);if(o.isInstancedMesh&&o.material?.map?.image?.width===1216)subsets.trees.push(o);});
  const modes=['full','ground','verge','trees','mower','rider','shadow'],samples=Object.fromEntries(modes.map(m=>[m,[]])),stats={};
  for(const mode of [...modes,...modes.toReversed()]){
   w.resetCamera();
   for(let n=0;n<20;n++){
    r.time=20+n/30;Object.assign(r.cart,{x,y:y+n*4/30,yaw,speed:8});if(r.foot)Object.assign(r.foot,{x,y:y+n*4/30});Object.assign(r.joe,{x:x+2,y:r.cart.y-12,yaw:0,speed:12});
    const start=performance.now();w.update(r,{rear});const cpu=performance.now()-start,hidden=[];
    for(const o of subsets[mode]||[]){hidden.push([o,o.visible]);o.visible=false;}
    if(mode==='mower'){hidden.push([w.mower.root,w.mower.root.visible]);w.mower.root.visible=false;}
    if(mode==='rider'){hidden.push([w.rider,w.rider.visible]);w.rider.visible=false;}
    if(mode==='shadow')w.mowerLight.shadow.needsUpdate=false;
    w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(f);
    if(n>=4)samples[mode].push({cpu,total:performance.now()-start});stats[mode]=w.stats();for(const[o,visible]of hidden)o.visible=visible;
   }
  }
  return {name,groups:Object.fromEntries(Object.entries(subsets).map(([k,v])=>[k,v.length])),modes:modes.map(mode=>{const v=samples[mode],t=v.map(s=>s.total).sort((a,b)=>a-b),c=v.map(s=>s.cpu).sort((a,b)=>a-b);return {mode,median:t[16],p95:t[30],cpuP95:c[30],draws:stats[mode].draws,triangles:stats[mode].triangles};})};
 },a);rows.push(row);console.log(JSON.stringify(row));fs.writeFileSync(out+'/components.json',JSON.stringify({rows,errors},null,2));
 }if(errors.length)throw Error(errors.join('\n'));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
