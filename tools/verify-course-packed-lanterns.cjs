const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
process.env.TEMP=process.env.TMP='F:/CodexArtifacts/project-rough-cut/browser-temp';
(async()=>{
 const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/level-one-packed-lanterns/'+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],comparisons=[],budgets=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__packedGame={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('(softwareRenderer?createPackedLanternLightField:createCourseLanternLightField)(glowAnchors)','createCourseLanternLightField(glowAnchors)')+'\nwindow.__packedScene=()=>({world,renderer,camera,glowAnchors,practicalLighting,groundLighting});'}));
 const draw=()=>page.evaluate(async()=>{__packedGame.render();await RCScene3D.whenPresented();});
 const view=async(x,y,yaw,pitch)=>{await page.evaluate(v=>Object.assign(__packedGame.state.player,v),{x,y,yaw,pitch});await draw();};
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__packedGame);await page.locator('#game').click();
  await page.evaluate(()=>{const s=__packedGame.state;__packedGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,clearNavigation:false,guidedHints:false,apparitions:false,reducedMotion:true,effectsDensity:0});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});
  await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});await draw();
  const setup=await page.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{createCourseLanternLightField}=await import('./course-lantern-light-field-packed.js'),{stableLightMaterialSort}=await import('./local-light-culling.js'),r=__packedScene();
   const field=createCourseLanternLightField(r.glowAnchors),clones=new Map(),rt=new T.WebGLRenderTarget(960,540),pixel=new Uint8Array(4);let saved=[];
   function variant(m){
    if(!m.customProgramCacheKey().includes('course-lantern-field-v2'))return m;
    if(!clones.has(m)){const c=m.clone(),compile=m.onBeforeCompile,key=m.customProgramCacheKey();c.userData.localLightSourceId=m.userData.localLightSourceId??m.id;
     c.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);const start=shader.fragmentShader.indexOf('vec3 courseLampWorld='),end=shader.fragmentShader.indexOf('#include <lights_fragment_end>',start);if(start<0||end<start)throw Error('Expected indexed lantern field');shader.fragmentShader=shader.fragmentShader.slice(0,start)+shader.fragmentShader.slice(end);};
     c.customProgramCacheKey=()=>key+'-packed-comparison';field.apply(c);clones.set(m,c);
    }return clones.get(m);
   }
   const restore=()=>{for(const [o,m]of saved)o.material=m;saved=[];};
   const select=packed=>{restore();if(packed)r.world.traverse(o=>{if(!o.material||o.userData.lanternGround)return;const original=o.material,next=Array.isArray(original)?original.map(variant):variant(original);if(next!==original){saved.push([o,original]);o.material=next;}});};
   r.renderer.setOpaqueSort(stableLightMaterialSort);
   const capture=()=>{r.renderer.clear();r.renderer.render(r.world,r.camera);const a=new Uint8Array(960*540*4);r.renderer.readRenderTargetPixels(rt,0,0,960,540,a);return a;};
   window.__packedTrial={T,r,field,clones,rt,pixel,select,capture,restore};return {original:r.practicalLighting.stats(),candidate:field.stats(),lanterns:RCScene3D.stats().pathLanterns.pairs.length*2};
  });assert.equal(setup.lanterns,28);
  for(const [name,x,y,yaw,pitch]of [['opening',0,40,0,0],['audit',70,148,1.57,.25],['woodland',95,120,1.57,.2],['pond',-63,187,0,-.1],['service',-80,210,-1.3,0],['green',0,463,0,0],['range',0,550,0,0],['exit',-18,680,0,.1]]){
   await view(x,y,yaw,pitch);
   for(const strength of [1,0,.37]){
    const result=await page.evaluate(strength=>{const t=__packedTrial,{r}=t,old=r.renderer.getRenderTarget(),powers=r.glowAnchors.map(a=>a.intensity);r.renderer.setRenderTarget(t.rt);
     try{r.glowAnchors.forEach((a,i)=>a.intensity=powers[i]*strength);r.practicalLighting.update();r.groundLighting?.update();t.field.update();t.select(false);const original=t.capture();t.select(true);const candidate=t.capture();let max=0,changed=0,overOne=0;for(let i=0;i<original.length;i++){const d=Math.abs(original[i]-candidate[i]);max=Math.max(max,d);if(d)changed++;if(d>1)overOne++;}return {max,changed,overOne,clones:t.clones.size,draws:r.renderer.info.render.calls,triangles:r.renderer.info.render.triangles};}
     finally{t.restore();r.glowAnchors.forEach((a,i)=>a.intensity=powers[i]);r.practicalLighting.update();r.groundLighting?.update();t.field.update();r.renderer.setRenderTarget(old);}
    },strength);comparisons.push({name,strength,...result});assert(result.max<=2,JSON.stringify({name,strength,...result}));
   }
  }
  for(const [name,x,y,yaw,pitch]of [['opening',0,40,0,0],['woodland',95,120,1.57,.2],['range',0,550,0,0]]){
   await view(x,y,yaw,pitch);
   const rounds=await page.evaluate(()=>{const t=__packedTrial,{r}=t,old=r.renderer.getRenderTarget(),powers=r.glowAnchors.map(a=>a.intensity),rounds=[];r.renderer.setRenderTarget(t.rt);
    try{for(const packed of [false,true,true,false,false,true]){t.select(packed);const times=[];for(let i=0;i<28;i++){
      // Include changing-power field updates and the packed texture upload.
      const start=performance.now();r.glowAnchors.forEach((a,j)=>a.intensity=powers[j]*(.85+.1*Math.sin(i*.7+j)));(packed?t.field:r.practicalLighting).update();r.groundLighting?.update();r.renderer.clear();r.renderer.render(r.world,r.camera);r.renderer.readRenderTargetPixels(t.rt,480,270,1,1,t.pixel);if(i>=8)times.push(performance.now()-start);
     }times.sort((a,b)=>a-b);rounds.push({packed,median:times[10],p95:times[18],samples:times,draws:r.renderer.info.render.calls,triangles:r.renderer.info.render.triangles});}return rounds;}
    finally{t.restore();r.glowAnchors.forEach((a,i)=>a.intensity=powers[i]);r.practicalLighting.update();r.groundLighting?.update();t.field.update();r.renderer.setRenderTarget(old);}
   });budgets.push({name,rounds});
  }
  const cleanup=await page.evaluate(()=>{const t=__packedTrial;t.restore();let disposed=0;for(const texture of t.field.textures)texture.addEventListener('dispose',()=>disposed++);const end=t.field.stats();t.field.dispose();t.field.dispose();for(const m of t.clones.values())m.dispose();t.rt.dispose();return {disposed,end};});assert.equal(cleanup.disposed,1);assert.deepEqual(errors,[]);
  const report={passed:true,software,scope:'Same world/camera and stable material ordering;960x540 direct world renders, preserved ground specialization, frozen shadows/time, varying source power, synchronous pixel readback. Excludes backdrop/compositor and simulation.',setup,comparisons,budgets,cleanup,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({passed:true,software,maxDelta:Math.max(...comparisons.map(c=>c.max)),budgets:budgets.map(v=>({name:v.name,rounds:v.rounds.map(({samples,...r})=>r)})),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
