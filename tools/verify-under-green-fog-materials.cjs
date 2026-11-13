const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/under-green/visual-upgrade/fog-materials/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.route('**/under-green-scene.js',route=>{
   let s=fs.readFileSync('web/under-green-scene.js','utf8');
   s=s.replace('function draw(r,prefs,manual=false){','function draw(r,prefs,manual=false){prefs={...prefs,fov:window.__fogFov??prefs.fov};');
   s=s.replace(' return {draw,drainJoeFootsteps:',' window.__fogAudit={renderer,scene,camera,fogMaterials,structureMeshes}; return {draw,drainJoeFootsteps:');
   return route.fulfill({contentType:'application/javascript',body:s});
  });
  await page.goto('http://127.0.0.1:4187/under-green.html?test');await page.waitForFunction(()=>window.__fogAudit&&window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});
  await page.click('#primary');await page.keyboard.press('Escape');
  const fixtures=[{name:'gallery',x:0,y:12,yaw:0},{name:'bunker',x:-20,y:70,yaw:Math.PI},{name:'pump',x:-20,y:40,yaw:-Math.PI/2},{name:'keeper',x:12,y:23,yaw:Math.PI},{name:'flood',x:12,y:23,yaw:Math.PI,elapsed:49},{name:'range',x:16,y:34,yaw:0}];
  async function place(f){await page.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=90;r.elapsed=f.elapsed??0;r.bypass=true;r.bypassAt=20;r.lessonCrossed=true;r.joe.phase='absent';Object.assign(r.player,{pitch:0,...f});__underGreen.run=r;__underGreen.clearInput();window.__fogFov=f.fov??58;advanceTime(0);await __underGreen.whenPresented();},f);}
  async function compare(){return page.evaluate(()=>{
   const {renderer,fogMaterials,structureMeshes}=__fogAudit,gl=renderer.getContext(),originals=structureMeshes.map(m=>m.material);
   const pixels=enabled=>{fogMaterials.setEnabled(enabled);advanceTime(0);const p=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
   const candidate=pixels(true),stats=fogMaterials.stats(),reference=pixels(false);let changed=0,max=0;for(let i=0;i<candidate.length;i++){const d=Math.abs(candidate[i]-reference[i]);if(d)changed++;max=Math.max(max,d);}fogMaterials.setEnabled(true);advanceTime(0);
   if(structureMeshes.some((m,i)=>m.material!==originals[i]))throw Error('Material substitution leaked outside render');
   return {changed,max,channels:candidate.length,stats,resolution:[gl.drawingBufferWidth,gl.drawingBufferHeight]};
  });}
  for(const f of fixtures){
   await place(f);const parity=await compare();assert.equal(parity.max,0,JSON.stringify({f,parity}));views.push({name:f.name,...parity});await page.screenshot({path:`${out}/${f.name}-2560.png`});
   console.log(JSON.stringify({name:f.name,...parity}));
  }
  await page.setViewportSize({width:960,height:600});
  for(const f of fixtures)for(const variant of [{name:'rear',rearAngle:Math.PI},{name:'wide-crouch',fov:90,eyeHeight:1.05,pitch:-.35},{name:'narrow-up',fov:50,pitch:.5}]){await place({...f,...variant});const parity=await compare();assert.equal(parity.max,0,JSON.stringify({f,variant,parity}));views.push({name:f.name+'-'+variant.name,...parity});}
  // Paired alternating completed-frame samples at identical resolution/state.
  await place(fixtures[0]);
  const timing=await page.evaluate(async()=>{
   const gl=__fogAudit.renderer.getContext(),samples={candidate:[],reference:[]};
   async function frame(enabled){__fogAudit.fogMaterials.setEnabled(enabled);const start=performance.now();advanceTime(0);const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(sync,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU timeout');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(sync);return performance.now()-start;}
   for(let i=0;i<6;i++){await frame(false);await frame(true);}for(let i=0;i<24;i++)for(const enabled of(i%2?[true,false]:[false,true]))samples[enabled?'candidate':'reference'].push(await frame(enabled));
   __fogAudit.fogMaterials.setEnabled(true);advanceTime(0);return Object.fromEntries(Object.entries(samples).map(([key,values])=>{const sorted=[...values].sort((a,b)=>a-b);return [key,{samples:values,median:sorted[12],p95:sorted[22]}];}));
  });
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){await page.setViewportSize({width,height});await place(fixtures[0]);const parity=await compare();assert.equal(parity.max,0);views.push({name:'gallery-'+width,...parity});await page.screenshot({path:`${out}/gallery-${width}.png`});}
  assert(views.some(v=>v.stats.replaced>0));assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,views,timing,errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length,timing,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
