const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/service-grate',routes=JSON.parse(fs.readFileSync(`${out}/routes.json`));
(async()=>{
 const viewsOnly=process.argv.includes('--views-only');
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],results=viewsOnly?JSON.parse(fs.readFileSync(`${out}/browser.json`)).results:[],views=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600},hasTouch:true});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  await p.keyboard.press('Escape');await p.locator('#comfort summary').click();await p.locator('[data-campaign=soundCaptions]').check();await p.click('#primary');
  for(const route of viewsOnly?[]:routes){
   await p.evaluate(state=>{__underGreen.run=structuredClone(state);__underGreen.clearInput();advanceTime(0);},route.frames[0]);
   const rows=[];
   for(let index=0;index<route.frames.length;index+=60){
    const chunk=await p.evaluate(frames=>{
     const rows=[];for(const state of frames){Object.assign(__underGreen.run,state);advanceTime(0);const s=JSON.parse(render_game_to_text());rows.push({time:state.time,elapsed:state.elapsed,caption:document.querySelector('#caption').textContent,kind:document.querySelector('#caption').dataset.kind,foot:s.audio.lastFootstep,steps:s.audio.counts.joeSteps,voices:s.audio.voices,phase:state.joe.phase,geometry:s.audio.lastFootstep?.surface==='metal'&&rows.length%15===0?__underGreen.inspectJoeGeometry():null});}return rows;
    },route.frames.slice(index,index+60));rows.push(...chunk);fs.writeFileSync(`${out}/browser-partial.json`,JSON.stringify({route:route.name,frames:rows.length,last:rows.at(-1),errors},null,2));
   }
   const cues=rows.filter(r=>/Boots ring/.test(r.caption)),metal=rows.filter((r,i)=>r.foot?.surface==='metal'&&(i===0||r.foot.serial!==rows[i-1].foot?.serial));
   assert(cues.length>0,`${route.name}: no natural-route cue`);assert(metal.length>0);assert(rows.every(r=>r.voices===16));
   assert(rows.every(r=>!r.geometry?.hits.length));results.push({name:route.name,metal,cues,rows});
  }
  const cueTime=results[0].cues[0].time,frameIndex=routes[0].frames.findIndex(r=>r.time>=cueTime),nearby=routes[0].frames.slice(Math.max(0,frameIndex-25),frameIndex+1);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(state=>{__underGreen.run=structuredClone(state);advanceTime(0);},nearby[0]);
   await p.keyboard.press('Escape');if(!await p.locator('#comfort').evaluate(e=>e.open))await p.locator('#comfort summary').click();await p.locator('[data-campaign=muted]').check();await p.locator('[data-campaign=soundCaptions]').check();await p.locator('[data-campaign=subtitleSize]').focus();await p.keyboard.press('End');await p.click('#primary');
   await p.evaluate(frames=>{for(const state of frames){Object.assign(__underGreen.run,state);advanceTime(0);}},nearby);
   if(width<900){await p.touchscreen.tap(width*.5,height*.4);await p.evaluate(()=>advanceTime(0));}
   const view=await p.evaluate(()=>{const s=JSON.parse(render_game_to_text()),c=document.querySelector('#caption'),b=c.getBoundingClientRect();return {caption:c.textContent,muted:s.campaign.muted,touch:!document.querySelector('#touch').hidden,overlaps:[...document.querySelectorAll('#touch button')].filter(e=>!document.querySelector('#touch').hidden).some(e=>{const a=e.getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}),box:{left:b.left,right:b.right,top:b.top,bottom:b.bottom}};});
   assert.match(view.caption,/Boots ring/);assert(view.muted);assert(view.box.left>=0&&view.box.right<=width+.1&&view.box.top>=0&&view.box.bottom<=height+.1);
   assert(!view.overlaps);if(width<900)assert(view.touch);
   await p.screenshot({path:`${out}/heard-${width}.png`});views.push({width,height,...view});
  }
  // Inspect the actual material from the pump approach without moving Joe.
  await p.setViewportSize({width:2560,height:1600});await p.evaluate(()=>{const r=__underGreen.run;Object.assign(r.player,{x:-12,y:40,yaw:Math.PI/2,pitch:-.25});advanceTime(0);});await p.screenshot({path:`${out}/grate-2560.png`});
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/browser.json`,JSON.stringify({passed:true,results,views,errors,limits:['Actual actor contacts replayed from complete live simulation routes at30Hz; not a human tension or listening result.','Caption size checked on four viewports; physical mobile/controller qualification remains open.']},null,2));console.log(JSON.stringify({passed:true,routes:results.map(r=>({name:r.name,contacts:r.metal.length,firstCue:r.cues[0].elapsed})),views:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
