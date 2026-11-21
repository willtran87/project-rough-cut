const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out=process.argv[2]||'output/back-nine-software-performance/raster-paired';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/course-batch-culling.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/course-batch-culling.js','utf8').replace('export function createCourseBatchCulling','function implementation')+`
 export function createCourseBatchCulling(options){
  const fine=implementation(options),coarse=implementation(options),records=[];let active=false;
  return {register(mesh,pieces,options={}){const a=coarse.register(mesh,pieces,{...options,rasterCull:false});const b=fine.register(mesh,pieces,options),shared=a.slice();records.push({a,b,shared});return shared;},
   update(camera,width,height){const next=!!window.__fineCulling;if(next!==active){fine.restore();coarse.restore();active=next;for(const r of records)r.shared.splice(0,r.shared.length,...(active?r.b:r.a));}(active?fine:coarse).update(camera,width,height);},
   restore(){fine.restore();coarse.restore();},stats:()=>({... (active?fine:coarse).stats(),fine:active})};
 }
 `}));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__perf={scene,camera,renderer,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 const results=await p.evaluate(async()=>{
  const w=__perf,gl=w.renderer.getContext(),{createRun}=await import('./back-nine-sim.js');w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();const results=[];
  const frame=async(r)=>{const t=performance.now();w.update(r,{});const update=performance.now()-t;w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,1));gl.deleteSync(f);return{ms:performance.now()-t,update};};
  const pixels=()=>{const a=new Uint8Array(960*540*4);gl.readPixels(0,0,960,540,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;};
  for(const foot of [true,false]){
   const r=createRun(0,0,713);r.mode='driving';r.time=20;r.departure.phase='finished';Object.assign(r.cart,{x:-29,y:443,yaw:0,speed:14});Object.assign(r.joe,{x:-27,y:foot?449:433,yaw:0,speed:14});if(foot){Object.assign(r.cart,{x:-32,y:454,health:0});r.foot={x:-29,y:459,yaw:Math.PI,viewYaw:Math.PI,onFoot:true,speed:0};}r.tactics.floodUntil[1]=r.tactics.floodUntil[2]=100;for(const s of [...r.destruction.props,...Object.values(r.destruction.features)])Object.assign(s,{brokenAt:19.5,dx:.2,dy:1,power:1});r.destruction.serial=35;w.resetCamera();for(let i=0;i<200;i++)w.update(r,{});
   const shots=[],stats=[];for(const on of [false,true]){window.__fineCulling=on;for(let i=0;i<4;i++)await frame(r);shots.push(pixels());stats.push(w.stats());}
   let changed=0,max=0;for(let i=0;i<shots[0].length;i+=4){let any=false;for(let k=0;k<3;k++){const d=Math.abs(shots[0][i+k]-shots[1][i+k]);if(d)any=true;max=Math.max(max,d);}if(any)changed++;}
   const samples=[[],[]];for(let round=0;round<8;round++)for(const on of round%2?[true,false]:[false,true]){window.__fineCulling=on;await frame(r);for(let i=0;i<8;i++){r.time+=1/60;const a=r.foot||r.cart;a.y+=.035;r.joe.y+=.035;samples[on?1:0].push(await frame(r));}}
   const timing=samples.map(a=>{const sorted=a.map(v=>v.ms).sort((x,y)=>x-y);return{median:sorted[Math.floor(a.length*.5)],p95:sorted[Math.floor(a.length*.95)],update:a.reduce((s,r)=>s+r.update,0)/a.length};});results.push({foot,changed,max,triangles:stats.map(s=>s.triangles),draws:stats.map(s=>s.draws),culling:stats.map(s=>s.batchCulling),timing,samples});
  }
  return results;
 });fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results:results.map(r=>({...r,samples:undefined})),errors}));assert.deepEqual(errors,[]);assert(results.every(r=>r.changed===0),'Culling changed pixels');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
