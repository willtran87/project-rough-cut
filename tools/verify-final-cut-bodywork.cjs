const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),probe=process.argv.includes('--probe'),out=`output/final-cut/bodywork/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
// Test-only instrumentation reads the actual posed skin in body coordinates.
// No public gameplay API, duplicate proxy actor or skeletal-endpoint inference.
const instrument=`window.__bodyworkAudit=()=>{
 scene.updateMatrixWorld(true);const inv=body.matrixWorld.clone().invert(),v=new THREE.Vector3(),parts=[];
 rider.traverse(o=>{if(!o.isSkinnedMesh||!o.visible)return;o.skeleton.update();const a=o.geometry.attributes,points=[];
  for(let i=0;i<a.position.count;i++){let leg=false;for(let k=0;k<4;k++){if(a.skinWeight.getComponent(i,k)>.05&&/^(Foot|Shin|Thigh)/.test(o.skeleton.bones[a.skinIndex.getComponent(i,k)].name))leg=true;}if(!leg)continue;
   v.fromBufferAttribute(a.position,i);o.applyBoneTransform(i,v);v.applyMatrix4(o.matrixWorld).applyMatrix4(inv);points.push(v.toArray());}
  if(points.length)parts.push({name:o.name,points});});return parts;
 };
 window.__bodyworkGeometry=()=>{scene.updateMatrixWorld(true);const inv=body.matrixWorld.clone().invert(),v=new THREE.Vector3();return contactMeshes.filter(p=>['power-unit','hood','canopy'].includes(p.id)||(p.id.startsWith('side-console-')||p.id.startsWith('fender-'))).map(({id,mesh})=>{const a=mesh.geometry.attributes.position,points=[];for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld).applyMatrix4(inv);points.push(v.toArray());}return {id,points};});};
 window.__seatAudit=()=>{scene.updateMatrixWorld(true);const result=[];
  for(const {name,mesh}of seatMeshes){mesh.updateMatrix();const inv=new THREE.Matrix4().multiplyMatrices(body.matrixWorld,mesh.matrix).invert(),bounds=new THREE.Box3(new THREE.Vector3(-.5,-.5,-.5),new THREE.Vector3(.5,.5,.5)),hits=[];let triangles=0;
   rider.traverse(o=>{if(!o.isSkinnedMesh||!o.visible)return;o.skeleton.update();const g=o.geometry,a=g.attributes.position,v=new THREE.Vector3(),points=[];
    for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i);o.applyBoneTransform(i,v);points.push(v.clone().applyMatrix4(o.matrixWorld).applyMatrix4(inv));}
    const index=g.index?.array,triangle=new THREE.Triangle();let count=0;for(let k=0;k<(index?index.length:points.length);k+=3){triangle.set(points[index?index[k]:k],points[index?index[k+1]:k+1],points[index?index[k+2]:k+2]);triangles++;if(bounds.intersectsTriangle(triangle))count++;}if(count)hits.push({mesh:o.name,count});
   });result.push({name,triangles,hits});
  }return result;
 };`;
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8');assert(source.includes('await renderer.compileAsync(scene,camera);'));
 await p.route('**/final-cut-scene.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',instrument+'\nawait renderer.compileAsync(scene,camera);')}));
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 const fixture=fields=>p.evaluate(async fields=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:0,y:50,yaw:0,phase:'pass',deployment:1},fields.rig);Object.assign(r.player,{x:4.6,y:46.5,yaw:Math.atan2(-4.6,3.5),pitch:0},fields.player);__finalCut.run=r;await advanceTime(0);},fields);
 await fixture({});
 const legs=await p.evaluate(()=>__bodyworkAudit());fs.writeFileSync(`${out}/${probe?'baseline-':''}legs.json`,JSON.stringify(legs));
 const ranges=legs.map(m=>({name:m.name,count:m.points.length,min:[0,1,2].map(k=>Math.min(...m.points.map(p=>p[k]))),max:[0,1,2].map(k=>Math.max(...m.points.map(p=>p[k])))}));
 await p.screenshot({path:`${out}/${probe?'baseline-':''}side-2560.png`});if(probe){console.log(JSON.stringify({ranges,errors}));return;}
 const specs=await p.evaluate(async()=>(await import('./final-cut-rig.js')).RIG_BODY),samples=[],checks=[],states=[];
 const inspect=async name=>{
  const legs=await p.evaluate(()=>__bodyworkAudit()),geometry=await p.evaluate(()=>__bodyworkGeometry());let excess=0,minSeparation=Infinity;
  assert.equal(new Set(geometry.map(m=>m.id)).size,9);assert.equal(geometry.length,10);assert(legs.reduce((n,m)=>n+m.points.length,0)>4000,'Missing actual skinned leg surfaces');
  for(const mesh of geometry){const b=specs.find(s=>s.id===mesh.id);for(const [x,y,z]of mesh.points)excess=Math.max(excess,Math.abs(x-b.side)-b.w/2,Math.abs(y-b.height)-b.h/2,Math.abs(z+b.forward)-b.d/2);}
  // Separating bounds prove every leg triangle stays outside each solid
  // housing, not just its sampled vertices or the foot IK endpoint.
  for(const leg of legs){const min=[0,1,2].map(k=>Math.min(...leg.points.map(v=>v[k]))),max=[0,1,2].map(k=>Math.max(...leg.points.map(v=>v[k])));
   for(const b of specs.filter(s=>s.id==='power-unit'||s.id==='hood'||s.id.startsWith('side-console-'))){const c=[b.side,b.height,-b.forward],h=[b.w/2,b.h/2,b.d/2];const separation=Math.max(...c.flatMap((v,k)=>[min[k]-(v+h[k]),(v-h[k])-max[k]]));assert(separation>.3,`${name} ${leg.name}/${b.id} overlap or narrow clearance: ${separation}`);minSeparation=Math.min(minSeparation,separation);}
   assert(min[1]>1.325,`${name} skin penetrates cab floor`);
  }
  const seating=await p.evaluate(()=>__seatAudit());for(const seat of seating)assert.deepEqual(seat.hits,[],`${name} actor intersects ${seat.name}`);
  assert(excess<1e-6,`${name} visible hardware outside authoritative body: ${excess}`);samples.push({name,excess,minSeparation,seating});
 };
 for(const [name,rig]of [['cutting',{phase:'pass'}],['setting',{phase:'announce',age:1.5,deployment:.5}],['checking',{phase:'disengage',age:1.1}],['left-turn',{phase:'turn',steering:-.65,deployment:0,yaw:.7}],['right-turn',{phase:'turn',steering:.65,deployment:0,yaw:-1.2}]]){await fixture({rig});await inspect(name);}
 checks.push('Actual skin bounds separate all leg triangles from the rear engine and side housings across five seated actions; boots clear the existing floor');
 const shots=[['rear-2560',{x:2.5,y:44.5,yaw:Math.atan2(-2.5,5.5),pitch:.015}],['front-2560',{x:2.8,y:55.5,yaw:Math.atan2(-2.8,-5.5),pitch:-.04}],['footwell-2560',{x:1.9,y:51.7,yaw:Math.atan2(-1.9,-1.7),pitch:.06}]];
 for(const [name,player]of shots){await fixture({player});await p.screenshot({path:`${out}/${name}.png`});states.push({name,state:await p.evaluate(()=>JSON.parse(render_game_to_text()))});}
 for(const [width,height]of [[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await fixture({});await p.screenshot({path:`${out}/side-${width}.png`});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.setViewportSize({width:2560,height:1600});await fixture({rig:{x:12.7,y:74,yaw:-Math.PI/2,direction:-1,phase:'pass'},player:{x:16,y:81,yaw:Math.atan2(-5,-7),pitch:.12}});await p.evaluate(()=>advanceTime(100));assert((await p.evaluate(()=>JSON.parse(render_game_to_text()))).won);await p.evaluate(()=>advanceTime(3400));await inspect('live-collapse');await p.screenshot({path:`${out}/collapse-2560.png`});
 const before=await p.evaluate(()=>__finalCut.rigGeometry());await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(0));const paused=await p.evaluate(()=>JSON.stringify(__finalCut.rigGeometry()));await p.evaluate(()=>advanceTime(2000));assert.equal(await p.evaluate(()=>JSON.stringify(__finalCut.rigGeometry())),paused);
 await p.reload();await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.evaluate(()=>advanceTime(0));
 const after=await p.evaluate(()=>__finalCut.rigGeometry());assert.equal(before.length,after.length);let restoreError=0;for(let i=0;i<before.length;i++)for(let k=0;k<before[i].points.length;k++)for(let a=0;a<3;a++)restoreError=Math.max(restoreError,Math.abs(before[i].points[k][a]-after[i].points[k][a]));assert(restoreError<1e-6);await inspect('restored-collapse');
 checks.push('Actual physical trap, collapsed parent transform, pause and reload retain clear leg space and every rendered contact vertex');
 await p.keyboard.press('Escape');await p.locator('#comfort summary').click();await p.locator('[data-campaign=reducedMotion]').check();await p.click('#primary');
 // Reload correctly restores the safe pavilion checkpoint, whose wall hides
 // this close inspection target. Reposition only the diagnostic camera after
 // proving the unchanged rendered mechanism, so this shot shows the rig.
 await p.evaluate(()=>{Object.assign(__finalCut.run.player,{x:16,y:81,yaw:Math.atan2(-5,-7),pitch:.12});return advanceTime(0);});await inspect('reduced-collapse');await p.screenshot({path:`${out}/collapse-reduced-2560.png`});
 for(let k=0;k<16;k++)await p.evaluate(async k=>{__finalCut.run.player.yaw=k*Math.PI/8;await advanceTime(0);},k);
 const memory=(await p.evaluate(()=>JSON.parse(render_game_to_text()))).graphics;for(let k=0;k<16;k++)await p.evaluate(async k=>{__finalCut.run.player.yaw=k*Math.PI/8;await advanceTime(0);},k);const final=(await p.evaluate(()=>JSON.parse(render_game_to_text()))).graphics;assert.equal(final.geometries,memory.geometries);assert.equal(final.textures,memory.textures);assert.equal(final.bodywork.parts,9);assert.equal(final.bodywork.materials,1);
 checks.push('Nine merged body meshes share one material and the boss authored atlas; warmed repeated views keep geometry/texture counts stable');
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,checks,samples,states,ranges,restoreError,bodywork:final.bodywork,errors},null,2));console.log(JSON.stringify({passed:true,checks,samples,restoreError,bodywork:final.bodywork,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

