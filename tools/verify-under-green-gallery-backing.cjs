const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {PNG}=require(require('node:path').join(require('node:path').dirname(require.resolve('playwright-core/package.json')),'lib/utilsBundle.js'));
const referencePixels=new Map(),pixelChecks=[];
// Retriangulation can move a texture sample across one quantization boundary.
// Software upscaling spreads these isolated samples over more output pixels.
// Keep that tolerance small, and require exact pixels in unaffected views.
function assertPixelFidelity(checks,software){
 const affected=/^(east-repair|entrance-floor|approach|flood-\d+)-2560$/;
 assert.equal(checks.length,23,'Missing paired views');
 for(const c of checks){
  if(!affected.test(c.key)){assert.equal(c.changed,0,c.key+' changed outside repaired-wall views');continue;}
  assert(c.changed/c.pixels<=(software?.002:.00005),c.key+' changed-pixel area');
  assert(c.large/c.pixels<=(software?.0002:.000005),c.key+' high-delta area');
  assert(c.max<=24,c.key+' maximum channel difference');
  assert(c.mean<=(software?.002:.00005),c.key+' mean RGB difference');
 }
}
const checkReport=process.argv.find(a=>a.startsWith('--check-report='))?.slice(15);
if(checkReport){const r=JSON.parse(fs.readFileSync(checkReport,'utf8'));assert(r.passed);assertPixelFidelity(r.pixelChecks,r.software);console.log(JSON.stringify({passed:true,report:checkReport,pairs:r.pixelChecks.length}));process.exit(0);}
const software=process.argv.includes('--software'),preview=process.argv.includes('--preview'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass101/${software?'software':'hardware'}`;
const fixtures=[['east-repair',1.5,18.2,Math.PI/2,.05],['entrance-floor',0,8,0,-.28],['east-apron',1.3,10.8,Math.PI/2,-.65],['west-apron',-2.4,13.2,-Math.PI/2,-.5],['pillar-trail',0,16.8,-.7,-.65],['drain-approach',0,18,0,-.45],['approach',0,8,0,.1],['east-wall',3.2,10.8,Math.PI/2,.25],['east-close',3.8,9.2,Math.PI/2,.60],['east-low',3.6,11.7,Math.PI/2,-.2],['west-wall',-3.5,13.4,-Math.PI/2,.35],['west-close',-3.9,13.38,-Math.PI/2,.8],['floor',-3.6,12.4,0,-.8],['reverse',0,17,Math.PI,.2],['crossing',0,19,0,-.05],['pump-control',-25.7,40,Math.PI/2,-.27],['keeper-control',12,13.5,-2.4,.05]];
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],audits=[],errors=[];try{
for(const before of [true,false]){
 const p=await b.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/under-green-gallery-render.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-gallery-render.js','utf8')}));
 await p.route('**/under-green-ground-finish.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/under-green-ground-finish.js','utf8').replace(' return {texture,wallDeposits,',' window.__galleryDeposits=texture; return {texture,wallDeposits,')}));
 await p.route('**/under-green-scene.js',r=>{const s=fs.readFileSync(before?'output/under-green/visual-pass101/source/under-green-scene-before.js':'output/under-green/visual-pass101/source/under-green-scene-candidate.js','utf8'),marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));return r.fulfill({contentType:'application/javascript',body:s.replace(marker,' window.__canopyProbe={scene,renderer,structureMeshes,batchCulling};'+marker)});});
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
 async function place(f,elapsed=0){await p.evaluate(async({f,elapsed})=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js');const assertClear=!solid({x:f[1],y:f[2]},.3);if(!assertClear)throw Error('Solid fixture '+f[0]);const r=createRun();r.mode='playing';r.time=26.3;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,elapsed});}
 async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());const s=await p.evaluate(()=>JSON.parse(render_game_to_text())),g=s.graphics;rows.push({before,name,viewport:p.viewportSize(),player:s.player,graphics:{resolution:g.resolution,draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,lights:g.lights}});const key=name+'-'+p.viewportSize().width,buffer=await p.screenshot({type:'png'});
  if(before)referencePixels.set(key,buffer);else if(referencePixels.has(key)){
   const a=PNG.sync.read(referencePixels.get(key)),b=PNG.sync.read(buffer);assert.equal(a.width,b.width);assert.equal(a.height,b.height);let changed=0,max=0,sum=0,large=0;
   for(let i=0;i<a.data.length;i+=4){let delta=0;for(let c=0;c<3;c++){const d=Math.abs(a.data[i+c]-b.data[i+c]);delta=Math.max(delta,d);sum+=d;}if(delta){changed++;max=Math.max(max,delta);if(delta>3)large++;}}
   pixelChecks.push({key,changed,max,large,mean:sum/(a.width*a.height*3),pixels:a.width*a.height});referencePixels.delete(key);
  }
  await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:88});}
 for(const f of fixtures){await place(f);await shot(f[0]);}
 if(!preview)for(const elapsed of [42,49,60,66,75,90]){await place(fixtures.find(f=>f[0]==='entrance-floor'),elapsed);await shot('flood-'+elapsed);}
 const audit=await p.evaluate(()=>{__canopyProbe.batchCulling?.restore();const outside=[],missingColors=[];const hash=a=>{let h=2166136261;for(const v of new Uint8Array(a.buffer,a.byteOffset,a.byteLength))h=Math.imul(h^v,16777619);return h>>>0;};
  for(const m of __canopyProbe.structureMeshes){const p=m.geometry.attributes.position,idx=m.geometry.index;if(m.material.vertexColors&&!m.geometry.attributes.color)missingColors.push(m.name);
   for(let i=0;i<(idx?.count||p.count);i+=3){const coords=[];let inside=['galleryRender','galleryWallDamp'].includes(m.name);for(let j=0;j<3;j++){const k=idx?idx.getX(i+j):i+j,x=p.getX(k),y=p.getY(k),z=p.getZ(k);coords.push(x,y,z);if((Math.abs(x)<4.83||Math.abs(x)>5.01)&&(x<2.83||x>3.01)||y<-.01||y>4.01||z< -20.1||z> -7.7)inside=false;}if(m.name==='rootStone'&&coords.every((v,k)=>k%3===0?Math.abs(v-2.89)<.0001:k%3===1?v>=0&&v<=4.21:v>=-20.13&&v<=-16))inside=true;if(!inside)outside.push(m.name+':'+hash(new Float32Array(coords)));}
  }outside.sort();return {outsideCount:outside.length,outsideHash:hash(new TextEncoder().encode(outside.join('|'))),missingColors,render:JSON.parse(render_game_to_text()).graphics.districtDetails.galleryRender||null};
 });audits.push(audit);assert.deepEqual(audit.missingColors,[]); const mask=await p.evaluate(()=>{const bytes=__galleryDeposits.image.data,parts=[];for(let i=0;i<bytes.length;i+=8192)parts.push(String.fromCharCode(...bytes.subarray(i,i+8192)));return btoa(parts.join(''));});fs.writeFileSync(out+'/'+(before?'before':'after')+'-deposit.bin',Buffer.from(mask,'base64'));
 if(!before&&!preview){
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});for(const f of [fixtures[0],fixtures.find(f=>f[0]==='entrance-floor')]){await place(f);await shot(f[0]);}}
  await p.setViewportSize({width:2560,height:1600});await place(fixtures[0]);await p.keyboard.down('c');await p.evaluate(()=>advanceTime(250));await shot('crouch');await p.keyboard.up('c');await p.evaluate(()=>advanceTime(300));await p.keyboard.down('q');await p.evaluate(()=>advanceTime(300));await shot('rear');await p.keyboard.up('q');
  await place(fixtures[1]);const original=await p.screenshot({type:'png'});await place(fixtures[3]);await place(fixtures[1]);assert(original.equals(await p.screenshot({type:'png'})),'Unstable gallery pixels after camera return');
  audit.clearance=await p.evaluate(async()=>{const {solid}=await import('./under-green-course.js'),poses=[];for(const x of [-4.6,-2.5,0,2.5,4.6])for(const y of [9,11,13,15,17,26,28]){if(solid({x,y},.3))continue;for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const fov of [45,85])for(const aspect of [390/844,844/390])for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5])poses.push({x,y,height,pitch,fov,aspect,yaw});}return {samples:poses.length,hits:__underGreen.inspectCameraClearance(poses).filter(r=>r.hits.length)};});assert.deepEqual(audit.clearance.hits,[]);
  // A visible emissive control is then placed outside the original wall at
  // every exposed-brick window. New plaster holes must never become sky holes.
  await p.evaluate(async()=>{const T=await import('./vendor/three/three.module.js'),m=new T.Mesh(new T.PlaneGeometry(.4,.4),new T.MeshBasicMaterial({color:0xff00ff,fog:false,toneMapped:false,side:T.DoubleSide}));m.position.set(0,1.65,-10);__canopyProbe.scene.add(m);window.__renderSentinel=m;});
  const pixels=()=>p.evaluate(()=>{const gl=__canopyProbe.renderer.getContext(),a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);let n=0;for(let i=0;i<a.length;i+=4)if(a[i]>220&&a[i+1]<30&&a[i+2]>220)n++;return n;});
  await place(['positive',0,8,0,0]);assert(await pixels()>10,'Missing visible opacity control');audit.sentinels=[];
  for(const [boundary,u,h]of [[5,9.18,2.92],[-5,13.38,2.91],[-5,13.90,3.38],[3,18.19,2.43],[3,17.12,2.92]])for(const offset of [-3,0,3]){
   await p.evaluate(({boundary,u,h})=>{__renderSentinel.position.set(boundary+Math.sign(boundary)*.18,h,-u);__renderSentinel.rotation.y=Math.PI/2;},{boundary,u,h});
   await place(['opaque-wall',0,u+offset,Math.atan2(boundary,-offset),Math.atan2(h-1.65,Math.hypot(boundary,offset))]);const count=await pixels();audit.sentinels.push({boundary,u,h,offset,pixels:count});assert.equal(count,0,'Outside world visible through plaster window');
  }
  await p.evaluate(()=>{__canopyProbe.scene.remove(__renderSentinel);__renderSentinel.geometry.dispose();__renderSentinel.material.dispose();});
  await place(fixtures[0]);await p.keyboard.press('Escape');const elapsed=await p.evaluate(()=>__underGreen.run.elapsed);await p.evaluate(()=>advanceTime(500));assert.equal(await p.evaluate(()=>__underGreen.run.elapsed),elapsed);await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[0]);await shot('reduced');
 }
 await p.close();
}
assert.equal(audits[0].outsideCount,audits[1].outsideCount);assert.equal(audits[0].outsideHash,audits[1].outsideHash,'Geometry outside gallery render changed');for(const a of rows.filter(r=>r.before)){const z=rows.find(r=>!r.before&&r.name===a.name);assert.deepEqual(a.player,z.player);assert.deepEqual(a.graphics.resolution,z.graphics.resolution);assert.deepEqual(a.graphics.lights,z.graphics.lights);assert.equal(a.graphics.textures,z.graphics.textures,a.name+' textures');assert.equal(a.graphics.programs,z.graphics.programs,a.name+' programs');}
assert.equal(audits[1].render.patches.length,6);assert.equal(audits[1].render.exposedBrickWindows,5);assert.equal(audits[1].render.maximumIntrusion,.126);
for(const name of ['pump-control','keeper-control'])assert.deepEqual(fs.readFileSync(`${out}/before-${name}-2560.jpg`),fs.readFileSync(`${out}/after-${name}-2560.jpg`),'Changed outside-gallery pixels');
const old=fs.readFileSync(out+'/before-deposit.bin'),fresh=fs.readFileSync(out+'/after-deposit.bin');let changed=0;for(let i=0;i<old.length;i++){if(i%4===1||i%4===3)assert.equal(fresh[i],old[i],'Sand/wear masks changed');else if(fresh[i]!==old[i]){assert.fail('Ground deposits changed');assert(fresh[i]>old[i]);const pixel=Math.floor(i/4),x=-36+(pixel%1024+.5)/1024*64,y=80-(Math.floor(pixel/1024)+.5)/1024*84;assert((x> -5.05&&x<5.05&&y>7.5&&y<20.2),'Deposit leaked outside authored runoff fans');changed++;}}assert.equal(changed,0);audits[1].changedDepositBytes=changed;assert.deepEqual(errors,[]);if(!preview)assertPixelFidelity(pixelChecks,software);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,preview,rows,audits,pixelChecks,errors},null,2));console.log(JSON.stringify({passed:true,software,views:rows.length,outside:audits[1].outsideCount,cameras:audits[1].clearance?.samples,sentinels:audits[1].sentinels?.length,pixelChecks}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

