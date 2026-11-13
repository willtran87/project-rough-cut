const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/software-polish-20261107',b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__gpu=()=>({THREE,renderer,world,camera,parallax,sceneTarget,staticRoot,dynamicRoot,pixelWorld});'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__perf&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__perf,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:690});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await p.evaluate(async()=>{__perf.render();await RCScene3D.whenPresented();});
  const rows=[];
  for(const mode of ['full','no-ground','no-transparent','no-needles','no-static','flat','low-resolution','front-sort','full']){
   const row=await p.evaluate(async mode=>{
    const {THREE,renderer:r,world,camera,parallax,sceneTarget,staticRoot}=__gpu(),gl=r.getContext(),hidden=[],flat=new THREE.MeshBasicMaterial({color:0x426053}),times=[];
    if(mode==='no-static'){hidden.push(staticRoot);staticRoot.visible=false;}
    world.traverse(o=>{if(!o.isMesh||!o.visible)return;const key=o.material.customProgramCacheKey?.()||'';
     if((mode==='no-ground'&&key.includes('source-turf'))||(mode==='no-transparent'&&o.material.transparent)||(mode==='no-needles'&&(key.includes('needle')||o.material.alphaTest>.1))){hidden.push(o);o.visible=false;}
    });
    if(mode==='flat')world.overrideMaterial=flat;if(mode==='front-sort')r.setOpaqueSort((a,b)=>a.groupOrder-b.groupOrder||a.renderOrder-b.renderOrder||a.z-b.z||a.material.id-b.material.id||a.id-b.id);
    if(mode==='low-resolution')sceneTarget.setSize(480,270);
    r.setRenderTarget(sceneTarget);
    for(let i=0;i<16;i++){await new Promise(requestAnimationFrame);const start=performance.now();r.autoClear=false;r.clear();r.render(parallax.scene,parallax.camera);r.clearDepth();r.render(world,camera);r.autoClear=true;gl.finish();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4));if(i>=4)times.push(performance.now()-start);}
    const draws=r.info.render.calls;times.sort((a,b)=>a-b);for(const o of hidden)o.visible=true;world.overrideMaterial=null;r.setOpaqueSort(null);flat.dispose();if(mode==='low-resolution')sceneTarget.setSize(960,540);
    return {mode,median:times[6],p95:times[11],draws};
   },mode);rows.push(row);console.log(JSON.stringify(row));
  }
  fs.writeFileSync(out+'/isolation.json',JSON.stringify({rows,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
