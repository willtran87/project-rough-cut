const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const software=process.argv.includes('--software'),tag=software?'software':'hardware',out='output/back-nine-experience/junction-readability';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__uploads=0;const upload=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__uploads++;return upload.apply(this,a);};});
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__junctionWorld={scene,camera,renderer,materials,mowerLight,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const start=await p.evaluate(()=>({uploads:__uploads,stats:__junctionWorld.stats()}));
 const targets=await p.evaluate(()=>{const w=__junctionWorld;window.__edgeTargets=[];
  for(const mesh of w.scene.children){if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.geometry.index||(mesh.material!==w.materials.stone&&mesh.material.userData.localLightSourceId!==w.materials.stone.id))continue;const g=mesh.geometry,pos=g.attributes.position,norm=g.attributes.normal,edge=new Uint8Array(pos.count);let count=0;for(let i=0;i<pos.count;i++)if(Math.abs(pos.getY(i)-.039)<1e-7&&norm.getY(i)>.99){edge[i]=1;count++;}if(count)__edgeTargets.push({g,edge,count,full:new g.index.array.constructor(g.index.array.length),without:new g.index.array.constructor(g.index.array.length)});}
  window.__captureEdges=()=>{for(const t of __edgeTargets){const a=t.g.index.array;t.full.set(a);t.start=t.g.drawRange.start;t.size=Math.min(t.g.drawRange.count,a.length-t.start);let at=t.start;for(let i=t.start;i<t.start+t.size;i+=3){if(t.edge[a[i]]&&t.edge[a[i+1]]&&t.edge[a[i+2]])continue;t.without[at++]=a[i];t.without[at++]=a[i+1];t.without[at++]=a[i+2];}t.withoutSize=at-t.start;}};
  window.__selectEdges=added=>{for(const t of __edgeTargets){t.g.index.array.set(added?t.full:t.without);t.g.index.clearUpdateRanges();t.g.index.needsUpdate=true;t.g.setDrawRange(t.start,added?t.size:t.withoutSize);}};
  return __edgeTargets.map(t=>t.count);
 });assert.equal(targets.reduce((a,b)=>a+b,0),start.stats.routeClues.junctionEdges*4);
 const views=[],positions=[['nursery',-8,73,-.31,0],['reservoir',14,144,.42,0],['pump',14,183,-.3,0],['range',0,313,0,1],['dry-range',-14,415,.51,1],['clubhouse',0,607,0,2],['service',-18,745,.39,2],['crossover',-28,468,0,1]];
 for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){
  await p.setViewportSize({width,height});
  for(const [name,x,y,yaw,checkpoint]of positions){
   await p.evaluate(async a=>{const {createRun}=await import('./back-nine-sim.js'),r=createRun(a.checkpoint,0,26381);r.mode='driving';r.time=18;r.grace=999;Object.assign(r.cart,{x:a.x,y:a.y,yaw:a.yaw});Object.assign(r.joe,{x:a.x-7,y:a.y-35});__backNine.run=r;await advanceTime(0);__captureEdges();},{x,y,yaw,checkpoint});
   for(const added of [false,true]){await p.evaluate(added=>{__selectEdges(added);__junctionWorld.draw();},added);await p.screenshot({path:`${out}/${tag}-${name}-${width}-${added?'after':'before'}.png`});}
   views.push({name,width,height,stats:await p.evaluate(()=>__junctionWorld.stats())});
  }
 }
 console.log(JSON.stringify({tag,views:views.length,targets}));
 const timings=software?await p.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js'),w=__junctionWorld,gl=w.renderer.getContext(),rows=[];w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();
  async function draw(added,shadow){__selectEdges(added);w.mowerLight.shadow.needsUpdate=shadow;const at=performance.now();w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(fence);return performance.now()-at;}
  for(const [name,x,y,yaw]of [['reservoir',14,144,.42],['range',0,313,0],['service',-18,745,.39]]){const r=createRun(2,0,26381);r.mode='driving';r.time=18;Object.assign(r.cart,{x,y,yaw,speed:7});Object.assign(r.joe,{x:x-7,y:y-25,speed:12});w.resetCamera();w.update(r,{});__captureEdges();for(let i=0;i<8;i++)await draw(!!(i%2),true);__selectEdges(true);const values=[[],[]];let triangles=0;
   for(let n=0;n<64;n++){r.time=18+n/30;r.cart.y=y+n*.04;r.joe.y=r.cart.y-25;w.update(r,{});__captureEdges();triangles=Math.max(triangles,__edgeTargets.reduce((s,t)=>s+(t.size-t.withoutSize)/3,0));const shadow=w.mowerLight.shadow.needsUpdate;for(const added of n%2?[true,false]:[false,true])values[Number(added)].push(await draw(added,shadow));__selectEdges(true);}
   rows.push({name,selectedIndexTriangles:triangles,timings:values.map(a=>{a.sort((a,b)=>a-b);return {median:a[32],p95:a[60],max:a[63]};})});
  }return rows;
 }):[];
 const end=await p.evaluate(()=>({uploads:__uploads,stats:__junctionWorld.stats()}));assert.equal(end.uploads,start.uploads);assert.equal(end.stats.programs,start.stats.programs);assert.equal(end.stats.textures,start.stats.textures);assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${tag}.json`,JSON.stringify({passed:true,start,targets,views,timings,end,errors},null,2));console.log(JSON.stringify({passed:true,tag,timings,uploads:end.uploads-start.uploads,programs:end.stats.programs,textures:end.stats.textures,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
