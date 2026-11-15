const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/joe-model/polish';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:2560,height:1600},recordVideo:{dir:out+'/video',size:{width:1280,height:800}}}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));
 // Deterministic test clock is injected into the viewer, never shipped.
 const html=fs.readFileSync('web/joe-model-preview.html','utf8').replace('function tick(now){','function tick(now){if(window.__freezePreview)return;').replace('window.joePreview={actor,renderer,camera}','window.joePreview={actor,renderer,camera,scene}');
 await p.route('**/joe-model-preview.html',r=>r.fulfill({contentType:'text/html',body:html}));
 try{
  await p.goto('http://127.0.0.1:4187/joe-model-preview.html');await p.waitForFunction(()=>window.joePreview?.actor.stats().ready);
  const mask=await p.evaluate(()=>{let result=null;joePreview.actor.root.traverse(o=>{if(o.isMesh&&o.material.customProgramCacheKey().endsWith('-face')){const c=o.geometry.attributes.color;let min=1,max=0,mixed=0;for(let i=0;i<c.count;i++){const w=c.getX(i);min=Math.min(min,w);max=Math.max(max,w);if(w>.02&&w<.98)mixed++;}result={min,max,mixed};}});return result;});
  assert(mask&&mask.min===0&&mask.max===1&&mask.mixed>100,'Authored facial blend mask must survive Blender subdivision, joining and GLB export');
  checks.push('Facial material blend contains both skin/face endpoints and an interpolated transition in the exported asset');
  await p.getByRole('button',{name:'Pause walk',exact:true}).click();await p.waitForTimeout(650);await p.getByRole('button',{name:'Walk',exact:true}).click();await p.waitForTimeout(900);await p.getByRole('button',{name:'Pause walk',exact:true}).click();await p.waitForTimeout(650);
  await p.evaluate(()=>{window.__freezePreview=true;window.__frame={joe:{effectHeading:Math.PI/2,effectSpeed:0,walkMeters:0,mode:'patrol'},time:100,reducedMotion:false,paused:false};});
  const step=async(speed,frames=1,travel=true)=>p.evaluate(({speed,frames,travel})=>{
   const samples=[];for(let i=0;i<frames;i++){__frame.time+=1/60;__frame.joe.effectSpeed=speed;if(travel)__frame.joe.walkMeters+=speed/60;joePreview.actor.update(__frame,joePreview.actor.root.position,.16,1/60);samples.push(joePreview.actor.stats());}joePreview.renderer.render(joePreview.scene,joePreview.camera);return samples;
  },{speed,frames,travel});
  await step(0,60);const all=[];
  for(const name of ['start','stop','restart','second-stop']){
   const speed=name==='start'||name==='restart'?4:0;const first=(await step(speed))[0];assert(first.walkWeight>0&&first.walkWeight<1,'first transition frame must blend');
   const samples=[first];for(let segment=0;segment<5;segment++){samples.push(...await step(speed,6));if(segment===0||segment===2)await p.screenshot({path:out+'/'+name+'-phase-'+segment+'.png'});}all.push(...samples);
   assert.equal(samples.at(-1).walkWeight,speed?1:0);assert(samples.every(s=>s.handError<.005),'grip must remain attached while blending');
   for(let i=1;i<samples.length;i++)for(let f=0;f<2;f++){const a=samples[i-1].footPositions[f],c=samples[i].footPositions[f];assert(Math.hypot(...c.map((v,k)=>v-a[k]))<.04,'foot snaps more than 4cm in one 60Hz frame');}
   await p.screenshot({path:out+'/'+name+'.png'});
  }
  checks.push('Repeated walk/idle transitions blend over time, preserve the handle grip, and avoid frame-sized foot snaps');
  await step(4,12);const before=(await step(0,6))[0];
  const same=await p.evaluate(()=>{const a=joePreview.actor.stats();for(let i=0;i<30;i++)joePreview.actor.update(__frame,joePreview.actor.root.position,.16,1/60);return [a,joePreview.actor.stats()];});assert.deepEqual(same[0],same[1]);
  const paused=await p.evaluate(()=>{__frame.paused=true;const a=joePreview.actor.stats();for(let i=0;i<30;i++){__frame.time+=1/60;joePreview.actor.update(__frame,joePreview.actor.root.position,.16,1/60);}__frame.paused=false;return [a,joePreview.actor.stats()];});assert.equal(paused[0].walkWeight,paused[1].walkWeight);assert.deepEqual(paused[0].footPositions,paused[1].footPositions);
  checks.push('Repeated rendering and Pause freeze the crossfade and breathing');
  const interrupted=[...await step(4,5),...await step(0,5),...await step(4,5),...await step(0,30)];for(let i=1;i<interrupted.length;i++){assert(Math.abs(interrupted[i].walkWeight-interrupted[i-1].walkWeight)<.1);assert(interrupted[i].handError<.005);}checks.push('Rapid stop/start reversals continue from the current blend without resetting pose');
  await step(0,60);const idleA=(await step(0))[0],idleB=(await step(0,60)).at(-1);assert.deepEqual(idleA.wheelAngles,idleB.wheelAngles);assert(idleB.handError<.005);assert.notEqual(idleA.idleTime,idleB.idleTime);
  await p.evaluate(()=>__frame.reducedMotion=true);await step(0,60);const reducedA=(await step(0))[0],reducedB=(await step(0,60)).at(-1);assert.deepEqual(reducedA.footPositions,reducedB.footPositions);assert.deepEqual(reducedA.headRotation,reducedB.headRotation);
  checks.push('Idle breathing does not roll wheels; reduced motion freezes decorative idle motion');
  await p.evaluate(()=>{joePreview.camera.position.set(-.65,1.68,-1.35);joePreview.camera.lookAt(0,1.43,.20);joePreview.renderer.render(joePreview.scene,joePreview.camera);});await p.screenshot({path:out+'/portrait-oblique.png'});
  await p.evaluate(()=>{joePreview.camera.position.set(0,1.60,-1.35);joePreview.camera.lookAt(0,1.43,.20);joePreview.renderer.render(joePreview.scene,joePreview.camera);});await p.screenshot({path:out+'/portrait-front.png'});
  await p.evaluate(()=>{joePreview.camera.position.set(.8,1.65,1.6);joePreview.camera.lookAt(0,1.43,.20);joePreview.renderer.render(joePreview.scene,joePreview.camera);});await p.screenshot({path:out+'/portrait-rear.png'});
  assert.deepEqual(errors,[]);const report={passed:true,checks,errors,maxHandError:Math.max(...all.map(s=>s.handError)),model:all.at(-1)};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,checks,errors,maxHandError:report.maxHandError}));
 }finally{const video=p.video();await p.close();await video.saveAs(out+'/transitions.webm');await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
