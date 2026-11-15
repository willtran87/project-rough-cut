const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),legacy=process.argv.includes('--legacy');
const fixedLoop=process.argv.includes('--fixed-loop');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/practicals/${software?'software':'hardware'}${legacy?'-legacy':''}${fixedLoop?'-fixed-loop':''}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  if(fixedLoop)await page.route('**/under-green-practical-lighting.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-upgrade/pass8-source/practical-before-uniform-loop.js','utf8')}));
  await page.route('**/under-green-scene.js',route=>{
   let s=fs.readFileSync(legacy?'output/under-green/visual-upgrade/pass7-source/under-green-scene.js':'web/under-green-scene.js','utf8');
   if(!legacy)s=s.replace('const practicalLighting=createDrainPracticalLighting','let practicalLighting=createDrainPracticalLighting');
   const marker=' return {draw,drainJoeFootsteps:';assert(s.includes(marker));
   const hook=legacy?'window.__practicalAudit={renderer,scene,camera};':`window.__practicalAudit={renderer,scene,camera,lamps,reference:async enabled=>{
    if(enabled){practicalLighting.setEnabled(false);const {dampLampLevel}=await import('./under-green-atmosphere.js');window.__referenceLamps=lamps.map((lamp,index)=>{const light=new THREE.PointLight(lamp.color??(index%3===1?0x79c8c5:0xe9b575),8*(lamp.power??1)*dampLampLevel(__underGreen.run.time,index,false),lamp.reach??13,1.4);light.position.set(lamp.x,lamp.height??2.8,-lamp.y);scene.add(light);return light;});}
    else{for(const light of window.__referenceLamps)light.removeFromParent();practicalLighting.setEnabled(true);}
   }};`;
   s=s.replace(marker,hook+marker);return route.fulfill({contentType:'application/javascript',body:s});
  });
  const started=Date.now();await page.goto('http://127.0.0.1:4187/under-green.html?test');await page.waitForFunction(()=>window.__practicalAudit&&window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});const startupMs=Date.now()-started;
  await page.click('#primary');await page.keyboard.press('Escape');
  const fixtures=[
   {name:'gallery',x:0,y:12,yaw:0,pitch:0},
   {name:'bunker',x:-20,y:70,yaw:Math.PI,pitch:0},
   {name:'pump',x:-20,y:40,yaw:-Math.PI/2,pitch:0},
   {name:'keeper-distant',x:12,y:23,yaw:Math.PI,pitch:0},
   {name:'keeper-close',x:11.65,y:15.8,yaw:Math.PI,pitch:0},
   {name:'keeper-flood',x:12,y:23,yaw:Math.PI,pitch:-.2,elapsed:49},
  ];
  async function fixture(f){await page.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=90;r.elapsed=f.elapsed??0;r.bypass=true;r.bypassAt=20;r.lessonCrossed=true;r.joe.phase='absent';Object.assign(r.player,f);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
  async function timings(){return page.evaluate(async()=>{
    const gl=__practicalAudit.renderer.getContext();
    async function frame(){const start=performance.now();advanceTime(0);const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(sync,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU completion timeout');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(sync);return performance.now()-start;}
    for(let i=0;i<8;i++)await frame();const samples=[];for(let i=0;i<32;i++)samples.push(await frame());const sorted=[...samples].sort((a,b)=>a-b);return {samples,median:sorted[16],p95:sorted[30],max:sorted[31],resolution:[gl.drawingBufferWidth,gl.drawingBufferHeight]};
   });}
  for(const f of fixtures.filter(f=>!process.argv.some(a=>a.startsWith('--focus='))||f.name===process.argv.find(a=>a.startsWith('--focus=')).slice(8))){
   await fixture(f);await page.screenshot({path:`${out}/${f.name}-2560.png`});
   const info=await page.evaluate(()=>{const g=JSON.parse(render_game_to_text()).graphics;return {resolution:g.resolution,draws:g.draws,triangles:g.triangles,practicals:g.practicalLighting,programs:g.programs,textures:g.textures};});
   const nativeTiming=software?null:await timings();
   // Measure completed GPU work at a common960x600 target, not screenshot size
   // or synchronous JS submission. A fence includes the queued GPU commands.
   await page.setViewportSize({width:960,height:600});await fixture(f);
   const timed=await timings();
   let parity=null;
   if(!legacy){
    parity=await page.evaluate(async()=>{
     const gl=__practicalAudit.renderer.getContext(),pixels=()=>{advanceTime(0);const b=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,b);return b;};
     const local=pixels();await __practicalAudit.reference(true);const reference=pixels();let changed=0,max=0,overOne=0;const examples=[];for(let i=0;i<local.length;i++){const d=Math.abs(local[i]-reference[i]);if(d)changed++;if(d>1){overOne++;if(i%4===0&&examples.length<16)examples.push({x:Math.floor(i/4)%gl.drawingBufferWidth,y:Math.floor(i/4/gl.drawingBufferWidth),local:[...local.slice(i,i+3)],reference:[...reference.slice(i,i+3)]});}max=Math.max(max,d);}await __practicalAudit.reference(false);pixels();return {changed,max,overOne,channels:local.length,examples};
    });
    if(parity.max>1){await page.screenshot({path:`${out}/${f.name}-local-diagnostic.png`});await page.evaluate(async()=>{await __practicalAudit.reference(true);advanceTime(0);});await page.screenshot({path:`${out}/${f.name}-reference-diagnostic.png`});fs.writeFileSync(`${out}/parity-failure.json`,JSON.stringify({fixture:f.name,parity},null,2));}
    assert(parity.max<=1,JSON.stringify({fixture:f.name,parity}));
   }
   views.push({name:f.name,...info,nativeTiming,timing:timed,parity});fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:false,software,legacy,startupMs,views,errors},null,2));console.log(JSON.stringify({name:f.name,nativeP95:nativeTiming?.p95,median:timed.median,p95:timed.p95,parity,practicals:info.practicals&&{sources:info.practicals.sources,max:info.practicals.maximumStaticSources,average:info.practicals.averageStaticSources}}));await page.setViewportSize({width:2560,height:1600});
  }
  let stability=null,reduced=null;
  if(!legacy){
   stability=await page.evaluate(()=>{const first=JSON.parse(render_game_to_text()).graphics.lights;for(const [x,y,yaw]of [[0,31,0],[12,23,Math.PI],[-20,70,0],[11.65,15.8,0]]){Object.assign(__underGreen.run.player,{x,y,yaw});advanceTime(0);const now=JSON.parse(render_game_to_text()).graphics.lights;if(JSON.stringify(now)!==JSON.stringify(first))throw Error('Camera changed world illumination');}return {cameraIndependent:true,sources:first.length};});
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await page.setViewportSize({width,height});await fixture(fixtures[3]);await page.screenshot({path:`${out}/keeper-distant-${width}.png`});}
  }
  if(!legacy){
   await page.keyboard.press('Escape');await page.locator('#comfort').evaluate(e=>e.open=true);await page.locator('#reduced').setChecked(true);await page.click('#primary');await fixture(fixtures[3]);
   reduced=await page.evaluate(async()=>{
    const T=await import('./vendor/three/three.module.js'),a=__practicalAudit;
    const expected=a.lamps.map((l,i)=>({position:new T.Vector3(l.x,l.height??2.8,-l.y).applyMatrix4(a.camera.matrixWorldInverse),color:new T.Color(l.color??(i%3===1?0x79c8c5:0xe9b575)).multiplyScalar(8*(l.power??1)*.72)}));
    let samples=0,maxError=0;a.scene.traverse(o=>{if(!o.isMesh)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){const values=a.renderer.properties.get(m).uniforms?.drainPracticals?.value;if(!values)continue;for(const u of values.slice(0,a.renderer.properties.get(m).uniforms.drainPracticalCount?.value??values.length)){const target=expected.find(v=>v.position.distanceTo(u.position)<1e-6);if(!target)throw Error('Practical position does not match fixture');for(const k of ['r','g','b'])maxError=Math.max(maxError,Math.abs(u.color[k]-target.color[k]));samples++;}}});
    if(samples===0||maxError>1e-9)throw Error('Reduced Motion actual light uniform mismatch');const before=JSON.parse(render_game_to_text()).graphics.lights;advanceTime(250);if(JSON.stringify(before)!==JSON.stringify(JSON.parse(render_game_to_text()).graphics.lights))throw Error('Reduced Motion practical changed');return {samples,maxError,steady:true};
   });
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,legacy,startupMs,views,stability,reduced,errors},null,2));console.log(JSON.stringify({passed:true,software,legacy,startupMs,stability,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
