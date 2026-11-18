const fs=require('node:fs');
const {chromium}=require('playwright');
const out='output/under-green/visual-pass72/preview-floor';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 for(const name of ['before','after']){
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>{throw e;});
  for(const file of ['under-green-damp-finish','under-green-ground-finish'])await p.route('**/'+file+'.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(name==='before'?'output/under-green/visual-pass72/source/'+file+'-before.js':'web/'+file+'.js','utf8')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  for(const [view,px,py,yaw,pitch]of [['entry',0,8,0,.1],['root',0,12,-.5,.25],['reverse',0,18,Math.PI,.15],['pillar',0,13.5,-.875,.2],['east',2,10,.45,.5],['ground',0,12,-.6,-.48],['floor-east',2,9,.45,-.35]]){
   await p.evaluate(async({px,py,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();Object.assign(r,{mode:'playing',time:26.3});r.joe.phase='absent';Object.assign(r.player,{x:px,y:py,yaw,pitch,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{px,py,yaw,pitch});await p.screenshot({path:out+'/'+name+'-'+view+'.jpg',quality:91});
  }await p.close();
 }console.log('Gallery moisture comparison captured');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
