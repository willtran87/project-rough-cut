const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/static-culling-study';fs.mkdirSync(out,{recursive:true});
const hook=`const masonryOriginals=staticMeshes.filter(m=>!m.name.startsWith('FinalCutStatic-ashlar')&&!m.name.startsWith('FinalCutStatic-coping'));
 const masonryVariants=new Map(),matrix=new THREE.Matrix4();
 for(const size of [16,24,32]){const root=new THREE.Group();root.visible=false;scene.add(root);
  for(const original of masonryOriginals){const bins=new Map();for(let i=0;i<original.count;i++){original.getMatrixAt(i,matrix);const key=Math.floor(matrix.elements[12]/size)+','+Math.floor(matrix.elements[14]/size);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(matrix.clone());}
   for(const matrices of bins.values()){const mesh=new THREE.InstancedMesh(original.geometry,original.material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=original.castShadow;mesh.receiveShadow=original.receiveShadow;mesh.computeBoundingSphere();root.add(mesh);}
  }masonryVariants.set(size,root);
 }
 window.__masonryCost=()=>{const pixels=new Uint8Array(width*height*4),reports=[];let reference;
  for(const size of [0,16,24,32,0]){masonryOriginals.forEach(m=>m.visible=!size);for(const [s,root]of masonryVariants)root.visible=s===size;
   const draw=()=>{scene.traverse(l=>{if(l.isLight&&l.castShadow&&l.intensity>0)l.shadow.needsUpdate=true;});renderer.render(scene,camera);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);};for(let i=0;i<2;i++)draw();const times=[];for(let i=0;i<5;i++){const start=performance.now();draw();times.push(performance.now()-start);}times.sort((a,b)=>a-b);
   if(!reference)reference=pixels.slice();let changed=0,max=0,sum=0;for(let i=0;i<pixels.length;i+=4){let d=0;for(let k=0;k<3;k++)d=Math.max(d,Math.abs(pixels[i+k]-reference[i+k]));if(d)changed++;max=Math.max(max,d);sum+=d;}
   reports.push({size,median:times[2],maxTime:times[4],calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,changed,max,mean:sum/(width*height)});
  }return {reports,originalBatches:masonryOriginals.length,originalInstances:masonryOriginals.reduce((n,m)=>n+m.count,0),batches:[...masonryVariants].map(([size,root])=>({size,batches:root.children.length}))};
 };`;
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{const page=await browser.newPage({viewport:{width:960,height:540}});page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});const source=fs.readFileSync('web/final-cut-scene.js','utf8');await page.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);')}));await page.goto('http://127.0.0.1:4187/final-cut.html?test',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__masonryCost&&JSON.parse(render_game_to_text()).ready);
 await page.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';Object.assign(r.rig,{x:0,y:49.38,yaw:0,phase:'pass',age:3,deployment:1});Object.assign(r.player,{x:5,y:55,yaw:Math.atan2(-4,3.1),pitch:.14});__finalCut.run=r;await advanceTime(0);});const data=await page.evaluate(()=>__masonryCost());assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({data,errors},null,2));console.log(JSON.stringify({data,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

