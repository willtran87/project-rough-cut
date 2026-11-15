const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),benchmark=process.argv.includes('--benchmark');
const out=`output/final-cut/masonry-culling/${software?'software':'hardware-forced'}${benchmark?'-cost':''}`;fs.mkdirSync(out,{recursive:true});
const hook=`const currentMasonry=staticMeshes.filter(m=>m.name.startsWith('FinalCutStatic-ashlar')||m.name.startsWith('FinalCutStatic-coping')),oldMasonry=new THREE.Group();oldMasonry.visible=false;scene.add(oldMasonry);
 let verifiedInstances=0;const point=new THREE.Vector3(),transform=new THREE.Matrix4();
 for(const {mat,geo,items}of staticParts.values())if(mat.startsWith('ashlar')||mat==='coping'){
  const old=new THREE.InstancedMesh(geo,materials[mat],items.length),remaining=new Map();old.castShadow=old.receiveShadow=true;
  items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy,p.sz);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.updateMatrix();old.setMatrixAt(i,dummy.matrix);});old.computeBoundingSphere();oldMasonry.add(old);
  for(let i=0;i<old.count;i++){const key=Array.from(old.instanceMatrix.array.subarray(i*16,i*16+16)).join(',');remaining.set(key,(remaining.get(key)||0)+1);}
  for(const mesh of currentMasonry.filter(m=>m.geometry===geo&&m.material===materials[mat])){
   if(!mesh.castShadow||!mesh.receiveShadow)throw Error('Lost masonry shadow behavior');
   for(let i=0;i<mesh.count;i++){const key=Array.from(mesh.instanceMatrix.array.subarray(i*16,i*16+16)).join(','),n=remaining.get(key)||0;if(n<1)throw Error('Changed/duplicated stone');remaining.set(key,n-1);verifiedInstances++;mesh.getMatrixAt(i,transform);
    for(let v=0;v<geo.attributes.position.count;v++){point.fromBufferAttribute(geo.attributes.position,v).applyMatrix4(transform);if(point.distanceTo(mesh.boundingSphere.center)>mesh.boundingSphere.radius+.00001)throw Error('Unbounded stone vertex');}
   }
  }if([...remaining.values()].some(n=>n))throw Error('Missing original stone');
 }
 if(verifiedInstances!==7576)throw Error('Unexpected original masonry count');
 const render=(old,read=true)=>{oldMasonry.visible=old;currentMasonry.forEach(m=>m.visible=!old);scene.traverse(l=>{if(l.isLight&&l.castShadow&&l.intensity>0)l.shadow.needsUpdate=true;});renderer.render(scene,camera);if(!read)return;const data=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;};
 window.__masonryAudit={geometry:{instances:verifiedInstances,batches:currentMasonry.length,originalBatches:oldMasonry.children.length},compare:()=>{
  const old=render(true),before={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},now=render(false),after={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};currentMasonry.forEach(m=>m.frustumCulled=false);const full=render(false);currentMasonry.forEach(m=>m.frustumCulled=true);
  let changed=0,maxDelta=0,sum=0,culledDifferences=0;for(let i=0;i<now.length;i+=4){let d=0;for(let k=0;k<3;k++){d=Math.max(d,Math.abs(old[i+k]-now[i+k]));if(now[i+k]!==full[i+k])culledDifferences++;}if(d)changed++;sum+=d;maxDelta=Math.max(maxDelta,d);}
  return {before,after,changed,maxDelta,mean:sum/(width*height),culledDifferences,pixels:width*height,render:[width,height]};
 },cost:()=>{const reports=[];for(const old of [true,false,false,true]){for(let i=0;i<2;i++)render(old);const times=[];for(let i=0;i<7;i++){const start=performance.now();render(old);times.push(performance.now()-start);}times.sort((a,b)=>a-b);reports.push({old,median:times[3],max:times[6],calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});}oldMasonry.visible=false;currentMasonry.forEach(m=>m.visible=true);return reports;},dispose:()=>{scene.remove(oldMasonry);oldMasonry.children.forEach(m=>m.dispose());}};`;
