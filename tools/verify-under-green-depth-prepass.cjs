const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const out='output/under-green/visual-upgrade/pass14-depth';fs.mkdirSync(out,{recursive:true});
async function quiet(){
 const start=Date.now();while(true){const raw=execFileSync('powershell.exe',['-NoProfile','-Command',`@(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.ProcessId -ne ${process.pid} -and $_.CommandLine -match 'verify-|profile-|web_game_playwright' } | Select-Object -ExpandProperty ProcessId) | ConvertTo-Json -Compress`],{encoding:'utf8',windowsHide:true}).trim();if(!raw||raw==='[]')return;console.log('Waiting for render jobs: '+raw);if(Date.now()-start>180000)throw Error('Other render jobs still live');await new Promise(r=>setTimeout(r,2000));}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),errors=[],views=[];
 try{
  const page=await browser.newPage({viewport:{width:960,height:600}});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/under-green-depth-prepass.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('tools/fixtures/under-green-depth-prepass-candidate.js','utf8')}));
  await page.route('**/under-green-scene.js',r=>{
   let s=fs.readFileSync('web/under-green-scene.js','utf8');
   s="import {createDrainDepthPrepass} from './under-green-depth-prepass.js';\n"+s;
   s=s.replace('const practicalLighting=createDrainPracticalLighting','const depthPrepass=createDrainDepthPrepass(staticLightMeshes.filter(m=>structureMeshes.includes(m))); const practicalLighting=createDrainPracticalLighting');
   s=s.replace('fogMaterials.apply(camera);','depthPrepass.draw(renderer,camera);fogMaterials.apply(camera);');
   s=s.replace(' return {draw,drainJoeFootsteps:',' window.__depth={renderer,depthPrepass}; return {draw,drainJoeFootsteps:');
   return r.fulfill({contentType:'application/javascript',body:s});
  });
  await page.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__depth&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await page.click('#primary');await page.keyboard.press('Escape');
  for(const [name,x,y,yaw]of [['gallery',0,20,0],['keeper',12,14.6,Math.PI],['bunker',-20,70,Math.PI],['pump',-23,40,-Math.PI/2]]){
   const result=await page.evaluate(async({x,y,yaw})=>{
    const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=24;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch:-.12});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();
    const gl=__depth.renderer.getContext(),pixels=enabled=>{__depth.depthPrepass.setEnabled(enabled);advanceTime(0);const p=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
    const a=pixels(false),b=pixels(true);let changed=0,max=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)changed++;max=Math.max(max,d);}return {changed,max,stats:__depth.depthPrepass.stats(),graphics:JSON.parse(render_game_to_text()).graphics};
   },{x,y,yaw});views.push({name,...result});await page.screenshot({path:`${out}/${name}.png`});console.log(JSON.stringify({name,changed:result.changed,max:result.max,stats:result.stats}));
  }
  await quiet();await page.setViewportSize({width:480,height:300});
  const timing=await page.evaluate(async()=>{
   const r=__underGreen.run;Object.assign(r.player,{x:0,y:20,yaw:0});advanceTime(0);await __underGreen.whenPresented();const gl=__depth.renderer.getContext(),samples={off:[],on:[]};
   async function frame(on){__depth.depthPrepass.setEnabled(on);const start=performance.now();advanceTime(0);const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU timeout');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(f);return performance.now()-start;}
   for(let i=0;i<6;i++){await frame(false);await frame(true);}for(let i=0;i<24;i++)for(const on of i%2?[true,false]:[false,true])samples[on?'on':'off'].push(await frame(on));
   return Object.fromEntries(Object.entries(samples).map(([key,samples])=>{const s=[...samples].sort((a,b)=>a-b);return [key,{median:s[12],p95:s[22],samples}];}));
  });
  fs.writeFileSync(`${out}/report.json`,JSON.stringify({candidateOnly:true,views,timing,errors},null,2));console.log(JSON.stringify({timing,errors}));assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
