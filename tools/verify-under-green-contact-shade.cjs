const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-upgrade/contact-shade/${software?'software':'hardware'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/under-green-scene.js',route=>{let s=fs.readFileSync('web/under-green-scene.js','utf8');s=s.replace(' return {draw,drainJoeFootsteps:',' window.__contactAudit={scene,renderer,contactShade,structureMeshes,joe}; return {draw,drainJoeFootsteps:');return route.fulfill({contentType:'application/javascript',body:s});});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__contactAudit&&window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:180000});await p.click('#primary');await p.keyboard.press('Escape');
  const fixtures=[{name:'gallery',x:0,y:12,yaw:0},{name:'entrance-root',x:3.4,y:10.6,yaw:Math.PI/2},{name:'crossing-root',x:-1.2,y:27.2,yaw:-Math.PI/2},{name:'pump-feet',x:-23,y:43,yaw:-Math.PI/2,pitch:-.2},{name:'keeper',x:12,y:23,yaw:Math.PI},{name:'high-flood',x:0,y:12,yaw:0,pitch:-.35,elapsed:49},{name:'joe-feet',x:0,y:51,yaw:0,pitch:-.3,joe:true}];
  async function place(f){await p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js'),{settleWeapon}=await import('./under-green-clearance.js'),r=createRun();r.mode='playing';r.time=90;r.elapsed=f.elapsed??0;r.bypass=true;r.bypassAt=20;r.lessonCrossed=true;Object.assign(r.player,{pitch:0,...f});Object.assign(r.joe,f.joe?{x:0,y:54,yaw:Math.PI,phase:'walk',age:0,speed:0,walk:0}:{phase:'absent'});settleWeapon(r,1/60);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);}
  for(const f of fixtures){
   await place(f);
   const difference=await p.evaluate(()=>{const a=__contactAudit,gl=a.renderer.getContext();const pixels=enabled=>{a.contactShade.setEnabled(enabled);a.scene.traverse(m=>{if(m.name.startsWith('Joe contact shade'))m.visible=enabled;});advanceTime(0);const b=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,b);return b;};const before=pixels(false),after=pixels(true);let changed=0,darker=0,lighter=0,max=0,maxLightening=0;for(let i=0;i<before.length;i+=4){let diff=0;for(let j=0;j<3;j++){diff+=before[i+j]-after[i+j];max=Math.max(max,Math.abs(before[i+j]-after[i+j]));maxLightening=Math.max(maxLightening,after[i+j]-before[i+j]);}if(diff)changed++;if(diff>0)darker++;if(diff<0)lighter++;}return {changed,darker,lighter,max,maxLightening,stats:a.contactShade.stats(),resolution:[gl.drawingBufferWidth,gl.drawingBufferHeight],flood:JSON.parse(render_game_to_text()).graphics.flood};});
   if(f.elapsed===49)assert.equal(difference.flood.depth,.38);assert(difference.changed>0,f.name+' has no actual shading contribution');assert(difference.darker>difference.lighter,f.name+' should darken contact');assert.equal(difference.maxLightening,0,f.name+' contact shade must not brighten surfaces');assert.equal(difference.stats.draws,2);views.push({name:f.name,...difference});await p.screenshot({path:`${out}/${f.name}-2560.png`});console.log(JSON.stringify({name:f.name,changed:difference.changed,draws:difference.stats.draws}));
  }
  const support=await p.evaluate(async()=>{
   const T=await import('./vendor/three/three.module.js'),{floorLayout}=await import('./under-green-course.js'),a=__contactAudit,walls=floorLayout().walls;
   __underGreen.inspectCameraClearance([]);a.scene.updateMatrixWorld(true);
   const root=a.scene.getObjectByName('Root masonry contact shade'),pos=root.geometry.attributes.position,color=root.geometry.attributes.color,ray=new T.Raycaster(),misses=[];let samples=0;
   for(let i=0;i<pos.count;i+=Math.max(1,Math.floor(pos.count/350))){
    if(color.getW(i)<=0)continue;const point=new T.Vector3().fromBufferAttribute(pos,i),w=walls.find(w=>{const vertical=w.w<w.d,b=vertical?w.x:w.y;return Math.abs(Math.abs((vertical?point.x:-point.z)-b)-.1115)<.0001&&Math.abs((vertical?-point.z:point.x)-(vertical?w.y:w.x))<=(vertical?w.d:w.w)/2+.0001;});
    if(!w){misses.push({i,reason:'No boundary'});continue;}const vertical=w.w<w.d,side=Math.sign((vertical?point.x:-point.z)-(vertical?w.x:w.y)),direction=new T.Vector3(vertical?-side:0,0,vertical?0:side);
    ray.set(point.clone().addScaledVector(direction,-.002),direction);ray.near=0;ray.far=.025;const hits=ray.intersectObjects(a.structureMeshes,false);if(!hits.length)misses.push({i,point:point.toArray(),reason:'No physical receiver'});samples++;
   }
   // Independently index the actual rendered masonry triangles by their
   // vertical plane, then check every positive-alpha ribbon vertex against
   // those triangles. This does not reuse the authoring receiver predicate.
   const planes=new Map(),v=[new T.Vector3(),new T.Vector3(),new T.Vector3()];let receiverTriangles=0;
   for(const mesh of a.structureMeshes){
    if(!['stone','rootStone','bunkerStone','pumpStone','rangeStone','keeperStone','sand'].includes(mesh.name))continue;
    const g=mesh.geometry,index=g.index,positions=g.attributes.position;
    for(let i=0;i<index.count;i+=3){
     for(let j=0;j<3;j++)v[j].fromBufferAttribute(positions,index.getX(i+j)).applyMatrix4(mesh.matrixWorld);
     for(const axis of ['x','z'])if(Math.abs(v[0][axis]-v[1][axis])<1e-5&&Math.abs(v[0][axis]-v[2][axis])<1e-5){
      const key=axis+':'+Math.round(v[0][axis]*100);if(!planes.has(key))planes.set(key,[]);
      planes.get(key).push({plane:v[0][axis],triangle:new T.Triangle(...v.map(q=>q.clone()))});receiverTriangles++;
     }
    }
   }
   let exhaustiveVertices=0;const unsupported=[];
   for(let i=0;i<pos.count;i++){
    if(color.getW(i)<=0)continue;const point=new T.Vector3().fromBufferAttribute(pos,i);let hit=false;
    for(const axis of ['x','z'])for(const candidate of planes.get(axis+':'+Math.round(point[axis]*100))||[]){
     if(Math.abs(candidate.plane-point[axis])>.025)continue;
     const projected=point.clone();projected[axis]=candidate.plane;
     if(candidate.triangle.containsPoint(projected)){hit=true;break;}
    }
    if(!hit&&unsupported.length<10)unsupported.push({i,point:point.toArray()});exhaustiveVertices++;
   }
   if(unsupported.length)throw Error('Unsupported rendered contact vertex: '+JSON.stringify(unsupported));
   return {samples,misses,exhaustiveVertices,receiverTriangles,unsupported};
  });assert.deepEqual(support.misses,[]);
  const footsteps=await p.evaluate(async()=>{const {createRun}=await import('./under-green-sim.js'),samples=[];for(const walk of [0,.15,.3,.45,.6,.75,.9,1.05]){const r=createRun();r.mode='playing';r.time=90;Object.assign(r.player,{x:0,y:51,yaw:0,pitch:-.3});Object.assign(r.joe,{x:0,y:54,yaw:Math.PI,phase:'walk',speed:1.5,walk});__underGreen.run=r;advanceTime(0);const a=__contactAudit.joe.stats();samples.push({walk,shade:a.contactShade,feet:a.soleContacts,handError:a.handError});}return samples;});
  assert(footsteps.some(s=>s.shade.some(v=>v.opacity<.2)),'Swinging foot shadow must fade');for(const sample of footsteps)for(const shade of sample.shade){assert(Math.abs(shade.position[1]-.004)<1e-8);assert(shade.opacity>=0&&shade.opacity<=.34);assert(sample.handError<.015);}
  await p.keyboard.press('Escape');const frozen=await p.evaluate(()=>__contactAudit.joe.stats().contactShade);await p.evaluate(()=>advanceTime(1000));assert.deepEqual(await p.evaluate(()=>__contactAudit.joe.stats().contactShade),frozen);await p.click('#primary');
  for(const [width,height]of [[1280,720],[390,844],[844,390]]){await p.setViewportSize({width,height});await place(fixtures[1]);await p.screenshot({path:`${out}/root-${width}.png`});}
  await p.setViewportSize({width:960,height:600});await place(fixtures[0]);
  const timing=await p.evaluate(async()=>{
   const a=__contactAudit,gl=a.renderer.getContext(),samples={enabled:[],disabled:[]};
   async function frame(enabled){a.contactShade.setEnabled(enabled);const start=performance.now();advanceTime(0);const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();while(gl.clientWaitSync(sync,0,0)===gl.TIMEOUT_EXPIRED){if(performance.now()-start>10000)throw Error('GPU timeout');await new Promise(r=>setTimeout(r,2));}gl.deleteSync(sync);return performance.now()-start;}
   for(let i=0;i<6;i++){await frame(false);await frame(true);}for(let i=0;i<24;i++)for(const enabled of(i%2?[true,false]:[false,true]))samples[enabled?'enabled':'disabled'].push(await frame(enabled));a.contactShade.setEnabled(true);
   return Object.fromEntries(Object.entries(samples).map(([key,values])=>{const sorted=[...values].sort((a,b)=>a-b);return [key,{samples:values,median:sorted[12],p95:sorted[22]}];}));
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,software,views,support,footsteps,timing,errors},null,2));console.log(JSON.stringify({passed:true,software,views:views.length+3,support,timing,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
