const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const baseline=process.argv.includes('--baseline'),out='output/software-polish-20261107',b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(baseline?out+'/before/scene-3d.js':'web/scene-3d.js','utf8')+'\nwindow.__gpu=()=>({THREE,renderer,world,camera,parallax,sceneTarget,staticRoot,dynamicRoot,pixelWorld});'}));
 if(baseline)await p.route('**/render-preparation.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/before/render-preparation.js','utf8')}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__perf&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__perf,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:690});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await p.evaluate(async()=>{__perf.render();await RCScene3D.whenPresented();});
  const rows=[],uploads=[];
  for(const [view,x,y,yaw,pitch] of [['opening',0,65,0,0],['border',100,340,1.57,0],['pond',-63,187,0,-.33]]){
    const upload=await p.evaluate(async v=>{
      const gl=__gpu().renderer.getContext(),original=gl.bufferData;let bytes=0,calls=0;
      gl.bufferData=function(target,data,...args){bytes+=typeof data==='number'?data:data?.byteLength||0;calls++;return original.call(this,target,data,...args);};
      try{Object.assign(__perf.state.player,v);__perf.state.hole.elapsed++;__perf.render();await RCScene3D.whenPresented();return {calls,bytes,preparation:RCScene3D.stats().preparation};}finally{gl.bufferData=original;}
    },{x,y,yaw,pitch});uploads.push({view,...upload});if(!baseline){assert(upload.preparation.staticBuffers>100);assert(upload.bytes<65536,'Visiting a distant view must not allocate large static mesh buffers');}
    for(const width of (baseline?[]:[960,640,640,960])){
      const row=await p.evaluate(async width=>{
        const {renderer:r,world,camera,parallax,sceneTarget}=__gpu(),gl=r.getContext(),times=[],pixel=new Uint8Array(4);
        sceneTarget.setSize(width,width*9/16);r.setRenderTarget(sceneTarget);
        for(let i=0;i<20;i++){
          await new Promise(requestAnimationFrame);const start=performance.now();
          r.autoClear=false;r.clear();r.render(parallax.scene,parallax.camera);r.clearDepth();r.render(world,camera);r.autoClear=true;
          gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
          if(i>=4)times.push(performance.now()-start);
        }
        times.sort((a,b)=>a-b);return {width,median:times[8],p95:times[15],draws:r.info.render.calls};
      },width);rows.push({view,...row});console.log(JSON.stringify({view,...row}));
    }
  }
  fs.writeFileSync(out+(baseline?'/buffer-baseline.json':'/resolution-comparison.json'),JSON.stringify({rows,uploads,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
