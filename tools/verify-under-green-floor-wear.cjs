const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade-local/pass53-ground/${software?'software':'hardware'}`;
const fixtures=[['entrance-floor',0,8,0,-.5],['wall-base',3.8,10,1,-.55],['gallery-floor',0,28,0,-.55],['bunker-floor',-30,65,Math.PI,-.48],['range-floor',21,30,Math.PI,-.5],['gallery',0,8,0,.1],['crossing',0,19,0,-.05],['bunker',-29.5,65,Math.PI,.15],['pump',-23.4,42,-1,.05],['pump-return',-15,46,Math.PI/2,.05],['range',12,35,Math.PI,.05],['keeper',12,13.5,-2.4,.05],['door',0,44,Math.PI,0]];
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],audits=[],errors=[];try{
 for(const before of [true,false]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/under-green-ground-finish.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(before?'output/under-green/visual-upgrade-local/pass53-source/under-green-ground-finish-before.js':'web/under-green-ground-finish.js','utf8').replace('return {texture,wallDeposits,drainAprons','window.__deposit=texture; return {texture,wallDeposits,drainAprons')}));
  await p.route('**/under-green-scene.js',route=>{let s=fs.readFileSync(before?'output/under-green/visual-upgrade-local/pass53-source/under-green-scene-before.js':'web/under-green-scene.js','utf8');const marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));return route.fulfill({contentType:'application/javascript',body:s.replace(marker,' window.__hardware={scene,renderer,camera,materials,machinerySurfaces};'+marker)});});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  async function place(f,elapsed=0){await p.evaluate(async({f,elapsed})=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js');const r=createRun();if(solid({x:f[1],y:f[2]},.3))throw Error('Solid fixture '+f[0]);r.mode='playing';r.time=26.3;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,elapsed});}
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:s.graphics});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
  for(const f of fixtures){await place(f);await shot(f[0]);}
  const audit=await p.evaluate(async()=>{
   const names=['floor','walkway'],{scene,materials,machinerySurfaces}=__hardware;
   const hash=a=>{let h=2166136261;const b=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(const v of b)h=Math.imul(h^v,16777619);return h>>>0;};
   const meshes=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&names.includes(o.name)){meshes.push({name:o.name,position:hash(o.geometry.attributes.position.array),index:o.geometry.index?hash(o.geometry.index.array):null,matrix:o.matrixWorld.elements});}});
   const T=await import('./vendor/three/three.module.js'),texture=__deposit,renderer=__hardware.renderer;
   const target=new T.WebGLRenderTarget(1024,1024,{depthBuffer:false,stencilBuffer:false}),probe=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1),geometry=new T.PlaneGeometry(2,2);
   const material=new T.ShaderMaterial({uniforms:{source:{value:texture}},vertexShader:'varying vec2 uvProbe; void main(){uvProbe=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D source;varying vec2 uvProbe;void main(){gl_FragColor=vec4(texture2D(source,uvProbe).rgb,1.);}'});probe.add(new T.Mesh(geometry,material));
   renderer.setRenderTarget(target);renderer.render(probe,camera);const gpu=new Uint8Array(1024*1024*4);renderer.readRenderTargetPixels(target,0,0,1024,1024,gpu);renderer.setRenderTarget(null);
   const channels=Array.from({length:3},(_,c)=>{let h=2166136261;for(let i=c;i<gpu.length;i+=4)h=Math.imul(h^gpu[i],16777619);return h>>>0;});
   const raw=texture.isDataTexture?texture.image.data:texture.image.getContext('2d').getImageData(0,0,1024,1024).data;
   const cpuChannels=Array.from({length:3},(_,c)=>{let h=2166136261;for(let i=c;i<raw.length;i+=4)h=Math.imul(h^raw[i],16777619);return h>>>0;});
   let minAlpha=255,maxAlpha=0,zeroAlphaWithDeposits=0;for(let i=0;i<raw.length;i+=4){minAlpha=Math.min(minAlpha,raw[i+3]);maxAlpha=Math.max(maxAlpha,raw[i+3]);if(raw[i+3]===0&&(raw[i]||raw[i+1]||raw[i+2]))zeroAlphaWithDeposits++;}
   target.dispose();geometry.dispose();material.dispose();
   return {meshes,channels,cpuChannels,minAlpha,maxAlpha,zeroAlphaWithDeposits,materials:[],ground:JSON.parse(render_game_to_text()).graphics.districtDetails.groundFinish};
  });audits.push(audit);assert(audit.meshes.length>2);
  if(!before){assert.equal(audit.minAlpha,0);assert(audit.maxAlpha<=105&&audit.maxAlpha>80);assert(audit.zeroAlphaWithDeposits>10000);assert.equal(audit.ground.wear.paths,9);assert.deepEqual(audit.ground.slabWidthRange,[1.24,1.76]);
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const f of [fixtures[0],fixtures[3],fixtures[4]]){await place(f);await shot('responsive-'+f[0]);}}
   await p.setViewportSize({width:2560,height:1600});await place(fixtures[1],49);await shot('flood');
   await place(fixtures[0]);const initial=await p.screenshot({type:'png'});for(let i=0;i<8;i++)await p.evaluate(async()=>{__underGreen.run.player.yaw+=.2;advanceTime(0);await __underGreen.whenPresented();});await place(fixtures[0]);assert(initial.equals(await p.screenshot({type:'png'})),'Material moves with camera');
   await p.keyboard.down('c');await p.evaluate(()=>advanceTime(250));assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).player.eyeHeight<1.3);await shot('crouch');await p.keyboard.up('c');await p.evaluate(()=>advanceTime(300));
   await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');await p.evaluate(()=>advanceTime(300));
   await p.keyboard.press('Escape');await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[3]);await shot('reduced');
  }
  await p.close();
 }
 assert.deepEqual(audits[0].meshes,audits[1].meshes,'Ground geometry changed');assert.deepEqual(audits[0].channels,audits[1].channels,'GPU deposit channels changed');assert.deepEqual(audits[0].cpuChannels,audits[1].cpuChannels,'CPU deposit channels changed');
 for(const a of rows.filter(r=>r.before)){const z=rows.find(r=>!r.before&&r.name===a.name);assert.deepEqual(a.player,z.player);assert.deepEqual(a.graphics.resolution,z.graphics.resolution);for(const k of ['draws','triangles','programs'])assert.equal(a.graphics[k],z.graphics[k],k+' changed');assert(z.graphics.textures<=a.graphics.textures,'Extra textures');}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,rows,audits,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,groundMeshes:audits[0].meshes.length,resources:rows.filter(r=>r.name==='pump').map(r=>({before:r.before,textures:r.graphics.textures,draws:r.graphics.draws,programs:r.graphics.programs}))}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
