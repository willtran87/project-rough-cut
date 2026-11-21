// GPU-completed frames at fixed resolution: views must draw without new buffers.
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const out='output/chase-foot-performance',visualOnly=process.argv.includes('--visual-only');const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers=0;const original=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...args){__buffers++;return original.apply(this,args);};});
 await p.route('**/parallax-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/parallax-scene.js','utf8').replace('if (!reducedMotion && !paused) motionTime += dt;','motionTime=0;')}));
 await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__profileWorld={scene,camera,renderer,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const views=[];
 for(const a of [['yard',-10,202,0,false,false],['range',-25,342,0,false,false],['finale',-24,760,0,false,false],['wet-mower',-29,443,-1.2,true,false],['runner-near',-24,744,Math.PI,false,true],['runner-foliage',-29,443,-1.2,false,true],...(visualOnly?Array.from({length:12},(_,i)=>['turn-'+i,-29+i*.4,443+i*.5,i*.5,false,i%2===0]):[])]){
 const result=await p.evaluate(async({a,visualOnly})=>{const[name,x,y,yaw,rear,foot]=a,{createRun}=await import('./back-nine-sim.js'),r=createRun(y>580?2:y>300?1:0);r.mode='driving';r.time=10;Object.assign(r.cart,{x,y,yaw,speed:8});Object.assign(r.joe,{x:x+3,y:y-14,speed:12});if(foot){const{leaveBrokenCart}=await import('./chase-player.js');r.cart.x=x+7;leaveBrokenCart(r);Object.assign(r.foot,{x,y,viewYaw:yaw,yaw,speed:6});r.time+=3;}
 const worlds=[__profileWorld],renderer=__profileWorld.renderer,gl=renderer.getContext();renderer.setSize(960,540,false);for(const w of worlds){w.resetCamera();w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.update(r,{rear,reducedMotion:true});}
 async function draw(w){const t=performance.now();w.update(r,{rear,reducedMotion:true});const updated=performance.now();w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(r=>setTimeout(r,2));gl.deleteSync(f);return {total:performance.now()-t,cpu:updated-t};}
 for(const w of worlds)for(let i=0;i<3;i++)await draw(w);const before=__buffers;await draw(worlds[0]);
 await draw(worlds[0]);return {name,buffers:__buffers-before,current:worlds[0].stats()};
 },{a,visualOnly});views.push(result);console.log(JSON.stringify({name:result.name,buffers:result.buffers}));await p.screenshot({path:out+'/'+result.name+'-1280.png'});assert.equal(result.buffers,0,result.name+': new buffers');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/'+(visualOnly?'visual-comparison':'comparison')+'.json',JSON.stringify({passed:true,views,errors},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
