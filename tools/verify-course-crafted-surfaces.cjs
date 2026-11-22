const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const before=false,software=process.argv.includes('--software');
 const out='output/level-one-crafted-surfaces/'+(before?'before':'after')+(software?'-software':'');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__surfaceTest={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__surfaceScene=()=>({renderer,world,camera});'}));
 const draw=()=>page.evaluate(async()=>{__surfaceTest.render();await RCScene3D.whenPresented();});
 try{
  await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__surfaceTest);await page.locator('#game').click();
  await page.evaluate(()=>{const t=__surfaceTest,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,mode:'patrol'});Object.assign(s.player,{x:0,y:200,yaw:0,pitch:-.16});RCSpatialControls.set('resolution',1);});await draw();await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:150000});await draw();
  const snapshot=()=>page.evaluate(()=>{const {renderer,world}=__surfaceScene(),materials=new Set(),geometry=new Set(),textures=new Set(),lights=[];world.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.isLight)lights.push([o.name,o.type,o.intensity]);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){materials.add(m);if(m.map)textures.add(m.map);}});return {geometry:geometry.size,materials:materials.size,textures:textures.size,programs:renderer.info.programs.length,crafted:[...textures].map(t=>t.name).filter(n=>n.startsWith('CourseCraftedSurface:')).sort(),lights,stats:RCScene3D.stats()};});
  const views=[];
  for(const [name,x,y,yaw,pitch]of [['ground',0,200,0,-.24],['stone',-12,233,0,-.07],['service',-80,210,-1.3,0],['opening',0,1,0,-.08]]){
   await page.evaluate(v=>Object.assign(__surfaceTest.state.player,v),{x,y,yaw,pitch});await draw();await page.screenshot({path:out+'/'+name+'-2560.png'});views.push({name,...await snapshot()});
  }
  for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await page.evaluate(()=>Object.assign(__surfaceTest.state.player,{x:0,y:200,yaw:0,pitch:-.24}));await draw();await page.screenshot({path:out+'/ground-'+width+'.png'});}
  assert.equal(views[0].stats.pathLanterns.pairs.length*2,28);assert.equal(views[0].lights.find(l=>l[1]==='AmbientLight')[2],.28);
  if(!before)assert(views[0].crafted.length>=6,'Crafted maps must be used by actual scene objects');
  const materialTests=await page.evaluate(async before=>{
   const old=await import('./course-surfaces.js'),next=await import('./course-crafted-surfaces.js'),types=['wood','paint','brass','iron','stone','rubber','rust'];
   const cache=new Map(),factory=before?old.createCourseSurfaces(cache):next.createCraftedCourseSurfaces(cache);
   const board=document.createElement('div');board.id='material-board';Object.assign(board.style,{position:'fixed',inset:'0 auto auto 0',zIndex:9999,background:'#18211f',padding:'20px',display:'grid',gridTemplateColumns:'repeat(4, 256px)',gap:'16px',color:'#eee',font:'18px monospace'});
   const result=[];
   for(const type of types){const t=factory.texture(type),canvas=t.image,cell=document.createElement('div'),label=document.createElement('div');label.textContent=type;cell.append(label,canvas);Object.assign(canvas.style,{width:'256px',height:'256px',imageRendering:'pixelated'});board.append(cell);const data=canvas.getContext('2d').getImageData(0,0,128,128).data;let adjacent=0,delta=0;for(let y=0;y<128;y++)for(let x=0;x<127;x++){const k=(y*128+x)*4;let d=0;for(let c=0;c<3;c++)d+=Math.abs(data[k+c]-data[k+4+c]);if(d>18)adjacent++;delta+=d;}result.push({type,cached:t===factory.texture(type),width:canvas.width,height:canvas.height,edgeFraction:adjacent/(128*127),meanAdjacentDelta:delta/(128*127*3)});}
   const fallback=factory.texture('paper');result.push({type:'paper',fallback:!!fallback,cached:fallback===factory.texture('paper')});document.body.append(board);window.__surfaceBoardFactory=factory;return result;
  },before);
  await page.setViewportSize({width:1280,height:800});await page.locator('#material-board').screenshot({path:out+'/materials.png'});await page.evaluate(()=>{document.getElementById('material-board').remove();__surfaceBoardFactory.dispose();});
  for(const t of materialTests)assert(t.cached);assert(materialTests.at(-1).fallback);
  await page.setViewportSize({width:1280,height:720});await draw();const stable=await snapshot();
  // Camera motion and repeated draws must reuse immutable maps/programs.
  for(let i=0;i<24;i++){await page.evaluate(()=>__surfaceTest.state.player.yaw+=.03);await draw();}
  const moved=await snapshot();assert.equal(moved.textures,stable.textures);assert.equal(moved.geometry,stable.geometry);assert.equal(moved.programs,stable.programs);
  await page.evaluate(()=>Object.assign(__surfaceTest.state.player,{x:0,y:200,yaw:0,pitch:-.24}));await draw();
  const position=()=>page.evaluate(()=>({x:__surfaceTest.state.player.x,y:__surfaceTest.state.player.y,mode:__surfaceTest.state.mode}));
  const start=await position();await page.keyboard.down('ArrowUp');await page.evaluate(()=>advanceTime(500));await page.keyboard.up('ArrowUp');const walked=await position();
  assert(Math.hypot(walked.x-start.x,walked.y-start.y)>1,'Real keyboard input must move the player');
  await page.keyboard.press('Escape');await draw();const paused=await position();assert.equal(paused.mode,'paused');
  await page.keyboard.down('ArrowUp');await page.evaluate(()=>advanceTime(250));await page.keyboard.up('ArrowUp');assert.deepEqual(await position(),paused);
  await page.keyboard.press('Escape');await draw();assert.equal((await position()).mode,'first_hole');await page.screenshot({path:out+'/keyboard-play-1280.png'});
  assert.deepEqual(errors,[]);const report={passed:true,before,software,views,materialTests,controls:{start,walked,paused,resumed:await position()},stable:{textures:stable.textures,geometry:stable.geometry,programs:stable.programs},errors};
  fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,before,software,crafted:views[0].crafted,stable:report.stable,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
