const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const software=process.argv.includes('--software'),out='output/under-green/visual-upgrade/keeper'+(software?'-software':'');
 const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:4187/under-green.html?test');await page.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.click('#primary');await page.keyboard.press('Escape');
  for(const f of [{name:'task-lamp',x:9.87,y:11.85,yaw:Math.PI,pitch:.72},{name:'gallery-lamp',x:-2.1,y:6.8,yaw:-.395,pitch:.68}]){
   const state=await page.evaluate(async f=>{
    const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js'),r=createRun();if(solid(f,.3))throw Error('Camera inside scenery');
    r.mode='playing';r.time=90;r.joe.phase='absent';Object.assign(r.player,f);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();return JSON.parse(render_game_to_text());
   },f);
   assert.equal(state.graphics.atmosphere.lampGlass.variants,4);assert.equal(state.graphics.atmosphere.lampGlass.additionalDraws,0);
   views.push({name:f.name,resolution:state.graphics.resolution,draws:state.graphics.draws,glass:state.graphics.atmosphere.lampGlass});await page.screenshot({path:`${out}/${f.name}-2560.png`});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/lamp-glass.json`,JSON.stringify({passed:true,software,views,errors},null,2));console.log(JSON.stringify({passed:true,software,views,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
