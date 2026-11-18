const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const before=process.argv.includes('--before'),software=process.argv.includes('--software');
 const base='output/level-one-woodland-composition',out=base+'/'+(before?'before':'after')+'-'+(software?'software':'native');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__woodGame={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(before?base+'/baseline/scene-3d.js':'web/scene-3d.js','utf8')+'\nwindow.__woodScene=()=>({world,renderer,camera,currentData,courseWind});'}));
 const draw=()=>page.evaluate(async()=>{__woodGame.render();await RCScene3D.whenPresented();});
 const shot=async(name,x,y,yaw,pitch)=>{
  const legal=await page.evaluate(v=>{if(__woodGame.obstacleAtPosition(v.x,v.y,2.4)){search:for(let ring=1;ring<=6;ring++)for(let a=0;a<12;a++){const x=v.x+Math.cos(a*Math.PI/6)*ring*6,y=v.y+Math.sin(a*Math.PI/6)*ring*6;if(Math.abs(x)<108&&y>1&&y<710&&!__woodGame.obstacleAtPosition(x,y,2.4)){v.x=x;v.y=y;break search;}}}Object.assign(__woodGame.state.player,v);return !__woodGame.obstacleAtPosition(v.x,v.y,2.4);},{x,y,yaw,pitch});assert(legal,name+' is a legal view');await draw();await page.screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:94});
  views.push(await page.evaluate(name=>{const r=__woodScene(),s=RCScene3D.stats();return {name,position:r.camera.position.toArray(),resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles};},name));
 };
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__woodGame);await page.locator('#game').click();
  await page.evaluate(()=>{const s=__woodGame.state;__woodGame.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true,effectsDensity:0});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});RCSpatialControls.set('resolution',1);});
  await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready&&RCScene3D.stats().pixelArt.pending===0,null,{timeout:180000});await draw();
  const inventory=await page.evaluate(()=>{const r=__woodScene(),s=RCScene3D.stats(),poses=[];r.world.traverse(o=>{if(o.userData.courseWoodland)poses.push({...o.userData.courseWoodland,position:o.position.toArray()});});return {trees:s.pixelWorld.objects.filter(o=>o.kind==='tree'),cover:s.pixelWorld.objects.filter(o=>['hedge','stone'].includes(o.kind)),poses,lights:r.world.children.filter(o=>o.isAmbientLight||o.isHemisphereLight||o.isDirectionalLight).map(o=>({type:o.type,intensity:o.intensity})),lanterns:s.pathLanterns,treePreparation:s.pixelWorld.treePreparation,resources:{...r.renderer.info.memory}};});
  assert.equal(inventory.trees.length,137);assert.equal(inventory.lanterns.pairs.length*2,28);
  if(!before){const baseline=JSON.parse(fs.readFileSync(base+'/before-native/report.json','utf8')).inventory;assert.deepEqual(JSON.parse(JSON.stringify(inventory.cover)),baseline.cover);assert.deepEqual(inventory.lights,baseline.lights);assert.deepEqual(inventory.lanterns,baseline.lanterns);assert(inventory.poses.filter(p=>p.amount>0).length>20);for(const p of inventory.poses){assert(Math.abs(p.x)>=Math.abs(p.original[0]));assert(p.scale>=.68&&p.scale<=1);assert.equal(p.z,p.original[1]);}for(let i=0;i<inventory.trees.length;i++){const a=inventory.trees[i],b=baseline.trees[i];assert.equal(a.form,b.form);if(!inventory.poses.some(p=>p.x===a.position[0]&&p.z===a.position[2]))assert.deepEqual(JSON.parse(JSON.stringify(a)),b);}}
  for(const v of [['opening',0,40,0,.18],['audit-east',95,120,1.57,.20],['audit-oblique',75,145,1.10,.12],['arrival-west',-90,50,-1.57,.18],['water-west',-95,170,-1.57,.18],['green-east',95,463,1.57,.18],['range-west',-95,570,-1.57,.18],['range-east',95,650,1.57,.18],['service',-80,210,-1.3,0],['clubhouse',55,302,1.0,.03]])await shot(...v);
  for(const [w,h]of [[1280,720],[390,844]]){await page.setViewportSize({width:w,height:h});await shot('audit-east-'+w,95,120,1.57,.20);}
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,inventory,views,errors},null,2));console.log(JSON.stringify({passed:true,before,software,trees:inventory.trees.length,changed:inventory.poses.filter(p=>p.amount>0).length,views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
