const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/utility-choice',b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const pages=[],errors=[],results=[];
 for(const enabled of [false,true]){
  const p=await b.newPage({viewport:{width:1280,height:720}});pages.push(p);p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__perfUtility={scene,camera,renderer,mowerLight,update,draw()')}));
  if(!enabled)await p.route('**/chase-utility-art.js*',r=>r.fulfill({contentType:'application/javascript',body:"export function buildUtilityArt(){return{update(){},stats:()=>({choices:['',''],bells:0}),count:0};}"}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');window.__perfRun=createRun(1,0,37161);__perfRun.mode='driving';__perfRun.time=20;__perfRun.grace=0;__perfRun.cart.health=35;__perfUtility.renderer.setSize(960,540,false);__perfUtility.camera.aspect=16/9;__perfUtility.camera.updateProjectionMatrix();});
 }
 for(const view of [['first-approach',0,286,0],['first-pad',-1.9,299,0],['range-control',-29,443,-1.2],['second-pad',-1.9,579,0]]){
  const samples=[[],[]],counts=[[],[]];
  for(let n=-6;n<48;n++)for(const k of n%2?[1,0]:[0,1]){
   const frame=await pages[k].evaluate(async({view,n})=>{const[name,x,y,yaw]=view,w=__perfUtility,r=__perfRun,gl=w.renderer.getContext();r.time=20+(n+6)/30;Object.assign(r.cart,{x,y:y+(n+6)*.025,yaw,speed:1});Object.assign(r.joe,{x:x+3,y:r.cart.y-15,speed:12});w.resetCamera();w.update(r,{rear:name==='range-control'});const start=performance.now();w.mowerLight.shadow.needsUpdate=true;w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(f);const ms=performance.now()-start,s=w.stats();return{ms,draws:s.draws,triangles:s.triangles,programs:s.programs,textures:s.textures};},{view,n});
   if(n>=0){samples[k].push(frame.ms);counts[k].push(frame);}
  }
  const result={name:view[0],stats:samples.map((s,i)=>{s.sort((a,b)=>a-b);return{mode:i?'utility-art':'without-new-art',median:s[24],p95:s[45],max:s[47],counts:counts[i]};})};results.push(result);console.log(JSON.stringify({name:result.name,timings:result.stats.map(s=>({mode:s.mode,median:s.median,p95:s.p95,first:s.counts[0]}))}));fs.writeFileSync(out+'/software-art-performance.json',JSON.stringify({results,errors},null,2));
 }
 assert.deepEqual(errors,[]);for(const result of results)for(const row of result.stats)for(const frame of row.counts){assert.equal(frame.programs,25);assert.equal(frame.textures,40);}
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
