const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/final-cut/ambush/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');await p.route('**/final-cut-scene.js',route=>route.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',"window.__ambushMesh={hide:v=>{rig.visible=!v},pose:()=>({position:rig.position.toArray(),joe:joeActor.stats()})};await renderer.compileAsync(scene,camera);")}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__ambushMesh&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');if(await p.locator('#final-cut-story').evaluate(d=>d.open))await p.locator('[data-story=skip]').click();
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
 const setup=async entry=>{await p.evaluate(async entry=>{
  const {createRun}=await import('./final-cut-sim.js'),{planAmbush}=await import('./final-cut-ambush.js');
  const {SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';r.water=0;r.pump=false;
  const vertical=['north','south'].includes(entry);Object.assign(r.player,{x:vertical?21.5:0,y:50,yaw:entry==='north'?0:entry==='south'?Math.PI:entry==='east'?Math.PI/2:-Math.PI/2});
  Object.assign(r.rig,{x:entry==='west'?-30:30,y:50,lane:1,seen:true,passSerial:['west','north'].includes(entry)?1:2});
  const a=planAmbush(r,1,'observed player',false);Object.assign(r.rig,{...a.from,attack:a,path:[],phase:'announce',age:0,yaw:a.yaw,direction:a.axis==='x'?Math.sign(a.to.x-a.from.x):Math.sign(a.to.y-a.from.y),deployment:0});__finalCut.run=r;await advanceTime(500);
 },entry);};
 for(const entry of ['west','east','north','south']){
  await setup(entry);let s=await read();assert.equal(s.ambush.tell.entry,entry);assert.equal(s.graphics.ambushReeds.tell.entry,entry);assert.equal(s.audio.rustle.entry,entry);assert(s.graphics.headlights.intensity<1);assert.match(await p.locator('#threat').innerText(),/GRASS RUSTLING/);
  const mesh=await p.evaluate(()=>__ambushMesh.pose());assert(mesh.joe.handError<.001);assert(mesh.joe.footError<.001);
  await p.screenshot({path:`${out}/${entry}-tell.png`});await p.evaluate(()=>{__ambushMesh.hide(true);__finalCut.draw();});await p.screenshot({path:`${out}/${entry}-no-rig.png`});await p.evaluate(()=>{__ambushMesh.hide(false);__finalCut.draw();});
  await tick(200);await p.screenshot({path:`${out}/${entry}-rustle.png`});
  const before=(await read()).rig;await p.keyboard.press('Escape');await tick(1000);assert.deepEqual((await read()).rig,before);await p.locator('#primary').click();
  // Walk left across this camera-facing charge; actual keyboard owns movement.
  const dodgeKey=entry==='south'?'d':'a';await p.keyboard.down(dodgeKey);await tick(1700);await p.keyboard.up(dodgeKey);await tick(1500);s=await read();assert.equal(s.mode,'final_cut_playing');assert.equal(s.rig.phase,'pass');assert(s.rig.speed>8);assert(s.graphics.headlights.intensity>200);await p.screenshot({path:`${out}/${entry}-emerging.png`});samples.push({entry,phase:s.rig.phase,speed:s.rig.speed,graphics:s.graphics,handError:mesh.joe.handError,footError:mesh.joe.footError});for(let k=0;k<60&&(await read()).rig.phase==='pass';k++){await tick(200);assert.equal((await read()).mode,'final_cut_playing');}assert.equal((await read()).rig.phase,'disengage');
 }
 await setup('east');for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await tick(0);await p.screenshot({path:`${out}/tell-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.evaluate(()=>{__finalCut.preferences.reducedMotion=true;__finalCut.preferences.muted=true;__finalCut.preferences.subtitles=false;});await tick(100);assert.match(await p.locator('#threat').innerText(),/GRASS RUSTLING/);await p.screenshot({path:`${out}/reduced-muted.png`});
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,samples,checks:['Four directional reed tells and spatial audio','Suppressed staging lamps; bright committed charge','Real E-independent movement escape after warning','Joe hands and feet remain planted','Pause freezes attack','Four viewport sizes; muted/reduced warning remains'],errors},null,2));console.log(JSON.stringify({passed:true,software,entries:samples.map(s=>s.entry),errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
