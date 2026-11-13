const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/obstacle-pursuit/browser';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],poses=[],views=[];
  p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');
  await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  const tapes=JSON.parse(fs.readFileSync('output/under-green/obstacle-pursuit/frames.json'));
  for(const tape of tapes)for(let i=0;i<tape.frames.length;i+=4){
   const state=tape.frames[i];if(state.joe.phase==='guard'&&state.elapsed>9)continue;
   const result=await p.evaluate(state=>{__underGreen.run=state;__underGreen.clearInput();advanceTime(0);return {geometry:__underGreen.inspectJoeGeometry(),footing:__underGreen.inspectJoeFooting()};},state);
   poses.push({index:tape.index,frame:i,...result});assert.deepEqual(result.geometry.hits,[],`${tape.index}:${i}`);assert.equal(result.footing.belowFloor,0);
  }
  const guard=tapes.find(t=>t.obstacle==='pump-machine').frames.find(r=>r.joe.phase==='guard');
  const root=tapes[0].frames.find(r=>r.joe.attackReposition&&r.joe.speed>0);
  const range=tapes.at(-1).frames.find(r=>r.joe.attackReposition&&r.joe.speed>0);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const [name,source]of [['guard',guard],['root-step',root],['range-step',range]]){
    const state=structuredClone(source);state.player.yaw=Math.atan2(state.joe.x-state.player.x,state.joe.y-state.player.y);state.messageTime=0;
    await p.evaluate(state=>{__underGreen.run=state;__underGreen.clearInput();advanceTime(0);},state);
    const caption=await p.locator('#caption').innerText();if(name==='guard')assert.match(caption,/WATCHING FOR AN OPENING/);
    views.push({width,height,name,caption});await p.screenshot({path:`${out}/${name}-${width}.png`});
   }
  }
  await p.setViewportSize({width:2560,height:1600});
  const state=structuredClone(guard);state.player.yaw=0;state.messageTime=0;
  await p.evaluate(state=>{__underGreen.run=state;__underGreen.clearInput();advanceTime(0);},state);
  await p.keyboard.down('w');await p.evaluate(()=>advanceTime(1000));await p.keyboard.up('w');await p.evaluate(()=>advanceTime(17));
  const left=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(left.player.speed,0);assert(left.player.y>44);assert.notEqual(left.joe.phase,'guard');
  await p.evaluate(()=>advanceTime(9000));const caught=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(caught.mode,'under_green_caught');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,poses,views,left,caught,errors},null,2));console.log(JSON.stringify({passed:true,poses:poses.length,views:views.length,reengagement:caught.mode,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
