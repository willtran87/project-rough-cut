const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out='output/final-cut/headland/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
// Read the actual rendered static triangles, including instances and trees.
const audit=String.raw`window.__headlandScene=()=>{
 scene.updateMatrixWorld(true);const triangles=[],v=new THREE.Vector3(),instance=new THREE.Matrix4(),matrix=new THREE.Matrix4();
 scene.traverse(o=>{
  if(!o.isMesh||o.isSkinnedMesh)return;for(let p=o;p;p=p.parent)if(p===rig||!p.visible)return;
  const pos=o.geometry.attributes.position;if(!pos)return;const indices=o.geometry.index?.array;
  for(let instanceIndex=0;instanceIndex<(o.isInstancedMesh?o.count:1);instanceIndex++){
   matrix.copy(o.matrixWorld);if(o.isInstancedMesh){o.getMatrixAt(instanceIndex,instance);matrix.multiply(instance);}
   for(let n=0;n<(indices?.length||pos.count);n+=3){const points=[];
    for(let k=0;k<3;k++){v.fromBufferAttribute(pos,indices?indices[n+k]:n+k).applyMatrix4(matrix);points.push([v.x,v.y,-v.z]);}
    if(Math.max(...points.map(p=>p[1]))<.14||Math.min(...points.map(p=>p[1]))>4.8)continue;
    if(points.every(p=>Math.abs(p[0])<26&&p[2]<95))continue;
    triangles.push(points);
   }
  }
 });return triangles;
};`;
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],shots=[];page.on('pageerror',e=>errors.push(e.message));
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');await page.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',audit+'await renderer.compileAsync(scene,camera);')}));
 await page.goto('http://127.0.0.1:4187/final-cut.html?test');await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.evaluate(()=>advanceTime(0));await page.click('#primary');
 const result=await page.evaluate(async()=>{
  const THREE=await import('./vendor/three/three.module.js'),{planHeadland,headlandPose,advanceHeadland}=await import('./final-cut-headland.js'),{createRun}=await import('./final-cut-sim.js');
  const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.rig,{x:0,y:50,yaw:0,phase:'turn',deployment:0,steering:0});__finalCut.run=r;__finalCut.draw();
  const geometry=__finalCut.rigGeometry(),bounds=new THREE.Box3();for(const g of geometry)for(const [x,h,y]of g.points)bounds.expandByPoint(new THREE.Vector3(x,h,y-50));
  // Circumscribe rolling/steering tires independently of their sampled tread phase.
  bounds.min.y=.14;bounds.max.y=Math.max(bounds.max.y,4.5);bounds.min.z=Math.min(bounds.min.z,-2.6);bounds.max.z=Math.max(bounds.max.z,2.6);
  const partBounds=geometry.map(g=>{const b=new THREE.Box3();for(const [x,h,y]of g.points)b.expandByPoint(new THREE.Vector3(x,h,y-50));if(g.id.startsWith('wheel'))b.expandByVector(new THREE.Vector3(.22,.03,.12));return b;});
  const rigTriangles=geometry.map(g=>{const points=g.points.map(([x,h,y])=>new THREE.Vector3(x,h,y-50)),ts=[];for(let i=0;i<g.triangles.length;i+=3)ts.push(new THREE.Triangle(...g.triangles.slice(i,i+3).map(k=>points[k])));return ts;});
  const intersects=(a,b)=>{const av=[a.a,a.b,a.c],bv=[b.a,b.b,b.c],ae=av.map((v,i)=>av[(i+1)%3].clone().sub(v)),be=bv.map((v,i)=>bv[(i+1)%3].clone().sub(v)),an=ae[0].clone().cross(ae[1]),bn=be[0].clone().cross(be[1]),axes=[an,bn,...ae.flatMap(x=>be.map(y=>x.clone().cross(y))),...ae.map(e=>e.clone().cross(an)),...be.map(e=>e.clone().cross(bn))];for(const axis of axes){if(axis.lengthSq()<1e-16)continue;const ap=av.map(p=>p.dot(axis)),bp=bv.map(p=>p.dot(axis));if(Math.max(...ap)<Math.min(...bp)-1e-8||Math.max(...bp)<Math.min(...ap)-1e-8)return false;}return true;};
  const triangles=__headlandScene(),grid=new Map();for(let index=0;index<triangles.length;index++){
   const t=triangles[index],minX=Math.floor(Math.min(...t.map(p=>p[0]))/5),maxX=Math.floor(Math.max(...t.map(p=>p[0]))/5),minY=Math.floor(Math.min(...t.map(p=>p[2]))/5),maxY=Math.floor(Math.max(...t.map(p=>p[2]))/5);
   for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++){const key=x+','+y;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(index);}
  }
  const tri=new THREE.Triangle(),bad=[],routes=[];let poses=0;
  for(const side of [-1,1])for(const start of [26,50,66,74])for(const target of [26,50,66,74])for(const targetSide of [side,-side]){
   const j={x:side*30,y:start,yaw:side*Math.PI/2,distance:0,phase:'turn',deployment:0},plan=planHeadland(j,targetSide,target);let count=0;
   for(const segment of plan.segments)for(let d=0;d<=segment.length+.1;d+=.15){
    const p=headlandPose(segment,Math.min(d,segment.length)),c=Math.cos(p.yaw),s=Math.sin(p.yaw),candidates=new Set();
    for(let x=Math.floor((p.x-5)/5);x<=Math.floor((p.x+5)/5);x++)for(let y=Math.floor((p.y-5)/5);y<=Math.floor((p.y+5)/5);y++)for(const k of grid.get(x+','+y)||[])candidates.add(k);
    for(const index of candidates){const points=triangles[index];for(let k=0;k<3;k++){const [x,h,y]=points[k];[tri.a,tri.b,tri.c][k].set((x-p.x)*c-(y-p.y)*s,h,(x-p.x)*s+(y-p.y)*c);}
     if(bounds.intersectsTriangle(tri)&&partBounds.some((b,i)=>b.intersectsTriangle(tri)&&(geometry[i].id.startsWith('wheel')||rigTriangles[i].some(t=>intersects(t,tri))))&&bad.length<20)bad.push({side,start,target,targetSide,pose:p,triangle:points});
    }poses++;count++;
   }routes.push({side,start,target,targetSide,poses:count});
  }
  window.__headlandFixture=async(kind)=>{
   const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.rig,{x:30,y:50,yaw:Math.PI/2,phase:'turn',deployment:0,distance:0});r.rig.turnPlan=planHeadland(r.rig,1,kind==='reverse'?50:74);let count=0;
   while(count++<5000){advanceHeadland(r.rig,1/60,()=>true);if(kind==='reverse'?r.rig.reverse:r.rig.turnPlan.index===0&&r.rig.turnPlan.at>8)break;}
   Object.assign(r.player,{x:24,y:r.rig.y+7,yaw:Math.atan2(r.rig.x-24,-7),pitch:-.03});__finalCut.run=r;await advanceTime(0);return {rig:{...r.rig,turnPlan:undefined},graphics:JSON.parse(render_game_to_text()).graphics};
  };
  return {poses,routes:routes.length,staticTriangles:triangles.length,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},bad};
 });fs.writeFileSync(out+'/clearance.json',JSON.stringify(result,null,2));assert.deepEqual(result.bad,[],JSON.stringify(result.bad[0]));
 const fixtures=[];for(const kind of ['corner','reverse']){fixtures.push(await page.evaluate(k=>__headlandFixture(k),kind));for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});await page.evaluate(()=>__finalCut.draw());const name=kind+'-'+width;await page.screenshot({path:out+'/'+name+'.png'});shots.push(name);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}}
 await page.evaluate(()=>__headlandFixture('corner'));const before=await page.evaluate(()=>JSON.parse(render_game_to_text()).rig);await page.keyboard.press('Escape');await page.evaluate(()=>advanceTime(500));assert.deepEqual(await page.evaluate(()=>JSON.parse(render_game_to_text()).rig),before);await page.click('#primary');await page.evaluate(()=>advanceTime(100));assert((await page.evaluate(()=>JSON.parse(render_game_to_text()).rig)).distance>before.distance);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,result,fixtures,shots,errors},null,2));console.log(JSON.stringify({passed:true,...result,shots,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
