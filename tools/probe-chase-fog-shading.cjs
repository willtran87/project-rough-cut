const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/back-nine-experience/fog-shading-probe';fs.mkdirSync(out,{recursive:true});
 const original=fs.readFileSync('web/back-nine-scene.js','utf8'),expose=s=>s.replace('return {scene,camera,update,draw()','return window.__fogWorld={scene,camera,renderer,mowerLight,update,draw()');
 const inject=`
 for(const material of shadowMaterials){
  if(!material.isMeshLambertMaterial||material.transparent||material.dithering)continue;
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);
   const marker=material.alphaTest>0||material.alphaHash?'#include <alphahash_fragment>':'#include <logdepthbuf_fragment>';
   shader.fragmentShader=shader.fragmentShader.replace(marker,marker+'\\n#if defined(USE_FOG) && !defined(FOG_EXP2)\\nif(vFogDepth>=fogFar){gl_FragColor=vec4(fogColor,1.0);return;}\\n#endif\\n');
  };
  material.customProgramCacheKey=()=>key+'-fully-fogged-probe';
 }
 `;
 assert(original.includes(' const programsReady='));const candidate=original.replace(' const programsReady=',inject+' const programsReady=');
 if(!fs.existsSync(out+'/baseline-scene.js'))fs.writeFileSync(out+'/baseline-scene.js',original);fs.writeFileSync(out+'/candidate-scene.js',candidate);
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const pages=[],errors=[],results=[];
  for(let k=0;k<2;k++){
   const p=await b.newPage({viewport:{width:1280,height:720}});pages.push(p);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
   await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:expose(k?candidate:original)}));
   await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
   await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');window.__fogRun=createRun(1,0,37161);__fogRun.mode='driving';__fogRun.departure.phase='finished';__fogRun.grace=0;__fogRun.cart.health=15;__fogWorld.renderer.setSize(960,540,false);__fogWorld.camera.aspect=16/9;__fogWorld.camera.updateProjectionMatrix();});console.log('ready',k);
  }
  for(const view of [['first-pad',-1.9,299,0,false],['second-pad',-1.9,579,0,false],['wet-lane',24,235,.2,true],['foliage',-29,443,-1.2,true],['mower',-18,130,.9,true],['garage',-23,790,-.7,false],['open',0,70,0,true]]){
   const samples=[[],[]],pixels=[[],[]];let counts=[];
   for(let n=-8;n<48;n++)for(const k of n%2?[1,0]:[0,1]){
    const row=await pages[k].evaluate(async({view,n})=>{const[name,x,y,yaw,rear]=view,w=__fogWorld,r=__fogRun,gl=w.renderer.getContext();r.time=20+(n+8)/30;Object.assign(r.cart,{x,y:y+(n+8)*.08,yaw,speed:2.4});Object.assign(r.joe,{x:x+2,y:r.cart.y-12,yaw:0,speed:12});w.resetCamera();w.update(r,{rear});
     const start=performance.now();w.mowerLight.shadow.needsUpdate=true;w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(fence);const ms=performance.now()-start;let hash=null;
     if(n===0||n===23||n===47){const bytes=new Uint8Array(960*540*4);gl.readPixels(0,0,960,540,gl.RGBA,gl.UNSIGNED_BYTE,bytes);hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');}
     const s=w.stats();return{ms,hash,counts:{draws:s.draws,triangles:s.triangles,programs:s.programs,textures:s.textures}};
    },{view,n});
    if(n>=0)samples[k].push(row.ms);if(row.hash)pixels[k].push(row.hash);counts[k]=row.counts;
   }
   const result={name:view[0],exact:JSON.stringify(pixels[0])===JSON.stringify(pixels[1]),pixels,counts,timings:samples.map((rows,k)=>{rows.sort((a,b)=>a-b);return{kind:k?'fully-fogged-early-return':'baseline',median:rows[24],p95:rows[45],max:rows[47]};})};results.push(result);console.log(JSON.stringify(result));await pages[1].screenshot({path:`${out}/${view[0]}.png`});fs.writeFileSync(out+'/software.json',JSON.stringify({results,errors},null,2));
  }
  assert.deepEqual(errors,[]);assert(results.every(r=>r.exact),'Fogged pixels must remain identical');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
