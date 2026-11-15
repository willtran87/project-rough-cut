const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const before=process.argv.includes('--before'),out='output/woodland-refinement/'+(before?'before':'after');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const source=fs.readFileSync('web/game.js','utf8');
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {','  window.__structure={state,resetFirstHole,render,NIGHT_ORDER_ACTIONS};\n  window.advanceTime = (milliseconds) => {')}));
 const render=()=>page.evaluate(()=>__structure.render());
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.__structure&&JSON.parse(render_game_to_text()).assets.course.ready);
  await page.evaluate(()=>{const t=__structure;t.resetFirstHole();const s=t.state;s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();Object.assign(s.hole,{tutorialVisible:false,controlHintTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:100,y:100,patrolPause:9999});t.render();});
  await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:60000});
  const views=[['shed-front',-18,666,0],['shed-oblique',28,676,-.65],['shed-side',45,711,-Math.PI/2],['shed-rear',-18,744,Math.PI],['service',-89,202,-.65],['clubhouse',92,278,.60],['border-west',-95,340,-Math.PI/2],['border-east',95,460,Math.PI/2],['border-end',80,715,0],['opening',0,14,0],['border-start',-95,22,-1.57],['border-mid',95,310,1.57],['ground-path',0,65,0],['border-rear',0,5,Math.PI]];
  const records=[];let landscape=[];let trees=[];
  for(const [name,x,y,yaw] of views){await page.evaluate(p=>Object.assign(__structure.state.player,p),{x,y,yaw,pitch:0});await render();await page.screenshot({path:out+'/'+name+'.png'});records.push(await page.evaluate(()=>RCScene3D.stats().pixelWorld.objects.filter(o=>['maintenance-shed','service-building','clubhouse'].includes(o.kind))));}
  if(!before){
   const stats=await page.evaluate(()=>RCScene3D.stats());
   trees=stats.pixelWorld.objects.filter(o=>o.kind==='tree');assert.equal(new Set(trees.map(o=>o.form)).size,3,'Three seeded tree forms are present');assert(trees.length>100,'Layered forest fills the borders');
   assert.equal(stats.pixelArt.pending,0);assert.deepEqual(stats.pixelArt.errors,[]);
   landscape=stats.pixelWorld.objects.filter(o=>o.kind.startsWith('woodland-'));
   assert(landscape.some(o=>o.kind==='woodland-backdrop'),'Ground wraps behind the exit');assert(landscape.find(o=>o.kind==='woodland-entrance').bounds[0][2]>0,'Rear woodland stays beyond the start boundary');
   for(const o of landscape.filter(o=>['woodland-bank','woodland-verge'].includes(o.kind)))assert(o.bounds[0][0]>13.1||o.bounds[1][0]<-13.1,o.kind+' remains outside the playable course');
   assert(landscape.filter(o=>o.kind==='woodland-bank').every(o=>o.bounds[1][1]-o.bounds[0][1]>.3),'Forest ground has real elevation');
   await page.evaluate(()=>Object.assign(__structure.state.player,{x:108,y:340,yaw:0}));
   await page.keyboard.down('d');for(let i=0;i<90;i++)await page.evaluate(()=>advanceTime(1000/60));await page.keyboard.up('d');
   const atEdge=await page.evaluate(()=>({x:__structure.state.player.x,y:__structure.state.player.y}));assert(atEdge.x>=108&&atEdge.x<=112,'Original course edge stops outward movement');
   await page.keyboard.down('w');for(let i=0;i<30;i++)await page.evaluate(()=>advanceTime(1000/60));await page.keyboard.up('w');
   assert(await page.evaluate(y=>__structure.state.player.y>y+2,atEdge.y),'Forward movement along the border stays open');
   assert.deepEqual(await page.evaluate(()=>RCScene3D.stats().pixelWorld.objects.filter(o=>o.kind.startsWith('woodland-'))),landscape,'Landscape stays fixed while moving');
   assert.deepEqual(await page.evaluate(()=>RCScene3D.stats().pixelWorld.objects.filter(o=>o.kind==='tree')),trees,'Tree crowns stay fixed while moving');
   await page.screenshot({path:out+'/border-walk.png'});
   for(const [width,height] of [[1280,720],[800,600],[844,390]]){
    await page.setViewportSize({width,height});await page.evaluate(width=>{__structure.state.inputMethod=width===844?'touch':'keyboard';Object.assign(__structure.state.player,{x:-95,y:340,yaw:-Math.PI/2});},width);await render();await page.screenshot({path:out+'/woodland-'+width+'.png'});
   }
   await page.setViewportSize({width:2560,height:1600});await page.evaluate(()=>__structure.state.inputMethod='keyboard');


   for(const kind of ['maintenance-shed','service-building','clubhouse']){const o=records[0].find(o=>o.kind===kind);assert(o,kind+' has a model');assert(o.bounds[1][2]-o.bounds[0][2]>2,kind+' has real depth');assert(!stats.illustrated.counts[kind],kind+' must not use a whole-building card');}
   for(const r of records)assert.deepEqual(r,records[0],'Camera movement must not turn or reshape buildings');
   assert(records[0].find(o=>o.kind==='clubhouse').bounds[0][0]>13.1,'Clubhouse stays beyond the playable boundary');assert(records[0].find(o=>o.kind==='service-building').bounds[1][0]<-13.1,'Service building stays beyond the playable boundary');
   await page.evaluate(()=>{const s=__structure.state;s.hole.keyCollected=true;s.hole.nightOrderActionsCompleted=__structure.NIGHT_ORDER_ACTIONS.map(a=>a.id);Object.assign(s.player,{x:-18,y:690,yaw:0});});await render();
   await page.keyboard.press('Enter');await page.evaluate(()=>advanceTime(220));await page.screenshot({path:out+'/shed-filing.png'});
   const filing=await page.evaluate(()=>({active:__structure.state.hole.escapeFiling.active,door:RCScene3D.stats().pixelWorld.objects.find(o=>o.kind==='shed-door')}));
   assert(filing.active,'Use starts the filing interaction');
   for(let i=0;i<150;i++){await page.evaluate(()=>advanceTime(1000/60));if(await page.evaluate(()=>__structure.state.hole.escapeFiling.sealing))break;}
   for(let i=0;i<18;i++)await page.evaluate(()=>advanceTime(1000/60));
   const sealing=await page.evaluate(()=>({active:__structure.state.hole.escapeFiling.sealing,door:RCScene3D.stats().pixelWorld.objects.find(o=>o.kind==='shed-door')}));
   assert(sealing.active,'Filing progresses to the seal stage');assert(sealing.door.rotation[1]>.2,'Real hinged door swings inward during sealing');await page.screenshot({path:out+'/shed-open.png'});
   await page.evaluate(()=>{for(let i=0;i<20;i++)__structure.render();});assert.deepEqual(await page.evaluate(()=>RCScene3D.stats().pixelWorld.objects.find(o=>o.kind==='shed-door').rotation),sealing.door.rotation,'Repeated rendering cannot advance the sealed door');
   for(const [width,height] of [[1280,720],[800,600],[844,390]]){await page.setViewportSize({width,height});await page.evaluate(()=>Object.assign(__structure.state.player,{x:-18,y:670,yaw:0}));await render();await page.screenshot({path:out+'/shed-'+width+'.png'});}
   await page.evaluate(()=>advanceTime(500));assert.equal(await page.evaluate(()=>__structure.state.mode),'victory','The shed model preserves successful exit completion');
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,errors,buildings:records[0],landscape,trees},null,2));console.log(JSON.stringify({passed:true,before,errors,buildings:records[0].map(o=>o.kind)}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
