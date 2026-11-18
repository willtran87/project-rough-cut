const fs=require('node:fs');
const {chromium}=require('playwright');
const out='output/under-green/visual-pass86/preview';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});const errors=[],views=[];try{
const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
for(const f of [['approach',12,35,Math.PI,.08],['landing',11,30.5,-2.5,.2],['close',9.5,28.6,-Math.PI/2,.85],['reverse',12,23,0,.15],['side',16,28.575,-Math.PI/2,.12]]){
await p.evaluate(async f=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.time=26.3;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},f);
views.push(await p.evaluate(name=>({name,resolution:JSON.parse(render_game_to_text()).graphics.resolution}),f[0]));await p.screenshot({path:out+'/'+f[0]+'.jpg',quality:90});}
fs.writeFileSync(out+'/report.json',JSON.stringify({views,errors},null,2));console.log(JSON.stringify({views,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

