const fs=require('node:fs');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/visual-review-request-current';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});const errors=[],views=[];try{
const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
for(const f of [['gallery',0,8,0,.1],['crossing',0,19,0,-.05],['bunker',-29.5,65,Math.PI,.15],['pump',-25.7,40,Math.PI/2,-.27],['range',12,35,Math.PI,.05],['keeper',12,13.5,-2.4,.05]]){
await p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=26.3;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);
views.push(await p.evaluate(name=>({name,resolution:JSON.parse(render_game_to_text()).graphics.resolution}),f[0]));await p.screenshot({path:out+'/'+f[0]+'.jpg',quality:90});}
fs.writeFileSync(out+'/report.json',JSON.stringify({views,errors},null,2));console.log(JSON.stringify({views,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

