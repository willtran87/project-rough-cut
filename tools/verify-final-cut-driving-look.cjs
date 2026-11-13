const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out='output/final-cut/driving-look/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
const seatAudit=fs.readFileSync('tools/verify-final-cut-bodywork.cjs','utf8').match(/const instrument=`([\s\S]*?)`;/)[1];
const instrument=seatAudit+String.raw`
 window.__drivingSkin=()=>{scene.updateMatrixWorld(true);const head=rider.getObjectByName('Head'),chest=rider.getObjectByName('Chest'),center=new THREE.Vector3(...actorCulling.stats().center),v=new THREE.Vector3();let radius=0,vertices=0;
 rider.traverse(o=>{if(!o.isSkinnedMesh||!o.visible)return;o.skeleton.update();const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i);o.applyBoneTransform(i,v);v.applyMatrix4(o.matrixWorld);radius=Math.max(radius,v.distanceTo(center));vertices++;}});
 return {head:head.getWorldQuaternion(new THREE.Quaternion()).toArray(),chest:chest.getWorldQuaternion(new THREE.Quaternion()).toArray(),hands:['HandL','HandR'].map(n=>rider.getObjectByName(n).getWorldQuaternion(new THREE.Quaternion()).toArray()),radius,vertices,bound:actorCulling.stats().radius};};`;
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',instrument+'await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 const data=await p.evaluate(async(software)=>{
  const {createRun}=await import('./final-cut-sim.js'),{planHeadland,advanceHeadland}=await import('./final-cut-headland.js'),{cabPerformance}=await import('./final-cut-cab.js'),THREE=await import('./vendor/three/three.module.js');
  const fixtures=[],runs=[];let maxAngularSpeed=0,anticipation=0;
  for(const side of [-1,1])for(const target of [50,66,74]){
   const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.rig,{x:side*30,y:50,yaw:side*Math.PI/2,phase:'turn',age:0,steering:0,deployment:0,distance:0,speed:0});r.rig.turnPlan=planHeadland(r.rig,side,target);
   let previous=cabPerformance(r),lastRear=0,selected=new Set(),reverseFrames=0;const key=side+':'+target;
   for(let frame=0;frame<15000;frame++){
    const done=advanceHeadland(r.rig,1/120,()=>true);r.rig.age+=1/120;const pose=cabPerformance(r);
    maxAngularSpeed=Math.max(maxAngularSpeed,Math.abs(pose.headYaw-previous.headYaw)*120,Math.abs(pose.chestYaw-previous.chestYaw)*120);
    if(r.rig.reverse&&r.rig.speed>.01){if(pose.reverseCheck<.999)throw Error('Driver moves backward before checking');reverseFrames++;}
    if(Math.abs(pose.lookAhead)>.15&&Math.abs(r.rig.steering)<.1)anticipation++;
    let name=pose.reverseCheck>.98&&r.rig.reverse&&r.rig.speed>.2?'reverse':pose.reverseCheck>.45&&pose.reverseCheck<.65&&pose.reverseCheck>lastRear?'checking-before-reverse':pose.reverseCheck>.4&&pose.reverseCheck<.6&&pose.reverseCheck<lastRear?'returning-forward':Math.abs(pose.lookAhead)>.25?'leading-turn':null;
    if(name&&!selected.has(name)){selected.add(name);fixtures.push({name,key,run:structuredClone(r)});}
    if(pose.reverseCheck>0&&pose.reverseCheck<1){const scan='scan-'+(pose.reverseCheck>lastRear?'in-':'out-')+Math.floor(pose.reverseCheck*20);if(!selected.has(scan)){selected.add(scan);fixtures.push({name:scan,key,run:structuredClone(r)});}}
    previous=pose;lastRear=pose.reverseCheck;if(done===true)break;
   }runs.push({key,reverseFrames,selected:[...selected].filter(n=>!n.startsWith('scan-'))});
  }
  for(const side of [-1,1])for(let i=0;i<=22;i++){const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.rig,{x:side*30,y:50,yaw:side*Math.PI/2,phase:'disengage',age:i/10,deployment:Math.max(0,1-i/22)});fixtures.push({name:'inspect-cut',key:side+':'+i,run:r});}
  window.__driveFixtures=fixtures;
  window.__driveShow=async(index,reduced=false)=>{const r=structuredClone(fixtures[index].run);__finalCut.run=r;__finalCut.preferences.reducedMotion=reduced;const j=r.rig,c=Math.cos(j.yaw),s=Math.sin(j.yaw),side=-(Math.sign(j.x*Math.cos(j.yaw))||1);
   const x=j.x+c*side*3.6-s*2.4,y=j.y-s*side*3.6-c*2.4;Object.assign(r.player,{x,y,yaw:Math.atan2(j.x-x,j.y-y),pitch:-.24});await advanceTime(0);return JSON.parse(render_game_to_text()).graphics.joe;};
  const samples=[];
  for(let index=0;index<fixtures.length;index++){
   // Dense skin/seat transition audit runs on hardware. The software pass
   // repeats the same extreme/key poses and verifies its actual rendering.
   if(software&&(fixtures[index].name.startsWith('scan-')||fixtures[index].name==='inspect-cut'&&![0,11,22].includes(Number(fixtures[index].key.split(':')[1]))))continue;
   const j=await __driveShow(index),skin=__drivingSkin(),seating=__seatAudit(),head=new THREE.Quaternion().fromArray(skin.head).normalize(),r=__finalCut.run,saved=r.rig.turnPlan,phase=r.rig.phase;
   r.rig.turnPlan=null;r.rig.phase='pass';await advanceTime(0);const neutralSkin=__drivingSkin(),neutral=new THREE.Quaternion().fromArray(neutralSkin.head).normalize(),forward=new THREE.Vector3(Math.sin(r.rig.yaw),0,-Math.cos(r.rig.yaw)),actual=forward.clone().applyQuaternion(head.multiply(neutral.invert())),handRotationError=Math.max(...skin.hands.map((q,i)=>new THREE.Quaternion().fromArray(q).normalize().angleTo(new THREE.Quaternion().fromArray(neutralSkin.hands[i]).normalize())));
   r.rig.turnPlan=saved;r.rig.phase=phase;await advanceTime(0);samples.push({index,name:fixtures[index].name,key:fixtures[index].key,joe:j,skin,seating,handRotationError,forwardDot:forward.dot(actual)});
  }
  return {runs,samples,maxAngularSpeed,anticipation};
 },software);fs.writeFileSync(out+'/samples.json',JSON.stringify(data,null,2));
 assert(data.anticipation>0);assert(data.maxAngularSpeed<7,'Head/torso pose jumps');
 for(const s of data.samples){assert(s.joe.handError<.001,JSON.stringify({name:s.name,key:s.key,error:s.joe.handError}));assert(s.handRotationError<.00001,'Torso rotates a planted palm');assert(s.joe.footError<.001);assert(s.skin.radius<s.skin.bound-.1);assert(s.skin.vertices>10000);for(const seat of s.seating)assert.deepEqual(seat.hits,[],s.name+' intersects '+seat.name);if(s.name==='reverse')assert(s.forwardDot<-.1,'Head does not actually face behind: '+s.forwardDot);}
 const shots=[];for(const name of ['leading-turn','checking-before-reverse','reverse','returning-forward']){const s=data.samples.find(s=>s.name===name&&s.key.startsWith('1:'));assert(s,name);await p.evaluate(i=>__driveShow(i),s.index);await p.screenshot({path:out+'/'+name+'-2560.png'});shots.push(name+'-2560');}
 const reverse=data.samples.find(s=>s.name==='reverse'&&s.key.startsWith('1:'));for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await p.evaluate(i=>__driveShow(i),reverse.index);await p.screenshot({path:out+'/reverse-'+width+'.png'});shots.push('reverse-'+width);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.setViewportSize({width:2560,height:1600});await p.evaluate(async i=>{await __driveShow(i);const r=__finalCut.run;Object.assign(r.player,{x:24,y:r.rig.y-7,yaw:Math.atan2(r.rig.x-24,7),pitch:-.04});await advanceTime(0);},reverse.index);await p.screenshot({path:out+'/course-view-2560.png'});shots.push('course-view-2560');
 const before=await p.evaluate(i=>__driveShow(i),reverse.index);await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(500));assert.deepEqual(await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.joe),before);await p.click('#primary');const reduced=await p.evaluate(i=>__driveShow(i,true),reverse.index);assert.deepEqual(reduced.performance,before.performance);assert.deepEqual(reduced.targets,before.targets);
 assert.deepEqual(errors,[]);const report={passed:true,software,runs:data.runs,samples:data.samples.length,maxAngularSpeed:data.maxAngularSpeed,anticipation:data.anticipation,shots,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