(async()=>{const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{const p=await b.newPage({viewport:benchmark?{width:960,height:540}:{width:2560,height:1600}});p.setDefaultTimeout(120000);const errors=[],cases=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});let source=fs.readFileSync('web/final-cut-scene.js','utf8');if(!software)source=source.replace('spatial=software&&', 'spatial=(software||masonry)&&');assert(source.includes('await renderer.compileAsync(scene,camera);'));await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);')}));await p.goto('http://127.0.0.1:4187/final-cut.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__masonryAudit&&JSON.parse(render_game_to_text()).ready);
 const fixture=v=>p.evaluate(async v=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';r.time=.5;Object.assign(r.player,{x:v.x,y:v.y,yaw:v.yaw,pitch:v.pitch||0});Object.assign(r.rig,{x:v.rx??0,y:v.ry??49.38,yaw:v.ryaw||0,phase:'pass',age:3,deployment:1});__finalCut.run=r;await advanceTime(0);return __masonryAudit.compare();},v);
 const geometry=await p.evaluate(()=>__masonryAudit.geometry),working={name:'working-wall',x:5,y:55,yaw:Math.atan2(-4,3.1),pitch:.14};
 await fixture(working);if(benchmark){const reports=await p.evaluate(()=>__masonryAudit.cost());assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({software,geometry,reports,errors},null,2));console.log(JSON.stringify({software,geometry,reports,errors}));return;}
 const views=[working,{name:'overlook',x:-2,y:0,yaw:0},{name:'pump-outside',x:16.4,y:38,yaw:-Math.PI/2,pitch:-.12,rx:12,ry:44,ryaw:Math.PI},
 {name:'pump-interior',x:10,y:39,yaw:Math.PI,pitch:.22,rx:12,ry:44,ryaw:Math.PI},{name:'bunker',x:-10,y:2,yaw:0,rx:-12,ry:14,ryaw:Math.PI},
 {name:'pavilion',x:-12,y:68,yaw:0,rx:-16,ry:70,ryaw:0},{name:'north-road',x:0,y:91,yaw:0,rx:23,ry:85,ryaw:Math.PI},
 {name:'west-shadow',x:-23,y:58,yaw:-1.55,pitch:-.12,rx:-20,ry:50,ryaw:-Math.PI/2},{name:'east-shadow',x:23,y:58,yaw:1.55,pitch:-.12,rx:20,ry:50,ryaw:Math.PI/2},
 {name:'corner-near',x:-2,y:56,yaw:.6,pitch:.1,rx:-8,ry:54,ryaw:Math.PI/2}];
 const check=r=>{assert.equal(r.culledDifferences,0,'Culling must not change visible masonry/shadow pixels');assert(r.changed/r.pixels<.0001&&r.mean<.002,'Original masonry image must be preserved apart from coincident edges');};
 for(const v of views){const result=await fixture(v);cases.push({name:v.name,...result});console.log(JSON.stringify(cases.at(-1)));check(result);if(['working-wall','pump-interior','bunker'].includes(v.name)){await p.evaluate(()=>__finalCut.draw());await p.screenshot({path:out+'/'+v.name+'.png'});}}
 for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});const result=await fixture(working);cases.push({name:width+'x'+height,...result});check(result);}
 const resources=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);for(let i=0;i<8;i++)await fixture({...working,yaw:i*Math.PI/4});const after=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.equal(after.geometries,resources.geometries);assert.equal(after.textures,resources.textures);assert.deepEqual(errors,[]);await p.evaluate(()=>__masonryAudit.dispose());fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,geometry,cases,resources:{geometries:after.geometries,textures:after.textures},errors},null,2));console.log(JSON.stringify({passed:true,software,geometry,cases:cases.length,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


