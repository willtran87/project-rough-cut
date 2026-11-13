const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/final-cut/rolling-boss/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[],shots=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8'),instrument=`window.__rollingMesh=()=>({position:rig.position.toArray(),yaw:rig.rotation.y,wheels:wheels.map(w=>({roll:w.rotation.x,steering:w.rotation.y,side:w.position.x,forward:-w.position.z})),joe:joeActor.stats(),boss:boss.stats()});`;
 await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',instrument+'await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__rollingMesh&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
 const atlasWidth=await p.evaluate(async()=>(await (await import('./pixel-art.js')).source('final-cut-industrial-materials-v1')).width);
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),shot=async name=>{if(process.argv.includes('--compact')&&!/^boss-(front|side|rear|390)$/.test(name))return;await p.screenshot({path:out+'/'+name+'.png'});shots.push(name);},near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
 for(const vertical of [false,true]){
  await p.evaluate(async vertical=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.player,{x:15,y:50,yaw:Math.PI/2});Object.assign(r.rig,{x:30,y:50,yaw:Math.PI/2,phase:'turn',age:0,deployment:0,speed:0,distance:0,travel:null,attack:{from:vertical?{x:22.8,y:85}:{x:30,y:50},yaw:vertical?Math.PI:-Math.PI/2},path:[]});__finalCut.run=r;await advanceTime(0);},vertical);
  for(let i=0;i<160;i++){
   const result=await p.evaluate(async()=>{const {advanceRollingTravel}=await import('./final-cut-travel.js'),{rigWheelAngle,RIG_WHEELS}=await import('./final-cut-rig.js'),j=__finalCut.run.rig;const before={...j};const done=advanceRollingTravel(j,.1);const {advanceWheelTravel}=await import('./final-cut-wheel-travel.js');advanceWheelTravel(__finalCut.run,before,.1);j.age+=.1;__finalCut.draw();const mesh=__rollingMesh();return {wheelRadius:RIG_WHEELS[0].radius,wheelTravel:j.wheelTravel,done,x:j.x,y:j.y,yaw:j.yaw,distance:j.distance,speed:j.speed,steering:j.steering,mesh,expected:mesh.wheels.map(w=>-rigWheelAngle(j,w))};});
   assert.notEqual(result.done,'blocked');near(result.mesh.position[0],result.x);near(result.mesh.position[2],-result.y);near(result.mesh.yaw,-result.yaw);result.mesh.wheels.forEach((w,k)=>{near(w.roll,-result.wheelTravel[k]/result.wheelRadius);near(w.steering,result.expected[k]);});assert(result.mesh.joe.handError<.001);assert(result.mesh.joe.footError<.001);assert.equal(result.mesh.boss.atlas,atlasWidth);assert.equal(result.mesh.boss.plates,3);assert(result.mesh.boss.parts>200);
   if(i%10===0)samples.push({vertical,seconds:(i+1)/10,...result});
   if(i===25||i===55)await shot(`rolling-${vertical?'north':'east'}-${i}`);
   if(result.done)break;if(i===159)assert.fail('Rolling route did not finish');
  }
 }
 // Fixed exhibition poses exercise the actual game mesh and lighting. They
 // are diagnostic fixtures; the separate arrival harness owns full routes.
 for(const [name,x,y]of [['front',18,61],['side',25,49],['rear',16,44]]){
  await p.evaluate(async({x,y})=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:15,y:50,yaw:0,phase:'pass',age:3,deployment:1,speed:8,reelAngle:1.2});Object.assign(r.player,{x,y,yaw:Math.atan2(15-x,50-y),pitch:-.055});__finalCut.run=r;await advanceTime(0);},{x,y});await shot('boss-'+name);
 }
 for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await tick(0);await shot('boss-'+width);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 const before=await p.evaluate(()=>__rollingMesh());await p.keyboard.press('Escape');await tick(1000);assert.deepEqual(await p.evaluate(()=>__rollingMesh()),before);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,samples,shots,errors},null,2));console.log(JSON.stringify({passed:true,software,meshSamples:samples.length,boss:samples[0].mesh.boss,shots,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});



