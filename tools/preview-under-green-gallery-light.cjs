const fs=require('node:fs');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/visual-pass61/preview';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 for(const [name,x,y]of [['before',-2.6,8],['near-wall',-3.9,11.5],['near-root',-3.7,13],['east',3.8,12]]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>{throw e;});
  await p.route('**/under-green-scene.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/under-green/visual-pass61/source/under-green-scene-before.js','utf8').replace('const lamp=(x,y,id)=>{','const lamp=(x,y,id)=>{if(id===\'gallery-entry\'){x='+x+';y='+y+';}')}));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  for(const [view,px,py,yaw,pitch]of [['entry',0,8,0,.1],['root',0,12,-.5,.25],['reverse',0,18,Math.PI,.15]]){
   await p.evaluate(async({px,py,yaw,pitch})=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();Object.assign(r,{mode:'playing',time:26.3});r.joe.phase='absent';Object.assign(r.player,{x:px,y:py,yaw,pitch,grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{px,py,yaw,pitch});await p.screenshot({path:out+'/'+name+'-'+view+'.jpg',quality:91});
  }await p.close();
 }console.log('Four gallery lighting candidates captured');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
