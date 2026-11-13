const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/gallery-clearance';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const {traverse}=await import('./probe-under-green-folded.mjs'),{galleryBallPositions}=await import('../web/under-green-services.js'),{FLOORS,OBSTACLES,solid}=await import('../web/under-green-course.js');
 const balls=galleryBallPositions(FLOORS,OBSTACLES);assert.equal(balls.length,18);assert(balls.every(p=>!solid(p,.047)));
 const cases=[];
 for(const [name,options,time]of [['steady',{pressure:'steady'},28.3],['hesitation',{decisionPause:3},35.3666666667]]){
  const frames=[];const result=traverse({...options,dodge:true,inspect:r=>{if(r.time>time-.3&&r.time<time+.001){const {telemetry,...state}=r;frames.push(structuredClone(state));}}});assert.equal(result.mode,'complete');assert(frames.length>10);cases.push({name,frames});
 }
 fs.writeFileSync(`${out}/fixtures.json`,JSON.stringify(cases));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  for(const c of cases)for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   const result=await p.evaluate(frames=>{
    __underGreen.run=structuredClone(frames[0]);for(const state of frames){Object.assign(__underGreen.run,state);advanceTime(0);}
    const geometry=__underGreen.inspectJoeGeometry(),r=__underGreen.run,j=r.joe;
    // A QA inspection viewpoint only; Joe's original motion/pose is retained.
    Object.assign(r.player,{x:j.x+2,y:j.y-1.5,yaw:Math.atan2(-2,1.5),pitch:-.25,eyeHeight:1.12});advanceTime(0);
    return {geometry,footing:__underGreen.inspectJoeFooting(),time:r.time};
   },c.frames);
   assert.deepEqual(result.geometry.hits,[]);assert.equal(result.footing.belowFloor,0);await p.screenshot({path:`${out}/${c.name}-${width}.png`});views.push({name:c.name,width,height,...result});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:true,balls,views,errors,limits:['Inspection viewpoints are repositioned to show the reproduced boot contact; they are not route-navigation acceptance.']},null,2));console.log(JSON.stringify({passed:true,views:views.length,balls:balls.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
