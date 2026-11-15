// Same-browser, alternating complete-world GPU passes at fixed resolution.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/atmosphere-return-20261107',b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],rows=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/__baseline-effects.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/before/pixel-effects.js','utf8')}));
 const scene=fs.readFileSync('web/scene-3d.js','utf8').replace('pixelEffects.update(frame,camera,parallax?.moonCoverage()||0);','window.__atmosFrame=frame;pixelEffects.update(frame,camera,parallax?.moonCoverage()||0);');
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:scene+'\nwindow.__atmosGpu=()=>({renderer,world,camera,parallax,sceneTarget,pixelEffects,SCALE,X_SCALE});'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__perf&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__perf,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:100,y:690});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  await p.evaluate(async()=>{const g=__atmosGpu(),m=await import('./__baseline-effects.js');window.__baselineFx=m.createPixelEffects(g.world,{software:true,scale:g.SCALE,xScale:g.X_SCALE,moon:g.world.children.find(o=>o.isDirectionalLight)});await g.renderer.compileAsync(g.world,g.camera);__baselineFx.root.visible=false;});
  for(const [name,x,y,yaw,pitch] of [['opening',0,65,0,0],['border',100,340,1.57,0],['pond',-63,187,0,-.33]]){
   await p.evaluate(async v=>{Object.assign(__perf.state.player,v);__perf.render();await RCScene3D.whenPresented();},{x,y,yaw,pitch});
   for(const mode of ['before','after','after','before']){
    const row=await p.evaluate(async({name,mode})=>{
     const g=__atmosGpu(),r=g.renderer,gl=r.getContext(),times=[],pixel=new Uint8Array(4),fx=mode==='before'?__baselineFx:g.pixelEffects;
     g.pixelEffects.root.visible=false;__baselineFx.root.visible=false;
     fx.update(__atmosFrame,g.camera,g.parallax?.moonCoverage()||0);fx.root.visible=true;
     g.sceneTarget.setSize(640,360);r.setRenderTarget(g.sceneTarget);
     for(let i=0;i<20;i++){await new Promise(requestAnimationFrame);const start=performance.now();r.autoClear=false;r.clear();r.render(g.parallax.scene,g.parallax.camera);r.clearDepth();r.render(g.world,g.camera);r.autoClear=true;gl.finish();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);if(i>=4)times.push(performance.now()-start);}
     times.sort((a,b)=>a-b);const result={name,mode,median:times[8],p95:times[15],draws:r.info.render.calls,triangles:r.info.render.triangles,effects:fx.stats()};__baselineFx.root.visible=false;g.pixelEffects.root.visible=true;return result;
    },{name,mode});rows.push(row);console.log(JSON.stringify({name,mode,median:row.median,p95:row.p95,draws:row.draws}));
   }
  }
  fs.writeFileSync(out+'/alternating-effects-cost.json',JSON.stringify({method:'Same browser; static full-world renders at 640x360, 4 warm-up + 16 synchronous GPU-complete samples per block. Before/after/after/before order. Diagnostic throughput, not real-play FPS.',rows,errors},null,2));if(errors.length)throw Error(errors.join('\n'));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
