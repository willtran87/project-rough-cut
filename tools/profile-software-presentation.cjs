const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=true,out='output/software-wet-performance-20261108/final-comparison';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__ir={state,resetFirstHole,render,valve:activeSprinklerPoint,wetStateAt,zones:SPRINKLER_SOAK_ZONES,escapeFilingPreview};\n  window.advanceTime = (milliseconds) => {')}));
 await page.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('const schedule=document.hidden?requestAnimationFrame:fn=>setTimeout(fn,8);','const schedule=(window.__baselinePresentation||document.hidden)?requestAnimationFrame:fn=>setTimeout(fn,8);').replace('const nativePixels=softwareRenderer&&pixelStyle&&worldDrawn&&useDomHud;', 'const nativePixels=!window.__baselinePresentation&&softwareRenderer&&pixelStyle&&worldDrawn&&useDomHud;')+`\nObject.defineProperty(window,'__presentRenderer',{get:()=>renderer});window.__irGpu=()=>{const m=world.getObjectByName('IrrigationSpray');return {programs:renderer.info.programs.length,textures:renderer.info.memory.textures,sprinklers:sprinklerSpray.stats(),wet:wetGround.stats(),needle:pickups.valve.pressureNeedle.rotation.z,matrices:Array.from(m.instanceMatrix.array.slice(0,m.count*16))};};`}));
 const render=async()=>{await page.evaluate(()=>__ir.render());await page.evaluate(async()=>RCScene3D.whenPresented());};
 const position=async(x,y,tx,ty,pitch=0)=>{await page.evaluate(({x,y,tx,ty,pitch})=>{const s=__ir.state;Object.assign(s.player,{x,y,yaw:Math.atan2((tx-x)*.72,ty-y),pitch});s.hole.interactionPromptOwner=null;s.hole.messageTimer=s.hole.zoneBannerTimer=0;s.hole.prompt='';},{x,y,tx,ty,pitch});await render();};
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');await page.waitForFunction(()=>window.__ir&&JSON.parse(render_game_to_text()).assets.course.ready);
  await page.evaluate(()=>{const t=__ir,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});Object.assign(s.hole,{tutorialVisible:false,elapsed:100,detection:0,hasLineOfSight:false});s.hole.practiceDrill.active=false;Object.assign(s.hole.joe,{x:110,y:700,mode:'patrol',patrolPause:9999});t.render();});await page.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});

  await page.evaluate(()=>{RCSpatialControls.set('resolution',.5);__ir.state.hole.sprinklerSoakTimer=18;});
  const rows=[];
  for(const [name,x,y,yaw,pitch] of [['wet-pond',6.2,219.9,0,-.18],['pond',-63,187,0,-.33],['opening',0,65,0,0],['border',100,340,1.57,0]]){
   await page.evaluate(v=>Object.assign(__ir.state.player,v),{x,y,yaw,pitch});
   const blocks=[];
   for(const width of [1280,640,640,1280]){
    const sample=await page.evaluate(async width=>{
     window.__baselinePresentation=width===1280;const samples=[];
     for(let i=0;i<24;i++){const start=performance.now();__ir.render();await RCScene3D.whenPresented();if(i>=4)samples.push(performance.now()-start);}
     samples.sort((a,b)=>a-b);return {width,median:(samples[9]+samples[10])/2,p95:samples[18],max:samples[19],resolution:RCScene3D.stats().resolution};
    },width);
    blocks.push(sample);console.log(JSON.stringify({name,...sample}));
   }
   for(const width of [1280,640]){await page.evaluate(w=>window.__baselinePresentation=w===1280,width);await render();await page.screenshot({path:out+'/'+name+'-'+width+'.png'});}
   rows.push({name,blocks});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/presentation.json',JSON.stringify({rows,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
