const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const software=process.argv.includes('--software'),before=false,base='output/level-one-sign-family',out=base+'/'+(before?'before':'all')+'-'+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__familyGame={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__familyScene=()=>({world,renderer,camera});'}));
 const draw=()=>page.evaluate(async()=>{__familyGame.render();await RCScene3D.whenPresented();});
 const shot=async(name,anchor,side=1)=>{
  const actual=await page.evaluate(({a,side})=>{const yaw=a.yaw||(a.id==='audit-bell'&&!a.junction?-Math.PI/2:['shed-key','sprinkler'].includes(a.id)?Math.PI/2:0),distance=2.8*(a.size||(a.id==='shed-exit'?1.3:a.id==='drain-exit'?1.15:1));let x=a.x+Math.sin(yaw)*side*distance/.1152,y=a.y-Math.cos(yaw)*side*distance/.16;
   if(Math.abs(x)>112||__familyGame.obstacleAtPosition(x,y,2.4)){search:for(let ring=1;ring<=8;ring++)for(let i=0;i<16;i++){const xx=x+Math.cos(i*Math.PI/8)*ring*3,yy=y+Math.sin(i*Math.PI/8)*ring*3;if(Math.abs(xx)<112&&yy>1&&yy<719&&!__familyGame.obstacleAtPosition(xx,yy,2.4)){x=xx;y=yy;break search;}}}
   const legal=Math.abs(x)<113&&!__familyGame.obstacleAtPosition(x,y,2.4);Object.assign(__familyGame.state.player,{x,y,yaw:Math.atan2((a.x-x)*.72,a.y-y),pitch:Math.atan2(a.height-1.55,Math.hypot((a.x-x)*.1152,(a.y-y)*.16))});return {x,y,legal};},{a:anchor,side});assert(actual.legal,name+' legal approach');await draw();await page.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:93});views.push({name,...actual});
 };
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__familyGame);await page.locator('#game').click();
  await page.evaluate(()=>{const s=__familyGame.state;__familyGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,clearNavigation:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});
  await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});await draw();
  const initial=await page.evaluate(()=>{const r=__familyScene(),root=r.world.getObjectByName('ObjectiveWayfinding');return {cues:RCScene3D.stats().objectiveCues,lanterns:RCScene3D.stats().pathLanterns,ambient:r.world.children.filter(o=>o.isAmbientLight).map(o=>o.intensity),memory:{...r.renderer.info.memory},programs:r.renderer.info.programs.length,worldLights:(()=>{let n=0;r.world.traverse(o=>{if(o.isLight)n++;});return n;})(),bytes:root.children.filter(o=>o.isMesh).reduce((n,o)=>n+Object.values(o.geometry.attributes).reduce((s,a)=>s+a.array.byteLength,0),0)};});
  assert.equal(initial.cues.visibleSigns,15);assert.equal(initial.lanterns.pairs.length*2,28);assert.deepEqual(initial.ambient,[.28]);
  for(const [i,a]of initial.cues.anchors.entries()){
   await shot(i+'-'+a.id+'-front',a);
   if(!a.junction&&!a.id.endsWith('-exit'))await shot(i+'-'+a.id+'-back',a,-1);
  }
  let lighting=null;
  if(!before){
   assert.equal(initial.cues.readingFixtures.fixtures,25);assert.equal(initial.cues.readingFixtures.worldLights,0);
   lighting=await page.evaluate(async()=>{
    const T=await import('./vendor/three/three.module.js'),{createCourseSignFamilyLighting}=await import('./course-sign-family-lighting.js'),r=__familyScene(),root=r.world.getObjectByName('ObjectiveWayfinding'),body=root.getObjectByName('CourseSignFrames'),faces=root.getObjectByName('CourseSignFaces'),anchors=RCScene3D.stats().objectiveCues.anchors;
    const rt=new T.WebGLRenderTarget(256,192),old=r.renderer.getRenderTarget(),refScene=new T.Scene(),cam=new T.PerspectiveCamera(26,256/192,.05,20),ray=new T.Raycaster(),results=[],reference=createCourseSignFamilyLighting();
    const actualMaterials=[reference.material({vertexColors:true}),reference.material({map:faces.material[0].map,vertexColors:true})],refMaterials=[new T.MeshLambertMaterial({vertexColors:true}),new T.MeshLambertMaterial({map:faces.material[0].map,vertexColors:true})];
    const meshes=[new T.Mesh(body.geometry.clone(),actualMaterials[0]),new T.Mesh(faces.geometry.clone(),actualMaterials[1])];meshes.forEach(m=>refScene.add(m));r.renderer.setRenderTarget(rt);
    const render=()=>{r.renderer.clear();r.renderer.render(refScene,cam);const a=new Uint8Array(256*192*4);r.renderer.readRenderTargetPixels(rt,0,0,256,192,a);return a;};
    try{for(const a of anchors){if(a.id==='audit-approach')continue;const center=new T.Vector3(a.x*.1152,a.height,-a.y*.16),forward=new T.Vector3(Math.sin(a.yaw),0,Math.cos(a.yaw)),size=a.size||1,lamps=[];
      for(let k=0;k<2;k++){const g=meshes[k].geometry,c=g.attributes.courseSignCenter;let start=-1,end=-1;for(let i=0;i<c.count;i++)if(Math.abs(c.getX(i)-center.x)<1e-5&&Math.abs(c.getY(i)-center.y)<1e-5&&Math.abs(c.getZ(i)-center.z)<1e-5){if(start<0)start=i;end=i+1;}if(start<0)throw Error('Missing board vertices '+a.id);g.setDrawRange(k?start/4*6:start,k?(end-start)/4*6:end-start);}
      for(const side of a.junction?[1]:[1,-1]){const lamp=new T.SpotLight(0xffdda2,1.2*size*size,1.85*size,1.4,.22,2);lamp.position.copy(center).addScaledVector(forward,.37*size*side);lamp.position.y+=.457*size;lamp.target.position.copy(center).addScaledVector(forward,.055*size*side);lamp.target.position.y-=.04*size;refScene.add(lamp,lamp.target);lamps.push(lamp);lamp.visible=false;}
      for(const side of a.junction?[1]:[1,-1]){
       cam.position.copy(center).addScaledVector(forward,3.4*size*side);cam.lookAt(center);cam.updateMatrixWorld();meshes.forEach((m,i)=>m.material=actualMaterials[i]);reference.power.value=1.2;const actual=render();reference.power.value=0;const off=render();reference.power.value=1.2;const restored=render();
       meshes.forEach((m,i)=>m.material=refMaterials[i]);lamps.forEach(l=>l.visible=true);const expected=render();lamps.forEach(l=>l.visible=false);
       let max=0,changed=0,onTotal=0,offTotal=0,recovery=0;for(let i=0;i<actual.length;i++){max=Math.max(max,Math.abs(actual[i]-expected[i]));if(actual[i]!==expected[i])changed++;if(actual[i]!==restored[i])recovery++;if(i%4!==3){onTotal+=actual[i];offTotal+=off[i];}}
       const lamp=lamps[side===1?0:1];let blocked=0,samples=0;for(let row=0;row<5;row++)for(let col=0;col<9;col++){const right=new T.Vector3(Math.cos(a.yaw),0,-Math.sin(a.yaw)),target=center.clone().addScaledVector(right,(-.70+col*.175)*size).addScaledVector(forward,.056*size*side);target.y+=(-.32+row*.16)*size;const d=target.clone().sub(lamp.position);ray.set(lamp.position,d.clone().normalize());ray.near=.002;ray.far=d.length()-.002;samples++;if(ray.intersectObject(body,false).length)blocked++;}
       results.push({id:a.id,junction:a.junction,side,max,changed,onTotal,offTotal,recovery,blocked,samples});
      }for(const lamp of lamps){lamp.removeFromParent();lamp.target.removeFromParent();lamp.dispose();}
     }return results;
    }finally{r.renderer.setRenderTarget(old);rt.dispose();meshes.forEach(m=>m.geometry.dispose());[...actualMaterials,...refMaterials].forEach(m=>m.dispose());}
   });
   fs.writeFileSync(out+'/lighting.json',JSON.stringify(lighting,null,2));
   for(const a of lighting){assert(a.max<=2,JSON.stringify(a));assert(a.onTotal>a.offTotal+10000,JSON.stringify(a));assert.equal(a.recovery,0);assert.equal(a.blocked,0,JSON.stringify(a));}
  }
  const target=initial.cues.anchors[0];for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await shot('audit-'+width,target);}
  if(!before){const toggle=await page.evaluate(()=>{__familyGame.state.clearNavigation=false;});await draw();const hidden=await page.evaluate(()=>{const r=__familyScene().world.getObjectByName('ObjectiveWayfinding');return {visible:r.getObjectByName('CourseNavigationReadingLenses').visible,cues:RCScene3D.stats().objectiveCues};});assert.equal(hidden.visible,false);assert.equal(hidden.cues.visibleSigns,1);assert.equal(hidden.cues.batches,3);}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,before,initial,views,lighting,errors},null,2));console.log(JSON.stringify({passed:true,software,before,views:views.length,lighting,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
