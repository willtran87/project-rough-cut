const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=`output/final-cut/visual-hero/${software?'software':'accepted'}`;
const instrument=`window.__wheelContact=()=>{
 scene.updateMatrixWorld(true);
 const clip=(p,bound,sign)=>{const out=[];for(let k=0;k<p.length;k++){const a=p[k],b=p[(k+1)%p.length],da=bound-sign*a.x,db=bound-sign*b.x;if(da>=0)out.push(a);if((da>=0)!==(db>=0))out.push(a.clone().lerp(b,da/(da-db)));}return out;};
 const radial=p=>{let min=Infinity,area=0,positive=false,negative=false;for(let k=0;k<p.length;k++){const a=p[k],b=p[(k+1)%p.length],cross=a.y*b.z-a.z*b.y;area+=cross;positive||=cross>1e-12;negative||=cross<-1e-12;const dy=b.y-a.y,dz=b.z-a.z,t=Math.max(0,Math.min(1,-(a.y*dy+a.z*dz)/(dy*dy+dz*dz||1)));min=Math.min(min,Math.hypot(a.y+t*dy,a.z+t*dz));}return Math.abs(area)>1e-12&&!(positive&&negative)?0:min;};
 return wheels.map((wheel,k)=>{
  const spec=RIG_WHEELS[k],tire=wheel.children.find(m=>m.name==='FinaleMoldedTire'),p=tire.geometry.attributes.position,v=new THREE.Vector3();let bottom=Infinity;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(tire.matrixWorld);bottom=Math.min(bottom,v.y);}
  const fender=contactMeshes.find(c=>c.id==='fender-'+Math.sign(spec.side)+'-'+spec.forward).mesh,inv=wheel.matrixWorld.clone().invert().multiply(fender.matrixWorld),fp=fender.geometry.attributes.position,ix=fender.geometry.index.array,points=[];
  for(let i=0;i<fp.count;i++)points.push(new THREE.Vector3().fromBufferAttribute(fp,i).applyMatrix4(inv));
  let clearance=Infinity;for(let i=0;i<ix.length;i+=3){let polygon=[points[ix[i]],points[ix[i+1]],points[ix[i+2]]];polygon=clip(clip(polygon,(spec.width+.04)/2,1),(spec.width+.04)/2,-1);if(polygon.length)clearance=Math.min(clearance,radial(polygon)-spec.radius);}
  let hubWidth=0,hubRadius=0;const hub=wheel.children.find(m=>m.name==='FinaleWheelHub'),hp=hub.geometry.attributes.position;
  for(let i=0;i<hp.count;i++){hubWidth=Math.max(hubWidth,Math.abs(hp.getX(i)));hubRadius=Math.max(hubRadius,Math.hypot(hp.getY(i),hp.getZ(i)));}
  return {id:spec.id,gap:bottom-(wheel.position.y-spec.height),clearance,roll:wheel.rotation.x,height:wheel.position.y,film:tires.stats().films[k],hubWidth,hubRadius};
 });
};`;
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');assert(source.includes('await renderer.compileAsync(scene,camera);'));await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',instrument+'await renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__wheelContact&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 for(const raised of [false,true])for(const steering of [-.65,0,.65])for(const distance of [0,.21,.7,1.37]){
  await p.evaluate(async({raised,steering,distance})=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:raised?6.17:0,y:raised?79.45:50,yaw:0,phase:'turn',steering,distance,deployment:0});__finalCut.run=r;await advanceTime(0);},{raised,steering,distance});
  const wheels=await p.evaluate(()=>__wheelContact());for(const w of wheels){assert(w.gap>=-1e-6&&w.gap<.008,JSON.stringify({raised,steering,distance,w}));assert(w.clearance>.002,JSON.stringify({raised,steering,distance,w}));assert(w.hubWidth<=.340001&&w.hubRadius<.85);}samples.push({raised,steering,distance,wheels});
 }
 // Real simulation movement acquires gravel dust, then turf residue. Only
 // initial placement is a fixture; no dirt/rotation state is written by test.
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:30,y:50,yaw:-Math.PI/2,direction:-1,phase:'pass',deployment:1});Object.assign(r.player,{x:0,y:92});__finalCut.run=r;await advanceTime(3000);const j=r.rig;Object.assign(r.player,{x:j.x-1.55,y:j.y+4.6,yaw:Math.PI,pitch:.3});await advanceTime(0);});
 const dust=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(dust.graphics.tires.films.some(f=>f[1]>.1));await p.screenshot({path:out+'/tire-dust.png',timeout:120000});
 await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:12.7,y:74,yaw:-Math.PI/2,direction:-1,phase:'pass',deployment:1});Object.assign(r.player,{x:16,y:81,yaw:Math.atan2(-5,-7),pitch:.12});__finalCut.run=r;await advanceTime(3500);});
 const mud=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(mud.won);assert(mud.graphics.tires.films.some(f=>f[0]>.7&&f[3]>.9));await p.screenshot({path:out+'/tire-mud.png',timeout:120000});
 const state=await p.evaluate(()=>JSON.stringify(JSON.parse(render_game_to_text()).graphics.tires));await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(1500));assert.equal(await p.evaluate(()=>JSON.stringify(JSON.parse(render_game_to_text()).graphics.tires)),state);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/wheel-contact.json',JSON.stringify({passed:true,software,samples,dust:dust.graphics.tires,mud:mud.graphics.tires,errors},null,2));console.log(JSON.stringify({passed:true,software,poses:samples.length,minClearance:Math.min(...samples.flatMap(s=>s.wheels.map(w=>w.clearance))),maxGap:Math.max(...samples.flatMap(s=>s.wheels.map(w=>w.gap))),errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

