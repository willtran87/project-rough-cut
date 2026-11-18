const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out='output/back-nine-visual-upgrade/parity-current/reference';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__parity={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__parity);await p.evaluate(()=>{const t=__parity,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false,reducedMotion:true});Object.assign(s.hole,{elapsed:100,tutorialVisible:false,messageTimer:0,zoneBannerTimer:0});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});advanceTime(17);});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
 for(const [width,height]of [[2560,1600],[1280,720],[390,844]]){
  await p.setViewportSize({width,height});
  for(const kind of ['maintenance-shed','service-building']){
   await p.evaluate(async kind=>{const o=RCScene3D.stats().pixelWorld.objects.find(o=>o.kind===kind),front=kind==='service-building'?1.8:1.28;Object.assign(__parity.state.player,{x:o.position[0]/.1152,y:-(o.position[2]+front+5.5)/.16,yaw:0,pitch:0});__parity.render();await RCScene3D.whenPresented();},{kind}.kind);
   await p.screenshot({path:out+'/'+kind+'-'+width+'.jpg',type:'jpeg',quality:94});samples.push({kind,width,height,state:await p.evaluate(()=>JSON.parse(render_game_to_text()))});
  }
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,samples,errors},null,2));console.log('PASS: six current Level 1 structure/vegetation references');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
