const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const hardware=process.argv.includes('--hardware'),moving=process.argv.includes('--moving'),tag=hardware?'hardware':'software',out='output/back-nine-experience/terrain-cost';const b=await chromium.launch({headless:true,args:hardware?['--use-angle=d3d11','--ignore-gpu-blocklist']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__uploads=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){__uploads++;return f.apply(this,args);};});
 const source=fs.readFileSync('web/back-nine-scene.js','utf8');
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('return {scene,camera,update,draw()','return window.__terrainCost={scene,camera,renderer,update,draw()')}));
 await p.route('**/parallax-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/parallax-scene.js','utf8').replace('if (!reducedMotion && !paused) motionTime += dt;','motionTime=0;')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:300000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const rows=[];
 for(const a of [['wet-foliage',-29,443,-1.2,true,false],['close-mower',0,60,0,true,false],['range-foot',-12,371,-.4,false,true],['reservoir',30,237,0,false,false],['clubhouse',-14,758,-.24,false,false],['opening',0,40,0,false,false]]){
  if(process.argv.includes('--inspect')&&a[0]!=='close-mower')continue;
  const row=await p.evaluate(async({a,moving})=>{
   const[name,x,y,yaw,rear,foot]=a,{createRun}=await import('./back-nine-sim.js'),worlds=[__terrainCost],renderer=__terrainCost.renderer,gl=renderer.getContext();let r=createRun(y>580?2:y>300?1:0);r.mode='driving';r.time=20;r.grace=0;
   Object.assign(r.cart,{x,y,yaw,speed:8,health:15});Object.assign(r.joe,{x:x+2,y:y-12,yaw:0,speed:12});if(foot)r.foot={x,y,yaw,viewYaw:yaw,speed:6.6,onFoot:true,invulnerable:0};
   renderer.setSize(960,540,false);for(const w of worlds){w.resetCamera();w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.update(r,{rear,reducedMotion:true});}
   const lastStats=[];
   async function draw(i,animate=false){const start=performance.now();worlds[i].update(r,{rear,reducedMotion:!animate});const cpu=performance.now()-start;worlds[i].draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(f);lastStats[i]=worlds[i].stats();return {total:performance.now()-start,cpu};}
   for(const i of [0])for(let n=0;n<3;n++)await draw(i);
   const samples=[[]],uploads=__uploads,initial=structuredClone(r);for(const i of [0,0]){
    if(moving){r=structuredClone(initial);worlds[i].resetCamera();}
    for(let n=0;n<(moving?24:16);n++){
     if(moving){r.time=20+n/30;r.cart.y=y+n*8/30;r.joe.y=r.cart.y-12;if(r.foot)r.foot.y=y+n*6.6/30;}
     const sample=await draw(i,moving);if(!moving||n>=8)samples[i].push(sample);
    }
   }await draw(0,moving);
   return {name,uploads:__uploads-uploads,stats:lastStats,timing:samples.map(a=>{const t=a.map(s=>s.total).sort((a,b)=>a-b),c=a.map(s=>s.cpu).sort((a,b)=>a-b);return {median:t[16],p95:t[30],cpuP95:c[30]};})};
  },{a,moving});rows.push(row);console.log(JSON.stringify({name:row.name,uploads:row.uploads,timing:row.timing,triangles:row.stats.map(s=>s.triangles)}));
  await p.screenshot({path:`${out}/${tag}-${a[0]}-after.png`});fs.writeFileSync(`${out}/${tag}${moving?'-moving':process.argv.includes('--inspect')?'-inspect':'-paired'}.json`,JSON.stringify({rows,errors},null,2));
 }
 assert.deepEqual(errors,[]);for(const r of rows)assert.equal(r.uploads,0);
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
