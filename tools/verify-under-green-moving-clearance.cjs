const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');

(async()=>{
 const posesOnly=process.argv.includes('--poses-only');
 const {traverse}=await import('./probe-under-green-folded.mjs'),routes=[];
 const optionsList=process.argv.includes('--extended')?[{sprint:true},{pressure:'steady'},{pressure:'relentless'},{optional:true},{cp:1,durable:{bunkerRouteObserved:true}},{decisionPause:3}]:process.argv.includes('--dry')?[{}]:[{},{wet:true},{cp:3}];
 for(const options of optionsList){
  let frame=0;const frames=[];
  const result=traverse({...options,dodge:true,inspect:r=>{
   if(++frame%3||r.joe.phase==='absent')return;
   frames.push(structuredClone({time:r.time,mode:r.mode,player:r.player,joe:r.joe,gate:r.gate,bypass:r.bypass,bypassAt:r.bypassAt}));
  }});
  assert.equal(result.mode,'complete');routes.push({options,frames});
 }
 const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/cadence',errors=[],results=[];fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4187/under-green.html?test');await page.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await page.click('#primary');await page.keyboard.press('Escape');
  for(const route of routes){
   await page.evaluate(async cp=>{const {createRun}=await import('./under-green-sim.js');__underGreen.run=createRun(cp||0);__underGreen.clearInput();},route.options.cp);
   const rows=[];
   for(let start=0;start<route.frames.length;start+=120){
    const chunk=await page.evaluate(({frames,start,posesOnly})=>{
     const rows=[];let lastPhase=null;
     for(let i=0;i<frames.length;i++){
      const f=frames[i];Object.assign(__underGreen.run,f);advanceTime(0);
      const a=JSON.parse(render_game_to_text()).graphics.actor;
      // Rendered skinned vertices against actual scenery, beyond simulation
      // capsules. Regular one-second samples plus phase transitions.
      const visible=f.joe.phase!=='enter'||f.joe.age>.25;
      const inspect=!posesOnly&&visible&&((start+i)%20===0||f.joe.phase!==lastPhase);lastPhase=f.joe.phase;
      const gap=Math.hypot(f.player.x-f.joe.x,f.player.y-f.joe.y);
      const cameraPoses=[];
      if(!posesOnly&&(gap<2.5||f.gate>0&&f.gate<1))for(const fov of [45,85])for(const aspect of [2560/1600,390/844])for(const height of [1.12,1.65])for(const rear of [0,Math.PI])cameraPoses.push({x:f.player.x,y:f.player.y,yaw:f.player.yaw+rear,pitch:f.player.pitch,height,fov,aspect});
      rows.push({time:f.time,phase:f.joe.phase,speed:f.joe.speed,x:f.joe.x,y:f.joe.y,footError:a.footError,handError:a.handError,problem:a.footError>.015?{joe:f.joe,feet:a.footPositions,contacts:a.footContacts,weight:a.walkWeight}:null,camera:cameraPoses.length?__underGreen.inspectCameraClearance(cameraPoses):null,
       geometry:inspect?__underGreen.inspectJoeGeometry():null});
     }
     return rows;
    },{frames:route.frames.slice(start,start+120),start,posesOnly});rows.push(...chunk);
    fs.writeFileSync(out+'/progress.json',JSON.stringify({route:route.options,frames:rows.length,total:route.frames.length,lastTime:rows.at(-1)?.time}));
   }
   const result={options:route.options,rows};results.push(result);
   fs.writeFileSync(out+`/moving-${posesOnly?'poses':'clearance'}-partial.json`,JSON.stringify({results,errors},null,2));
   console.log(JSON.stringify({route:route.options,frames:rows.length,geometrySamples:rows.filter(r=>r.geometry).length,maxFootError:Math.max(...rows.map(r=>r.footError)),intersections:rows.filter(r=>r.geometry?.hits.length).map(r=>({time:r.time,phase:r.phase,count:r.geometry.hits.length,first:r.geometry.hits[0]}))}));
  }
  fs.writeFileSync(out+`/moving-${posesOnly?'poses':'clearance'}.json`,JSON.stringify({results,errors},null,2));
  for(const result of results)for(const row of result.rows){
   assert(row.footError<.015,`Unreachable leg at ${row.time}: ${row.footError}`);assert(row.handError<.015);
   if(row.geometry)assert.deepEqual(row.geometry.hits,[],`Scenery intersection at ${row.time} (${row.phase})`);
   for(const camera of row.camera||[])assert.deepEqual(camera.hits,[],`Camera intersection at ${row.time}: ${JSON.stringify(camera.pose)}`);
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,routes:results.length,frames:results.reduce((n,r)=>n+r.rows.length,0),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
