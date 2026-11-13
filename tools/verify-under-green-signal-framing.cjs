const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const baseline=process.argv.includes('--baseline'),out='output/under-green/signal-framing/'+(baseline?'before':'after');
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({hasTouch:true}),errors=[],samples=[],views=[];let mounts=null,crossing=null;
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.route('**/under-green-scene.js',route=>{
   let s=fs.readFileSync('web/under-green-scene.js','utf8');const marker=' return {draw,drainJoeFootsteps:';assert(s.includes(marker));
   if(baseline){
    assert(s.includes('// A centered horizontal signal'));
    s=s.replace(/   \/\/ A centered horizontal signal[\s\S]*?   const stop=/,"   const z=end*(w.depth/2+1),signal=new THREE.Group();signal.position.set(2.65,2.75,z);group.add(signal);\n   box('iron',0,0,0,.4,1.02,.22,signal);box('iron',3.08,1.4,z,.08,2.8,.08,group);\n   box('iron',2.9,2.75,z,.5,.08,.08,group);\n   const stop=").replace('light.position.set(-.32+i*.32,0,facing*.14)','light.position.set(0,.3-i*.3,facing*.14)');
   }
   return route.fulfill({contentType:'application/javascript',body:s.replace(marker,' window.__signalScene={scene,camera,waterObjects,materials,THREE};'+marker)});
  });
  if(baseline)await page.route('**/under-green.css',route=>{const s=fs.readFileSync('web/under-green.css','utf8');assert(s.includes('/* The physical bank signal'));return route.fulfill({contentType:'text/css',body:s.replace(/\/\* The physical bank signal[\s\S]*?\n}\n/,'')});});
  await page.route('**/under-green.js',route=>{
   const s=fs.readFileSync('web/under-green.js','utf8'),marker='if(test)window.__underGreen={';assert(s.includes(marker));
   return route.fulfill({contentType:'application/javascript',body:s.replace(marker,'window.__signalPrefs=prefs;'+marker)});
  });
  await page.goto('http://127.0.0.1:4187/under-green.html?test');await page.waitForFunction(()=>window.__signalScene&&window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.click('#primary');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.parse(render_game_to_text()).opening.active),false);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await page.setViewportSize({width,height});
   await page.touchscreen.tap(width/2,height/2);
   const result=await page.evaluate(async({baseline})=>{
    const {WATERS,waterPoint,waterState,solid}=await import('./under-green-course.js'),{createRun}=await import('./under-green-sim.js');
    const {scene,camera,waterObjects,materials,THREE}=__signalScene,rows=[];
    const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    for(const w of WATERS)for(const side of [-1,1])for(const approach of [1,2.5,5])for(const fov of [45,58,85])for(const crouched of [false,true])for(const phase of w.id==='bypass'?['low','surge']:w.id==='return'?['low','warning','surge']:['low','warning','surge','receding']){
     const pos=waterPoint(w,0,side*(w.depth/2+approach));if(solid(pos,.3))continue;
     const low=w.lowSeconds??(w.lesson?5:3),cycle={low:.5,warning:low+.5,surge:low+2,receding:11}[phase];
     const r=createRun();r.mode='playing';r.time=(cycle-(w.offset||0)+12)%12;r.messageTime=0;r.joe.phase='absent';
     if(w.id==='return'){r.bypass=phase!=='low';r.bypassAt=r.time-(phase==='warning'?1:3);}if(w.id==='bypass')r.bypass=phase==='low';
     Object.assign(r.player,pos,{yaw:Math.atan2(w.x-pos.x,w.y-pos.y),pitch:0,crouched,eyeHeight:crouched?1.12:1.65,focus:true});
     __underGreen.run=r;__underGreen.clearInput();__signalPrefs.fov=fov;advanceTime(0);
     if(!document.body.classList.contains('touch')||document.getElementById('touch').hidden)throw Error('Real touch layout not active');
     scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
     const blockers=[...document.querySelectorAll('#objective-card,#water-read,.hud-tools button,#caption,#touch button')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>{const b=e.getBoundingClientRect();return {id:e.id||e.dataset.key||e.tagName,left:b.left,right:b.right,top:b.top,bottom:b.bottom};});
     const state=waterState(w,r.time,r.bypass,r.bypassAt);if(state.phase!==phase)throw Error('Wrong phase fixture: '+w.id+' '+phase);
     const active=materials[state.danger?'redSignal':state.phase==='warning'?'amberSignal':'greenSignal'];
     const ray=new THREE.Raycaster(),lights=waterObjects.find(v=>v.w.id===w.id).signals.flat().filter(v=>v.material===active);
     const candidates=lights.map(light=>{
      light.geometry.computeBoundingBox();const box=light.geometry.boundingBox,points=[];
      for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).applyMatrix4(light.matrixWorld).project(camera));
      const center=light.getWorldPosition(new THREE.Vector3()),direction=center.clone().sub(camera.position),distance=direction.length(),projected=center.clone().project(camera);
      const rect={left:(Math.min(...points.map(p=>p.x))+1)*innerWidth/2,right:(Math.max(...points.map(p=>p.x))+1)*innerWidth/2,top:(1-Math.max(...points.map(p=>p.y)))*innerHeight/2,bottom:(1-Math.min(...points.map(p=>p.y)))*innerHeight/2};
      const framed=projected.z>=-1&&projected.z<=1&&rect.left>=0&&rect.right<=innerWidth&&rect.top>=0&&rect.bottom<=innerHeight;
      ray.set(camera.position,direction.normalize());ray.far=distance+.01;
      const hit=framed?(ray.camera=camera,ray).intersectObjects(scene.children,true).find(h=>{let n=h.object;while(n){if(!n.visible)return false;n=n.parent;}return true;}):null;
      const occludedBy=blockers.filter(b=>overlap(rect,b)).map(b=>b.id);
      return {rect,framed,clear:hit?.object===light,occludedBy,distance};
     });
     rows.push({id:w.id,side,approach,fov,crouched,phase:state.phase,player:pos,readable:candidates.some(c=>c.framed&&c.clear&&!c.occludedBy.length),candidates,blockers});
    }
    return rows;
   },{baseline});
   samples.push(...result.map(r=>({...r,width,height})));
   for(const [name,id,crouched,fov,side,cycle]of [['lesson','lesson',false,58,-1,8],['lesson-crouch','lesson',true,45,-1,8],['short-crouch','sluice',true,45,1,8],['lesson-low','lesson',false,58,-1,.5],['lesson-warning','lesson',false,58,-1,5.5]]){
    await page.evaluate(async({id,crouched,fov,side,cycle})=>{const {WATERS,waterPoint}=await import('./under-green-course.js'),{createRun}=await import('./under-green-sim.js');const w=WATERS.find(w=>w.id===id),pos=waterPoint(w,0,side*(w.depth/2+1)),r=createRun();r.mode='playing';r.time=(cycle-(w.offset||0)+12)%12;r.joe.phase='absent';r.messageTime=0;Object.assign(r.player,pos,{yaw:Math.atan2(w.x-pos.x,w.y-pos.y),pitch:0,crouched,eyeHeight:crouched?1.12:1.65,focus:true});__signalPrefs.fov=fov;__underGreen.run=r;advanceTime(0);},{id,crouched,fov,side,cycle});
    await page.screenshot({path:`${out}/${name}-${width}.png`});views.push({name,width,height});
   }
  }
  if(!baseline){
   mounts=await page.evaluate(async()=>{
    const {WATERS,waterPoint,solid,onFloor}=await import('./under-green-course.js'),{bankSignalMount}=await import('./under-green-signals.js');
    const fixtures=[],poses=[];
    for(const w of WATERS)for(const side of [-1,1]){
     const m=bankSignalMount(w,side),post=waterPoint(w,m.postX,-m.z);fixtures.push({id:w.id,side,...m,postInsideFloor:!m.ceiling&&!m.gateHousing&&onFloor(post.x,post.y)});
     if(m.ceiling||m.gateHousing)continue;
     for(const offset of [-.4,0,.4]){
      const p=waterPoint(w,m.postX-Math.sign(m.postX)*.381,-m.z+offset);if(solid(p,.3))continue;
      for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2])poses.push({...p,height,pitch,yaw,fov:85,aspect:844/390});
     }
    }
    return {fixtures,poses:poses.length,failures:__underGreen.inspectCameraClearance(poses).filter(r=>r.hits.length)};
   });
   assert(mounts.fixtures.every(m=>!m.postInsideFloor));assert.deepEqual(mounts.failures,[]);
   await page.setViewportSize({width:390,height:844});
   await page.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=4.5;r.player.y=20;__signalPrefs.fov=58;__underGreen.run=r;__underGreen.clearInput();advanceTime(0);});
   const button=await page.locator('#touch [data-key=forward]').boundingBox(),cdp=await page.context().newCDPSession(page);
   assert(button);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:button.x+button.width/2,y:button.y+button.height/2}]});
   await page.evaluate(()=>advanceTime(2000));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.evaluate(()=>advanceTime(17));
   crossing=await page.evaluate(()=>JSON.parse(render_game_to_text()));assert(crossing.lessonCrossed);assert.equal(crossing.waterHits,0);assert(Math.abs(crossing.player.y-27.68)<.01);
   await page.screenshot({path:out+'/touch-crossing-390.png'});
  }
  const failures=samples.filter(s=>!s.readable);fs.writeFileSync(out+'/browser.json',JSON.stringify({baseline,passed:baseline?failures.length>0:!failures.length,samples: samples.length,failures,views,mounts,crossing,errors},null,2));
  console.log(JSON.stringify({baseline,samples:samples.length,failures:failures.length,examples:failures.slice(0,8).map(({candidates,blockers,...s})=>s),errors}));
  assert.deepEqual(errors,[]);if(baseline)assert(failures.some(s=>s.width===390));else assert.equal(failures.length,0,'Physical signals must be unobscured in the documented centered approach envelope');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
