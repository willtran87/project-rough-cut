const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/footpath-surfaces',b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__pairedFoot={scene,camera,renderer,mowerLight,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const result=await p.evaluate(async()=>{
  const {createRun}=await import('./back-nine-sim.js'),w=__pairedFoot,gl=w.renderer.getContext(),targets=[],rows=[];
  w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();
  // Production terrain batches store world-space vertices. Only the new
  // maintenance-bed planes sit at .037m. Keep every other triangle, including
  // the original inset slabs, and keep their original winding/order.
  for(const mesh of w.scene.children){if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.geometry.index)continue;const g=mesh.geometry,pos=g.attributes.position,normal=g.attributes.normal,bed=new Uint8Array(pos.count);let count=0;
   for(let i=0;i<pos.count;i++)if(Math.abs(pos.getY(i)-.037)<1e-7&&normal.getY(i)>.99){bed[i]=1;count++;}
   if(count)targets.push({mesh,g,bed,full:new g.index.array.constructor(g.index.array.length),without:new g.index.array.constructor(g.index.array.length)});
  }
  if(targets.length!==1)throw Error('Expected one existing track batch, got '+targets.length);
  let removedMax=0;
  function capture(){for(const t of targets){const a=t.g.index.array;t.full.set(a);t.count=t.g.drawRange.count;t.start=t.g.drawRange.start;let at=t.start;
   for(let i=t.start;i<t.start+t.count;i+=3){if(t.bed[a[i]]&&t.bed[a[i+1]]&&t.bed[a[i+2]])continue;t.without[at++]=a[i];t.without[at++]=a[i+1];t.without[at++]=a[i+2];}
   t.withoutCount=at-t.start;removedMax=Math.max(removedMax,(t.count-t.withoutCount)/3);
  }}
  function select(added){for(const t of targets){t.g.index.array.set(added?t.full:t.without);t.g.index.clearUpdateRanges();t.g.index.needsUpdate=true;t.g.setDrawRange(t.start,added?t.count:t.withoutCount);}}
  async function draw(added,shadow){select(added);w.mowerLight.shadow.needsUpdate=shadow;const time=performance.now();w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(fence);return performance.now()-time;}
  for(const [name,x,y,foot,rear]of [['range',-36.5,343,true,false],['garage',-33.15,764,true,false],['reservoir',37.25,190,true,false],['foliage-mower',-29,443,false,true]]){
   const r=createRun();r.mode='driving';r.time=10;r.grace=0;Object.assign(r.cart,{x,y,yaw:0,speed:8});if(foot){r.foot={x,y,yaw:0,viewYaw:0,onFoot:true,speed:7.2,invulnerable:0};Object.assign(r.cart,{x:0,y:10,health:0});}Object.assign(r.joe,{x:x+(x>0?-10:10),y:y-12,yaw:0,speed:12});w.resetCamera();w.update(r,{rear});capture();for(let n=0;n<6;n++)await draw(!!(n%2),true);select(true);const samples=[[],[]];
   for(let n=0;n<64;n++){r.time=12+n/30;const c=r.foot||r.cart;c.y=y+n*.04;r.joe.y=c.y-12;w.update(r,{rear});capture();const shadow=w.mowerLight.shadow.needsUpdate;
    for(const added of n%2?[true,false]:[false,true])samples[Number(added)].push(await draw(added,shadow));select(true);
   }
   const timing=samples.map(a=>{a.sort((a,b)=>a-b);return {median:a[32],p95:a[60],max:a[63]};});rows.push({name,timing,draws:w.stats().draws,programs:w.stats().programs,textures:w.stats().textures});
  }
  return {rows,targets:targets.length,removedMax};
 });assert(result.removedMax>0&&result.removedMax<100);assert.deepEqual(errors,[]);fs.writeFileSync(out+'/paired-performance.json',JSON.stringify({passed:true,...result,errors},null,2));console.log(JSON.stringify({passed:true,...result,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
