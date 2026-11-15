const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out='output/final-cut/cutting-drive/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
const instrument=`window.__cutDriveMesh=()=>({position:rig.position.toArray(),wheels:wheels.map(w=>({roll:w.rotation.x,steering:w.rotation.y})),reels:machinery.stats().reels,joe:joeActor.stats()});`;
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[],shots=[];p.on('pageerror',e=>errors.push(e.message));
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',instrument+'await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:30,y:26,lane:0,yaw:-Math.PI/2,direction:-1,phase:'announce',age:0,deployment:0});Object.assign(r.player,{x:23,y:38,yaw:Math.atan2(7,-12),pitch:0});__finalCut.run=r;await advanceTime(0);});
 const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
 let wait=0;while((await read()).rig.phase!=='pass'&&wait++<260)await tick(17);assert.equal((await read()).rig.phase,'pass');
 let elapsed=0;for(const seconds of [.1,1,3,6,9,10.4]){
  await tick((seconds-elapsed)*1000);elapsed=seconds;
  await p.evaluate(async()=>{const r=__finalCut.run,x=r.rig.x>=0?23:-23;Object.assign(r.player,{x,y:38,yaw:Math.atan2(r.rig.x-x,-12),pitch:0});await advanceTime(0);});
  const s=await read(),mesh=await p.evaluate(()=>__cutDriveMesh());near(mesh.position[0],s.rig.x);near(mesh.position[2],-s.rig.y);for(const w of mesh.wheels)near(w.roll,-s.rig.distance/.65);for(const reel of mesh.reels)near(reel.bearingAngle,0);assert(mesh.joe.handError<.001);assert(mesh.joe.footError<.001);assert.equal(s.mode,'final_cut_playing');samples.push({seconds,rig:s.rig,mesh});
  if([1,6,10.4].includes(seconds)){const name='pass-'+seconds;await p.screenshot({path:out+'/'+name+'.png'});shots.push(name);}
 }
 assert(samples[0].rig.speed<.3);assert(samples[1].rig.speed>2.3&&samples[1].rig.speed<2.5);near(samples[3].rig.speed,7.2);assert(samples.at(-1).rig.speed<2.3);
 for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await tick(0);await p.screenshot({path:out+'/braking-'+width+'.png'});shots.push('braking-'+width);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 const before=(await read()).rig,meshBefore=await p.evaluate(()=>__cutDriveMesh());await p.keyboard.press('Escape');await tick(1000);assert.deepEqual((await read()).rig,before);assert.deepEqual(await p.evaluate(()=>__cutDriveMesh()),meshBefore);await p.click('#primary');await tick(1100);const stopped=await read();assert.equal(stopped.rig.phase,'disengage');near(stopped.rig.x,-30);near(stopped.rig.speed,0);assert.equal(stopped.mode,'final_cut_playing');assert.deepEqual(errors,[]);
 const report={passed:true,software,samples,stopped:{phase:stopped.rig.phase,x:stopped.rig.x,speed:stopped.rig.speed},shots,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,software,samples:samples.map(s=>({seconds:s.seconds,x:s.rig.x,speed:s.rig.speed})),stopped:report.stopped,shots,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
