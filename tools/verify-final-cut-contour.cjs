const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),baseline=process.argv.includes('--baseline'),out='output/final-cut/contours/'+(baseline?'baseline':software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
const hook=`window.__contourAudit=()=>{
 const o=courseContour.mesh,a=o.geometry.attributes.position,n=o.geometry.attributes.normal;
 let area=0;for(let i=0;i<a.count;i+=3){const ax=a.getX(i+1)-a.getX(i),az=a.getZ(i+1)-a.getZ(i),bx=a.getX(i+2)-a.getX(i),bz=a.getZ(i+2)-a.getZ(i);area+=Math.abs(ax*bz-az*bx)/2;}
 const bad=[],ray=new THREE.Raycaster();let probes=0,maxHeightError=0;
 for(let x=-23.683;x<24;x++)for(let y=4.213;y<100;y++){
  ray.set(new THREE.Vector3(x,1,-y),new THREE.Vector3(0,-1,0));ray.far=2;const hits=ray.intersectObject(o,false);probes++;
  if(hits.length!==1)bad.push({x,y,hits:hits.length});else maxHeightError=Math.max(maxHeightError,Math.abs(hits[0].point.y-.006));
 }
 // Independent spatial contract: maintained fairway cannot run through these
 // existing shelter/wall footprints or the low swale. Inspect the built faces,
 // not the profile interpolation used to construct them.
 const excluded=[['bunker',-14.5,-5.5,11,19],['pump',5.5,14.5,34,42],['bank',-6,10,58.1,58.7],['swale',2,14,68,80],['pavilion approach',-20,-9,74.2,74.8]],intrusions=[];
 let footprintProbes=0;const smooth=o.geometry.attributes.turfSmoothness;
 for(const [name,x0,x1,y0,y1]of excluded)for(let x=x0+.071;x<x1;x+=.2)for(let y=y0+.093;y<y1;y+=.2){
  ray.set(new THREE.Vector3(x,1,-y),new THREE.Vector3(0,-1,0));const hits=ray.intersectObject(o,false);footprintProbes++;
  if(hits.some(h=>Math.abs(smooth.getX(h.face.a)-.35)<1e-5))intrusions.push({name,x,y});
 }
 return {probes,bad:bad.slice(0,20),footprintProbes,intrusions:intrusions.slice(0,20),area,maxHeightError,finite:[...a.array,...n.array].every(Number.isFinite),...courseContour.stats()};
};`;
const overhead=`window.__courseOverhead=()=>{camera.position.set(0,85,-48);camera.lookAt(0,0,-48);renderer.render(scene,camera);};`;
(async()=>{const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],shots=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const source=fs.readFileSync(baseline?'output/final-cut/contours/baseline-scene.js':'web/final-cut-scene.js','utf8');await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',(baseline?'':hook)+overhead+'await renderer.compileAsync(scene,camera);')}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text())),shot=async name=>{await tick(0);await p.screenshot({path:out+'/'+name+'.png'});shots.push({name,graphics:(await read()).graphics});};
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);await p.click('#primary');await tick(0);
 const audit=baseline?null:await p.evaluate(()=>__contourAudit());if(audit){fs.writeFileSync(out+'/geometry.json',JSON.stringify(audit,null,2));assert(audit.finite);assert.deepEqual(audit.bad,[]);assert.deepEqual(audit.intrusions,[]);assert(Math.abs(audit.area-48*96)<.01);assert(audit.maxHeightError<1e-7);}
 for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await shot('arrival-'+width);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.setViewportSize({width:2560,height:1600});
 for(const [name,pose]of [['fork',{x:16,y:58,yaw:-.8,pitch:.12}],['green',{x:0,y:82,yaw:0,pitch:.3}],['road',{x:0,y:102,yaw:Math.PI,pitch:.12}]]){await p.evaluate(async pose=>{Object.assign(__finalCut.run.player,pose);await advanceTime(0)},pose);await shot(name);}
 await p.evaluate(()=>__courseOverhead());await p.screenshot({path:out+'/overhead.png'});
 await p.evaluate(async()=>{const {SECTORS}=await import('./final-cut-course.js');__finalCut.run.cut=SECTORS.map(s=>s.id);Object.assign(__finalCut.run.player,{x:-2,y:2.5,yaw:.05,pitch:.2});await advanceTime(0)});await shot('fully-cut');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,baseline,software,audit,shots,errors},null,2));console.log(JSON.stringify({passed:true,audit,shots:shots.length+1,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
