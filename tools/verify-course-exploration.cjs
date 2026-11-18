const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
(async()=>{
 const out='output/level-one-ambient-lift/exploration';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/game.js*',r=>{let s=fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__explore={state,render,resetFirstHole,routeThreadVisible,visibleNavigationRibbonEntries,visibleNavigationRibbonSegments,SETTINGS_ROWS};\n  window.advanceTime = (milliseconds) => {');
  for(const name of ['drawWorldNavigationRibbon','drawCollisionRecoveryWorldRoute','drawFootingHazardBypassRoute'])s=s.replace(new RegExp('(function '+name+'\\([\\s\\S]*?\\) \\{)'), '$1\nwindow.__groundRouteDraws=(window.__groundRouteDraws||0)+1;');
  return r.fulfill({contentType:'application/javascript',body:s});});
 try{
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__explore);
  await page.evaluate(()=>{const t=__explore;t.resetFirstHole();Object.assign(t.state,{mode:'first_hole',manualTime:true,reducedMotion:true});t.state.hole.tutorialVisible=false;t.state.hole.engagement.experience.arrival.phase='skipped';Object.assign(t.state.hole.joe,{x:100,y:700,patrolPause:9999});advanceTime(17);});
  await page.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
  const scenarios=[];
  for(const [name,focus,map,preference,blocked] of [['normal',false,false,false,0],['old-preference',false,false,true,0],['listen',true,false,true,0],['map',false,true,true,0],['blocked',false,false,true,1]]){
   const result=await page.evaluate(async({name,focus,map,preference,blocked})=>{const t=__explore;Object.assign(t.state,{routeGuidance:preference,focusedHud:false});Object.assign(t.state.hole,{focus,mapOpen:map,blockedTimer:blocked});t.render();await RCScene3D.whenPresented();return {name,visible:t.routeThreadVisible(),entries:t.visibleNavigationRibbonEntries().length,segments:t.visibleNavigationRibbonSegments().length,draws:window.__groundRouteDraws||0,setting:t.SETTINGS_ROWS.some(r=>r.id==='route_guidance'),map:t.state.hole.mapOpen,focus:t.state.hole.focus};},{name,focus,map,preference,blocked});
   assert.equal(result.visible,false);assert.equal(result.entries,0);assert.equal(result.segments,0);assert.equal(result.draws,0);assert.equal(result.setting,false);assert.equal(result.map,map);assert.equal(result.focus,focus);scenarios.push(result);await page.screenshot({path:out+'/'+name+'.png'});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,scenarios,errors},null,2));console.log(JSON.stringify({passed:true,scenarios,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
