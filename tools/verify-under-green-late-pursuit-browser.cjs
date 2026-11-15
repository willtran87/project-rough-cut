const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const out='output/under-green/late-pursuit',errors=[],views=[];
  const sighting=JSON.parse(fs.readFileSync(out+'/sighting-fixture.json','utf8'));
  const route=JSON.parse(fs.readFileSync(out+'/route-fixture.json','utf8'));
  const p=await browser.newPage({viewport:{width:2560,height:1600}});
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');
  await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  await p.click('#primary');
  const restore=fixture=>p.evaluate(f=>{__underGreen.clearInput();__underGreen.run=f;advanceTime(0);},fixture);
  await restore(sighting);
  await p.keyboard.down('s');await p.evaluate(()=>advanceTime(100));await p.keyboard.up('s');
  assert.equal(await p.evaluate(()=>__underGreen.run.joe.sawRangeRoute),false);
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('w');
  assert.equal(await p.evaluate(()=>__underGreen.run.joe.sawRangeRoute),true);
  await p.keyboard.down('r');await p.evaluate(()=>advanceTime(300));await p.keyboard.up('r');
  await p.screenshot({path:out+'/observed-route-rear-2560.png'});
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await restore(route);
   const start=await p.evaluate(()=>({x:__underGreen.run.player.x,y:__underGreen.run.player.y}));
   await p.keyboard.down('w');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('w');
   const state=await p.evaluate(()=>JSON.parse(render_game_to_text()));
   assert.equal(state.mode,'under_green_playing');
   const actual=await p.evaluate(()=>({player:__underGreen.run.player,joe:__underGreen.run.joe}));
   assert(Math.hypot(actual.player.x-start.x,actual.player.y-start.y)>.6);
   assert(actual.joe.rangeInspectionUsed);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.screenshot({path:out+`/range-inspection-${width}.png`});
   views.push({width,height,state});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,checks:['Real backward/forward input updates witnessed route choice','Rear glance shows the approaching trimmer carrier','The full-route inspection fixture remains playable across four viewports'],views,errors},null,2));
  console.log(JSON.stringify({passed:true,viewports:views.map(({width,height})=>({width,height})),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
