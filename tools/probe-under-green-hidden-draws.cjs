const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out='output/under-green/visual-upgrade-local/pass51-profile';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--ignore-gpu-blocklist']}),rows=[],errors=[];try{
 const p=await b.newPage({viewport:{width:960,height:600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/under-green-scene.js',r=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');const marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));s=s.replace(marker,' window.__hiddenDraw={renderer,scene,camera,solidOcclusion};'+marker);return r.fulfill({contentType:'application/javascript',body:s});});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 await p.evaluate(async()=>{const T=await import('./vendor/three/three.module.js'),a=__hiddenDraw,render=a.renderer.renderBufferDirect.bind(a.renderer),bounds=new T.Box3();a.enabled=false;a.calls=[];
  a.renderer.renderBufferDirect=function(camera,scene,geometry,material,object,group){
   let eligible=false,hidden=false;
   if(object.isMesh&&!object.isSkinnedMesh&&!object.isInstancedMesh&&!object.morphTargetInfluences&&!material.transparent&&material.opacity===1&&material.depthWrite&&material.depthTest&&!material.alphaTest&&!material.alphaHash&&!material.alphaMap&&!material.displacementMap&&!material.clippingPlanes?.length&&material.blending===T.NormalBlending){
    if(!geometry.boundingBox)geometry.computeBoundingBox();bounds.copy(geometry.boundingBox).applyMatrix4(object.matrixWorld).expandByScalar(.002);
    eligible=Math.min(bounds.max.x-bounds.min.x,bounds.max.y-bounds.min.y,bounds.max.z-bounds.min.z)>=.1;hidden=eligible&&a.solidOcclusion.hidden(bounds);
   }
   a.calls.push({name:object.name||object.parent?.name||material.name||material.type,eligible,hidden,triangles:Math.min(geometry.drawRange.count,geometry.index?.count??geometry.attributes.position.count)/3});
   if(a.enabled&&hidden)return;return render(camera,scene,geometry,material,object,group);
  };
 });
 for(const [name,x,y,yaw,pitch]of [['gallery',0,19,0,.05],['entrance',0,8,0,0],['pump',-23.4,42,-1,.05],['range',12,35,Math.PI,.05],['keeper',12,19,Math.PI,.1]]){
  const row=await p.evaluate(async({name,x,y,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=26.3;r.joe.phase='absent';Object.assign(r.player,{x,y,yaw,pitch});__underGreen.run=r;__underGreen.clearInput();const a=__hiddenDraw,gl=a.renderer.getContext();
   function pixels(enabled){a.enabled=enabled;a.calls=[];advanceTime(0);const bytes=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return bytes;}
   pixels(false);const before=pixels(false),calls=[...a.calls],beforeStats=JSON.parse(render_game_to_text()).graphics;const after=pixels(true),afterStats=JSON.parse(render_game_to_text()).graphics;let changed=0,max=0;for(let i=0;i<before.length;i++)if(before[i]!==after[i]){changed++;max=Math.max(max,Math.abs(before[i]-after[i]));}
   const timings=[];for(const enabled of [false,true,true,false]){a.enabled=enabled;const samples=[];for(let n=0;n<16;n++){a.calls=[];const start=performance.now();advanceTime(0);const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU timeout');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(fence);if(n>=4)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);timings.push({enabled,median:samples[6],p95:samples[11]});}
   const groups={};for(const c of calls){const key=c.name;if(!groups[key])groups[key]={draws:0,hidden:0,triangles:0};groups[key].draws++;groups[key].hidden+=Number(c.hidden);groups[key].triangles+=c.triangles;}
   return {name,changed,max,draws:[beforeStats.draws,afterStats.draws],triangles:[beforeStats.triangles,afterStats.triangles],eligible:calls.filter(c=>c.eligible).length,hidden:calls.filter(c=>c.hidden).length,groups,timings};
  },{name,x,y,yaw,pitch});rows.push(row);fs.writeFileSync(out+'/report.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({name,changed:row.changed,draws:row.draws,hidden:row.hidden,timings:row.timings}));
 }
 assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
