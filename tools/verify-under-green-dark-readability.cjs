const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const district=process.argv.find(a=>a.startsWith('--district='))?.slice(11);if(district&&district!=='range')throw Error('Unknown readability district '+district);
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade-local/pass40-final/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[];
try{const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await p.route('**/under-green-scene.js',r=>{const s=fs.readFileSync('web/under-green-scene.js','utf8');return r.fulfill({contentType:'application/javascript',body:s.replace(' return {draw,',' window.__darkProbe={lamps,camera,scene,renderer,waterObjects,materials}; return {draw,')});});
await p.goto('http://127.0.0.1:4187/under-green.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
const fixtures=await p.evaluate(async()=>{
 const {WATERS,waterPoint,solid,waterState}=await import('./under-green-course.js'),{dampLampLevel}=await import('./under-green-atmosphere.js');
 // Search actual independent clocks together, weighted by each source's real
 // distance falloff. This selects a low-light exposure, not a forced blackout.
 const weight=(x,y,height,time)=>__darkProbe.lamps.reduce((v,l,i)=>{const d=Math.hypot(x-l.x,y-l.y,height-(l.height||2.8)),reach=l.reach||13;return v+8*(l.power??1)*Math.max(0,1-(d/reach)**4)**2/Math.max(d**1.4,.01)*(d<reach?dampLampLevel(time,i):0);},0);
 const minimum=(x,y,height,accept=()=>true)=>{let best={time:0,weight:Infinity};for(let step=0;step<12000;step++){const time=step*.02;if(!accept(time))continue;const value=weight(x,y,height,time);if(value<best.weight)best={time,weight:value};}if(!Number.isFinite(best.weight))throw Error('No schedule sample');return best;};
 const waters=[];for(const w of WATERS){const forward=w.forward??1,point=waterPoint(w,0,-forward*(w.depth/2+1.8)),yaw=w.axis==='x'?(forward>0?Math.PI/2:-Math.PI/2):(forward>0?0:Math.PI);if(solid(point,.3))throw Error('Invalid bank '+w.id);
 const phases=w.control==='cycle'?['low','warning','surge','receding']:w.control==='pump-return'?['low','warning','surge']:['low','surge'];
 for(const phase of phases){const bypass=w.control==='pump-outflow'?phase==='low':w.control==='pump-return'?phase!=='low':false,bypassAge=phase==='warning'?1:4;
 const t=minimum(w.x,w.y,.45,time=>waterState(w,time,bypass,time-bypassAge).phase===phase);
 waters.push({kind:'water',name:w.id+'-'+phase,w:{...w},phase,point,yaw,pitch:-.12,bypass,bypassAt:t.time-bypassAge,...t});}}
 const actors=[{name:'gallery',x:0,y:8},{name:'bunker',x:-20,y:70},{name:'pump',x:-18,y:40},{name:'range',x:12,y:32},{name:'keeper',x:12,y:14,reverse:true}].map(a=>{const point={x:a.x,y:a.y+(a.reverse?3.5:-3.5)};if(solid(point,.3)||solid(a,.3))throw Error('Invalid actor view '+a.name);return {...a,kind:'actor',point,yaw:a.reverse?Math.PI:0,pitch:-.10,...minimum(a.x,a.y,1.1)};});
 return {waters,actors,search:{seconds:240,step:.02,method:'summed practical-light attenuation'}};
});if(district==='range'){fixtures.waters=fixtures.waters.filter(f=>f.w.id.startsWith('range-'));fixtures.actors=fixtures.actors.filter(f=>f.name==='range');}fs.writeFileSync(out+'/fixtures.json',JSON.stringify(fixtures,null,2));
async function place(f,phase='walk',age=0){await p.evaluate(async({f,phase,age})=>{const {createRun}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js');const r=createRun();r.mode='playing';r.time=f.time;r.elapsed=0;r.messageTime=0;r.bypass=!!f.bypass;r.bypassAt=f.bypassAt??-99;Object.assign(r.player,{...f.point,yaw:f.yaw,pitch:f.pitch,grace:100});if(f.kind==='actor'){Object.assign(r.joe,{x:f.x,y:f.y,yaw:f.reverse?0:Math.PI,phase,age,speed:0,walk:0});delete r.joe.weaponPose;settleWeapon(r,1/60);}else r.joe.phase='absent';__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,phase,age});}
async function shot(name){const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({name,viewport:p.viewportSize(),state});await p.screenshot({path:`${out}/${name}-${p.viewportSize().width}.jpg`,quality:91});}
for(const f of fixtures.waters){await place(f);const actual=await p.evaluate(id=>{const v=__darkProbe.waterObjects.find(v=>v.w.id===id);return v.signals.map(lights=>lights.map(light=>Object.entries(__darkProbe.materials).find(([,m])=>m===light.material)?.[0]));},f.w.id);const active=f.phase==='low'?2:f.phase==='warning'?1:0;for(const bank of actual)for(let i=0;i<3;i++)assert.equal(bank[i],i===active?['redSignal','amberSignal','greenSignal'][i]:'offSignal');await shot(f.name);}
for(const f of fixtures.actors)for(const [phase,age,label]of [['windup',.7,'ready'],['sweep',.025,'start'],['sweep',.11,'cut'],['sweep',.195,'end'],['recover',.12,'recover']]){await place(f,phase,age);const a=await p.evaluate(()=>({...JSON.parse(render_game_to_text()).graphics.actor,weaponPose:__underGreen.run.joe.weaponPose}));assert(a.handError<.015);assert(a.footError<.015);assert(Math.abs(a.weaponPose.pitch)<.01,'Attack fixture must retain a raised blade');await shot(f.name+'-'+label);}
// Render complete windup/cut/recovery sequences at30Hz while the actual
// lamp clocks pass through the low-light time. The cut midpoint aligns with
// the sampled minimum; frames are not held at a frozen light level.
const sequences=[];
for(const f of fixtures.actors){await place(f,'windup',0);const samples=[];
 for(let frame=0;frame<=75;frame++){
  const a=await p.evaluate(async({frame,f})=>{const {settleWeapon}=await import('./under-green-clearance.js'),{trimmerSegment}=await import('./under-green-trimmer.js');const t=Math.min(2.47,frame/30),phase=t<.95?'windup':t<1.17?'sweep':'recover',age=t-(phase==='windup'?0:phase==='sweep'?.95:1.17),r=__underGreen.run;r.time=f.time-1.06+t;Object.assign(r.joe,{phase,age});delete r.joe.weaponPose;settleWeapon(r,1/30);advanceTime(0);await __underGreen.whenPresented();const g=JSON.parse(render_game_to_text()).graphics,blade=trimmerSegment(r.joe);return {frame,t,phase,age,weaponPose:r.joe.weaponPose,handError:g.actor.handError,footError:g.actor.footError,bladeError:Math.max(...['near','far'].map(k=>Math.hypot(g.actor.blade[k].x-blade[k].x,g.actor.blade[k].y-blade[k].y,g.actor.blade[k].height-blade[k].height))),lights:g.atmosphere.lightLevels};},{frame,f});
  assert(a.handError<.015&&a.footError<.015&&a.bladeError<.00001);if(a.phase==='sweep')assert(Math.abs(a.weaponPose.pitch)<.01);samples.push(a);
  if([0,18,28,32,35,51,75].includes(frame))await shot(f.name+'-motion-'+frame);
 }
 sequences.push({name:f.name,samples});
}
fs.writeFileSync(out+'/motion.json',JSON.stringify(sequences,null,2));
for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await place(fixtures.waters.find(f=>f.name==='lesson-surge')||fixtures.waters.find(f=>f.phase==='surge'));await shot('crossing-responsive');await place(fixtures.actors[0],'sweep',.11);await shot('attack-responsive');}
await p.setViewportSize({width:2560,height:1600});await place(fixtures.actors[0],'windup',.7);await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.atmosphere.lightLevels);await p.evaluate(()=>advanceTime(1500));assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.atmosphere.lightLevels),frozen);await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures.actors[0],'sweep',.11);await shot('attack-reduced');
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,district:district||null,fixtures,rows,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
