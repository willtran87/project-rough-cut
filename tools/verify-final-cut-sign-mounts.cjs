const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/signage/mounts';fs.mkdirSync(out,{recursive:true});
const hook=`window.__signMountAudit=()=>{
 scene.updateMatrixWorld(true);const objects=[...staticMeshes];for(const root of [score,record,receiptFrame])root.traverse(m=>{if(m.isMesh){let visible=true;for(let parent=m;parent;parent=parent.parent)if(!parent.visible)visible=false;if(visible)objects.push(m);}});
 const ray=new THREE.Raycaster(),point=new THREE.Vector3(),normal=new THREE.Vector3(),tangent=new THREE.Vector3(),origin=new THREE.Vector3(),direction=new THREE.Vector3(),blocked=[];let rays=0;
 for(const m of [...staticSigns.map(s=>s.mesh),normalBoard,receiptBoard]){
  const layout=m.userData.signLayout;if(!layout||m.userData.decal)continue;
  normal.set(0,0,1).transformDirection(m.matrixWorld);tangent.set(1,0,0).transformDirection(m.matrixWorld);
  for(const line of layout.lines){if(!line.text)continue;const [x0,y0,x1,y1]=line.bounds,[w,h]=line.grid;
   for(const t of [.25,.5,.75])for(const angle of [-1,0,1]){
    point.set(((x0+(x1-x0)*t)/w-.5)*layout.width,(.5-(y0+y1)/2/h)*layout.height,0).applyMatrix4(m.matrixWorld);
    origin.copy(point).addScaledVector(normal,.25).addScaledVector(tangent,.25*angle);direction.copy(point).sub(origin);ray.set(origin,direction.clone().normalize());ray.near=0;ray.far=direction.length()-.001;
    const hits=ray.intersectObjects(objects,false);rays++;if(hits.length)blocked.push({text:m.userData.signText,line:line.text,t,angle,object:hits[0].object.name,instance:hits[0].instanceId,distance:hits[0].distance,point:hits[0].point.toArray()});
   }
  }
 }
 return {rays,blocked};
};`;
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{const p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];p.setDefaultTimeout(120000);p.on('pageerror',e=>errors.push(e.message));const source=fs.readFileSync('web/final-cut-scene.js','utf8');await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);')}));await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__signMountAudit&&JSON.parse(render_game_to_text()).ready);await p.evaluate(()=>advanceTime(0));const data=await p.evaluate(()=>__signMountAudit());fs.writeFileSync(out+'/report.json',JSON.stringify({data,errors},null,2));console.log(JSON.stringify({data,errors}));assert.deepEqual(errors,[]);assert.deepEqual(data.blocked,[],'A nearby structural piece obscures sign lettering');assert(data.rays>200);
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
