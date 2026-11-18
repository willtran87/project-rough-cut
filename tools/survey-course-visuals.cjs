// Current-state art survey, not a claim of whole-level acceptance.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/level-one-visual-survey/current';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__survey={state,resetFirstHole,render,obstacleAtPosition};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__surveyScene=()=>({world,renderer,camera,currentData});'}));
 const draw=()=>page.evaluate(async()=>{__survey.render();await RCScene3D.whenPresented();});
 try{
  await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__survey);await page.locator('#game').click();
  await page.evaluate(()=>{const s=__survey.state;__survey.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});s.keys.clear();Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol',patrolPause:9999});RCSpatialControls.set('resolution',1);});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});await draw();
  const inventory=await page.evaluate(()=>{const {currentData,world,renderer}=__surveyScene(),s=RCScene3D.stats(),plants=[];world.traverse(o=>{if(o.name.startsWith('CourseUnderstory-'))plants.push({name:o.name,count:o.count,material:o.material.type,map:[o.material.map.image.width,o.material.map.image.height]});});return {data:currentData,objects:s.pixelWorld.objects,plants,resources:renderer.info.memory,programs:renderer.info.programs.length};});
  for(const [name,x,y,yaw,pitch]of [
   ['opening',0,10,0,0],['audit-row',0,100,0,0],['water-approach',-63,187,0,-.10],['water-crossing',0,240,0,0],
   ['clubhouse',55,302,1.0,.03],['service-building',-80,210,-1.3,0],['service-maze',0,379,0,0],['dead-green',0,463,0,0],
   ['night-range',0,550,0,0],['release',0,650,0,0],['drain',-78,670,0,-.10],['woodland',50,365,Math.PI/2,0],
   ['verge-close',75,60,Math.PI/2,-.22],['verge-mid',42,60,Math.PI/2,-.12]
  ]){
   const actual=await page.evaluate(v=>{const s=__survey.state;let {x,y}=v;const original={x,y};if(__survey.obstacleAtPosition(x,y,2.4)){
    const sites=[];for(let ring=1;ring<=6;ring++)for(let a=0;a<12;a++){const xx=x+Math.cos(a*Math.PI/6)*ring*6,yy=y+Math.sin(a*Math.PI/6)*ring*6;if(Math.abs(xx)<108&&yy>1&&yy<710&&!__survey.obstacleAtPosition(xx,yy,2.4))sites.push({x:xx,y:yy});}if(sites.length)({x,y}=sites[0]);
   }Object.assign(s.player,{...v,x,y});Object.assign(s.hole,{messageTimer:0,zoneBannerTimer:0});return {original,x,y,legal:!__survey.obstacleAtPosition(x,y,2.4)};},{x,y,yaw,pitch});assert(actual.legal,name+' legal view');await draw();await page.screenshot({path:out+'/'+name+'.png'});const stats=await page.evaluate(()=>{const s=RCScene3D.stats();return {resolution:s.resolution,draws:s.drawCalls,triangles:s.triangles,lanterns:s.pathLanterns.pairs.length*2,water:s.water,effects:s.effects,joe:s.joeModel};});views.push({name,...actual,yaw,pitch,...stats});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,inventory,views,errors},null,2));console.log(JSON.stringify({passed:true,views:views.map(v=>({name:v.name,x:v.x,y:v.y})),plants:inventory.plants,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
