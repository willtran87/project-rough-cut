// Diagnostic removal only. None of these omissions are candidates for shipping.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/visual-upgrade-local/pass51-components';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--ignore-gpu-blocklist']}),rows=[],errors=[];try{
 const p=await b.newPage({viewport:{width:960,height:600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='log'&&m.text().startsWith('component:'))console.log(m.text());});
 await p.route('**/under-green-practical-lighting.js',r=>{let s=fs.readFileSync('web/under-green-practical-lighting.js','utf8');s=s.replace('shader.uniforms.drainPracticals={value:uniforms};','shader.uniforms.drainPracticals={value:uniforms};shader.uniforms.drainProfileLights=window.__profileLights;');s=s.replace('uniform PointLight drainPracticals[${indices.length}];','uniform PointLight drainPracticals[${indices.length}]; uniform float drainProfileLights;');s=s.replace('getPointLightInfo( drainPracticals[ i ], geometryPosition, directLight );','if (drainProfileLights > .5) { getPointLightInfo( drainPracticals[ i ], geometryPosition, directLight );');s=s.replace('material, reflectedLight );','material, reflectedLight ); }');return r.fulfill({contentType:'application/javascript',body:s});});
 await p.addInitScript(()=>window.__profileLights={value:1});
 await p.route('**/under-green-scene.js',r=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');const marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));return r.fulfill({contentType:'application/javascript',body:s.replace(marker,' window.__components={renderer,scene,camera};'+marker)});});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 await p.evaluate(()=>{const a=__components,render=a.renderer.renderBufferDirect.bind(a.renderer);a.mode='full';a.renderer.renderBufferDirect=function(camera,scene,geometry,material,object,group){
  const name=object.name;
  if(a.mode==='particles'&&['Drain droplets','Drain contact ripples','Drain impact spray'].includes(name))return;
  if(a.mode==='shade'&&['Root masonry contact shade','Wall and machinery contact shade'].includes(name))return;
  if(a.mode==='transparent'&&material.transparent)return;
  if(a.mode==='floor'&&['floor','walkway'].includes(name))return;
  if(a.mode==='roots'&&name==='root')return;
  return render(camera,scene,geometry,material,object,group);
 };});
 for(const [name,x,y,yaw]of [['gallery',0,19,0],['pump',-23.4,42,-1],['range',12,35,Math.PI]]){
  const row=await p.evaluate(async({name,x,y,yaw})=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=26.3;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch:.05});__underGreen.run=r;__underGreen.clearInput();const a=__components,gl=a.renderer.getContext(),results=[];
   for(const mode of ['full','particles','shade','transparent','floor','roots','lights','full']){
    a.mode=mode;__profileLights.value=mode==='lights'?0:1;const samples=[],cpu=[];
    for(let i=0;i<20;i++){const start=performance.now();advanceTime(0);const submitted=performance.now();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>(i===0?60000:10000))throw Error('GPU timeout '+mode+' frame '+i);await new Promise(r=>setTimeout(r,2));}gl.deleteSync(fence);if(i>=4){samples.push(performance.now()-start);cpu.push(submitted-start);}}
    samples.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const g=JSON.parse(render_game_to_text()).graphics;results.push({mode,median:samples[8],p95:samples[15],cpuMedian:cpu[8],draws:g.draws,triangles:g.triangles});console.log('component:'+JSON.stringify({name,...results.at(-1)}));
   }return {name,results};
  },{name,x,y,yaw});rows.push(row);fs.writeFileSync(out+'/report.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify(row));
 }assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
