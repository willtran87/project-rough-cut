const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/dense-clearance-final',cases=JSON.parse(fs.readFileSync(`${out}/fixtures.json`));
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[],views=[],errors=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  for(const c of cases){
   const indices=[...new Set([c.checkFrom,Math.floor((c.frames.length+c.checkFrom)/2),c.frames.length-1])];
   for(const index of indices){
    const samples=await p.evaluate(frames=>{
     __underGreen.run=structuredClone(frames[0]);for(const r of frames){Object.assign(__underGreen.run,r);advanceTime(0);}
     const r=__underGreen.run,bearing=Math.atan2(r.joe.x-r.player.x,r.joe.y-r.player.y),poses=[];
     for(const yaw of [bearing,bearing-Math.PI/2,bearing+Math.PI/2])for(const pitch of [-.85,0,.85])for(const fov of [45,85])for(const aspect of [1.6,390/844])poses.push({x:r.player.x,y:r.player.y,height:r.player.eyeHeight||1.65,yaw,pitch,fov,aspect});
     return __underGreen.inspectCameraClearance(poses);
    },c.frames.slice(Math.max(0,index-60),index+1));
    results.push({name:c.name,index,time:c.frames[index].time,samples});assert(samples.every(s=>!s.hits.length),JSON.stringify(results.at(-1)));
   }
  }
  for(const name of ['dry-0','dry-2','recovery-spillway-gap-0.7']){
   const c=cases.find(c=>c.name===name),index=Math.floor((c.frames.length+c.checkFrom)/2);
   for(const [width,height]of [[2560,1600],[390,844]]){
    await p.setViewportSize({width,height});await p.evaluate(frames=>{__underGreen.run=structuredClone(frames[0]);for(const r of frames){Object.assign(__underGreen.run,r);advanceTime(0);}},c.frames.slice(Math.max(0,index-60),index+1));
    const file=`${out}/${name}-${width}.png`;await p.screenshot({path:file});views.push({name,width,height,file});
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/camera.json`,JSON.stringify({passed:true,results,views,errors,limits:['Extreme camera poses inspect actual actor/fixture poses; screenshots retain the recorded player view.','Three representative instants per danger sequence supplement the full-step forward/rear audit.']},null,2));console.log(JSON.stringify({passed:true,poses:results.length,volumes:results.reduce((n,r)=>n+r.samples.length,0),views:views.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
