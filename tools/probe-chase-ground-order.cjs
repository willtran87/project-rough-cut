const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/back-nine-experience/ground-order',software=!process.argv.includes('--hardware'),label=software?'software':'hardware';fs.mkdirSync(out,{recursive:true});
 const scene=fs.readFileSync('web/back-nine-scene.js','utf8').replace('const mesh=new THREE.Mesh(g,b.material);scene.add(mesh);',"const mesh=new THREE.Mesh(g,b.material);mesh.userData.courseBatch=key.split(':')[0];scene.add(mesh);").replace('return {scene,camera,update,draw()','return window.__orderWorld={scene,camera,renderer,mowerLight,update,draw()');
 fs.mkdirSync(out+'/baseline-source',{recursive:true});for(const file of ['back-nine-scene.js','back-nine.html'])if(!fs.existsSync(out+'/baseline-source/'+file))fs.copyFileSync('web/'+file,out+'/baseline-source/'+file);
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],results=[];p.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});p.on('console',m=>{if(m.type()==='error')console.error(m.text());});
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:scene}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));console.log('ready',label);
  for(const view of [['open',0,70,0,true],['foliage',-29,443,-1.2,true],['windbreak',-23,432,.8,false],['range',-18,130,.9,false],['clubhouse',-14,758,.3,false],['garage',-23,790,-.7,false]]){
   const result=await p.evaluate(async a=>{
    const[name,x,y,yaw,rear]=a,{createRun}=await import('./back-nine-sim.js'),r=createRun(),w=__orderWorld,gl=w.renderer.getContext(),samples=[[],[]],counts=[[],[]],ground=w.scene.children.filter(m=>m.userData.courseBatch==='grass');
    w.renderer.setSize(960,540,false);w.camera.aspect=16/9;w.camera.updateProjectionMatrix();r.mode='driving';r.departure.phase='finished';r.cart.health=15;let changed=0,maxDifference=0,captures=0;
    for(let n=-8;n<64;n++){
     r.time=20+(n+8)/30;Object.assign(r.cart,{x,y:y+(n+8)*4/30,yaw,speed:4});Object.assign(r.joe,{x:x+2,y:r.cart.y-12,yaw:0,speed:12});w.resetCamera();w.update(r,{rear});const pair=[],read=n>=0&&n%8===0;
     for(const k of n%2?[1,0]:[0,1]){
      for(const mesh of ground)mesh.renderOrder=k;const start=performance.now();w.mowerLight.shadow.needsUpdate=true;w.draw();const f=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(f,0,0)===gl.TIMEOUT_EXPIRED)await new Promise(resolve=>setTimeout(resolve,1));gl.deleteSync(f);
      if(n>=0){samples[k].push(performance.now()-start);const s=w.stats();counts[k].push({parts:s.batchCulling.visible,trees:s.pines.visible,draws:s.draws,triangles:s.triangles});}
      if(read){const pixels=new Uint8Array(960*540*4);gl.readPixels(0,0,960,540,gl.RGBA,gl.UNSIGNED_BYTE,pixels);pair[k]=pixels;}
     }
     if(read){captures++;for(let i=0;i<pair[0].length;i++){const d=Math.abs(pair[0][i]-pair[1][i]);if(d)changed++;maxDifference=Math.max(maxDifference,d);}}
    }
    for(const mesh of ground)mesh.renderOrder=1;
    return{name,captures,changed,maxDifference,stats:samples.map((s,i)=>{s.sort((a,b)=>a-b);return{mode:i?'turf-last':'material-order',median:s[32],p95:s[60],max:s[63],counts:counts[i]};}),resources:w.stats()};
   },view);results.push(result);console.log(JSON.stringify({name:result.name,changed:result.changed,maxDifference:result.maxDifference,timings:result.stats.map(s=>({mode:s.mode,median:s.median,p95:s.p95,first:s.counts[0]}))}));await p.screenshot({path:`${out}/${label}-${view[0]}.png`});fs.writeFileSync(`${out}/${label}.json`,JSON.stringify({results,errors},null,2));
  }
  assert.deepEqual(errors,[]);assert(results.every(r=>r.changed===0),'Whole-frame comparison must remain exact');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
