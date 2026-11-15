// Compare added scenery with the saved pre-change course. Both versions use
// the corrected initial cart bounds, so missing body meshes cannot skew cost.
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.argv.includes('--on-foot')?'output/back-nine-on-foot':'output/back-nine-route-choices',results=[];
 for(const baseline of (process.argv.includes('--quick')?[false]:[true,false,false,true])){
  const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
   const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
   for(const file of fs.readdirSync(out+'/baseline')){
    if(!file.endsWith('.js'))continue;
    let source=fs.readFileSync((baseline?out+'/baseline/':'web/')+file,'utf8');
    if(file==='back-nine-course.js'&&baseline)source+='\nCOURSE.decisions=[]; export const mowerLineClear=(a,b)=>lineClear(a,b,1.85);';
    if(file==='back-nine-scene.js'){
     source=source.replace('return {scene,camera,update,draw()', 'return window.__profileWorld={scene,camera,renderer,update,draw()');
     if(process.argv.includes('--no-new-paths'))source=source.replace('COURSE.paths.entries()', 'COURSE.paths.slice(0,4).entries()');
    }
    if(file==='course-features.js'&&process.argv.includes('--no-new-props'))source=source.replace('COURSE.features.entries()', 'COURSE.features.slice(0,9).entries()');
    await p.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:source}));
   }
   const start=Date.now();await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});const readyMs=Date.now()-start;
   await p.click('#primary');await p.evaluate(()=>advanceTime(0));const views=[];
   for(const [name,x,y,yaw,rear,foot]of [['yard',-10,202,0,false],['range',-25,342,0,false],['finale',-24,760,0,false],['wet-mower',-29,443,-1.2,true],...(process.argv.includes('--on-foot')?[['runner-near',-24,744,Math.PI,false,true],['runner-foliage',-29,443,-1.2,false,true]]:[])]){
    views.push(await p.evaluate(async({name,x,y,yaw,rear,foot})=>{
     const {createRun}=await import('./back-nine-sim.js'),r=createRun(y>580?2:y>300?1:0),w=__profileWorld,gl=w.renderer.getContext();r.mode='driving';r.time=10;Object.assign(r.cart,{x,y,yaw,speed:8});Object.assign(r.joe,{x:x+3,y:y-14,speed:12});
     if(foot){const {leaveBrokenCart}=await import('./chase-player.js');r.cart.x=x+7;leaveBrokenCart(r);Object.assign(r.foot,{x,y,viewYaw:yaw,yaw,speed:6});r.time+=3;}
     w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.resetCamera();
     async function frame(){const t=performance.now();w.update(r,{rear,reducedMotion:true});w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);return performance.now()-t;}
     for(let i=0;i<4;i++)await frame();const samples=[];for(let i=0;i<30;i++)samples.push(await frame());samples.sort((a,b)=>a-b);const s=w.stats();return {name,median:samples[15],p95:samples[28],max:samples[29],draws:s.draws,triangles:s.triangles,programs:s.programs,textures:s.textures,staticBatches:s.staticBatches,preparation:s.preparation};
    },{name,x,y,yaw,rear,foot}));
   }
   assert.deepEqual(errors,[]);results.push({baseline,readyMs,views});console.log(JSON.stringify(results.at(-1)));
  }finally{await b.close();}
 }
 fs.writeFileSync(out+'/'+(process.argv.includes('--quick')?'isolate'+process.argv.slice(2).join(''):'performance')+'.json',JSON.stringify({resolution:[960,540],software:true,initialBoundsFixedInBoth:true,results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
