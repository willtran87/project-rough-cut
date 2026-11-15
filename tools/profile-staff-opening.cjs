const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-experience/staff-natural',b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],rows=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route(/\/back-nine-scene\.js(?:\?.*)?$/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__staffWorld={scene,camera,renderer,mowerLight,update,draw()')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 for(const name of ['departure','western-turn','after-look-away']){
  const row=await p.evaluate(async name=>{const{createRun,updateRun}=await import('./back-nine-sim.js'),r=createRun(),w=__staffWorld,gl=w.renderer.getContext();r.mode='driving';w.resetCamera();w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();w.update(r,{});
   const ticks=name==='departure'?42:name==='western-turn'?180:120;
   for(let i=0;i<ticks;i++){updateRun(r,{throttle:1,steer:name==='western-turn'&&i>=75&&i<93?-1:0},1/30);w.update(r,{rear:name==='after-look-away'&&i>=75});}
   const samples=[[],[]],counts=[[],[]];let visibleFrames=0;
   for(let i=-8;i<64;i++){
    updateRun(r,{throttle:name==='departure'?1:0},1/30);w.update(r,{});const f=w.scene.getObjectByName('UnaccountedGroundskeeper'),visible=!!f?.visible;if(i>=0&&visible)visibleFrames++;
    for(const k of i%2?[1,0]:[0,1]){if(f)f.visible=visible&&!!k;w.mowerLight.shadow.needsUpdate=true;const start=performance.now();w.draw();const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(fence);if(i>=0){samples[k].push(performance.now()-start);counts[k].push(w.stats().draws);}}
    if(f)f.visible=visible;
   }
   const stats=samples.map((s,i)=>{s.sort((a,b)=>a-b);return{mode:i?'occupied':'empty',median:s[32],p95:s[60],max:s[63],draws:[Math.min(...counts[i]),Math.max(...counts[i])]};});return{name,visibleFrames,stats,resources:w.stats()};
  },name);rows.push(row);fs.writeFileSync(out+'/software-opening-cost.json',JSON.stringify({rows,errors},null,2));console.log(JSON.stringify({name,visibleFrames:row.visibleFrames,stats:row.stats}));
 }
 assert.equal(rows[0].visibleFrames,64);assert.equal(rows[1].visibleFrames,64);assert.equal(rows[2].visibleFrames,0);assert.deepEqual(errors,[]);fs.writeFileSync(out+'/software-opening-cost.json',JSON.stringify({passed:true,rows,errors},null,2));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
