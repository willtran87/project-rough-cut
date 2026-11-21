const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade-local/pass48-signs/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],rows=[],audits=[];try{
 for(const before of [false]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await require('./lib/legacy-under-green-probe.cjs').exposeScene(p,'__sign48','scene,renderer,camera,signArt,waterObjects,batchCulling,lamps');
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__sign48&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  const audit=await p.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{solid}=await import('./under-green-course.js'),{dampLampLevel}=await import('./under-green-atmosphere.js');
   const {scene,batchCulling,lamps}=__sign48;batchCulling?.restore();scene.updateMatrixWorld(true);
   const meshes=[];scene.traverseVisible(m=>{if(m.isMesh&&m.material&&!Array.isArray(m.material)&&!m.material.transparent&&m.material.opacity===1){m.geometry.computeBoundingBox();meshes.push({mesh:m,box:m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)});}});
   const faces=meshes.filter(m=>m.mesh.material.name.startsWith('drain-sign:')).map(({mesh})=>{
    const g=mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,ix=g.index?.array||[0,1,2],ids=[ix[0],ix[1],ix[2]],v=ids.map(i=>new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld)),u=ids.map(i=>new T.Vector2().fromBufferAttribute(uv,i));
    const a=u[1].clone().sub(u[0]),b=u[2].clone().sub(u[0]),det=a.x*b.y-a.y*b.x;
    function point(x,y){const q=new T.Vector2(x,y).sub(u[0]),s=(q.x*b.y-q.y*b.x)/det,t=(a.x*q.y-a.y*q.x)/det;return v[0].clone().addScaledVector(v[1].clone().sub(v[0]),s).addScaledVector(v[2].clone().sub(v[0]),t);}
    const canvas=mesh.material.map.image,ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,candidates=[];
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4;if((pixels[i]===189&&pixels[i+1]===208&&pixels[i+2]===187)||(pixels[i]===225&&pixels[i+1]===209&&pixels[i+2]===160))candidates.push({x,y});}
    if(candidates.length<48)throw Error('Missing real ink pixels '+mesh.material.name);
    const samples=Array.from({length:48},(_,i)=>{const px=candidates[Math.floor(i*(candidates.length-1)/47)];return point((px.x+.5)/canvas.width,1-(px.y+.5)/canvas.height);});
    // Row-major quantiles alone can miss a narrow vertical obstruction.
    // Sample actual ink across the release lettering's width and height too.
    if(mesh.material.name.includes('SLUICE RELEASE')){
     const columns=new Map();for(const px of candidates){if(!columns.has(px.x))columns.set(px.x,[]);columns.get(px.x).push(px);}
     for(const [i,column]of [...columns.values()].entries())if(i%4===0)for(const fraction of [.2,.5,.8]){
      const px=column[Math.floor((column.length-1)*fraction)];samples.push(point((px.x+.5)/canvas.width,1-(px.y+.5)/canvas.height));
     }
    }
    const normal=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).normalize(),center=point(.5,.5),right=point(1,.5).sub(point(0,.5)).normalize();
    return {mesh,label:mesh.material.name,center,normal,right,samples,width:point(1,.5).distanceTo(point(0,.5))};
   });
   const ray=new T.Raycaster();
   function examine(face,origin){let blocked=0;const blockers={},examples=[];for(const target of face.samples){const direction=target.clone().sub(origin),distance=direction.length();ray.set(origin,direction.normalize());ray.far=distance+.002;const candidates=meshes.filter(m=>ray.ray.intersectsBox(m.box)).map(m=>m.mesh),hit=ray.intersectObjects(candidates,false)[0];if(hit?.object!==face.mesh){blocked++;const key=hit?.object.material.name||hit?.object.name||'unnamed';blockers[key]=(blockers[key]||0)+1;if(examples.length<3)examples.push({key,point:hit?.point.toArray(),target:target.toArray(),distance:hit?.distance,material:hit?.object.material.type});}}return {samples:face.samples.length,blocked,blockers,examples};}
   const crossing=[];
   for(const face of faces.filter(f=>f.label.includes('LOW FLOW')))for(const distance of [1.2,2,4,7])for(const height of [1.12,1.65])for(const offset of [-.7,0,.7]){
    const origin=face.center.clone().addScaledVector(face.normal,distance).addScaledVector(face.right,offset);origin.y=height;if(solid({x:origin.x,y:-origin.z},.3))throw Error('Invalid crossing origin');crossing.push({side:face.normal.z,distance,height,offset,origin:origin.toArray(),...examine(face,origin)});
   }
   const route=[];
   for(const [index,face]of faces.entries()){
    for(const distance of face.width<.5?[.8,1.3,2]:[2,4,7]){
     // Fixed normal approaches with a small lateral search for a real floor
     // position. Never search for a clear ray: obstructions remain findings.
     let origin;for(const off of [0,-.5,.5,-1,1]){const at=face.center.clone().addScaledVector(face.normal,distance).addScaledVector(face.right,off);at.y=1.65;if(!solid({x:at.x,y:-at.z},.3)){origin=at;break;}}
     if(!origin){route.push({index,label:face.label,distance,validFloor:false});continue;}
     const delta=face.center.clone().sub(origin),yaw=Math.atan2(delta.x,-delta.z),pitch=Math.min(.85,Math.atan2(delta.y,Math.hypot(delta.x,delta.z)));
     route.push({index,label:face.label,distance,validFloor:true,x:origin.x,y:-origin.z,yaw,pitch,width:face.width,...examine(face,origin)});
    }
   }
   let minimum={time:0,energy:Infinity};for(let k=0;k<=900;k++){const time=k/10,energy=lamps.reduce((sum,l,i)=>{const d=Math.hypot(l.x,l.y-20,(l.height??2.8)-3.3);return sum+(d<(l.reach??13)?dampLampLevel(time,i)*(l.power??1)/Math.max(1,d*d):0);},0);if(energy<minimum.energy)minimum={time,energy};}
   return {faces:faces.length,crossing,route,minimum,signs:__sign48.signArt.stats()};
  });audits.push({before,...audit});fs.writeFileSync(out+'/'+(before?'before':'after')+'-audit.json',JSON.stringify(audit,null,2));console.log(JSON.stringify({before,faces:audit.faces,crossingBlocked:audit.crossing.filter(r=>r.blocked).length,routeBlocked:audit.route.filter(r=>r.blocked).length,minimum:audit.minimum}));
  if(process.argv.includes('--audit-only')){await p.close();continue;}
  async function place(f,time=26.3){await p.evaluate(async({f,time})=>{const {createRun}=await import('./under-green-sim.js'),r=createRun();r.mode='playing';r.time=time;r.joe.phase='absent';Object.assign(r.player,{x:f.x,y:f.y,yaw:f.yaw,pitch:f.pitch,eyeHeight:f.height||1.65,crouched:f.height===1.12,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,time});}
  async function shot(name){const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));rows.push({before,name,viewport:p.viewportSize(),state:s});await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
  const fixtures=[{name:'reported',x:0,y:18,yaw:0,pitch:.25},{name:'standing-close',x:0,y:18.8,yaw:0,pitch:.75},{name:'crouched-close',x:0,y:18.8,yaw:0,pitch:.85,height:1.12},{name:'rear-close',x:0,y:21.2,yaw:Math.PI,pitch:.75},{name:'approach',x:0,y:16,yaw:0,pitch:.12},{name:'oblique',x:.7,y:18,yaw:Math.atan2(-.7,2),pitch:.5}];
  for(const f of fixtures){await place(f);await shot(f.name);}
  if(!before){
   for(const f of audit.route.filter(r=>r.validFloor&&r.distance===(r.width<.5?1.3:4))){await place(f,audit.minimum.time);await shot('route-'+f.index);}
   for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await place(fixtures[4]);await shot('approach');}
   await p.setViewportSize({width:2560,height:1600});await place(fixtures[0],audit.minimum.time);await shot('low-light');await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear-glance');await p.keyboard.up('q');await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>JSON.parse(render_game_to_text()).seconds);await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>JSON.parse(render_game_to_text()).seconds),frozen);await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#comfort .rc-settings-tabs button',{hasText:'Camera'}).click();await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[4]);await shot('reduced');
  }
  await p.close();
 }
 const current=audits.find(a=>!a.before);
 const releaseBlocked=current.route.filter(r=>r.label.includes('SLUICE RELEASE')&&r.distance<=4&&r.blocked);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:!errors.length&&!current.crossing.some(r=>r.blocked)&&!releaseBlocked.length,software,rows,audits,errors},null,2));
 assert.deepEqual(releaseBlocked,[],'Release lettering obstructed at reading distance');
 assert.deepEqual(current.crossing.filter(r=>r.blocked),[],'Candidate still obscures actual lettering');assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,software,views:rows.length,inkRays:current.crossing.reduce((s,r)=>s+r.samples,0)}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
