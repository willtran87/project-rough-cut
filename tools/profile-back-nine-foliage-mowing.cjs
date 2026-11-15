const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv[2];if(!out)throw Error('Provide evidence directory');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/back-nine-scene.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__foliageWorld={scene,camera,renderer,update,draw()')}));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const result=await p.evaluate(async()=>{
  const {createRun}=await import('./back-nine-sim.js'),r=createRun(0,0,713),w=__foliageWorld,gl=w.renderer.getContext();r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;
  Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x:9,y:43,yaw:0,viewYaw:0,viewPitch:.24,speed:0,onFoot:true,invulnerable:0};Object.assign(r.joe,{x:9,y:100,speed:0});
  const materials=new Set();w.scene.traverse(o=>{if(o.geometry?.attributes.vergeCutData)materials.add(o.material);});if(materials.size!==1)throw Error('Expected shared foliage material');
  const mat=[...materials][0],compile=mat.onBeforeCompile,key=mat.customProgramCacheKey;let baseline=false,rewrites=0;
  mat.onBeforeCompile=s=>{compile(s);if(baseline){const original='vec4 mowingState=texture2D(vergeMowing,mowingUV);';if(!s.vertexShader.includes(original))throw Error('Mowing shader not found');s.vertexShader=s.vertexShader.replace(original,'vec4 mowingState=vec4(0.0);');rewrites++;}};
  mat.customProgramCacheKey=()=>key()+(baseline?'-qa-no-mowing':'-qa-mowing');
  await __backNine.whenPresented();w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.resetCamera();
  const samples={baseline:[],current:[]},stats={};
  for(const mode of ['baseline','current','current','baseline']){baseline=mode==='baseline';mat.needsUpdate=true;
   for(let n=0;n<24;n++){const start=performance.now();w.update(r,{});const cpu=performance.now()-start;w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(fence);if(n>=4)samples[mode].push({cpu,total:performance.now()-start});stats[mode]=w.stats();}
  }
  const result={rewrites};for(const [mode,values]of Object.entries(samples)){const times=values.map(v=>v.total).sort((a,b)=>a-b),cpu=values.map(v=>v.cpu).sort((a,b)=>a-b);result[mode]={samples:times.length,median:times[20],p95:times[38],cpuP95:cpu[38],draws:stats[mode].draws,triangles:stats[mode].triangles,cut:stats[mode].courseDetail.mowing.cut};}return result;
 });
 assert.deepEqual(errors,[]);assert(result.rewrites>0);assert.equal(result.current.cut,0);assert.equal(result.current.triangles,result.baseline.triangles);assert.equal(result.current.draws,result.baseline.draws);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,resolution:[960,540],method:'Same page ABBA; zero-state shader specialization versus live texture fetch, identical untouched plants and camera.',result,errors},null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}})().catch(e=>{fs.writeFileSync(out+'/report.json',JSON.stringify({passed:false,error:e.stack},null,2));console.error(e);process.exitCode=1;});
