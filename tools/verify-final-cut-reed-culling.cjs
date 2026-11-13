const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),benchmark=process.argv.includes('--benchmark');
const out=`output/final-cut/reed-culling/batched/${software?'software':'hardware'}${benchmark?'-cost':''}`;fs.mkdirSync(out,{recursive:true});
const hook=`window.__initReedAudit=async()=>{
 const current=scene.getObjectByName('AmbushReedScreens'),{createAmbushReeds}=await import('./final-cut-reeds-baseline.js');
 const original=createAmbushReeds(scene),legacy=scene.children.at(-1);legacy.visible=false;
 const attributes=legacy.geometry.attributes,point=new THREE.Vector3(),culling=window.__reedCulling,g=current.geometry,indices=legacy.geometry.index.array;
 for(const [name,a]of Object.entries(attributes)){const b=g.attributes[name];if(a.count!==b.count||a.array.some((v,i)=>v!==b.array[i]))throw Error('Changed vertex attribute '+name);}
 if(indices.length!==culling.source.length||indices.some((v,i)=>v!==culling.source[i]))throw Error('Changed original triangle order');
 let end=0;for(const part of culling.parts){if(part.offset!==end||!part.group)throw Error('Lost clump index range');end+=part.count;}if(end!==indices.length)throw Error('Lost triangles');
 for(const group of culling.groups){
  // All independently attainable shader extremes must remain in both bounds.
  const seen=new Set(group.indices);for(const i of seen){const h=g.attributes.plantHeight.getX(i);for(const x of [-3.085,3.085])for(const z of [-2.55,2.55])for(const y of [-h*.12,0]){point.fromBufferAttribute(g.attributes.position,i).add(new THREE.Vector3(x,y,z));if(!group.bounds.containsPoint(point)||!g.boundingSphere.containsPoint(point))throw Error('Unbounded animated reed');}}
 }
 const pixels=()=>{const data=new Uint8Array(width*height*4);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;};
 const draw=(old)=>{legacy.visible=old;current.visible=!old;headlights.lights.forEach(l=>l.shadow.needsUpdate=true);if(moonlight.castShadow)moonlight.shadow.needsUpdate=true;renderer.render(scene,camera);return pixels();};
 window.__reedAudit={geometry:{sections:culling.groups.length,triangles:indices.length/3,vertices:attributes.position.count,singleDrawPerView:true},compare:(r,reduced=false)=>{
  original.update(r,reduced);const a=draw(true),before={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},b=draw(false);let changed=0,maxDelta=0,sum=0;for(let i=0;i<a.length;i+=4){let d=0;for(let k=0;k<3;k++)d=Math.max(d,Math.abs(a[i+k]-b[i+k]));if(d)changed++;maxDelta=Math.max(maxDelta,d);sum+=d;}
  const after={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  current.frustumCulled=false;const uncull=draw(false);current.frustumCulled=true;let culledDifferences=0;for(let i=0;i<b.length;i++)if(b[i]!==uncull[i])culledDifferences++;
  return {changed,maxDelta,meanDelta:sum/(a.length/4),culledDifferences,pixels:a.length/4,before,after,render:[width,height]};
 },cost:r=>{original.update(r,false);const reports=[];for(const old of [true,false,false,true]){for(let i=0;i<2;i++)draw(old);const times=[];for(let i=0;i<7;i++){const start=performance.now();draw(old);times.push(performance.now()-start);}times.sort((a,b)=>a-b);reports.push({old,median:times[3],max:times[6],calls:renderer.info.render.calls,triangles:renderer.info.render.triangles});}legacy.visible=false;current.visible=true;return reports;},dispose:()=>original.dispose()};
};`;
(async()=>{const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:benchmark?{width:960,height:540}:{width:2560,height:1600}});page.setDefaultTimeout(120000);const errors=[],cases=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/final-cut-scene.js','utf8'),baseline=fs.readFileSync('output/final-cut/reed-culling/source/final-cut-reeds-before.js','utf8');
 assert(source.includes('await renderer.compileAsync(scene,camera);'));
 await page.route('**/final-cut-reeds-baseline.js',r=>r.fulfill({contentType:'text/javascript',body:baseline}));
 // Force the optimization on hardware only for cross-backend fidelity/cost
 // comparison; the production hardware tier retains its faster static mesh.
 const reeds=fs.readFileSync('web/final-cut-reeds.js','utf8');await page.route('**/final-cut-reeds.js',r=>r.fulfill({contentType:'text/javascript',body:reeds.replace('const culling=cull?createReedCulling(mesh,sections,plants):null;','const culling=createReedCulling(mesh,sections,plants);window.__reedCulling=culling;')}));
 await page.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);')}));
 await page.goto('http://127.0.0.1:4187/final-cut.html?test',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__initReedAudit&&JSON.parse(render_game_to_text()).ready);
 await page.evaluate(()=>__initReedAudit());const geometry=await page.evaluate(()=>__reedAudit.geometry);
 const fixture=async(v)=>page.evaluate(async v=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';r.time=v.time??.5;Object.assign(r.player,{x:v.x,y:v.y,yaw:v.yaw,pitch:v.pitch||0});Object.assign(r.rig,{x:v.rx??0,y:v.ry??49.38,yaw:v.ryaw||0,phase:v.phase||'pass',age:.5,deployment:1});if(v.entry){const vertical=['north','south'].includes(v.entry);r.rig.phase='announce';r.rig.attack={entry:v.entry,from:{x:r.rig.x,y:r.rig.y},axis:vertical?'y':'x'};}__finalCut.run=r;await advanceTime(0);return __reedAudit.compare(r);},v);
 await fixture({x:5,y:55,yaw:Math.atan2(-4,3.1),pitch:.14});
 if(benchmark){const reports=await page.evaluate(()=>__reedAudit.cost(__finalCut.run));assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({software,geometry,reports,errors},null,2));console.log(JSON.stringify({software,geometry,reports,errors}));return;}
 const views=[{name:'working-shadow',x:5,y:55,yaw:Math.atan2(-4,3.1),pitch:.14},{name:'overlook',x:-2,y:0,yaw:0}];
 for(const [entry,x,y,rx,ry]of [['west',-23,50,-30,50],['east',23,50,30,50],['north',22.8,78,22.8,85],['south',22.8,38,22.8,31]])for(const turn of [-.7,0,.7])views.push({name:entry+'-'+turn,entry,x,y,rx,ry,yaw:Math.atan2(rx-x,ry-y)+turn});
 views.push({name:'contact-west',x:-22,y:43,yaw:Math.atan2(-5,7),rx:-27.8,ry:50,ryaw:Math.PI/2},{name:'contact-east',x:21,y:43,yaw:Math.atan2(7,7),rx:27.8,ry:50,ryaw:-Math.PI/2},{name:'north-road',x:0,y:91,yaw:0},{name:'rear-shadow',x:24,y:62,yaw:Math.atan2(4,-10),rx:27,ry:52,ryaw:0});
 const verify=result=>{assert.equal(result.culledDifferences,0,'Culling must remove no visible color/shadow pixels');assert(result.changed/result.pixels<.0001&&result.meanDelta<.002,'Original batching must agree apart from sparse coincident-edge rasterization');};
 for(const v of views){const result=await fixture(v);cases.push({name:v.name,...result});console.log(JSON.stringify(cases.at(-1)));verify(result);if(['working-shadow','contact-west','north-0'].includes(v.name)){await page.evaluate(()=>__finalCut.draw());await page.screenshot({path:out+'/'+v.name+'.png'});}}
 for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844]]){await page.setViewportSize({width,height});const result=await fixture(views[0]);cases.push({name:width+'x'+height,...result});verify(result);}
 assert.deepEqual(errors,[]);await page.evaluate(()=>__reedAudit.dispose());fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,geometry,cases,errors},null,2));console.log(JSON.stringify({passed:true,software,geometry,cases:cases.length,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
