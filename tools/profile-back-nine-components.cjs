const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/render-isolation',b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__isolation={scene,camera,renderer,mower,rider,backdrop,mowerLight,update,draw()')}));
await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
const results=[];
for(const a of [['foliage',-29,443,-1.2,true],['close-mower',0,60,0,true],['clubhouse',-14,758,-.24,false]]){
const row=await p.evaluate(async a=>{const[name,x,y,yaw,rear]=a,{createRun}=await import('./back-nine-sim.js'),r=createRun(),w=__isolation,gl=w.renderer.getContext(),needles=[];
w.scene.traverse(o=>{if(o.isInstancedMesh&&o.material?.map?.image?.width===1216)needles.push(o);});w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();r.mode='driving';r.cart.health=15;
const modes=['full','no-needles','no-mower','no-rider','frozen-depth'],samples=modes.map(()=>[]),stats=modes.map(()=>null);
async function frame(mode,n){r.time=10+n/30;Object.assign(r.cart,{x,y:y+n*8/30,yaw,speed:8});Object.assign(r.joe,{x:x+2,y:r.cart.y-12,yaw:0,speed:12});const start=performance.now();w.update(r,{rear});const update=performance.now()-start;
for(const mesh of needles)mesh.visible=mode!=='no-needles';w.mower.root.visible=mode==='no-mower'?false:w.mower.root.visible;w.rider.visible=mode!=='no-rider';if(mode==='frozen-depth')w.mowerLight.shadow.needsUpdate=false;
w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);return {total:performance.now()-start,update};}
for(const mode of [...modes,...modes.toReversed()]){w.resetCamera();for(let n=0;n<4;n++)await frame(mode,n);const i=modes.indexOf(mode);for(let n=0;n<24;n++)samples[i].push(await frame(mode,n));stats[i]=w.stats();}
return {name,needleBatches:needles.length,modes:modes.map((mode,i)=>{const t=samples[i].map(v=>v.total).sort((a,b)=>a-b),cpu=samples[i].map(v=>v.update).sort((a,b)=>a-b);return {mode,median:t[24],p95:t[45],max:t[47],cpuP95:cpu[45],draws:stats[i].draws,triangles:stats[i].triangles};})};},a);results.push(row);console.log(JSON.stringify(row));fs.writeFileSync(out+'/components.json',JSON.stringify({results,errors},null,2));}
assert.deepEqual(errors,[]);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
