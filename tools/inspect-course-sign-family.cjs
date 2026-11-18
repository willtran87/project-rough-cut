const fs=require('node:fs');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const {chromium}=require('playwright');
(async()=>{
 const out='output/level-one-sign-family';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/objective-cues.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(out+'/baseline/objective-cues.js','utf8')}));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__signProbe={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__signProbeScene=()=>({world,renderer,practicalLighting,glowAnchors});'}));
 const draw=()=>page.evaluate(async()=>{__signProbe.render();await RCScene3D.whenPresented();});
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__signProbe);await page.locator('#game').click();
  await page.evaluate(()=>{const s=__signProbe.state;__signProbe.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,clearNavigation:false,guidedHints:false,apparitions:false,reducedMotion:true});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});
  for(const mode of ['before','lit']){
   if(mode==='lit')await page.evaluate(async()=>{const T=await import('./vendor/three/three.module.js'),r=__signProbeScene();for(const mesh of r.world.getObjectByName('ObjectiveWayfinding').children.filter(o=>o.isMesh)){mesh.geometry.computeVertexNormals();const make=old=>{const m=new T.MeshLambertMaterial({map:old.map,vertexColors:true});r.practicalLighting.apply(m);return m;};mesh.material=Array.isArray(mesh.material)?mesh.material.map(make):make(mesh.material);}});
   if(mode==='staged'){await page.evaluate(()=>__signProbe.state.clearNavigation=false);await draw();await page.evaluate(()=>{const root=__signProbeScene().world.getObjectByName('ObjectiveWayfinding'),d=RCScene3D.stats().objectiveCues.approachDraw;for(let j=0;j<2;j++){const geo=root.children[j].geometry,p=geo.attributes.position,start=j?geo.index.getX(d.sign.start):d.body.start,count=j?4:d.body.count;if(!Number.isFinite(count)||count>p.count)throw Error('Expected finite approach draw range');for(let i=start;i<start+count;i++)p.setXYZ(i,p.getX(i)-.6,p.getY(i),p.getZ(i)-5.1);p.needsUpdate=true;geo.computeBoundingSphere();}});}
   for(const [name,x,y,tx,ty]of [['opening',0,10,0,100],['front',-12,20,-22,40],['station',62,148,86,148],['log',-30,374,-48,374],['review',30,608,52,608],['key',85,420,80,440],...(mode==='staged'?[['approach',-10,50,-27.2083,71.875]]:[])]){await page.evaluate(v=>{Object.assign(__signProbe.state.player,v);__signProbe.state.clearNavigation=v.y>100;},{x,y,yaw:Math.atan2((tx-x)*.72,ty-y),pitch:y>100?.42:0});await draw();await page.screenshot({path:out+'/'+mode+'-'+name+'.jpg',type:'jpeg',quality:90});}
  }
  const sources=await page.evaluate(()=>{const r=__signProbeScene();return {lamps:r.practicalLighting.stats().sources,anchors:RCScene3D.stats().objectiveCues.anchors};});fs.writeFileSync(out+'/probe.json',JSON.stringify({sources,errors},null,2));console.log(JSON.stringify({errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
