const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/software-rendering',b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__gpu=()=>({THREE,renderer,world,camera,parallax,sceneTarget,staticRoot,dynamicRoot});'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__perf={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__perf&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__perf,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:100,y:690});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await p.evaluate(()=>__perf.render());
  const visible=await p.evaluate(()=>{const {renderer:r,world}=__gpu();r.setRenderTarget(null);r.render(world,__gpu().camera);const list=r.renderLists.get(world,0);return [...list.opaque,...list.transparent].map(e=>({triangles:(e.geometry.index?.count||e.geometry.attributes.position.count)/3,vertices:e.geometry.attributes.position.count,shader:e.material.customProgramCacheKey(),center:e.geometry.boundingSphere?.center.toArray(),radius:e.geometry.boundingSphere?.radius})).sort((a,b)=>b.triangles-a.triangles);});fs.writeFileSync(out+'/visible-geometry.json',JSON.stringify(visible,null,2));
  const rows=[];
  for(const mode of ['empty','background','world','flat-world','full','half-resolution']){
   const row=await p.evaluate(async mode=>{const {THREE,renderer:r,world,camera,parallax,sceneTarget}=__gpu(),gl=r.getContext(),data=new Uint8Array(4),flat=new THREE.MeshBasicMaterial({color:0x448866}),times=[],intervals=[];let last;
    if(mode==='half-resolution')RCSpatialControls.set('resolution',.5);
    for(let i=0;i<16;i++){
     const now=await new Promise(requestAnimationFrame);if(last)intervals.push(now-last);last=now;
     const start=performance.now();
     if(mode==='full'||mode==='half-resolution'){__perf.state.hole.elapsed+=1/60;__perf.render();}
     else {r.setRenderTarget(null);r.clear();if(mode==='background')r.render(parallax.scene,parallax.camera);if(mode==='world'||mode==='flat-world'){world.overrideMaterial=mode==='flat-world'?flat:null;r.render(world,camera);world.overrideMaterial=null;}}
     gl.finish();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,data);times.push(performance.now()-start);
    }
    flat.dispose();return {mode,renderMs:times,intervals,draws:r.info.render.calls,triangles:r.info.render.triangles};
   },mode);rows.push(row);console.log(JSON.stringify({mode,median:row.renderMs.slice(4).sort((a,b)=>a-b)[6],max:Math.max(...row.renderMs),draws:row.draws,triangles:row.triangles}));
  }
  fs.writeFileSync(out+'/isolation.json',JSON.stringify({rows,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
